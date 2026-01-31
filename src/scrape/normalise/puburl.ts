export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);

    // Canonical host: remove www and use https
    let hostname = urlObj.hostname.replace(/^www\./, "");
    urlObj.protocol = "https:";
    urlObj.hostname = hostname;

    // Remove tracking parameters
    const trackingParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "fbclid",
      "gclid",
      "msclkid",
      "adclid",
    ];

    trackingParams.forEach((param) => {
      urlObj.searchParams.delete(param);
    });

    // Remove hash fragment
    urlObj.hash = "";

    // Build normalized URL
    let normalized = urlObj.toString();

    // Consistent trailing slash policy (remove trailing slash)
    normalized = normalized.replace(/\/$/, "");

    return normalized;
  } catch (e) {
    return url; // Return original if invalid URL
  }
}