---
name: sqlite_queue_operator
description: Выполнение безопасных транзакций в SQLite базе данных очереди (content_queue_v2).
---

# SQLite Queue Operator Skill

## Назначение
Манипуляция очередью контента `content_queue_v2` в базе данных `core/data/content_queue.sqlite`.

## Поддерживаемые типы задач (target_platform / platform)
- `BLOG_POST` — SEO-статья для публикации в блоге.
- `SOCIAL_SNIPPET` — сопутствующий промо-пост (Reddit, Twitter/X).
- `REDDIT` — самостоятельный warmup / campaign пост.

## Жизненный цикл статусов задачи
```
[PENDING / PENDING_APPROVAL]
         │
         ├──► [APPROVED] ──► (Trigger BlogPublisherWorker) ──► [DISPATCHED]
         │
         └──► [REJECTED]
```

## Правило строго нулевых демо-данных (Strict Zero Demo Data Rule)
- Запрещено создавать синтетические клики, фиктивный EPC или фальшивую выручку.
- Все счетчики должны отражать только подтвержденные факты из партнерских сетей или реальный трафик.

## Примеры операций через Node.js API
```typescript
import { ContentQueueRepository } from '../core/src/db/queueRepository.js';

const queue = ContentQueueRepository.getInstance();
const pendingItems = queue.listPending(50);
queue.markApproved('blog_123');
```
