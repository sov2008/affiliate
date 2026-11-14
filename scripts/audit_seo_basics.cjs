const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

// Check canonical, robots, viewport, lang
const lang = (html.match(/<html[^>]*lang=["']([^"']+)["']/) || [])[1];
const metaRobots = (html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/) || [])[1];
const title = (html.match(/<title>([^<]+)<\/title>/) || [])[1];
const desc = (html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/) || [])[1];
const canonical = (html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/) || [])[1];

console.log('SEO Audit:', { lang, metaRobots, title, desc, canonical });

