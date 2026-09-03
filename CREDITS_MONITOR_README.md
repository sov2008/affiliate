# 🔋 Credits Monitor - Мониторинг расходования кредитов

Система мониторинга для отслеживания расходования кредитов/токенов на API Groq и OpenRouter в реальном времени.

## 📦 Компоненты

### 1. **CreditsMonitorService** (`src/services/credits-monitor.service.ts`)
Основной сервис для работы с кредитами:

```typescript
import { CreditsMonitorService } from '../services/credits-monitor.service';

const monitor = new CreditsMonitorService({
  groqApiKey: process.env.GROQ_API_KEY,
  openRouterApiKey: process.env.OPENROUTER_API_KEY,
  checkInterval: 300000, // 5 минут
});

// Запустить мониторинг в фоне
monitor.startMonitoring();

// Получить текущий статус
const status = await monitor.getDashboardStatus();

// Получить полные метрики
const metrics = await monitor.getMetrics();

// Получить CSV отчёт
const csv = await monitor.getCSVReport();
```

### 2. **Dashboard Component** (`src/dashboard/CreditsMonitorPanel.tsx`)
React компонент для отображения информации о кредитах в dashboard:

```tsx
import { CreditsMonitorPanel } from './CreditsMonitorPanel';

export function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <CreditsMonitorPanel />
    </div>
  );
}
```

### 3. **API Routes** (`src/server/routes/credits.router.ts`)
REST API endpoints для получения информации о кредитах:

- `GET /api/credits/status` - текущий статус кредитов
- `GET /api/credits/metrics` - полные метрики с историей
- `GET /api/credits/export/csv` - экспорт отчёта в CSV
- `POST /api/credits/refresh` - принудительное обновление

## 🚀 Установка

### 1. Установить зависимости (если нужны)
```bash
npm install
```

### 2. Задать переменные окружения
```bash
# .env или shell
export GROQ_API_KEY="your-groq-api-key"
export OPENROUTER_API_KEY="your-openrouter-api-key"
```

### 3. Инициализировать в dashboard-server.ts
```typescript
import { initializeCreditsMonitor } from './routes/credits.router';

const app = express();

// Инициализировать Credits Monitor
initializeCreditsMonitor(
  process.env.GROQ_API_KEY,
  process.env.OPENROUTER_API_KEY
);

// Подключить маршруты
app.use('/api/credits', creditsRouter);
```

## 📊 Мониторируемые метрики

### Для каждого провайдера (Groq / OpenRouter):
- **Remaining** - сколько кредитов осталось
- **Total Used** - всего потрачено кредитов
- **Limit** - максимальный лимит
- **Percent Used** - процент использованного лимита (0-100%)
- **Daily Burn** - среднее потребление в день
- **Requests Count** - количество запросов (только для Groq)
- **Runout Date** - прогнозная дата исчерпания кредитов

## 🎯 Алерты

Система автоматически генерирует алерты при:

### Критические (🔴 Красный)
- Использовано более 90% кредитов
- Кредиты закончатся через 3 дня или менее

### Предупреждение (🟠 Жёлтый)
- Использовано более 75% кредитов
- Кредиты закончатся через 7 дней или менее

### Нормально (🟢 Зелёный)
- Использовано менее 75% кредитов
- Кредиты закончатся более чем через 7 дней

## 📱 Dashboard UI

### Особенности:
- **Real-time обновление** каждые 5 минут (настраивается)
- **Progress Bar** с цветовым индикатором статуса
- **Детальная статистика** по каждому провайдеру
- **Видимые алерты** о критических проблемах
- **Кнопка обновления** для принудительной проверки
- **Responsive дизайн** для мобильных устройств

### Layout:
```
┌─────────────────────────────────────────┐
│ 🔋 Мониторинг кредитов   🔄 Обновить   │
├─────────────────────────────────────────┤
│ 🔴 Алерты (если есть)                  │
├─────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────┐ │
│  │   Groq API       │  │ OpenRouter   │ │
│  │ [████░░░] 75%    │  │ [██░░░░] 40% │ │
│  │ Осталось: $5000  │  │ Лимит: $500  │ │
│  │ Дневное: $200    │  │ Дневное: $50 │ │
│  └──────────────────┘  └──────────────┘ │
└─────────────────────────────────────────┘
```

## 📝 API Примеры

### Получить статус
```bash
curl http://localhost:5000/api/credits/status
```

**Ответ:**
```json
{
  "groq": {
    "remaining": 5000,
    "totalUsed": 5000,
    "limit": 10000,
    "percentUsed": "50.0",
    "dailyBurn": 150,
    "requestsCount": 1200,
    "runoutDate": "2026-09-15",
    "status": "green"
  },
  "openRouter": null,
  "alerts": [],
  "lastChecked": "2026-09-02T12:34:56.789Z"
}
```

### Получить полные метрики
```bash
curl http://localhost:5000/api/credits/metrics
```

**Ответ:**
```json
{
  "current": { /* ... */ },
  "dailyTrend": [ /* array of snapshots */ ],
  "dailyBurn": {
    "groq": 150,
    "openRouter": 0
  },
  "estimatedRunoutDate": {
    "groq": "2026-09-15",
    "openRouter": null
  },
  "alerts": []
}
```

### Получить CSV отчёт
```bash
curl -O http://localhost:5000/api/credits/export/csv
```

**Формат CSV:**
```
Timestamp,Provider,Remaining,TotalUsed,Limit,PercentUsed,DailyBurn
2026-09-02T12:00:00.000Z,Groq,5000,5000,10000,50.00,150
2026-09-02T12:05:00.000Z,Groq,4998,5002,10000,50.02,150
2026-09-02T12:10:00.000Z,Groq,4996,5004,10000,50.04,150
```

### Обновить кредиты вручную
```bash
curl -X POST http://localhost:5000/api/credits/refresh
```

## 🔧 Конфигурация

### Переменные окружения:
```bash
# Обязательные
GROQ_API_KEY=sk-...          # API ключ Groq
OPENROUTER_API_KEY=sk-...    # API ключ OpenRouter

# Опциональные
CREDITS_CHECK_INTERVAL=300000 # Интервал проверки в мс (по умолчанию 5 минут)
```

### Интеграция в dashboard-server.ts:
```typescript
import creditsRouter, { initializeCreditsMonitor } from './routes/credits.router';

// В функции инициализации сервера:
const creditsMonitor = initializeCreditsMonitor(
  process.env.GROQ_API_KEY,
  process.env.OPENROUTER_API_KEY
);

app.use('/api/credits', creditsRouter);

// Дополнительно: получить уведомления об алертах
if (creditsMonitor) {
  setInterval(async () => {
    const status = await creditsMonitor.getDashboardStatus();
    if (status.alerts.length > 0) {
      console.warn('📢 Credits Alerts:', status.alerts);
      // Отправить в Telegram, Email и т.д.
    }
  }, 300000);
}
```

## 🧪 Тестирование

```bash
# Запустить тесты Credits Monitor
npm run test:credits-monitor

# Или включить в общий test suite
npm test
```

## 📊 Примеры анализа

### Определить, сколько дней осталось до исчерпания кредитов:
```typescript
const metrics = await monitor.getMetrics();
const groqRunout = metrics.estimatedRunoutDate.groq;
if (groqRunout) {
  const daysLeft = Math.ceil(
    (new Date(groqRunout).getTime() - Date.now()) / 86400000
  );
  console.log(`Кредиты Groq закончатся через ${daysLeft} дней`);
}
```

### Отследить тренд потребления:
```typescript
const metrics = await monitor.getMetrics();
const trend = metrics.dailyTrend.map(s => ({
  time: s.timestamp,
  groqUsed: s.groq?.totalUsed,
  openRouterUsed: s.openRouter?.totalUsed,
}));
```

### Реагировать на критические алерты:
```typescript
const status = await monitor.getDashboardStatus();
const criticalAlerts = status.alerts.filter(a => a.includes('🔴'));
if (criticalAlerts.length > 0) {
  // Отправить SOS сигнал
  await notifyOperator(criticalAlerts);
  // Возможно, снизить частоту запросов
  await reduceApiCallFrequency();
}
```

## 🐛 Troubleshooting

### "Credits monitor not initialized"
- Убедитесь, что `initializeCreditsMonitor()` вызван
- Проверьте наличие переменных окружения `GROQ_API_KEY` или `OPENROUTER_API_KEY`

### "API response status: 401"
- Проверьте корректность API ключа
- Убедитесь, что ключ не истёк

### "Could not load credits history"
- Проверьте права доступа к директории `.antigravity/`
- Убедитесь, что диск имеет достаточно места

### Статус не обновляется
- Проверьте, что `startMonitoring()` был вызван
- Убедитесь, что сетевое соединение активно
- Проверьте логи на наличие ошибок сети

## 📞 Support

По вопросам или проблемам:
1. Проверьте логи: `.antigravity/daemon.log`
2. Верификация метрик: `GET /api/credits/metrics`
3. Ручное обновление: `POST /api/credits/refresh`

---

**Last Updated:** 2026-09-02
**Status:** Production Ready ✅
