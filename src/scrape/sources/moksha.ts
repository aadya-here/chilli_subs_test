import axios from "axios";
import * as cheerio from "cheerio";
import { prisma } from "../../server/prisma";
// import { upsertPublication } from "../upsert/upsert_test";
import { normalizeUrl } from "../normalise/puburl";
import { normalizeName } from "../normalise/pubName";
import { normaliseDate } from "../normalise/mokshaDeadline";
import { rateLimit } from "../../utils/rateLimiter";
import {fetchWithRetry } from "../../utils/fetcherLayer";
import { upsertPublication } from "../upsert/moksha";
import fs from "fs";
import path from "path";


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
const genres_total = new Set<string>(); // better than array


async function scrapePublication(url: string): Promise<PublicationInfo> {
  await rateLimit(1800);

  const publication: PublicationInfo = {
    ...defaultPublication,
    baseURL: url,
    submissions: [],
  };

  const response = await fetchWithRetry(url, {
    retries: 3,
    timeout: 12_000,
  });

  const $ = cheerio.load(response.data);

  publication.title = $("h1").first().text().trim();
  publication.description = $("div.description").first().text().trim();

  // Guidelines
  const guidelineLinks: string[] = [];
  $("div.guidelines a").each((_, el) => {
    const href = $(el).attr("href");
    if (href) guidelineLinks.push(href);
  });

  if (guidelineLinks.length === 2) {
    publication.guidelineURL = guidelineLinks[0];
    publication.pubURL = guidelineLinks[1];
  } else if (guidelineLinks.length === 1) {
    publication.guidelineURL = guidelineLinks[0];
  }

  // Genres + submissions
const pubGenres: string[] = [];

$("div.subtype-button").each((_, el) => {
  const genre = $(el).find("h2").text().trim();

  if (genre) {
    pubGenres.push(genre);
    genres_total.add(genre);
  }

  publication.genres = [...pubGenres];
//   console.log("Genres for this publication:", publication.genres);


    if (!$(el).hasClass("disabled")) {
      const submission: OpenSubmissionInfo = {
        genre,
        description: $(el).find("p").first().text().trim(),
        subURL: $(el).find(".new-submission a").attr("href") || "",
        subDate: "",
        subTime: "",
        subTimezone: "",
      };

      const deadlineText = $(el)
        .find(".mt-3.submission-period")
        .first()
        .text()
        .trim();

      if (deadlineText) {
        const d = normaliseDate(deadlineText);
        submission.subDate = d.subDate;
        submission.subTime = d.subTime;
        submission.subTimezone = d.subTimezone;
      }

      publication.submissions.push(submission);
      if (publication.submissions.length > 0) {
      publication.isOpen = true;
    }
    }

    
  });

  return publication;
}

async function main() {
  const sources = await prisma.source.findMany();

  for (const source of sources) {
    try {
      console.log(`📄 Scraping ${source.puburl}`);

      const publication = await scrapePublication(source.puburl);

      await upsertPublication(source, publication);

      console.log(
        `✓ Saved: ${publication.title} (${publication.submissions.length} submissions)`
      ) 


      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      console.error(`✗ Failed for ${source.puburl}`, err);
    }

     console.log("total generes", genres_total);
//      const genresPath = path.join(process.cwd(), "../genres_reference.txt");
//       fs.writeFileSync(
//     genresPath,
//     Array.from(genres_total).sort().join("\n"),
//     "utf-8"
//   );

//   console.log(`📁 Genres saved to ${genresPath}`);
  }
}



main()
  .catch((e) => {
    console.error("Fatal error:", e);


  })
  .finally(async () => {
    await prisma.$disconnect();
  });