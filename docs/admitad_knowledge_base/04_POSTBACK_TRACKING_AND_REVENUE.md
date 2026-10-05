# 04. Постбек-шлюз и реальная финансовая аналитика

## 1. Строгий регламент подлинности данных (STRICT ZERO DEMO DATA RULE)

В соответствии с правилом `AGENTS.md` (Правило 2):
* Категорически запрещены любые синтетические постбеки, фейковые конверсии или искусственный доход.
* Все счетчики, дашборды и репозитории оперируют **исключительно 100% реальными транзакциями**, поступившими от партнерской сети Admitad через криптографически верифицированный вебхук.
* Если за день транзакций нет — система честно фиксирует `$0.00 / 0 conversions`.

---

## 2. Спецификация постбека Admitad

В личном кабинете Admitad (раздел *Инструменты → Postback URL*) настроен следующий URL:
```text
https://flirtcheck.site/api/postback/admitad?order_id=[[order_id]]&subid=[[subid]]&subid1=[[subid1]]&subid2=[[subid2]]&payment=[[payment]]&status=[[status]]&action_date=[[action_date]]&advcampaign_id=[[advcampaign_id]]
```

### Маппинг входящих полей:

| Параметр Admitad | Тип данных | Описание | Соответствие в базе FlirtCheck |
|---|---|---|---|
| `order_id` | String | Уникальный номер заказа у рекламодателя | `transaction_id` |
| `subid` | UUID | Исходный ClickID пользователя с сайта | `click_id` |
| `subid1` | String | Слаг статьи блога FlirtCheck | `article_slug` |
| `subid2` | String | Тип интерактивного виджета | `placement_type` |
| `payment` | Float | Сумма заработанной комиссии вебмастера ($ / €) | `revenue_amount` |
| `status` | String | `pending` (в обработке) / `approved` (подтверждено) / `declined` | `conversion_status` |
| `action_date` | Timestamp | Дата и время совершения действия пользователем | `occurred_at` |
| `advcampaign_id`| Integer | ID партнерской программы в Admitad (напр. 18867) | `offer_id` |

---

## 3. Архитектура обработчика на сервере

Файл эндпоинта: `src/pages/api/postback/admitad.ts` (или Express-роутер на порту 3000):
1. **Валидация входящего запроса:** проверка обязательных параметров `order_id`, `subid`, `payment`.
2. **Идемпотентность:** исключение повторной записи одной и той же транзакции через `PRIMARY KEY(order_id)`.
3. **Обновление статуса лида:** поиск исходного клика в `leads` и перевод в статус `CONVERTED`.
4. **Расчет живого EPC (Earnings Per Click):**
   $$\text{Real EPC} = \frac{\sum \text{Approved Revenue}}{\text{Total Real Outbound Clicks}}$$
5. **Мгновенный Telegram-алерт администратору:**
   При поступлении подтвержденной продажи сервис отправляет пуш в Telegram `808343978`:
   > 💰 **[Admitad Conversion]**  
   > **Оффер:** NordVPN (ID: 18867)  
   > **Комиссия:** +$28.40  
   > **Статья:** `dossier-catfishing-red-flags`  
   > **ClickID:** `c9f3e1a2...`
