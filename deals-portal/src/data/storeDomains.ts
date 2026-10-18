// Exact 26-Store Domain Registry for PromoRadar
export const STORE_DOMAINS_MAP: Record<string, string> = {
  // Official mapping by exact brand names
  "ExpressVPN": "expressvpn.com",
  "Airalo eSIM": "airalo.com",
  "ALLPOWERS": "iallpowers.com",
  "Alibaba": "alibaba.com",
  "ChicMe": "chicme.com",
  "Glasseslit": "glasseslit.com",
  "RaynaTours": "raynatours.com",
  "OnlineSim": "onlinesim.io",
  "PureVPN": "purevpn.com",
  "Keeper Security": "keepersecurity.com",
  "Qustodio": "qustodio.com",
  "The Deal Outlet": "thedealoutlet.com",
  "Kodland": "kodland.org",
  "VogaCloset": "vogacloset.com",
  "NordVPN": "nordvpn.com",
  "Yesim": "yesim.app",
  "Surfshark": "surfshark.com",
  "1Password": "1password.com",
  "Hostinger": "hostinger.com",
  "Namecheap": "namecheap.com",
  "Trip.com": "trip.com",
  "Booking.com": "booking.com",
  "EliteDate": "elitedate.com",
  "Verified Match VIP": "match.com",
  "Discreet Local Pass": "ashleymadison.com",
  "Spokeo Reverse Scan": "spokeo.com",

  // Normalized Slug mappings for fast lookup
  "expressvpn": "expressvpn.com",
  "airalo": "airalo.com",
  "allpowers": "iallpowers.com",
  "alibaba": "alibaba.com",
  "chicme": "chicme.com",
  "glasseslit": "glasseslit.com",
  "raynatours": "raynatours.com",
  "onlinesim": "onlinesim.io",
  "purevpn": "purevpn.com",
  "keepersecurity": "keepersecurity.com",
  "qustodio": "qustodio.com",
  "thedealoutlet": "thedealoutlet.com",
  "kodland": "kodland.org",
  "vogacloset": "vogacloset.com",
  "nordvpn": "nordvpn.com",
  "yesim": "yesim.app",
  "surfshark": "surfshark.com",
  "1password": "1password.com",
  "hostinger": "hostinger.com",
  "namecheap": "namecheap.com",
  "trip": "trip.com",
  "booking": "booking.com",
  "elitedate": "elitedate.com",
  "verified-match": "match.com",
  "discreet-local": "ashleymadison.com",
  "spokeo": "spokeo.com",

  // Additional merchant store fallbacks
  "polis": "polis.ua",
  "Polis UA": "polis.ua",
  "huawei": "consumer.huawei.com",
  "Huawei": "consumer.huawei.com",
  "nazih": "nazih.sa",
  "Nazih Cosmetics": "nazih.sa",
  "touch": "touch.com.ua",
  "Touch": "touch.com.ua",
  "jashanmal": "jashanmal.com",
  "Jashanmal": "jashanmal.com",
  "dabdoob": "dabdoob.com",
  "Dabdoob": "dabdoob.com",
  "vperfumes": "vperfumes.com",
  "Vperfumes": "vperfumes.com",
  "aovica": "aovica.com",
  "Aovica Store": "aovica.com",
  "markformelle": "markformelle.com",
  "Mark Formelle": "markformelle.com"
};

/**
 * Returns exact verified domain for logo fetching
 */
export function getStoreDomain(identifier: string): string {
  if (!identifier) return '';
  if (STORE_DOMAINS_MAP[identifier]) return STORE_DOMAINS_MAP[identifier];
  const lower = identifier.toLowerCase().trim();
  if (STORE_DOMAINS_MAP[lower]) return STORE_DOMAINS_MAP[lower];
  return '';
}
