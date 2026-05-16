import "../lib/env";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const adminHash = await bcrypt.hash("admin123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@testf.io" },
    update: {},
    create: {
      email: "admin@testf.io",
      passwordHash: adminHash,
      role: "ADMIN",
      verified: true,
      walletAddress: "0x0000000000000000000000000000000000000001",
    },
  });

  const brandUserHash = await bcrypt.hash("brand123456", 12);
  const brandUser = await prisma.user.upsert({
    where: { email: "brand@gucci.com" },
    update: {},
    create: {
      email: "brand@gucci.com",
      passwordHash: brandUserHash,
      role: "BRAND_OWNER",
      verified: true,
      walletAddress: "0x0000000000000000000000000000000000000002",
    },
  });

  const brand = await prisma.brand.upsert({
    where: { name: "Gucci (Demo)" },
    update: {},
    create: {
      userId: brandUser.id,
      name: "Gucci (Demo)",
      verified: true,
      verificationRules: [{ ruleType: "NFC", ruleValue: '{"pattern":"GU-*"}', active: true }],
    },
  });

  await prisma.item.upsert({
    where: { chipId: "DEMO-CHIP-001" },
    update: {},
    create: {
      chipId: "DEMO-CHIP-001",
      brandId: brand.id,
      ipfsHash: "QmDemoHash123",
      nftTokenId: "1",
      metadata: { name: "Gucci Dionysus Bag", description: "Demo luxury bag", attributes: [] },
    },
  });

  console.log("✅ Seed complete");
  console.log(`   Admin: admin@testf.io / admin123456`);
  console.log(`   Brand: brand@gucci.com / brand123456`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
