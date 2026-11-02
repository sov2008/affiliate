import sys

def patch_file(path, target, replacement):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    if target in content:
        content = content.replace(target, replacement, 1)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print("SUCCESS")
    else:
        print("ERROR: Target not found")
        sys.exit(1)

# Patch offer-routing.service.ts
target1 = """    this.offers.set('admitad_eharmony', {
      id: 'admitad_eharmony',
      name: 'eHarmony Verified Match (Admitad)',
      network: 'admitad',
      baseUrl: process.env.ADMITAD_EHARMONY_URL || 'https://ad.admitad.com/g/eharmony_direct/',
      subParam: 'subid',
      isPrimary: false,
      enabled: true,
    });"""

cj_offers = """    this.offers.set('admitad_eharmony', {
      id: 'admitad_eharmony',
      name: 'eHarmony Verified Match (Admitad)',
      network: 'admitad',
      baseUrl: process.env.ADMITAD_EHARMONY_URL || 'https://ad.admitad.com/g/eharmony_direct/',
      subParam: 'subid',
      isPrimary: false,
      enabled: true,
    });

    this.offers.set('cj_eharmony', {
      id: 'cj_eharmony',
      name: 'eharmony Verified Match (CJ)',
      network: 'cj',
      baseUrl: process.env.CJ_EHARMONY_URL || 'https://www.anrdoezrs.net/click-101907236-11286030-1613519330000',
      subParam: 'sid',
      isPrimary: false,
      enabled: true,
    });

    this.offers.set('cj_booking', {
      id: 'cj_booking',
      name: 'Booking.com Hotels & Venues (CJ)',
      network: 'cj',
      baseUrl: process.env.CJ_BOOKING_URL || 'https://www.jdoqocy.com/click-101907236-15231602-1779906169000',
      subParam: 'sid',
      isPrimary: false,
      enabled: true,
    });

    this.offers.set('cj_booking_attractions', {
      id: 'cj_booking_attractions',
      name: 'Booking.com Attractions & Experience (CJ)',
      network: 'cj',
      baseUrl: 'https://www.tkqlhce.com/click-101907236-17254615-1779912213000',
      subParam: 'sid',
      isPrimary: false,
      enabled: true,
    });

    this.offers.set('cj_abelssoft', {
      id: 'cj_abelssoft',
      name: 'Abelssoft PC Utilities (CJ)',
      network: 'cj',
      baseUrl: 'https://www.anrdoezrs.net/click-8102806-15509939',
      subParam: 'sid',
      isPrimary: false,
      enabled: true,
    });"""

patch_file('/var/www/affiliate/core/src/services/offer-routing.service.ts', target1, cj_offers)

# Patch tds.router.ts to support CJ sid parameter
target2 = """    if (targetOffer?.network === 'admitad') {
      const sub3 = (query.sub3 || query.s3 || query.trigger || 'cta') as string;
      destinationUrl = `${cleanBase}${sep}subid=${encodeURIComponent(String(clickId))}&subid1=${encodeURIComponent(String(sub1))}&subid2=${encodeURIComponent(String(sub2))}&subid3=${encodeURIComponent(String(sub3))}`;
    } else {
      destinationUrl = `${cleanBase}${sep}sub1=${encodeURIComponent(String(sub1))}&sub2=${encodeURIComponent(String(sub2))}&cid=${encodeURIComponent(String(clickId))}`;
    }"""

cj_tds_support = """    if (targetOffer?.network === 'admitad') {
      const sub3 = (query.sub3 || query.s3 || query.trigger || 'cta') as string;
      destinationUrl = `${cleanBase}${sep}subid=${encodeURIComponent(String(clickId))}&subid1=${encodeURIComponent(String(sub1))}&subid2=${encodeURIComponent(String(sub2))}&subid3=${encodeURIComponent(String(sub3))}`;
    } else if (targetOffer?.network === 'cj') {
      const sid = `${sub1}_${clickId}`.slice(0, 64);
      destinationUrl = `${cleanBase}${sep}sid=${encodeURIComponent(sid)}`;
    } else {
      destinationUrl = `${cleanBase}${sep}sub1=${encodeURIComponent(String(sub1))}&sub2=${encodeURIComponent(String(sub2))}&cid=${encodeURIComponent(String(clickId))}`;
    }"""

patch_file('/var/www/affiliate/core/src/server/routes/tds.router.ts', target2, cj_tds_support)
