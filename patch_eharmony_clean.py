with open('/var/www/affiliate/deals-portal/src/data/couponsData.ts', 'r', encoding='utf-8') as f:
    c = f.read()

# Replace eharmony store definition
old_profile = """  {
    "slug": "30-10-tf-eharmony-term-us-ca-10-23-2019",
    "name": "30% / $10 TF | eharmony Term US | CA 10.23.2019",
    "category": "E-Commerce & Wholesale",
    "logoText": "3010TFEHARMO",
    "shortDesc": "Verified coupons, seasonal vouchers, and exclusive promotional markdowns for 30% / $10 TF | eharmony Term US | CA 10.23.2019.",
    "fullDesc": "30% / $10 TF | eharmony Term US | CA 10.23.2019 is a premier online merchant in the E-Commerce & Wholesale sector, offering quality products with direct manufacturer warranties. PromoRadar continuously validates and publishes active discount codes and promotional vouchers for 30% / $10 TF | eharmony Term US | CA 10.23.2019 online shoppers.",
    "websiteUrl": "https://30-10-tf-eharmony-term-us-ca-10-23-2019.com",
    "cleanDomain": "30-10-tf-eharmony-term-us-ca-10-23-2019.com",
    "primaryAffiliateUrl": "https://www.anrdoezrs.net/click-101907236-2484316-1613519330000",
    "howToApply": [
      "Select your desired items on 30% / $10 TF | eharmony Term US | CA 10.23.2019 and proceed to checkout.",
      "Locate the promotional voucher or coupon code field on the payment screen.",
      "Enter the verified promo code from PromoRadar or click through for automatic discount activation.",
      "Confirm the price reduction and complete your secure order."
    ],
    "faqs": [
      {
        "question": "Are 30% / $10 TF | eharmony Term US | CA 10.23.2019 coupons verified on PromoRadar?",
        "answer": "Yes, all coupon codes and promotional links for 30% / $10 TF | eharmony Term US | CA 10.23.2019 are verified directly against partner networks and updated automatically."
      },
      {
        "question": "Can I get free shipping with a 30% / $10 TF | eharmony Term US | CA 10.23.2019 promo code?",
        "answer": "30% / $10 TF | eharmony Term US | CA 10.23.2019 frequently offers free shipping thresholds or promotional codes that waive standard delivery charges at checkout."
      }
    ]
  }"""

new_profile = """  {
    "slug": "eharmony",
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
  }"""

if old_profile in c:
    c = c.replace(old_profile, new_profile)
    print("Replaced eharmony profile successfully")
else:
    print("Warning: old profile mismatch, doing regex/string cleanup")

c = c.replace('"storeSlug": "30-10-tf-eharmony-term-us-ca-10-23-2019"', '"storeSlug": "eharmony"')
c = c.replace('"storeName": "30% / $10 TF | eharmony Term US | CA 10.23.2019"', '"storeName": "eharmony"')
c = c.replace('"storeLogoText": "3010TFEHARMO"', '"storeLogoText": "EHARMONY"')
c = c.replace('"storeCategory": "E-Commerce & Wholesale",\n    "discountBadge": "EXCLUSIVE DEAL OFF",\n    "title": "Save 30% on eharmony', '"storeCategory": "Dating & Lifestyle",\n    "discountBadge": "30% OFF",\n    "title": "Save 30% on eharmony')

with open('/var/www/affiliate/deals-portal/src/data/couponsData.ts', 'w', encoding='utf-8') as f:
    f.write(c)

print("Finished couponsData update")
