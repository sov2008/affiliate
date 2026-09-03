# 🔋 Мониторинг расходования кредитов - Быстрый старт

Приложение для отслеживания расходования токенов на Groq и OpenRouter API в реальном времени.

## ⚡ Быстрая установка (5 минут)

### Шаг 1: Установить зависимости
```bash
npm install
```

### Шаг 2: Задать ключи API
```bash
# На Windows (PowerShell)
$env:GROQ_API_KEY = "ваш-ключ-groq"
$env:OPENROUTER_API_KEY = "ваш-ключ-openrouter"

# На Linux/Mac
export GROQ_API_KEY="ваш-ключ-groq"
export OPENROUTER_API_KEY="ваш-ключ-openrouter"
```

**Где взять ключи:**
- **Groq:** https://console.groq.com/api-keys
- **OpenRouter:** https://openrouter.ai/account

### Шаг 3: Запустить приложение
```bash
# Запустить с dashboard
npm start

# Dashboard будет доступен по адресу: http://localhost:5000
```

## 📊 Смотреть статус кредитов

### Вариант 1: Dashboard (веб-интерфейс)
1. Откройте браузер
2. Перейдите на http://localhost:5000
3. На главной странице dashboard увидите виджет "🔋 Мониторинг кредитов"

### Вариант 2: API запросы
```bash
# Получить текущий статус
curl http://localhost:5000/api/credits/status

# Получить полные метрики
curl http://localhost:5000/api/credits/metrics

# Скачать CSV отчёт
curl http://localhost:5000/api/credits/export/csv > credits.csv

# Обновить кредиты вручную
curl -X POST http://localhost:5000/api/credits/refresh
```

### Вариант 3: Тестирование в коде
```bash
# Запустить тесты Credits Monitor
npm run test:credits
```

## 📋 Что отслеживается

Для каждого API провайдера мониторится:

| Метрика | Описание | Пример |
|---------|---------|--------|
| **Осталось** | Доступные кредиты | $5,000 |
| **Использовано** | Потрачено всего | $5,000 |
| **Лимит** | Максимум в аккаунте | $10,000 |
| **% использовано** | Процент от лимита | 50% |
| **Дневное потребление** | Среднее в день | $200 |
| **Кредиты закончатся** | Прогноз истощения | 15 сентября 2026 |

## 🚨 Алерты и уведомления

Система автоматически показывает алерты:

```
🔴 КРИТИЧЕСКИ (красный)
   ├─ Используется более 90% кредитов
   └─ Кредиты закончатся через 3 дня

🟠 ПРЕДУПРЕЖДЕНИЕ (жёлтый)
   ├─ Используется 75-90% кредитов
   └─ Кредиты закончатся через 7 дней

🟢 НОРМАЛЬНО (зелёный)
   ├─ Используется менее 75% кредитов
   └─ Кредиты закончатся более чем через 7 дней
```

## 🎯 Типичные задачи

### Как узнать, сколько осталось кредитов?
```bash
curl http://localhost:5000/api/credits/status | grep remaining
```

### Как экспортировать отчёт?
```bash
# Скачать CSV файл
curl http://localhost:5000/api/credits/export/csv > отчет_$(date +%Y-%m-%d).csv

# Открыть в Excel/Google Sheets
```

### Как получать уведомления об алертах?
```typescript
// Добавить в dashboard-server.ts

const checkAlerts = async () => {
  const status = await creditsMonitor.getDashboardStatus();
  
  if (status.alerts.length > 0) {
    console.warn('⚠️ Новые алерты:', status.alerts);
    
    // Отправить в Telegram
    await telegram.sendMessage(`💬 ${status.alerts.join('\n')}`);
    
    // Отправить Email
    await email.send({
      to: 'operator@example.com',
      subject: 'Алерт по кредитам',
      body: status.alerts.join('\n')
    });
  }
};

setInterval(checkAlerts, 300000); // каждые 5 минут
```

### Как интегрировать с Telegram ботом?
```typescript
import { CreditsMonitorService } from './services/credits-monitor.service';

const creditsMonitor = new CreditsMonitorService({
  groqApiKey: process.env.GROQ_API_KEY,
  openRouterApiKey: process.env.OPENROUTER_API_KEY,
});

// Отправлять уведомления в Telegram каждый час
setInterval(async () => {
  const metrics = await creditsMonitor.getMetrics();
  
  const message = `
💰 *Статус кредитов*

Groq:
  💵 Осталось: $${metrics.current.groq?.remaining}
  📊 Использовано: ${metrics.current.groq?.percentUsed}%
  📅 Закончатся: ${metrics.estimatedRunoutDate.groq}

OpenRouter:
  💵 Осталось: $${metrics.current.openRouter?.remaining}
  📊 Использовано: ${metrics.current.openRouter?.percentUsed}%
  📅 Закончатся: ${metrics.estimatedRunoutDate.openRouter}
  `.trim();
  
  await telegram.sendMessage(message);
}, 3600000); // каждый час
```

## 📈 Примеры анализа

### Найти пиковые часы расходования:
```bash
# Скачать данные
curl http://localhost:5000/api/credits/metrics > metrics.json

# Обработать в Python/Excel
# Рассчитать среднее по часам
# Найти период с максимальным потреблением
```

### Рассчитать ROI использования API:
```typescript
const metrics = await creditsMonitor.getMetrics();
const dailySpend = metrics.dailyBurn.groq + metrics.dailyBurn.openRouter;
const monthlySpend = dailySpend * 30;

// Теперь рассчитать доход от контента
const monthlyRevenue = bundlesProcessed * avgEPC;
const roi = (monthlyRevenue - monthlySpend) / monthlySpend * 100;
```

## 🔧 Конфигурация

### Переменные окружения (.env)
```bash
# Обязательные
GROQ_API_KEY=sk_...                    # API ключ Groq
OPENROUTER_API_KEY=sk_...              # API ключ OpenRouter

# Опциональные
CREDITS_CHECK_INTERVAL=300000           # Интервал проверки (мс)
CREDITS_ALERT_THRESHOLD_PERCENT=75     # % для жёлтого алерта
CREDITS_CRITICAL_THRESHOLD_PERCENT=90  # % для красного алерта
CREDITS_ALERT_DAYS=7                   # Дней для жёлтого алерта на дату
CREDITS_CRITICAL_DAYS=3                # Дней для красного алерта на дату
```

### Интеграция в код:
```typescript
// src/dashboard-server.ts

import express from 'express';
import creditsRouter, { initializeCreditsMonitor } from './routes/credits.router';

const app = express();

// Инициализировать Credits Monitor
const creditsMonitor = initializeCreditsMonitor(
  process.env.GROQ_API_KEY,
  process.env.OPENROUTER_API_KEY
);

// Подключить API routes
app.use('/api/credits', creditsRouter);

// Опционально: получать алерты
if (creditsMonitor) {
  app.get('/api/credits/status', async (req, res) => {
    const status = await creditsMonitor.getDashboardStatus();
    res.json(status);
  });
}

app.listen(5000);
```

## 🧪 Тестирование

```bash
# Запустить единый тест Credits Monitor
npm run test:credits

# Запустить в watch режиме
npm run test:credits -- --watch

# Запустить с verbose выводом
npm run test:credits -- --verbose
```

## 📞 Часто задаваемые вопросы

**Q: Почему нет данных для OpenRouter?**
A: Убедитесь, что `OPENROUTER_API_KEY` установлен в переменных окружения.

**Q: Как часто обновляются данные?**
A: По умолчанию каждые 5 минут. Можно изменить через `CREDITS_CHECK_INTERVAL`.

**Q: Почему цифры не совпадают с личным кабинетом Groq?**
A: API может кэшировать данные на 5-10 минут. Используйте кнопку "Обновить" для принудительной проверки.

**Q: Где сохраняются исторические данные?**
A: В файле `.antigravity/credits-metrics.json`.

**Q: Как удалить старые данные?**
A: Удалите файл `.antigravity/credits-metrics.json`, история пересоздастся при следующей проверке.

## 📂 Структура файлов

```
src/
├── services/
│   └── credits-monitor.service.ts       # Основной сервис
├── dashboard/
│   └── CreditsMonitorPanel.tsx          # React компонент
├── server/
│   └── routes/
│       └── credits.router.ts            # API endpoints
└── tests/
    └── credits-monitor.spec.ts          # Тесты

.antigravity/
└── credits-metrics.json                 # История данных
```

## 🚀 Production Deploy

```bash
# 1. Уверитесь, что переменные окружения установлены на сервере
ssh user@server "echo $GROQ_API_KEY"

# 2. Запустить через PM2
pm2 start npm --name "affiliate-dashboard" -- start

# 3. Сохранить конфигурацию
pm2 save
pm2 startup

# 4. Проверить статус
pm2 status
```

## 📊 Интеграция с Grafana (опционально)

Для продвинутого мониторинга можно интегрировать с Grafana:

```bash
# 1. Установить Grafana
docker run -d -p 3000:3000 grafana/grafana

# 2. Добавить data source: Prometheus или JSON API
# URL: http://localhost:5000/api/credits/metrics

# 3. Создать dashboard с графиками
# - Использование % в реальном времени
# - Прогноз истощения кредитов
# - Дневное потребление
```

---

**Версия:** 1.0.0  
**Статус:** Production Ready ✅  
**Последнее обновление:** 2026-09-02
