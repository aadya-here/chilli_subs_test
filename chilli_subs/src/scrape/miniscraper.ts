import axios from "axios";
import * as cheerio from "cheerio";
import { upsertPublication } from "../upsert/upsert_test";
const guidelineLinks: string[] = [];

var publicationName =""
const url = "https://heartlinesspec.moksha.io/publication/1";
const openSubmissionTypes: string[] = [];
const closedSubmissionTypes: string[] = []

async function run() {
  const response = await axios.get(url);
  const html = response.data;
  const $ = cheerio.load(html);

  // 1️⃣ h1 → publication name


  // 2️⃣ ALL links under div.guidelines


  $("div.guidelines a").each((_, el) => {
    const href = $(el).attr("href");
    if (href) {
      guidelineLinks.push(href);
    }
  });
 publicationName = $("h1").first().text().trim();

  // 3️⃣ Open vs Closed submission types
;

  $("div.subtype-button").each((_, el) => {
    const typeName = $(el).find("h2").text().trim();
    if (!typeName) return;

    const isDisabled = $(el).hasClass("disabled");

    if (isDisabled) {
      closedSubmissionTypes.push(typeName);
    } else {
      openSubmissionTypes.push(typeName);
    }
  });

  console.log({
    publicationName,
    guidelineLinks,
    openSubmissionTypes,
    closedSubmissionTypes,
  });
}


await run();

await upsertPublication({
  name: publicationName,
  guidelineLinks,
  openSubmissionTypes,
  closedSubmissionTypes,
  sourceUrl: url,
});

