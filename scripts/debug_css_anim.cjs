const fs = require('fs');
const css = fs.readFileSync('deals-portal/dist/_astro/Footer.BNseaAid.css', 'utf8');

const pos = css.indexOf('animate-card-entrance');
console.log('pos in css:', pos);
if (pos !== -1) {
  console.log(css.substring(pos - 100, pos + 400));
}

