import Script from 'next/script';

interface StructuredDataProps {
  localeData?: {
    region_name?: string;
    region_city?: string;
    region_state?: string;
    region_facebook?: string;
    region_instagram?: string;
    region_x_twitter?: string;
    meta_description?: string;
  };
}

export default function StructuredData({ localeData }: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://f3northwestpassage.com';
  const regionName = localeData?.region_name || 'F3 Northwest Passage';
  const city = localeData?.region_city || '';
  const state = localeData?.region_state || '';
  const description = localeData?.meta_description ||
    'Free, peer-led outdoor fitness workouts for men. No membership fees. All fitness levels welcome.';

  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: regionName,
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: description,
    foundingDate: '2011',
    sameAs: [
      localeData?.region_facebook,
      localeData?.region_instagram,
      localeData?.region_x_twitter,
    ].filter(Boolean),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'General Inquiries',
      url: `${baseUrl}/contact`,
    },
  };

  // Local Business Schema
  const localBusinessSchema = city && state ? {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    name: regionName,
    description: description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: city,
      addressRegion: state,
      addressCountry: 'US',
    },
    url: baseUrl,
    priceRange: 'FREE',
    openingHours: 'Mo-Sa 05:00-07:00',
    isAccessibleForFree: true,
  } : null;

  // Event Schema for workouts
  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `${regionName} Workouts`,
    description: 'Free, peer-led outdoor fitness workouts for men',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: city && state ? {
      '@type': 'Place',
      name: regionName,
      address: {
        '@type': 'PostalAddress',
        addressLocality: city,
        addressRegion: state,
        addressCountry: 'US',
      },
    } : undefined,
    organizer: {
      '@type': 'Organization',
      name: regionName,
      url: baseUrl,
    },
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `${baseUrl}/workouts`,
    },
  };

  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      {localBusinessSchema && (
        <Script
          id="local-business-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema),
          }}
        />
      )}
      <Script
        id="event-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(eventSchema),
        }}
      />
    </>
  );
}
