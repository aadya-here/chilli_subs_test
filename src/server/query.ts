import { prisma } from "./prisma";

export async function getAllPublications() {
  return prisma.publicationInfo.findMany({
    orderBy: { updatedAt: "desc" },
  });
}

export async function getPublicationById(id: string) {
  return prisma.publicationInfo.findUnique({
    where: { id },
  });
}
