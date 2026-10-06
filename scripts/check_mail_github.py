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
    print("Connecting to pop3.i.ua:995 for sov7@i.ua...")
    pop = poplib.POP3_SSL('pop3.i.ua', 995, timeout=15)
    pop.user('sov7@i.ua')
    pop.pass_('360103870')
    num_msgs, total_size = pop.stat()
    print(f"Total messages in mailbox: {num_msgs}")

    github_emails = []

    # Check last 50 messages for GitHub
    scan_limit = min(num_msgs, 50)
    print(f"Scanning the latest {scan_limit} emails for GitHub messages...")

    for i in range(num_msgs, num_msgs - scan_limit, -1):
        try:
            raw_lines = pop.retr(i)[1]
            raw_email = b'\n'.join(raw_lines)
            msg = email.message_from_bytes(raw_email)

            subj = dec(msg.get('Subject'))
            sender = dec(msg.get('From'))
            date = dec(msg.get('Date'))
            body = get_body(msg)

            combined = f"{sender} {subj} {body}".lower()
            if 'github' in combined:
                github_emails.append({
                    'id': i,
                    'date': date,
                    'from': sender,
                    'subject': subj,
                    'body': body
                })
        except Exception as e:
            print(f"Error reading msg {i}: {e}")

    pop.quit()

    print(f"\n=======================================================")
    print(f"Found {len(github_emails)} GitHub emails:")
    print(f"=======================================================\n")

    for idx, em in enumerate(github_emails, 1):
        print(f"--- [GITHUB EMAIL #{idx}] (MSG ID: {em['id']}) ---")
        print(f"Date:    {em['date']}")
        print(f"From:    {em['from']}")
        print(f"Subject: {em['subject']}")
        print(f"\n--- Content Snippet ---")
        # Clean up html tags if html
        import re
        clean_text = re.sub(r'<[^>]+>', ' ', em['body'])
        clean_text = re.sub(r'\s+', ' ', clean_text).strip()
        print(clean_text[:1200])
        print("\n" + "="*55 + "\n")

if __name__ == '__main__':
    main()
