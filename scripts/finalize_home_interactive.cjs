const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', 'deals-portal', 'public', 'scripts', 'home-interactive.js');
let js = fs.readFileSync(jsPath, 'utf8');

// Replace ${baseUrl}/ with /
js = js.replace(/\$\{baseUrl\}\//g, '/');

const categoriesRegistry = [
  { slug: 'privacy-security', name: 'Privacy, VPN & Cybersecurity', categoryName: 'Privacy & Security', icon: '🛡️' },
  { slug: 'gaming-software', name: 'Gaming, Media & Software', categoryName: 'Gaming & Software', icon: '🎮' },
  { slug: 'home-appliances', name: 'Home, Garden & Appliances', categoryName: 'Home & Living', icon: '🏡' },
  { slug: 'fashion-apparel', name: 'Fashion, Apparel & Shoes', categoryName: 'Fashion', icon: '👕' },
  { slug: 'travel-vacations', name: 'Travel, Flights & Booking', categoryName: 'Travel & Vacations', icon: '✈️' },
  { slug: 'electronics-gadgets', name: 'Electronics, Tech & Gadgets', categoryName: 'Electronics', icon: '💻' },
  { slug: 'automotive-parts', name: 'Automotive, Parts & Accessories', categoryName: 'Automotive', icon: '🚗' },
  { slug: 'food-delivery', name: 'Food, Groceries & Delivery', categoryName: 'Food & Groceries', icon: '☕' },
  { slug: 'office-business', name: 'Office, SaaS & Business', categoryName: 'Office & Business', icon: '📦' }
];

const heroSavingsById = {
  deal_expressvpn_49: {
    en: { value: 'Save $79.80 / yr', sub: 'Calculated against the standard monthly rate across 15 billing cycles with 3 months free.' },
    ua: { value: 'Економія $79.80 / рік', sub: 'Розраховано на основі стандартного щомісячного тарифу за 15 місяців з 3 бонусними.' },
    ar: { value: 'وفّر 79.80$ سنوياً', sub: 'محسوبة مقارنة بالسعر الشهري القياسي عبر 15 دورة فوترة مع 3 أشهر مجانية.' },
    es: { value: 'Ahorra $79.80 / año', sub: 'Calculado frente a la tarifa mensual estándar durante 15 ciclos con 3 meses gratis.' },
    pt: { value: 'Poupe $79.80 / ano', sub: 'Calculado em relação à tarifa mensal padrão em 15 ciclos com 3 meses grátis.' },
    de: { value: 'Sparen Sie 79,80 $ / Jahr', sub: 'Berechnet gegenüber dem regulären Monatstarif bei 15 Monaten Laufzeit inklusive 3 Gratismonaten.' }
  },
  deal_nordvpn_74: {
    en: { value: 'Save $189.00 / 2-yr', sub: 'Average savings based on the Complete 2-year tier compared to monthly billing without discount.' },
    ua: { value: 'Економія $189.00 / 2 роки', sub: 'Середня економія на 2-річному плані Complete у порівнянні з щомісячною оплатою.' },
    ar: { value: 'وفّر 189.00$ لكل سنتين', sub: 'متوسط التوفير لباقة السنتين الكاملة مقارنة بالاشتراك الشهري العادي.' },
    es: { value: 'Ahorra $189.00 / 2 años', sub: 'Ahorro promedio del plan Completo de 2 años en comparación con la facturación mensual.' },
    pt: { value: 'Poupe $189.00 / 2 anos', sub: 'Poupança média no plano Completo de 2 anos em comparação com a faturação mensal.' },
    de: { value: 'Sparen Sie 189,00 $ / 2 Jahre', sub: 'Durchschnittliche Ersparnis beim 2-Jahres-Komplettpaket gegenüber monatlicher Abrechnung.' }
  },
  deal_hostinger_81: {
    en: { value: 'Save $432.00 / 4-yr', sub: 'Savings evaluated against month-to-month hosting renewals over a 48-month hosting term.' },
    ua: { value: 'Економія $432.00 / 4 роки', sub: 'Економія за 48-місячний період порівняно зі щомісячним поновленням тарифу.' },
    ar: { value: 'وفّر 432.00$ لكل 4 سنوات', sub: 'توفير محسوب على مدار فترة استضافة 48 شهراً مقارنة بالتجديد الشهري.' },
    es: { value: 'Ahorra $432.00 / 4 años', sub: 'Ahorro calculado frente a renovaciones mensuales durante un periodo de 48 meses.' },
    pt: { value: 'Poupe $432.00 / 4 anos', sub: 'Poupança calculada face à renovação mensal num período de alojamento de 48 meses.' },
    de: { value: 'Sparen Sie 432,00 $ / 4 Jahre', sub: 'Ersparnis berechnet gegenüber monatlicher Verlängerung über eine Laufzeit von 48 Monaten.' }
  },
  deal_coursera_50: {
    en: { value: 'Save $200.00 / yr', sub: 'Savings on unlimited professional certificates vs paying per single certification course.' },
    ua: { value: 'Економія $200.00 / рік', sub: 'Економія на необмежених професійних сертифікатах у порівнянні з оплатою окремих курсів.' },
    ar: { value: 'وفّر 200.00$ سنوياً', sub: 'توفير على الشهادات المهنية غير المحدودة مقارنة بالدفع لكل دورة تدريبية منفصلة.' },
    es: { value: 'Ahorra $200.00 / año', sub: 'Ahorro en certificados profesionales ilimitados en comparación con el pago por curso individual.' },
    pt: { value: 'Poupe $200.00 / ano', sub: 'Poupança em certificados profissionais ilimitados face ao pagamento por curso individual.' },
    de: { value: 'Sparen Sie 200,00 $ / Jahr', sub: 'Ersparnis bei unbegrenzten Berufszertifikaten gegenüber Einzelkursbuchungen.' }
  },
  deal_tripcom_8: {
    en: { value: 'Save ~$64.00 / trip', sub: 'Estimated average hotel reservation savings based on a 4-night 4-star international stay.' },
    ua: { value: 'Економія ~$64.00 / поїздка', sub: 'Орієнтовна економія на проживанні в 4-зірковому готелі на 4 ночі за кордоном.' },
    ar: { value: 'وفّر ~64.00$ لكل رحلة', sub: 'متوسط توفير حجوزات الفنادق بناءً على إقامة 4 ليالٍ في فندق 4 نجوم عالمي.' },
    es: { value: 'Ahorra ~$64.00 / viaje', sub: 'Ahorro promedio estimado en reservas de hotel para una estancia de 4 noches en 4 estrellas.' },
    pt: { value: 'Poupe ~$64.00 / viagem', sub: 'Poupança média estimada em reservas de hotel para estadias de 4 noites num hotel de 4 estrelas.' },
    de: { value: 'Sparen Sie ca. 64,00 $ / Reise', sub: 'Geschätzte Hotelersparnis bei 4 Übernachtungen in einem 4-Sterne-Hotel im Ausland.' }
  }
};

const prefix = 'const categoriesRegistry = ' + JSON.stringify(categoriesRegistry) + ';\nconst heroSavingsById = ' + JSON.stringify(heroSavingsById) + ';\nconst baseUrl = "";\n\n';
const finalJs = prefix + js;

fs.writeFileSync(jsPath, finalJs, 'utf8');
console.log('Successfully updated home-interactive.js with prefix, total size:', Buffer.byteLength(finalJs, 'utf8'));

