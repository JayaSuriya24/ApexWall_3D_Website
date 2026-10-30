// Indian mobile numbers, shared by the browser and the server.

/** "+91XXXXXXXXXX" for a valid Indian mobile number (starts 6–9, 10 digits), else null. */
export function normalizeIndianMobile(input: string): string | null {
  let digits = input.replace(/[^\d]/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? `+91${digits}` : null;
}

/** "+91 98••••5477" — enough for the visitor to recognise their number. */
export function maskPhone(phone: string): string {
  const d = phone.replace(/^\+91/, "");
  return `+91 ${d.slice(0, 2)}••••${d.slice(-4)}`;
}
