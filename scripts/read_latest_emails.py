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
                        body = payload.decode(part.get_content_charset() or 'utf-8', errors='replace')
                        if part.get_content_type() == 'text/plain':
                            break
        else:
            payload = msg.get_payload(decode=True)
            if payload:
                body = payload.decode(part.get_content_charset() or 'utf-8', errors='replace')
    except Exception:
        pass
    return body.strip()[:200].replace('\n', ' ')

def main():
    mail = imaplib.IMAP4_SSL('imap.gmail.com', 993)
    mail.login('sapegin.oleg@gmail.com', 'mznpjbugwzjomuej')
    mail.select('INBOX', readonly=True)
    status, data = mail.search(None, 'ALL')
    all_ids = data[0].split()
    print(f"=== Total messages in INBOX: {len(all_ids)} ===")
    
    # Check last 15 messages
    for mid in reversed(all_ids[-15:]):
        status, d = mail.fetch(mid, '(RFC822)')
        msg = email.message_from_bytes(d[0][1])
        subj = dec(msg.get("Subject"))
        sender = dec(msg.get("From"))
        date = dec(msg.get("Date"))
        snippet = get_body(msg)
        print(f"\n[ID: {mid.decode()}] {date}")
        print(f"FROM: {sender}")
        print(f"SUBJ: {subj}")
        print(f"SNIPPET: {snippet}")

    # Check SPAM folder
    try:
        spam_folder = '[Gmail]/&BCEEPwQwBDw-'
        typ, data = mail.select(spam_folder, readonly=True)
        if typ == 'OK':
            status, s_data = mail.search(None, 'ALL')
            if s_data and s_data[0]:
                spam_ids = s_data[0].split()
                print(f"\n=== Total messages in SPAM: {len(spam_ids)} ===")
                for mid in reversed(spam_ids[-5:]):
                    status, d = mail.fetch(mid, '(RFC822)')
                    msg = email.message_from_bytes(d[0][1])
                    print(f"[SPAM ID: {mid.decode()}] {dec(msg.get('Date'))}")
                    print(f"FROM: {dec(msg.get('From'))}")
                    print(f"SUBJ: {dec(msg.get('Subject'))}")
                    print(f"SNIPPET: {get_body(msg)}\n")
            else:
                print("\n=== SPAM folder is empty ===")
    except Exception as e:
        print(f"Error checking spam: {e}")

    mail.logout()

if __name__ == '__main__':
    main()
