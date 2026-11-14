import { UI_TRANSLATIONS, LOCALES } from './ui';

let regionalDealTranslationsCache: Record<string, Record<string, { title: string; description: string; badge?: string }>> | null = null;
let isFetchingTranslations = false;

async function getRegionalDealTranslations() {
  if (regionalDealTranslationsCache) return regionalDealTranslationsCache;
  if (isFetchingTranslations) {
    await new Promise((r) => setTimeout(r, 200));
    if (regionalDealTranslationsCache) return regionalDealTranslationsCache;
  }
  isFetchingTranslations = true;
  try {
    const res = await fetch('/data/deal-translations.json');
    if (res.ok) {
      regionalDealTranslationsCache = await res.json();
    }
  } catch (_) {}
  finally {
    isFetchingTranslations = false;
  }
  return regionalDealTranslationsCache || {};
}

// Extended Multilingual phrase dictionary for all common portal strings
export const EXTENDED_DICTIONARY: Record<string, Record<string, string>> = {
  // Navigation & Category Filters
  "All Deals": {
    ar: "جميع العروض",
    es: "Todas las Ofertas",
    pt: "Todas as Ofertas",
    de: "Alle Angebote",
    ua: "Всі знижки",
    pl: "Wszystkie okazje",
    cs: "Všechny nabídky"
  },
  "Black Friday Deals": {
    ar: "عروض الجمعة السوداء",
    es: "Ofertas de Black Friday",
    pt: "Ofertas de Black Friday",
    de: "Black Friday Angebote",
    ua: "Знижки Black Friday",
    pl: "Okazje Black Friday",
    cs: "Nabídky Black Friday"
  },
  "Privacy & VPN": {
    ar: "الخصوصية والشبكات الافتراضية",
    es: "Privacidad y VPN",
    pt: "Privacidade e VPN",
    de: "Datenschutz & VPN",
    ua: "Безпека та VPN",
    pl: "Prywatność i VPN",
    cs: "Soukromí a VPN"
  },
  "Gaming & Software": {
    ar: "الألعاب والبرمجيات",
    es: "Juegos y Software",
    pt: "Jogos e Software",
    de: "Gaming & Software",
    ua: "Ігри та Програми",
    pl: "Gry i Oprogramowanie",
    cs: "Hry a Software"
  },
  "Home & Living": {
    ar: "المنزل والمعيشة",
    es: "Hogar y Decoración",
    pt: "Casa e Decoração",
    de: "Wohnen & Haushalt",
    ua: "Дім та Інтер'єр",
    pl: "Dom i Wnętrze",
    cs: "Dům a Bydlení"
  },
  "Fashion & Apparel": {
    ar: "الأزياء والملابس",
    es: "Moda y Ropa",
    pt: "Moda e Roupas",
    de: "Mode & Kleidung",
    ua: "Мода та Одяг",
    pl: "Moda i Odzież",
    cs: "Móda a Oblečení"
  },
  "Travel & Stays": {
    ar: "السفر والإقامات",
    es: "Viajes y Hoteles",
    pt: "Viagens e Hospedagem",
    de: "Reisen & Hotels",
    ua: "Подорожі та Готелі",
    pl: "Podróże i Pobyt",
    cs: "Cestování a Pobyty"
  },
  "Electronics & Power": {
    ar: "الإلكترونيات والطاقة",
    es: "Electrónica y Energía",
    pt: "Eletrônicos e Energia",
    de: "Elektronik & Strom",
    ua: "Електроніка та Живлення",
    pl: "Elektronika i Zasilanie",
    cs: "Elektronika a Napájení"
  },
  "Auto & Dashcams": {
    ar: "السيارات وكاميرات القيادة",
    es: "Auto y Cámaras",
    pt: "Automotivo e Câmeras",
    de: "Auto & Dashcams",
    ua: "Авто та Відеореєстратори",
    pl: "Auto i Kamery",
    cs: "Auto a Palubní kamery"
  },
  "Food & Nutrition": {
    ar: "الأغذية والتغذية",
    es: "Alimentos y Nutrición",
    pt: "Alimentos e Nutrição",
    de: "Essen & Ernährung",
    ua: "Їжа та Харчування",
    pl: "Żywność i Suplementy",
    cs: "Jídlo a Výživa"
  },
  "E-Commerce & B2B": {
    ar: "التجارة الإلكترونية والجملة",
    es: "Comercio Electrónico y B2B",
    pt: "Comércio Eletrônico e B2B",
    de: "E-Commerce & B2B",
    ua: "E-Commerce та Опт",
    pl: "E-Commerce i B2B",
    cs: "E-Commerce a B2B"
  },
  "Browse Verified Brands:": {
    ar: "تصفح المتاجر المعتمدة:",
    es: "Explorar Marcas Verificadas:",
    pt: "Explorar Marcas Verificadas:",
    de: "Geprüfte Marken durchsuchen:",
    ua: "Переглянути перевірені бренди:",
    pl: "Przeglądaj sprawdzone marki:",
    cs: "Procházet ověřené značky:"
  },
  "Target Region": {
    ar: "المنطقة المستهدفة",
    es: "Región de Destino",
    pt: "Região Alvo",
    de: "Zielregion",
    ua: "Цільовий регіон",
    pl: "Region docelowy",
    cs: "Cílový region"
  },
  "Worldwide": {
    ar: "حول العالم",
    es: "Todo el Mundo",
    pt: "Mundial",
    de: "Weltweit",
    ua: "Увесь світ",
    pl: "Cały świat",
    cs: "Celosvětově"
  },
  "United States": {
    ar: "الولايات المتحدة",
    es: "Estados Unidos",
    pt: "Estados Unidos",
    de: "Vereinigte Staaten",
    ua: "Сполучені Штати",
    pl: "Stany Zjednoczone",
    cs: "Spojené státy"
  },
  "Europe": {
    ar: "أوروبا",
    es: "Europa",
    pt: "Europa",
    de: "Europa",
    ua: "Європа",
    pl: "Europa",
    cs: "Evropa"
  },
  "UAE & GCC": {
    ar: "الإمارات والخليج",
    es: "EAU y Países del Golfo",
    pt: "EAU e Países do Golfo",
    de: "VAE & Golfregion",
    ua: "ОАЕ та Країни Затоки",
    pl: "ZEA i Kraje Zatoki",
    cs: "SAE a Záliv"
  },
  "Ukraine": {
    ar: "أوكرانيا",
    es: "Ucrania",
    pt: "Ucrânia",
    de: "Ukraine",
    ua: "Україна",
    pl: "Ukraina",
    cs: "Ukrajina"
  },
  "United Kingdom": {
    ar: "المملكة المتحدة",
    es: "Reino Unido",
    pt: "Reino Unido",
    de: "Großbritannien",
    ua: "Велика Британія",
    pl: "Wielka Brytania",
    cs: "Velká Británie"
  },
  "India": {
    ar: "الهند",
    es: "India",
    pt: "Índia",
    de: "Indien",
    ua: "Індія",
    pl: "Indie",
    cs: "Indie"
  },
  "Mexico": {
    ar: "المكسيك",
    es: "México",
    pt: "México",
    de: "Mexiko",
    ua: "Мексика",
    pl: "Meksyk",
    cs: "Mexiko"
  },
  "Brazil": {
    ar: "البرازيل",
    es: "Brasil",
    pt: "Brasil",
    de: "Brasilien",
    ua: "Бразилія",
    pl: "Brazylia",
    cs: "Brazílie"
  },
  "Czechia": {
    ar: "التشيك",
    es: "Chequia",
    pt: "Tchéquia",
    de: "Tschechien",
    ua: "Чехія",
    pl: "Czechy",
    cs: "Česko"
  },
  "Poland": {
    ar: "بولندا",
    es: "Polonia",
    pt: "Polônia",
    de: "Polen",
    ua: "Польща",
    pl: "Polska",
    cs: "Polsko"
  },
  "Available Languages": {
    ar: "اللغات المتاحة",
    es: "Idiomas Disponibles",
    pt: "Idiomas Disponíveis",
    de: "Verfügbare Sprachen",
    ua: "Доступні мови",
    pl: "Dostępne języki",
    cs: "Dostupné jazyky"
  },
  "Curated Merchant Spotlight": {
    ar: "عروض الشركاء المختارة",
    es: "Selección Destacada de Socios",
    pt: "Destaques Curados de Parceiros",
    de: "Ausgewählte Partner-Angebote",
    ua: "Вибір редакції та партнерів",
    pl: "Polecane Oferty Partnerskie",
    cs: "Vybrané partnerské nabídky"
  },
  "Verified Feeds": {
    ar: "تغذية موثوقة",
    es: "Feeds Verificados",
    pt: "Feeds Verificados",
    de: "Geprüfte Feeds",
    ua: "Перевірені канали",
    pl: "Sprawdzone źródła",
    cs: "Ověřené kanály"
  },
  "Top-performing promotions, seasonal drops, and verified in-stock gear": {
    ar: "أفضل العروض والخصومات الموسمية والمنتجات المتوفرة",
    es: "Promociones destacadas, rebajas de temporada y artículos en stock",
    pt: "Promoções de alto desempenho, lançamentos sazonais e itens em estoque",
    de: "Top-Aktionen, saisonale Rabatte und geprüfte Produkte auf Lager",
    ua: "Найкращі акції, сезонні знижки та перевірені товари в наявності",
    pl: "Najlepsze promocje, rabaty sezonowe i sprawdzony asortyment w magazynie",
    cs: "Nejlepší akce, sezónní slevy a ověřené zboží skladem"
  },
  "Expiring Soon": {
    ar: "تنتهي قريباً",
    es: "Termina Pronto",
    pt: "Termina em Breve",
    de: "Endet bald",
    ua: "Закінчується скоро",
    pl: "Wkrótce koniec",
    cs: "Brzy vyprší"
  },
  "In-Stock Gear": {
    ar: "منتجات متوفرة",
    es: "Equipamiento en Stock",
    pt: "Itens em Estoque",
    de: "Verfügbare Artikel",
    ua: "Товари в наявності",
    pl: "Dostępne produkty",
    cs: "Zboží skladem"
  },
  "Seasonal & Night-Ops": {
    ar: "عروض موسمية",
    es: "Ofertas de Temporada",
    pt: "Ofertas de Temporada",
    de: "Saisonale Deals",
    ua: "Сезонні пропозиції",
    pl: "Oferty sezonowe",
    cs: "Sezónní nabídky"
  },
  "Software Utilities": {
    ar: "برمجيات وأدوات",
    es: "Utilidades de Software",
    pt: "Utilitários de Software",
    de: "Software-Tools",
    ua: "Програми та Утиліти",
    pl: "Oprogramowanie użytkowe",
    cs: "Softwarové nástroje"
  },
  "Frequently Asked Questions": {
    ar: "الأسئلة الشائعة",
    es: "Preguntas Frecuentes",
    pt: "Perguntas Frequentes",
    de: "Häufig gestellte Fragen",
    ua: "Часті запитання",
    pl: "Często Zadawane Pytania",
    cs: "Často kladené otázky"
  },
  "Claim": {
    ar: "تفعيل",
    es: "Reclamar",
    pt: "Ativar",
    de: "Sichern",
    ua: "Забрати",
    pl: "Odbierz",
    cs: "Získat"
  },
  "Get Discount": {
    ar: "احصل على الخصم",
    es: "Obtener Descuento",
    pt: "Obter Desconto",
    de: "Rabatt sichern",
    ua: "Отримати знижку",
    pl: "Odbierz rabat",
    cs: "Získat slevu"
  },
  "Store →": {
    ar: "المتجر ←",
    es: "Tienda →",
    pt: "Loja →",
    de: "Shop →",
    ua: "Магазин →",
    pl: "Sklep →",
    cs: "Obchod →"
  },
  "Category →": {
    ar: "الفئة ←",
    es: "Categoría →",
    pt: "Categoria →",
    de: "Kategorie →",
    ua: "Категорія →",
    pl: "Kategoria →",
    cs: "Kategorie →"
  },
  "Redeem →": {
    ar: "استخدام ←",
    es: "Canjear →",
    pt: "Resgatar →",
    de: "Einlösen →",
    ua: "Використати →",
    pl: "Wykorzystaj →",
    cs: "Uplatnit →"
  },
  "Search Suggestions": {
    ar: "اقتراحات البحث",
    es: "Sugerencias de Búsqueda",
    pt: "Sugestões de Busca",
    de: "Suchvorschläge",
    ua: "Підказки пошуку",
    pl: "Podpowiedzi wyszukiwania",
    cs: "Návrhy vyhledávání"
  },
  "Stores & Brands": {
    ar: "المتاجر والعلامات التجارية",
    es: "Tiendas y Marcas",
    pt: "Lojas e Marcas",
    de: "Shops & Marken",
    ua: "Магазини та Бренди",
    pl: "Sklepy i Marki",
    cs: "Obchody a Značky"
  },
  "Categories": {
    ar: "الفئات",
    es: "Categorías",
    pt: "Categorias",
    de: "Kategorien",
    ua: "Категорії",
    pl: "Kategorie",
    cs: "Kategorie"
  },
  "Matching Promo Codes": {
    ar: "أكواد الخصم المطابقة",
    es: "Códigos de Descuento Coincidentes",
    pt: "Cupons Coincidentes",
    de: "Passende Gutscheincodes",
    ua: "Знайдені промокоди",
    pl: "Dopasowane kody rabatowe",
    cs: "Odpovídající promo kódy"
  },
  "ESC to close": {
    ar: "اضغط ESC للإغلاق",
    es: "ESC para cerrar",
    pt: "ESC para fechar",
    de: "ESC zum Schließen",
    ua: "ESC щоб закрити",
    pl: "ESC aby zamknąć",
    cs: "ESC pro zavření"
  },
  "View all matching results in catalog ↓": {
    ar: "عرض جميع النتائج المطابقة في الدليل ↓",
    es: "Ver todos los resultados coincidentes en el catálogo ↓",
    pt: "Ver todos os resultados no catálogo ↓",
    de: "Alle passenden Ergebnisse im Katalog ansehen ↓",
    ua: "Переглянути всі знайдені пропозиції в каталозі ↓",
    pl: "Zobacz wszystkie pasujące oferty w katalogu ↓",
    cs: "Zobrazit všechny odpovídající nabídky v katalogu ↓"
  },
  "No matching stores or promo codes found.": {
    ar: "لم يتم العثور على متاجر أو أكواد خصم مطابقة.",
    es: "No se encontraron tiendas ni códigos coincidentes.",
    pt: "Nenhuma loja ou cupom encontrado.",
    de: "Keine passenden Shops oder Gutscheincodes gefunden.",
    ua: "Не знайдено відповідних магазинів або промокодів.",
    pl: "Nie znaleziono pasujących sklepów ani kodów.",
    cs: "Nenalezeny žádné odpovídající obchody ani kupóny."
  },
  "Load More Offers": {
    ar: "تحميل المزيد من العروض",
    es: "Cargar Más Ofertas",
    pt: "Carregar Mais Ofertas",
    de: "Mehr Angebote laden",
    ua: "Показати більше знижок",
    pl: "Załaduj więcej ofert",
    cs: "Načíst další nabídky"
  },

  // Navigation & Mega-menus
  "Popular Stores": {
    ar: "المتاجر الشائعة",
    es: "Tiendas Populares",
    pt: "Lojas Populares",
    de: "Beliebte Shops",
    ua: "Популярні Магазини",
    pl: "Popularne Sklepy",
    cs: "Populární Obchody"
  },
  "View All →": {
    ar: "عرض الكل ←",
    es: "Ver todo →",
    pt: "Ver tudo →",
    de: "Alle ansehen →",
    ua: "Всі магазини →",
    pl: "Pokaż wszystko →",
    cs: "Zobrazit vše →"
  },
  "Explore →": {
    ar: "استكشف ←",
    es: "Explorar →",
    pt: "Explorar →",
    de: "Entdecken →",
    ua: "Докладніше →",
    pl: "Odkryj →",
    cs: "Prozkoumat →"
  },
  "All Categories →": {
    ar: "جميع الفئات ←",
    es: "Todas las categorías →",
    pt: "Todas as categorias →",
    de: "Alle Kategorien →",
    ua: "Всі категорії →",
    pl: "Wszystkie kategorie →",
    cs: "Všechny kategorie →"
  },
  "Browse Directory": {
    ar: "تصفح الدليل",
    es: "Ver Directorio",
    pt: "Explorar Diretório",
    de: "Katalog durchsuchen",
    ua: "Переглянути каталог",
    pl: "Przeglądaj katalog",
    cs: "Procházet katalog"
  },
  "All codes verified today": {
    ar: "تم التحقق من جميع الكوبونات اليوم",
    es: "Todos los códigos verificados hoy",
    pt: "Todos os cupons verificados hoje",
    de: "Alle Gutscheine heute geprüft",
    ua: "Всі промокоди перевірено сьогодні",
    pl: "Wszystkie kody sprawdzone dzisiaj",
    cs: "Všechny kódy dnes ověřeny"
  },
  "Active coupon feeds": {
    ar: "تغذية الكوبونات المباشرة",
    es: "Feeds de cupones activos",
    pt: "Feeds de cupons ativos",
    de: "Aktive Gutschein-Feeds",
    ua: "Активні канали знижок",
    pl: "Aktywne kupony",
    cs: "Aktivní nabídky slev"
  },
  "Top Partner Stores": {
    ar: "أفضل المتاجر الشريكة",
    es: "Tiendas Asociadas Destacadas",
    pt: "Principais Lojas Parceiras",
    de: "Top Partner-Shops",
    ua: "Топ партнерських магазинів",
    pl: "Najlepsze Sklepy Partnerskie",
    cs: "Nejlepší Partnerské Obchody"
  },

  // Hero Section & Search
  "Find Deals": {
    ar: "ابحث عن العروض",
    es: "Buscar Ofertas",
    pt: "Buscar Ofertas",
    de: "Angebote finden",
    ua: "Знайти знижки",
    pl: "Szukaj okazji",
    cs: "Najít nabídky"
  },
  "Verified Promo Codes & Active Vouchers": {
    ar: "أكواد الخصم الموثوقة والقسائم النشطة",
    es: "Códigos Promocionales y Cupones Verificados",
    pt: "Códigos Promocionais e Cupons Verificados",
    de: "Geprüfte Gutscheincodes & Aktive Vouchers",
    ua: "Перевірені промокоди та активні купони",
    pl: "Sprawdzone kody rabatowe i aktywne kupony",
    cs: "Ověřené promo kódy a aktivní vouchery"
  },
  "Trending:": {
    ar: "شائع:",
    es: "Tendencia:",
    pt: "Em alta:",
    de: "Trends:",
    ua: "Популярне:",
    pl: "Popularne:",
    cs: "Trendy:"
  },
  "100% Tested Codes": {
    ar: "أكواد مجربة 100%",
    es: "Códigos 100% Probados",
    pt: "Cupons 100% Testados",
    de: "100% Getestete Codes",
    ua: "100% Перевірені коди",
    pl: "Kody w 100% sprawdzone",
    cs: "100% Testované kódy"
  },
  "Manual QA on checkout": {
    ar: "فحص يدوي أثناء الدفع",
    es: "Control de calidad en caja",
    pt: "Verificação manual no checkout",
    de: "Manuelle Prüfung an der Kasse",
    ua: "Ручна перевірка під час оплати",
    pl: "Ręczna weryfikacja w kasie",
    cs: "Ruční kontrola u pokladny"
  },
  "No Signup Needed": {
    ar: "لا يلزم التسجيل",
    es: "Sin Registro",
    pt: "Sem Cadastro",
    de: "Keine Anmeldung nötig",
    ua: "Без реєстрації",
    pl: "Bez rejestracji",
    cs: "Bez nutnosti registrace"
  },
  "1-click instant access": {
    ar: "وصول فوري بنقرة واحدة",
    es: "Acceso instantáneo en 1 clic",
    pt: "Acesso instantâneo em 1 clique",
    de: "Sofortiger Zugriff mit 1 Klick",
    ua: "Миттєвий доступ в 1 клік",
    pl: "Natychmiastowy dostęp za 1 kliknięciem",
    cs: "Okamžitý přístup jedním kliknutím"
  },
  "Official Partner": {
    ar: "شريك رسمي",
    es: "Socio Oficial",
    pt: "Parceiro Oficial",
    de: "Offizieller Partner",
    ua: "Офіційний партнер",
    pl: "Oficjalny Partner",
    cs: "Oficiální partner"
  },
  "Direct Partner links": {
    ar: "روابط الشركاء المباشرة",
    es: "Enlaces de afiliados directos",
    pt: "Links diretos de parceiros",
    de: "Direkte Partner-Links",
    ua: "Прямі партнерські посилання",
    pl: "Bezpośrednie linki partnerskie",
    cs: "Přímé partnerské odkazy"
  },

  // Deal of the Day & Badges
  "Deal of the Day": {
    ar: "عرض اليوم المميز",
    es: "Oferta del Día",
    pt: "Oferta do Dia",
    de: "Deal des Tages",
    ua: "Знижка дня",
    pl: "Okazja Dnia",
    cs: "Nabídka Dne"
  },
  "Verified Today": {
    ar: "تم التحقق اليوم",
    es: "Verificado hoy",
    pt: "Verificado hoje",
    de: "Heute geprüft",
    ua: "Перевірено сьогодні",
    pl: "Sprawdzono dzisiaj",
    cs: "Dnes ověřeno"
  },
  "Success Rate": {
    ar: "نسبة النجاح",
    es: "Tasa de Éxito",
    pt: "Taxa de Sucesso",
    de: "Erfolgsquote",
    ua: "Успішність",
    pl: "Skuteczność",
    cs: "Úspěšnost"
  },
  "All Offers →": {
    ar: "جميع العروض ←",
    es: "Todas las ofertas →",
    pt: "Todas as ofertas →",
    de: "Alle Angebote →",
    ua: "Всі пропозиції →",
    pl: "Wszystkie oferty →",
    cs: "Všechny nabídky →"
  },

  // Deal Card Action Buttons
  "Claim Deal": {
    ar: "تفعيل العرض",
    es: "Reclamar Cupón",
    pt: "Ativar Oferta",
    de: "Gutschein sichern",
    ua: "Активувати знижку",
    pl: "Odbierz rabat",
    cs: "Získat slevu"
  },
  "Get Deal": {
    ar: "احصل على العرض",
    es: "Obtener Oferta",
    pt: "Obter Oferta",
    de: "Deal sichern",
    ua: "Отримати знижку",
    pl: "Zdobądź rabat",
    cs: "Získat nabídku"
  },
  "Copy Code": {
    ar: "نسخ الكوبون",
    es: "Copiar Código",
    pt: "Copiar Código",
    de: "Code kopieren",
    ua: "Скопіювати код",
    pl: "Kopiuj kod",
    cs: "Kopírovat kód"
  },
  "In-Stock": {
    ar: "متوفر",
    es: "En Stock",
    pt: "Em Estoque",
    de: "Auf Lager",
    ua: "В наявності",
    pl: "W magazynie",
    cs: "Skladem"
  },
  "Buy Deal ↗": {
    ar: "شراء العرض ↗",
    es: "Comprar Oferta ↗",
    pt: "Comprar Oferta ↗",
    de: "Jetzt kaufen ↗",
    ua: "Купити знижку ↗",
    pl: "Kup okazję ↗",
    cs: "Koupit nabídku ↗"
  },
  "Buy Deal": {
    ar: "شراء العرض",
    es: "Comprar Oferta",
    pt: "Comprar Oferta",
    de: "Jetzt kaufen",
    ua: "Купити знижку",
    pl: "Kup okazję",
    cs: "Koupit nabídku"
  },

  // Saved Deals Modal
  "Your Saved Deals": {
    ar: "عروضك المحفوظة",
    es: "Tus Ofertas Guardadas",
    pt: "Seus Cupons Salvos",
    de: "Deine gemerkten Deals",
    ua: "Ваші збережені знижки",
    pl: "Twoje zapisane okazje",
    cs: "Vaše uložené nabídky"
  },
  "Bookmarked coupons and checkout vouchers for quick access": {
    ar: "الكوبونات المحفوظة لسهولة الوصول إليها أثناء الشراء",
    es: "Cupones guardados para acceso rápido al pagar",
    pt: "Cupons favoritados para acesso rápido no checkout",
    de: "Gespeicherte Gutscheine für schnellen Zugriff beim Bezahlen",
    ua: "Збережені промокоди та купони для швидкого доступу",
    pl: "Zapisane kupony ułatwiające zakupy",
    cs: "Uložené kupóny pro rychlý nákup"
  },
  "Clear All": {
    ar: "مسح الكل",
    es: "Borrar todo",
    pt: "Limpar tudo",
    de: "Alles löschen",
    ua: "Очистити все",
    pl: "Wyczyść wszystko",
    cs: "Vymazat vše"
  },
  "No Saved Deals Yet": {
    ar: "لا توجد عروض محفوظة بعد",
    es: "Aún no hay ofertas guardadas",
    pt: "Nenhum cupom salvo ainda",
    de: "Noch keine Deals gespeichert",
    ua: "Ще немає збережених знижок",
    pl: "Brak zapisanych okazji",
    cs: "Zatím žádné uložené slevy"
  },
  "Explore Verified Deals": {
    ar: "استكشف العروض الموثوقة",
    es: "Explorar Ofertas Verificadas",
    pt: "Explorar Ofertas Verificadas",
    de: "Geprüfte Deals entdecken",
    ua: "Переглянути перевірені знижки",
    pl: "Odkryj sprawdzone okazje",
    cs: "Prozkoumat ověřené nabídky"
  },
  "Scanning verified deals...": {
    ar: "جاري فحص العروض الموثوقة...",
    es: "Escaneando ofertas verificadas...",
    pt: "Escaneando ofertas verificadas...",
    de: "Geprüfte Angebote werden gescannt...",
    ua: "Сканування перевірених знижок...",
    pl: "Skanowanie sprawdzonych okazji...",
    cs: "Vyhledávání ověřených nabídek..."
  }
};

// Global text crawler and translator for comprehensive UI coverage
export function initClientI18n() {
  function applyLanguage(rawLang: string) {
    const lang = rawLang === 'uk' ? 'ua' : (rawLang || 'en');
    const t = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS['en'];
    const localeConfig = LOCALES[lang] || LOCALES['en'];

    // 1. Update HTML language and reading direction
    document.documentElement.lang = lang;
    document.documentElement.dir = localeConfig.dir || 'ltr';

    // 2. Direct data-i18n replacements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n') as keyof typeof t;
      if (key && t[key]) {
        el.textContent = t[key];
      }
    });

    // 3. Update Input Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder') as keyof typeof t;
      if (key && t[key]) {
        (el as HTMLInputElement).placeholder = t[key];
      }
    });

    // 4. Update Header Selected Language Flag & Code
    const flagEl = document.getElementById('headerSelectedLangFlag') as HTMLImageElement | null;
    const textEl = document.getElementById('headerSelectedLangText');
    if (flagEl) {
      flagEl.src = `/flags/${localeConfig.countryCode || 'us'}.svg`;
    }
    if (textEl) {
      textEl.textContent = localeConfig.code.toUpperCase();
    }

    // 5. Apply Deep UI Translation Dictionary (Translates static labels, buttons, hero prompts, badges)
    if (lang === 'en') {
      // Revert dynamic text to original English if stored
      document.querySelectorAll('[data-original-en]').forEach(el => {
        const orig = el.getAttribute('data-original-en');
        if (orig) el.textContent = orig;
      });
      return;
    }

    // Walk through registered dictionary items
    Object.entries(EXTENDED_DICTIONARY).forEach(([enText, transMap]) => {
      const translated = transMap[lang];
      if (!translated) return;

      // Match elements by exact trimmed text content
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const matchedNodes: Text[] = [];
      let currentNode = walker.nextNode();

      while (currentNode) {
        if (currentNode.nodeValue && currentNode.nodeValue.trim() === enText) {
          matchedNodes.push(currentNode as Text);
        }
        currentNode = walker.nextNode();
      }

      matchedNodes.forEach(textNode => {
        const parent = textNode.parentElement;
        if (!parent || parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE') return;

        if (!parent.hasAttribute('data-original-en')) {
          parent.setAttribute('data-original-en', enText);
        }
        textNode.nodeValue = textNode.nodeValue!.replace(enText, translated);
      });
    });

    // Translate dynamic card buttons and actions that might have child icons or tags
    document.querySelectorAll('.deal-grid-card button, .deal-grid-card a, .spotlight-expiring-card button').forEach(el => {
      const firstSpan = el.querySelector('span');
      if (firstSpan) {
        const text = firstSpan.textContent?.trim();
        if (text === 'Copy Code' && EXTENDED_DICTIONARY['Copy Code']?.[lang]) {
          if (!firstSpan.hasAttribute('data-original-en')) firstSpan.setAttribute('data-original-en', 'Copy Code');
          firstSpan.textContent = EXTENDED_DICTIONARY['Copy Code'][lang];
        } else if (text === 'Get Discount' && EXTENDED_DICTIONARY['Get Discount']?.[lang]) {
          if (!firstSpan.hasAttribute('data-original-en')) firstSpan.setAttribute('data-original-en', 'Get Discount');
          firstSpan.textContent = EXTENDED_DICTIONARY['Get Discount'][lang];
        } else if (text === 'Claim Deal' && EXTENDED_DICTIONARY['Claim Deal']?.[lang]) {
          if (!firstSpan.hasAttribute('data-original-en')) firstSpan.setAttribute('data-original-en', 'Claim Deal');
          firstSpan.textContent = EXTENDED_DICTIONARY['Claim Deal'][lang];
        }
      }
    });

    // 6. Streaming Localized Deal Cards (conversion-copywriter-pro & localization-pro)
    document.querySelectorAll('[data-deal-id]').forEach(card => {
      const dealId = card.getAttribute('data-deal-id');
      if (!dealId) return;

      const titleEl = card.querySelector('h3 a') || card.querySelector('h3');
      const descEl = card.querySelector('p');
      const badgeEl = card.querySelector('.deal-badge, span[class*="text-rose"], span[class*="rounded-xl"]');

      if (lang === 'en') {
        if (titleEl && titleEl.hasAttribute('data-orig-title')) {
          titleEl.textContent = titleEl.getAttribute('data-orig-title') || '';
        }
        if (descEl && descEl.hasAttribute('data-orig-desc')) {
          descEl.textContent = descEl.getAttribute('data-orig-desc') || '';
        }
        if (badgeEl && badgeEl.hasAttribute('data-orig-badge')) {
          badgeEl.textContent = badgeEl.getAttribute('data-orig-badge') || '';
        }
        return;
      }

      const trans = (dealTranslations as any)[dealId]?.[lang];
      if (trans) {
        if (titleEl) {
          if (!titleEl.hasAttribute('data-orig-title')) {
            titleEl.setAttribute('data-orig-title', titleEl.textContent?.trim() || '');
          }
          titleEl.textContent = trans.title;
        }

        if (descEl) {
          if (!descEl.hasAttribute('data-orig-desc')) {
            descEl.setAttribute('data-orig-desc', descEl.textContent?.trim() || '');
          }
          descEl.textContent = trans.description;
        }

        if (badgeEl && trans.badge) {
          if (!badgeEl.hasAttribute('data-orig-badge')) {
            badgeEl.setAttribute('data-orig-badge', badgeEl.textContent?.trim() || '');
          }
          badgeEl.textContent = trans.badge;
        }
      }
    });

    // Special handlers for complex composite buttons and inputs
    const mainHeroInput = document.getElementById('mainHeroSearchInput') as HTMLInputElement | null;
    if (mainHeroInput && t.searchPlaceholder) {
      mainHeroInput.placeholder = t.searchPlaceholder;
    }

    const gridFilterInput = document.getElementById('gridStoreFilterInput') as HTMLInputElement | null;
    if (gridFilterInput && t.filterByBrand) {
      gridFilterInput.placeholder = t.filterByBrand;
    }
  }

  // Listen to lang change events dispatched by the header
  window.addEventListener('promoradar_lang_changed', (e: any) => {
    applyLanguage(e.detail?.lang || 'en');
  });

  // Restore preferred language on initial page load
  try {
    const saved = localStorage.getItem('promoradar_lang');
    if (saved && saved !== 'en') {
      // Apply after slight DOM ready tick
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => applyLanguage(saved));
      } else {
        applyLanguage(saved);
      }
    }
  } catch (e) {}
}
