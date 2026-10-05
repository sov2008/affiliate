# 02. Протокол 100% автономной работы без человека (Zero-Touch Monetization)

## 1. Концепция Zero-Touch

В соответствии с правилами проекта FlirtCheck, система функционирует полностью автономно. Человек не должен вручную копировать ссылки, проверять кабинеты или менять адреса в статьях.

---

## 2. Автономный цикл (The Automation Loop)

Каждые **120 минут** на сервере DigitalOcean фоновый демон **`affiliate-admitad-daemon`** выполняет регламентные процедуры:

```mermaid
sequenceDiagram
    participant Daemon as affiliate-admitad-daemon
    participant Admitad as Admitad Store & Bot
    participant Router as /go Smart TDS Router
    participant Blog as 108 Articles (FlirtCheck)
    participant TG as Telegram Admin (808343978)

    Daemon->>Admitad: 1. Проверить статус 19 программ (pending -> active)
    alt Программа одобрена (Approved)
        Admitad-->>Daemon: Статус: ACTIVE (например, NordVPN или Norton)
        Daemon->>Admitad: 2. Запросить прямой tracking URL и Deeplink
        Admitad-->>Daemon: URL: https://ad.admitad.com/g/{hash}/?subid={subid}
        Daemon->>Router: 3. Обновить маппинг в OfferRoutingService
        Daemon->>Blog: 4. Синхронизировать виджеты DossierContextBox
        Daemon->>TG: 5. Отправить алерт: "🎉 Программа одобрена и активирована!"
    else Программа еще на модерации
        Daemon->>Router: Сохранить интеллектуальный фолбэк (Smartlink / active offer)
    end
    Daemon->>Admitad: 6. Запросить /get_coupons и промо-акции
    Daemon->>Blog: 7. Обновить актуальные скидки (73% OFF, 2 года + 3 мес)
```

---

## 3. Интеллектуальный роутинг TDS `/go` и SubID-тегирование

Все ссылки в статьях, баннерах и кнопках ведут на внутренний роутер:
```text
https://flirtcheck.site/go?offer={niche}&cid={auto_click_id}
```

### Структура параметров SubID в Admitad:
| Параметр Admitad | Назначение | Пример значения |
|---|---|---|
| `subid` | Уникальный ClickID транзакции | `c9f3e1a2-8b4d` |
| `subid1` | Слаг статьи блога | `tinder-scam-guide-2026` |
| `subid2` | Тип блока размещения | `dossier_box`, `header_cta`, `comparison_matrix` |
| `subid3` | Геолокация пользователя | `US`, `GB`, `CA` |

### Преимущество бесшовного роутинга:
* **Никаких битых ссылок:** если рекламодатель отключит программу, роутер автоматически переключит трафик на аналогичный оффер за 0.001 секунды.
* **Сквозная аналитика:** при получении постбека система точно знает, какая конкретно статья и какая кнопка принесли деньги.

---

## 4. Защита от деградации ссылок (Link Health Monitor)

Встроенный сервис проверки ссылок `http_verifier`:
* Каждые 6 часов делает тестовый HEAD-запрос ко всем активным партнерским ссылкам.
* Проверяет цепочку редиректов (301/302 -> 200 OK конечного лендинга).
* Если рекламодатель ввел гео-блокировку или домен заблокирован — ссылка мгновенно переводится в статус `FALLBACK` с уведомлением администратора.
