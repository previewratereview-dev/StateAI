# State AI - Production Launch Checklist

Follow these steps before making your final deployment to production on Vercel or any other hosting provider.

## 1. Environment Variables ✅
- [ ] Ensure `.env.local` contains correct production values for Supabase, Resend, or other APIs.
- [ ] Add the same environment variables to the **Vercel Project Settings > Environment Variables**.

## 2. Domain & DNS ✅
- [ ] You have confirmed the domain is `https://stateai.in`.
- [ ] In Vercel, go to Settings > Domains, and add `stateai.in`.
- [ ] Update your domain registrar's DNS settings (A record or CNAME) to point to Vercel's servers.

## 3. SEO & Analytics Verification ✅
- [x] `sitemap.xml` is configured (using `sitemap.ts`).
- [x] `robots.txt` is configured (using `robots.ts`).
- [x] `metadata` object is configured with OpenGraph and Twitter tags in `layout.tsx`.
- [x] **Vercel Analytics** is installed and configured in `layout.tsx`. (Ensure you have "Web Analytics" enabled on the Vercel Dashboard for this project).

## 4. Performance & Testing ✅
- [ ] Run a local production build to catch build-time errors:
  ```bash
  npm run build
  npm start
  ```
- [ ] Run Google Lighthouse on the production URL after deployment to ensure high scores in Performance, Accessibility, and SEO.

## 5. Next Steps Post-Launch 🚀
- [ ] Submit your `sitemap.xml` to Google Search Console to speed up indexing.
- [ ] Monitor Vercel Analytics for traffic insights.
