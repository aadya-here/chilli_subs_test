let lastRequestTime = 0;

export async function rateLimit(minIntervalMs = 1500) {
  const now = Date.now();
  const waitTime = lastRequestTime + minIntervalMs - now;

  if (waitTime > 0) {
    await new Promise((r) => setTimeout(r, waitTime));
  }

  lastRequestTime = Date.now();
}
