import imaplib
import email
from email.header import decode_header
import sys

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

try:
    mail = imaplib.IMAP4_SSL('imap.gmail.com', 993)
    mail.login('sapegin.oleg@gmail.com', 'mznpjbugwzjomuej')
    mail.select('INBOX')

    status, data = mail.search(None, 'ALL')
    all_ids = data[0].split()
    print(f'Total inbox emails: {len(all_ids)}')

    status, p_data = mail.search(None, '(OR FROM "pinterest" SUBJECT "pinterest")')
    p_ids = p_data[0].split()
    print(f'Pinterest emails found: {len(p_ids)}')

    target_ids = p_ids if p_ids else all_ids[-10:]
    for mid in target_ids[-5:]:
        status, d = mail.fetch(mid, '(RFC822)')
        msg = email.message_from_bytes(d[0][1])
        subj = decode_mime(msg.get('Subject', ''))
        sender = decode_mime(msg.get('From', ''))
        date = msg.get('Date', '')
        print(f"\nID: {mid.decode()} | Date: {date}\nFrom: {sender}\nSubj: {subj}")
        
        body = ''
        if msg.is_multipart():
            for part in msg.walk():
                ctype = part.get_content_type()
                if ctype in ['text/plain', 'text/html']:
                    payload = part.get_payload(decode=True)
                    if payload:
                        charset = part.get_content_charset() or 'utf-8'
                        body = payload.decode(charset, errors='replace')
                        if ctype == 'text/plain':
                            break
        else:
            payload = msg.get_payload(decode=True)
            if payload:
                body = payload.decode(msg.get_content_charset() or 'utf-8', errors='replace')

        # Clean HTML tags if html
        import re
        clean_text = re.sub(r'<[^>]+>', ' ', body)
        clean_text = re.sub(r'\s+', ' ', clean_text).strip()
        print(f"Content:\n{clean_text[:400]}")
    mail.logout()
except Exception as e:
    print(f"Error: {e}")
