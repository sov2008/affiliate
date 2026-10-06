import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def send_support_email():
    sender_email = "sapegin.oleg@gmail.com"
    app_password = "mznpjbugwzjomuej"
    
    recipients = ["support@mitgo.com", "support@admitad.com"]
    subject = "Fast-track ad space moderation: flirtcheck.site (Publisher ID: sov2018 / sov7@i.ua)"
    
    body = """Dear Mitgo & Admitad Publisher Support Team,

I am writing regarding our newly registered ad space on the Admitad / Mitgo platform.

Account Details:
- Publisher Username: sov2018
- Registered Email: sov7@i.ua
- Platform Name: FlirtCheck - Dating Safety & Identity Verification Lab
- Website URL: https://flirtcheck.site

About our platform:
• FlirtCheck is an independent English-language media platform dedicated to dating safety, profile verification, romance scam prevention, and open-source intelligence (OSINT).
• It hosts over 100 in-depth forensic guides, investigative articles, and client-side risk assessment tools.
• High-performance Astro SSG stack hosted on enterprise European server infrastructure (Frankfurt, 100% uptime, fast TTFB).

Traffic Profile:
• 100% genuine organic audience primarily from Tier-1 geos: United States, United Kingdom, Canada, Australia, and Germany.
• Traffic sources: Organic Search (SEO with IndexNow real-time indexing), official verified X (Twitter) profile with Blue Checkmark, and curated visual Pinterest boards.
• Strictly NO paid media buying, NO pop-ups, NO incentivized traffic, and NO trademark bidding.

We are looking to connect with reputable affiliate programs in Dating, Identity Verification, Online Services, and Cybersecurity verticals.

Could you please assist with speeding up the ad space verification and approval process for flirtcheck.site? If any ownership verification file (HTML/meta-tag) is needed, we are ready to place it immediately on our root server.

Thank you very much for your assistance!

Best regards,
FlirtCheck Editorial & Development Team
https://flirtcheck.site
sov7@i.ua / sov2018
"""

    msg = MIMEMultipart()
    msg['From'] = f"FlirtCheck Support <{sender_email}>"
    msg['To'] = ", ".join(recipients)
    msg['Reply-To'] = "sov7@i.ua"
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain', 'utf-8'))

    try:
        print(f"Connecting to smtp.gmail.com:587...")
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, app_password)
        server.sendmail(sender_email, recipients, msg.as_string())
        server.quit()
        print(f"✅ Email successfully sent to: {', '.join(recipients)}")
        return True
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        return False

if __name__ == "__main__":
    send_support_email()
