export interface CityDatingSafetyProfile {
  slug: string;
  cityName: string;
  stateOrRegion: string;
  country: string;
  countryCode: 'US' | 'UK' | 'CA' | 'AU';
  botDensityRate: string;
  estimatedCatfishRisk: 'ELEVATED' | 'HIGH' | 'CRITICAL';
  primaryScamVector: string;
  regionalAppSplit: {
    tinderShare: string;
    hingeShare: string;
    bumbleShare: string;
  };
  recommendedPublicVenues: Array<{
    name: string;
    neighborhood: string;
    whySafe: string;
  }>;
  lawEnforcementContact: {
    agency: string;
    reportingUrl: string;
    emergencyAdvice: string;
  };
  forensicOverview: string;
  behavioralSignals: string[];
}

export const CITIES_DATA: CityDatingSafetyProfile[] = [
  {
    slug: 'new-york',
    cityName: 'New York City',
    stateOrRegion: 'New York',
    country: 'United States',
    countryCode: 'US',
    botDensityRate: '19.4%',
    estimatedCatfishRisk: 'CRITICAL',
    primaryScamVector: 'Crypto Romance Funnels & WhatsApp Liquidity Pivot',
    regionalAppSplit: {
      tinderShare: '38%',
      hingeShare: '42%',
      bumbleShare: '20%'
    },
    recommendedPublicVenues: [
      {
        name: 'Bryant Park Reading Room & Kiosks',
        neighborhood: 'Midtown Manhattan',
        whySafe: 'High pedestrian density, open daylight seating, private security patrols.'
      },
      {
        name: 'The High Line (Chelsea Market Entrance)',
        neighborhood: 'Meatpacking / Chelsea',
        whySafe: 'Controlled public walkways with continuous pedestrian flow and visible exits.'
      },
      {
        name: 'Grand Central Market Concourse',
        neighborhood: 'Midtown East',
        whySafe: 'Zero isolated areas, rapid transit access, well-monitored surveillance coverage.'
      }
    ],
    lawEnforcementContact: {
      agency: 'FBI Internet Crime Complaint Center (IC3) & NYPD Cyber Command',
      reportingUrl: 'https://www.ic3.gov/',
      emergencyAdvice: 'Capture full unredacted chat exports before blocking extortion suspects.'
    },
    forensicOverview: 'New York remains the primary US target for cross-border pig butchering networks. Fraud syndicates exploit the high concentration of finance and technology professionals by crafting sophisticated personas claiming to manage overseas venture capital or algorithmic hedge funds.',
    behavioralSignals: [
      'Rapid migration requests from Hinge to encrypted WhatsApp within 3 to 5 message exchanges.',
      'Claims of living in luxury Manhattan high-rises (Tribeca, Hudson Yards) but refusing real-time video calls.',
      'Unsolicited screenshots displaying seven-figure balances on counterfeit liquidity exchanges.'
    ]
  },
  {
    slug: 'london',
    cityName: 'London',
    stateOrRegion: 'Greater London',
    country: 'United Kingdom',
    countryCode: 'UK',
    botDensityRate: '18.1%',
    estimatedCatfishRisk: 'HIGH',
    primaryScamVector: 'Overseas Business Impersonation & Luxury Asset Rental Traps',
    regionalAppSplit: {
      tinderShare: '34%',
      hingeShare: '46%',
      bumbleShare: '20%'
    },
    recommendedPublicVenues: [
      {
        name: 'Tate Modern Espresso & Level 1 Concourse',
        neighborhood: 'Bankside / Southwark',
        whySafe: 'High daytime footfall, public museum security, highly visible public transit lines.'
      },
      {
        name: 'Covent Garden Piazza Covered Arcades',
        neighborhood: 'Central London',
        whySafe: 'Bustling pedestrian environment with active street presence and visible staffing.'
      },
      {
        name: 'St Pancras International Station Arcade',
        neighborhood: 'Kings Cross',
        whySafe: 'Extensive CCTV coverage, direct rail infrastructure, multiple staffed café options.'
      }
    ],
    lawEnforcementContact: {
      agency: 'National Fraud Intelligence Bureau (Action Fraud UK)',
      reportingUrl: 'https://www.actionfraud.police.uk/',
      emergencyAdvice: 'Report romance fraud transactions immediately to your UK bank under the Authorised Push Payment protocol.'
    },
    forensicOverview: 'London dating app users face heavy concentration of European and West African transnational fraud networks. Syndicates frequently impersonate architecture directors, private jewelers, or maritime engineers stationed temporarily abroad.',
    behavioralSignals: [
      'Claims of urgent customs tax emergencies on parcels allegedly dispatched to London airports.',
      'Voice notes recorded in artificial acoustic spaces with synthesized background ambience.',
      'Refusal to meet anywhere outside private luxury hotel suites without prior deposit transfers.'
    ]
  },
  {
    slug: 'los-angeles',
    cityName: 'Los Angeles',
    stateOrRegion: 'California',
    country: 'United States',
    countryCode: 'US',
    botDensityRate: '21.2%',
    estimatedCatfishRisk: 'CRITICAL',
    primaryScamVector: 'Synthetic AI Influencer Profiles & Fake Modeling Contract Scams',
    regionalAppSplit: {
      tinderShare: '41%',
      hingeShare: '35%',
      bumbleShare: '24%'
    },
    recommendedPublicVenues: [
      {
        name: 'The Grove Central Courtyard',
        neighborhood: 'Fairfax / West Hollywood',
        whySafe: 'Private security, bright ambient lighting, high family and tourist presence.'
      },
      {
        name: 'Santa Monica Pier Promenade Plaza',
        neighborhood: 'Santa Monica',
        whySafe: 'Active open-air boardwalk with continuous public presence and easy parking egress.'
      },
      {
        name: 'Culver City Steps Public Terrace',
        neighborhood: 'Downtown Culver City',
        whySafe: 'Centrally situated public steps surrounded by bustling eateries and pedestrian walkways.'
      }
    ],
    lawEnforcementContact: {
      agency: 'LAPD Cyber Crimes Section & IC3',
      reportingUrl: 'https://www.ic3.gov/',
      emergencyAdvice: 'Do not pay extortion demands under threat of sharing private media; contact federal hotlines.'
    },
    forensicOverview: 'Los Angeles registers the highest density of synthetic GAN and AI-diffusion avatar profiles in the United States. Scammers steal lifestyle footage from aspiring creators, modifying vocal audio via neural cloning to deceive victims.',
    behavioralSignals: [
      'Photos exhibiting AI artifacting around jewelry, hands, or background automotive branding.',
      'Proposals to attend unverified private after-hours venues requiring prepaid guestlist entry links.',
      'Sudden demands to migrate conversation to burner messaging services with disappearing messages.'
    ]
  },
  {
    slug: 'toronto',
    cityName: 'Toronto',
    stateOrRegion: 'Ontario',
    country: 'Canada',
    countryCode: 'CA',
    botDensityRate: '15.8%',
    estimatedCatfishRisk: 'ELEVATED',
    primaryScamVector: 'Cross-Border Real Estate & Currency Exchange Deception',
    regionalAppSplit: {
      tinderShare: '36%',
      hingeShare: '43%',
      bumbleShare: '21%'
    },
    recommendedPublicVenues: [
      {
        name: 'St. Lawrence Market Atrium',
        neighborhood: 'Old Town Toronto',
        whySafe: 'Historic market hall with high daytime visibility and crowded food vendor stations.'
      },
      {
        name: 'Distillery Historic District Pedestrian Plaza',
        neighborhood: 'Distillery District',
        whySafe: 'Pedestrian-only cobblestone avenues with zero vehicular isolation risks.'
      },
      {
        name: 'Union Station Great Hall Coffee Commons',
        neighborhood: 'Financial District',
        whySafe: 'Central transit hub with constant transit constable patrols and open seating.'
      }
    ],
    lawEnforcementContact: {
      agency: 'Canadian Anti-Fraud Centre (CAFC) & Toronto Police Cyber Unit',
      reportingUrl: 'https://www.antifraudcentre-centreantifraude.ca/',
      emergencyAdvice: 'Retain all Interac e-Transfer transaction numbers and phone records for forensic reporting.'
    },
    forensicOverview: 'Toronto single professionals encounter targeted romance fraud funnels capitalizing on real estate anxiety and foreign investment opportunities. Scammers pose as successful immigrants operating commercial logistics firms.',
    behavioralSignals: [
      'Requests to send Interac e-Transfers for supposed minor travel emergencies before date one.',
      'Inconsistent time stamp responses indicating overseas operational call centers.',
      'Pressure to invest jointly in pre-construction condo developments via fake portal links.'
    ]
  },
  {
    slug: 'sydney',
    cityName: 'Sydney',
    stateOrRegion: 'New South Wales',
    country: 'Australia',
    countryCode: 'AU',
    botDensityRate: '16.9%',
    estimatedCatfishRisk: 'HIGH',
    primaryScamVector: 'Mining Engineer Impersonation & Crypto Arbitrage Traps',
    regionalAppSplit: {
      tinderShare: '39%',
      hingeShare: '41%',
      bumbleShare: '20%'
    },
    recommendedPublicVenues: [
      {
        name: 'Circular Quay Ferry Concourse Promenade',
        neighborhood: 'Sydney CBD',
        whySafe: 'Open waterfront concourse with high police presence and constant tourist foot traffic.'
      },
      {
        name: 'Surry Hills Crown Street Cafe Commons',
        neighborhood: 'Surry Hills',
        whySafe: 'Vibrant neighborhood street with continuous outdoor seating and short table turnover.'
      },
      {
        name: 'Darling Harbour Pedestrian Esplanade',
        neighborhood: 'Darling Harbour',
        whySafe: 'Well-lit pedestrian thoroughfare with multiple open hospitality venues.'
      }
    ],
    lawEnforcementContact: {
      agency: 'Australian Cyber Security Centre (Scamwatch / ACSC)',
      reportingUrl: 'https://www.scamwatch.gov.au/',
      emergencyAdvice: 'Notify IDCARE immediately if identity credentials (passport, drivers licence) were shared.'
    },
    forensicOverview: 'Sydney is heavily targeted by offshore syndicates running Australian mining executive personas. Scammers claim to be trapped on remote Western Australian drilling rigs or offshore oil platforms to justify video call avoidance.',
    behavioralSignals: [
      'Excuses regarding satellite latency or military security clearance preventing FaceTime calls.',
      'Inquiries regarding Australian tax file numbers or cryptocurrency exchange accounts (CoinSpot, Swyftx).',
      'Sudden equipment failure stories requiring urgent PayID transfer assistance.'
    ]
  },
  {
    slug: 'miami',
    cityName: 'Miami',
    stateOrRegion: 'Florida',
    country: 'United States',
    countryCode: 'US',
    botDensityRate: '22.8%',
    estimatedCatfishRisk: 'CRITICAL',
    primaryScamVector: 'Bottle Service Extortion & Spiked Drink Theft Rings',
    regionalAppSplit: {
      tinderShare: '45%',
      hingeShare: '33%',
      bumbleShare: '22%'
    },
    recommendedPublicVenues: [
      {
        name: 'Lincoln Road Pedestrian Mall Kiosks',
        neighborhood: 'South Beach',
        whySafe: 'Wide open pedestrian mall with regular municipal patrols and outdoor cafe seating.'
      },
      {
        name: 'Brickell City Centre Public Atrium',
        neighborhood: 'Brickell Financial District',
        whySafe: 'Private multi-level retail surveillance with high ambient lighting and secure exits.'
      },
      {
        name: 'Wynwood Walls Surrounding Cafés',
        neighborhood: 'Wynwood Arts District',
        whySafe: 'Populated arts boulevard with consistent pedestrian flow and visible staff.'
      }
    ],
    lawEnforcementContact: {
      agency: 'Miami-Dade Police Cyber Crimes & FBI Field Office',
      reportingUrl: 'https://www.ic3.gov/',
      emergencyAdvice: 'Always notify a trusted contact of your real-time GPS location before meeting in Miami nightlife districts.'
    },
    forensicOverview: 'Miami exhibits the highest concentration of in-person coordinated extortion scams in the country. Organized rings utilize dating apps to lure visitors to predatory clubs with inflated bottle bills or private apartment setups.',
    behavioralSignals: [
      'Insistence on meeting at a very specific lounge or club with no alternative venue discussion.',
      'Refusal to take a walk or get daytime coffee prior to late-night drinking meets.',
      'Profile age discrepancies combined with luxury rental yacht photos staged by rental agencies.'
    ]
  },
  {
    slug: 'austin',
    cityName: 'Austin',
    stateOrRegion: 'Texas',
    country: 'United States',
    countryCode: 'US',
    botDensityRate: '17.3%',
    estimatedCatfishRisk: 'ELEVATED',
    primaryScamVector: 'Tech Startup Founder Impersonation & Early Stage Investment Fraud',
    regionalAppSplit: {
      tinderShare: '37%',
      hingeShare: '44%',
      bumbleShare: '19%'
    },
    recommendedPublicVenues: [
      {
        name: 'South Congress Public Cafe Patios',
        neighborhood: 'SoCo District',
        whySafe: 'Vibrant walking district with heavy pedestrian traffic and lively storefronts.'
      },
      {
        name: 'Lady Bird Lake Boardwalk Entry Points',
        neighborhood: 'Downtown Austin',
        whySafe: 'Daylight recreation path with high jogger and cyclist traffic.'
      },
      {
        name: '2nd Street District Coffee Commons',
        neighborhood: 'Downtown / Warehouse',
        whySafe: 'Pedestrian-friendly city blocks with active street life and public visibility.'
      }
    ],
    lawEnforcementContact: {
      agency: 'Texas Department of Public Safety Cyber Crimes & IC3',
      reportingUrl: 'https://www.ic3.gov/',
      emergencyAdvice: 'Verify business entity registration on Texas Secretary of State portal before investing.'
    },
    forensicOverview: 'Austin singles face specialized romance fraud targeting tech workers and transplants. Scammers build realistic LinkedIn and Hinge identities claiming seed funding for stealth AI startups to solicit financial backing.',
    behavioralSignals: [
      'Vague startup descriptions accompanied by NDAs prior to discussing personal backgrounds.',
      'Proposals to test prototype apps that secretly install keyloggers or crypto wallet drainers.',
      'Reluctance to meet in daylight tech coworking spaces despite claimed remote founder status.'
    ]
  },
  {
    slug: 'chicago',
    cityName: 'Chicago',
    stateOrRegion: 'Illinois',
    country: 'United States',
    countryCode: 'US',
    botDensityRate: '17.9%',
    estimatedCatfishRisk: 'HIGH',
    primaryScamVector: 'Rental Housing Deposits & Romance Travel Assistance Fraud',
    regionalAppSplit: {
      tinderShare: '39%',
      hingeShare: '39%',
      bumbleShare: '22%'
    },
    recommendedPublicVenues: [
      {
        name: 'Millennium Park McCormick Plaza',
        neighborhood: 'The Loop',
        whySafe: 'High municipal security, continuous pedestrian presence, clear open plaza.'
      },
      {
        name: 'Chicago Riverwalk Concourse Cafes',
        neighborhood: 'Loop / Near North',
        whySafe: 'Scenic daylight public riverwalk with multiple egress stairwells and staffed kiosks.'
      },
      {
        name: 'Armitage Avenue Coffee Commons',
        neighborhood: 'Lincoln Park',
        whySafe: 'Residential neighborhood high street with relaxed daytime pedestrian traffic.'
      }
    ],
    lawEnforcementContact: {
      agency: 'Chicago Police Financial Crimes Unit & FBI Chicago',
      reportingUrl: 'https://www.ic3.gov/',
      emergencyAdvice: 'Never wire deposit money for someone claiming they are relocating to Chicago to be with you.'
    },
    forensicOverview: 'Chicago dating telemetry indicates seasonal spikes in romance scams during winter months. Scammers craft storylines about impending relocation to Chicago, requesting financial assistance with apartment lease deposits.',
    behavioralSignals: [
      'Claims of moving into Lincoln Park or West Loop apartments without verifiable lease paperwork.',
      'Requests for short-term Zelle transfers to clear moving trucks or utility setup fees.',
      'Inability to identify basic local geographic landmarks despite claiming Chicago roots.'
    ]
  }
];
