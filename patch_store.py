with open('/var/www/affiliate/deals-portal/src/data/couponsData.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    if '"slug": "30-10-tf-eharmony-term-us-ca-10-23-2019",' in line:
        # replace store object
        replacement = """    "slug": "eharmony",
    "name": "eharmony",
    "category": "Dating & Lifestyle",
    "logoText": "EHARMONY",
    "shortDesc": "Save 30% on verified premium memberships with scientific compatibility matching.",
    "fullDesc": "eharmony is the global pioneer in relationship science, matching couples through verified psychological compatibility profiles. PromoRadar tracks real-time verified membership discounts and promotional coupons.",
    "websiteUrl": "https://www.eharmony.com",
    "cleanDomain": "eharmony.com",
    "primaryAffiliateUrl": "https://www.anrdoezrs.net/click-101907236-11286030-1613519330000",
    "howToApply": [
      "Visit eharmony and complete your free compatibility questionnaire.",
      "Select your preferred 6, 12, or 24-month Premium membership tier.",
      "Click through PromoRadar to apply the verified 30% instant discount at checkout.",
      "Review your discounted order total and begin connecting with verified matches."
    ],
    "faqs": [
      {
        "question": "Does the 30% eharmony discount apply to new accounts?",
        "answer": "Yes, the 30% promotional discount applies to all new members registering for an annual or semi-annual Premium tier."
      },
      {
        "question": "Do I need a coupon code for eharmony?",
        "answer": "No manual code is required; the promotional rate activates automatically when clicking our verified partner link."
      }
    ]
"""
        new_lines.append(replacement)
        # Skip until end of this store object
        while i < len(lines) and not lines[i].strip().startswith('},'):
            i += 1
        new_lines.append(lines[i]) # append "  },"
        i += 1
        continue
    else:
        new_lines.append(line)
        i += 1

content = "".join(new_lines)
with open('/var/www/affiliate/deals-portal/src/data/couponsData.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: eharmony store profile clean-up")
