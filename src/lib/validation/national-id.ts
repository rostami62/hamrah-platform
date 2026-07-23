/** اعتبارسنجی کد ملی ایران با الگوریتم رقم کنترلی استاندارد. */
export function validateNationalId(rawId: string): boolean {
  const id = rawId.trim();
  if (!/^\d{10}$/.test(id)) return false;
  if (/^(\d)\1{9}$/.test(id)) return false; // ۱۰ رقم یکسان، همیشه نامعتبر

  const digits = id.split("").map(Number);
  const checkDigit = digits[9]!;
  const sum = digits
    .slice(0, 9)
    .reduce((acc, digit, index) => acc + digit * (10 - index), 0);
  const remainder = sum % 11;

  return remainder < 2 ? checkDigit === remainder : checkDigit === 11 - remainder;
}
