import axios from "axios";
import * as cheerio from "cheerio";
import { prisma } from "../../server/prisma";
// import { upsertPublication } from "../upsert/upsert_test";
import { normalizeUrl } from "../normalise/puburl";
import { normalizeName } from "../normalise/pubName";
import { normaliseDate } from "../normalise/mokshaDeadline";
import { time } from "console";
import { rateLimit } from "@/src/utils/rateLimiter";
import {fetchWithRetry } from "@/src/utils/fetcherLAyer";

type PublicationInfo = {
  title: string;
  baseURL: string;
  pubURL: string;
  guidelineURL: string;
  description: string;
  genres: string[];
  isOpen: boolean;
  submissions: OpenSubmissionInfo[]; // now stores multiple submissions
};

type OpenSubmissionInfo = {
  genre: string;
  description: string;
  subURL: string;
  subDate: string;
  subTime: string; 
  subTimezone: string;
};

const defaultSubmission: OpenSubmissionInfo = {
  genre: "",
  description: "",
  subURL: "",
  subDate: "",
  subTime: "",
  subTimezone: "",
};

const defaultPublication: PublicationInfo = {
  title: "",
  baseURL: "",
  pubURL: "",
  guidelineURL: "",
  description: "",
  genres: [],
  isOpen: false,
  submissions: [],
};

const genres_total = [] as string[]; // global accumulator (unique)

async function scrapePublication(url: string): Promise<PublicationInfo> {
  // Create a fresh local publication per scrape
  const publication: PublicationInfo = { ...defaultPublication, baseURL: url.toString() };

  const response = await fetchWithRetry(url, {
    retries: 3,
    timeout: 12_000,
  });

  const html = response.data;
  const $ = cheerio.load(html);

  publication.title = $("h1").first().text().trim();

  const guidelineLinks: string[] = [];
  $("div.guidelines a").each((_, el) => {
    const href = $(el).attr("href");
    if (href) {
      guidelineLinks.push(href);
    }
  });

  console.log(`Found ${guidelineLinks.length} guideline links`);

  if (guidelineLinks.length === 2) {
    publication.guidelineURL = guidelineLinks[0];
    publication.pubURL = guidelineLinks[1];
    console.log("✓ Both guideline and pub URLs assigned");
  } else if (guidelineLinks.length === 1) {
    publication.guidelineURL = guidelineLinks[0];
    publication.pubURL = "";
    console.log("⚠ Only 1 link found, assigned to guidelineURL");
  } else {
    console.log("✗ No guideline links found");
  }

  publication.description = $("div.description").first().text().trim();

  // Per-publication genres and submissions
  const pubGenres: string[] = [];
  const submissions: OpenSubmissionInfo[] = [];

  $("div.subtype-button").each((_, el) => {
    const genre = $(el).find("h2").text().trim();
    if (genre) {
      pubGenres.push(genre);

      // Add to global genres_total only if not already present
      if (!genres_total.includes(genre)) {
        genres_total.push(genre);
      }
    }

    const isDisabled = $(el).hasClass("disabled");

    if (!isDisabled) {
      const submission: OpenSubmissionInfo = {
        genre: genre || $(el).find("h2").text().trim(),
        description: $(el).find("p").first().text().trim(),
        subURL: $(el).find(".new-submission a").attr("href") || "",
        subDate: "",
        subTime: "",
        subTimezone: "",
      };

      // Get deadline text from the submission period element
      const deadlineText = $(el).find(".mt-3.submission-period").first().text().trim();

      if (deadlineText) {
        const deadline = normaliseDate(deadlineText);
        submission.subDate = deadline.subDate;
        submission.subTime = deadline.subTime;
        submission.subTimezone = deadline.subTimezone;
      }

      submissions.push(submission);
    }
  });

  if (submissions.length > 0 ){
    publication.isOpen = true;
  }
  
  publication.genres = pubGenres;
  publication.submissions = submissions;

  console.log("Submissions:", submissions);
  console.log(publication);

  return publication;
}

async function main() {
  console.log("Fetching all sources from DB...\n");
  const sources = await prisma.source.findMany();
  console.log(`Found ${sources.length} sources\n`);

  for (const source of sources) {
    try {
      console.log(`📄 Scraping ${source.puburl}`);
      const pub = await scrapePublication(source.puburl);

      // You can now upsert or process `pub` which includes:
      // - `pub.genres` (only that publication's genres)
      // - `pub.openForSubmission` (array of all open submission types)
      // - `genres_total` (global unique list across scrapes)

      // Example log:
      console.log(`→ ${pub.title} — genres: ${pub.genres.length}, submissions: ${pub.submissions.length}`);

      // Extra human-like delay
      await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
      console.error(`✗ Failed for ${source.puburl}`, e);
    }
  }

  console.log("All scraped. Global genres_total count:", genres_total.length);
}

main()
  .catch((e) => {
    console.error("Script error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });