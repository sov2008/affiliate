const { STORE_GEO_MAPPING } = require('../deals-portal/src/utils/regionFilter');
const TARGET_EXPIRING_SLUGS = ['vogacloset', 'keepersecurity', 'allpowers', 'alibaba'];

TARGET_EXPIRING_SLUGS.forEach(slug => {
  console.log(slug, 'regions:', STORE_GEO_MAPPING[slug]);
});

