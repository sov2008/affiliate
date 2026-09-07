---
name: bash_build_runner
description: Автономное выполнение валидации, компиляции и сборки без запроса подтверждения (Astro, TypeScript, Core).
---

# Bash Build Runner Skill

## Назначение
Обеспечивает непрерывную компиляцию, проверку типов и пересборку статических страниц блога.

## Авторизованные команды
1. **Сборка блога**:
   ```bash
   npm run build:blog
   ```
   Пререндерит markdown-статьи из `blog/src/content/posts/*.md` в готовые HTML-файлы `blog/dist/`.

2. **Сборка бэкенда и дашборда**:
   ```bash
   npm --prefix core run build
   ```
   Компилирует TypeScript в `core/dist` и копирует `dashboard.html`.

3. **Проверка типов TypeScript**:
   ```bash
   npm run typecheck
   ```
   Выполняет `tsc --noEmit` без изменений файлов, подтверждая отсутствие регрессий.

## Обработка ошибок
- Если `npm run build:blog` выдает ошибку парсинга Frontmatter, проверить YAML-синтаксис в файлах `blog/src/content/posts/*.md`.
- Если Astro требует обновить кэш типов, выполнить `npx --prefix blog astro sync`.
