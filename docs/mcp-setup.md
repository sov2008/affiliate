# 🔌 Model Context Protocol (MCP) Setup Guide: SQLite & Queue Monitoring

**Antigravity Affiliate Platform v2.0.0**  
*Документ подготовлен: Lead Platform Architect*

---

## 1. 📋 Обзор и Архитектура

Model Context Protocol (MCP) предоставляет стандартизированный протокол взаимодействия ИИ-агентов (Cursor, VS Code, Antigravity, Claude Desktop) с локальными ресурсами проекта.

В проекте настроен выделенный высокопроизводительный **Read-Only MCP Server**, работающий на базе встроенного в Node.js 24 движка `node:sqlite` (`DatabaseSync`).

### 🛡️ Гарантии безопасности и защита данных:
1. **Аппаратный уровень SQLite (`SQLITE_OPEN_READONLY`)**:  
   База данных открывается с системным флагом `{ readOnly: true }`. Любая попытка записи на уровне ядра SQLite немедленно отклоняется с ошибкой `SQLITE_READONLY`.
2. **SQL-Guardrails**:  
   Любые запросы с мутирующими командами (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `CREATE`, `REPLACE`, `TRUNCATE`) блокируются на этапе парсинга.
3. **Соответствие STRICT ZERO DEMO DATA RULE ([AGENTS.md](file:///d:/WEB/antigravity/affiliate/AGENTS.md))**:  
   Инструменты возвращают исключительно подлинные боевые данные из таблиц `content_queue_v2`, `blog_conversions`, `tg_leads`, `mab_arms`. Синтетические или демонстрационные значения исключены.

---

## 2. ⚙️ Конфигурационные файлы MCP в окружении

Настроены следующие точки входа:

| Среда / Клиент | Путь к конфигурационному файлу | Назначение |
| :--- | :--- | :--- |
| **Cursor IDE** | [`.cursor/mcp.json`](file:///d:/WEB/antigravity/affiliate/.cursor/mcp.json) | Автоматическое подключение инструментов в интерфейсе Cursor |
| **VS Code / Cline** | [`.vscode/mcp.json`](file:///d:/WEB/antigravity/affiliate/.vscode/mcp.json) | Подключение инструментов в VS Code и расширениях |
| **Antigravity Workspace** | [`.agents/mcp_config.json`](file:///d:/WEB/antigravity/affiliate/.agents/mcp_config.json) | Локальные серверы для агентов Antigravity |
| **Antigravity Global** | `~/.gemini/config/mcp_config.json` | Глобальный реестр MCP серверов в домашней директории |

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
    }
  }
}
```

---

## 3. 🛠️ Реестр доступных MCP-инструментов

| Имя инструмента | Описание | Входные параметры |
| :--- | :--- | :--- |
| `read_query` | Безопасное выполнение произвольного SELECT-запроса | `query`: string (SQL SELECT/WITH/PRAGMA/EXPLAIN) |
| `list_tables` | Список всех таблиц с точным количеством записей | *Без параметров* |
| `describe_table` | Детальная структура таблицы, типы колонок, индексы и FK | `table_name`: string |
| `get_queue_stats` | Сводка по статусам очередей контента и платформам | `platform`: string *(опционально)* |
| `get_epc_analytics` | Аналитика конверсий, переходов и расчет реального EPC | `timeframe_days`: number *(опционально, default: 30)* |

---

## 4. 📊 Практические сценарии использования

### Сценарий А: Мониторинг очередей публикаций (`content_queue_v2`)
Оператор или агент может мгновенно запросить текущее состояние контентного конвейера:

**Вызов инструмента:**
```json
{
  "name": "get_queue_stats",
  "arguments": {
    "platform": "reddit"
  }
}
```

**Пример ответа:**
```json
{
  "summary_by_status": [
    { "status": "DISPATCHED", "count": 14 },
    { "status": "PENDING_APPROVAL", "count": 6 },
    { "status": "POSTED", "count": 2 }
  ],
  "detailed_breakdown": [
    {
      "status": "DISPATCHED",
      "target_platform": "reddit",
      "network": "lospollos",
      "item_count": 14,
      "oldest_item": 1788759580100,
      "newest_item": 1788761200000
    }
  ]
}
```

### Сценарий Б: Аналитика конверсий и расчет EPC по статьям блога
Для проверки реальной доходности связок:

**Вызов инструмента:**
```json
{
  "name": "get_epc_analytics",
  "arguments": {
    "timeframe_days": 14
  }
}
```

**Вызов произвольного SELECT через `read_query`:**
```sql
SELECT 
  slug,
  count(*) as clicks,
  count(DISTINCT ip) as unique_users
FROM blog_conversions 
GROUP BY slug 
ORDER BY clicks DESC 
LIMIT 10;
```

### Сценарий В: Проверка атрибуции лидов Telegram (`sqlite-tg-leads`)
Подключение к базе `core/data/tg_leads.db` позволяет инспектировать эффективность офферов алгоритма MAB (Multi-Armed Bandit):

**Вызов через `read_query`:**
```sql
SELECT 
  offer_id,
  network,
  impressions,
  conversions,
  revenue,
  round((revenue / max(impressions, 1)), 4) as epc
FROM mab_arms
ORDER BY revenue DESC;
```

---

## 5. 🧪 Валидация и тестирование сервера

Для проверки доступности и работоспособности MCP-сервера в локальном окружении выполните:

```bash
# Быстрая проверка через npm script
npm run mcp:sqlite

# Запуск полного теста соответствия спецификации (6/6 тестов)
node scratch/validate_mcp_server.cjs
```

Ожидаемый результат:
```text
[MCP-SQLite-RO] ✅ Connected to D:\WEB\antigravity\affiliate\core\data\content_queue.sqlite (STRICT READ-ONLY)
[PASS] Step 1: initialize
[PASS] Step 2: tools/list
[PASS] Step 3: tools/call: list_tables
[PASS] Step 4: tools/call: get_queue_stats
[PASS] Step 5: tools/call: read_query (SELECT)
[PASS] Step 6: tools/call: read_query (MALICIOUS WRITE BLOCKED)

🎉 ALL 6 MCP VALIDATION TESTS PASSED PERFECTLY!
```
