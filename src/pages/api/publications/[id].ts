import type { NextApiRequest, NextApiResponse } from "next";
import { getPublicationById } from "../../../server/query";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method !== "GET" || typeof id !== "string") {
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
    const publication = await getPublicationById(id);

    if (!publication) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json(publication);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch publication" });
  }
}
