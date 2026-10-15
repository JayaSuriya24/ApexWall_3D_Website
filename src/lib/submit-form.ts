import { siteConfig } from "@/config/site";

/**
 * Sends a form to the business inbox (FormSubmit AJAX API).
 * Throws when the message was not accepted, so callers never show a false "thank you".
 */
export async function submitForm(fields: Record<string, string>): Promise<void> {
  const res = await fetch(siteConfig.contact.formEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ ...fields, _captcha: "false" }),
  });
  if (!res.ok) throw new Error(`Form service responded ${res.status}`);
  const data: { success?: boolean | string; message?: string } = await res.json().catch(() => ({}));
  if (data.success === false || data.success === "false") {
    throw new Error(data.message || "The message was not accepted.");
  }
}
