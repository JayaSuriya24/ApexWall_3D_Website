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

## Forms

The contact and feedback forms post to FormSubmit (`siteConfig.contact.formEndpoint`).
The first submission from the live site sends an activation email to that inbox; nothing is
delivered until it is confirmed.
