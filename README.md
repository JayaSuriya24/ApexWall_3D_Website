# ApexWall 3D website

Marketing site for ApexWall 3D, a direct-to-wall UV printing service in India.
Built with Next.js (App Router), TypeScript, Tailwind CSS v4 and Framer Motion.

## Pages

- `/`: home page (hero, services, 3D walkthrough, comparison, gallery, process, FAQ, contact)
- `/preview`: **Preview on Your Wall**. Visitors upload a wall photo (or use a sample room),
  place a design with perspective corner handles, and get a size and price estimate. Runs
  entirely in the browser; photos are never uploaded. Code in `src/components/wall-preview`
  and `src/lib/wall-preview`.

## Develop

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # vitest unit tests
npm run lint
npm run build
```

## Where to change things

- Contact details, WhatsApp number, form address, Google reviews link, pricing rates:
  `src/config/site.ts`
- Client reviews shown on the site: `INITIAL_TESTIMONIALS` in `src/components/sections/testimonials.tsx`
- Wall Preview design catalog (currently placeholders drawn in code): `src/lib/wall-preview/designs.ts`
- Gallery projects: `PROJECTS` in `src/components/sections/project-gallery.tsx`

## Phone verification (OTP) and leads

Visitors browse freely. A one-time code to their mobile is asked only at the moment of value:
**Download mockup**, **Share mockup**, **Send details on WhatsApp** (Wall Preview) and the
**contact form**. A verified number is remembered on that device for 30 days.

- Screen: `src/components/verify/phone-verification.tsx` (`usePhoneVerification().requireVerified(...)`)
- API: `src/app/api/verify/{send,check,session}` and `src/app/api/leads/event`
- Rules (code length, 5-min expiry, 3 tries, 30 s resend, 3 codes/number/hour, 10/IP/hour):
  `src/lib/server/config.ts`
- Database tables: `supabase/migrations/20261016000000_phone_verification.sql`
  (`leads`, `lead_events`, `otp_codes`, `otp_sends`; row level security on, server-only access)

**Development** (no keys): codes are printed in the `npm run dev` terminal and shown in the
dialog; data is kept in memory.

**Production** needs every value in `.env.example` (copy to `.env.local` or your host's
environment settings). Without them the verification API answers `503 not_configured` and
visitors are pointed to WhatsApp, so **add the keys before deploying**:

1. MSG91: create an account, complete DLT registration, create an OTP template containing
   `##OTP##`, then set `MSG91_AUTH_KEY` and `MSG91_TEMPLATE_ID`. Whitelist your server's IP
   for the auth key if MSG91's IP security is on. Confirm the send request in
   `src/lib/server/senders.ts` against your MSG91 account's API docs.
2. Supabase: create a project, run the migration SQL in the SQL editor, then set `SUPABASE_URL`
   and `SUPABASE_SERVICE_ROLE_KEY` (server only, never expose it). Optionally schedule
   `otp_cleanup()` hourly with pg_cron. View or export leads from the Table editor.
3. Cloudflare Turnstile: add a widget for your domain, then set
   `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`.
4. `SESSION_SECRET` and `OTP_HASH_SECRET`: random strings (`openssl rand -base64 32`).
5. Review the privacy policy at `/privacy` (`src/app/privacy/page.tsx`).

## Forms

The contact and feedback forms post to FormSubmit (`siteConfig.contact.formEndpoint`).
The first submission from the live site sends an activation email to that inbox; nothing is
delivered until it is confirmed.
