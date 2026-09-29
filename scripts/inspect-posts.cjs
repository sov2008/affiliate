const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '../blog/src/content/posts');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

const posts = files.map(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  const dateMatch = content.match(/pubDate:\s*([^\n\r]+)/);
  const titleMatch = content.match(/title:\s*["']?([^"'\r\n]+)["']?/);
  const imageMatch = content.match(/coverImage:\s*["']?([^"'\r\n]+)["']?/);
  const catMatch = content.match(/category:\s*["']?([^"'\r\n]+)["']?/);
  return {
    file: f,
    slug: f.replace('.md', ''),
    date: dateMatch ? new Date(dateMatch[1]) : new Date(0),
    title: titleMatch ? titleMatch[1] : f,
    image: imageMatch ? imageMatch[1] : null,
    category: catMatch ? catMatch[1] : null
  };
}).sort((a,b) => b.date - a.date);

console.log(`Total posts: ${posts.length}`);
console.log('Top 25 posts:');
posts.slice(0, 25).forEach((p, i) => {
  console.log(`${i+1}. [${p.date.toISOString().slice(0,10)}] [${p.category}] ${p.file}\n   Image: ${p.image}\n   Title: ${p.title}\n`);
});
