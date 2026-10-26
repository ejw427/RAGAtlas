/** Optional Cloudflare Web Analytics beacon (set NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN). */
export function CfAnalytics() {
  const token = process.env.NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN;
  if (!token) return null;

  return (
    <script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token })}
    />
  );
}
