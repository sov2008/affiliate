import imaplib
import email
from email.header import decode_header
import sys
import re

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

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

mail = imaplib.IMAP4_SSL('imap.gmail.com', 993)
mail.login('sapegin.oleg@gmail.com', 'mznpjbugwzjomuej')
mail.select('INBOX')

status, data = mail.search(None, '(OR FROM "twitter" FROM "x.com")')
ids = data[0].split()
print(f'Twitter/X emails found: {len(ids)}')

for mid in ids[-10:]:
    status, d = mail.fetch(mid, '(RFC822)')
    msg = email.message_from_bytes(d[0][1])
    subj = decode_mime(msg.get('Subject', ''))
    sender = decode_mime(msg.get('From', ''))
    date = msg.get('Date', '')
    print(f"ID: {mid.decode()} | Date: {date}\nFrom: {sender}\nSubj: {subj}")
    # Extract snippet to find handle/username
    body = ''
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() in ['text/plain', 'text/html']:
                payload = part.get_payload(decode=True)
                if payload:
                    body = payload.decode(part.get_content_charset() or 'utf-8', errors='replace')
                    if part.get_content_type() == 'text/plain': break
    else:
        payload = msg.get_payload(decode=True)
        if payload:
            body = payload.decode(msg.get_content_charset() or 'utf-8', errors='replace')
    handles = re.findall(r'@[A-Za-z0-9_]{3,25}', body)
    if handles:
        print(f"Handles found: {set(handles)}")
    clean = re.sub(r'<[^>]+>', ' ', body)
    clean = re.sub(r'\s+', ' ', clean).strip()
    print(f"Snippet: {clean[:200]}")
    print("-" * 50)
