# 🔌 Model Context Protocol (MCP) Setup Guide: SQLite, SSH & Browser Offer Validator

**Antigravity Affiliate Platform v2.0.0**  
*Документ подготовлен: Lead Platform Architect & Tooling / QA Automation Engineer*

---

## 1. 📋 Обзор и Архитектура

Model Context Protocol (MCP) предоставляет стандартизированный протокол взаимодействия ИИ-агентов (Cursor, VS Code, Antigravity, Claude Desktop) с локальными базами данных, боевой инфраструктурой и внешними партнерскими смартлинками.

В проекте развернуты и поддерживаются три высокопроизводительных специализированных MCP-сервера:

1. **SQLite Read-Only MCP Server (`scripts/mcp-sqlite-server.cjs`)**:
   - Работает на базе встроенного в Node.js движка `node:sqlite` (`DatabaseSync`).
   - Предоставляет безопасный доступ к локальным базам данных `content_queue.sqlite` и `tg_leads.db`.
   - Аппаратная и программная защита от записи (`SQLITE_OPEN_READONLY` + парсер SQL-Guardrails).
2. **Production SSH & PM2 Auditing MCP Server (`scripts/mcp-ssh-server.cjs`)**:
   - Работает на базе асинхронной библиотеки `ssh2`.
   - Прямое безопасное подключение к боевому узлу DigitalOcean (`178.128.199.28:22`) по закрытому ключу `D:/keys/antigravity_digitalocean_ubuntu`.
   - Непрерывный аудит демонов PM2, логов Nginx, цепочек редиректов TDS и ресурсов сервера без необходимости интерактивных терминальных сессий.
3. **Browser & Smartlink Validator MCP Server (`scripts/mcp-browser-server.cjs`)**:
   - Работает на базе headless-движка **Playwright Chromium** и нативного Fetch.
   - Эмулирует реального мобильного пользователя (профиль iPhone 14 Pro / iOS 17 Safari, touch events, viewport 390x844).
   - Предотвращает слив трафика в пустоту: отслеживает цепочки редиректов TDS (`/go`, `/click`), обнаруживает registrar suspensions, WAF/Cloudflare капчи, 404/502 ошибки, парсит DOM/CTA лендингов и сохраняет скриншоты в `scratch/`.

### 🛡️ Гарантии безопасности и защита данных:
1. **Соответствие STRICT ZERO DEMO DATA RULE ([AGENTS.md](file:///d:/WEB/antigravity/affiliate/AGENTS.md))**:  
   Все инструменты возвращают исключительно подлинные боевые данные (живой статус процессов, реальные HTTP 302 локации партнерских сетей LosPollos/MyLead, подлинный отрендеренный DOM лендингов).
2. **Защита ключей и параметров доступа**:  
   Ключ аутентификации загружается из защищенного локального хранилища ключей оператора (`D:/keys/antigravity_digitalocean_ubuntu`), логирование учетных данных в stdout отключено (весь debug-вывод изолирован в `stderr`).
3. **Изоляция протокола JSON-RPC 2.0**:  
   Канал `stdout` зарезервирован исключительно под валидные сообщения протокола MCP (версия `2024-11-05`), что гарантирует стабильность парсинга всеми AI IDE.

---

## 2. ⚙️ Конфигурационные файлы MCP в окружении

Настроены и синхронизированы все ключевые точки входа:

| Среда / Клиент | Путь к конфигурационному файлу | Назначение |
| :--- | :--- | :--- |
| **Cursor IDE** | [`.cursor/mcp.json`](file:///d:/WEB/antigravity/affiliate/.cursor/mcp.json) | Автоматическое подключение инструментов в интерфейсе Cursor |
| **VS Code / Cline** | [`.vscode/mcp.json`](file:///d:/WEB/antigravity/affiliate/.vscode/mcp.json) | Подключение инструментов в VS Code и расширениях |
| **Antigravity Workspace** | [`.agents/mcp_config.json`](file:///d:/WEB/antigravity/affiliate/.agents/mcp_config.json) | Локальные серверы для субагентов рабочего пространства |
| **Antigravity Global** | `C:\Users\user\.gemini\config\mcp_config.json` | Глобальный реестр MCP серверов в профиле пользователя |

### Эталонный JSON конфигурации:

```json
{
  "mcpServers": {
    "sqlite-content-queue": {
      "command": "node",
      "args": [
        "D:\\WEB\\antigravity\\affiliate\\scripts\\mcp-sqlite-server.cjs",
        "--db-path",
        "D:\\WEB\\antigravity\\affiliate\\core\\data\\content_queue.sqlite"
      ],
      "env": {
        "NODE_ENV": "production",
        "SQLITE_READONLY": "true"
      }
    },
    "sqlite-tg-leads": {
      "command": "node",
      "args": [
        "D:\\WEB\\antigravity\\affiliate\\scripts\\mcp-sqlite-server.cjs",
        "--db-path",
        "D:\\WEB\\antigravity\\affiliate\\core\\data\\tg_leads.db"
      ],
      "env": {
        "NODE_ENV": "production",
        "SQLITE_READONLY": "true"
      }
    },
    "sqlite-official-npx": {
      "command": "npx.cmd",
      "args": [
        "-y",
        "mcp-server-sqlite-npx",
        "D:\\WEB\\antigravity\\affiliate\\core\\data\\content_queue.sqlite"
      ]
    },
    "ssh-production": {
      "command": "node",
      "args": [
        "D:\\WEB\\antigravity\\affiliate\\scripts\\mcp-ssh-server.cjs",
        "--host",
        "178.128.199.28",
        "--port",
        "22",
        "--user",
        "root",
        "--key-path",
        "D:\\keys\\antigravity_digitalocean_ubuntu"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    },
    "browser-validator": {
      "command": "node",
      "args": [
        "D:\\WEB\\antigravity\\affiliate\\scripts\\mcp-browser-server.cjs"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

---

## 3. 🛠️ Реестр доступных MCP-инструментов

### А. Инструменты валидации смартлинков и браузера (`browser-validator`)

| Имя инструмента | Описание | Входные параметры |
| :--- | :--- | :--- |
| `validate_offer_url` | Проверка живости смартлинков и цепочек редиректов TDS. Фиксирует промежуточные хопы, 302/200 статусы, детектирует баны домена, заглушки Cloudflare WAF и ошибки SSL | `url`: string, `expected_status`: number *(default: 200)*, `timeout_ms`: number *(default: 15000)*, `follow_redirects`: boolean *(default: true)* |
| `inspect_landing_dom` | Рендеринг страницы в мобильном Playwright Chromium. Извлекает title, H1, meta description, CTA-кнопки, проверяет тематику дейтинга и сохраняет скриншот в `scratch/` | `url`: string, `timeout_ms`: number *(default: 20000)*, `save_screenshot`: boolean *(default: true)* |

### Б. Инструменты аудита боевого сервера (`ssh-production`)

| Имя инструмента | Описание | Входные параметры |
| :--- | :--- | :--- |
| `server_uptime` | Сводка системных ресурсов боевого сервера: uptime, load average, потребление RAM/SWAP и место на SSD `/` | *Без параметров* |
| `pm2_status` | Мониторинг всех демонов PM2 (`affiliate-dashboard`, `affiliate-scheduler`, `affiliate-autopilot`, боты) | `format`: `"table"` \| `"json"` *(default: "table")* |
| `pm2_logs` | Получение последних строк логов stdout/stderr процессов PM2 без зависания в streaming-режиме | `service`: string *(default: "all")*, `lines`: number *(default: 50, max: 200)* |
| `nginx_status` | Проверка статуса systemd юнита Nginx и валидация синтаксиса конфигурации (`nginx -t`) | *Без параметров* |
| `nginx_logs` | Чтение последних строк журналов Nginx | `type`: `"access"` \| `"error"` *(default: "access")*, `lines`: number *(default: 50)* |
| `check_redirects` | Комплексный сквозной тест маршрутизации TDS (`/go`), трекера кликов (`/click`) и API MAB (`/api/mab/status`) | `cid`: string *(default: "mab_verify")*, `offer`: string *(default: "lospollos_dating")* |
| `ssh_exec` | Выполнение произвольной команды bash на боевом узле с контролем таймаута | `command`: string, `timeout_seconds`: number *(default: 30)* |

### В. Инструменты SQLite и очередей (`sqlite-content-queue`, `sqlite-tg-leads`)

| Имя инструмента | Описание | Входные параметры |
| :--- | :--- | :--- |
| `read_query` | Безопасное выполнение произвольного SELECT-запроса | `query`: string (SQL SELECT/WITH/PRAGMA/EXPLAIN) |
| `list_tables` | Список всех таблиц с точным количеством записей | *Без параметров* |
| `describe_table` | Детальная структура таблицы, типы колонок, индексы и FK | `table_name`: string |
| `get_queue_stats` | Сводка по статусам очередей контента и платформам | `platform`: string *(опционально)* |
| `get_epc_analytics` | Аналитика конверсий, переходов и расчет реального EPC | `timeframe_days`: number *(опционально, default: 30)* |

---

## 4. 📊 Практические сценарии использования Browser MCP

### Сценарий 1: Экспресс-валидация ссылки TDS перед дистрибуцией контента
Перед публикацией поста на Reddit/Telegram агент проверяет цепочку редиректов:

**Вызов инструмента:**
```json
{
  "name": "validate_offer_url",
  "arguments": {
    "url": "http://178.128.199.28:5000/go?cid=campaign_reddit_01&offer=lospollos_dating",
    "expected_status": 200,
    "follow_redirects": true
  }
}
```

**Пример ответа:**
```json
{
  "is_valid": true,
  "final_url": "https://yex2brk.chemistrydrivensmile.org/rp1pd38?sub1=direct&sub2=guest&cid=campaign_reddit_01",
  "final_domain": "yex2brk.chemistrydrivensmile.org",
  "final_status": 200,
  "total_hops": 2,
  "is_blocked": false,
  "latency_ms": 665,
  "redirect_chain": [
    {
      "hop": 1,
      "status": 302,
      "location": "https://yex2brk.chemistrydrivensmile.org/rp1pd38?sub1=direct&sub2=guest&cid=campaign_reddit_01"
    },
    {
      "hop": 2,
      "status": 200,
      "location": null
    }
  ]
}
```

### Сценарий 2: Глубокий рендеринг лендинга и фиксация скриншота
Агент инспектирует конечную посадочную страницу в мобильном браузере:

**Вызов инструмента:**
```json
{
  "name": "inspect_landing_dom",
  "arguments": {
    "url": "https://yex2brk.chemistrydrivensmile.org/rp1pd38?sub1=direct&sub2=guest&cid=campaign_reddit_01",
    "save_screenshot": true
  }
}
```

**Пример ответа:**
```json
{
  "success": true,
  "title": "Meet local girls in Kyiv?",
  "h1": ["WARNING!"],
  "cta_buttons": ["OK!", "Yes", "No"],
  "is_dating_relevant": true,
  "keywords_detected": ["meet", "girls", "women", "18+"],
  "is_blocked": false,
  "screenshot_path": "D:\\WEB\\antigravity\\affiliate\\scratch\\landing_1789451835259_zqkb5.png"
}
```

---

## 5. 🧪 Валидация и тестирование серверов

Для проверки доступности и корректности MCP-серверов в локальном окружении настроены автоматические сценарии:

```bash
# 1. Валидация Browser / Offer Validator MCP сервера (Playwright Chromium, 302/200, скриншот)
npm run mcp:browser
# или полный автотест JSON-RPC:
node scratch/validate_mcp_browser.cjs

# 2. Валидация SSH MCP сервера (проверка рукопожатия, uptime, PM2 jlist и редиректов)
npm run mcp:ssh
# или полный автотест JSON-RPC:
node scratch/validate_mcp_ssh.cjs

# 3. Валидация SQLite MCP сервера (проверка read-only и SQL-guardrails)
npm run mcp:sqlite
# или полный автотест:
node scratch/validate_mcp_server.cjs
```

Ожидаемый результат валидации `node scratch/validate_mcp_browser.cjs`:
```text
🚀 Starting MCP Browser Validator validation test...

--- Step 1: initialize ---
Server info: { name: 'antigravity-browser-validator', version: '1.0.0' }
✅ initialize: PASS

--- Step 2: tools/list ---
Available tools (2): validate_offer_url, inspect_landing_dom
✅ tools/list: PASS

--- Step 3: tools/call: validate_offer_url ---
Testing target URL: http://178.128.199.28:5000/go?cid=mcp_test_qa&offer=lospollos_dating
Validation result summary:
 - Is Valid: true
 - Final URL: https://yex2brk.chemistrydrivensmile.org/rp1pd38?sub1=direct&sub2=guest&cid=mcp_test_qa
 - Final Status: 200
 - Total Hops: 2
 - Is Blocked: false
 - Latency: 665ms
✅ validate_offer_url: PASS

--- Step 4: tools/call: inspect_landing_dom ---
DOM Inspection summary:
 - Success: true
 - Title: "Meet local girls in Kyiv?"
 - Dating Relevant: true
 - Keywords Detected: ["meet","girls","women","18+"]
 - Blocked / Interstitial: false
 - Screenshot Saved: D:\WEB\antigravity\affiliate\scratch\landing_1789451835259_zqkb5.png (exists: true)
✅ inspect_landing_dom: PASS

🎉 ALL BROWSER MCP VALIDATION TESTS PASSED PERFECTLY!
```
