import re

index_path = r'd:\WEB\antigravity\affiliate\deals-portal\src\pages\index.astro'
with open(index_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Expanded REGION_BADGES dictionary with real flags for every single market
expanded_region_badges = """// Comprehensive Country & Region Flag Mapping
const REGION_BADGES: Record<string, { label: string; class: string }> = {
  'US': { label: '🇺🇸 US', class: 'deal-region-badge' },
  'AE': { label: '🇦🇪 UAE & GCC', class: 'deal-region-badge' },
  'GCC': { label: '🇦🇪 UAE & GCC', class: 'deal-region-badge' },
  'EU': { label: '🇪🇺 EU', class: 'deal-region-badge' },
  'GB': { label: '🇬🇧 UK', class: 'deal-region-badge' },
  'UK': { label: '🇬🇧 UK', class: 'deal-region-badge' },
  'DE': { label: '🇩🇪 Germany', class: 'deal-region-badge' },
  'FR': { label: '🇫🇷 France', class: 'deal-region-badge' },
  'ES': { label: '🇪🇸 Spain', class: 'deal-region-badge' },
  'IT': { label: '🇮🇹 Italy', class: 'deal-region-badge' },
  'PL': { label: '🇵🇱 Poland', class: 'deal-region-badge' },
  'CZ': { label: '🇨🇿 Czechia', class: 'deal-region-badge' },
  'UA': { label: '🇺🇦 Ukraine', class: 'deal-region-badge' },
  'KZ': { label: '🇰🇿 Kazakhstan', class: 'deal-region-badge' },
  'IN': { label: '🇮🇳 India', class: 'deal-region-badge' },
  'BR': { label: '🇧🇷 Brazil', class: 'deal-region-badge' },
  'MX': { label: '🇲🇽 Mexico', class: 'deal-region-badge' },
  'ID': { label: '🇮🇩 Indonesia', class: 'deal-region-badge' },
  'PH': { label: '🇵🇭 Philippines', class: 'deal-region-badge' },
  'BY': { label: '🇧🇾 Belarus', class: 'deal-region-badge' },
  'GLOBAL': { label: '🌐 Global', class: 'deal-region-badge' }
};

// Automatic smart detector for exact country flag by slug or merchant name
function detectDealCountryFlag(storeSlug = '', brandName = ''): { label: string; class: string } {
  const s = storeSlug.toLowerCase();
  const b = brandName.toLowerCase();
  
  if (s.endsWith('-in') || s.includes('-in-') || b.includes(' india')) return REGION_BADGES['IN'];
  if (s.endsWith('-mx') || s.includes('-mx-') || b.includes(' mexico')) return REGION_BADGES['MX'];
  if (s.endsWith('-br') || s.includes('-br-') || b.includes(' brasil') || b.includes(' brazil')) return REGION_BADGES['BR'];
  if (s.endsWith('-cz') || s.includes('-cz-') || b.includes(' czech')) return REGION_BADGES['CZ'];
  if (s.endsWith('-pl') || s.includes('-pl-') || b.includes(' poland')) return REGION_BADGES['PL'];
  if (s.endsWith('-kz') || s.includes('-kz-') || b.includes(' kazakhstan')) return REGION_BADGES['KZ'];
  if (s.endsWith('-ua') || s.includes('touch') || s.includes('polis') || s.includes('turbosto') || b.includes(' ukraine')) return REGION_BADGES['UA'];
  if (s.endsWith('-uk') || s.includes('-uk-') || b.includes(' united kingdom') || s.includes('123-reg')) return REGION_BADGES['GB'];
  if (s.endsWith('-de') || s.includes('-de-') || b.includes(' germany')) return REGION_BADGES['DE'];
  if (s.endsWith('-fr') || s.includes('-fr-') || b.includes(' france')) return REGION_BADGES['FR'];
  if (s.endsWith('-id') || s.includes('-id-') || b.includes(' indonesia')) return REGION_BADGES['ID'];
  if (s.endsWith('-ph') || s.includes('-ph-') || b.includes(' philippines')) return REGION_BADGES['PH'];
  if (s.endsWith('-by') || b.includes(' belarus')) return REGION_BADGES['BY'];
  if (['kw', 'om', 'sa', 'dubai', 'uae', 'rayna', 'dabdoob', 'vperfumes', 'jashanmal', 'nazih', 'vogacloset', 'thedealoutlet', 'qasr', 'eyewa'].some(k => s.includes(k))) return REGION_BADGES['AE'];
  if (['usa', 'spokeo', 'discreet', 'verified-match', '945', 'wild-fork', 'directdeals', 'bannerbuzz', 'wristband', 'diecast1'].some(k => s.includes(k))) return REGION_BADGES['US'];
  
  const mapped = STORE_REGIONS[storeSlug];
  if (mapped && mapped.length > 0 && REGION_BADGES[mapped[0]]) {
    return REGION_BADGES[mapped[0]];
  }
  return REGION_BADGES['GLOBAL'];
}"""

# Replace the old static REGION_BADGES declaration
pattern = r'const REGION_BADGES: Record<string, \{ label: string; class: string \}> = \{[\s\S]*?\};'
text = re.sub(pattern, expanded_region_badges, text)

# Update the card rendering logic in index.astro to use detectDealCountryFlag
old_card_region = "const regionBadge = REGION_BADGES[primaryRegionKey] || REGION_BADGES['GLOBAL'];"
new_card_region = "const regionBadge = detectDealCountryFlag(deal.storeSlug, cleanName);"

if old_card_region in text:
    text = text.replace(old_card_region, new_card_region)
    print("SUCCESS: Replaced card region assignment with detectDealCountryFlag")
else:
    print("WARNING: old_card_region not found directly")

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("SUCCESS: index.astro updated with comprehensive country flags")

