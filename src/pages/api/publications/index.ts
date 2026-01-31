// pages/api/publications.ts
import { PrismaClient } from "../../../../generated/prisma/client";
const prisma = new PrismaClient();

export default async function handler(req: any, res: any) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    // Correct way: Run two separate queries
    const publications = await prisma.publicationInfo.findMany({
      skip: skip,
      take: limit,
      orderBy: { id: 'desc' },
    });

    const totalCount = await prisma.publicationInfo.count(); // This gets the actual total

    res.status(200).json({
      publications,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch" });
  }
}