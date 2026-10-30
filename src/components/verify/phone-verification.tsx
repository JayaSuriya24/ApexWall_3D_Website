"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ShieldCheck, Smartphone, X } from "lucide-react";
import { PillButton } from "@/components/ui/pill-button";
import { normalizeIndianMobile, maskPhone } from "@/lib/phone";
import { useOverlay } from "@/lib/use-overlay";

// Phone verification at the moment of value: the site stays open, and a visitor verifies
// their number by OTP only when they download, share or ask for a quote.

type Verified = { phone: string; masked: string };
type Pending = { title: string; actionLabel: string; onContinue: (v: Verified) => void };

interface VerificationApi {
  /** null while checking, then the verified number or false. */
  verified: Verified | false | null;
  /**
   * Runs `onContinue` straight away if verified; otherwise asks for the number first.
   * After verifying, `onContinue` runs from the visitor's own "Continue" tap, so
   * downloads and the share sheet still count as their action.
   */
  requireVerified: (p: Pending) => void;
  /** Records what the verified visitor did (fire and forget). */
  recordLead: (action: "mockup_download" | "mockup_share" | "whatsapp_quote" | "contact_form", details?: Record<string, string | number>) => void;
}

const Ctx = createContext<VerificationApi | null>(null);

export function usePhoneVerification() {
  const api = useContext(Ctx);
  if (!api) throw new Error("usePhoneVerification must be used inside <PhoneVerificationProvider>");
  return api;
}

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function PhoneVerificationProvider({ children }: { children: ReactNode }) {
  const [verified, setVerified] = useState<Verified | false | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/verify/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => alive && setVerified(d.verified ? { phone: d.phone, masked: d.masked } : false))
      .catch(() => alive && setVerified(false));
    return () => {
      alive = false;
    };
  }, []);

  const requireVerified = useCallback(
    (p: Pending) => {
      if (verified) p.onContinue(verified);
      else setPending(p);
    },
    [verified],
  );

  const recordLead = useCallback<VerificationApi["recordLead"]>((action, details = {}) => {
    fetch("/api/leads/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, details }),
      keepalive: true,
    }).catch(() => {});
  }, []);

  return (
    <Ctx.Provider value={{ verified, requireVerified, recordLead }}>
      {children}
      <AnimatePresence>
        {pending && (
          <VerifyDialog
            pending={pending}
            onClose={() => setPending(null)}
            onVerified={(v) => setVerified(v)}
          />
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}

// ---------- the dialog ----------

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: { sitekey: string; callback: (token: string) => void; "expired-callback"?: () => void }) => string;
      reset: (id?: string) => void;
    };
  }
}

const ERRORS: Record<string, string> = {
  invalid_phone: "Please enter a valid 10-digit Indian mobile number.",
  consent_required: "Please tick the box to agree before we send the code.",
  bot_check_failed: "We couldn't confirm you're not a bot. Please try the check again.",
  too_soon: "A code was just sent. Please wait a moment before asking for another.",
  too_many: "Too many codes requested for this number. Please try again in an hour.",
  send_failed: "We couldn't send the code right now. Please try again shortly.",
  not_configured: "Phone verification isn't available right now. Please message us on WhatsApp instead.",
  invalid_code: "That code isn't right.",
  no_code: "Please request a new code.",
  expired: "That code has expired. Please request a new one.",
  locked: "Too many wrong tries. Please request a new code.",
  network: "Connection problem. Please check your internet and try again.",
};

async function post(url: string, body: unknown) {
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return { ok: false, error: "network" };
  }
}

function VerifyDialog({
  pending,
  onClose,
  onVerified,
}: {
  pending: Pending;
  onClose: () => void;
  onVerified: (v: Verified) => void;
}) {
  const [step, setStep] = useState<"phone" | "code" | "done">("phone");
  const [phoneInput, setPhoneInput] = useState("");
  const [consent, setConsent] = useState(false);
  const [botToken, setBotToken] = useState<string | undefined>();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [verifiedNow, setVerifiedNow] = useState<Verified | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileId = useRef<string | undefined>(undefined);
  useOverlay(true, onClose);

  const phone = normalizeIndianMobile(phoneInput);

  // Bot check (Cloudflare Turnstile) when a site key is configured
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || step !== "phone") return;
    const render = () => {
      if (turnstileRef.current && window.turnstile && !turnstileId.current) {
        turnstileId.current = window.turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: setBotToken,
          "expired-callback": () => setBotToken(undefined),
        });
      }
    };
    if (window.turnstile) return render();
    const existing = document.querySelector<HTMLScriptElement>("script[data-turnstile]");
    const script = existing ?? Object.assign(document.createElement("script"), { src: "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit", async: true });
    script.dataset.turnstile = "1";
    script.addEventListener("load", render);
    if (!existing) document.head.appendChild(script);
    return () => script.removeEventListener("load", render);
  }, [step]);

  // Resend countdown
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  async function sendCode() {
    if (!phone || !consent || busy) return;
    setBusy(true);
    setError(null);
    const r = await post("/api/verify/send", { phone, consent, botToken });
    setBusy(false);
    if (r.ok) {
      setStep("code");
      setCode("");
      setResendIn(Number(r.resendInSeconds) || 30);
      setDevCode(typeof r.devCode === "string" ? r.devCode : null);
    } else {
      setError(ERRORS[String(r.error)] ?? ERRORS.send_failed);
      if (r.retryInSeconds) setResendIn(Number(r.retryInSeconds));
      if (TURNSTILE_SITE_KEY) {
        window.turnstile?.reset(turnstileId.current);
        setBotToken(undefined);
      }
    }
  }

  async function checkCode(value = code) {
    if (value.length !== 6 || busy) return;
    setBusy(true);
    setError(null);
    const r = await post("/api/verify/check", { phone, code: value, source: location.pathname });
    setBusy(false);
    if (r.ok) {
      const v = { phone: String(r.phone), masked: String(r.masked) };
      setVerifiedNow(v);
      onVerified(v);
      setStep("done");
    } else {
      const left = r.attemptsLeft ? ` ${r.attemptsLeft} ${r.attemptsLeft === 1 ? "try" : "tries"} left.` : "";
      setError((ERRORS[String(r.error)] ?? ERRORS.invalid_code) + left);
      setCode("");
      if (r.error === "locked" || r.error === "expired" || r.error === "no_code") setResendIn(0);
    }
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center sm:items-center sm:px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/45 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ type: "spring", duration: 0.45, bounce: 0.2 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="verify-title"
        className="relative z-10 w-full max-w-md rounded-t-[28px] border border-card-border bg-card-bg p-6 pb-8 shadow-2xl sm:rounded-[28px] sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-2 text-muted hover:bg-highlight hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        {step === "phone" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendCode();
            }}
            className="flex flex-col gap-4"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-highlight text-primary-strong">
              <Smartphone className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h2 id="verify-title" className="font-display text-2xl font-semibold text-foreground">
                {pending.title}
              </h2>
              <p className="mt-1 text-sm text-muted">We&apos;ll send a 6-digit code to your mobile. It takes a few seconds.</p>
            </div>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
              Mobile number
              <span className="flex items-center rounded-xl border border-card-border bg-background focus-within:ring-2 focus-within:ring-primary">
                <span className="border-r border-card-border px-3 py-3 text-muted">+91</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  autoFocus
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value.replace(/[^\d\s+-]/g, "").slice(0, 16))}
                  placeholder="98765 43210"
                  aria-invalid={phoneInput.length >= 10 && !phone}
                  className="w-full min-w-0 bg-transparent px-3 py-3 text-base text-foreground outline-none placeholder:text-muted"
                />
              </span>
            </label>
            <label className="flex items-start gap-3 text-xs leading-relaxed text-muted">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-primary-strong"
              />
              <span>
                I agree that ApexWall 3D may contact me on this number about my enquiry, as described in the{" "}
                <Link href="/privacy" target="_blank" className="underline hover:text-foreground">
                  privacy policy
                </Link>
                .
              </span>
            </label>
            {TURNSTILE_SITE_KEY && <div ref={turnstileRef} className="min-h-[65px]" />}
            {error && (
              <p role="alert" className="text-sm text-[#b5523b]">
                {error}
              </p>
            )}
            <PillButton type="submit" variant="primary" disabled={!phone || !consent || busy || (Boolean(TURNSTILE_SITE_KEY) && !botToken)} className="w-full py-3">
              {busy ? "Sending…" : "Send OTP"}
            </PillButton>
            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Used only to reply to your enquiry. Never shared or sold.
            </p>
          </form>
        )}

        {step === "code" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              checkCode();
            }}
            className="flex flex-col gap-4"
          >
            <div>
              <h2 id="verify-title" className="font-display text-2xl font-semibold text-foreground">
                Enter the code
              </h2>
              <p className="mt-1 text-sm text-muted">
                Sent to {phone ? maskPhone(phone) : "your number"} ·{" "}
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setError(null);
                  }}
                  className="underline hover:text-foreground"
                >
                  Change number
                </button>
              </p>
            </div>
            {devCode && (
              <p className="rounded-xl bg-highlight px-3 py-2 text-xs text-foreground">
                Development mode: no SMS is sent. Your code is <strong className="tracking-widest">{devCode}</strong>.
              </p>
            )}
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              aria-label="6-digit code"
              maxLength={6}
              value={code}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                setCode(v);
                if (v.length === 6) checkCode(v); // submit as soon as the code is complete (incl. auto-fill)
              }}
              placeholder="••••••"
              className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-center font-display text-3xl tracking-[0.5em] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            {error && (
              <p role="alert" className="text-sm text-[#b5523b]">
                {error}
              </p>
            )}
            <PillButton type="submit" variant="primary" disabled={code.length !== 6 || busy} className="w-full py-3">
              {busy ? "Checking…" : "Verify"}
            </PillButton>
            <button
              type="button"
              disabled={resendIn > 0 || busy}
              onClick={sendCode}
              className="text-sm font-medium text-primary-strong underline-offset-2 hover:underline disabled:text-muted disabled:no-underline"
            >
              {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
            </button>
          </form>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center gap-4 text-center" role="status">
            <CheckCircle2 className="h-14 w-14 text-success" aria-hidden="true" />
            <div>
              <h2 id="verify-title" className="font-display text-2xl font-semibold text-foreground">
                Number verified
              </h2>
              <p className="mt-1 text-sm text-muted">{verifiedNow?.masked} · you won&apos;t be asked again on this device.</p>
            </div>
            <PillButton
              type="button"
              variant="primary"
              autoFocus
              className="w-full py-3"
              onClick={() => {
                // Runs inside this tap, so downloads and sharing still count as the visitor's action
                if (verifiedNow) pending.onContinue(verifiedNow);
                onClose();
              }}
            >
              {pending.actionLabel}
            </PillButton>
          </div>
        )}
      </motion.div>
    </div>
  );
}
