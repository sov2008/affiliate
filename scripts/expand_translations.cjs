const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../deals-portal/src/data/dealTranslations.ts');
let content = fs.readFileSync(filePath, 'utf8');

const GLOBAL_HERO_TRANSLATIONS = `
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
`;

const insertIndex = content.lastIndexOf('};');
if (insertIndex !== -1 && !content.includes('deal_expressvpn_49')) {
  content = content.slice(0, insertIndex) + GLOBAL_HERO_TRANSLATIONS + content.slice(insertIndex);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('SUCCESS: Injected Global Headliner translations into dealTranslations.ts');
} else {
  console.log('ALREADY PRESENT or failed to find insertion point');
}

