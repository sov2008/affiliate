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
    body = ""
    try:
        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_type() in ['text/plain', 'text/html']:
                    payload = part.get_payload(decode=True)
                    if payload:
                        charset = part.get_content_charset() or 'utf-8'
                        body = payload.decode(charset, errors='replace')
                        if part.get_content_type() == 'text/plain':
                            break
        else:
            payload = msg.get_payload(decode=True)
            if payload:
                charset = msg.get_content_charset() or 'utf-8'
                body = payload.decode(charset, errors='replace')
    except Exception:
        pass
    return body

def main():
    mail = imaplib.IMAP4_SSL('imap.gmail.com', 993)
    mail.login('sapegin.oleg@gmail.com', 'mznpjbugwzjomuej')
    mail.select('INBOX', readonly=True)
    
    # Fetch last message
    status, d = mail.fetch(b'23161', '(RFC822)')
    msg = email.message_from_bytes(d[0][1])
    print("SUBJECT:", dec(msg.get("Subject")))
    print("FROM:", dec(msg.get("From")))
    print("DATE:", dec(msg.get("Date")))
    print("BODY:\n", get_body(msg)[:800])

if __name__ == '__main__':
    main()
