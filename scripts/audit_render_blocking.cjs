const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

// Let's inspect scripts and link rel=stylesheet
const scripts = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
console.log('Total scripts in index.html:', scripts.length);
scripts.forEach((s, idx) => {
  const srcMatch = s.match(/src=["']([^"']+)["']/);
  const isDefer = /defer/.test(s);
  const isAsync = /async/.test(s);
  const type = (s.match(/type=["']([^"']+)["']/) || [])[1] || 'classic';
  console.log(`Script ${idx+1}:`, { src: srcMatch ? srcMatch[1] : 'inline (len: ' + s.length + ')', isDefer, isAsync, type });
});

console.log('--- Stylesheets ---');
const links = html.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi) || [];
links.forEach((l, idx) => {
  console.log(`Link ${idx+1}:`, l);
});

