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
    
    body = text_body if text_body else html_body
    clean_text = re.sub(r'<[^>]+>', ' ', body)
    clean_text = re.sub(r'\s+', ' ', clean_text).strip()
    return clean_text

def search_github(mail, folder_name):
    print(f"\nScanning folder: {folder_name}...")
    typ, data = mail.select(folder_name, readonly=True)
    if typ != 'OK':
        print(f"Could not open {folder_name}")
        return

    # Search for GitHub or alert or warning
    typ, data = mail.search(None, '(FROM "github.com")')
    ids = data[0].split() if data and data[0] else []
    print(f"Found {len(ids)} emails from 'github.com' in {folder_name}")

    if not ids:
        # Fallback search by subject
        typ, data = mail.search(None, '(SUBJECT "GitHub")')
        ids = data[0].split() if data and data[0] else []
        print(f"Found {len(ids)} emails with SUBJECT 'GitHub' in {folder_name}")

    for mid in reversed(ids[-10:]):
        status, d = mail.fetch(mid, '(RFC822)')
        msg = email.message_from_bytes(d[0][1])
        subj = dec(msg.get("Subject"))
        sender = dec(msg.get("From"))
        date = dec(msg.get("Date"))
        body = get_body(msg)

        print("\n" + "="*60)
        print(f"EMAIL ID: {mid.decode()} | DATE: {date}")
        print(f"FROM:     {sender}")
        print(f"SUBJECT:  {subj}")
        print("-" * 60)
        print(f"CONTENT SNIPPET:\n{body[:1500]}")
        print("="*60)

def main():
    print("Connecting to imap.gmail.com:993 for sapegin.oleg@gmail.com...")
    mail = imaplib.IMAP4_SSL('imap.gmail.com', 993)
    mail.login('sapegin.oleg@gmail.com', 'mznpjbugwzjomuej')

    search_github(mail, 'INBOX')
    
    # Check Spam
    try:
        search_github(mail, '[Gmail]/&BCEEPwQwBDw-') # Russian SpAM
    except Exception:
        try:
            search_github(mail, '[Gmail]/Spam')
        except Exception:
            pass

    # Check All Mail / Вся почта
    try:
        search_github(mail, '[Gmail]/&BCcENQRABD0EPgQyBD8-') # Вся почта
    except Exception:
        try:
            search_github(mail, '[Gmail]/All Mail')
        except Exception:
            pass

    mail.logout()

if __name__ == '__main__':
    main()
