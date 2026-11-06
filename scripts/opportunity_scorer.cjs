/**
 * Affiliate Program Opportunity Scorer & GEO Priority Engine
 * Implements Rule 8 (Strict Ban on RU/BY) and Rule 9 (Geo-Weighted EPC & Priority Intake)
 */

const TIER_1_GEOS = new Set([
  'US', 'CA', 'GB', 'UK', 'DE', 'FR', 'ES', 'IT', 'NL', 'PL', 'CZ', 'AU', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI',
  'AE', 'SA', 'KW', 'QA', 'BH', 'OM', // GCC
  'WW', 'GLOBAL', 'MANY GEOS', '00' // Worldwide
]);

const TIER_2_GEOS = new Set([
  'UA', 'UKR',
  'BR', 'MX', 'LATAM'
]);

const BANNED_GEOS = new Set([
  'RU', 'RUS', 'BY', 'BLR'
]);

function getGeoMultiplier(program = {}) {
  const name = String(program.name || '').toUpperCase();
  const site = String(program.site_url || program.website || '').toLowerCase();
  const regions = (program.regions || []).map(r => String(typeof r === 'string' ? r : (r.region || '')).toUpperCase());

  // Check banned first
  if (/\.(ru|by|su|xn--p1ai)(\/|$)/.test(site)) return 0;
  if (/\b(BY|RU|RUS|BLR|BELARUS|RUSSIA)\b/.test(name) && !/\b(BUY|TRUST|RUBY)\b/.test(name)) return 0;
  if (regions.length > 0 && regions.every(r => BANNED_GEOS.has(r))) return 0;

  // Check Tier 1
  if (/\b(US|UK|GB|DE|EU|AE|SA|GCC|WW|GLOBAL|MANY GEOS)\b/.test(name)) return 1.5;
  if (regions.some(r => TIER_1_GEOS.has(r))) return 1.5;

  // Check Tier 2
  if (/\b(UA|BR|MX|LATAM)\b/.test(name)) return 1.2;
  if (regions.some(r => TIER_2_GEOS.has(r))) return 1.2;

  // Default Tier 3
  return 1.0;
}

function calculateProgramScore(program = {}) {
  const geoMultiplier = getGeoMultiplier(program);
  if (geoMultiplier === 0) return 0;

  const epc = parseFloat(program.epc || program.ecpc || program.epc7d || program.epc90d || 0);
  const cr = parseFloat(program.cr || 0);
  const rating = parseFloat(program.rating || 0);

  // Bonus for instant connection without moderation
  const instantBonus = program.moderation === false ? 25 : 0;

  const baseScore = (epc * 0.5) + (cr * 20) + (rating * 10) + instantBonus;
  const compositeScore = Math.round(baseScore * geoMultiplier * 100) / 100;

  return {
    compositeScore,
    geoMultiplier,
    epc,
    cr,
    rating,
    isInstant: program.moderation === false
  };
}

module.exports = {
  getGeoMultiplier,
  calculateProgramScore,
  TIER_1_GEOS,
  TIER_2_GEOS,
  BANNED_GEOS
};
