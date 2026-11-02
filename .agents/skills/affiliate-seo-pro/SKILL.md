---
name: affiliate-seo-pro
description: Enterprise affiliate SEO architect and technical search strategist. Specializes in programmatic SEO, Schema.org rich results (Coupon, Review, FAQ, MerchantReturn), search intent mapping, internal link equity distribution, Core Web Vitals, and SERP CTR optimization for discount code and deal hubs.
---

# Enterprise Affiliate SEO Architect Skill (`affiliate-seo-pro`)

## 1. Technical Search Architecture for Deal Portals

### A. Information Hierarchy & Internal Link Equity
1. **Root Hub (`/`):** Highest authority page, dynamically ranking for broad head terms (*"verified promo codes"*, *"active voucher codes"*).
2. **Merchant Hubs (`/stores/[slug]/`):** Primary search landing pages targeting high-intent commercial keywords:
   - Target pattern: `[Brand] promo code`, `[Brand] discount voucher`, `[Brand] coupon code [Month] [Year]`
   - Dedicated canonical URL, distinct breadcrumb schema, and store FAQ block.
3. **Category Hubs (`/categories/[slug]/`):** Vertical authority anchors (*"vpn coupons"*, *"travel vouchers"*).
4. **Comparison Hubs (`/compare/[brandA]-vs-[brandB]/`):** Captures bottom-of-funnel decision queries (*"ExpressVPN vs PureVPN discount"*).

---

## 2. Mandatory Structured Data (Schema.org) Quality Gate
Every dynamic and static page generated must include valid JSON-LD schemas:

### A. Coupon / Offer Schema:
```json
{
  "@context": "https://schema.org",
  "@type": "SaleEvent",
  "name": "81% Off ExpressVPN Promo Code",
  "startDate": "2026-10-01",
  "endDate": "2026-11-30",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "url": "https://promoradar.store/stores/expressvpn/"
  }
}
```

### B. FAQPage Schema:
Ensures FAQ dropdown rich snippets appear directly in Google search results for the target store or category.

### C. BreadcrumbList Schema:
Guarantees clean navigational SERP display: `Home > Stores > ExpressVPN`.

---

## 3. SEO Quality Rules & Indexation Controls
1. **Evergreen Date Roll-Forward:** Automatically roll forward months and years (`November 2026`, `2027`) without breaking canonical URLs.
2. **Zero Thin Content:** Store pages must provide genuine editorial context, store overview, tested verification steps, and FAQs.
3. **Clean Heading Hierarchy:**
   - Exactly one `h1` per page containing primary target keyword and brand name.
   - `h2` for Verified Deals, FAQ, and Related Brands.
   - `h3` for individual deal titles.
4. **Link Rel Attributes:** All outgoing affiliate links must enforce `rel="nofollow sponsored"` to protect domain search reputation and comply with Google Search Essentials.

