import imaplib
import email
from email.header import decode_header
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def dec(s):
    if not s:
        return ''
    try:
        parts = decode_header(s)
        return ''.join(w.decode(e or 'utf-8', errors='replace') if isinstance(w, bytes) else str(w) for w, e in parts)
    except:
        return str(s)

def main():
    print("Connecting to Gmail IMAP...")
    mail = imaplib.IMAP4_SSL('imap.gmail.com', 993)
    mail.login('sapegin.oleg@gmail.com', 'mznpjbugwzjomuej')
    mail.select('INBOX', readonly=True)
    status, data = mail.search(None, 'ALL')
    ids = data[0].split()
    print(f"Total messages in Gmail INBOX: {len(ids)}")
    for mid in ids[-20:]:
        _, d = mail.fetch(mid, '(RFC822.HEADER)')
        msg = email.message_from_bytes(d[0][1])
        sender = dec(msg.get("From"))
        subject = dec(msg.get("Subject"))
        date = msg.get("Date") or ""
        print(f"[{mid.decode()}] From: {sender[:45]} | Subject: {subject[:60]} | Date: {date[:25]}")
    mail.logout()

if __name__ == '__main__':
    main()
