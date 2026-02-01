## Lit Mag Submission Calls Aggregator
This project is a full-stack data pipeline and UI designed to collect, normalize, and browse literary magazine submission calls. It automates the collection of data from public sources—such as Moksha-powered pages and literary directories—storing them in a structured database for easy discovery.

## 🛠 Tech Stack
* **Language:** TypeScript (End-to-end for scrapers, API, and UI)
* **Framework:** Next.js (Pages Router)
* **Database:** MongoDB
* **ORM:** Prisma
* **Tooling:** ESLint + Prettier

---

## 🏗 Architecture

* **Fetcher Layer:** Implements retries, exponential backoff, and polite rate limiting
* **Source Parsers:** Dedicated modules for Moksha-powered sites and public directories (currently it has only Mokhsa)
* **Normalization Engine:** Standardizes casing, canonical URLs, and maps genres to fixed enumms
* **Idempotent Upsert:** Prisma-based logic that prevents duplicates using `normalizedName` and `hostname` constraints

---

### Project Structure

├── prisma/
│ ├── schema.prisma 
│ └── seed.ts 
│
├── src/
│ ├── pages
│ │ ├── publications/
│ │ │ ├── index.ts
│ │ │ └── [id].ts
│ │ └── api/publications
│ │ | |── index.tsx
│ │ │ └── [id].tsx
│ │ ├── _app.tsx
│ │ |── index.tsx
│ ├── scrape/
│ │ |
│ │ ├── miniscraper.ts # test file, can ignore
│ │ ├── normalize/
│ │ ├── sources/ 
│ │ ├── upsert/
│ │
│ │── server
│ │── styles 
│ |── utils
├── .env.example
├── package.json
├── tsconfig.json
└── README.md



## 🚀 Getting Started

### 1. Setup
1. run `pnpm install`

2. create a .env file and add your mongodb url DATABASE_URL="mongodb+srv://..."
3. run `pnpm prisma db generate`  
4.  run `pnpm add -D ts-node` & then `pnpm tsc src/scrape/sources/moksha.ts` to insert to db
5. run `pnpm dev` to see the output 

🧩 Extensibility

Adding a new source requires:
* New parser in src/scrape/sources/
* Mapping to normalized fields
<!-- Registering the source in the CLI -->


