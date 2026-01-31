import axios from "axios";
import * as cheerio from "cheerio";
import { upsertMokshaDirectory } from "../upsert/moksha_directory";
import { prisma } from "../../server/prisma";
import { normalizeName } from "../normalise/pubName";
import {normalizeUrl} from "../normalise/puburl";

const url = "https://moksha.io/open-publications/";

async function listPublications() {
  const response = await axios.get(url);
  const html = response.data;
  const $ = cheerio.load(html);

  const publications: string[] = [];
  const publicationLinks: string[] = [];

  $("div.entry-content > ul > li > a").each((_, el) => {
    const name = $(el).text().trim();
    const link = $(el).attr("href");

    if (!name || !link) return;

    publications.push(normalizeName(name));
    publicationLinks.push(normalizeUrl(link));
  });

  console.log({
    // publications: publications.slice(0, 5),
    // publicationLinks: publicationLinks.slice(0, 5),
    "count pubs": publications.length,
    "count publinks": publicationLinks.length,
  });

  return { publications, publicationLinks };
}

async function main() {
  const { publications, publicationLinks } = await listPublications();

  console.log("Starting upserts...")
  let created = 0;
  let updated = 0;
  
  for (let i = 0; i < publications.length; i++) {
  try {
    const { isNew } = await upsertMokshaDirectory({
      key: `moksha`,
      name: publications[i],
      puburl: publicationLinks[i],
    });
    
     if (isNew) {
        // console.log(`✓ [NEW] ${publications[i]}`);
        created++;
      } else {
        // console.log(`↻ [UPDATED] ${publications[i]}`);
        updated++;
      }
    } catch (e) {
      console.error(`✗ Error upserting ${publications[i]}:`, e);
    }
}

  const count = await prisma.source.count();
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✓ New records inserted: ${created}`);
  console.log(`↻ Existing records updated: ${updated}`);
  console.log(`Total sources in DB: ${count}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log(`Total sources in DB: ${count}`);
}


main()
  .catch((e) => {
    console.error("Script error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });