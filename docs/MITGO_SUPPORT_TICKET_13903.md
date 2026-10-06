# Досье тикета #13903: Модерация и аппрув площадки FlirtCheck (Mitgo / Admitad)

## 1. Паспорт тикета и учетной записи

| Параметр                     | Значенидля е                                                                          |
| :--------------------------- | :------------------------------------------------------------------------------------ |
| **Номер тикета**             | `#13903` (Zendesk / Mitgo Support)                                                    |
| **Партнерская сеть**         | **Mitgo** (Admitad Network)                                                           |
| **Дата создания**            | 02.10.2026                                                                            |
| **Регламентный SLA**         | До 3 рабочих дней (ожидаемый ответ до 07.10.2026)                                     |
| **Текущий статус**           | `IN_REVIEW` (На рассмотрении службы поддержки)                                        |
| **Publisher ID**             | `sov2018`                                                                             |
| **Зарегистрированный Email** | `sov7@i.ua`                                                                           |
| **Email отправки**           | `sapegin.oleg@gmail.com` (с Reply-To: `sov7@i.ua`)                                    |
| **Площадка (Ad Space)**      | **FlirtCheck** — Dating Safety & Identity Verification Lab                            |
| **URL площадки**             | `https://flirtcheck.site`                                                             |
| **Тема исходного запроса**   | `Fast-track ad space moderation: flirtcheck.site (Publisher ID: sov2018 / sov7@i.ua)` |

---

## 2. Официальное описание площадки (Publisher Media Kit)

### Краткое описание (Elevator Pitch)

**FlirtCheck** (`https://flirtcheck.site`) — это независимое англоязычное медиа и цифровая лаборатория кибербезопасности в сфере онлайн-дейтинга, верификации профилей, противодействия романтическому скаму (catfishing, romance fraud) и OSINT-анализа. На сайте опубликовано более 100 глубоких экспертных расследований, гайдов и встроенных клиентских инструментов оценки рисков.

### Профиль и источники трафика

- **География аудитории**: 100% Tier-1 (США — 60%, Великобритания — 18%, Канада — 9%, Австралия — 8%, Германия/ЕС — 5%).
- **Источники трафика**:
  1. **Органический поисковый трафик (SEO)**: оптимизация под поисковый интент пользователей, ищущих безопасность при онлайн-знакомствах, проверку партнеров по фото/номеру/соцсетям и разоблачение скамеров. Настроена мгновенная индексация через IndexNow.
  2. **Социальные сети**: Официальный верифицированный аккаунт X (Twitter) с синей галочкой (`@TheWeedsorg` / FlirtCheck) и тематические доски в Pinterest с инфографикой.
- **Чистота трафика**:
  - **Категорически исключены**: платный контекст на бренд (brand bidding), поп-андеры, дорвеи, clickunder, стимулированный трафик (incentivized), спам-рассылки и тулбары.
  - Только добровольные переходы заинтересованной взрослой аудитории (21–55 лет).

### Целевые вертикали офферов

1. **Dating & Social Discovery**: Mainstream & Casual дейтинг, платформы знакомств с верификацией профилей.
2. **Identity Verification & People Search**: Сервисы фоновых проверок (Background checks, Public records, Reverse phone/image lookup — TruthFinder, BeenVerified, Spokeo и аналоги).
3. **Cybersecurity & Privacy**: VPN, менеджеры паролей, антивирусы для смартфонов, защита от утечек данных (Nord Security, Surfshark и др.).

### Соответствие стандартам (Compliance & Safety)

- Все исходящие партнерские ссылки маркируются атрибутами `rel="nofollow sponsored"` и открываются в новой вкладке.
- Сайт полностью соответствует требованиям FTC, GDPR и британского регулятора ASA: опубликованы публичные страницы `Editorial Policy`, `Affiliate Disclosure`, `Privacy Policy`, `Terms of Service`.
- Высокая техническая производительность: Astro SSG, выделенный сервер в дата-центре Франкфурта (DigitalOcean), SSL/TLS, сверхбыстрый TTFB (<50мс).

---

## 3. Готовые шаблоны ответов на возможные вопросы саппорта Mitgo

Если менеджер саппорта запросит уточнения, используйте готовые формулировки ниже:

### Шаблон 1: Запрос на верификацию владения сайтом (Verification Code / Meta Tag / HTML file)

**Вариант ответа (на английском):**

```text
Hello Mitgo Support Team,

Thank you for the prompt update.

We have full administrative and root access to the flirtcheck.site infrastructure.
Please provide the required verification method (meta-tag, DNS TXT record, or verification HTML file name and contents).

Once provided, we will deploy it to our live production server within 5 minutes.

Best regards,
FlirtCheck Editorial & Tech Team
sov7@i.ua / Publisher ID: sov2018
```

> **Техническое примечание для нас**:
>
> - Если пришлют HTML-файл (напр., `admitad_verification_xxxx.html`) — сохраняем в папку `/public/admitad_verification_xxxx.html` и запускаем `npm run build` или деплой на сервер. Файл сразу станет доступен по `https://flirtcheck.site/admitad_verification_xxxx.html`.
> - Если пришлют мета-тег `<meta name="admitad-verification" content="..." />` — добавляем его в `<head>` в `src/layouts/BaseLayout.astro`.

---

### Шаблон 2: Запрос скриншотов / доказательств источников трафика (Traffic Sources Proof)

**Вариант ответа (на английском):**

```text
Hello,

Regarding traffic sources and user volume for flirtcheck.site:

1. Traffic Acquisition:
- Organic Search: Editorial investigations ranking for long-tail queries related to dating profile safety, image verification, and romance scam indicators.
- Social Channels: Verified X (Twitter) channel (@TheWeedsorg) and visual Pinterest boards driving direct referral engagement.

2. Placement Format:
Offers are placed strictly in editorial context — within comparison tables, honest reviews, and recommended safety tool sections with clear FTC-compliant disclosures.

Please let us know if you require specific analytics export (Google Analytics / Cloudflare traffic overview) for any particular reporting period.

Best regards,
FlirtCheck Team
```

---

### Шаблон 3: Запрос конкретных рекламодателей / программ, к которым нужен доступ

**Вариант ответа (на английском):**

```text
Hello,

For flirtcheck.site, we are primarily looking to connect with:
1. Online Dating & Social Networking affiliate programs (both mainstream and casual dating with Tier-1 geos: US, UK, CA, AU).
2. Identity Verification, Background Search & OSINT services (People search, reverse lookup).
3. Digital Security & Privacy tools (VPN, secure email, device protection).

Could you please confirm the approval of the ad space so we can apply to the respective affiliate programs in our publisher dashboard?

Best regards,
FlirtCheck Team
```

---

## 4. Чек-лист действий при получении ответа от Mitgo

1. **Мониторинг почты**: скрипт `python scripts/read_latest_emails.py` регулярно проверяет входящие сообщения на предмет писем от `support@mitgo.com`, `support@admitad.com` или домена `zendesk.com`.
2. **При запросе верификационного файла**:
   - Положить файл в `d:\WEB\antigravity\affiliate\public\<filename>`
   - Выполнить деплой на сервер через `node deploy-do.js`
   - Проверить HTTP 200 код через `curl -I https://flirtcheck.site/<filename>`
   - Ответить в тикет подтверждением.
3. **После успешного аппрува площадки**:
   - Войти в кабинет Mitgo / Admitad (`sov2018`).
   - Подключить целевые партнерские программы (Dating, VPN, Background Check).
   - Получить партнерские ссылки / смартлинки и внести их в роутер офферов проекта.
