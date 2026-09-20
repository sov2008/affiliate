---
name: ai_gateway_invoker
description: Генерация структурированных расследовательских лонгридов и визуальных ассетов в стандарте Forensic Evidence (NVIDIA NIM FLUX.1-dev / Gemini 1.5 Flash / Qwen 2.5 72B / Groq).
---

# AI Gateway Invoker Skill

## 1. Назначение
Обеспечивает генерацию высококачественных материалов для независимого бюро расследований (Cheltenham Desk):
- Технические расследовательские лонгриды и досье с Frontmatter-валидацией.
- Фотореалистичные визуальные ассеты в стандарте **Forensic Evidence Photography** через NVIDIA NIM (FLUX.1-dev).

---

## 2. Генеративный визуальный стандарт (`forensic_evidence_art`)

Категорически запрещены: аниме, манга, мультяшные персонажи, 3D-рендеры и пластиковая ретушь. Любая обложка или иллюстрация статьи обязана строго следовать документальному канону британской криминалистики и технической журналистики (Wired / The Intercept / FT Weekend).

### Базовый стилистический якорь (Master Style Anchor)
Каждый визуальный промпт обязан включать технические дескрипторы:
```text
Editorial documentary photograph, 35mm film grain, analog surveillance aesthetic, forensic evidence shot, desk of a cyber intelligence investigator in Cheltenham UK, natural moody lighting, shallow depth of field, tactile paper and hardware textures, desaturated color grade with cold shadows, no anime, no cartoons, no CGI rendering, photorealistic 8k, aspect ratio 16:9
```

### Обязательные негативные ограничения (Negative Constraints)
```text
anime, manga, cartoon, illustration, drawing, painting, 3d render, cgi, smooth plastic skin, attractive smiling model, romantic couple, watermark, text typography overlay, neon glow cyberpunk, oversaturated colors, low quality
```

### Предметная матрица 5 стилей (Physical Evidence Taxonomy)
1. **`Desk Flatlay` (Кибер-скам и свинобойни / `safety-dossier`):**
   - *Сюжет:* Распечатанные блокчейн-транзакции на дубовом столе, выделенные желтым маркером адреса кошельков, зацензуренные черной лентой копии поддельных документов, пинцет криминалиста, теплый свет настольной лампы, ноутбук ThinkPad.
2. **`Lab Hardware` (Алгоритмы и ELO / `algo-mechanics`):**
   - *Сюжет:* Макросъемка разобранного тестового смартфона в лаборатории радиочастотного тестирования, открытый терминал с кодом на матовом экране, цифровой осциллограф с графиками сигналов, спиральный блокнот с формулами распределения вероятностей.
3. **`Audio Forensics` (Дипфейки и спамботы / `digital-dialogue`):**
   - *Сюжет:* Винтажный катушечный диктофон с подключенным спектроанализатором звука, распечатанная спектрограмма голоса с красными отметками аномалий синтеза, студийные наушники на деревянном столе.
4. **`Evidence Board` (Психология и воронки / `modern-psychology`):**
   - *Сюжет:* Фрагмент архивной пробковой доски улик, соединенные красными нитями карточки поведенческих воронок, рукописные заметки на карточках Index Card, контактные отпечатки.
5. **`Contact Sheet` (Офлайн-дейтинг / `first-dates` & `romantic-essays`):**
   - *Сюжет:* Архивный контактный лист 35mm пленки (contact sheet) с кадрами лондонского метро и уличных кафе, зачеркнутые красным карандашом дубли, конверт с архивным штампом «Field Observation Notes».

---

## 3. Текстовые требования к расследовательским материалам
1. **Frontmatter (YAML)**:
   - `title`: Заголовок расследования в фактурном техническом стиле.
   - `description`: Краткое аналитическое резюме досье (140–160 символов).
   - `author`: "Arthur Vance" / "Cheltenham Investigation Desk".
   - `caseId`: Уникальный номер дела (например, `FC-742-ALG`).
   - `classification`: "PUBLIC INVESTIGATION DOSSIER // DECLASSIFIED 2026".
   - `telemetryRisk`: "CRITICAL" | "ELEVATED" | "MODERATE".
2. **Основное тело (Markdown)**:
   - Вступительный штамп: `> **INCIDENT DISPATCH // CASE: #...**`.
   - Фактурный анализ алгоритмических манипуляций без «глянцевого лайфстайла».
   - Нативная интеграция проверочных инструментов с атрибутами `rel="nofollow sponsored"` и `target="_blank"`.
