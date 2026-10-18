#!/usr/bin/env python3
"""
Seed Initial Project Structure into Vikunja for PromoRadar Empire
Populates 4 core projects, kanban boards, and starter tasks for user_id = 1 (sov2008).
"""

import sqlite3
import datetime
import os
import sys

DB_PATH = '/opt/vikunja/vikunja.db' if os.path.exists('/opt/vikunja/vikunja.db') else sys.argv[1] if len(sys.argv) > 1 else 'vikunja.db'

PROJECTS = [
    {
        "title": "🛒 PromoRadar — Каталог & Витрина",
        "desc": "Управление страницами магазинов (/stores/), верификация промокодов, скидки и SEO витрины promoradar.store",
        "color": "6366f1",
        "buckets": ["Беклог магазинов", "В разработке", "На модерации", "Опубликовано на сайте"],
        "tasks": [
            ("Добавить 50 новых брендов в каталог PromoRadar", "Расширить каталог актуальными брендами из категорий VPN, Hosting, Fashion, Travel.", 0),
            ("Внедрить Schema.org Coupon / Offer микроразметку", "Обеспечить Google Rich Snippets для повышения CTR в поисковой выдаче.", 0),
            ("Оптимизировать страницы /stores/ под поисковые запросы 2026", "Добавить расширенные FAQ, правила применения промокодов и метатеги.", 1),
            ("Проверить корректность редиректов /go и rel=nofollow sponsored", "Аудит исходящих партнерских ссылок на соответствие требованиям Google и сетей.", 3),
            ("Click-to-Reveal Coupon Modal для PromoRadar", "Интерактивное всплывающее окно с авто-копированием промокода при клике.", 3)
        ]
    },
    {
        "title": "🤝 Партнерские сети & Офферы (CJ & Admitad)",
        "desc": "Массовая подача заявок, получение персональных промокодов, direct deals и postback аналитика",
        "color": "10b981",
        "buckets": ["Ниши для экспансии (60+)", "Поданы заявки в CJ/Admitad", "Требует ответа рекламодателю", "Одобрено & Подключено"],
        "tasks": [
            ("Массовая подача заявок по 60+ нишам в CJ", "Крон cj_mass_applier.cjs запускается каждые 2 часа, охватывая до 1000+ офферов.", 3),
            ("Автоматическое подключение Admitad и запрос промокодов", "Крон admitad_mass_connect_promoradar.cjs запускается каждые 4 часа.", 3),
            ("Мониторинг почты рекламодателей и автоответчик", "Демон support_monitor_daemon каждые 60с отвечает на запросы о методах трафика.", 3),
            ("Синхронизация каталога cj_promoradar_sync", "Автоматическое добавление одобренных офферов в витрину PromoRadar.", 3),
            ("Подключение прямых офферов с повышенной комиссией", "Проработка эксклюзивных условий с affiliate-менеджерами топ-брендов.", 0)
        ]
    },
    {
        "title": "🚀 Трафик & Социальный синдикатор (X & Pinterest)",
        "desc": "Автоматическая публикация купонов, генерация покупательского трафика и прогрев каналов",
        "color": "0ea5e9",
        "buckets": ["Генерация контента", "Очередь постов", "В публикации (24/7)", "Анализ охватов"],
        "tasks": [
            ("Twitter / X: Публикация 48 промо-твитов в сутки", "Демон affiliate-twitter-publisher публикует твит каждые 30 минут со ссылками на PromoRadar.", 2),
            ("Автопополнение очереди твитов через enqueue_promoradar_tweets", "Крон каждые 3 часа пополняет базу свежими карточками со скидками до 75-80%.", 2),
            ("Прокачка кармы и авто-ответы в Reddit Scout", "Безопасный лимит 4 комментария в сутки для наращивания траста аккаунта u/sov2008.", 2),
            ("Возобновление публикации 25 пинов/сутки в Pinterest", "Оптимизация селекторов клика для стабильного размещения rich pins.", 1)
        ]
    },
    {
        "title": "⚙️ Инфраструктура, Демоны & Мониторинг",
        "desc": "Серверные процессы PM2, безопасность базы данных SQLite, крон-задачи и алерты",
        "color": "8b5cf6",
        "buckets": ["План работ", "В процессе", "На сервере 24/7", "Выполнено & Стабильно"],
        "tasks": [
            ("Ежедневный ночной бэкап баз SQLite в 03:00 UTC", "Резервное копирование content_queue.sqlite и tg_leads.db в /var/log/affiliate_backup.log.", 3),
            ("Поддержание стабильности 16 процессов PM2", "Все сервисы online, потребление памяти всего 37%, свободно 2.3 GB RAM.", 3),
            ("Мгновенные алерты в Telegram @local_match_filter_bot", "Оповещения об одобрении офферов, вопросах рекламодателей и верификации площадок.", 3),
            ("Управление проектом через Vikunja на порту 3456", "Полноценный канбан, роадмап и таск-трекер для экосистемы PromoRadar.", 3)
        ]
    }
]

def now_str():
    return datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M:%S')

def seed():
    print(f"Connecting to Vikunja DB: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # Find owner id
    cur.execute("SELECT id FROM users LIMIT 1")
    row = cur.fetchone()
    if not row:
        print("❌ No user found in users table!")
        return
    owner_id = row[0]
    print(f"Assigning projects to User ID: {owner_id}")

    pos = 100.0
    for p_idx, p in enumerate(PROJECTS):
        created_time = now_str()
        pos += 100.0
        
        # 1. Insert Project
        cur.execute("""
            INSERT INTO projects (title, description, hex_color, owner_id, is_archived, position, created, updated)
            VALUES (?, ?, ?, ?, 0, ?, ?, ?)
        """, (p["title"], p["desc"], p["color"], owner_id, pos, created_time, created_time))
        project_id = cur.lastrowid
        print(f"\n📁 Created Project #{project_id}: {p['title']}")

        # Initialize counter
        cur.execute("INSERT OR REPLACE INTO project_task_counters (project_id, last_index) VALUES (?, 0)", (project_id,))

        # 2. Insert Default Views: List (0), Gantt (1), Table (2), Kanban (3)
        cur.execute("""
            INSERT INTO project_views (title, project_id, view_kind, position, created, updated)
            VALUES ('List', ?, 0, 100.0, ?, ?)
        """, (project_id, created_time, created_time))

        cur.execute("""
            INSERT INTO project_views (title, project_id, view_kind, position, created, updated)
            VALUES ('Gantt', ?, 1, 200.0, ?, ?)
        """, (project_id, created_time, created_time))

        cur.execute("""
            INSERT INTO project_views (title, project_id, view_kind, position, created, updated)
            VALUES ('Table', ?, 2, 300.0, ?, ?)
        """, (project_id, created_time, created_time))

        cur.execute("""
            INSERT INTO project_views (title, project_id, view_kind, position, bucket_configuration_mode, created, updated)
            VALUES ('Kanban', ?, 3, 400.0, 1, ?, ?)
        """, (project_id, created_time, created_time))
        kanban_view_id = cur.lastrowid

        # 3. Create Buckets for Kanban
        bucket_ids = []
        for b_idx, b_title in enumerate(p["buckets"]):
            b_pos = (b_idx + 1) * 100.0
            cur.execute("""
                INSERT INTO buckets (title, project_view_id, position, created, updated, created_by_id)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (b_title, kanban_view_id, b_pos, created_time, created_time, owner_id))
            bucket_ids.append(cur.lastrowid)

        # Set default and done bucket on view
        cur.execute("UPDATE project_views SET default_bucket_id = ?, done_bucket_id = ? WHERE id = ?", 
                    (bucket_ids[0], bucket_ids[-1], kanban_view_id))

        # 4. Insert Tasks
        for t_idx, (task_title, task_desc, target_bucket_idx) in enumerate(p["tasks"]):
            cur_time = now_str()
            task_idx = t_idx + 1
            is_done = 1 if target_bucket_idx == len(bucket_ids) - 1 else 0
            done_at = cur_time if is_done else None

            cur.execute("""
                INSERT INTO tasks (title, description, project_id, done, done_at, `index`, priority, created, updated, created_by_id)
                VALUES (?, ?, ?, ?, ?, ?, 3, ?, ?, ?)
            """, (task_title, task_desc, project_id, is_done, done_at, task_idx, cur_time, cur_time, owner_id))
            task_id = cur.lastrowid

            # Update counter
            cur.execute("UPDATE project_task_counters SET last_index = ? WHERE project_id = ?", (task_idx, project_id))

            # Assign to bucket
            chosen_bucket_id = bucket_ids[target_bucket_idx]
            cur.execute("""
                INSERT INTO task_buckets (bucket_id, task_id, project_view_id)
                VALUES (?, ?, ?)
            """, (chosen_bucket_id, task_id, kanban_view_id))

            cur.execute("""
                INSERT INTO task_positions (task_id, project_view_id, position)
                VALUES (?, ?, ?)
            """, (task_id, kanban_view_id, (t_idx + 1) * 100.0))

            print(f"   [Task #{task_id}] {task_title} -> {p['buckets'][target_bucket_idx]}")

    conn.commit()
    conn.close()
    print("\n🎉 Seed completed successfully! All projects, kanbans, and tasks populated.")

if __name__ == '__main__':
    seed()
