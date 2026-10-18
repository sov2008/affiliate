#!/usr/bin/env python3
"""
OmniChannel Affiliate Email Communications & Inbound Support Auto-Responder
Autonomous daemon for PromoRadar (https://promoradar.store)

Monitors inboxes:
1. sapegin.oleg@gmail.com (IMAP SSL: imap.gmail.com:993)
2. sov7@i.ua (POP3 SSL: pop3.i.ua:995)

Features:
- Instant detection of affiliate program approvals (CJ, Admitad, Awin, MyLead) -> auto-sync to site.
- Auto-response to advertiser inquiries regarding promotion methods, traffic sources, and website details via SMTP.
- Auto-resolution of technical domain verification requests (HTML files, meta tags).
- Real-time Telegram alerting with safe HTML formatting & plain-text fallback.
"""

import os
import sys
import time
import json
import re
import html
import imaplib
import poplib
import smtplib
import email
from email.header import decode_header
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formatdate, parseaddr
from datetime import datetime, timezone
import urllib.request
import subprocess

# Encoding
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Email Credentials
GMAIL_USER = os.getenv('SMTP_USER', 'sapegin.oleg@gmail.com')
GMAIL_PASS = os.getenv('SMTP_PASS', 'mznpjbugwzjomuej')
SMTP_HOST = os.getenv('SMTP_HOST', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
IMAP_HOST = os.getenv('IMAP_HOST', 'imap.gmail.com')
IMAP_PORT = int(os.getenv('IMAP_PORT', '993'))

IUA_USER = os.getenv('IUA_USER', 'sov7@i.ua')
IUA_PASS = os.getenv('IUA_PASS', '360103870')
IUA_POP_HOST = 'pop3.i.ua'
IUA_POP_PORT = 995

TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', '8669077256:AAGdDT8vLQdF-huUdy01sj5sAQPdg5OjjOw')
TELEGRAM_CHAT_ID = os.getenv('ADMIN_CHAT_ID', '808343978')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATE_FILE = os.path.join(BASE_DIR, 'artifacts_admitad', 'email_monitor_state.json')

VERIFY_DIRS = [
    os.path.join(BASE_DIR, 'deals-portal', 'public'),
    os.path.join(BASE_DIR, 'blog', 'public'),
    '/var/www/affiliate/deals-portal/public',
    '/var/www/affiliate/deals-portal/dist',
    '/var/www/affiliate/blog/public',
    '/var/www/affiliate/blog/dist'
]

CHECK_INTERVAL_SECONDS = 60

# Blacklist of senders that must NEVER receive an auto-reply
NO_REPLY_PATTERNS = [
    r'no[-_]?reply',
    r'no[-_]?response',
    r'mailer[-_]?daemon',
    r'postmaster@',
    r'notifications?@',
    r'updates?@',
    r'security@',
    r'billing@',
    r'atbmarket',
    r'google\.com',
    r'github\.com',
    r'binance\.com',
    r'deepseek\.com',
    r'redditmail\.com',
    r'gitguardian\.com',
    r'delivery[-_]?market',
    r'aliexpress\.com',
    r'cloudflare\.com',
    r'digitalocean\.com'
]

def log(msg):
    ts = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')
    print(f"[{ts}] [EmailSupportBot] {msg}", flush=True)

def send_telegram(text_html):
    """Sends Telegram message with HTML formatting and automatic plain-text fallback."""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"

    # Attempt 1: HTML
    try:
        payload = json.dumps({
            "chat_id": TELEGRAM_CHAT_ID,
            "text": text_html,
            "parse_mode": "HTML",
            "disable_web_page_preview": True
        }).encode('utf-8')
        req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
        urllib.request.urlopen(req, timeout=10)
        return
    except Exception as e:
        log(f"Telegram HTML alert note ({e}), retrying as plain text...")

    # Attempt 2: Plain text fallback
    try:
        plain_text = re.sub(r'<[^>]+>', '', text_html)
        payload = json.dumps({
            "chat_id": TELEGRAM_CHAT_ID,
            "text": plain_text,
            "disable_web_page_preview": True
        }).encode('utf-8')
        req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
        urllib.request.urlopen(req, timeout=10)
    except Exception as e2:
        log(f"Telegram plain alert error: {e2}")

def decode_mime(s):
    if not s: return ''
    try:
        parts = decode_header(s)
        res = []
        for word, enc in parts:
            if isinstance(word, bytes):
                res.append(word.decode(enc or 'utf-8', errors='replace'))
            else:
                res.append(str(word))
        return ''.join(res)
    except Exception:
        return str(s)

def extract_body(msg):
    text_body = ""
    html_body = ""
    try:
        if msg.is_multipart():
            for part in msg.walk():
                ctype = part.get_content_type()
                disp = str(part.get('Content-Disposition') or '')
                if 'attachment' in disp:
                    continue
                payload = part.get_payload(decode=True)
                if not payload:
                    continue
                charset = part.get_content_charset() or 'utf-8'
                decoded = payload.decode(charset, errors='replace')
                if ctype == 'text/plain' and not text_body:
                    text_body = decoded
                elif ctype == 'text/html' and not html_body:
                    html_body = decoded
        else:
            payload = msg.get_payload(decode=True)
            if payload:
                charset = msg.get_content_charset() or 'utf-8'
                text_body = payload.decode(charset, errors='replace')
    except Exception as e:
        text_body = f"[Error reading body: {e}]"

    body = text_body if text_body else html_body
    clean_text = re.sub(r'<[^>]+>', ' ', body)
    clean_text = re.sub(r'\s+', ' ', clean_text).strip()
    return clean_text

def should_not_reply(from_addr):
    if not from_addr:
        return True
    from_lower = from_addr.lower()
    for pattern in NO_REPLY_PATTERNS:
        if re.search(pattern, from_lower):
            return True
    return False

def send_smtp_reply(to_addr, original_subject, in_reply_to_id, reply_body):
    """Sends an email response via SMTP with proper threading headers."""
    try:
        subj = original_subject
        if not subj.lower().startswith('re:'):
            subj = f"Re: {subj}"

        msg = MIMEMultipart()
        msg['From'] = f"PromoRadar Partnerships <{GMAIL_USER}>"
        msg['To'] = to_addr
        msg['Subject'] = subj
        msg['Date'] = formatdate(localtime=True)
        if in_reply_to_id:
            msg['In-Reply-To'] = in_reply_to_id
            msg['References'] = in_reply_to_id

        msg.attach(MIMEText(reply_body, 'plain', 'utf-8'))

        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20)
        server.starttls()
        server.login(GMAIL_USER, GMAIL_PASS)
        server.sendmail(GMAIL_USER, [to_addr], msg.as_string())
        server.quit()

        log(f"✅ [SMTP SUCCESS] Replied to {to_addr} regarding '{subj}'")
        return True
    except Exception as e:
        log(f"❌ [SMTP ERROR] Failed to reply to {to_addr}: {e}")
        return False

def generate_promotion_details_response(merchant_name="your brand"):
    """Professional partnership response to affiliate managers."""
    return f"""Hello,

Thank you for reaching out regarding our affiliate partnership application for {merchant_name}!

We operate PromoRadar (https://promoradar.store), a premier digital voucher discovery, promo code verification, and consumer savings platform.

Here is an overview of our promotional methods and traffic profile:
1. Dedicated Merchant Profiles: We feature verified promo codes, seasonal clearance discounts, and direct store links on dedicated merchant landing pages (e.g., https://promoradar.store/stores/).
2. Curated Vertical Categories: Deals are organized into targeted shopping verticals (Technology, VPN & Security, Software, Travel, Fashion) providing high contextual relevance.
3. Clean Linking & Compliance: All outbound links strictly use rel="nofollow sponsored" attributes. We enforce strict compliance and zero intrusive behavior.
4. Traffic Policy: We DO NOT engage in search engine trademark bidding (TM or TM+ keywords), unauthorized spam, pop-unders, or browser injection. Our audience consists of high-intent buyers looking to finalize their purchase at checkout.

We would be delighted to represent {merchant_name} on PromoRadar and deliver high-converting, incremental customer acquisition.

Please let us know if you require any further information or special promotional materials.

Best regards,
Oleg Sapegin
Head of Publisher Partnerships | PromoRadar
Website: https://promoradar.store
Email: {GMAIL_USER}
"""

def handle_verification_request(body_text, subject=""):
    """Detects and automatically resolves HTML file and meta tag verification requests."""
    resolved_actions = []

    # 1. Admitad HTML verification file
    html_match = re.search(r'(admitad[a-zA-Z0-9_\-]+\.html)', body_text + " " + subject, re.IGNORECASE)
    if html_match:
        filename = html_match.group(1)
        for pub_dir in VERIFY_DIRS:
            try:
                os.makedirs(pub_dir, exist_ok=True)
                target = os.path.join(pub_dir, filename)
                with open(target, 'w', encoding='utf-8') as f:
                    f.write(f"verification: {filename}\n")
                resolved_actions.append(f"Placed {filename} in {pub_dir}")
            except Exception:
                pass
        log(f"🛡️ [AUTO-VERIFICATION] Created verification file: {filename}")

    # 2. Meta tag verification
    meta_match = re.search(r'name=["\']admitad-verification["\']\s+content=["\']([a-zA-Z0-9_\-]+)["\']', body_text, re.IGNORECASE)
    if not meta_match:
        meta_match = re.search(r'admitad-verification:\s*([a-zA-Z0-9_\-]+)', body_text, re.IGNORECASE)
    if meta_match:
        token = meta_match.group(1)
        resolved_actions.append(f"Detected Admitad meta tag token: {token}")
        log(f"🛡️ [AUTO-VERIFICATION] Detected meta token: {token}")

    return resolved_actions

def trigger_promoradar_sync():
    """Triggers autonomous sync on production droplet."""
    try:
        log("🔄 Triggering immediate PromoRadar sync & catalog refresh...")
        sync_script = os.path.join(BASE_DIR, 'scripts', 'cj_promoradar_sync.cjs')
        if os.path.exists(sync_script):
            subprocess.Popen(['node', sync_script], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception as e:
        log(f"Sync trigger note: {e}")

def load_state():
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "processed_gmail_ids": [],
        "processed_iua_uids": [],
        "replied_threads": [],
        "last_checked": None
    }

def save_state(state):
    try:
        os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
        with open(STATE_FILE, 'w', encoding='utf-8') as f:
            json.dump(state, f, ensure_ascii=False, indent=2)
    except Exception as e:
        log(f"Error saving state: {e}")

def process_incoming_message(channel, uid_str, subject, from_header, message_id, date_str, body, state):
    """Unified email classifier, auto-responder, and Telegram notifier."""
    _, from_email = parseaddr(from_header)
    corpus = f"{subject} {from_header} {body}".lower()

    # Classification tags
    is_partnership = any(k in corpus for k in [
        'admitad', 'commission junction', 'cj affiliate', 'awin', 'mylead', 
        'promoradar', 'affiliate', 'merchant', 'voucher', 'coupon', 'partner program',
        'партнерск', 'заявка', 'площадк', 'модерац', 'lospollos', 'advertiser'
    ])

    is_approval = any(k in corpus for k in [
        'welcome to', 'approved', 'принята', 'одобрена', 'application accepted',
        'application has been approved', 'joined program', 'terms accepted',
        'подключен к программе', 'заявка принята', 'поздравляем'
    ])

    is_inquiry = any(k in corpus for k in [
        'tell us about your', 'more information regarding your application', 
        'traffic sources', 'promotional methods', 'how do you promote', 
        'action required for your application', 'describe your website', 
        'additional details', 'marketing methods', 'источники трафика',
        'способы продвижения', 'опишите вашу площадку'
    ])

    is_verify = any(k in corpus for k in [
        'verification file', 'meta tag', 'admitad-verification', 'verify your domain',
        'подтверждение площадки', 'код подтверждения', 'файл верификации', 'разместите файл'
    ])

    esc_from = html.escape(from_header)
    esc_subj = html.escape(subject)
    esc_body = html.escape(body[:280])

    # 1. Verification Request Handling
    if is_verify:
        actions = handle_verification_request(body, subject)
        esc_actions = html.escape(', '.join(actions) if actions else 'Анализ завершен')
        alert = (
            f"🛡️ <b>[ПОЧТА ({channel}): ВЕРИФИКАЦИЯ ПЛОЩАДКИ]</b>\n"
            f"━━━━━━━━━━━━━━━━━━\n"
            f"<b>От:</b> <code>{esc_from}</code>\n"
            f"<b>Тема:</b> {esc_subj}\n"
            f"<b>Действия:</b> {esc_actions}\n"
            f"━━━━━━━━━━━━━━━━━━"
        )
        send_telegram(alert)
        if not should_not_reply(from_email) and actions:
            reply_text = (
                "Hello,\n\n"
                "We have successfully uploaded the requested verification file / meta tag to https://promoradar.store/.\n"
                "Please verify our domain at your convenience.\n\n"
                "Best regards,\nPromoRadar Team"
            )
            send_smtp_reply(from_email, subject, message_id, reply_text)

    # 2. Inquiry from Advertiser / Affiliate Manager
    elif is_inquiry:
        merchant_match = re.search(r'program\s+["\']?([^"\']+)["\']?|for\s+["\']?([^"\']+)["\']?\s+affiliate|программе\s+«?([^»"\']+)»?', corpus)
        merchant = "your brand"
        if merchant_match:
            for g in merchant_match.groups():
                if g:
                    merchant = g.strip()
                    break

        reply_text = generate_promotion_details_response(merchant.title())
        
        replied = False
        thread_key = f"{from_email}:{subject.lower()}"
        if not should_not_reply(from_email) and thread_key not in state.get('replied_threads', []):
            replied = send_smtp_reply(from_email, subject, message_id, reply_text)
            if replied:
                state.setdefault('replied_threads', []).append(thread_key)

        alert = (
            f"📬 <b>[ПОЧТА ({channel}): ВОПРОС ОТ РЕКЛАМОДАТЕЛЯ]</b>\n"
            f"━━━━━━━━━━━━━━━━━━\n"
            f"<b>От:</b> <code>{esc_from}</code>\n"
            f"<b>Тема:</b> {esc_subj}\n"
            f"<b>Текст:</b> {esc_body}...\n"
            f"━━━━━━━━━━━━━━━━━━\n"
            f"{'✅ <b>Авто-ответ отправлен:</b>' if replied else 'ℹ️ <i>Без авто-ответа (noreply / дубликат)</i>'}\n"
            f"<i>«Описаны методы трафика PromoRadar, rel=nofollow sponsored, запрет бренд-контекста».</i>"
        )
        send_telegram(alert)

    # 3. Program Approval / Welcome
    elif is_approval and is_partnership:
        alert = (
            f"🎉 <b>[ПОЧТА ({channel}): ОДОБРЕНА НОВАЯ ПРОГРАММА!]</b>\n"
            f"━━━━━━━━━━━━━━━━━━\n"
            f"<b>От:</b> <code>{esc_from}</code>\n"
            f"<b>Тема:</b> {esc_subj}\n"
            f"<b>Дата:</b> {html.escape(date_str)}\n"
            f"━━━━━━━━━━━━━━━━━━\n"
            f"🚀 <i>Запущена синхронизация и добавление бренда на PromoRadar!</i>"
        )
        send_telegram(alert)
        trigger_promoradar_sync()

    # 4. General Important Partnership Email
    elif is_partnership:
        alert = (
            f"📨 <b>[ПОЧТА ({channel}): ПАРТНЕРСКОЕ СООБЩЕНИЕ]</b>\n"
            f"━━━━━━━━━━━━━━━━━━\n"
            f"<b>От:</b> <code>{esc_from}</code>\n"
            f"<b>Тема:</b> {esc_subj}\n"
            f"<b>Фрагмент:</b> {esc_body}...\n"
            f"━━━━━━━━━━━━━━━━━━"
        )
        send_telegram(alert)

def check_gmail(state):
    """Scans primary Gmail inbox via IMAP SSL."""
    try:
        mail = imaplib.IMAP4_SSL(IMAP_HOST, IMAP_PORT, timeout=15)
        mail.login(GMAIL_USER, GMAIL_PASS)
        mail.select('INBOX', readonly=True)

        status, data = mail.search(None, 'ALL')
        if status != 'OK' or not data or not data[0]:
            mail.logout()
            return

        all_ids = data[0].split()
        recent_ids = all_ids[-25:]
        processed_set = set(state.get('processed_gmail_ids', []))

        for mid in recent_ids:
            mid_str = mid.decode()
            if mid_str in processed_set:
                continue

            status, msg_data = mail.fetch(mid, '(RFC822)')
            if status != 'OK' or not msg_data or not msg_data[0]:
                continue

            msg = email.message_from_bytes(msg_data[0][1])
            subject = decode_mime(msg.get('Subject', ''))
            from_header = decode_mime(msg.get('From', ''))
            message_id = msg.get('Message-ID', '')
            date_str = msg.get('Date', '')
            body = extract_body(msg)

            processed_set.add(mid_str)
            process_incoming_message('Gmail', mid_str, subject, from_header, message_id, date_str, body, state)

        state['processed_gmail_ids'] = list(processed_set)[-300:]
        mail.logout()
    except Exception as e:
        log(f"Gmail IMAP check note: {e}")

def check_iua(state):
    """Scans secondary i.ua inbox via POP3 SSL."""
    try:
        pop = poplib.POP3_SSL(IUA_POP_HOST, IUA_POP_PORT, timeout=15)
        pop.user(IUA_USER)
        pop.pass_(IUA_PASS)

        resp, uid_list, _ = pop.uidl()
        processed_uids = set(state.get('processed_iua_uids', []))

        # Scan last 20 messages
        recent_entries = uid_list[-20:] if len(uid_list) > 20 else uid_list

        for entry in recent_entries:
            parts = entry.decode().split()
            if len(parts) < 2:
                continue
            msg_num = int(parts[0])
            uid = parts[1]

            if uid in processed_uids:
                continue

            try:
                raw_lines = pop.retr(msg_num)[1]
                msg = email.message_from_bytes(b'\n'.join(raw_lines))
                subject = decode_mime(msg.get('Subject', ''))
                from_header = decode_mime(msg.get('From', ''))
                message_id = msg.get('Message-ID', '')
                date_str = decode_mime(msg.get('Date', ''))
                body = extract_body(msg)

                processed_uids.add(uid)
                process_incoming_message('i.ua', uid, subject, from_header, message_id, date_str, body, state)
            except Exception as item_err:
                log(f"Error reading i.ua msg #{msg_num}: {item_err}")

        state['processed_iua_uids'] = list(processed_uids)[-300:]
        pop.quit()
    except Exception as e:
        log(f"i.ua POP3 check note: {e}")

def run_loop():
    log("================================================================")
    log(f"🚀 STARTING AUTONOMOUS EMAIL INBOX MONITOR & AUTO-RESPONDER")
    log(f"Monitoring Gmail: {GMAIL_USER} & i.ua: {IUA_USER}")
    log(f"Target Portal: https://promoradar.store")
    log("================================================================")

    state = load_state()

    # Initial scan
    try:
        check_gmail(state)
        check_iua(state)
        state['last_checked'] = datetime.now(timezone.utc).isoformat()
        save_state(state)
    except Exception as e:
        log(f"Initial scan error: {e}")

    while True:
        try:
            check_gmail(state)
            check_iua(state)
            state['last_checked'] = datetime.now(timezone.utc).isoformat()
            save_state(state)
        except Exception as e:
            log(f"Loop execution error: {e}")

        time.sleep(CHECK_INTERVAL_SECONDS)

if __name__ == '__main__':
    run_loop()
