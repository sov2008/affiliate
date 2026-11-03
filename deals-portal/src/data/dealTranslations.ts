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
  }
};

