import axios, { AxiosRequestConfig } from "axios";

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) Gecko/20100101 Firefox/121.0",
];

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const getRandomUserAgent = () =>
  USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

type FetchOptions = {
  retries?: number;
  timeout?: number;
  minDelayMs?: number;
};

export async function fetchWithRetry(
  url: string,
  options: FetchOptions = {}
) {
  const {
    retries = 3,
    timeout = 10_000,
    minDelayMs = 1_000,
  } = options;

  let attempt = 0;

  while (attempt <= retries) {
    try {
      const config: AxiosRequestConfig = {
        timeout,
        headers: {
          "User-Agent": getRandomUserAgent(),
          "Accept-Language": "en-US,en;q=0.9",
          Accept: "text/html,application/xhtml+xml",
          Connection: "keep-alive",
        },
      };

      return await axios.get(url, config);
    } catch (error: any) {
      attempt++;

      if (attempt > retries) throw error;

      const backoff =
        minDelayMs * Math.pow(2, attempt) +
        Math.floor(Math.random() * 500);

      console.warn(
        `⚠ Fetch failed (${attempt}/${retries}) — retrying in ${backoff}ms`
      );

      await sleep(backoff);
    }
  }

  throw new Error("Unreachable");
}
