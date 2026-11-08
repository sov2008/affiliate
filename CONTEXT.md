# Архитектурный и операционный контекст проекта (CONTEXT.md)
*Дата генерации: 8 ноября 2026 г. | Ветка: `promoradar-portal` | Коммит: `10734bc`*

---

## 1. Общие сведения и назначение проектов

В репозитории объединены два взаимосвязанных высоконагруженных веб-ресурса с единой инфраструктурой на базе **Astro SSG**, **Nginx** и **PM2** на сервере DigitalOcean (`178.128.199.28`):

1. **PromoRadar.store (`deals-portal/`):**
   - **Тип:** Международный мультиязычный купонный портал и кэшбэк/скидочный хаб.
   - **Стек:** Astro 4 (Static Site Generation), Tailwind CSS, TypeScript, Lucide Icons.
   - **Домен:** `https://promoradar.store/` (SSL Let's Encrypt, HTTP/2, Brotli/Gzip, Microcaching <30ms TTFB).
   - **Поддерживаемые языки:** `en` (дефолтный международный), `ua`, `ar`, `es`, `pt`, `de`, `pl`, `cs`.
   - **Целевые GEO:** Tier 1 (US, EU, GCC, UK, CA, AU), Tier 2 (UA, BR, MX), Tier 3 (IN, TR, ID).
   - **Строгие ограничения:** Полный запрет на программы/офферы из РФ и РБ (Правило 8 AGENTS.md), запрет на демо-данные (Правило 2).

2. **FlirtCheck.site (`blog/`):**
   - **Тип:** Исследовательский лонгрид-блог (Cheltenham Forensic Desk) по анализу алгоритмов дейтинга, противодействию ботам и мошенничеству в романтических сервисах.
   - **Стек:** Astro SSG, Forensic Evidence Gazette Design System, Schema.org NewsMediaOrganization.
   - **Домен:** `https://flirtcheck.site/`
   - **Монетизация:** Органические смартлинки перехода `/go` (LosPollos / MyLead) с атрибутами `rel="nofollow sponsored" target="_blank"` и сквозной CID-атрибуцией.

---

## 2. Структура репозитория

```
/
├── deals-portal/                 # Исходный код купонного портала PromoRadar
│   ├── src/
│   │   ├── pages/
│   │   │   ├── index.astro       # Главная витрина, Deal of the Day, Ticker брендов, FAQ, сравнения
│   │   │   ├── stores/[slug].astro # Целевые SEO-страницы магазинов
│   │   │   ├── categories/       # Категории офферов
│   │   │   ├── compare/          # Head-to-Head сравнения мерчантов
│   │   │   └── go/[slug].astro   # Безопасные локальные редиректы
│   │   ├── components/
│   │   │   ├── GoogleAnalytics.astro # GA4 Advanced Consent Mode v2 + Beacon Outbound Tracking
│   │   │   ├── BrandLogo.astro   # Отрисовка фирменных логотипов брендов
│   │   │   ├── Header.astro      # Навигация с переключателем Region & Language
│   │   │   └── PartnerBannerRotator.astro # Ротатор графических акций
│   │   ├── data/
│   │   │   ├── couponsData.ts    # База данных купонов (COUPONS_DATA, STORES_DATA)
│   │   │   ├── heroDealsMultiGeo.ts # Пул офферов "Deal of the Day" с переводами и выгодами
│   │   │   └── storeDomains.ts   # Реестр официальных доменов мерчантов
│   │   └── layouts/BaseLayout.astro
│   ├── public/                   # Статические ассеты, логотипы /logos/, баннеры /banners/
│   └── dist/                     # Скомпилированный продакшен-бандл (786 страниц)
├── blog/                         # Исходный код блога расследований FlirtCheck
│   ├── src/
│   │   ├── pages/                # Индекс и страницы расследований
│   │   ├── components/           # UI-компоненты блога
│   │   └── layouts/BaseLayout.astro
├── scripts/                      # Скрипты синхронизации, деплоя и автоматизации
│   ├── catalog_validator.cjs     # Единый валидатор каталога (Правило 8: RU/BY/KZ/валютный бан, Правило 2: Zero Demo/плейсхолдеры/сроки, домены и дедупликация)
│   ├── direct_deploy_promoradar.cjs # Атомарный SSH-деплой PromoRadar с переключением symlink
│   ├── direct_deploy_flirtcheck.cjs # Атомарный SSH-деплой FlirtCheck с переключением symlink
│   ├── postbuild_inject_css.cjs  # Инъекция критического CSS для исключения FOUC
│   ├── promoradar_catalog_sync.cjs # Автосинхронизация каталогов Admitad/CJ
│   └── cj_promoradar_sync.cjs
├── core/                         # Ядро фоновых сервисов и очередей
├── .agents/                      # Спецификации скиллов и правил разработки
│   ├── rules/                    # zero_demo_data, language, architecture_protocol
│   └── skills/                   # analytics, cro_funnel_gatekeeper, remote_ssh_deployer
├── AGENTS.md                     # Главные правила разработки и эксплуатации проекта
└── CONTEXT.md                    # Данный файл оперативного контекста
```

---

## 3. Архитектура продакшен-сервера (DigitalOcean)

- **IP-адрес:** `178.128.199.28` (Ubuntu 24.04 LTS, root)
- **Веб-сервер:** Nginx 1.24+ с раздельными виртуальными хостами:
  - `/etc/nginx/sites-enabled/promoradar.store` $\rightarrow$ Root: `/var/www/promoradar.store/current`
  - `/etc/nginx/sites-enabled/flirtcheck.site.conf` $\rightarrow$ Root: `/var/www/flirtcheck.site/current`
  - `/etc/nginx/sites-enabled/vikunja.conf` (порт 3456) $\rightarrow$ Внутренний Task & Project Management
- **Фоновые сервисы PM2:**
  - `affiliate-autonomous-agent` (PID онлайн, автопилот контента)
  - `affiliate-dashboard` (PID онлайн, порты 5000 API/Dashboard и 3000 TDS Traffic Router /go)
  - `affiliate-scheduler`, `affiliate-health-monitor`, `affiliate-social-syndicator`
  - Ротация логов: `pm2-logrotate` (активен)
- **Система релизов PromoRadar & FlirtCheck:**
  Релизы размещаются в `/var/www/promoradar.store/releases/rel_<timestamp>` и `/var/www/flirtcheck.site/releases/rel_<timestamp>` с атомарным переключением символических ссылок (`/current`) и автоматическим `nginx -t && systemctl reload nginx`.

---

## 4. Телеметрия и веб-аналитика (Google Analytics 4)

1. **PromoRadar (`G-ZKTJYVZEPT`):**
   - **Google Advanced Consent Mode v2:** Параметры `url_passthrough: true` и `ads_data_redaction: true`. Разрешает анонимные сетевые пинги при отсутствии явного согласия на Cookies для включения Behavioral Modeling в GA4.
   - **Beacon Transport:** Все события конверсий (`coupon_reveal`, `coupon_copied`, `affiliate_click`) отправляются через `navigator.sendBeacon`, гарантируя доставку даже при немедленном переходе на сайт магазина.
   - **Скролл:** Автоматическая фиксация вех чтения 25%, 50%, 75%, 90%.

2. **FlirtCheck (`G-9F1SLFNHS0`):**
   - Комплексный трекинг смартлинк-переходов `affiliate_click` с параметрами `offer_id`, `trigger_context`, `traffic_source`.
   - Аналитика экспорта PDF-досье расследований и шаринга в соцсети.

---

## 5. Последние ключевые доработки (Ноябрь 2026)

- **Интеграция выгоды в купон:** Разработан и внедрен реалистичный отрывной ваучер-талон (Rip-Off Voucher) в блоке «Deal of the Day» с вырезом компостера, перфорационными пунктирными линиями и встроенной секцией `EST. SAVINGS` в валюте выбранного региона.
- **Мультиязычность и гео-ротация:** Карточка «Deal of the Day» автоматически фильтрует доступные офферы под выбранный пользователем регион (`UA`, `GCC`, `EU`, `US`, `PL`, `CZ`) и мгновенно переводит все надписи талона на национальный язык (`en`, `ua`, `ar`, `es`, `pt`, `de`, `pl`, `cs`).
- **Расширенное описание:** Поле описания купона расширено до 4 строк (`line-clamp-4`), обеспечивая высокую читаемость без обрезки важной информации об условиях скидки.
- **Очистка служебных надписей:** Удален ярлык «Official Merchant Partner», под логотипом отображается только чистая категория магазина.

---

## 6. Команды для сборки и развертывания

- **Сборка и деплой PromoRadar:**
  ```bash
  npm --prefix deals-portal run build
  node scripts/direct_deploy_promoradar.cjs
  ```
- **Сборка и деплой FlirtCheck:**
  ```bash
  npm --prefix blog run build
  node scripts/direct_deploy_flirtcheck.cjs
  ```
- **Проверка статуса сервера:**
  ```bash
  curl -sI https://promoradar.store/
  curl -sI https://flirtcheck.site/
  ```

