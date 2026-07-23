import type { SupportResource } from "@/types/resource";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Schema.org NGO — معرفی خودِ سامانه در صفحه اصلی. */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: "همراه",
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    description:
      "پلتفرم پشتیبانی روانی-اجتماعی، عاطفی، آموزشی و مالی کودکان مبتلا به سرطان و خانواده‌های آن‌ها.",
    areaServed: {
      "@type": "Country",
      name: "Iran",
    },
  };
}

/**
 * Schema.org MedicalCondition — صرفاً برای زمینه‌سازی موضوعی صفحه‌ی نقشه‌راه
 * نزد موتورهای جستجو؛ توصیه‌ی بالینی یا تشخیصی نیست.
 */
export function medicalConditionSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalCondition",
    name: "سرطان کودکان",
    alternateName: "Pediatric Cancer",
    description:
      "نیازمند مراقبت هم‌زمان درمانی، روانی-اجتماعی، آموزشی و مالی برای کودک و خانواده در طول دوره‌ی درمان.",
    relevantSpecialty: [
      { "@type": "MedicalSpecialty", name: "Pediatric Oncology" },
      { "@type": "MedicalSpecialty", name: "Psychology" },
    ],
  };
}

const RESOURCE_SCHEMA_TYPE: Record<SupportResource["category"], string> = {
  accommodation: "LodgingBusiness",
  ngo: "NGO",
  charity: "NGO",
};

/** Schema.org ItemList از منابع حمایتی، برای صفحه‌ی منابع. */
export function resourceListSchema(resources: SupportResource[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: resources.map((resource, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": RESOURCE_SCHEMA_TYPE[resource.category],
        name: resource.name,
        description: resource.description,
        address: {
          "@type": "PostalAddress",
          addressLocality: resource.city,
          addressCountry: "IR",
        },
      },
    })),
  };
}
