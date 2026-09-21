/**
 * Schema.org Structured Data Generators (JSON-LD)
 * Fully compliant with Google Search Central & Schema.org standards
 */

export interface BreadcrumbEntry {
  name: string;
  url: string;
}

export interface ArticleSchemaInput {
  title: string;
  description: string;
  canonicalUrl: string;
  coverImageUrl: string;
  pubDate: Date;
  authorName?: string;
  authorUrl?: string;
  categoryName?: string;
  keywords?: string[];
  wordCount?: number;
  siteUrl?: string;
}

export interface CollectionItemInput {
  title: string;
  url: string;
  datePublished?: string;
  description?: string;
}

/**
 * Organization: Cheltenham Forensic Desk / FlirtCheck
 */
export function buildOrganizationSchema(siteUrl = 'https://flirtcheck.site') {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    '@id': `${siteUrl}/#organization`,
    name: 'FlirtCheck Independent Forensics',
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/apple-touch-icon.png`,
      width: 180,
      height: 180
    },
    founder: {
      '@type': 'Person',
      name: 'Arthur Vance',
      jobTitle: 'Lead Forensic Desk',
      url: `${siteUrl}/desk`
    },
    publishingPrinciples: `${siteUrl}/desk`,
    description: 'Independent investigative bureau analyzing commercial matchmaking algorithms, synthetic bot swarms, and dating app fraud vectors.'
  };
}

/**
 * WebSite Schema with SearchAction
 */
export function buildWebSiteSchema(siteUrl = 'https://flirtcheck.site') {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: siteUrl,
    name: 'FlirtCheck Independent Forensics',
    description: 'Empirical reports, dating algorithm teardowns, and fraud telemetry from the Cheltenham Desk.',
    publisher: {
      '@id': `${siteUrl}/#organization`
    },
    inLanguage: 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

/**
 * BreadcrumbList Schema
 */
export function buildBreadcrumbSchema(items: BreadcrumbEntry[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

/**
 * Article Schema (Full Google Rich Results specification)
 */
export function buildArticleSchema(input: ArticleSchemaInput) {
  const siteUrl = input.siteUrl || 'https://flirtcheck.site';
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    '@id': `${input.canonicalUrl}#article`,
    isPartOf: {
      '@id': `${siteUrl}/#website`
    },
    headline: input.title,
    description: input.description,
    image: {
      '@type': 'ImageObject',
      url: input.coverImageUrl,
      width: 1200,
      height: 675
    },
    datePublished: input.pubDate.toISOString(),
    dateModified: input.pubDate.toISOString(),
    inLanguage: 'en-US',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': input.canonicalUrl
    },
    author: {
      '@type': 'Person',
      name: input.authorName || 'Arthur Vance',
      jobTitle: 'Lead Forensic Desk',
      url: input.authorUrl || `${siteUrl}/desk`,
      image: `${siteUrl}/images/author/arthur-vance-avatar.webp`,
      sameAs: [`${siteUrl}/desk`]
    },
    publisher: {
      '@type': 'Organization',
      name: 'FlirtCheck Independent Forensics',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/apple-touch-icon.png`
      }
    },
    articleSection: input.categoryName || 'Safety & Scams',
    keywords: (input.keywords || []).join(', '),
    ...(input.wordCount ? { wordCount: input.wordCount } : {})
  };
}

/**
 * Author / Bureau Profile Schema (AboutPage + ProfilePage)
 */
export function buildAuthorProfileSchema(siteUrl = 'https://flirtcheck.site') {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${siteUrl}/desk#profile`,
    url: `${siteUrl}/desk`,
    name: 'Arthur Vance // Lead Forensic Desk Manifesto',
    description: 'Investigative dossier, research methodology, and independence manifesto of Arthur Vance.',
    mainEntity: {
      '@type': 'Person',
      '@id': `${siteUrl}/desk#person`,
      name: 'Arthur Vance',
      jobTitle: 'Lead Forensic Desk',
      worksFor: {
        '@id': `${siteUrl}/#organization`
      },
      image: `${siteUrl}/images/author/arthur-vance-desk.webp`,
      url: `${siteUrl}/desk`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Cheltenham',
        addressRegion: 'Gloucestershire',
        addressCountry: 'GB'
      },
      knowsAbout: [
        'Reverse Image Search & Metadata Analysis',
        'Commercial Dating Matching Algorithms (ELO ranking)',
        'Synthetic Identity & GAN Face Detection',
        'Pig-Butchering Financial Fraud Funnels',
        'Automated Bot Farm Pattern Recognition'
      ]
    }
  };
}

/**
 * CollectionPage Schema for Archive & Category Feeds
 */
export function buildCollectionPageSchema(
  name: string,
  description: string,
  url: string,
  items: CollectionItemInput[],
  siteUrl = 'https://flirtcheck.site'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#collection`,
    name,
    description,
    url,
    isPartOf: {
      '@id': `${siteUrl}/#website`
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: item.url,
        name: item.title,
        ...(item.description ? { description: item.description } : {}),
        ...(item.datePublished ? { datePublished: item.datePublished } : {})
      }))
    }
  };
}
