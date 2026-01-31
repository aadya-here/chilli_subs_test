import "dotenv/config";
import { prisma } from "./server/prisma";

async function main(){
  console.log("count:", await prisma.publication.count());
  console.log("first:", await prisma.publication.findFirst());
}
main().catch(e=>{console.error(e); process.exit(1)}).finally(()=>prisma.$disconnect());