/** Public origin for metadata and the sitemap. Vercel injects the production
 *  hostname at build time, so a forgotten NEXT_PUBLIC_SITE_URL no longer
 *  ships localhost links. */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
