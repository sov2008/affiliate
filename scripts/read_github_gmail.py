import imaplib
import email
from email.header import decode_header
import sys
import re

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def dec(s):
    if not s:
        return ''
    try:
        parts = decode_header(s)
        res = []
        for w, e in parts:
            if isinstance(w, bytes):
                res.append(w.decode(e or 'utf-8', errors='replace'))
            else:
                res.append(str(w))
        return ''.join(res)
    except Exception:
        return str(s)

def get_body(msg):
    text_body = ""
    html_body = ""
    try:
        if msg.is_multipart():
            for part in msg.walk():
                ctype = part.get_content_type()
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
    
    return text_body if text_body else html_body

def main():
    print("Connecting to imap.gmail.com for sapegin.oleg@gmail.com...")
    mail = imaplib.IMAP4_SSL('imap.gmail.com', 993)
    mail.login('sapegin.oleg@gmail.com', 'mznpjbugwzjomuej')

    # Select "Вся почта" or INBOX
    folder = '[Gmail]/&BBIEQQRP- &BD8EPgRHBEIEMA-'
    typ, data = mail.select(f'"{folder}"', readonly=True)
    if typ != 'OK':
        print(f"Failed to select {folder}, selecting INBOX...")
        mail.select('INBOX', readonly=True)

    # Search for GitHub messages
    status, data = mail.search(None, '(OR (FROM "github") (SUBJECT "github"))')
    if not data or not data[0]:
        print("Searching ALL...")
        status, data = mail.search(None, 'ALL')

    if not data or not data[0]:
        print("No emails found.")
        mail.logout()
        return

    all_ids = data[0].split()
    print(f"Matching emails count: {len(all_ids)}")

    # Filter/take the last 15
    selected_ids = all_ids[-15:]
    github_emails = []

    for mid in reversed(selected_ids):
        status, d = mail.fetch(mid, '(RFC822)')
        if status != 'OK' or not d or not d[0]:
            continue
        msg = email.message_from_bytes(d[0][1])

        subj = dec(msg.get("Subject"))
        sender = dec(msg.get("From"))
        date = dec(msg.get("Date"))
        body = get_body(msg)

        if 'github' in f"{sender} {subj} {body}".lower():
            clean_text = re.sub(r'<[^>]+>', ' ', body)
            clean_text = re.sub(r'\s+', ' ', clean_text).strip()
            github_emails.append({
                'id': mid.decode(),
                'date': date,
                'from': sender,
                'subject': subj,
                'body': clean_text
            })

    mail.logout()

    print(f"\n=======================================================")
    print(f"FOUND {len(github_emails)} GITHUB EMAILS:")
    print(f"=======================================================\n")

    for idx, em in enumerate(github_emails, 1):
        print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"📧 [EMAIL #{idx}] | ID: {em['id']} | DATE: {em['date']}")
        print(f"FROM:    {em['from']}")
        print(f"SUBJECT: {em['subject']}")
        print(f"CONTENT:")
        print(em['body'][:1200])
        print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")

if __name__ == '__main__':
    main()
