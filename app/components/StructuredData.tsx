"use client"

export default function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "ADAM Capacitación",
    "alternateName": "Centro de Capacitación ADAM",
    "url": "https://www.adam.cl",
    "logo": "https://www.adam.cl/logo.png",
    "description": "Centro de capacitación profesional en operación de maquinaria pesada. Cursos certificados SENCE.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "CL",
      "addressLocality": "Chile"
    },
    "sameAs": [
      "https://www.facebook.com/adamcapacitacion",
      "https://www.instagram.com/adamcapacitacion"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["Spanish"]
    }
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ADAM Capacitación",
    "url": "https://www.adam.cl",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.adam.cl/buscar?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": "https://www.adam.cl"
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  )
}
