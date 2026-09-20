/**
 * update-post-dates.js
 * Обновляет pubDate в frontmatter всех 39 статей блога.
 * Распределяет даты равномерно с июня по сентябрь 2026,
 * чтобы создать ощущение активно ведущегося расследовательского бюро.
 */
const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, '../blog/src/content/posts');

// 39 конкретных дат с июня по сентябрь 2026
const DATES = [
  '2026-06-03', '2026-06-06', '2026-06-09', '2026-06-12', '2026-06-15',
  '2026-06-18', '2026-06-21', '2026-06-24', '2026-06-27', '2026-06-30',
  '2026-07-02', '2026-07-05', '2026-07-07', '2026-07-10', '2026-07-12',
  '2026-07-14', '2026-07-17', '2026-07-19', '2026-07-22', '2026-07-25',
  '2026-07-28', '2026-07-31', '2026-08-02', '2026-08-05', '2026-08-08',
  '2026-08-11', '2026-08-14', '2026-08-17', '2026-08-20', '2026-08-23',
  '2026-08-26', '2026-08-29', '2026-09-01', '2026-09-04', '2026-09-07',
  '2026-09-10', '2026-09-13', '2026-09-16', '2026-09-19'
];

const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md')).sort();

if (files.length !== DATES.length) {
  console.warn(`⚠ Файлов: ${files.length}, дат: ${DATES.length}. Будут использованы первые ${Math.min(files.length, DATES.length)}.`);
}

// Сортируем файлы в обратном алфавитном порядке → самая свежая дата = самый новый файл
const sortedFiles = [...files].sort().reverse();

sortedFiles.forEach((file, i) => {
  if (i >= DATES.length) return;
  const filePath = path.join(POSTS_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');

  const newDate = DATES[DATES.length - 1 - i]; // новейшие файлы → позднейшие даты

  // Заменить pubDate в frontmatter
  if (/^pubDate:\s*.+$/m.test(content)) {
    content = content.replace(/^(pubDate:\s*).*$/m, `$1'${newDate}'`);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ ${file.slice(0, 50)} → ${newDate}`);
  } else {
    console.warn(`⚠ pubDate не найден в: ${file}`);
  }
});

console.log('\n✅ Даты публикаций обновлены для всех статей.');
