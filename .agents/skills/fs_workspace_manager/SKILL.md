---
name: fs_workspace_manager
description: Чтение, создание, патчинг и безопасная модификация файлов проекта (Astro pages, components, SQLite repositories, Markdown posts).
---

# FS Workspace Manager Skill

## Назначение
Предоставляет агенту стандарты и правила для манипуляций с исходными кодами и контентом проекта без риска регрессии.

## Разрешенные области проекта
- `blog/src/content/posts/**` — markdown-посты блога
- `blog/src/components/**` и `blog/src/layouts/**` — Astro компоненты и разметка
- `core/src/**` — сервисы, воркеры, API роуты, дашборд
- `core/data/**` и `data/**` — SQLite базы данных и локальные хранилища
- `deploy/**` — скрипты развертывания и nginx конфигурации
- `package.json`, `core/package.json`, `blog/package.json` — зависимости

## Запрещенные действия
- Категорически запрещено удалять или повреждать файлы переменных окружения (`.env`, `core/.env`).
- Запрещено коммитить приватные ключи (`*.pem`, `*.key`).
- Запрещено модифицировать сессионные данные браузера (`storage/profiles/**`).

## Регламент создания Markdown статей
При записи статьи в `blog/src/content/posts/${slug}.md`:
1. Форматирование YAML Frontmatter строго между разделителями `---`.
2. Обязательные поля Frontmatter: `title`, `description`, `pubDate`, `author`, `tags`, `keywords`.
3. Кодировка UTF-8 без BOM.
