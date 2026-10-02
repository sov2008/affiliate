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

def check_support():
    print("Checking inbox for Mitgo / Admitad support responses...")
    try:
        mail = imaplib.IMAP4_SSL('imap.gmail.com', 993)
        mail.login('sapegin.oleg@gmail.com', 'mznpjbugwzjomuej')
        mail.select('INBOX')

        # Search for any recent emails from mitgo, admitad, zendesk
        status, data = mail.search(None, 'ALL')
        all_ids = data[0].split()
        print(f"Total inbox emails: {len(all_ids)}")

        recent_ids = all_ids[-30:]
        found = []

        for mid in reversed(recent_ids):
            status, d = mail.fetch(mid, '(RFC822)')
            msg = email.message_from_bytes(d[0][1])
            subj = decode_mime(msg.get('Subject', ''))
            sender = decode_mime(msg.get('From', ''))
            text_to_check = f"{subj} {sender}".lower()
            if any(k in text_to_check for k in ['mitgo', 'admitad', 'ticket', 'request', 'flirtcheck', 'zendesk', '13903']):
                # Extract body
                body = ""
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
                        body = payload.decode(part.get_content_charset() or 'utf-8', errors='replace')

                found.append({
                    "id": mid.decode(),
                    "date": date,
                    "from": sender,
                    "subject": subj,
                    "snippet": body.strip()[:300].replace('\n', ' ')
                })

        if found:
            print(f"\n[FOUND {len(found)} SUPPORT EMAIL(S)]:")
            for item in found:
                print(f"--- ID: {item['id']} ---")
                print(f"Date:    {item['date']}")
                print(f"From:    {item['from']}")
                print(f"Subject: {item['subject']}")
                print(f"Snippet: {item['snippet']}\n")
        else:
            print("No new replies from Mitgo/Admitad yet. The ticket was just submitted.")

    except Exception as e:
        print(f"Error checking support emails: {e}")

if __name__ == "__main__":
    check_support()
