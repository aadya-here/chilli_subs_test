import { prisma } from "../../server/prisma";

type UpsertSourceInput = {
  key: string;
  name: string;
  puburl: string;
};

type UpsertResult = {
  isNew: boolean;
  record: any;
};

export async function upsertMokshaDirectory(
  data: UpsertSourceInput
): Promise<UpsertResult> {
  const { key, name, puburl } = data;

  // Check if record exists by name
  const existing = await prisma.source.findUnique({
    where: { name },
  });

  const record = await prisma.source.upsert({
    where: { name },
    update: {
      key,
      puburl,
    },
    create: {
      key,
      name,
      puburl,
    },
  });

  return {
    isNew: !existing,
    record,
  };
}