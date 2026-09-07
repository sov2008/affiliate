---
name: http_verifier
description: Автоматическая валидация доступности внешних эндпоинтов, статических файлов блога и шлюзов авторизации.
---

# HTTP Verifier Skill

## Назначение
Проверка доступности веб-сервисов после деплоя или пересборки.

## Контрольные эндпоинты
1. **Корень блога**:
   ```bash
   curl -s -I https://flirtcheck.site/blog/
   ```
   - Ожидаемый код: `200 OK`
   - Content-Type: `text/html`

2. **Страницы статей блога**:
   ```bash
   curl -s -I https://flirtcheck.site/blog/<slug>/
   ```
   - Ожидаемый код: `200 OK`

3. **Дашборд (Шлюз безопасности)**:
   ```bash
   curl -s -I https://flirtcheck.site/dashboard/
   ```
   - Ожидаемый код: `401 Unauthorized` (без учетных данных)
   - При передаче Basic Auth: `200 OK`

4. **Внутренний API воркеров**:
   ```bash
   curl -s http://127.0.0.1:5000/api/workers/status
   ```
   - Ожидаемый код: `200 OK`
