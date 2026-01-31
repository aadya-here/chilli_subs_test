import { PrismaClient, Prisma } from "@/generated/prisma/client";
import 'dotenv/config'

console.log("DATABASE_URL:", process.env.DATABASE_URL ? "✓ set" : "✗ missing");

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

const publicationData: Prisma.PublicationCreateInput[] = [
  {
    name: "Heartlines Spec",
    guidelineLinks: ["https://heartlinesspec.moksha.io/publication/heartlines-spec/guidelines"],
    openSubmissionTypes: ["Poetry", "Short Fiction"],
    closedSubmissionTypes: ["Poetry (Early Period for Equity-Deserving Groups)"],
    sourceUrl: "https://heartlinesspec.moksha.io/publication/1",
    lastSeenAt: new Date(),
  },
];

export async function main() {
  console.log("Starting seed with", publicationData.length, "publications");
  
  for (const pub of publicationData) {
    console.log("Creating publication:", pub.name);
    const result = await prisma.publication.create({ data: pub });
    console.log("✓ Created:", result.id);
  }
  
  console.log("Seed completed");
  const count = await prisma.publication.count();
  console.log("Total publications in DB:", count);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });