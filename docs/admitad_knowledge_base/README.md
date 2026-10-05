# Admitad Enterprise Knowledge Base & Autonomous Monetization Engine
**Project:** FlirtCheck (`flirtcheck.site`)  
**Ad Space:** `3007248: FlirtCheck - Dating Safety & Verification Lab`  
**System Target:** 100% Autonomous Hands-off Revenue Generation (Zero-Touch Affiliate Operations)

---

## 📌 Executive Summary

Настоящая База Знаний регламентирует архитектуру, интеграционные протоколы и автономный цикл монетизации партнерской сети **Admitad (Mitgo Group)** внутри платформы FlirtCheck. 

Цель системы — **полная автономность (Zero Human Touch)**:
1. Автоматический мониторинг статусов 19+ партнерских программ (VPN, Антивирусы, Менеджеры паролей, eSIM, Anti-Spy, Премиум-дейтинг).
2. Автоматическое извлечение и валидация партнерских ссылок (Deeplinks) через headless-агентов и MTProto Telegram Bot API сразу после одобрения модерацией.
3. Бесшовное внедрение ссылок в Smart TDS-роутер `/go` и контекстные блоки 108+ расследовательских статей блога.
4. Автономный сбор свежих купонов и скидочных предложений с динамическим обновлением промо-таблиц.
5. 100% реальный учет кликов, постбеков и комиссий (Strict Zero Demo Data Rule) через вебхук `https://flirtcheck.site/api/postback/admitad`.

---

## 🗂️ Структура Базы Знаний

| Файл | Содержание | Ключевые компоненты |
|---|---|---|
| [01_ARCHITECTURE_AND_API.md](file:///d:/WEB/antigravity/affiliate/docs/admitad_knowledge_base/01_ARCHITECTURE_AND_API.md) | Архитектура экосистемы Mitgo/Admitad | Авторизация Mitgo ID, Ad Space ID 3007248, Webmaster API, MTProto `@admitad_bot`, Admitad Lite |
| [02_ZERO_TOUCH_AUTONOMOUS_PIPELINE.md](file:///d:/WEB/antigravity/affiliate/docs/admitad_knowledge_base/02_ZERO_TOUCH_AUTONOMOUS_PIPELINE.md) | Протокол 100% автономной работы без человека | Цикл опроса, авто-экстрактор ссылок, MAB-роутер, SubID-тегирование |
| [03_HIGH_EPC_OFFER_MATRIX.md](file:///d:/WEB/antigravity/affiliate/docs/admitad_knowledge_base/03_HIGH_EPC_OFFER_MATRIX.md) | Матрица 19 офферов и сопоставление со статьями | Ставки (до 140%), холды, CR, целевые статьи и виджеты блога |
| [04_POSTBACK_TRACKING_AND_REVENUE.md](file:///d:/WEB/antigravity/affiliate/docs/admitad_knowledge_base/04_POSTBACK_TRACKING_AND_REVENUE.md) | Постбек-шлюз и реальная финансовая аналитика | Эндпоинт `/api/postback/admitad`, маппинг параметров, расчет реального EPC |
| [05_TELEGRAM_BOT_AUTOMATION.md](file:///d:/WEB/antigravity/affiliate/docs/admitad_knowledge_base/05_TELEGRAM_BOT_AUTOMATION.md) | Автоматизация взаимодействия с `@admitad_bot` | MTProto GramJS, команды `/top_offers`, `/get_coupons`, генерация deeplink |

---

## ⚙️ Статус боевой интеграции

* **ID площадки в Admitad:** `3007248`
* **Подано заявок на модерацию:** `19 программ`
* **Постбек-эндпоинт:** `https://flirtcheck.site/api/postback/admitad` (HTTP 200 OK, latency < 3ms)
* **Сессия Telegram MTProto:** Активна под `@RealJastInCase`, синхронизирована с сервером `178.128.199.28`.
* **Фоновый демон:** `affiliate-admitad-daemon` (автономный цикл синхронизации).
