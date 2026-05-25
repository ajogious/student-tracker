import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function main() {
  console.log("Cleaning all existing database tables...");
  
  await prisma.auditLog.deleteMany({});
  await prisma.topUpUniversity.deleteMany({});
  await prisma.sponsor.deleteMany({});
  await prisma.exam.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.user.deleteMany({});

  const cahEmail = process.env.CAH_EMAIL || "ajogious@gmail.com";
  const rawPassword = process.env.CAH_PASSWORD || "#Mawaddah2022";

  console.log(`Seeding Center Academic Head (CAH) user: ${cahEmail}...`);

  const cahPassword = hashPassword(rawPassword);

  await prisma.user.create({
    data: {
      email: cahEmail,
      password: cahPassword,
      role: "ADMIN",
    },
  });

  console.log("Seeding complete successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
