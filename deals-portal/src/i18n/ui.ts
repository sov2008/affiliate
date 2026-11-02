export interface LocaleConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  countryCode: string;
  dir?: 'ltr' | 'rtl';
}

export const LOCALES: Record<string, LocaleConfig> = {
  en: { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', countryCode: 'us', dir: 'ltr' },
  ar: { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇦🇪', countryCode: 'ae', dir: 'rtl' },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇲🇽', countryCode: 'es', dir: 'ltr' },
  pt: { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', countryCode: 'br', dir: 'ltr' },
  de: { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', countryCode: 'de', dir: 'ltr' },
  ua: { code: 'ua', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', countryCode: 'ua', dir: 'ltr' },
  pl: { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', countryCode: 'pl', dir: 'ltr' },
  cs: { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿', countryCode: 'cz', dir: 'ltr' }
};

export const DEFAULT_LOCALE = 'en';

export interface UIStrings {
  allDeals: string;
  stores: string;
  categories: string;
  compare: string;
  faq: string;
  saved: string;
  copyCode: string;
  getDiscount: string;
  claimDeal: string;
  verifiedWorking: string;
  testedToday: string;
  searchPlaceholder: string;
  filterByBrand: string;
  allCategories: string;
  loadMore: string;
  showingOffers: string;
  targetRegion: string;
  selectLanguage: string;
  editorialSeal: string;
  viewAllStores: string;
  endsInDays: string;
  verifiedForMonth: string;
  privacySecurity: string;
  gamingSoftware: string;
  homeLiving: string;
  fashionApparel: string;
  travelTours: string;
  electronicsGadgets: string;
  autoMobility: string;
  foodNutrition: string;
  ecommerceWholesale: string;
  blackFridayDeals: string;
}

export const UI_TRANSLATIONS: Record<string, UIStrings> = {
  en: {
    allDeals: "All Deals",
    stores: "Stores",
    categories: "Categories",
    compare: "Compare",
    faq: "FAQ",
    saved: "Saved",
    copyCode: "Copy Code",
    getDiscount: "Get Discount",
    claimDeal: "Claim Voucher",
    verifiedWorking: "Verified",
    testedToday: "Verified Today",
    searchPlaceholder: "Search partner stores, categories, or keywords...",
    filterByBrand: "Filter by brand or code...",
    allCategories: "All Deals",
    loadMore: "Load More Offers",
    showingOffers: "Showing {count} of {total} verified offers",
    targetRegion: "Target Region",
    selectLanguage: "Select Language",
    editorialSeal: "DIRECT AFFILIATE API TELEMETRY • 100% VERIFIED",
    viewAllStores: "View all stores in catalog →",
    endsInDays: "Ends in {days}d",
    verifiedForMonth: "Verified for {month} {year}",
    privacySecurity: "Privacy & VPN",
    gamingSoftware: "Gaming & Software",
    homeLiving: "Home & Living",
    fashionApparel: "Fashion & Apparel",
    travelTours: "Travel & Stays",
    electronicsGadgets: "Electronics & Power",
    autoMobility: "Auto & Dashcams",
    foodNutrition: "Food & Nutrition",
    ecommerceWholesale: "E-Commerce & B2B",
    blackFridayDeals: "Black Friday Deals"
  },
  ar: {
    allDeals: "جميع العروض",
    stores: "المتاجر",
    categories: "الفئات",
    compare: "مقارنة",
    faq: "الأسئلة الشائعة",
    saved: "المحفوظات",
    copyCode: "نسخ الكوبون",
    getDiscount: "احصل على الخصم",
    claimDeal: "تفعيل العرض",
    verifiedWorking: "موثوق",
    testedToday: "تم التحقق اليوم",
    searchPlaceholder: "ابحث عن المتاجر، الفئات، أو العروض...",
    filterByBrand: "تصفية حسب العلامة التجارية أو الرمز...",
    allCategories: "جميع العروض",
    loadMore: "عرض المزيد من العروض",
    showingOffers: "عرض {count} من أصل {total} عرض موثوق",
    targetRegion: "المنطقة المستهدفة",
    selectLanguage: "اختر اللغة",
    editorialSeal: "بيانات تتبع مباشرة ومعتمدة بنسبة 100%",
    viewAllStores: "عرض جميع المتاجر في الدليل ←",
    endsInDays: "ينتهي خلال {days} أيام",
    verifiedForMonth: "تم التحقق لشهر {month} {year}",
    privacySecurity: "الخصوصية والـ VPN",
    gamingSoftware: "الألعاب والبرمجيات",
    homeLiving: "المنزل والديكور",
    fashionApparel: "الأزياء والملابس",
    travelTours: "السياحة والسفر",
    electronicsGadgets: "الإلكترونيات والتقنية",
    autoMobility: "السيارات وكاميرات المراقبة",
    foodNutrition: "الأغذية والمكملات",
    ecommerceWholesale: "التجارة الإلكترونية والجملة",
    blackFridayDeals: "عروض الجمعة البيضاء"
  },
  es: {
    allDeals: "Ofertas",
    stores: "Tiendas",
    categories: "Categorías",
    compare: "Comparar",
    faq: "Preguntas",
    saved: "Guardados",
    copyCode: "Copiar Código",
    getDiscount: "Obtener Descuento",
    claimDeal: "Reclamar Cupón",
    verifiedWorking: "Verificado",
    testedToday: "Verificado hoy",
    searchPlaceholder: "Buscar tiendas, categorías o cupones...",
    filterByBrand: "Filtrar por tienda o cupón...",
    allCategories: "Todas las ofertas",
    loadMore: "Cargar más ofertas",
    showingOffers: "Mostrando {count} de {total} cupones verificados",
    targetRegion: "Región de destino",
    selectLanguage: "Seleccionar idioma",
    editorialSeal: "TELEMETRÍA DIRECTA DE AFILIADOS • 100% VERIFICADO",
    viewAllStores: "Ver todas las tiendas en el catálogo →",
    endsInDays: "Termina en {days}d",
    verifiedForMonth: "Verificado para {month} {year}",
    privacySecurity: "Privacidad y VPN",
    gamingSoftware: "Juegos y Software",
    homeLiving: "Hogar y Muebles",
    fashionApparel: "Moda y Ropa",
    travelTours: "Viajes y Tours",
    electronicsGadgets: "Electrónica y Gadgets",
    autoMobility: "Autos y Dashcams",
    foodNutrition: "Alimentos y Nutrición",
    ecommerceWholesale: "Comercio y Mayoristas",
    blackFridayDeals: "Ofertas Black Friday"
  },
  pt: {
    allDeals: "Todas as Ofertas",
    stores: "Lojas",
    categories: "Categorias",
    compare: "Comparar",
    faq: "Perguntas",
    saved: "Salvos",
    copyCode: "Copiar Cupom",
    getDiscount: "Obter Desconto",
    claimDeal: "Ativar Oferta",
    verifiedWorking: "Verificado",
    testedToday: "Verificado hoje",
    searchPlaceholder: "Buscar lojas parceiras, categorias ou cupons...",
    filterByBrand: "Filtrar por marca ou cupom...",
    allCategories: "Todas as ofertas",
    loadMore: "Carregar mais ofertas",
    showingOffers: "Exibindo {count} de {total} cupons verificados",
    targetRegion: "Região de destino",
    selectLanguage: "Selecione o idioma",
    editorialSeal: "TELEMETRIA DIRETA DE AFILIADOS • 100% VERIFICADO",
    viewAllStores: "Ver todas as lojas no catálogo →",
    endsInDays: "Termina em {days}d",
    verifiedForMonth: "Verificado para {month} {year}",
    privacySecurity: "Privacidade & VPN",
    gamingSoftware: "Jogos & Software",
    homeLiving: "Casa & Decoração",
    fashionApparel: "Moda & Vestuário",
    travelTours: "Viagens & Passeios",
    electronicsGadgets: "Eletrônicos & Gadgets",
    autoMobility: "Automotivo & Dashcams",
    foodNutrition: "Alimentos & Nutrição",
    ecommerceWholesale: "Comércio & Atacado",
    blackFridayDeals: "Ofertas Black Friday"
  },
  de: {
    allDeals: "Alle Deals",
    stores: "Shops",
    categories: "Kategorien",
    compare: "Vergleich",
    faq: "Hilfe & FAQ",
    saved: "Gemerkt",
    copyCode: "Code kopieren",
    getDiscount: "Rabatt sichern",
    claimDeal: "Gutschein einlösen",
    verifiedWorking: "Geprüft",
    testedToday: "Heute geprüft",
    searchPlaceholder: "Partner-Shops, Kategorien oder Gutscheine suchen...",
    filterByBrand: "Nach Marke oder Code filtern...",
    allCategories: "Alle Angebote",
    loadMore: "Mehr Angebote laden",
    showingOffers: "{count} von {total} geprüften Angeboten angezeigt",
    targetRegion: "Zielregion",
    selectLanguage: "Sprache wählen",
    editorialSeal: "DIREKTE PARTNER-API-TELEMETRIE • 100% GEPRÜFT",
    viewAllStores: "Alle Shops im Katalog ansehen →",
    endsInDays: "Endet in {days} Tagen",
    verifiedForMonth: "Geprüft für {month} {year}",
    privacySecurity: "Datenschutz & VPN",
    gamingSoftware: "Gaming & Software",
    homeLiving: "Wohnen & Haushalt",
    fashionApparel: "Mode & Kleidung",
    travelTours: "Reisen & Touren",
    electronicsGadgets: "Elektronik & Technik",
    autoMobility: "Auto & Dashcams",
    foodNutrition: "Essen & Ernährung",
    ecommerceWholesale: "E-Commerce & B2B",
    blackFridayDeals: "Black Friday Angebote"
  },
  ua: {
    allDeals: "Знижки",
    stores: "Магазини",
    categories: "Категорії",
    compare: "Порівняння",
    faq: "Питання",
    saved: "Збережені",
    copyCode: "Скопіювати код",
    getDiscount: "Отримати знижку",
    claimDeal: "Активувати купон",
    verifiedWorking: "Перевірено",
    testedToday: "Перевірено сьогодні",
    searchPlaceholder: "Пошук магазинів, категорій або промокодів...",
    filterByBrand: "Фільтр за брендом або кодом...",
    allCategories: "Всі пропозиції",
    loadMore: "Показати більше знижок",
    showingOffers: "Показано {count} з {total} перевірених знижок",
    targetRegion: "Цільовий регіон",
    selectLanguage: "Оберіть мову",
    editorialSeal: "ПРЯМА ТЕЛЕМЕТРІЯ ПАРТНЕРСЬКИХ API • 100% ПЕРЕВІРЕНО",
    viewAllStores: "Переглянути всі магазини в каталозі →",
    endsInDays: "Діє ще {days} дн.",
    verifiedForMonth: "Підтверджено на {month} {year}",
    privacySecurity: "Безпека та VPN",
    gamingSoftware: "Ігри та Програми",
    homeLiving: "Дім та Інтер'єр",
    fashionApparel: "Мода та Одяг",
    travelTours: "Подорожі та Тури",
    electronicsGadgets: "Електроніка та Гаджети",
    autoMobility: "Авто та Відеореєстратори",
    foodNutrition: "Їжа та Харчування",
    ecommerceWholesale: "E-Commerce та Опт",
    blackFridayDeals: "Знижки Black Friday"
  },
  pl: {
    allDeals: "Wszystkie okazje",
    stores: "Sklepy",
    categories: "Kategorie",
    compare: "Porównaj",
    faq: "Pomoc",
    saved: "Zapisane",
    copyCode: "Kopiuj kod",
    getDiscount: "Odbierz rabat",
    claimDeal: "Aktywuj kupon",
    verifiedWorking: "Sprawdzony",
    testedToday: "Sprawdzono dzisiaj",
    searchPlaceholder: "Szukaj sklepów, kategorii lub kodów...",
    filterByBrand: "Filtruj wg marki lub kodu...",
    allCategories: "Wszystkie oferty",
    loadMore: "Załaduj więcej ofert",
    showingOffers: "Wyświetlanie {count} z {total} sprawdzonych ofert",
    targetRegion: "Region docelowy",
    selectLanguage: "Wybierz język",
    editorialSeal: "BEZPOŚREDNIA TELEMETRIA API PARTNERSKICH • 100% SPRAWDZONE",
    viewAllStores: "Zobacz wszystkie sklepy w katalogu →",
    endsInDays: "Kończy się za {days} dni",
    verifiedForMonth: "Zatwierdzone na {month} {year}",
    privacySecurity: "Prywatność i VPN",
    gamingSoftware: "Gry i Oprogramowanie",
    homeLiving: "Dom i Wnętrze",
    fashionApparel: "Moda i Odzież",
    travelTours: "Podróże i Wycieczki",
    electronicsGadgets: "Elektronika i Gadżety",
    autoMobility: "Auto i Kamery samochodowe",
    foodNutrition: "Żywność i Suplementy",
    ecommerceWholesale: "E-Commerce i Hurt",
    blackFridayDeals: "Okazje Black Friday"
  },
  cs: {
    allDeals: "Všechny slevy",
    stores: "Obchody",
    categories: "Kategorie",
    compare: "Porovnání",
    faq: "Časté dotazy",
    saved: "Uložené",
    copyCode: "Kopírovat kód",
    getDiscount: "Získat slevu",
    claimDeal: "Uplatnit kupón",
    verifiedWorking: "Ověřeno",
    testedToday: "Dnes ověřeno",
    searchPlaceholder: "Hledat obchody, kategorie nebo kupóny...",
    filterByBrand: "Filtrovat podle značky nebo kódu...",
    allCategories: "Všechny nabídky",
    loadMore: "Načíst další nabídky",
    showingOffers: "Zobrazeno {count} z {total} ověřených nabídek",
    targetRegion: "Cílový region",
    selectLanguage: "Vyberte jazyk",
    editorialSeal: "PŘÍMÁ TELEMETRIE PARTNERSKÝCH API • 100% OVĚŘENO",
    viewAllStores: "Zobrazit všechny obchody v katalogu →",
    endsInDays: "Končí za {days} dní",
    verifiedForMonth: "Ověřeno pro {month} {year}",
    privacySecurity: "Soukromí a VPN",
    gamingSoftware: "Hry a Software",
    homeLiving: "Dům a Bydlení",
    fashionApparel: "Móda a Oblečení",
    travelTours: "Cestování a Zájezdy",
    electronicsGadgets: "Elektronika a Příslušenství",
    autoMobility: "Auto a Palubní kamery",
    foodNutrition: "Potraviny a Výživa",
    ecommerceWholesale: "E-Commerce a Velkoobchod",
    blackFridayDeals: "Nabídky Black Friday"
  }
};

export function getTranslation(locale: string = 'en'): UIStrings {
  return UI_TRANSLATIONS[locale] || UI_TRANSLATIONS['en'];
}

