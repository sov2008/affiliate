#!/usr/bin/env python3
"""
Полная локализация и оптимизация панели управления PromoRadar (EVANGELION Command Hub)
- Удаляет избыточные нагромождения 'EVANGELION' из названий
- Все 5 проектов, канбан-колонки, метки и задачи переведены на чистый русский язык
- Все 29 магазинов PromoRadar наполнены реальными ссылками, промокодами и описаниями
- Назначение всех задач пользователю sov2008
"""

import sqlite3
import datetime
import os
import sys

DB_PATH = '/opt/vikunja/vikunja.db' if os.path.exists('/opt/vikunja/vikunja.db') else sys.argv[1] if len(sys.argv) > 1 else 'vikunja.db'

def now_str():
    return datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M:%S')

# 29 проверенных магазинов витрины PromoRadar
STORES = [
    {
        "name": "Hostinger",
        "slug": "hostinger",
        "cat": "Хостинг и Домены",
        "badge": "Скидка 75% + Бесплатный домен",
        "aff": "https://www.hostinger.com/promoradar",
        "desc": "Высокопроизводительный облачный хостинг на базе LiteSpeed, бесплатный домен, автоматические ежедневные бэкапы и техподдержка 24/7. Промокод суммируется с долгосрочными планами."
    },
    {
        "name": "NordVPN",
        "slug": "nordvpn",
        "cat": "VPN и Приватность",
        "badge": "Скидка 71% + 3 месяца бесплатно",
        "aff": "https://nordvpn.com/promoradar",
        "desc": "Шифрование военного уровня AES-256, подтвержденная политика отсутствия логов, встроенный блокировщик угроз Threat Protection и 10Gbps серверы в 111 странах."
    },
    {
        "name": "Abelssoft",
        "slug": "abelssoft",
        "cat": "Софт и Утилиты",
        "badge": "Скидка 50% (Код: ABELSSOFT50)",
        "aff": "https://www.anrdoezrs.net/click-8102806-15740417",
        "desc": "Премиальные утилиты для Windows: оптимизация реестра, обновление драйверов, дефрагментация дисков и ускорение ПК. Прямой подтвержденный контракт в CJ Affiliate."
    },
    {
        "name": "Surfshark",
        "slug": "surfshark",
        "cat": "VPN и Приватность",
        "badge": "Скидка 82% + Неограниченно устройств",
        "aff": "https://surfshark.com/promoradar",
        "desc": "Быстрый и надежный VPN без ограничений на количество одновременных подключений. Включает блокировщик рекламы CleanWeb и антивирусный пакет."
    },
    {
        "name": "ChicMe",
        "slug": "chicme",
        "cat": "Одежда и Мода",
        "badge": "Экстра 12% (Код: CHICME12)",
        "aff": "https://rzekl.com/g/zcfe0k62wg367099d2cc312b8f391a/?i=3",
        "desc": "Международный бренд женской одежды, обуви, купальников и аксессуаров. Прямая доставка по всему миру и скидочные промокоды."
    },
    {
        "name": "Airalo eSIM",
        "slug": "airalo",
        "cat": "Путешествия и Отели",
        "badge": "Скидка 15% (Код: AIRALO15)",
        "aff": "https://alnk.to/flirtcheck_airalo",
        "desc": "Цифровые eSIM-карты для путешественников в более чем 200 странах мира. Мобильный интернет без платы за международный роуминг."
    },
    {
        "name": "Trip.com",
        "slug": "tripcom",
        "cat": "Путешествия и Отели",
        "badge": "До $60 скидки на отели и рейсы",
        "aff": "https://trip.tp.st/promoradar",
        "desc": "Единый сервис бронирования авиабилетов, отелей и железнодорожных билетов по Европе, Азии и США с круглосуточной поддержкой."
    },
    {
        "name": "Geekbuying",
        "slug": "geekbuying",
        "cat": "Электроника и Гаджеты",
        "badge": "До $50 скидки на гаджеты",
        "aff": "https://geekbuying.com/promoradar",
        "desc": "Мини-ПК, 3D-принтеры, лазерные граверы, электросамокаты и умная техника со складов в Европе и США с быстрой доставкой."
    },
    {
        "name": "AliExpress",
        "slug": "aliexpress",
        "cat": "Маркетплейсы и Опт",
        "badge": "Скидка от $4 до $16 на Choice Day",
        "aff": "https://aliexpress.com/promoradar",
        "desc": "Глобальный маркетплейс напрямую от фабрик и производителей: миллионы товаров от электроники до автотоваров и одежды."
    },
    {
        "name": "DHgate",
        "slug": "dhgate",
        "cat": "Маркетплейсы и Опт",
        "badge": "Скидка до $30 на опт и розницу",
        "aff": "https://dhgate.com/promoradar",
        "desc": "Крупнейшая B2B и розничная платформа прямых оптовых поставок из Китая со скидочными купонами на объемы заказов."
    },
    {
        "name": "Banggood",
        "slug": "banggood",
        "cat": "Электроника и Гаджеты",
        "badge": "Скидка 10% (Код: BG10OFF)",
        "aff": "https://banggood.com/promoradar",
        "desc": "Радиоуправляемые модели, инструменты, дроны, электроника и товары для хобби с глобальной гарантией качества."
    },
    {
        "name": "PureVPN",
        "slug": "purevpn",
        "cat": "VPN и Приватность",
        "badge": "Скидка 84% + 3 месяца в подарок",
        "aff": "https://purevpn.com/promoradar",
        "desc": "Высокоскоростной VPN с 6500+ серверами в 70+ странах, выделенными P2P-каналами и поддержкой стриминговых сервисов."
    },
    {
        "name": "Ivacy VPN",
        "slug": "ivacy",
        "cat": "VPN и Приватность",
        "badge": "Скидка 90% на 5 лет",
        "aff": "https://ivacy.com/promoradar",
        "desc": "Ультра-бюджетный и надежный VPN для стриминга без буферизации, раздельного туннелирования и защиты от утечек IPv6."
    },
    {
        "name": "Namecheap",
        "slug": "namecheap",
        "cat": "Хостинг и Домены",
        "badge": "Скидки до 97% на домены и хостинг",
        "aff": "https://namecheap.com/promoradar",
        "desc": "Аккредитованный регистратор доменных имен ICANN, надежный cPanel-хостинг, SSL-сертификаты и бесплатная защита приватности WhoisGuard."
    },
    {
        "name": "IObit",
        "slug": "iobit",
        "cat": "Софт и Утилиты",
        "badge": "Скидка 60% (Код: IOBIT60)",
        "aff": "https://iobit.com/promoradar",
        "desc": "Популярные утилиты Driver Booster, Advanced SystemCare и IObit Malware Fighter для максимальной производительности Windows."
    },
    {
        "name": "InVideo",
        "slug": "invideo",
        "cat": "Софт и Утилиты",
        "badge": "Скидка 25% (Код: INVIDEO25)",
        "aff": "https://invideo.io/promoradar",
        "desc": "ИИ-генератор и видеоредактор нового поколения: автоматическое создание видеороликов из текста для YouTube, TikTok и Instagram."
    },
    {
        "name": "Lingoda",
        "slug": "lingoda",
        "cat": "Обучение и Языки",
        "badge": "Скидка $50 на Языковой Спринт",
        "aff": "https://lingoda.com/promoradar",
        "desc": "Онлайн-школа иностранных языков с преподавателями-носителями: интенсивные курсы английского, немецкого, французского и испанского."
    },
    {
        "name": "Fairywill",
        "slug": "fairywill",
        "cat": "Здоровье и Фитнес",
        "badge": "Скидка 20% (Код: FAIRY20)",
        "aff": "https://fairywill.com/promoradar",
        "desc": "Ультразвуковые электрические зубные щетки, ирригаторы и наборы для отбеливания зубов профессионального уровня по доступным ценам."
    },
    {
        "name": "LightInTheBox",
        "slug": "lightinthebox",
        "cat": "Одежда и Мода",
        "badge": "Скидка 15% (Код: LITB15)",
        "aff": "https://lightinthebox.com/promoradar",
        "desc": "Онлайн-универмаг одежды, свадебных и вечерних платьев, домашнего декора и электроники с доставкой в 200+ стран."
    },
    {
        "name": "MiniInTheBox",
        "slug": "miniinthebox",
        "cat": "Электроника и Гаджеты",
        "badge": "Скидка 10% (Код: MITB10)",
        "aff": "https://miniinthebox.com/promoradar",
        "desc": "Чехлы для смартфонов, кабели, светодиодное освещение, умные часы и аксессуары по фабричным ценам."
    },
    {
        "name": "Yoins",
        "slug": "yoins",
        "cat": "Одежда и Мода",
        "badge": "Скидка 15% (Код: YOINS15)",
        "aff": "https://yoins.com/promoradar",
        "desc": "Молодежная трендовая женская и мужская одежда, платья, повседневные наряды и обувь по доступным ценам."
    },
    {
        "name": "TVC-Mall",
        "slug": "tvcmall",
        "cat": "Электроника и Гаджеты",
        "badge": "Оптовая скидка до 8%",
        "aff": "https://tvc-mall.com/promoradar",
        "desc": "Оптовый поставщик запчастей для ремонта смартфонов, дисплейных модулей, аксессуаров и инструментов сервисных центров."
    },
    {
        "name": "Tomtop",
        "slug": "tomtop",
        "cat": "Электроника и Гаджеты",
        "badge": "Скидка $10 на электронику",
        "aff": "https://tomtop.com/promoradar",
        "desc": "Квадрокоптеры, фотооборудование, умные гаджеты и автоаксессуары с быстрой доставкой со складов в ЕС."
    },
    {
        "name": "Cafago",
        "slug": "cafago",
        "cat": "Электроника и Гаджеты",
        "badge": "Скидка 5% (Код: CAFAGO5)",
        "aff": "https://cafago.com/promoradar",
        "desc": "Гаджеты для умного дома, спортивные смарт-часы, наушники и электроинструменты по оптовым ценам."
    },
    {
        "name": "Joybuy",
        "slug": "joybuy",
        "cat": "Маркетплейсы и Опт",
        "badge": "Скидки до 50% на хиты продаж",
        "aff": "https://joybuy.com/promoradar",
        "desc": "Международный маркетплейс розничного гиганта JD.com: брендовая электроника, одежда и товары для дома со строгим контролем подлинности."
    },
    {
        "name": "PatPat",
        "slug": "patpat",
        "cat": "Одежда и Мода",
        "badge": "Скидка 15% (Код: PATPAT15)",
        "aff": "https://patpat.com/promoradar",
        "desc": "Одежда для новорожденных, малышей и детей, а также парные образы Family Matching для всей семьи с яркими принтами."
    },
    {
        "name": "Rosegal",
        "slug": "rosegal",
        "cat": "Одежда и Мода",
        "badge": "Скидка 15% (Код: ROSE15)",
        "aff": "https://rosegal.com/promoradar",
        "desc": "Винтажная и современная одежда размеров Plus Size, купальники, готические платья и аксессуары."
    },
    {
        "name": "Zaful",
        "slug": "zaful",
        "cat": "Одежда и Мода",
        "badge": "Скидка 18% (Код: ZAFUL18)",
        "aff": "https://zaful.com/promoradar",
        "desc": "Трендовая пляжная мода, бикини, худи и уличная одежда для поколения Gen-Z с регулярными распродажами."
    },
    {
        "name": "Shein",
        "slug": "shein",
        "cat": "Одежда и Мода",
        "badge": "Скидка 15% (Код: SHEIN15)",
        "aff": "https://shein.com/promoradar",
        "desc": "Мировой лидер быстрой моды с ежедневными новинками, бьюти-коллекциями, товарами для дома и сезонными купонами."
    }
]

def populate():
    print("================================================================")
    print("🇷🇺 РУСИФИКАЦИЯ И ОПТИМИЗАЦИЯ ПАНЕЛИ УПРАВЛЕНИЯ PROMORADAR")
    print("Подключение к:", DB_PATH)
    print("================================================================")

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("SELECT id FROM users LIMIT 1")
    user_row = cur.fetchone()
    if not user_row:
        print("❌ Пользователь не найден!")
        return
    owner_id = user_row[0]

    # Полная очистка предыдущих списков, задач и связок кроме Inbox (id 1)
    cur.execute("DELETE FROM projects WHERE id > 1")
    cur.execute("DELETE FROM project_views WHERE project_id > 1")
    cur.execute("DELETE FROM buckets WHERE project_view_id NOT IN (SELECT id FROM project_views WHERE project_id = 1)")
    cur.execute("DELETE FROM tasks WHERE project_id > 1")
    cur.execute("DELETE FROM task_buckets WHERE project_view_id NOT IN (SELECT id FROM project_views WHERE project_id = 1)")
    cur.execute("DELETE FROM task_positions WHERE project_view_id NOT IN (SELECT id FROM project_views WHERE project_id = 1)")
    cur.execute("DELETE FROM project_ancestors WHERE project_id > 1")
    cur.execute("DELETE FROM project_task_counters WHERE project_id > 1")
    cur.execute("DELETE FROM labels")
    cur.execute("DELETE FROM label_tasks")
    cur.execute("DELETE FROM task_assignees")
    conn.commit()

    # Красивые русские метки с палитрой HEX-цветов
    labels_def = {
        "Хостинг и Домены": "0ea5e9",
        "VPN и Приватность": "6366f1",
        "Софт и Утилиты": "10b981",
        "Одежда и Мода": "ec4899",
        "Путешествия и Отели": "8b5cf6",
        "Электроника и Гаджеты": "f59e0b",
        "Маркетплейсы и Опт": "f97316",
        "Автотовары и Инструменты": "64748b",
        "Здоровье и Фитнес": "06b6d4",
        "Обучение и Языки": "eab308",
        "Ювелирные изделия и Часы": "d946ef",
        "Аудио и Аксессуары": "3b82f6",
        "Игры и Развлечения": "ef4444",
        "Дом и Уют": "84cc16",
        "Спорт и Туризм": "14b8a6",
        "Красота и Уход": "f43f5e",
        "Зоотовары": "a855f7",
        "CJ Affiliate": "22c55e",
        "Admitad": "e11d48",
        "Трафик и Постинг": "3b82f6",
        "Безопасность и Почта": "ef4444",
        "PM2 Демон": "8b5cf6"
    }

    lbl_map = {}
    init_ts = now_str()
    for lname, lcolor in labels_def.items():
        cur.execute("INSERT INTO labels (title, hex_color, created_by_id, created, updated) VALUES (?, ?, ?, ?, ?)",
                    (lname, lcolor, owner_id, init_ts, init_ts))
        lbl_map[lname] = cur.lastrowid

    # --------------------------------------------------------------------------
    # ПРОЕКТ 1: 01. Каталог магазинов PromoRadar
    # --------------------------------------------------------------------------
    ts = now_str()
    cur.execute("""
        INSERT INTO projects (title, description, hex_color, owner_id, is_archived, position, created, updated)
        VALUES ('01. Каталог магазинов PromoRadar', 
                'Флот из 29 подключенных магазинов витрины promoradar.store: проверенные промокоды, прямые партнерские редиректы, категории и SEO-страницы.',
                '6366f1', ?, 0, 100.0, ?, ?)
    """, (owner_id, ts, ts))
    p1_id = cur.lastrowid
    cur.execute("INSERT INTO project_ancestors (project_id, ancestor_id, depth) VALUES (?, ?, 0)", (p1_id, p1_id))
    cur.execute("INSERT INTO project_task_counters (project_id, last_index) VALUES (?, 0)", (p1_id,))

    cur.execute("INSERT INTO project_views (title, project_id, view_kind, position, created, updated) VALUES ('Список', ?, 0, 100.0, ?, ?)", (p1_id, ts, ts))
    cur.execute("INSERT INTO project_views (title, project_id, view_kind, position, created, updated) VALUES ('Диаграмма Ганта', ?, 1, 200.0, ?, ?)", (p1_id, ts, ts))
    cur.execute("INSERT INTO project_views (title, project_id, view_kind, position, created, updated) VALUES ('Таблица', ?, 2, 300.0, ?, ?)", (p1_id, ts, ts))
    cur.execute("INSERT INTO project_views (title, project_id, view_kind, position, bucket_configuration_mode, created, updated) VALUES ('Канбан', ?, 3, 400.0, 1, ?, ?)", (p1_id, ts, ts))
    p1_kanban_id = cur.lastrowid

    p1_buckets = ["Активные магазины (Опубликовано)", "На проверке / Модерация", "Запланировано к подключению"]
    p1_bids = []
    for idx, btitle in enumerate(p1_buckets):
        cur.execute("INSERT INTO buckets (title, project_view_id, position, created, updated, created_by_id) VALUES (?, ?, ?, ?, ?, ?)",
                    (btitle, p1_kanban_id, (idx + 1) * 100.0, ts, ts, owner_id))
        p1_bids.append(cur.lastrowid)
    cur.execute("UPDATE project_views SET default_bucket_id = ?, done_bucket_id = ? WHERE id = ?", (p1_bids[0], p1_bids[0], p1_kanban_id))

    for s_idx, store in enumerate(STORES):
        task_time = now_str()
        task_index = s_idx + 1
        title = f"{store['name']} — {store['badge']}"
        desc = (
            f"**Профиль магазина:** [{store['name']}](https://promoradar.store/stores/{store['slug']})\n\n"
            f"**Категория:** {store['cat']}\n"
            f"**Оффер / Скидка:** {store['badge']}\n"
            f"**Партнерская ссылка:** {store['aff']}\n\n"
            f"**Описание:**\n{store['desc']}\n\n"
            f"**Страница на витрине:** https://promoradar.store/stores/{store['slug']}"
        )
        cur.execute("""
            INSERT INTO tasks (title, description, project_id, done, done_at, `index`, priority, created, updated, created_by_id)
            VALUES (?, ?, ?, 1, ?, ?, 3, ?, ?, ?)
        """, (title, desc, p1_id, task_time, task_index, task_time, task_time, owner_id))
        tid = cur.lastrowid
        cur.execute("UPDATE project_task_counters SET last_index = ? WHERE project_id = ?", (task_index, p1_id))
        cur.execute("INSERT INTO task_buckets (bucket_id, task_id, project_view_id) VALUES (?, ?, ?)", (p1_bids[0], tid, p1_kanban_id))
        cur.execute("INSERT INTO task_positions (task_id, project_view_id, position) VALUES (?, ?, ?)", (tid, p1_kanban_id, (s_idx + 1) * 100.0))
        cur.execute("INSERT INTO task_assignees (task_id, user_id, created) VALUES (?, ?, ?)", (tid, owner_id, task_time))
        if store['cat'] in lbl_map:
            cur.execute("INSERT INTO label_tasks (task_id, label_id, created) VALUES (?, ?, ?)", (tid, lbl_map[store['cat']], task_time))

    print(f"✅ Добавлено 29 магазинов в Проект #1")

    # --------------------------------------------------------------------------
    # ПРОЕКТ 2: 02. Партнерские сети (CJ, Admitad, LosPollos)
    # --------------------------------------------------------------------------
    ts = now_str()
    cur.execute("""
        INSERT INTO projects (title, description, hex_color, owner_id, is_archived, position, created, updated)
        VALUES ('02. Партнерские сети (CJ, Admitad, LosPollos)',
                'Управление офферами CJ Affiliate (8102806), Admitad (3012753), LosPollos Smartlinks, Awin и автоподача заявок по нишам.',
                '10b981', ?, 0, 200.0, ?, ?)
    """, (owner_id, ts, ts))
    p2_id = cur.lastrowid
    cur.execute("INSERT INTO project_ancestors (project_id, ancestor_id, depth) VALUES (?, ?, 0)", (p2_id, p2_id))
    cur.execute("INSERT INTO project_task_counters (project_id, last_index) VALUES (?, 0)", (p2_id,))
    cur.execute("INSERT INTO project_views (title, project_id, view_kind, position, created, updated) VALUES ('Список', ?, 0, 100.0, ?, ?)", (p2_id, ts, ts))
    cur.execute("INSERT INTO project_views (title, project_id, view_kind, position, bucket_configuration_mode, created, updated) VALUES ('Канбан', ?, 3, 400.0, 1, ?, ?)", (p2_id, ts, ts))
    p2_kanban_id = cur.lastrowid

    p2_buckets = ["Ниши экспансии (60+)", "Заявки в обработке (300+)", "Одобренные и активные контракты"]
    p2_bids = []
    for idx, btitle in enumerate(p2_buckets):
        cur.execute("INSERT INTO buckets (title, project_view_id, position, created, updated, created_by_id) VALUES (?, ?, ?, ?, ?, ?)",
                    (btitle, p2_kanban_id, (idx + 1) * 100.0, ts, ts, owner_id))
        p2_bids.append(cur.lastrowid)

    p2_tasks = [
        ("CJ Multi-Vertical: Автоматическая подача заявок (60+ ниш)", "Крон-демон запускается каждые 2 часа (0 */2 * * *), подавая заявки топ-рекламодателям по EPC во всех мировых товарных категориях.", 1),
        ("Admitad: Мгновенное подключение программ (has_moderation=2)", "Крон-демон запускается каждые 4 часа (30 */4 * * *), мгновенно подключая e-commerce и SaaS офферы без ручной задержки.", 1),
        ("Admitad: Автосбор персональных трекинг-промокодов", "Сканирует каталоги купонных офферов и запрашивает персональные промокоды витрины PromoRadar.", 2),
        ("CJ GraphQL: Синхронизатор контрактов в реальном времени", "PM2 процесс cj-promoradar-sync отслеживает активные договоры и генерирует проверенные карточки скидок.", 2),
        ("LosPollos: Маршрутизатор смартлинков (/r/dating)", "Внутренний клоак-роутер автоматически распределяет органический трафик на наиболее доходный смартлинк.", 2),
        ("Прямой контракт Abelssoft (CJ Affiliate)", "Активный контракт с подтвержденным промокодом на корзину 50% ABELSSOFT50.", 2),
        ("Международное соглашение Hostinger", "Активный хостинг-оффер со скидкой 75% и бесплатным доменным именем.", 2)
    ]
    for tidx, (t_title, t_desc, b_idx) in enumerate(p2_tasks):
        cur_t = now_str()
        cur.execute("""
            INSERT INTO tasks (title, description, project_id, done, done_at, `index`, priority, created, updated, created_by_id)
            VALUES (?, ?, ?, ?, ?, ?, 3, ?, ?, ?)
        """, (t_title, t_desc, p2_id, 1 if b_idx == 2 else 0, cur_t if b_idx == 2 else None, tidx + 1, cur_t, cur_t, owner_id))
        tid = cur.lastrowid
        cur.execute("UPDATE project_task_counters SET last_index = ? WHERE project_id = ?", (tidx + 1, p2_id))
        cur.execute("INSERT INTO task_buckets (bucket_id, task_id, project_view_id) VALUES (?, ?, ?)", (p2_bids[b_idx], tid, p2_kanban_id))
        cur.execute("INSERT INTO task_positions (task_id, project_view_id, position) VALUES (?, ?, ?)", (tid, p2_kanban_id, (tidx + 1) * 100.0))
        cur.execute("INSERT INTO task_assignees (task_id, user_id, created) VALUES (?, ?, ?)", (tid, owner_id, cur_t))
        lbl_name = "CJ Affiliate" if "CJ" in t_title or "Abelssoft" in t_title else "Admitad" if "Admitad" in t_title else "CJ Affiliate"
        if lbl_name in lbl_map:
            cur.execute("INSERT INTO label_tasks (task_id, label_id, created) VALUES (?, ?, ?)", (tid, lbl_map[lbl_name], cur_t))

    print(f"✅ Интегрированы партнерские сети в Проект #2")

    # --------------------------------------------------------------------------
    # ПРОЕКТ 3: 03. Трафик и социальная дистрибуция
    # --------------------------------------------------------------------------
    ts = now_str()
    cur.execute("""
        INSERT INTO projects (title, description, hex_color, owner_id, is_archived, position, created, updated)
        VALUES ('03. Трафик и социальная дистрибуция',
                'Многоканальный органический трафик: Twitter/X (48 твитов/сутки), Reddit Scout, Pinterest Pinning и SEO-статьи блога.',
                '0ea5e9', ?, 0, 300.0, ?, ?)
    """, (owner_id, ts, ts))
    p3_id = cur.lastrowid
    cur.execute("INSERT INTO project_ancestors (project_id, ancestor_id, depth) VALUES (?, ?, 0)", (p3_id, p3_id))
    cur.execute("INSERT INTO project_task_counters (project_id, last_index) VALUES (?, 0)", (p3_id,))
    cur.execute("INSERT INTO project_views (title, project_id, view_kind, position, created, updated) VALUES ('Список', ?, 0, 100.0, ?, ?)", (p3_id, ts, ts))
    cur.execute("INSERT INTO project_views (title, project_id, view_kind, position, bucket_configuration_mode, created, updated) VALUES ('Канбан', ?, 3, 400.0, 1, ?, ?)", (p3_id, ts, ts))
    p3_kanban_id = cur.lastrowid

    p3_buckets = ["Генерация контента и сырье", "В очереди SQLite (Одобрено)", "Активная публикация (24/7)"]
    p3_bids = []
    for idx, btitle in enumerate(p3_buckets):
        cur.execute("INSERT INTO buckets (title, project_view_id, position, created, updated, created_by_id) VALUES (?, ?, ?, ?, ?, ?)",
                    (btitle, p3_kanban_id, (idx + 1) * 100.0, ts, ts, owner_id))
        p3_bids.append(cur.lastrowid)

    p3_tasks = [
        ("Twitter / X Автопостинг акций (48 твитов/сутки)", "PM2 демон affiliate-twitter-publisher публикует свежую акцию каждые 30 минут со ссылкой на витрину /stores/.", 2),
        ("Автопополнение очереди твитов PromoRadar", "Крон-задача запускается каждые 3 часа (15 */3 * * *), поддерживая запас в 40+ свежих карточек в SQLite content_queue_v2.", 2),
        ("Reddit Scout & Прокачка кармы (u/sov2008)", "PM2 демон affiliate-reddit-scout отслеживает r/AskReddit, r/NoStupidQuestions со строгим лимитом 4 комментария в сутки.", 2),
        ("Pinterest Публикатор пинов (MoneyCash.pw)", "PM2 демон affiliate-pinterest-publisher выкладывает товарные пины со случайным интервалом 20-30 минут.", 1),
        ("SEO-блог расследований Flirtcheck (90+ статей)", "SSG-коллекция контента на Astro 5 с обложками NVIDIA NIM FLUX.1-dev и позициями в Google.", 2)
    ]
    for tidx, (t_title, t_desc, b_idx) in enumerate(p3_tasks):
        cur_t = now_str()
        cur.execute("""
            INSERT INTO tasks (title, description, project_id, done, done_at, `index`, priority, created, updated, created_by_id)
            VALUES (?, ?, ?, ?, ?, ?, 3, ?, ?, ?)
        """, (t_title, t_desc, p3_id, 1 if b_idx == 2 else 0, cur_t if b_idx == 2 else None, tidx + 1, cur_t, cur_t, owner_id))
        tid = cur.lastrowid
        cur.execute("UPDATE project_task_counters SET last_index = ? WHERE project_id = ?", (tidx + 1, p3_id))
        cur.execute("INSERT INTO task_buckets (bucket_id, task_id, project_view_id) VALUES (?, ?, ?)", (p3_bids[b_idx], tid, p3_kanban_id))
        cur.execute("INSERT INTO task_positions (task_id, project_view_id, position) VALUES (?, ?, ?)", (tid, p3_kanban_id, (tidx + 1) * 100.0))
        cur.execute("INSERT INTO task_assignees (task_id, user_id, created) VALUES (?, ?, ?)", (tid, owner_id, cur_t))
        if "Трафик и Постинг" in lbl_map:
            cur.execute("INSERT INTO label_tasks (task_id, label_id, created) VALUES (?, ?, ?)", (tid, lbl_map["Трафик и Постинг"], cur_t))

    print(f"✅ Интегрированы каналы трафика в Проект #3")

    # --------------------------------------------------------------------------
    # ПРОЕКТ 4: 04. Входящие каналы и безопасность
    # --------------------------------------------------------------------------
    ts = now_str()
    cur.execute("""
        INSERT INTO projects (title, description, hex_color, owner_id, is_archived, position, created, updated)
        VALUES ('04. Входящие каналы и безопасность',
                'Двойной SSL-монитор ящиков (Gmail + i.ua каждые 60с), автоответчик рекламодателям по No-TM/rel="nofollow", верификация доменов и Telegram.',
                'f59e0b', ?, 0, 400.0, ?, ?)
    """, (owner_id, ts, ts))
    p4_id = cur.lastrowid
    cur.execute("INSERT INTO project_ancestors (project_id, ancestor_id, depth) VALUES (?, ?, 0)", (p4_id, p4_id))
    cur.execute("INSERT INTO project_task_counters (project_id, last_index) VALUES (?, 0)", (p4_id,))
    cur.execute("INSERT INTO project_views (title, project_id, view_kind, position, created, updated) VALUES ('Список', ?, 0, 100.0, ?, ?)", (p4_id, ts, ts))
    cur.execute("INSERT INTO project_views (title, project_id, view_kind, position, bucket_configuration_mode, created, updated) VALUES ('Канбан', ?, 3, 400.0, 1, ?, ?)", (p4_id, ts, ts))
    p4_kanban_id = cur.lastrowid

    p4_buckets = ["Мониторинг почты", "Правила автоответов и защиты", "Обработано и подтверждено"]
    p4_bids = []
    for idx, btitle in enumerate(p4_buckets):
        cur.execute("INSERT INTO buckets (title, project_view_id, position, created, updated, created_by_id) VALUES (?, ?, ?, ?, ?, ?)",
                    (btitle, p4_kanban_id, (idx + 1) * 100.0, ts, ts, owner_id))
        p4_bids.append(cur.lastrowid)

    p4_tasks = [
        ("Gmail IMAP SSL Сканер (sapegin.oleg@gmail.com:993)", "Опрос входящих каждые 60 секунд на предмет одобрений CJ, Admitad, Awin и запросов рекламодателей.", 2),
        ("i.ua POP3 SSL Сканер (sov7@i.ua:995)", "Опрос регистрационного ящика Admitad/Mitgo каждые 60 секунд на предмет тикетов подтверждения.", 2),
        ("Автоответчик рекламодателям по SMTP TLS (Oleg Sapegin)", "Отправка официального разъяснения по соблюдению rel=nofollow sponsored, запрету контекстной рекламы на бренд и профилю PromoRadar.", 2),
        ("Автоматическая раскладка токенов верификации", "Мгновенное размещение файлов admitad*.html и мета-тегов в deals-portal/public, blog/public и dist.", 2),
        ("Telegram Бот оперативных алертов (@local_match_filter_bot)", "Мгновенная доставка уведомлений о письмах и заявках администратору в чат 808343978.", 2)
    ]
    for tidx, (t_title, t_desc, b_idx) in enumerate(p4_tasks):
        cur_t = now_str()
        cur.execute("""
            INSERT INTO tasks (title, description, project_id, done, done_at, `index`, priority, created, updated, created_by_id)
            VALUES (?, ?, ?, ?, ?, ?, 3, ?, ?, ?)
        """, (t_title, t_desc, p4_id, 1, cur_t, tidx + 1, cur_t, cur_t, owner_id))
        tid = cur.lastrowid
        cur.execute("UPDATE project_task_counters SET last_index = ? WHERE project_id = ?", (tidx + 1, p4_id))
        cur.execute("INSERT INTO task_buckets (bucket_id, task_id, project_view_id) VALUES (?, ?, ?)", (p4_bids[b_idx], tid, p4_kanban_id))
        cur.execute("INSERT INTO task_positions (task_id, project_view_id, position) VALUES (?, ?, ?)", (tid, p4_kanban_id, (tidx + 1) * 100.0))
        cur.execute("INSERT INTO task_assignees (task_id, user_id, created) VALUES (?, ?, ?)", (tid, owner_id, cur_t))
        if "Безопасность и Почта" in lbl_map:
            cur.execute("INSERT INTO label_tasks (task_id, label_id, created) VALUES (?, ?, ?)", (tid, lbl_map["Безопасность и Почта"], cur_t))

    print(f"✅ Интегрированы входящие каналы и безопасность в Проект #4")

    # --------------------------------------------------------------------------
    # ПРОЕКТ 5: 05. Инфраструктура и серверный мониторинг
    # --------------------------------------------------------------------------
    ts = now_str()
    cur.execute("""
        INSERT INTO projects (title, description, hex_color, owner_id, is_archived, position, created, updated)
        VALUES ('05. Инфраструктура и серверный мониторинг',
                'DigitalOcean Droplet (2 vCPU, 4 ГБ RAM, свободно 2+ ГБ), 16 PM2 демонов, ночные бэкапы SQLite и Nginx-шлюз.',
                '8b5cf6', ?, 0, 500.0, ?, ?)
    """, (owner_id, ts, ts))
    p5_id = cur.lastrowid
    cur.execute("INSERT INTO project_ancestors (project_id, ancestor_id, depth) VALUES (?, ?, 0)", (p5_id, p5_id))
    cur.execute("INSERT INTO project_task_counters (project_id, last_index) VALUES (?, 0)", (p5_id,))
    cur.execute("INSERT INTO project_views (title, project_id, view_kind, position, created, updated) VALUES ('Список', ?, 0, 100.0, ?, ?)", (p5_id, ts, ts))
    cur.execute("INSERT INTO project_views (title, project_id, view_kind, position, bucket_configuration_mode, created, updated) VALUES ('Канбан', ?, 3, 400.0, 1, ?, ?)", (p5_id, ts, ts))
    p5_kanban_id = cur.lastrowid

    p5_buckets = ["Фоновые демоны (16 PM2)", "Резервное копирование и базы", "Штатный режим (100%)"]
    p5_bids = []
    for idx, btitle in enumerate(p5_buckets):
        cur.execute("INSERT INTO buckets (title, project_view_id, position, created, updated, created_by_id) VALUES (?, ?, ?, ?, ?, ?)",
                    (btitle, p5_kanban_id, (idx + 1) * 100.0, ts, ts, owner_id))
        p5_bids.append(cur.lastrowid)

    p5_tasks = [
        ("Серверный узел DigitalOcean (178.128.199.28)", "2 vCPU, 4.0 ГБ RAM, 2.0 ГБ Swap, 24 ГБ NVMe SSD. Свободно RAM: 2.0+ ГБ (60% запас производительности).", 2),
        ("Пул процессов PM2: 16 активных демонов", "affiliate-dashboard, affiliate-scheduler, affiliate-health-monitor, affiliate-telegram-bot, affiliate-autopilot, affiliate-telegram-userbot, affiliate-social-syndicator, affiliate-pinterest-publisher, affiliate-twitter-publisher, affiliate-support-monitor, affiliate-admitad-daemon, affiliate-autonomous-agent, affiliate-reddit-scout, affiliate-fleet-commander, affiliate-promoradar-worker, cj-promoradar-sync.", 2),
        ("Ночной бэкап баз SQLite (03:00 UTC)", "Полный автоматический дамп content_queue.sqlite и tg_leads.db в архив резервных копий.", 2),
        ("Панель управления операциями (:3456)", "Nginx обратный прокси, systemd-демон с автоматическим перезапуском и закрытая регистрация.", 2)
    ]
    for tidx, (t_title, t_desc, b_idx) in enumerate(p5_tasks):
        cur_t = now_str()
        cur.execute("""
            INSERT INTO tasks (title, description, project_id, done, done_at, `index`, priority, created, updated, created_by_id)
            VALUES (?, ?, ?, 1, ?, ?, 3, ?, ?, ?)
        """, (t_title, t_desc, p5_id, cur_t, tidx + 1, cur_t, cur_t, owner_id))
        tid = cur.lastrowid
        cur.execute("UPDATE project_task_counters SET last_index = ? WHERE project_id = ?", (tidx + 1, p5_id))
        cur.execute("INSERT INTO task_buckets (bucket_id, task_id, project_view_id) VALUES (?, ?, ?)", (p5_bids[b_idx], tid, p5_kanban_id))
        cur.execute("INSERT INTO task_positions (task_id, project_view_id, position) VALUES (?, ?, ?)", (tid, p5_kanban_id, (tidx + 1) * 100.0))
        cur.execute("INSERT INTO task_assignees (task_id, user_id, created) VALUES (?, ?, ?)", (tid, owner_id, cur_t))
        if "PM2 Демон" in lbl_map:
            cur.execute("INSERT INTO label_tasks (task_id, label_id, created) VALUES (?, ?, ?)", (tid, lbl_map["PM2 Демон"], cur_t))

    conn.commit()
    conn.close()
    print("\n🎉 ВСЕ 5 ПРОЕКТОВ И 29 МАГАЗИНОВ УСПЕШНО РУСИФИЦИРОВАНЫ И СТРУКТУРИРОВАНЫ!")

if __name__ == '__main__':
    populate()
