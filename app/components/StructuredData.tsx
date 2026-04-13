interface LocalBusinessProps {
  name: string;
  description: string;
  url: string;
  telephone: string;
  email: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  image?: string;
  priceRange?: string;
}

interface TouristTripProps {
  name: string;
  description: string;
  provider: string;
  location: string;
  duration: string;
  price?: string;
  image?: string;
}

interface ProductProps {
  name: string;
  description: string;
  brand: string;
  offers?: {
    price: string;
    priceCurrency: string;
    availability: string;
  };
  image?: string;
}

export function LocalBusinessStructuredData({
  name,
  description,
  url,
  telephone,
  email,
  address,
  image,
  priceRange,
}: LocalBusinessProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    description,
    url,
    telephone,
    email,
    address: {
      "@type": "PostalAddress",
      ...address,
    },
    image,
    priceRange,
    sameAs: [
      "https://www.instagram.com/blueoneyacht",
      "https://www.facebook.com/blueoneyacht",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}

export function TouristTripStructuredData({
  name,
  description,
  provider,
  location,
  duration,
  price,
  image,
}: TouristTripProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name,
    description,
    provider: {
      "@type": "Organization",
      name: provider,
    },
    location: {
      "@type": "Place",
      name: location,
    },
    duration,
    offers: price ? {
      "@type": "Offer",
      price,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
    } : undefined,
    image,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}

export function ProductStructuredData({
  name,
  description,
  brand,
  offers,
  image,
}: ProductProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    brand: {
      "@type": "Brand",
      name: brand,
    },
    offers: offers ? {
      "@type": "Offer",
      ...offers,
    } : undefined,
    image,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}
