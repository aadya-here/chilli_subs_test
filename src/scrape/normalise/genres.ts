const STANDARD_GENRES = [
  'Fiction',
  'Non - Fiction',
  'Articles',
  'Essays',
  'Fantasy',
  'Critical Analysis',
  'Science Fiction',
  'Horror',
  'Translation',
  'Anthology',
  'Audio & Narration',
  'Visual Art',
  'Photography',
  'Graphic Novels/ Comics',
  'Reviews',
  'Novella/Novelette',
  'Poetry/Prose',
  'Round Table',
  'Others',
];

// helper: normalize strings to lowercase & remove spaces
const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '');

export function normalizeGenre(extractedGenre: string): string {
  const cleanedInput = normalize(extractedGenre);

  // special handling for fiction / non-fiction overlaps
  if (cleanedInput.includes('nonfiction') || cleanedInput.includes('non-fiction')) {
    return 'Non - Fiction';
  }
  if (cleanedInput.includes('fiction')) {
    return 'Fiction';
  }

  // try to match the rest of standard genres
  for (const genre of STANDARD_GENRES) {
    const normGenre = normalize(genre);
    if (cleanedInput.includes(normGenre)) {
      return genre; // return the standardized genre
    }
  }

  return 'Others'; // fallback
}
