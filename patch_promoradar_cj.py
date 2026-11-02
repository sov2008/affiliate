import sys

def patch_file(path, target, replacement):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    if target in content:
        content = content.replace(target, replacement, 1)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print("SUCCESS:", path)
    else:
        print("ERROR: Target not found in", path)
        sys.exit(1)

# 1. Fix Booking store profile category and clean name
target_booking = """    "slug": "booking",
    "name": "Booking",
    "category": "Education & Learning",
    "logoText": "BOOKING",
    "shortDesc": "Verified coupons, seasonal vouchers, and exclusive promotional markdowns for Booking.",
    "fullDesc": "Booking is a premier online merchant in the Education & Learning sector, offering quality products with direct manufacturer warranties. PromoRadar continuously validates and publishes active discount codes and promotional vouchers for Booking online shoppers.","""

replace_booking = """    "slug": "booking",
    "name": "Booking.com",
    "category": "Travel & Tours",
    "logoText": "BOOKING.COM",
    "shortDesc": "Verified deals, hotel reservations, attraction discounts, and car rentals worldwide.",
    "fullDesc": "Booking.com is one of the world's leading digital travel platforms, offering seamless hotel bookings, verified attractions, and flexible cancellations across 220+ countries. PromoRadar tracks real-time verified seasonal markdowns and Genius member discounts.","""

patch_file('/var/www/affiliate/deals-portal/src/data/couponsData.ts', target_booking, replace_booking)

# 2. Fix eharmony store profile name, category, and slug
target_eharmony = """    "slug": "30-10-tf-eharmony-term-us-ca-10-23-2019",
    "name": "30% / $10 TF | eharmony Term US | CA 10.23.2019",
    "category": "E-Commerce & Wholesale",
    "logoText": "3010TFEHARMO",
    "shortDesc": "Verified coupons, seasonal vouchers, and exclusive promotional markdowns for 30% / $10 TF | eharmony Term US | CA 10.23.2019.",
    "fullDesc": "30% / $10 TF | eharmony Term US | CA 10.23.2019 is a premier online merchant in the E-Commerce & Wholesale sector, offering quality products with direct manufacturer warranties. PromoRadar continuously validates and publishes active discount codes and promotional vouchers for 30% / $10 TF | eharmony Term US | CA 10.23.2019 online shoppers.",
    "websiteUrl": "https://30-10-tf-eharmony-term-us-ca-10-23-2019.com",
    "cleanDomain": "30-10-tf-eharmony-term-us-ca-10-23-2019.com",
    "primaryAffiliateUrl": "https://www.dpbolvw.net/click-101907236-2484316-1613519330000","""

replace_eharmony = """    "slug": "eharmony",
    "name": "eharmony",
    "category": "Dating & Lifestyle",
    "logoText": "EHARMONY",
    "shortDesc": "Save 30% on verified premium memberships with 32-dimension scientific compatibility matching.",
    "fullDesc": "eharmony is the pioneer of relationship science, connecting millions of compatible couples through in-depth compatibility tests. PromoRadar verifies exclusive subscription discounts and promo codes for new members.",
    "websiteUrl": "https://www.eharmony.com",
    "cleanDomain": "eharmony.com",
    "primaryAffiliateUrl": "https://www.anrdoezrs.net/click-101907236-11286030-1613519330000","""

patch_file('/var/www/affiliate/deals-portal/src/data/couponsData.ts', target_eharmony, replace_eharmony)

# 3. Update all storeSlug from 30-10-tf-eharmony-term-us-ca-10-23-2019 to eharmony in couponsData.ts
with open('/var/www/affiliate/deals-portal/src/data/couponsData.ts', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('"storeSlug": "30-10-tf-eharmony-term-us-ca-10-23-2019"', '"storeSlug": "eharmony"')
c = c.replace('"storeName": "30% / $10 TF | eharmony Term US | CA 10.23.2019"', '"storeName": "eharmony"')
c = c.replace('"storeCategory": "E-Commerce & Wholesale"', '"storeCategory": "Dating & Lifestyle"') # for eharmony coupons
c = c.replace('"storeLogoText": "3010TFEHARMO"', '"storeLogoText": "EHARMONY"')

# Also update booking category on its coupon deals
c = c.replace('"storeSlug": "booking",\n    "storeName": "Booking",\n    "storeCategory": "Education & Learning"', '"storeSlug": "booking",\n    "storeName": "Booking.com",\n    "storeCategory": "Travel & Tours"')

with open('/var/www/affiliate/deals-portal/src/data/couponsData.ts', 'w', encoding='utf-8') as f:
    f.write(c)

print("COUPONS CLEANUP COMPLETED")
