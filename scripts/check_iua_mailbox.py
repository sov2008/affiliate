import poplib
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
    except Exception as e:
        body = f"[Error reading body: {e}]"
    return body

def main():
    print("Connecting to pop3.i.ua:995...")
    pop = poplib.POP3_SSL('pop3.i.ua', 995, timeout=15)
    pop.user('sov7@i.ua')
    pop.pass_('360103870')
    num_msgs, total_size = pop.stat()
    print(f"Total messages in sov7@i.ua: {num_msgs}")

    # Read from newest to oldest: last 12 messages
    for i in range(num_msgs, max(0, num_msgs - 12), -1):
        raw_lines = pop.retr(i)[1]
        raw_email = b'\n'.join(raw_lines)
        msg = email.message_from_bytes(raw_email)
        
        subj = dec(msg.get('Subject'))
        sender = dec(msg.get('From'))
        date = dec(msg.get('Date'))
        body = get_body(msg)
        
        print(f"\n==========================================")
        print(f"MSG #{i} | DATE: {date}")
        print(f"FROM: {sender}")
        print(f"SUBJ: {subj}")
        print(f"SNIPPET: {body[:350].strip().replace('\n', ' ')}")
        
        # Check for keywords
        full_text = f"{subj} {sender} {body}".lower()
        if any(k in full_text for k in ['admitad', 'mitgo', 'flirtcheck', 'verification', 'площадк', 'код', 'модерац']):
            print(f"⭐ [MATCH FOUND IN MSG #{i}]!")
            print(f"FULL BODY:\n{body.strip()[:1500]}\n")

    pop.quit()

if __name__ == '__main__':
    main()
