import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Adding financial entities...");

  const targetActor = await prisma.entity.findFirst({
    where: { label: "ShadowBroker" }
  });

  if (!targetActor) {
    console.error("Target actor not found. Run seed.mjs first.");
    return;
  }

  const indianBank1 = await prisma.entity.create({ data: { type: "BANK_ACCOUNT", label: "HDFC Bank (Acct: 50100239481)", confidence: 0.95, priorityScore: 75 } });
  const indianBank2 = await prisma.entity.create({ data: { type: "BANK_ACCOUNT", label: "State Bank of India (Acct: 31920048123)", confidence: 0.9, priorityScore: 65 } });
  const indianBank3 = await prisma.entity.create({ data: { type: "BANK_ACCOUNT", label: "ICICI Bank (Acct: 001293847592)", confidence: 0.88, priorityScore: 55 } });
  const indianBank4 = await prisma.entity.create({ data: { type: "BANK_ACCOUNT", label: "Axis Bank (Acct: 911029384756)", confidence: 0.85, priorityScore: 50 } });
  const foreignBank = await prisma.entity.create({ data: { type: "BANK_ACCOUNT", label: "Swissquote Bank SA (Acct: CH93 8472 9182)", confidence: 0.99, priorityScore: 90, riskFactors: JSON.stringify(["Offshore secrecy jurisdiction"]) } });
  const cryptoWallet = await prisma.entity.create({ data: { type: "WALLET", label: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e (Ethereum)", confidence: 0.95, priorityScore: 85, riskFactors: JSON.stringify(["Mixer exposure"]) } });

  await prisma.relationship.createMany({
    data: [
      { sourceId: targetActor.id, targetId: indianBank1.id, type: "CONTROLS", confidence: 0.95 },
      { sourceId: targetActor.id, targetId: indianBank2.id, type: "CONTROLS", confidence: 0.9 },
      { sourceId: targetActor.id, targetId: indianBank3.id, type: "CONTROLS", confidence: 0.88 },
      { sourceId: targetActor.id, targetId: indianBank4.id, type: "CONTROLS", confidence: 0.85 },
      { sourceId: targetActor.id, targetId: foreignBank.id, type: "CONTROLS", confidence: 0.99 },
      { sourceId: targetActor.id, targetId: cryptoWallet.id, type: "CONTROLS", confidence: 0.95 },
      { sourceId: cryptoWallet.id, targetId: foreignBank.id, type: "TRANSACTS_WITH", confidence: 0.92 }
    ]
  });

  const inv = await prisma.investigation.findFirst({
    where: { caseId: "INV-2026-0042" }
  });

  if (inv) {
    await prisma.investigationEntity.createMany({
      data: [
        { investigationId: inv.id, entityId: indianBank1.id },
        { investigationId: inv.id, entityId: indianBank2.id },
        { investigationId: inv.id, entityId: indianBank3.id },
        { investigationId: inv.id, entityId: indianBank4.id },
        { investigationId: inv.id, entityId: foreignBank.id },
        { investigationId: inv.id, entityId: cryptoWallet.id }
      ]
    });
  }

  console.log("Added 4 Indian banks, 1 foreign bank, and 1 wallet to ShadowBroker.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
