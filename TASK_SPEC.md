# Спецификация задач и реестр навыков Antigravity (Affiliate Blog Pipeline)

## 1. Системный стек и архитектура
- **Рабочая директория**: `D:\WEB\antigravity\affiliate`
- **Фронтенд блога**: Astro 5 (Static Generation, Content Collections) в каталоге `blog/`
- **Бэкенд ядра и API**: Node.js 20+, TypeScript, Express в каталоге `core/`
- **Очередь задач**: SQLite `content_queue_v2` в `core/data/content_queue.sqlite`
- **Шлюз AI**: Groq / Gemini 1.5 Flash / Qwen 2.5 72B (AI Credits Gateway)
- **Целевой сервер**: DigitalOcean Droplet `178.128.199.28` (Nginx, PM2)
- **Публичный домен**: `https://flirtcheck.site/blog/`

---

## 2. Реестр агентных навыков (Antigravity Skills Registry)

| ID Навыка | Категория | Конфигурация / Путь | Статус готовности |
| :--- | :--- | :--- | :---: |
| **`fs_workspace_manager`** | File System | `.agents/skills/fs_workspace_manager/SKILL.md` | ✅ **ГОТОВ** |
| **`bash_build_runner`** | Build Automation | `.agents/skills/bash_build_runner/SKILL.md` | ✅ **ГОТОВ** |
| **`sqlite_queue_operator`** | Database | `.agents/skills/sqlite_queue_operator/SKILL.md` | ✅ **ГОТОВ** |
| **`ai_gateway_invoker`** | AI Generation | `.agents/skills/ai_gateway_invoker/SKILL.md` | ✅ **ГОТОВ** |
| **`remote_ssh_deployer`** | Deployment | `.agents/skills/remote_ssh_deployer/SKILL.md` | ✅ **ГОТОВ** |
| **`http_verifier`** | Healthcheck | `.agents/skills/http_verifier/SKILL.md` | ✅ **ГОТОВ** |

### Детальное описание навыков

### 1. `fs_workspace_manager`
- **Назначение**: Чтение, создание и атомарный патчинг файлов проекта.
- **Разрешенные области**: `blog/src/content/posts/**`, `blog/src/**`, `core/src/**`, `deploy/**`, `package.json`.
- **Ограничения**: Защита секретов `.env`, запрет коммита приватных ключей, изоляция кэшей браузера.

### 2. `bash_build_runner`
- **Назначение**: Автономное выполнение сборок и проверок без запроса подтверждений:
  - `npm run build:blog` (Astro static pre-render)
  - `npm --prefix core run build` (TypeScript compilation & dashboard copy)
  - `npm run typecheck` (tsc --noEmit)

### 3. `sqlite_queue_operator`
- **Назначение**: Безопасные транзакции в SQLite очереди `content_queue_v2`.
- **Поддерживаемые задачи**: `BLOG_POST`, `SOCIAL_SNIPPET`, `REDDIT`.
- **Жизненный цикл**: `PENDING` ➔ `PENDING_APPROVAL` ➔ `APPROVED` ➔ `DISPATCHED`.
- **Правило Zero Demo Data**: Полный запрет на генерацию фиктивной статистики или демо-дохода.

### 4. `ai_gateway_invoker`
- **Назначение**: Генерация структурированных лонгридов дейтинг-тематики через AI Credits Gateway.
- **Требования к структуре**: Валидный Frontmatter (YAML), H1 + Hook, H2–H3 разделы, нумерованные чек-листы, Schema.org FAQ.

### 5. `remote_ssh_deployer`
- **Назначение**: Синхронизация с GitHub и управление процессами PM2 на боевом сервере `178.128.199.28`.
- **Управляемые сервисы PM2**: `affiliate-dashboard`, `affiliate-scheduler`, `blog-publisher-worker`, `postback-listener`.

### 6. `http_verifier`
- **Назначение**: Автоматическая валидация доступности внешних эндпоинтов после развертывания:
  - `https://flirtcheck.site/blog/` (HTTP 200)
  - `https://flirtcheck.site/dashboard/` (HTTP 401 без Basic Auth, 200 с Basic Auth)
  - `http://127.0.0.1:5000/api/workers/status` (HTTP 200)

---

## 3. Результаты самотестирования (Self-Test Report)

1. **Зависимости (Core Utilities)**:
   - `gray-matter`, `slugify`, `dotenv` установлены в `core` (успешно).
   - Зависимости `blog/package.json` синхронизированы (`npm --prefix blog install`).
2. **Сборка статики блога (`npm run build:blog`)**:
   - `3 page(s) built in 2.96s` (Код выхода 0, без предупреждений).
3. **Проверка типов TypeScript (`npm run typecheck`)**:
   - `core@1.0.0 typecheck: tsc --noEmit` — 0 ошибок (Код выхода 0).
4. **Сквозная генерация и публикация**:
   - Успешно протестирован сквозной пайплайн: AI Generation ➔ Enqueue ➔ Approve ➔ Publish Markdown ➔ Astro Build ➔ Social Snippets Enqueue.
