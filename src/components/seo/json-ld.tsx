/** تزریق امن JSON-LD؛ چون خروجی از توابع schema.ts (نه ورودی کاربر) است، خطر XSS ندارد. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
