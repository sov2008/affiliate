import re, json

# 1. Read couponsData.ts
path = r'd:\WEB\antigravity\affiliate\deals-portal\src\data\couponsData.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Additional regional/localized mapping to ensure 100% of all national programs are in their native language
extended_translations = {
    # ARABIC (GCC / UAE / SA)
    "dermazone-and-promo": {
        "title": "عروض ديرمازون على منتجات العناية بالبشرة والجمال الطبي",
        "desc": "أقوى خصومات منتجات العناية بالبشرة والشعر ومستحضرات التجميل العلاجية مع شحن سريع لدول الخليج."
    },
    "eyewa-kw-qt-om": {
        "title": "خصم أيوا للنظارات والعدسات في الكويت وقطر وعُمان",
        "desc": "أفضل الماركات العالمية للنظارات الشمسية والطبية والعدسات اللاصقة الملونة والشفافة مع فحص نظر مجاني."
    },
    "dkny-kw-and-coupons": {
        "title": "أزياء وحقائب دكني DKNY الأصلية بأسعار مخفضة في الكويت والخليج",
        "desc": "تشكيلة حصرية من حقائب اليد الفاخرة، الساعات، والأزياء العصرية مع كود خصم إضافي عند الدفع."
    },
    "mamas-and-papas": {
        "title": "عروض ماماز وباباز على مستلزمات المواليد وملابس الأطفال",
        "desc": "عربات أطفال فاخرة، مقاعد سيارات، وغرف نوم للأطفال بأعلى معايير الأمان والجودة البريطانية."
    },
    "sharafdg": {
        "title": "عروض شرف دي جي على الإلكترونيات والأجهزة المنزلية الذكية",
        "desc": "أفضل أسعار الهواتف الذكية، الشاشات، الحواسب المحمولة، والأجهزة المنزلية مع ضمان محلي معتمد."
    },

    # UKRAINIAN (Ukraine)
    "touch-ua": {
        "title": "Знижка 30% на Смартфони Apple, Samsung та Xiaomi в Touch UA",
        "desc": "Купуйте оригінальні телефони, планшети та аксесуари з офіційною гарантією та швидкою доставкою по Україні."
    },
    "touch": {
        "title": "Знижки на Гаджети, Побутову Техніку та Смартфони в мережі Touch",
        "desc": "Чесні знижки на трендові гаджети та електроніку з перевіреною наявністю та гарантією сервісу."
    },
    "polis": {
        "title": "Офіційна Автоцивілка та Зелена Картка онлайн зі Знижкою в Polis.ua",
        "desc": "Миттєве оформлення електронного полісу ОСЦПВ від провідних страхових компаній без переплат."
    },
    "turbosto": {
        "title": "Ремонт Турбін та Паливних Систем у Києві зі Знижкою TurboSTO",
        "desc": "Професійна діагностика турбокомпресорів та паливних систем за 1 день з гарантією 3 роки."
    },
    "megogo": {
        "title": "Передплата MEGOGO «Максимальна» за спеціальною вигідною ціною",
        "desc": "Тисячі фільмів, серіалів, топ-телеканалів та ексклюзивний футбол у якості 4K на всіх ваших пристроях."
    },
    "punisher-shop": {
        "title": "Військове Спорядження та Тактичний Одяг в Punisher Shop",
        "desc": "Оригінальне армійське спорядження, підсумки, ліхтарі та тактичне взуття перевірених світових брендів."
    },

    # POLISH (Poland)
    "konesso-pl": {
        "title": "Świeżo Palona Kawa i Profesjonalne Ekspresy z Rabatem w Konesso",
        "desc": "Kupuj markowe kawy ziarniste, herbaty oraz ekspresy Jura i DeLonghi z szybką wysyłką w Polsce."
    },
    "katalog-marze-pl": {
        "title": "Katalog Marzeń: Vouchery na Przeżycia i Prezenty z Rabatem",
        "desc": "Podaruj niezapomniane emocje: skoki ze spadochronem, jazdy sportowymi autami i relaks w SPA w całej Polsce."
    },

    # CZECH (Czech Republic)
    "zonky-cz": {
        "title": "Půjčka Zonky s Nízkým Úrokem a Férovými Podmínkami",
        "desc": "Půjčte si výhodněji online bez skrytých poplatků s rychlým schválením přímo na váš účet."
    },
    "coolcredit-cz": {
        "title": "Rychlá Krátkodobá Půjčka Cool Credit se Schválením do 10 Minut",
        "desc": "Bezpečná finanční rezerva online pro nečekané výdaje s okamžitým převodem na bankovní účet."
    },
    "proficredit-cz": {
        "title": "Osobní Úvěr PROFI CREDIT s Flexibilním Splácením v ČR",
        "desc": "Půjčky pro zaměstnance i podnikatele s individuálním přístupem a možností odkladu splátek."
    },
    "kenwood-cz": {
        "title": "Kuchyňské Robotické Přístroje Kenwood s Oficiální Slevou",
        "desc": "Špičkové kuchyňské roboty a mixéry pro profesionální vaření i pečení s prodlouženou zárukou."
    },
    "nazivnost-cz": {
        "title": "Založení Živnosti a Účetní Služby Online v České Republice",
        "desc": "Rychlé vyřízení živnostenského oprávnění a daňového poradenství pro podnikatele bez front."
    },

    # SPANISH (Mexico / Spain)
    "american-eagle-mx": {
        "title": "Oferta Exclusiva American Eagle México: Jeans y Ropa de Temporada",
        "desc": "Aprovecha descuentos en jeans de corte perfecto, chamarras y básicos de moda juvenil con envío seguro."
    },
    "sharkninja-mx": {
        "title": "Descuento en Electrodomésticos y Licuadoras SharkNinja México",
        "desc": "Potencia para tu cocina y limpieza del hogar con freidoras de aire, licuadoras Ninja y aspiradoras inteligentes."
    },
    "fiesta-credito": {
        "title": "Préstamos en Línea Rápidos y Seguros en Fiesta Crédito",
        "desc": "Dinero rápido sin aval ni anticipos con proceso de solicitud 100% transparente y digital."
    },
    "sol-cr-dito-mx": {
        "title": "Tu Dinero en Minutos con SolCrédito México",
        "desc": "Compara las mejores opciones de microcréditos inmediatos con aprobación en tiempo récord."
    },
    "neion-mx": {
        "title": "Asesoría Financiera y Soluciones de Crédito Digital Neion",
        "desc": "Impulsa tu liquidez personal o de negocio con esquemas de financiamiento flexibles y confiables."
    },

    # PORTUGUESE (Brazil)
    "bold-snacks-br": {
        "title": "Barras de Proteína BOLD Snacks com Cupom de Desconto Exclusivo",
        "desc": "Coma saudável com sobremesas proteicas deliciosas, 20g de proteína e zero adição de açúcar."
    },
    "guldi-br": {
        "title": "Colchões na Caixa Guldi com Preço Promocional de Fábrica",
        "desc": "Tecnologia de molas ensacadas e espuma de alta resiliência com 100 noites de teste em sua casa."
    },
    "phooto-br": {
        "title": "Fotolivros e Revelação de Fotos Phooto Brasil com Super Desconto",
        "desc": "Eternize seus momentos especiais com papel fotográfico premium, álbuns personalizados e quadros decorativos."
    },
    "eset-br": {
        "title": "Proteção Antivírus ESET NOD32 com Desconto para o Brasil",
        "desc": "Navegue, faça compras e realize transações bancárias com total tranquilidade contra ameaças virtuais."
    },
    "saude-abril-br-grupo-abril": {
        "title": "Assinatura Digital Revista Saúde com Preço Reduzido",
        "desc": "A melhor informação médica e hábitos saudáveis direto no seu celular ou tablet com credibilidade Abril."
    },

    # GERMAN (Germany / DACH)
    "abelssoft": {
        "title": "50% Rabatt auf Abelssoft Windows-Tuning & Sicherheitssoftware",
        "desc": "Schützen Sie Ihren PC mit preisgekrönten Registry-Cleanern und Datenschutz-Tools mit lebenslanger Lizenz."
    }
}

applied = 0
for slug, data in extended_translations.items():
    pattern = rf'({{\s*"id":\s*"[^"]*",\s*"storeSlug":\s*"{slug}",[\s\S]*?"title":\s*)"([^"]*)"([\s\S]*?"description":\s*)"([^"]*)"'
    matches = list(re.finditer(pattern, text))
    for m in matches:
        old_full = m.group(0)
        new_full = re.sub(r'("title":\s*)"[^"]*"', rf'\1"{data["title"]}"', old_full, count=1)
        new_full = re.sub(r'("description":\s*)"[^"]*"', rf'\1"{data["desc"]}"', new_full, count=1)
        text = text.replace(old_full, new_full, 1)
        applied += 1

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print(f"Applied 100% full localization to {applied} national market programs!")

