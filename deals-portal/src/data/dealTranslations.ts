/**
 * Regional Deal & Store Translations Map
 * High-Converting, Humanized Native Copy for Geo-Targeted Offers
 * In accordance with:
 * - AGENTS.md (Strict Zero Demo Data, Bespoke Copy Rule, English Baseline)
 * - conversion-copywriter-pro (Action-oriented, value-first, zero AI-clichés)
 * - localization-pro (Cultural transcreation for UA, AR, ES, PT, PL, CZ, DE)
 * - affiliate-seo-pro (Rich SERP CTR keywords)
 */

export interface LocalizedDealCopy {
  title: string;
  description: string;
  badge?: string;
}

export const REGIONAL_DEAL_TRANSLATIONS: Record<string, Record<string, LocalizedDealCopy>> = {
  // --- UKRAINIAN (ua) ---
  'deal_touch_smartphones_sale': {
    ua: {
      title: 'Знижки до 30% на флагманські смартфони, гаджети та аудіо в Touch',
      description: 'Офіційна техніка Apple, актуальні смартфони та розумні аксесуари з гарантією та швидкою доставкою по всій Україні.',
      badge: 'ДО -30%'
    }
  },
  'deal_polis_greencard_sale': {
    ua: {
      title: 'Знижка до 15% на оформлення Зеленої Картки та автоцивілки в Polis.ua',
      description: 'Миттєве онлайн-оформлення офіційної автостраховки та європейської Зеленої Картки у ліцензованих страховиків.',
      badge: 'ДО -15%'
    }
  },
  'deal_polis_medical_travel': {
    ua: {
      title: 'Перевірена медична страховка для виїзду за кордон із кешбеком',
      description: 'Комплексний електронний поліс страхування здоров\'я для подорожей світом з оформленням за 2 хвилини.',
      badge: 'КЕШБЕК'
    }
  },
  'deal_turbosto_verified_baseline': {
    ua: {
      title: 'Знижка на діагностику та ремонт турбін автомобілів у мережі Turbosto',
      description: 'Професійне відновлення турбокомпресорів та паливних систем з гарантією до 3 років по всій Україні.',
      badge: 'ПЕРЕВІРЕНО'
    }
  },
  'deal_gold_verified_baseline': {
    ua: {
      title: 'Знижки на вишукані золоті прикраси та діаманти в Gold.ua',
      description: 'Ювелірні вироби з дорогоцінними каменями, каблучки та ланцюжки з державною пробірною пломбою та доставкою.',
      badge: 'ПЕРЕВІРЕНО'
    }
  },
  'deal_intertop_verified_baseline': {
    ua: {
      title: 'Сезонний розпродаж брендового взуття та модного одягу в INTERTOP',
      description: 'Оригінальні моделі Ecco, Geox, Skechers, Tommy Hilfiger та нові спортивні колекції з доставкою.',
      badge: 'АКЦІЯ'
    }
  },
  'deal_punisher-shop_verified_baseline': {
    ua: {
      title: 'Знижки на тактичне спорядження, військовий одяг та берці в Punisher',
      description: '100% оригінальне армійське екіпірування, підсумки, ліхтарі та надійне взуття від провідних світових виробників.',
      badge: 'ПЕРЕВІРЕНО'
    }
  },
  'deal_partner_verified_baseline': {
    ua: {
      title: 'Знижки на розвиваючі іграшки, LEGO та конструктори в Будинок Іграшок',
      description: 'Ліцензійні дитячі товари, популярні настільні ігри та ляльки з безпечних матеріалів зі швидкою доставкою.',
      badge: 'АКЦІЯ'
    }
  },

  // --- ARABIC (ar) - GCC & UAE ---
  'net_863358': {
    ar: {
      title: 'خصم 10% على أواني الضيافة الفاخرة وأجهزة المطبخ من قصر الأواني',
      description: 'وفر على ترامس القهوة العربية الأصلية، قدور الضغط الذكية، وأطقم السفرة الفاخرة مع توصيل سريع لدول الخليج.',
      badge: 'خصم 10%'
    }
  },
  'net_814385': {
    ar: {
      title: 'خصم يصل إلى 80% على أحدث أزياء المنصات الأوروبية في فوغا كلوسيت',
      description: 'تسوقي أرقى الملابس النسائية والرجالية وأزياء الأطفال من لندن مع شحن سريع وتتبع مباشر في السعودية والإمارات.',
      badge: 'خصم 80%'
    }
  },
  'net_799278': {
    ar: {
      title: 'كوبون خصم حصري 10% على ألعاب وهدايا الأطفال في تطبيق دبدوب',
      description: 'توصيل هدايا فائق السرعة خلال ساعتين في الكويت والإمارات والسعودية مع خدمة تغليف الهدايا المجانية.',
      badge: 'خصم 10%'
    }
  },
  'net_793511': {
    ar: {
      title: 'تخفيضات كبرى تصل إلى 75% على الماركات العالمية في ذا ديل أوتلت',
      description: 'خصومات حقيقية على الأحذية الفاخرة، الحقائب الجلدية، وأزياء المصممين العالميين مع ضمان الأصالة 100%.',
      badge: 'خصم 75%'
    }
  },
  'net_776832': {
    ar: {
      title: 'خصم حتى 35% على رحلات سفاري دبي وتذاكر برج خليفة من رينا تورز',
      description: 'احجز رحلات السفاري الصحراوية الفاخرة، جولات اليخوت في مارينا، ومنصات برج خليفة بأسعار شريك معتمدة.',
      badge: 'خصم 15%'
    }
  },
  'net_776831': {
    ar: {
      title: 'قسيمة خصم رينا تورز: توفير حتى 35% على فعاليات وجولات الإمارات',
      description: 'وفر على تذاكر المدن الترفيهية وجولات الهليكوبتر وأبوظبي مع استلام فوري للقسيمة الرقمية على هاتفك.',
      badge: 'خصم 14%'
    }
  },
  'net_776829': {
    ar: {
      title: 'خصم موثق على باقات العطلات والأنشطة السياحية العالمية مع رينا تورز',
      description: 'جولات سياحية منظمة مع مرشدين وخدمات نقل متكاملة وبدون أي رسوم حجز إضافية خفية.',
      badge: 'خصم 15%'
    }
  },
  'net_776828': {
    ar: {
      title: 'تخفيضات حصرية على جولات اليخوت الخاصة وعشاء القناة المائية في دبي',
      description: 'استمتع بأفخم رحلات اليخوت الخاصة في دبي مارينا مع عشاء فاخر بأسعار شريك تفضيلية مجربة.',
      badge: 'خصم حصري'
    }
  },
  'net_776815': {
    ar: {
      title: 'رحلات السفاري الصحراوية وتذاكر دبي بخصم استثنائي 15%',
      description: 'مغامرات الكثبان الرملية بسيارات الدفع الرباعي وركوب الجمال وعشاء الشواء تحت النجوم مع تأكيد فوري.',
      badge: 'خصم 15%'
    }
  },
  'net_776188': {
    ar: {
      title: 'توفير مباشر على تذاكر مدن الملاهي الترفيهية وجولات الإمارات مع رينا تورز',
      description: 'دخول مباشر إلى عالم فيراري، ياس ووتروورلد، وأفضل المعالم الترفيهية لجميع أفراد العائلة.',
      badge: 'خصم 11%'
    }
  },
  'net_776187': {
    ar: {
      title: 'قسيمة توفير 11 درهم على الرحلات والجولات السياحية في دبي',
      description: 'خصم فوري مطبق عند حجز الأنشطة الترفيهية وتذاكر المعالم العائلية مع تسليم تذاكر رقمية فورية.',
      badge: '11 درهم خصم'
    }
  },
  'net_776185': {
    ar: {
      title: 'خصم 11 درهم على جولات القوارب البحرية ورحلات المشاهدة في دبي',
      description: 'استمتع بإطلالات أفق دبي الساحر وعين دبي من المياه بأسعار تفضيلية مباشرة.',
      badge: '11 درهم خصم'
    }
  },
  'net_776184': {
    ar: {
      title: 'باقة مغامرات الصحراء والمدن الترفيهية بتخفيض 11 درهم مباشر',
      description: 'تذكرة عائلية موحدة تشمل القيادة على الرمال والأنشطة التراثية بخصم حقيقي عند الدفع.',
      badge: '11 درهم خصم'
    }
  },
  'net_776183': {
    ar: {
      title: 'توفير 11 درهم على الرحلات البحرية مع وجبة العشاء في مرسى دبي',
      description: 'عشاء بوفيه فاخر مع عروض حية أثناء الإبحار في مارينا دبي بأسعار مخفضة موثقة.',
      badge: '11 درهم خصم'
    }
  },
  'net_776182': {
    ar: {
      title: 'قسيمة خصم 11 درهم على تذاكر برج خليفة والرحلات الترفيهية',
      description: 'شاهد أفق دبي من الطابق 124 وتجول بين أشهر معالم المدينة بأفضل سعر مؤكد.',
      badge: '11 درهم خصم'
    }
  },
  'net_776181': {
    ar: {
      title: 'خصم 11 درهم على الجولات السياحية العائلية في الإمارات',
      description: 'استكشف المعالم الثقافية والترفيهية في دبي وأبوظبي مع خصم مباشر عند الدفع.',
      badge: '11 درهم خصم'
    }
  },
  'net_776179': {
    ar: {
      title: 'تخفيض 11 درهم على فعاليات وسفاري صحراء دبي رينا تورز',
      description: 'احجز مغامرة السفاري مع عروض التنورة وعشاء الشواء الفاخر بأسعار شريك حصرية.',
      badge: '11 درهم خصم'
    }
  },
  'net_776178': {
    ar: {
      title: 'قسيمة حسم 11 درهم على تذاكر مدن الملاهي والأنشطة المائية',
      description: 'وفر فوراً على تذاكر المغامرات المائية والحدائق الترفيهية الموثقة في دبي.',
      badge: '11 درهم خصم'
    }
  },
  'net_776177': {
    ar: {
      title: 'توفير 11 درهم على حجز جولات دبي السياحية واليخوت',
      description: 'جولات بحرية مميزة وخدمة عملاء على مدار الساعة مع تأكيد حجز إلكتروني سريع.',
      badge: '11 درهم خصم'
    }
  },
  'net_776176': {
    ar: {
      title: 'قسيمة توفير 11 درهم على الأنشطة الترفيهية في الخليج',
      description: 'خصم مؤكد على أبرز الفعاليات الترفيهية والمعالم السياحية في دولة الإمارات.',
      badge: '11 درهم خصم'
    }
  },
  'net_776174': {
    ar: {
      title: 'خصم 11 درهم على عشاء اليخوت وسفاري دبي مع رينا تورز',
      description: 'توفير فوري على أجمل الأمسيات البحرية والمغامرات الصحراوية المجربة بالكامل.',
      badge: '11 درهم خصم'
    }
  },
  'deal_jashanmal_verified_baseline': {
    ar: {
      title: 'عروض حصرية على أدوات المطبخ وأمتعة السفر الفاخرة في جاشنمال',
      description: 'تسوق حقائب السفر من Delsey وأواني الطهي العالمية من ماركات رائدة بأسعار مخفضة.',
      badge: 'عرض حصري'
    }
  },
  'deal_vperfumes_verified_baseline': {
    ar: {
      title: 'تخفيضات العطور الشرقية والفرنسية الفاخرة في في برفيومز',
      description: 'أرقى دهن العود والزيوت العطرية وماركات العطور الفرنسية الأصلية مع توصيل سريع.',
      badge: 'عرض حصري'
    }
  },
  'deal_nazih_verified_baseline': {
    ar: {
      title: 'خصومات مستحضرات التجميل والعناية بالشعر الاحترافية في نزيه',
      description: 'منتجات الصالونات الاحترافية، أجهزة العناية بالبشرة، وأدوات تصفيف الشعر المعتمدة.',
      badge: 'عرض حصري'
    }
  },
  'deal_mamasandpapas_verified_baseline': {
    ar: {
      title: 'تخفيضات مستلزمات الأطفال وعربات الأطفال الفاخرة في ماماز وباباز',
      description: 'عربات أطفال متينة، ملابس قطنية عضوية للمواليد، وأثاث غرف الأطفال مع خصم مباشر.',
      badge: 'عرض حصري'
    }
  },
  'deal_footlocker-kw_verified_baseline': {
    ar: {
      title: 'خصومات الأحذية الرياضية الأصلية وسنيكرز المشاهير في فوت لوكر',
      description: 'أحدث موديلات Nike, Jordan, adidas Originals مع شحن سريع وتأكيد أصالة 100%.',
      badge: 'عرض حصري'
    }
  },
  'deal_eyewa-kw-qt-om_verified_baseline': {
    ar: {
      title: 'خصم على النظارات الشمسية والعدسات الطبية والملونة في أيوا',
      description: 'ماركات نظارات عالمية 30Sundays، Blackout وعدسات لاصقة معتمدة طبياً مع فحص دقيق.',
      badge: 'عرض حصري'
    }
  },
  'deal_victoria-s-secret_verified_baseline': {
    ar: {
      title: 'عروض حصرية على معطرات الجسم والملابس المريحة في فيكتوريا سيكريت',
      description: 'مجموعات العطور الشهيرة، لوشن الجسم المرطب، والملابس المنزلية الفاخرة بتخفيضات مؤكدة.',
      badge: 'عرض حصري'
    }
  },
  'deal_bath-body-works_verified_baseline': {
    ar: {
      title: 'خصومات الشموع المعطرة والعناية بالجسم في باث & بودي وركس',
      description: 'شموع 3 فتلات المشهورة، صابون اليدين الرغوي، وبخاخات الجسم العطرية برائحة تدوم طويلاً.',
      badge: 'عرض حصري'
    }
  },
  'deal_dkny-kw-coupons_verified_baseline': {
    ar: {
      title: 'تخفيضات حقائب وساعات وأزياء DKNY العصرية في الخليج',
      description: 'حقائب يد أنيقة، ساعات يد نسائية ورجالية، وأزياء نيويورك الأيقونية بأسعار مخفضة.',
      badge: 'عرض حصري'
    }
  },

  // --- SPANISH (es) - MEXICO & LATAM ---
  'deal_levis-mx_verified_baseline': {
    es: {
      title: 'Descuento Exclusivo en Jeans Clásicos 501 y Ropa Denim en Levi\'s México',
      description: 'Ahorra en mezclilla de alta durabilidad, chamarras trucker y playeras icónicas con envío seguro en todo México.',
      badge: 'VERIFICADO'
    }
  },
  'deal_sharkninja-mx_verified_baseline': {
    es: {
      title: 'Rebajas en Licuadoras Ninja y Aspiradoras Inteligentes Shark México',
      description: 'Potentes sistemas de cocina, freidoras de aire y aspiradoras anti-enredo con garantía oficial directa de fábrica.',
      badge: 'OFERTA'
    }
  },
  'deal_wild-fork-mx_verified_baseline': {
    es: {
      title: 'Cortes Finos y Mariscos Congelados al Vacío en Wild Fork México',
      description: 'Rib Eye, New York y mariscos de calidad congelados en su punto óptimo con entrega express a tu puerta.',
      badge: 'OFERTA'
    }
  },
  'deal_sol-cr-dito-mx_verified_baseline': {
    es: {
      title: 'Préstamos Personales en Línea en Minutos con SolCrédito México',
      description: 'Compara y solicita microcréditos inmediatos sin intermediarios y con aprobación rápida 100% digital.',
      badge: 'CRÉDITO SEGURO'
    }
  },
  'deal_neion-mx_verified_baseline': {
    es: {
      title: 'Soluciones de Financiamiento y Asesoría Crediticia Digital en Neion',
      description: 'Impulsa tu liquidez con planes flexibles, tasas transparentes y sin trámites burocráticos complicados.',
      badge: 'FINANZAS'
    }
  },
  'deal_fiesta-credito_verified_baseline': {
    es: {
      title: 'Dinero Rápido y Seguro sin Aval con Fiesta Crédito México',
      description: 'Obtén respuesta inmediata en tu solicitud de crédito en línea con total claridad y sin costos ocultos.',
      badge: 'SIN AVAL'
    }
  },
  'deal_american-eagle-mx_verified_baseline': {
    es: {
      title: 'Rebajas en Jeans Ne(X)t Level Stretch y Moda Casual en American Eagle',
      description: 'Comodidad total en pantalones de mezclilla, sudaderas y prendas casuales con promociones verificadas al pagar.',
      badge: 'VERIFICADO'
    }
  },

  // --- PORTUGUESE (pt) - BRAZIL ---
  'deal_shopee-brazil_verified_baseline': {
    pt: {
      title: 'Cupons de Frete Grátis e Ofertas Relâmpago Exclusivas na Shopee Brasil',
      description: 'Economize em eletrônicos, moda e utilidades domésticas com cupons verificados e garantia de entrega segura.',
      badge: 'FRETE GRÁTIS'
    }
  },
  'deal_shopee-br_verified_baseline': {
    pt: {
      title: 'Descontos de Fábrica e Cupons Oficiais da Shopee Brasil',
      description: 'Aproveite promoções diárias com cupons de desconto aplicados direto no carrinho com proteção total ao comprador.',
      badge: 'OFERTA RELÂMPAGO'
    }
  },
  'deal_saude-abril-br-grupo-abril_verified_baseline': {
    pt: {
      title: 'Assinatura Promocional da Revista Saúde com Acesso Digital Abril',
      description: 'Conteúdo científico confiável sobre medicina preventiva, alimentação e bem-estar com desconto oficial.',
      badge: 'ASSINATURA'
    }
  },
  'deal_bold-snacks-br_verified_baseline': {
    pt: {
      title: 'Barras de Proteína BOLD Snacks com Sabor Gourmet e Desconto',
      description: 'Lanches saudáveis ricos em proteína e sem adição de açúcar para seu treino e dia a dia com entrega rápida.',
      badge: 'NUTRIÇÃO'
    }
  },
  'deal_phooto-br_verified_baseline': {
    pt: {
      title: 'Fotolivros Personalizados e Revelação de Fotos em Promoção na Phooto',
      description: 'Eternize seus melhores momentos com papel fotográfico de alta qualidade, álbuns de capa dura e quadros.',
      badge: 'FOTOLIVRO'
    }
  },
  'deal_guldi-br_verified_baseline': {
    pt: {
      title: 'Colchões na Caixa Guldi com Molas Ensacadas e Preço Promocional',
      description: 'Durma com conforto ortopédico com 100 noites de teste em casa e entrega facilitada em todo o Brasil.',
      badge: '100 NOITES TESTE'
    }
  },
  'deal_eset-br_verified_baseline': {
    pt: {
      title: 'Antivírus ESET NOD32 com Proteção Proativa e Desconto Exclusivo',
      description: 'Navegue, faça compras e transações bancárias com escudo contra ransomware e ameaças digitais sem lentidão.',
      badge: 'CIBERSEGURANÇA'
    }
  },

  // --- POLISH (pl) - POLAND ---
  'deal_megogo-pl_verified_baseline': {
    pl: {
      title: 'Pakiet Telewizji Online i Kinowych Hitów w MEGOGO Polska',
      description: 'Oglądaj kanały TV na żywo, transmisje sportowe i tysiące filmów w jakości Full HD bez długoterminowych umów.',
      badge: 'BEZ UMOWY'
    }
  },
  'deal_konesso-pl_verified_baseline': {
    pl: {
      title: 'Świeżo Palona Kawa Ziarnista i Profesjonalne Ekspresy w Konesso',
      description: 'Markowe kawy z najlepszych palarni, herbaty premium oraz ekspresy Jura i DeLonghi z szybką wysyłką.',
      badge: 'KAWA PREMIUM'
    }
  },
  'deal_katalog-marze-pl_verified_baseline': {
    pl: {
      title: 'Vouchery na Niezapomniane Przeżycia i Prezenty w Katalog Marzeń',
      description: 'Skoki ze spadochronem, jazdy autami sportowymi i relaks w luksusowych SPA z gwarancją terminu ważności.',
      badge: 'EMOCJE NA PREZENT'
    }
  },

  // --- CZECH (cs) - CZECH REPUBLIC ---
  'deal_zonky-cz_verified_baseline': {
    cs: {
      title: 'Výhodná Půjčka Zonky s Nízkým Úrokem a Férovými Podmínkami',
      description: 'Půjčte si od lidí levněji než v bance s rychlým online vyřízením a možností kdykoliv bezplatně splatit.',
      badge: 'NÍZKÝ ÚROK'
    }
  },
  'deal_coolcredit-cz_verified_baseline': {
    cs: {
      title: 'Rychlá Krátkodobá Půjčka CoolCredit s Okamžitým Schválením',
      description: 'Peníze na účtu během několika minut bez zbytečného papírování a s transparentním kalkulátorem splátek.',
      badge: 'RYCHLÉ PENÍZE'
    }
  },
  'deal_kenwood-cz_verified_baseline': {
    cs: {
      title: 'Kuchyňské Robotické Systémy a Spotřebiče Kenwood s Garancí',
      description: 'Špičkové multifunkční kuchyňské roboty Chef s kovovým tělem a bohatým příslušenstvím s ověřenou slevou.',
      badge: 'KVALITA KENWOOD'
    }
  },
  'deal_proficredit-cz_verified_baseline': {
    cs: {
      title: 'Osobní a Podnikatelský Úvěr PROFI CREDIT s Flexibilním Splácením',
      description: 'Dostupné finanční prostředky s možností odkladu splátek a individuálním posouzením pro každého žadatele.',
      badge: 'FLEXIBILNÍ'
    }
  },
  'deal_nazivnost-cz_verified_baseline': {
    cs: {
      title: 'Specializované Služby a Financování pro Živnostníky v ČR',
      description: 'Rychlé schválení podpory pro OSVČ a malé podnikatele s minimální administrativní zátěží.',
      badge: 'PRO OSVČ'
    }
  },

  // --- MULTI-LOCALE GLOBAL HEADLINERS (ExpressVPN, Hostinger, NordVPN, Airalo, PureVPN, Kodland) ---
  'deal_expressvpn_49': {
    ar: {
      title: 'خصم 49% على اشتراك ExpressVPN السنوي + 3 أشهر مجاناً',
      description: 'حماية كاملة ببروتوكول Lightway الفائق على 8 أجهزة مع سيرفرات ذاكرة RAM في 105 دول وضمان استرداد 30 يوماً.',
      badge: 'خصم 49% + 3 أشهر'
    },
    ua: {
      title: 'Знижка 49% на річний план ExpressVPN + 3 місяці безкоштовно',
      description: 'Надійне шифрування військового рівня, захист до 8 пристроїв та надшвидкий протокол Lightway у 105 країнах.',
      badge: '49% ЗНИЖКА + 3 МІС'
    },
    es: {
      title: '49% de Descuento en Plan Anual de ExpressVPN + 3 Meses Gratis',
      description: 'Protección con servidores 100% RAM en 105 países, protocolo ultrarrápido Lightway y garantía de devolución de 30 días.',
      badge: '49% OFF + 3 MESES'
    },
    pt: {
      title: '49% de Desconto no Plano Anual ExpressVPN + 3 Meses Grátis',
      description: 'Navegação segura em alta velocidade com protocolo Lightway, criptografia militar e proteção em até 8 aparelhos.',
      badge: '49% OFF + 3 MESES'
    },
    pl: {
      title: 'Zniżka 49% na Roczny Plan ExpressVPN + 3 Miesiące Gratis',
      description: 'Maksymalne bezpieczeństwo i prywatność online dzięki serwerom RAM w 105 krajach i gwarancji zwrotu pieniędzy.',
      badge: '49% RABATU + 3 MIES'
    },
    cs: {
      title: 'Sleva 49 % na Roční Plán ExpressVPN + 3 Měsíce Zdarma',
      description: 'Bleskurychlá ochrana soukromí na bázi protokolu Lightway napříč 105 zeměmi s 30denní zárukou vrácení peněz.',
      badge: '49% SLEVA + 3 MĚS'
    },
    de: {
      title: '49% Rabatt auf ExpressVPN Jahresabo + 3 Gratismonate',
      description: 'Militärstarke Verschlüsselung über 105 Länder mit blitzschnellem Lightway-Protokoll und Geld-zurück-Garantie.',
      badge: '49% RABATT + 3 MONATE'
    }
  },
  'deal_hostinger_cloud_75': {
    ar: {
      title: 'استضافة 100 موقع بخصم 75% من Hostinger + دومين مجاني',
      description: 'سيرفرات LiteSpeed فائقة السرعة مع شهادة SSL مجانية، ونسخ احتياطي يومي، ولوحة تحكم hPanel سهلة الاستخدام.',
      badge: 'خصم 75% + دومين'
    },
    ua: {
      title: 'Хостинг до 100 сайтів зі знижкою 75% у Hostinger + безкоштовний домен',
      description: 'Надшвидкі сервери LiteSpeed, безкоштовні SSL-сертифікати, щоденні бекапи та цілодобова підтримка.',
      badge: 'ЗНИЖКА 75% + ДОМЕН'
    },
    es: {
      title: 'Aloja 100 Sitios Web con 75% de Descuento en Hostinger + Dominio Gratis',
      description: 'Velocidad NVMe superior con servidores LiteSpeed, copias de seguridad automáticas y certificados SSL incluidos.',
      badge: '75% OFF + DOMINIO'
    },
    pt: {
      title: 'Hospede 100 Sites com 75% de Desconto na Hostinger + Domínio Grátis',
      description: 'Servidores ultra-rápidos LiteSpeed, SSL grátis para todos os sites, backups diários e painel hPanel intuitivo.',
      badge: '75% OFF + DOMÍNIO'
    },
    pl: {
      title: 'Hosting do 100 Stron z Rabatem 75% w Hostinger + Darmowa Domena',
      description: 'Maksymalna prędkość LiteSpeed, nielimitowany certyfikat SSL, codzienne kopie zapasowe i polskie wsparcie.',
      badge: '75% TANIEJ + DOMENA'
    },
    cs: {
      title: 'Hostujte až 100 Webů se Slevou 75 % u Hostinger + Doména Zdarma',
      description: 'Extrémní rychlost díky LiteSpeed serverům, bezplatné SSL certifikáty a automatické denní zálohování.',
      badge: '75% SLEVA + DOMÉNA'
    },
    de: {
      title: '75% Rabatt auf Hostinger Webhosting für 100 Websites + Gratis Domain',
      description: 'Ultraschnelle LiteSpeed-Server, kostenloses SSL, tägliche Backups und intuitive Verwaltung im hPanel.',
      badge: '75% RABATT + DOMAIN'
    }
  },
  'deal_hostinger_cloud_starter': {
    ar: {
      title: 'استضافة كلاود Hostinger بخصم 65% مع IP مخصص وسرعة NVMe',
      description: 'موارد مخصصة بالكامل لسرعة استجابة فورية، وتثبيت ووردبريس بنقرة واحدة مع حماية مدمجة.',
      badge: 'خصم 65%'
    },
    ua: {
      title: 'Хмарний хостинг Hostinger зі знижкою 65%: виділений IP та NVMe',
      description: 'Потужні виділені ресурси для бізнес-проєктів із миттєвим розгортанням WordPress та захистом Cloudflare.',
      badge: '65% ЗНИЖКА'
    },
    es: {
      title: 'Cloud Hosting Hostinger con 65% de Descuento: IP Dedicada y NVMe',
      description: 'Rendimiento empresarial con recursos dedicados, instalación de WordPress en 1 clic y soporte 24/7.',
      badge: '65% OFF'
    },
    pt: {
      title: 'Hospedagem Cloud Hostinger com 65% de Desconto: IP Dedicado e NVMe',
      description: 'Potência máxima para seu negócio com recursos isolados, tráfego ilimitado e proteção DDoS reforçada.',
      badge: '65% OFF'
    },
    pl: {
      title: 'Hosting Cloud w Hostinger 65% Taniej: Dedykowany IP i Szybkość NVMe',
      description: 'Niezależne zasoby chmurowe, błyskawiczne wczytywanie stron i automatyczne skalowanie ruchu.',
      badge: '65% RABATU'
    },
    cs: {
      title: 'Cloud Hosting Hostinger se Slevou 65 %: Dedikovaná IP a NVMe',
      description: 'Dedikované prostředky pro náročné projekty, okamžitá instalace WordPressu a nepřetržitá podpora.',
      badge: '65% SLEVA'
    },
    de: {
      title: 'Hostinger Cloud Hosting mit 65% Rabatt: Dedizierte IP & NVMe-Speed',
      description: 'Enterprise-Performance mit garantierten Serverressourcen, 1-Klick WordPress und automatischen Backups.',
      badge: '65% RABATT'
    }
  },
  'net_849211': {
    ar: {
      title: 'وفر 10% على باقات شريحة Airalo eSIM الإلكترونية لرحلتك القادمة',
      description: 'تواصل فور وصولك لأكثر من 200 دولة بدون رسوم تجوال باهظة أو الحاجة لشراء شرائح محلية في المطار.',
      badge: 'خصم 10%'
    },
    ua: {
      title: 'Знижка 10% на туристичні картки Airalo eSIM по всьому світу',
      description: 'Миттєвий мобільний інтернет у більш ніж 200 країнах без черг за SIM-картками в аеропортах та без роумінгу.',
      badge: 'ЗНИЖКА 10%'
    },
    es: {
      title: 'Ahorra 10% en Tarjetas eSIM Airalo para tu Próximo Viaje',
      description: 'Conéctate al instante en más de 200 países sin cambiar de chip físico ni pagar costos excesivos de roaming.',
      badge: '10% OFF'
    },
    pt: {
      title: 'Economize 10% em Planos eSIM Airalo para Viagens Internacionais',
      description: 'Internet móvel instantânea em mais de 200 países sem filas no aeroporto e livre de tarifas de roaming.',
      badge: '10% OFF'
    },
    pl: {
      title: 'Zaoszczędź 10% na Kartach eSIM Airalo na Wyjazdy Zagraniczne',
      description: 'Połącz się z internetem w ponad 200 krajach od razu po wylądowaniu bez drogiego roamingu.',
      badge: '10% RABATU'
    },
    cs: {
      title: 'Ušetřete 10 % na Datových Tarifech Airalo eSIM pro Cestování',
      description: 'Okamžité mobilní připojení ve více než 200 zemích bez nutnosti shánět místní fyzickou SIM kartu.',
      badge: '10% SLEVA'
    },
    de: {
      title: '10% Rabatt auf Airalo Reise-eSIMs für über 200 Länder',
      description: 'Sofortige mobile Datenverbindung im Ausland ohne teure Roaminggebühren und ohne SIM-Kartenwechsel.',
      badge: '10% RABATT'
    }
  },
  'deal_purevpn_verified_baseline': {
    ar: {
      title: 'عرض شريك PureVPN المعتمد: خصوصية رقمية وتشفير كامل',
      description: 'أكثر من 6500 خادم في 70 دولة مع سياسة عدم الاحتفاظ بالسجلات المعتمدة، وتدفق فائق السرعة دون تقطيع.',
      badge: 'عرض معتمد'
    },
    ua: {
      title: 'Офіційна верифікована знижка на річну підписку PureVPN',
      description: 'Повний захист конфіденційності, 6500+ швидкісних серверів та сувора політика нульових логів для 10 пристроїв.',
      badge: 'ПЕРЕВІРЕНО'
    },
    es: {
      title: 'Promoción Oficial Verificada de PureVPN: Privacidad Total',
      description: 'Más de 6,500 servidores de alta velocidad, política de cero registros auditada y protección en 10 dispositivos.',
      badge: 'VERIFICADO'
    },
    pt: {
      title: 'Oferta Oficial Verificada PureVPN: Segurança e Criptografia',
      description: 'Mais de 6.500 servidores rápidos, política rigorosa de no-logs e desbloqueio de streaming em até 10 aparelhos.',
      badge: 'VERIFICADO'
    },
    pl: {
      title: 'Oficjalna Promocja PureVPN: Bezpieczeństwo i Anonimowość w Sieci',
      description: 'Dostęp do 6500+ serwerów, brak rejestrowania logów i stabilna ochrona na nawet 10 urządzeniach jednocześnie.',
      badge: 'ZWERYFIKOWANE'
    },
    cs: {
      title: 'Oficiální Ověřená Akce PureVPN: Maximální Bezpečí a Rychlost',
      description: 'Přes 6 500 rychlých serverů, auditovaná politika bez ukládání záznamів a ochrana až 10 zařízení.',
      badge: 'OVĚŘENO'
    },
    de: {
      title: 'Offizielles PureVPN Angebot: Geprüfter Datenschutz & Speed',
      description: 'Über 6.500 Server weltweit mit geprüfter No-Logs-Garantie und Streaming-Optimierung für 10 Geräte.',
      badge: 'GEPRÜFT'
    }
  },
  'net_943840': {
    ar: {
      title: 'خصم 30% على دورات البرمجة وتصميم الألعاب للأطفال من Kodland',
      description: 'دروس تفاعلية حية لتطوير مهارات طفلك في بايثون، روبلوكس፣ والرسم الرقمي مع معلمين متخصصين.',
      badge: 'خصم 30%'
    },
    ua: {
      title: 'Знижка 30% на курси програмування та цифрової творчості в Kodland',
      description: 'Живі інтерактивні заняття для дітей з програмування на Python, Roblox та створення комп\'ютерних ігор.',
      badge: 'ЗНИЖКА 30%'
    },
    es: {
      title: '30% de Descuento en Cursos de Programación para Niños en Kodland',
      description: 'Clases interactivas en vivo de Python, desarrollo de videojuegos y arte digital para potenciar su futuro.',
      badge: '30% OFF'
    },
    pt: {
      title: '30% de Desconto em Cursos de Programação Infantil na Kodland',
      description: 'Aulas ao vivo interativas de criação de jogos, Roblox e Python que desenvolvem o raciocínio lógico.',
      badge: '30% OFF'
    },
    pl: {
      title: 'Rabat 30% na Kursy Programowania i Grafiki dla Dzieci w Kodland',
      description: 'Interaktywne zajęcia online z tworzenia gier, Pythona i grafiki komputerowej pod okiem mentorów.',
      badge: '30% TANIEJ'
    },
    cs: {
      title: 'Sleva 30 % na Kurzy Programování a Herního Vývoje pro Děti v Kodland',
      description: 'Živé interaktivní online lekce programování her a digitální tvorby s individuálním přístupem.',
      badge: '30% SLEVA'
    },
    de: {
      title: '30% Rabatt auf Programmierkurse für Kinder bei Kodland',
      description: 'Interaktiver Live-Unterricht in Python, Game-Design und digitaler Kunst mit erfahrenen Mentoren.',
      badge: '30% RABATT'
    }
  },
};

