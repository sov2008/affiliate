import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def send_developer_brief():
    sender_email = "sapegin.oleg@gmail.com"
    app_password = "mznpjbugwzjomuej"
    
    # Send directly to the Zendesk ticket reply address and support desks
    recipients = [
        "support+id37X05X-NK3MK@mitgosupport.zendesk.com",
        "support@mitgo.com",
        "support@admitad.com"
    ]
    
    subject = "Re: [Request received] (Ticket #13903) - FlirtCheck Engineering & Technical Platform Brief"
    
    body = """Dear Mitgo & Admitad Publisher Approval Team,

Regarding ticket #13903 (Publisher ID: sov2018 / sov7@i.ua, Ad Space: flirtcheck.site):

We would like to provide additional technical context regarding our platform architecture to assist with the moderation and fast-track verification of our ad space.

We are a software engineering and cybersecurity research team operating FlirtCheck (https://flirtcheck.site) — an independent identity verification, OSINT analysis, and dating safety lab. 

Key Technical Highlights:
1. Proprietary Architecture & Tech Stack:
• Custom Astro SSG + TypeScript core hosted on dedicated European cloud infrastructure (DigitalOcean Frankfurt, Nginx reverse proxy, HTTP/2, TLS 1.3, sub-50ms TTFB).
• Interactive client-side forensic tools: Scam Risk Calculator, Reverse Image Analysis guide, and automated bot telemetry detection algorithms.
• Over 100+ original, deeply researched investigations and safety blueprints targeting high-intent users in Tier-1 countries (US, UK, CA, AU, DE).

2. Technical Integration & Tracking Capabilities:
• S2S Postback & Webhook Readiness: Our backend is equipped with real-time postback receivers, click ID (CID) tracking, and SubID mapping (subid1..subid5) for 100% accurate conversion attribution and zero data loss.
• API & Feed Consumption: We are fully prepared to integrate Admitad/Mitgo REST APIs, Deeplink Generation endpoints, and advertiser product feeds directly into our recommendation engines.
• Direct Infrastructure Control: We have root access to our server and DNS, allowing us to deploy any advertiser verification files (HTML/meta-tags), CNAME custom domains, or tracking headers within 5 minutes.

3. Traffic Quality & Advertiser Safety:
• 100% Genuine Organic Demand: Traffic originates strictly from high-intent organic search (SEO indexed via IndexNow) and our verified official social channels (Blue Checkmark X/Twitter @TheWeedsorg).
• Zero Fraud Policy: Strictly NO incentivized traffic, NO bot networks, NO adware/toolbars, and NO brand-bidding. 
• Full Regulatory Compliance: All affiliate touchpoints strictly utilize 'rel="nofollow sponsored"' and 'target="_blank"', backed by comprehensive Editorial Policy, Terms, and FTC-compliant disclosures.

Because our users actively seek recommended, verified, and safe platforms (dating platforms with identity verification, background check/people search services, VPN and privacy tools), our editorial placements deliver exceptionally high retention and lifetime value (LTV) for advertisers.

Could you please finalize the verification of flirtcheck.site and grant access to the relevant affiliate programs in our publisher account (sov2018)? If any verification tag or file is required, please provide it and we will deploy it immediately.

Thank you for your partnership and support.

Best regards,
FlirtCheck Engineering & Editorial Team
https://flirtcheck.site
Publisher ID: sov2018 | Registered Email: sov7@i.ua
Direct contact: sov7@i.ua / sapegin.oleg@gmail.com
"""

    msg = MIMEMultipart()
    msg['From'] = f"FlirtCheck Engineering <{sender_email}>"
    msg['To'] = ", ".join(recipients)
    msg['Reply-To'] = "sov7@i.ua"
    msg['Subject'] = subject
    msg['In-Reply-To'] = "<37X05XNK3MK_6abfc98f9f8f6_1334a782af414b_sprut@zendesk.com>"
    msg['References'] = "<37X05XNK3MK_6abfc98f9f8f6_1334a782af414b_sprut@zendesk.com>"
    msg.attach(MIMEText(body, 'plain', 'utf-8'))

    try:
        print(f"Connecting to smtp.gmail.com:587...")
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, app_password)
        server.sendmail(sender_email, recipients, msg.as_string())
        server.quit()
        print(f"✅ Engineering brief successfully dispatched to Zendesk Ticket #13903!")
        return True
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        return False

if __name__ == "__main__":
    send_developer_brief()
