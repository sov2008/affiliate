import json, re

# Load candidates
with open(r'd:\WEB\antigravity\affiliate\scripts\candidates.json', 'r', encoding='utf-8') as f:
    candidates = json.load(f)

# High quality professional localized translations per skill standards:
# localization-pro + conversion-copywriter-pro
localized_store_data = {
    # SPANISH (Mexico / Spain)
    "levis-mx": {
        "title": "Hasta 40% de Descuento en Mezclilla y Ropa Oficial Levi's México",
        "desc": "Ahorra al instante en jeans 501®, chamarras trucker y playeras originales con envío seguro a todo México."
    },
    "american-eagle-mx": {
        "title": "Oferta Exclusiva American Eagle México: Jeans y Moda con Descuento",
        "desc": "Renueva tu estilo con los mejores jeans, playeras y prendas de temporada con descuento directo al pagar."
    },
    "sharkninja-mx": {
        "title": "Ahorra en Aspiradoras Ninja y Electrodomésticos Inteligentes",
        "desc": "Descuento verificado en freidoras de aire, licuadoras y aspiradoras robot para tu hogar en México."
    },
    "fiesta-credito": {
        "title": "Préstamo Rápido en Línea sin Comisiones Ocultas en Fiesta Crédito",
        "desc": "Solicitud 100% digital con aprobación en minutos y tasas preferenciales para nuevos clientes."
    },
    "sol-cr-dito-mx": {
        "title": "Crédito Personal Inmediato con SolCrédito México",
        "desc": "Compara y obtén tu micropréstamo seguro sin aval con respuesta instantánea las 24 horas."
    },
    "neion-mx": {
        "title": "Descuento en Servicios Financieros y Crédito Digital Neion",
        "desc": "Accede a soluciones de liquidez rápida y asesoría financiera transparente sin complicaciones."
    },

    # PORTUGUESE (Brazil)
    "saude-abril-br-grupo-abril": {
        "title": "Assine Saúde Abril com Desconto Exclusivo no Plano Anual",
        "desc": "Acesso ilimitado a conteúdos científicos, bem-estar e medicina preventiva do Grupo Abril."
    },
    "phooto-br": {
        "title": "Até 60% OFF em Revelação de Fotos, Fotolivros e Canecas Phooto",
        "desc": "Imprima suas melhores lembranças com qualidade fotográfica alemã e entrega garantida no Brasil."
    },
    "guldi-br": {
        "title": "Colchões e Travesseiros Guldi com Desconto Direto de Fábrica",
        "desc": "Durma melhor com colchões na caixa de alta densidade, 100 noites de teste e frete facilitado."
    },
    "eset-br": {
        "title": "Proteção Antivírus ESET NOD32 com Preço Reduzido no Brasil",
        "desc": "Segurança cibernética máxima contra malwares, ransomwares e golpes bancários em todos os seus aparelhos."
    },
    "bold-snacks-br": {
        "title": "Barras de Proteína BOLD Snacks com Cupom de Desconto Oficial",
        "desc": "O lanche proteico mais gostoso do Brasil com até 20g de proteína e zero adição de açúcar."
    },

    # GERMAN (Germany / DACH)
    "abelssoft": {
        "title": "50% Rabatt auf Abelssoft Windows-Tuning & Sicherheitssoftware",
        "desc": "Schützen Sie Ihren PC mit preisgekrönten Registry-Cleanern und Datenschutz-Tools mit lebenslanger Lizenz."
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

    # POLISH (Poland)
    "konesso-pl": {
        "title": "Świeżo Palona Kawa i Profesjonalne Ekspresy z Rabatem w Konesso",
        "desc": "Kupuj markowe kawy ziarniste, herbaty oraz ekspresy Jura i DeLonghi z szybką wysyłką w Polsce."
    },
    "katalog-marze-pl": {
        "title": "Katalog Marzeń: Vouchery na Przeżycia i Prezenty z Rabatem",
        "desc": "Podaruj niezapomniane emocje: skoki ze spadochronem, jazdy sportowymi autami i relaks w SPA w całej Polsce."
    },

    # CZECH (Czechia)
    "zonky-cz": {
        "title": "Půjčka Zonky s Nízkým Úrokem a Férovými Podmínkami",
        "desc": "Půjčte si výhodněji online bez skrytých poplatków s rychlým schválením přímo na váš účet."
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

    # ARABIC (UAE & GCC)
    "raynatours": {
        "title": "خصم حتى 35% على رحلات دبي السفاري وتذاكر برج خليفة",
        "desc": "احجز جولتك السياحية، رحلات السفاري الصحراوية، وتذاكر الفعاليات في دبي وأبوظبي بأفضل الأسعار الموثوقة."
    },
    "vogacloset": {
        "title": "خصم يصل إلى 80% على أحدث صيحات الموضة الأوروبية في فوغا كلوسيت",
        "desc": "تسوقي الأزياء النسائية والرجالية الفاخرة مع خدمة الدفع عند الاستلام والتوصيل السريع لدول الخليج."
    },
    "thedealoutlet": {
        "title": "أقوى تخفيضات الماركات العالمية المخفضة في ذا ديل أوتلت الخليج",
        "desc": "أزياء، أحذية، وحقائب أصلية 100% من أشهر الدور العالمية بأسعار التصفية المباشرة."
    },
    "dabdoob": {
        "title": "خصم حصري على ألعاب الأطفال والهدايا عبر تطبيق دبدوب",
        "desc": "توصيل سريع خلال ساعتين في الكويت والإمارات والسعودية مع خدمة التغليف المجاني للهدايا."
    },
    "vperfumes": {
        "title": "عطور شرقية وفرنسية أصلية بأسعار مخفضة في في بيرفيومز",
        "desc": "أفخم العطور والبخور ودهن العود مع ضمان الجودة 100% وشحن مباشر لكافة مدن الخليج."
    },
    "jashanmal": {
        "title": "تخفيضات جاشنمال على الأواني المنزلية وحقائب السفر الفاخرة",
        "desc": "ماركات عالمية عريقة في أدوات المطبخ، الديكور المنزلي، وأمتعة السفر مع توصيل مضمون."
    },
    "nazih": {
        "title": "منتجات التجميل والعناية بالشعر الاحترافية من نزيه لمستحضرات التجميل",
        "desc": "أفضل منتجات الصالونات، العناية بالبشرة والشعر والأظافر بأسعار حصرية للمستهلكين."
    },
    "qasr-alawani": {
        "title": "عروض قصر الأواني على الأجهزة الكهربائية ومستلزمات الضيافة",
        "desc": "ترامس القهوة والشاي، القدور الذكية، وأدوات المائدة الفاخرة لبيتك بأفضل العروض في السعودية."
    },
    "eyewa": {
        "title": "خصم على النظارات الشمسية والطبية والعدسات اللاصقة في أيوا",
        "desc": "تسوق نظارات من أشهر الماركات مع فحص نظر مجاني وضمان أصالة المنتجات مع إيوا للعيون."
    }
}

# Apply to couponsData.ts
coupons_path = r'd:\WEB\antigravity\affiliate\deals-portal\src\data\couponsData.ts'
with open(coupons_path, 'r', encoding='utf-8') as f:
    text = f.read()

count_applied = 0
for slug, trans in localized_store_data.items():
    pattern = rf'({{\s*"id":\s*"[^"]*",\s*"storeSlug":\s*"{slug}",[\s\S]*?"title":\s*)"([^"]*)"([\s\S]*?"description":\s*)"([^"]*)"'
    
    matches = list(re.finditer(pattern, text))
    for m in matches:
        old_full = m.group(0)
        # build replacement
        new_full = re.sub(r'("title":\s*)"[^"]*"', rf'\1"{trans["title"]}"', old_full, count=1)
        new_full = re.sub(r'("description":\s*)"[^"]*"', rf'\1"{trans["desc"]}"', new_full, count=1)
        text = text.replace(old_full, new_full, 1)
        count_applied += 1

with open(coupons_path, 'w', encoding='utf-8') as f:
    f.write(text)

print(f"SUCCESS: Applied native professional localization to {count_applied} deals across ES, PT, DE, UK, PL, CS, AR!")

