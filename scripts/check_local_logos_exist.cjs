const fs = require('fs');

const localNike = fs.existsSync('deals-portal/public/logos/nike.png');
const localAdidas = fs.existsSync('deals-portal/public/logos/adidas.png');
const localPuma = fs.existsSync('deals-portal/public/logos/puma.png');
const localTurbosto = fs.existsSync('deals-portal/public/logos/turbosto.png');
const localHostinger = fs.existsSync('deals-portal/public/logos/hostinger.png');
const localPurevpn = fs.existsSync('deals-portal/public/logos/purevpn.png');
const localTouch = fs.existsSync('deals-portal/public/logos/touch.png');
const localPolis = fs.existsSync('deals-portal/public/logos/polis-ua.png');
const localAllpowers = fs.existsSync('deals-portal/public/logos/allpowers.png');
const localKodland = fs.existsSync('deals-portal/public/logos/kodland.png');
const localAiralo = fs.existsSync('deals-portal/public/logos/airalo.png');
const localExpressvpn = fs.existsSync('deals-portal/public/logos/expressvpn.png');

console.log({
  nike: localNike,
  adidas: localAdidas,
  puma: localPuma,
  turbosto: localTurbosto,
  hostinger: localHostinger,
  purevpn: localPurevpn,
  touch: localTouch,
  polis: localPolis,
  allpowers: localAllpowers,
  kodland: localKodland,
  airalo: localAiralo,
  expressvpn: localExpressvpn
});

