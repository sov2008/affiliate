/**
 * Multi-Locale & Multi-GEO Deal of the Day Rotation Catalog
 * Strictly verified merchant partner offers categorized by allowed regions
 * with complete translations (en, ua, ar, es, pt, de, pl, cs)
 */

export interface LocalizedDealContent {
  title: string;
  description: string;
  discountBadge: string;
  discountSub: string;
  claimButtonText: string;
  ticketOfficial: string;
  ticketVerified: string;
  savingsLabel?: string;
  savingsValue?: string;
  savingsRegular?: string;
}

export interface HeroMultiGeoDeal {
  id: string;
  storeName: string;
  storeSlug: string;
  storeCategory: string;
  code: string;
  maskedCode: string;
  affiliateUrl: string;
  domain: string;
  timerEnds: string;
  logoUrl: string;
  allowedRegions: string[]; // e.g. ['GCC'], ['UA'], ['US'], ['EU'], ['MX'], ['BR'], ['PL'], ['CZ'], ['IN'], ['GLOBAL']
  locales: Record<string, LocalizedDealContent>;
}

export const HERO_MULTI_GEO_DEALS: HeroMultiGeoDeal[] = [
  // 1. ExpressVPN (GLOBAL, US, EU, UA, GCC)
  {
    id: 'deal_expressvpn_49',
    storeName: 'ExpressVPN',
    storeSlug: 'expressvpn',
    storeCategory: 'Privacy & Security',
    code: 'EXPRESS49',
    maskedCode: '••• S49',
    affiliateUrl: 'https://ziejy.com/g/4raik6r0sq367099d2cc954d043f6e/',
    domain: 'expressvpn.com',
    timerEnds: '14h 22m',
    logoUrl: '/logos/expressvpn.png',
    allowedRegions: ['GLOBAL', 'US', 'EU', 'UA', 'GCC'],
    locales: {
      en: {
        title: '49% Off ExpressVPN Annual Plan Plus Three Free Months',
        description: 'Save 49% with 3 bonus months of verified RAM-only high-speed encryption across 105 countries with Keys password manager and 30-day money-back guarantee.',
        discountBadge: '49% OFF',
        discountSub: '+ 3 Months Free',
        claimButtonText: 'Claim 49% Voucher',
        ticketOfficial: 'OFFICIAL',
        ticketVerified: 'VERIFIED'
      },
      ua: {
        title: 'Знижка 49% на річний план ExpressVPN + 3 місяці у подарунок',
        description: 'Заощаджуйте 49% з 3 бонусними місяцями надшвидкого шифрування у 105 країнах із менеджером паролів Keys та 30-денною гарантією повернення коштів.',
        discountBadge: 'ЗНИЖКА 49%',
        discountSub: '+ 3 Місяці Безкоштовно',
        claimButtonText: 'Отримати ваучер 49%',
        ticketOfficial: 'ОФІЦІЙНИЙ',
        ticketVerified: 'ПЕРЕВІРЕНО'
      },
      ar: {
        title: 'خصم 49% على باقة ExpressVPN السنوية + 3 أشهر مجانية',
        description: 'وفر 49% مع 3 أشهر إضافية من التشفير فائق السرعة عبر خوادم RAM في 105 دولة مع مدير كلمات المرور Keys وضمان استرداد الأموال لمدة 30 يوماً.',
        discountBadge: 'خصم 49%',
        discountSub: '+ 3 أشهر مجاناً',
        claimButtonText: 'احصل على القسيمة',
        ticketOfficial: 'رسمي',
        ticketVerified: 'تم التحقق'
      },
      es: {
        title: '49% de Descuento en el Plan Anual de ExpressVPN + 3 Meses Gratis',
        description: 'Ahorra un 49% con 3 meses adicionales de cifrado ultrarrápido en 105 países con gestor de contraseñas Keys y garantía de reembolso de 30 días.',
        discountBadge: '49% DTO',
        discountSub: '+ 3 Meses Gratis',
        claimButtonText: 'Reclamar Cupón 49%',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      pt: {
        title: '49% de Desconto no Plano Anual ExpressVPN + 3 Meses Grátis',
        description: 'Poupe 49% com 3 meses adicionais de encriptação ultrarrápida em 105 países com gestor de palavras-passe Keys e garantia de reembolso de 30 dias.',
        discountBadge: '49% OFF',
        discountSub: '+ 3 Meses Grátis',
        claimButtonText: 'Resgatar Cupom 49%',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      de: {
        title: '49% Rabatt auf ExpressVPN Jahresabo + 3 Gratismonate',
        description: 'Sparen Sie 49% mit 3 Zusatzmonaten blitzschneller RAM-Verschlüsselung in 105 Ländern inklusive Keys-Passwortmanager und 30-Tage-Geld-zurück-Garantie.',
        discountBadge: '49% RABATT',
        discountSub: '+ 3 Gratismonate',
        claimButtonText: 'Gutschein einlösen',
        ticketOfficial: 'OFFIZIELL',
        ticketVerified: 'GEPRÜFT'
      },
      pl: {
        title: '49% zniżki na plan roczny ExpressVPN + 3 miesiące gratis',
        description: 'Oszczędź 49% dzięki 3 darmowym miesiącom ultraszybkiego szyfrowania w 105 krajach z menedżerem haseł Keys i 30-dniową gwarancją zwrotu pieniędzy.',
        discountBadge: '-49% RABATU',
        discountSub: '+ 3 Miesiące Gratis',
        claimButtonText: 'Odbierz kupon 49%',
        ticketOfficial: 'OFICJALNY',
        ticketVerified: 'ZWERYFIKOWANY'
      },
      cs: {
        title: 'Sleva 49 % na roční plán ExpressVPN + 3 měsíce zdarma',
        description: 'Ušetřete 49 % se 3 bonusovými měsíci bleskurychlého šifrování ve 105 zemích se správcem hesel Keys a 30denní zárukou vrácení peněz.',
        discountBadge: 'SLEVA 49 %',
        discountSub: '+ 3 Měsíce Zdarma',
        claimButtonText: 'Získat poukaz 49 %',
        ticketOfficial: 'OFICIÁLNÍ',
        ticketVerified: 'OVĚŘENO'
      }
    }
  },

  // 2. Hostinger (GLOBAL, US, EU, UA, GCC)
  {
    id: 'deal_hostinger_cloud_75',
    storeName: 'Hostinger',
    storeSlug: 'hostinger',
    storeCategory: 'Web Hosting & Domains',
    code: 'HOSTING75',
    maskedCode: '••• G75',
    affiliateUrl: 'https://www.hostinger.com/?utm_source=promoradar&utm_medium=affiliate&utm_campaign=hero_slider',
    domain: 'hostinger.com',
    timerEnds: '08h 45m',
    logoUrl: '/logos/hostinger.png',
    allowedRegions: ['GLOBAL', 'US', 'EU', 'UA', 'GCC'],
    locales: {
      en: {
        title: 'Host 100 Websites: 75% Off Premium Web Hosting',
        description: 'Deploy on ultra-fast NVMe LiteSpeed servers with 100 website slots, complimentary domain name, unmetered bandwidth, and automated daily backups.',
        discountBadge: '75% OFF',
        discountSub: '+ Free Domain Included',
        claimButtonText: 'Claim 75% Voucher',
        ticketOfficial: 'OFFICIAL',
        ticketVerified: 'VERIFIED'
      },
      ua: {
        title: 'Хостинг для 100 сайтів: знижка 75% на преміум веб-хостинг',
        description: 'Розгортайте сайти на надшвидких серверах NVMe LiteSpeed на 100 сайтів із безкоштовним доменом, необмеженим трафіком і щоденними бекапами.',
        discountBadge: 'ЗНИЖКА 75%',
        discountSub: '+ Безкоштовний Домен',
        claimButtonText: 'Отримати ваучер 75%',
        ticketOfficial: 'ОФІЦІЙНИЙ',
        ticketVerified: 'ПЕРЕВІРЕНО'
      },
      ar: {
        title: 'استضافة 100 موقع: خصم 75% على الاستضافة المميزة',
        description: 'انشر مواقعك على خوادم NVMe LiteSpeed الفائقة مع 100 موقع، نطاق مجاني، حركة مرور غير محدودة، ونسخ احتياطي يومي تلقائي.',
        discountBadge: 'خصم 75%',
        discountSub: '+ نطاق مجاني مشمول',
        claimButtonText: 'احصل على القسيمة',
        ticketOfficial: 'رسمي',
        ticketVerified: 'تم التحقق'
      },
      es: {
        title: 'Aloja 100 Sitios Web: 75% de Descuento en Hosting Premium',
        description: 'Implementa en servidores NVMe LiteSpeed ultrarrápidos para 100 webs con dominio gratuito, ancho de banda ilimitado y copias de seguridad diarias.',
        discountBadge: '75% DTO',
        discountSub: '+ Dominio Gratis Incluido',
        claimButtonText: 'Reclamar Cupón 75%',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      pt: {
        title: 'Hospede 100 Sites: 75% de Desconto em Alojamento Premium',
        description: 'Implemente em servidores NVMe LiteSpeed ultrarrápidos com 100 sites, domínio grátis, tráfego ilimitado e backups diários automáticos.',
        discountBadge: '75% OFF',
        discountSub: '+ Domínio Grátis Incluído',
        claimButtonText: 'Resgatar Cupom 75%',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      de: {
        title: '100 Websites hosten: 75% Rabatt auf Premium-Webhosting',
        description: 'Starten Sie auf extrem schnellen NVMe LiteSpeed-Servern für 100 Websites inklusive Gratis-Domain, unbegrenztem Traffic und täglichen Backups.',
        discountBadge: '75% RABATT',
        discountSub: '+ Inklusive Gratis-Domain',
        claimButtonText: 'Gutschein einlösen',
        ticketOfficial: 'OFFIZIELL',
        ticketVerified: 'GEPRÜFT'
      },
      pl: {
        title: 'Hostuj 100 stron: 75% zniżki na hosting premium',
        description: 'Wdrażaj na ultraszybkich serwerach NVMe LiteSpeed z obsługą 100 witryn, darmową domeną, nielimitowanym transferem i codziennymi kopiami zapasowymi.',
        discountBadge: '-75% RABATU',
        discountSub: '+ Darmowa Domena w Zestawie',
        claimButtonText: 'Odbierz kupon 75%',
        ticketOfficial: 'OFICJALNY',
        ticketVerified: 'ZWERYFIKOWANY'
      },
      cs: {
        title: 'Hostujte 100 webů: 75% sleva na prémiový webhosting',
        description: 'Provozujte projekty na bleskových serverech NVMe LiteSpeed pro 100 webů s bezplatnou doménou, neomezeným přenosem a denními zálohami.',
        discountBadge: 'SLEVA 75 %',
        discountSub: '+ Doména Zdarma v Ceně',
        claimButtonText: 'Získat poukaz 75 %',
        ticketOfficial: 'OFICIÁLNÍ',
        ticketVerified: 'OVĚŘENO'
      }
    }
  },

  // 3. VogaCloset (GCC)
  {
    id: 'net_814385',
    storeName: 'VogaCloset',
    storeSlug: 'vogacloset',
    storeCategory: 'Fashion & Apparel',
    code: 'SALE',
    maskedCode: '••• SALE',
    affiliateUrl: 'https://bywiola.com/g/6silcjvoa9fa9e3fd878b52609ec28/?i=3',
    domain: 'vogacloset.com',
    timerEnds: '18h 30m',
    logoUrl: '/logos/vogacloset.png',
    allowedRegions: ['GCC'],
    locales: {
      en: {
        title: 'VogaCloset: Up to 80% Off European Runway Styles',
        description: 'Explore curated British and European fashion, footwear, and beauty essentials with fast Middle East express shipping and instant checkout discounts.',
        discountBadge: '80% OFF',
        discountSub: 'Runway Styles & Footwear',
        claimButtonText: 'Claim 80% Voucher',
        ticketOfficial: 'OFFICIAL',
        ticketVerified: 'VERIFIED'
      },
      ar: {
        title: 'فوغا كلوسيت: خصم حتى 80% على أرقى الأزياء الأوروبية',
        description: 'تسوق أحدث خطوط الموضة البريطانية والأوروبية والأحذية ومستحضرات التجميل مع شحن سريع لدول الخليج وخصم فوري عند الدفع.',
        discountBadge: 'خصم 80%',
        discountSub: 'أزياء أوروبية وأحذية راقية',
        claimButtonText: 'احصل على القسيمة',
        ticketOfficial: 'رسمي',
        ticketVerified: 'تم التحقق'
      },
      ua: {
        title: 'VogaCloset: знижка до 80% на європейські брендові колекції',
        description: 'Європейський одяг, взуття та аксесуари з преміальних бутиків зі швидкою доставкою та миттєвими знижками за промокодом.',
        discountBadge: 'ДО 80% OFF',
        discountSub: 'Європейська Мода',
        claimButtonText: 'Отримати ваучер 80%',
        ticketOfficial: 'ОФІЦІЙНИЙ',
        ticketVerified: 'ПЕРЕВІРЕНО'
      },
      es: {
        title: 'VogaCloset: Hasta 80% de Descuento en Moda Europea',
        description: 'Descubre moda británica y europea de pasarela, calzado y belleza con envío exprés y descuentos instantáneos en caja.',
        discountBadge: '80% DTO',
        discountSub: 'Estilos de Pasarela',
        claimButtonText: 'Reclamar Cupón 80%',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      pt: {
        title: 'VogaCloset: Até 80% de Desconto em Moda Europeia',
        description: 'Descubra moda britânica e europeia, calçado e beleza com envio expresso e descontos imediatos no checkout.',
        discountBadge: '80% OFF',
        discountSub: 'Estilos de Passarela',
        claimButtonText: 'Resgatar Cupom 80%',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      de: {
        title: 'VogaCloset: Bis zu 80% Rabatt auf europäische Modetrends',
        description: 'Entdecken Sie britische und europäische Premium-Kollektionen, Schuhe und Kosmetik mit Expresslieferung und Sofortrabatt.',
        discountBadge: '80% RABATT',
        discountSub: 'Laufsteg-Trends & Schuhe',
        claimButtonText: 'Gutschein einlösen',
        ticketOfficial: 'OFFIZIELL',
        ticketVerified: 'GEPRÜFT'
      },
      pl: {
        title: 'VogaCloset: Do 80% zniżki na europejską modę',
        description: 'Odkryj brytyjską i europejską modę z wybiegów, obuwie i kosmetyki z szybką dostawą i natychmiastowym rabatem.',
        discountBadge: '-80% RABATU',
        discountSub: 'Moda z Wybiegów',
        claimButtonText: 'Odbierz kupon 80%',
        ticketOfficial: 'OFICJALNY',
        ticketVerified: 'ZWERYFIKOWANY'
      },
      cs: {
        title: 'VogaCloset: Až 80% sleva na evropskou módu',
        description: 'Prozkoumejte britskou a evropskou módu, obuv a kosmetiku s expresním doručením a okamžitou slevou u pokladny.',
        discountBadge: 'AŽ 80 % SLEVA',
        discountSub: 'Móda z Přehlídkových Mol',
        claimButtonText: 'Získat poukaz 80 %',
        ticketOfficial: 'OFICIÁLNÍ',
        ticketVerified: 'OVĚŘENO'
      }
    }
  },

  // 4. RaynaTours (GCC)
  {
    id: 'net_776832',
    storeName: 'RaynaTours',
    storeSlug: 'raynatours',
    storeCategory: 'Travel & Tours',
    code: 'TKFL9',
    maskedCode: '••• FL9',
    affiliateUrl: 'https://codeaven.com/g/bsyhi8m623367099d2cc62651c44e1/?i=31',
    domain: 'raynatours.com',
    timerEnds: '12h 45m',
    logoUrl: '/logos/raynatours.png',
    allowedRegions: ['GCC'],
    locales: {
      en: {
        title: 'Save 15% on UAE Desert Safaris, Burj Khalifa & Attractions',
        description: 'Book Dubai and Abu Dhabi VIP desert safaris, dhow dinner cruises, and top city attraction passes with verified instant confirmation tickets.',
        discountBadge: '15% OFF',
        discountSub: 'Tours & Desert Safaris',
        claimButtonText: 'Claim 15% Voucher',
        ticketOfficial: 'OFFICIAL',
        ticketVerified: 'VERIFIED'
      },
      ar: {
        title: 'وفر 15% على رحلات سفاري دبي وتذاكر برج خليفة والفعاليات',
        description: 'احجز أفضل رحلات السفاري الصحراوية الفاخرة، الرحلات البحرية، وتذاكر أشهر المعالم السياحية في الإمارات مع تأكيد فوري وموثوق.',
        discountBadge: 'خصم 15%',
        discountSub: 'رحلات سياحية وسفاري دبي',
        claimButtonText: 'احصل على القسيمة',
        ticketOfficial: 'رسمي',
        ticketVerified: 'تم التحقق'
      },
      ua: {
        title: 'Знижка 15% на сафарі в пустелі ОАЕ та квитки на Burj Khalifa',
        description: 'Бронюйте преміальні пустельні сафарі в Дубаї, морські круїзи та вхідні квитки до найкращих атракціонів за вигідною ціною.',
        discountBadge: 'ЗНИЖКА 15%',
        discountSub: 'Тури та Сафарі в ОАЕ',
        claimButtonText: 'Отримати ваучер 15%',
        ticketOfficial: 'ОФІЦІЙНИЙ',
        ticketVerified: 'ПЕРЕВІРЕНО'
      },
      es: {
        title: 'Ahorra 15% en Safaris por el Desierto y Atracciones de Dubái',
        description: 'Reserva safaris VIP por el desierto en Dubái y Abu Dabi, cruceros con cena y entradas para las principales atracciones turísticas.',
        discountBadge: '15% DTO',
        discountSub: 'Tours y Safaris en Dubái',
        claimButtonText: 'Reclamar Cupón 15%',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      pt: {
        title: 'Poupe 15% em Safáris no Deserto e Atrações no Dubai',
        description: 'Reserve safáris VIP no deserto no Dubai e Abu Dhabi, cruzeiros com jantar e bilhetes para as principais atrações com confirmação imediata.',
        discountBadge: '15% OFF',
        discountSub: 'Passeios e Safáris no Dubai',
        claimButtonText: 'Resgatar Cupom 15%',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      de: {
        title: '15% Rabatt auf Wüstensafaris und Dubai-Attraktionen',
        description: 'Buchen Sie exklusive Wüstensafaris in Dubai und Abu Dhabi, Dhau-Dinner-Kreuzfahrten und Tickets für Top-Sehenswürdigkeiten zum Bestpreis.',
        discountBadge: '15% RABATT',
        discountSub: 'Touren & Wüstensafaris',
        claimButtonText: 'Gutschein einlösen',
        ticketOfficial: 'OFFIZIELL',
        ticketVerified: 'GEPRÜFT'
      },
      pl: {
        title: 'Zaoszczędź 15% na safari na pustyni i atrakcjach w Dubaju',
        description: 'Rezerwuj ekskluzywne pustynne safari w Dubaju i Abu Zabi, rejsy z kolacją i bilety do czołowych atrakcji ze sprawdzonym rabatem.',
        discountBadge: '-15% RABATU',
        discountSub: 'Wycieczki i Safari',
        claimButtonText: 'Odbierz kupon 15%',
        ticketOfficial: 'OFICJALNY',
        ticketVerified: 'ZWERYFIKOWANY'
      },
      cs: {
        title: 'Ušetřete 15 % na pouštních safari a atrakcích v Dubaji',
        description: 'Rezervujte si prémiová safari v Dubaji a Abú Dhabí, vyhlídkové plavby a vstupenky na nejlepší atrakce s ověřenou slevou.',
        discountBadge: 'SLEVA 15 %',
        discountSub: 'Výlety a Pouštní Safari',
        claimButtonText: 'Získat poukaz 15 %',
        ticketOfficial: 'OFICIÁLNÍ',
        ticketVerified: 'OVĚŘENO'
      }
    }
  },

  // 5. Touch UA (UA)
  {
    id: 'deal_touch_smartphones_sale',
    storeName: 'Touch UA',
    storeSlug: 'touch',
    storeCategory: 'Electronics & Gadgets',
    code: 'TOUCHGADGET',
    maskedCode: '••• DGET',
    affiliateUrl: 'https://wbbsv.com/g/ynys1f2mjp367099d2cc0e81904d8b/',
    domain: 'touch.com.ua',
    timerEnds: '15h 20m',
    logoUrl: '/logos/touch.png',
    allowedRegions: ['UA'],
    locales: {
      en: {
        title: 'Save up to 30% on Apple, Samsung & Smart Electronics at Touch',
        description: 'Get verified discounts on smartphones, laptops, headphones, and home smart devices with official warranty and rapid Ukraine shipping.',
        discountBadge: '30% OFF',
        discountSub: 'Smartphones & Gadgets',
        claimButtonText: 'Claim 30% Voucher',
        ticketOfficial: 'OFFICIAL',
        ticketVerified: 'VERIFIED'
      },
      ua: {
        title: 'Знижка до 30% на смартфони Apple, Samsung та гаджети в Touch',
        description: 'Офіційна техніка, ноутбуки, навушники та смарт-пристрої з гарантією виробника та швидкою доставкою по Україні зі знижкою до 30%.',
        discountBadge: 'ДО 30% OFF',
        discountSub: 'Смартфони та Гаджети',
        claimButtonText: 'Отримати ваучер 30%',
        ticketOfficial: 'ОФІЦІЙНИЙ',
        ticketVerified: 'ПЕРЕВІРЕНО'
      },
      ar: {
        title: 'خصم حتى 30% على هواتف Apple وSamsung والإلكترونيات الذكية',
        description: 'احصل على خصومات حقيقية على الهواتف الذكية وأجهزة الكمبيوتر المحمولة والأجهزة الذكية مع ضمان رسمي.',
        discountBadge: 'خصم 30%',
        discountSub: 'هواتف ذكية وأجهزة',
        claimButtonText: 'احصل على القسيمة',
        ticketOfficial: 'رسمي',
        ticketVerified: 'تم التحقق'
      },
      es: {
        title: 'Hasta 30% de Descuento en Smartphones y Electrónica en Touch',
        description: 'Consigue descuentos verificados en smartphones Apple, Samsung, portátiles y accesorios tecnológicos con garantía oficial.',
        discountBadge: '30% DTO',
        discountSub: 'Smartphones y Gadgets',
        claimButtonText: 'Reclamar Cupón 30%',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      pt: {
        title: 'Até 30% de Desconto em Smartphones e Eletrônicos na Touch',
        description: 'Descontos confirmados em smartphones Apple, Samsung, portáteis e gadgets inteligentes com garantia de fabricante.',
        discountBadge: '30% OFF',
        discountSub: 'Smartphones e Gadgets',
        claimButtonText: 'Resgatar Cupom 30%',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      de: {
        title: 'Bis zu 30% Rabatt auf Smartphones & Smart-Elektronik bei Touch',
        description: 'Geprüfte Rabatte auf Apple, Samsung Smartphones, Notebooks und smarte Gadgets mit offizieller Garantie.',
        discountBadge: '30% RABATT',
        discountSub: 'Smartphones & Gadgets',
        claimButtonText: 'Gutschein einlösen',
        ticketOfficial: 'OFFIZIELL',
        ticketVerified: 'GEPRÜFT'
      },
      pl: {
        title: 'Do 30% zniżki na smartfony i elektronikę w sklepie Touch',
        description: 'Sprawdzone zniżki na smartfony Apple, Samsung, laptopy i inteligentne gadżety z oficjalną gwarancją producenta.',
        discountBadge: '-30% RABATU',
        discountSub: 'Smartfony i Gadżety',
        claimButtonText: 'Odbierz kupon 30%',
        ticketOfficial: 'OFICJALNY',
        ticketVerified: 'ZWERYFIKOWANY'
      },
      cs: {
        title: 'Až 30% sleva na chytré telefony a elektroniku v Touch',
        description: 'Ověřené slevy na telefony Apple, Samsung, notebooky a chytrá zařízení s oficiální zárukou.',
        discountBadge: 'AŽ 30 % SLEVA',
        discountSub: 'Chytré Telefony a Gadgety',
        claimButtonText: 'Získat poukaz 30 %',
        ticketOfficial: 'OFICIÁLNÍ',
        ticketVerified: 'OVĚŘENO'
      }
    }
  },

  // 6. Polis UA (UA)
  {
    id: 'deal_polis_greencard_sale',
    storeName: 'Polis UA',
    storeSlug: 'polis',
    storeCategory: 'Insurance & Finance',
    code: 'POLISGREEN',
    maskedCode: '••• REEN',
    affiliateUrl: 'https://naiawork.com/g/yej7zhxr7q367099d2cc063ddfdb47/?i=3',
    domain: 'polis.ua',
    timerEnds: '10h 15m',
    logoUrl: '/logos/polis.png',
    allowedRegions: ['UA'],
    locales: {
      en: {
        title: 'Get 15% Off Green Card & Online Vehicle Insurance at Polis.ua',
        description: 'Compare top-tier insurance policies in seconds. Secure authentic digital Green Card and compulsory motor vehicle liability with instant email dispatch.',
        discountBadge: '15% OFF',
        discountSub: 'Green Card & Vehicle Insurance',
        claimButtonText: 'Claim 15% Voucher',
        ticketOfficial: 'OFFICIAL',
        ticketVerified: 'VERIFIED'
      },
      ua: {
        title: 'Знижка 15% на Зелену Картку та автоцивілку на Polis.ua',
        description: 'Миттєве онлайн-оформлення Зеленої Картки та ОСЦПВ від надійних страхових компаній з офіційною реєстрацією в базі МТСБУ та знижкою 15%.',
        discountBadge: 'ЗНИЖКА 15%',
        discountSub: 'Зелена Картка та Автоцивілка',
        claimButtonText: 'Отримати ваучер 15%',
        ticketOfficial: 'ОФІЦІЙНИЙ',
        ticketVerified: 'ПЕРЕВІРЕНО'
      },
      ar: {
        title: 'وفر 15% على تأمين المركبات والبطاقة الخضراء عبر Polis.ua',
        description: 'قارن بين عروض كبرى شركات التأمين واحصل على وثيقتك الرقمية الرسمية خلال دقائق مع خصم فوري.',
        discountBadge: 'خصم 15%',
        discountSub: 'تأمين المركبات الإلكتروني',
        claimButtonText: 'احصل على القسيمة',
        ticketOfficial: 'رسمي',
        ticketVerified: 'تم التحقق'
      },
      es: {
        title: '15% de Descuento en Carta Verde y Seguro de Coche en Polis.ua',
        description: 'Contrata tu seguro obligatorio de vehículos o Carta Verde digital en minutos con las mejores aseguradoras y confirmación instantánea.',
        discountBadge: '15% DTO',
        discountSub: 'Seguro de Coche y Carta Verde',
        claimButtonText: 'Reclamar Cupón 15%',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      pt: {
        title: '15% de Desconto em Seguro Automóvel e Carta Verde na Polis.ua',
        description: 'Contrate seguro obrigatório de veículos ou Carta Verde digital em minutos com as melhores seguradoras e emissão imediata.',
        discountBadge: '15% OFF',
        discountSub: 'Seguro Automóvel Digital',
        claimButtonText: 'Resgatar Cupom 15%',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      de: {
        title: '15% Rabatt auf Grüne Karte & Kfz-Versicherung bei Polis.ua',
        description: 'Sofortiger Online-Abschluss von Kfz-Haftpflicht und Grüner Versicherungskarte mit digitaler Zustellung binnen weniger Minuten.',
        discountBadge: '15% RABATT',
        discountSub: 'Grüne Karte & Kfz-Schutz',
        claimButtonText: 'Gutschein einlösen',
        ticketOfficial: 'OFFIZIELL',
        ticketVerified: 'GEPRÜFT'
      },
      pl: {
        title: 'Zyskaj 15% zniżki na Zieloną Kartę i ubezpieczenie OC na Polis.ua',
        description: 'Błyskawiczne ubezpieczenie pojazdu online i Zielona Karta z natychmiastową wysyłką na e-mail i gwarancją legalności.',
        discountBadge: '-15% RABATU',
        discountSub: 'Zielona Karta i OC',
        claimButtonText: 'Odbierz kupon 15%',
        ticketOfficial: 'OFICJALNY',
        ticketVerified: 'ZWERYFIKOWANY'
      },
      cs: {
        title: 'Získejte 15% slevu na Zelenou kartu a pojištění vozidel na Polis.ua',
        description: 'Bleskové online sjednání povinného ručení a Zelené karty s okamžitým doručením na e-mail a ověřenou slevou.',
        discountBadge: 'SLEVA 15 %',
        discountSub: 'Zelená Karta a Pojištění',
        claimButtonText: 'Získat poukaz 15 %',
        ticketOfficial: 'OFICIÁLNÍ',
        ticketVerified: 'OVĚŘENO'
      }
    }
  },

  // 7. Abelssoft (GLOBAL, US, EU)
  {
    id: 'cj-abelssoft-50off',
    storeName: 'Abelssoft',
    storeSlug: 'abelssoft',
    storeCategory: 'Privacy & Security',
    code: 'ABELSSOFT50',
    maskedCode: '••• T50',
    affiliateUrl: 'https://www.anrdoezrs.net/click-101907236-15402815-1684513856000',
    domain: 'abelssoft.de',
    timerEnds: '19h 10m',
    logoUrl: '/logos/abelssoft.png',
    allowedRegions: ['GLOBAL', 'US', 'EU'],
    locales: {
      en: {
        title: '50% Off Abelssoft Windows Tuning & System Security Software',
        description: 'Optimize and shield your PC with award-winning registry cleaners, privacy guards, and real-time disk acceleration utilities with lifetime upgrades.',
        discountBadge: '50% OFF',
        discountSub: 'Lifetime License Deal',
        claimButtonText: 'Claim 50% Voucher',
        ticketOfficial: 'OFFICIAL',
        ticketVerified: 'VERIFIED'
      },
      ua: {
        title: 'Знижка 50% на софт для оптимізації та безпеки Windows від Abelssoft',
        description: 'Прискорюйте та захищайте свій ПК за допомогою визнаних утиліт очищення реєстру, захисту приватності та оптимізації дисків із довічною ліцензією.',
        discountBadge: 'ЗНИЖКА 50%',
        discountSub: 'Довічна Ліцензія',
        claimButtonText: 'Отримати ваучер 50%',
        ticketOfficial: 'ОФІЦІЙНИЙ',
        ticketVerified: 'ПЕРЕВІРЕНО'
      },
      ar: {
        title: 'خصم 50% على برامج تسريع وحماية نظام ويندوز من Abelssoft',
        description: 'قم بتحسين وأمان جهاز الكمبيوتر الخاص بك باستخدام أفضل برامج تنظيف السجل وحماية الخصوصية مع ترخيص مدى الحياة.',
        discountBadge: 'خصم 50%',
        discountSub: 'ترخيص مدى الحياة',
        claimButtonText: 'احصل على القسيمة',
        ticketOfficial: 'رسمي',
        ticketVerified: 'تم التحقق'
      },
      es: {
        title: '50% de Descuento en Seguridad y Optimización de Windows Abelssoft',
        description: 'Optimiza y protege tu PC con limpiadores de registro galardonados, protectores de privacidad y aceleración de disco de por vida.',
        discountBadge: '50% DTO',
        discountSub: 'Licencia de por Vida',
        claimButtonText: 'Reclamar Cupón 50%',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      pt: {
        title: '50% de Desconto em Software de Otimização e Segurança Abelssoft',
        description: 'Otimize e proteja o seu computador com ferramentas premiadas de limpeza de registo, privacidade e aceleração com licença vitalícia.',
        discountBadge: '50% OFF',
        discountSub: 'Licença Vitalícia',
        claimButtonText: 'Resgatar Cupom 50%',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      de: {
        title: '50% Rabatt auf Abelssoft Windows-Tuning & System-Sicherheit',
        description: 'Optimieren und schützen Sie Ihren PC mit prämierten Registry-Cleanern, Datenschutz-Tools und Festplatten-Beschleunigern mit lebenslangen Upgrades.',
        discountBadge: '50% RABATT',
        discountSub: 'Lebenslange Lizenz',
        claimButtonText: 'Gutschein einlösen',
        ticketOfficial: 'OFFIZIELL',
        ticketVerified: 'GEPRÜFT'
      },
      pl: {
        title: '50% zniżki na oprogramowanie do optymalizacji Windows Abelssoft',
        description: 'Optymalizuj i zabezpieczaj swój komputer nagradzanymi narzędziami do czyszczenia rejestru i ochrony prywatności z dożywotnią licencją.',
        discountBadge: '-50% RABATU',
        discountSub: 'Licencja Dożywotnia',
        claimButtonText: 'Odbierz kupon 50%',
        ticketOfficial: 'OFICJALNY',
        ticketVerified: 'ZWERYFIKOWANY'
      },
      cs: {
        title: '50% sleva na software pro optimalizaci a zabezpečení Windows Abelssoft',
        description: 'Optimalizujte a chraňte svůj počítač oceněnými nástroji pro čištění registru a ochranu soukromí s doživotní licencí.',
        discountBadge: 'SLEVA 50 %',
        discountSub: 'Doživotní Licence',
        claimButtonText: 'Získat poukaz 50 %',
        ticketOfficial: 'OFICIÁLNÍ',
        ticketVerified: 'OVĚŘENO'
      }
    }
  },

  // 8. Airalo eSIM (GLOBAL, US, EU, GCC, UA)
  {
    id: 'net_849211',
    storeName: 'Airalo eSIM',
    storeSlug: 'airalo',
    storeCategory: 'Travel & Tours',
    code: 'ADM',
    maskedCode: '••• ADM',
    affiliateUrl: 'https://dhwnh.com/g/7rvld26bcl367099d2cc0471e42028/?i=3',
    domain: 'airalo.com',
    timerEnds: '11h 30m',
    logoUrl: '/logos/airalo.png',
    allowedRegions: ['GLOBAL', 'US', 'EU', 'GCC', 'UA'],
    locales: {
      en: {
        title: 'Save 10% on Airalo Global Travel eSIM Data Packages',
        description: 'Skip roaming fees and connect in 200+ countries instantly upon landing. Verified checkout coupon works on local and regional eSIM data passes.',
        discountBadge: '10% OFF',
        discountSub: 'Global Travel eSIM Data',
        claimButtonText: 'Claim 10% Voucher',
        ticketOfficial: 'OFFICIAL',
        ticketVerified: 'VERIFIED'
      },
      ua: {
        title: 'Знижка 10% на глобальні тревел-пакети eSIM від Airalo',
        description: 'Забудьте про дорогий роумінг та підключайтеся до інтернету у 200+ країнах світу одразу після приземлення з перевіреним ваучером.',
        discountBadge: 'ЗНИЖКА 10%',
        discountSub: 'Мобільний Інтернет за Кордоном',
        claimButtonText: 'Отримати ваучер 10%',
        ticketOfficial: 'ОФІЦІЙНИЙ',
        ticketVerified: 'ПЕРЕВІРЕНО'
      },
      ar: {
        title: 'وفر 10% على باقات بيانات السفر الدولية عبر شريحة Airalo eSIM',
        description: 'تخلص من رسوم التجوال الباهظة واتصل بالإنترنت في أكثر من 200 دولة فور وصولك مع قسيمة خصم مؤكدة.',
        discountBadge: 'خصم 10%',
        discountSub: 'بيانات السفر العالمية eSIM',
        claimButtonText: 'احصل على القسيمة',
        ticketOfficial: 'رسمي',
        ticketVerified: 'تم التحقق'
      },
      es: {
        title: 'Ahorra 10% en Paquetes de Datos eSIM para Viajes de Airalo',
        description: 'Evita los sobrecostes de roaming y conéctate en más de 200 países al instante nada más aterrizar con cupón verificado.',
        discountBadge: '10% DTO',
        discountSub: 'Datos de Viaje eSIM Global',
        claimButtonText: 'Reclamar Cupón 10%',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      pt: {
        title: 'Poupe 10% em Pacotes de Dados eSIM de Viagem da Airalo',
        description: 'Evite taxas de roaming caras e ligue-se à internet em mais de 200 países ao aterrar com cupom confirmado.',
        discountBadge: '10% OFF',
        discountSub: 'Dados de Viagem eSIM Global',
        claimButtonText: 'Resgatar Cupom 10%',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      de: {
        title: '10% Rabatt auf weltweite Reise-eSIM Datenpakete von Airalo',
        description: 'Sparen Sie teure Roaminggebühren und surfen Sie in über 200 Ländern direkt nach der Landung mit offiziellem Gutscheincode.',
        discountBadge: '10% RABATT',
        discountSub: 'Weltweite Reise-eSIM',
        claimButtonText: 'Gutschein einlösen',
        ticketOfficial: 'OFFIZIELL',
        ticketVerified: 'GEPRÜFT'
      },
      pl: {
        title: 'Zaoszczędź 10% na pakietach internetu eSIM Airalo w podróży',
        description: 'Zapomnij o drogim roamingu i łącz się z internetem w ponad 200 krajach zaraz po wylądowaniu z kodem rabatowym.',
        discountBadge: '-10% RABATU',
        discountSub: 'Pakiety Danych eSIM na Świecie',
        claimButtonText: 'Odbierz kupon 10%',
        ticketOfficial: 'OFICJALNY',
        ticketVerified: 'ZWERYFIKOWANY'
      },
      cs: {
        title: 'Ušetřete 10 % na balíčcích dat pro cestování eSIM od Airalo',
        description: 'Vyhněte se poplatkům za roaming a připojte se k síti ve více než 200 zemích hned po přistání s ověřeným poukazem.',
        discountBadge: 'SLEVA 10 %',
        discountSub: 'Globální Cestovní Data eSIM',
        claimButtonText: 'Získat poukaz 10 %',
        ticketOfficial: 'OFICIÁLNÍ',
        ticketVerified: 'OVĚŘENO'
      }
    }
  },

  // 9. Zonky (CZ, EU)
  {
    id: 'deal_zonky-cz_verified_baseline',
    storeName: 'Zonky CZ',
    storeSlug: 'zonky-cz',
    storeCategory: 'Insurance & Finance',
    code: 'ZONKYPROMO',
    maskedCode: '••• PROMO',
    affiliateUrl: 'https://ytyaz.com/g/kw5iel2aqjfa9e3fd8787b4a20a6f1/',
    domain: 'zonky.cz',
    timerEnds: '16h 40m',
    logoUrl: '/logos/zonky-cz.png',
    allowedRegions: ['CZ', 'EU'],
    locales: {
      en: {
        title: 'Zonky CZ: Fair Peer-to-Peer Loans & Financial Services',
        description: 'Secure flexible financial solutions with transparent online terms, low fixed interest rates, and no hidden fees across the Czech Republic.',
        discountBadge: 'FAIR RATES',
        discountSub: 'Verified Financial Services',
        claimButtonText: 'Claim Special Offer',
        ticketOfficial: 'OFFICIAL',
        ticketVerified: 'VERIFIED'
      },
      cs: {
        title: 'Zonky: Výhodná půjčka od lidí s nízkým úrokem bez poplatků',
        description: 'Půjčte si férově s nízkým úrokem, rychlým schválením online a nulovými skrytými poplatky u ověřené české fintech jedničky.',
        discountBadge: 'FÉROVÝ ÚROK',
        discountSub: 'Půjčka Od Lidí Bez Poplatků',
        claimButtonText: 'Získat výhodnou nabídku',
        ticketOfficial: 'OFICIÁLNÍ',
        ticketVerified: 'OVĚŘENO'
      },
      ua: {
        title: 'Zonky CZ: вигідні споживчі кредити та рефінансування в Чехії',
        description: 'Оформлюйте онлайн-позики з прозорими умовами, низькими відсотками та відсутністю прихованих платежів.',
        discountBadge: 'ЧЕСНИЙ ТАРИФ',
        discountSub: 'Кредитування Без Комісій',
        claimButtonText: 'Отримати спецпропозицію',
        ticketOfficial: 'ОФІЦІЙНИЙ',
        ticketVerified: 'ПЕРЕВІРЕНО'
      },
      ar: {
        title: 'Zonky CZ: خدمات تمويل وقروض شفافة وبأسعار فائدة منخفضة',
        description: 'حلول مالية مرنة بشروط واضحة ومعدلات فائدة ثابتة ودون أي رسوم خفية.',
        discountBadge: 'سعر مالي عادل',
        discountSub: 'تمويل موثوق ومعتمد',
        claimButtonText: 'احصل على العرض',
        ticketOfficial: 'رسمي',
        ticketVerified: 'تم التحقق'
      },
      es: {
        title: 'Zonky CZ: Préstamos Transparentes y Servicios Financieros',
        description: 'Soluciones financieras ágiles con términos online transparentes, tipos de interés fijos y sin comisiones ocultas.',
        discountBadge: 'TIPO JUSTO',
        discountSub: 'Servicios Financieros Verificados',
        claimButtonText: 'Reclamar Oferta Especial',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      pt: {
        title: 'Zonky CZ: Empréstimos Transparentes e Financiamento Justo',
        description: 'Soluções financeiras flexíveis com termos online claros, juros baixos e sem taxas ocultas.',
        discountBadge: 'TAXA JUSTA',
        discountSub: 'Financiamento Confirmado',
        claimButtonText: 'Resgatar Oferta Especial',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      de: {
        title: 'Zonky CZ: Faire Kredite & Finanzdienstleistungen online',
        description: 'Transparente Online-Finanzierungslösungen mit festen Zinsen und ohne versteckte Gebühren in der Tschechischen Republik.',
        discountBadge: 'FAIRE ZINSEN',
        discountSub: 'Geprüfte Finanzangebote',
        claimButtonText: 'Angebot sichern',
        ticketOfficial: 'OFFIZIELL',
        ticketVerified: 'GEPRÜFT'
      },
      pl: {
        title: 'Zonky CZ: Uczciwe pożyczki społecznościowe i usługi finansowe',
        description: 'Elastyczne finansowanie z przejrzystymi warunkami online, niskim stałym oprocentowaniem i bez ukrytych opłat.',
        discountBadge: 'NISKI PROCENT',
        discountSub: 'Zweryfikowane Pożyczki Online',
        claimButtonText: 'Odbierz ofertę specjalną',
        ticketOfficial: 'OFICJALNY',
        ticketVerified: 'ZWERYFIKOWANY'
      }
    }
  },

  // 10. MEGOGO PL (PL, EU)
  {
    id: 'net_817037',
    storeName: 'MEGOGO PL',
    storeSlug: 'megogo-pl',
    storeCategory: 'Gaming, Media & Software',
    code: 'MEGOGOPL',
    maskedCode: '••• GOPL',
    affiliateUrl: 'https://ficca2021.com/g/5xiedghtdqfa9e3fd878893991dc96/?i=3',
    domain: 'megogo.net',
    timerEnds: '13h 25m',
    logoUrl: '/logos/megogo-pl.png',
    allowedRegions: ['PL', 'EU'],
    locales: {
      en: {
        title: 'MEGOGO Poland: Premium Live TV Channels & Cinema Streaming',
        description: 'Stream hundreds of top European TV channels, live football events, and thousands of movies in 4K HDR quality on all connected devices.',
        discountBadge: 'SPECIAL DEAL',
        discountSub: 'TV Channels & Movies in 4K',
        claimButtonText: 'Claim TV Package',
        ticketOfficial: 'OFFICIAL',
        ticketVerified: 'VERIFIED'
      },
      pl: {
        title: 'MEGOGO Polska: Telewizja na żywo, mecze i kinowe hity w 4K',
        description: 'Oglądaj ponad 100 polskich i europejskich kanałów TV, transmisje sportowe na żywo oraz tysiące filmów i seriali w najwyższej jakości 4K.',
        discountBadge: 'PAKIET PROMO',
        discountSub: 'Telewizja na Żywo i Filmy 4K',
        claimButtonText: 'Odbierz pakiet TV',
        ticketOfficial: 'OFICJALNY',
        ticketVerified: 'ZWERYFIKOWANY'
      },
      ua: {
        title: 'MEGOGO Польща: ТБ онлайн, спортивні трансляції та прем’єри кіно',
        description: 'Дивіться рейтингові польські та європейські телеканали, футбольні матчі та величезну бібліотеку фільмів у якості 4K.',
        discountBadge: 'СПЕЦТАРИФ',
        discountSub: 'Онлайн ТБ та Фільми в 4K',
        claimButtonText: 'Підключити пакет ТБ',
        ticketOfficial: 'ОФІЦІЙНИЙ',
        ticketVerified: 'ПЕРЕВІРЕНО'
      },
      ar: {
        title: 'MEGOGO بولندا: قنوات بث تلفزيوني مباشر وسينما بدقة 4K',
        description: 'شاهد مئات القنوات التلفزيونية الأوروبية والفعاليات الرياضية المباشرة وآلاف الأفلام بجودة 4K فائقة الوضوح.',
        discountBadge: 'عرض خاص',
        discountSub: 'قنوات تلفزيونية وأفلام 4K',
        claimButtonText: 'احصل على الباقة',
        ticketOfficial: 'رسمي',
        ticketVerified: 'تم التحقق'
      },
      es: {
        title: 'MEGOGO Polonia: Canales de TV en Directo y Cine en 4K',
        description: 'Disfruta de cientos de canales de TV europeos, eventos de fútbol en vivo y miles de películas en calidad 4K en tus dispositivos.',
        discountBadge: 'OFERTA PACK',
        discountSub: 'Canales de TV y Cine 4K',
        claimButtonText: 'Reclamar Pack TV',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      pt: {
        title: 'MEGOGO Polónia: Canais de TV em Direto e Cinema em 4K',
        description: 'Assista a centenas de canais europeus, futebol em direto e milhares de filmes em qualidade 4K em todos os seus ecrãs.',
        discountBadge: 'OFERTA TV',
        discountSub: 'Canais de TV e Filmes 4K',
        claimButtonText: 'Resgatar Pacote TV',
        ticketOfficial: 'OFICIAL',
        ticketVerified: 'VERIFICADO'
      },
      de: {
        title: 'MEGOGO Polen: Live-TV-Sender, Sport & Kinofilme in 4K',
        description: 'Streamen Sie hunderte TV-Sender, Live-Fußball und tausende Blockbuster in bester 4K HDR Qualität auf all Ihren Geräten.',
        discountBadge: 'TV-ANGEBOT',
        discountSub: 'Live-TV & 4K-Streaming',
        claimButtonText: 'TV-Paket sichern',
        ticketOfficial: 'OFFIZIELL',
        ticketVerified: 'GEPRÜFT'
      },
      cs: {
        title: 'MEGOGO Polsko: Živé televizní kanály a filmy ve 4K',
        description: 'Sledujte stovky evropských televizních kanálů, živé sportovní přenosy a tisíce filmů ve špičkové kvalitě 4K.',
        discountBadge: 'SPECIÁLNÍ BALÍČEK',
        discountSub: 'Živé TV a Filmy ve 4K',
        claimButtonText: 'Získat balíček TV',
        ticketOfficial: 'OFICIÁLNÍ',
        ticketVerified: 'OVĚŘENO'
      }
    }
  }
];

/**
 * Filter deals strictly by user selected GEO.
 * If region is 'ALL', all deals are eligible.
 * Otherwise, only deals whose allowedRegions contains region or 'GLOBAL' are eligible.
 */
export function getDealsForRegion(region: string): HeroMultiGeoDeal[] {
  const norm = (region || 'GLOBAL').toUpperCase().trim();
  if (norm === 'ALL') {
    return HERO_MULTI_GEO_DEALS;
  }
  
  const filtered = HERO_MULTI_GEO_DEALS.filter(deal => 
    deal.allowedRegions.includes(norm) || (norm !== 'GCC' && norm !== 'UA' && norm !== 'CZ' && norm !== 'PL' && deal.allowedRegions.includes('GLOBAL'))
  );

  // If specific geo has matches, return them strictly
  if (filtered.length > 0) {
    return filtered;
  }

  // Fallback to global deals if no exact matches found
  return HERO_MULTI_GEO_DEALS.filter(d => d.allowedRegions.includes('GLOBAL'));
}

export const HERO_SAVINGS_BY_ID = {
  "deal_expressvpn_49": {
    "en": {
      "label": "Est. Savings",
      "value": "$60+",
      "sub": "Save 49%"
    },
    "ua": {
      "label": "Економія",
      "value": "$60+",
      "sub": "Вигода 49%"
    },
    "ar": {
      "label": "توفير تقديري",
      "value": "$60+",
      "sub": "وفر 49%"
    },
    "es": {
      "label": "Ahorro Est.",
      "value": "$60+",
      "sub": "Ahorra 49%"
    },
    "pt": {
      "label": "Poupança Est.",
      "value": "$60+",
      "sub": "Poupe 49%"
    },
    "de": {
      "label": "Ersparnis",
      "value": "$60+",
      "sub": "49% Sparen"
    },
    "pl": {
      "label": "Oszczędność",
      "value": "$60+",
      "sub": "Zyskaj 49%"
    },
    "cs": {
      "label": "Úspora",
      "value": "$60+",
      "sub": "Ušetřete 49%"
    }
  },
  "deal_hostinger_cloud_75": {
    "en": {
      "label": "Est. Savings",
      "value": "$108+",
      "sub": "Save 75%"
    },
    "ua": {
      "label": "Економія",
      "value": "$108+",
      "sub": "Вигода 75%"
    },
    "ar": {
      "label": "توفير تقديري",
      "value": "$108+",
      "sub": "وفر 75%"
    },
    "es": {
      "label": "Ahorro Est.",
      "value": "$108+",
      "sub": "Ahorra 75%"
    },
    "pt": {
      "label": "Poupança Est.",
      "value": "$108+",
      "sub": "Poupe 75%"
    },
    "de": {
      "label": "Ersparnis",
      "value": "$108+",
      "sub": "75% Sparen"
    },
    "pl": {
      "label": "Oszczędność",
      "value": "$108+",
      "sub": "Zyskaj 75%"
    },
    "cs": {
      "label": "Úspora",
      "value": "$108+",
      "sub": "Ušetřete 75%"
    }
  },
  "net_814385": {
    "en": {
      "label": "Est. Savings",
      "value": "$85+",
      "sub": "Save Up to 80%"
    },
    "ua": {
      "label": "Економія",
      "value": "$85+",
      "sub": "Знижка до 80%"
    },
    "ar": {
      "label": "توفير تقديري",
      "value": "$85+",
      "sub": "وفر حتى 80%"
    },
    "es": {
      "label": "Ahorro Est.",
      "value": "$85+",
      "sub": "Hasta 80%"
    },
    "pt": {
      "label": "Poupança Est.",
      "value": "$85+",
      "sub": "Até 80%"
    },
    "de": {
      "label": "Ersparnis",
      "value": "$85+",
      "sub": "Bis zu 80%"
    },
    "pl": {
      "label": "Oszczędność",
      "value": "$85+",
      "sub": "Do 80% taniej"
    },
    "cs": {
      "label": "Úspora",
      "value": "$85+",
      "sub": "Až 80 % sleva"
    }
  },
  "net_776832": {
    "en": {
      "label": "Est. Savings",
      "value": "$45+",
      "sub": "Save 15%"
    },
    "ua": {
      "label": "Економія",
      "value": "$45+",
      "sub": "Вигода 15%"
    },
    "ar": {
      "label": "توفير تقديري",
      "value": "$45+",
      "sub": "وفر 15%"
    },
    "es": {
      "label": "Ahorro Est.",
      "value": "$45+",
      "sub": "Ahorra 15%"
    },
    "pt": {
      "label": "Poupança Est.",
      "value": "$45+",
      "sub": "Poupe 15%"
    },
    "de": {
      "label": "Ersparnis",
      "value": "$45+",
      "sub": "15% Sparen"
    },
    "pl": {
      "label": "Oszczędność",
      "value": "$45+",
      "sub": "Zyskaj 15%"
    },
    "cs": {
      "label": "Úspora",
      "value": "$45+",
      "sub": "Ušetřete 15%"
    }
  },
  "deal_touch_smartphones_sale": {
    "en": {
      "label": "Est. Savings",
      "value": "₴3,200+",
      "sub": "Up to 30% Off"
    },
    "ua": {
      "label": "Економія",
      "value": "₴3,200+",
      "sub": "Знижка до 30%"
    },
    "ar": {
      "label": "توفير تقديري",
      "value": "₴3,200+",
      "sub": "وفر حتى 30%"
    },
    "es": {
      "label": "Ahorro Est.",
      "value": "₴3,200+",
      "sub": "Hasta 30%"
    },
    "pt": {
      "label": "Poupança Est.",
      "value": "₴3,200+",
      "sub": "Até 30%"
    },
    "de": {
      "label": "Ersparnis",
      "value": "₴3,200+",
      "sub": "Bis zu 30%"
    },
    "pl": {
      "label": "Oszczędność",
      "value": "₴3,200+",
      "sub": "Do 30% taniej"
    },
    "cs": {
      "label": "Úspora",
      "value": "₴3,200+",
      "sub": "Až 30 % sleva"
    }
  },
  "deal_polis_greencard_sale": {
    "en": {
      "label": "Est. Savings",
      "value": "₴450+",
      "sub": "Save 15%"
    },
    "ua": {
      "label": "Економія",
      "value": "₴450+",
      "sub": "Вигода 15%"
    },
    "ar": {
      "label": "توفير تقديري",
      "value": "₴450+",
      "sub": "وفر 15%"
    },
    "es": {
      "label": "Ahorro Est.",
      "value": "₴450+",
      "sub": "Ahorra 15%"
    },
    "pt": {
      "label": "Poupança Est.",
      "value": "₴450+",
      "sub": "Poupe 15%"
    },
    "de": {
      "label": "Ersparnis",
      "value": "₴450+",
      "sub": "15% Sparen"
    },
    "pl": {
      "label": "Oszczędność",
      "value": "₴450+",
      "sub": "Zyskaj 15%"
    },
    "cs": {
      "label": "Úspora",
      "value": "₴450+",
      "sub": "Ušetřete 15%"
    }
  },
  "cj-abelssoft-50off": {
    "en": {
      "label": "Est. Savings",
      "value": "€30+",
      "sub": "Save 50%"
    },
    "ua": {
      "label": "Економія",
      "value": "€30+",
      "sub": "Вигода 50%"
    },
    "ar": {
      "label": "توفير تقديري",
      "value": "€30+",
      "sub": "وفر 50%"
    },
    "es": {
      "label": "Ahorro Est.",
      "value": "€30+",
      "sub": "Ahorra 50%"
    },
    "pt": {
      "label": "Poupança Est.",
      "value": "€30+",
      "sub": "Poupe 50%"
    },
    "de": {
      "label": "Ersparnis",
      "value": "€30+",
      "sub": "50% Sparen"
    },
    "pl": {
      "label": "Oszczędność",
      "value": "€30+",
      "sub": "Zyskaj 50%"
    },
    "cs": {
      "label": "Úspora",
      "value": "€30+",
      "sub": "Ušetřete 50%"
    }
  },
  "net_849211": {
    "en": {
      "label": "Est. Savings",
      "value": "$15+",
      "sub": "Save 10%"
    },
    "ua": {
      "label": "Економія",
      "value": "$15+",
      "sub": "Вигода 10%"
    },
    "ar": {
      "label": "توفير تقديري",
      "value": "$15+",
      "sub": "وفر 10%"
    },
    "es": {
      "label": "Ahorro Est.",
      "value": "$15+",
      "sub": "Ahorra 10%"
    },
    "pt": {
      "label": "Poupança Est.",
      "value": "$15+",
      "sub": "Poupe 10%"
    },
    "de": {
      "label": "Ersparnis",
      "value": "$15+",
      "sub": "10% Sparen"
    },
    "pl": {
      "label": "Oszczędność",
      "value": "$15+",
      "sub": "Zyskaj 10%"
    },
    "cs": {
      "label": "Úspora",
      "value": "$15+",
      "sub": "Ušetřete 10%"
    }
  },
  "deal_zonky-cz_verified_baseline": {
    "en": {
      "label": "Est. Savings",
      "value": "15 000 Kč+",
      "sub": "Low Fixed Rate"
    },
    "cs": {
      "label": "Odhad úspory",
      "value": "15 000 Kč+",
      "sub": "Nízký pevný úrok"
    },
    "ua": {
      "label": "Економія",
      "value": "15 000 Kč+",
      "sub": "Низький відсоток"
    },
    "ar": {
      "label": "توفير تقديري",
      "value": "15 000 Kč+",
      "sub": "فائدة منخفضة"
    },
    "es": {
      "label": "Ahorro Est.",
      "value": "15 000 Kč+",
      "sub": "Interés Bajo"
    },
    "pt": {
      "label": "Poupança Est.",
      "value": "15 000 Kč+",
      "sub": "Juros Baixos"
    },
    "de": {
      "label": "Ersparnis",
      "value": "15 000 Kč+",
      "sub": "Niedriger Zins"
    },
    "pl": {
      "label": "Oszczędność",
      "value": "15 000 Kč+",
      "sub": "Niski procent"
    }
  },
  "net_817037": {
    "en": {
      "label": "Est. Savings",
      "value": "45 zł+",
      "sub": "Special TV Deal"
    },
    "pl": {
      "label": "Oszczędność",
      "value": "45 zł+",
      "sub": "Pakiet Promo TV"
    },
    "ua": {
      "label": "Економія",
      "value": "45 zł+",
      "sub": "Спецтариф ТБ"
    },
    "ar": {
      "label": "توفير تقديري",
      "value": "45 zł+",
      "sub": "عرض باقة خاص"
    },
    "es": {
      "label": "Ahorro Est.",
      "value": "45 zł+",
      "sub": "Pack Especial"
    },
    "pt": {
      "label": "Poupança Est.",
      "value": "45 zł+",
      "sub": "Pacote Especial"
    },
    "de": {
      "label": "Ersparnis",
      "value": "45 zł+",
      "sub": "TV-Spezialtarif"
    },
    "cs": {
      "label": "Úspora",
      "value": "45 zł+",
      "sub": "Speciální balíček"
    }
  }
};
