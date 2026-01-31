import { prisma } from "../../server/prisma";

type UpsertPublicationInput = {
  name: string;
  guidelineLinks: string[];
  openSubmissionTypes: string[];
  closedSubmissionTypes: string[];
  sourceUrl: string;
};

export async function upsertPublication(
  data: UpsertPublicationInput
) {
  const { name, guidelineLinks, openSubmissionTypes, closedSubmissionTypes, sourceUrl } = data;

  return prisma.publication.upsert({
    where: {
      name_sourceUrl: {
        name,
        sourceUrl,
      },
    },
    update: {
      guidelineLinks,
      openSubmissionTypes,
      closedSubmissionTypes,
      lastSeenAt: new Date(),
    },
    create: {
      name,
      guidelineLinks,
      openSubmissionTypes,
      closedSubmissionTypes,
      sourceUrl,
      lastSeenAt: new Date(),
    },
  });
}
