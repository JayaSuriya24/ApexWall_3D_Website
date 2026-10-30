// Delivering codes and checking the bot challenge. Server only.

export type SendResult = { ok: true } | { ok: false; reason: string };

export interface CodeSender {
  send(phone: string, code: string): Promise<SendResult>;
}

/** Development: prints the code in the terminal running `npm run dev`. */
export const consoleSender: CodeSender = {
  async send(phone, code) {
    console.info(`[OTP · development mode, not sent] ${phone} → ${code}`);
    return { ok: true };
  },
};

/**
 * MSG91 SMS OTP (v5): we generate the code and pass it in, so verification stays ours.
 * The DLT-approved template must contain the ##OTP## placeholder.
 * Confirm the request shape against your MSG91 account's API docs before going live:
 * MSG91 can answer HTTP 200 with {"type":"error"}, so only "success" counts as sent.
 */
export function msg91Sender(authKey: string, templateId: string): CodeSender {
  return {
    async send(phone, code) {
      const params = new URLSearchParams({
        template_id: templateId,
        mobile: phone.replace(/^\+/, ""), // 91XXXXXXXXXX
        otp: code,
        otp_expiry: "5", // minutes
        realTimeResponse: "1",
      });
      try {
        const res = await fetch(`https://control.msg91.com/api/v5/otp?${params}`, {
          method: "POST",
          headers: { authkey: authKey, "Content-Type": "application/json" },
          cache: "no-store",
        });
        const data = (await res.json().catch(() => ({}))) as { type?: string; message?: string };
        return res.ok && data.type === "success" ? { ok: true } : { ok: false, reason: data.message || `HTTP ${res.status}` };
      } catch (err) {
        return { ok: false, reason: (err as Error).message };
      }
    },
  };
}

export interface BotCheck {
  verify(token: string | undefined, ip: string): Promise<boolean>;
}

/** Development: no challenge. */
export const noBotCheck: BotCheck = { verify: async () => true };

/** Cloudflare Turnstile server-side validation. */
export function turnstileCheck(secret: string): BotCheck {
  return {
    async verify(token, ip) {
      if (!token) return false;
      try {
        const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ secret, response: token, remoteip: ip }),
          cache: "no-store",
        });
        const data = (await res.json()) as { success?: boolean };
        return data.success === true;
      } catch {
        return false;
      }
    },
  };
}
