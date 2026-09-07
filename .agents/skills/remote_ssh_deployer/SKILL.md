---
name: remote_ssh_deployer
description: Удаленное развертывание, синхронизация с Git и управление процессами PM2 на сервере DigitalOcean (178.128.199.28).
---

# Remote SSH Deployer Skill

## Назначение
Автоматизация доставки кода на боевой узел DigitalOcean Droplet (`178.128.199.28`) и управление демонами PM2.

## Основные скрипты
- `npx tsx core/src/scripts/deployProduction.ts` — полный цикл CI/CD деплоя
- `npx tsx core/src/scripts/deployDashboardUpdate.ts` — быстрое обновление панели управления
- `npx tsx core/src/scripts/configureNginxAuth.ts` — настройка HTTP Basic Auth для `/dashboard/`

## Процессы PM2 на сервере
| Процесс | Назначение |
| :--- | :--- |
| `affiliate-dashboard` | Порт 5000: Web Dashboard, API очереди и статистика |
| `affiliate-scheduler` | Фоновый планировщик задач |
| `blog-publisher-worker` | Автономный воркер публикации одобренных статей |
| `postback-listener` | Прием вебхуков и постбеков от партнерских сетей |

## Команды управления на сервере
```bash
pm2 status
pm2 reload ecosystem.config.js --update-env
pm2 logs affiliate-dashboard --lines 50
```
