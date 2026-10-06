import imaplib
import email
from email.header import decode_header
import sys
import re

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def dec(s):
    if not s: return ''
    try:
        parts = decode_header(s)
        return ''.join([w.decode(e or 'utf-8', errors='replace') if isinstance(w, bytes) else str(w) for w, e in parts])
    except: return str(s)

mail = imaplib.IMAP4_SSL('imap.gmail.com', 993)
mail.login('sapegin.oleg@gmail.com', 'mznpjbugwzjomuej')
mail.select('"[Gmail]/&BBIEQQRP- &BD8EPgRHBEIEMA-"', readonly=True)
status, data = mail.search(None, '(OR (FROM "github") (SUBJECT "github"))')
all_ids = data[0].split()

print('=== 5 САМЫХ ПОСЛЕДНИХ ПИСЕМ ОТ GITHUB ===\n')
for mid in reversed(all_ids[-5:]):
    _, d = mail.fetch(mid, '(RFC822)')
    msg = email.message_from_bytes(d[0][1])
    subj = dec(msg.get('Subject'))
    sender = dec(msg.get('From'))
    date = dec(msg.get('Date'))
    
    body = ''
    if msg.is_multipart():
        for p in msg.walk():
            if p.get_content_type() == 'text/plain':
                body = p.get_payload(decode=True).decode(p.get_content_charset() or 'utf-8', errors='replace')
                break
    else:
        body = msg.get_payload(decode=True).decode(msg.get_content_charset() or 'utf-8', errors='replace')
    
    clean = re.sub(r'<[^>]+>', ' ', body)
    clean = re.sub(r'\s+', ' ', clean).strip()
    
    print(f'📬 [ID: {mid.decode()}] {date}')
    print(f'ОТ: {sender}')
    print(f'ТЕМА: {subj}')
    print(f'ТЕКСТ ПИСЬМА:')
    print(clean[:600])
    print('\n' + '─'*60 + '\n')

mail.logout()
