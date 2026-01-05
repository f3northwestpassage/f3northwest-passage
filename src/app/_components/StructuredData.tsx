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

  // Event Series Schema for recurring workouts
  // Using a generic upcoming Monday as start date since workouts are recurring
  const getNextMonday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    nextMonday.setHours(5, 30, 0, 0);
    return nextMonday.toISOString();
  };

  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'EventSeries',
    name: `${regionName} Workouts`,
    description: 'Free, peer-led outdoor fitness workouts for men. Workouts are held Monday through Saturday mornings.',
    image: `${baseUrl}/logo.png`,
    startDate: getNextMonday(),
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
    performer: {
      '@type': 'Organization',
      name: regionName,
    },
    isAccessibleForFree: true,
    eventSchedule: {
      '@type': 'Schedule',
      repeatFrequency: 'P1D',
      byDay: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `${baseUrl}/workouts`,
      validFrom: new Date().toISOString(),
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
