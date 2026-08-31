import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const entityTypes = ["ACTOR", "ACCOUNT", "WALLET", "IDENTIFIER", "LISTING", "PLATFORM", "DEVICE"];
const riskReasons = [
  "Abnormal activity burst",
  "High-risk network connections",
  "Cross-platform identity overlap",
  "Repeated wallet association",
  "Suspicious listing pattern",
  "Rapidly expanding cluster"
];

const actorNames = ["DarkLord99", "SilkRoadTrader", "GhostProtocol", "NeonNinja", "CipherKing", "AlphaOmega", "ShadowBroker", "KiteRunner", "ZeroDay", "PhantomUser"];
const platforms = ["GenesisMarket", "AlphaBay", "Telegram", "Signal", "TorChat", "WhatsApp", "X", "Reddit"];

async function main() {
  console.log("Cleaning DB...");
  await prisma.actionItem.deleteMany();
  await prisma.legalReference.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.note.deleteMany();
  await prisma.auditEvent.deleteMany();
  await prisma.activityEvent.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.investigationEntity.deleteMany();
  await prisma.investigation.deleteMany();
  await prisma.relationship.deleteMany();
  await prisma.entity.deleteMany();

  console.log("Seeding Entities...");
  const entities = [];
  
  // Create Platforms
  const platformIds = {};
  for (const name of platforms) {
    const p = await prisma.entity.create({
      data: {
        type: "PLATFORM",
        label: name,
        confidence: 1.0,
        priorityScore: 0,
      }
    });
    platformIds[name] = p.id;
    entities.push(p);
  }

  // Story A: Cross-platform identity overlap
  const targetActor = await prisma.entity.create({
    data: {
      type: "ACTOR",
      label: "ShadowBroker",
      confidence: 0.95,
      priorityScore: 88,
      riskFactors: JSON.stringify(["Cross-platform identity overlap", "High-risk network connections"]),
    }
  });
  entities.push(targetActor);

  const acc1 = await prisma.entity.create({
    data: {
      type: "ACCOUNT",
      label: "shadow_99@genesis",
      confidence: 0.9,
      priorityScore: 80,
    }
  });
  entities.push(acc1);

  const acc2 = await prisma.entity.create({
    data: {
      type: "ACCOUNT",
      label: "shadow_broker_t",
      confidence: 0.85,
      priorityScore: 75,
    }
  });
  entities.push(acc2);

  const id1 = await prisma.entity.create({
    data: {
      type: "IDENTIFIER",
      label: "shadow99@proton.me",
      confidence: 0.99,
      priorityScore: 50,
    }
  });
  entities.push(id1);

  await prisma.relationship.createMany({
    data: [
      { sourceId: targetActor.id, targetId: acc1.id, type: "OWNS", confidence: 0.9 },
      { sourceId: targetActor.id, targetId: acc2.id, type: "OWNS", confidence: 0.85 },
      { sourceId: acc1.id, targetId: id1.id, type: "ASSOCIATED_WITH", confidence: 0.99 },
      { sourceId: acc2.id, targetId: id1.id, type: "ASSOCIATED_WITH", confidence: 0.99 },
      { sourceId: acc1.id, targetId: platformIds["GenesisMarket"], type: "OBSERVED_ON", confidence: 1.0 },
      { sourceId: acc2.id, targetId: platformIds["Telegram"], type: "OBSERVED_ON", confidence: 1.0 },
    ]
  });

  // Story B: Emerging network
  const emergentActor = await prisma.entity.create({
    data: {
      type: "ACTOR",
      label: "NeonNinja",
      confidence: 0.8,
      priorityScore: 92,
      riskFactors: JSON.stringify(["Rapidly expanding cluster", "Suspicious listing pattern"]),
    }
  });
  entities.push(emergentActor);

  const emergentWallet = await prisma.entity.create({
    data: {
      type: "WALLET",
      label: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      confidence: 0.95,
      priorityScore: 60,
    }
  });
  entities.push(emergentWallet);

  for (let i = 0; i < 5; i++) {
    const acc = await prisma.entity.create({
      data: {
        type: "ACCOUNT",
        label: `neon_dist_${i}`,
        confidence: 0.7,
        priorityScore: 50 + i,
      }
    });
    entities.push(acc);
    await prisma.relationship.create({
      data: { sourceId: emergentActor.id, targetId: acc.id, type: "USES", confidence: 0.7 }
    });
    await prisma.relationship.create({
      data: { sourceId: acc.id, targetId: emergentWallet.id, type: "TRANSACTS_WITH", confidence: 0.8 }
    });
  }

  // Generate background noise (100+ entities)
  const backgroundActors = [];
  for(let i=0; i<30; i++) {
    const actor = await prisma.entity.create({
      data: {
        type: "ACTOR",
        label: `Actor_${crypto.randomBytes(2).toString('hex')}`,
        confidence: randomFloat(0.4, 0.9),
        priorityScore: randomInt(10, 50),
      }
    });
    backgroundActors.push(actor);
    entities.push(actor);
  }

  const backgroundAccounts = [];
  for(let i=0; i<60; i++) {
    const acc = await prisma.entity.create({
      data: {
        type: "ACCOUNT",
        label: `user_${crypto.randomBytes(4).toString('hex')}`,
        confidence: randomFloat(0.5, 0.95),
        priorityScore: randomInt(5, 40),
      }
    });
    backgroundAccounts.push(acc);
    entities.push(acc);
    
    // randomly assign to an actor
    const actor = backgroundActors[randomInt(0, backgroundActors.length - 1)];
    await prisma.relationship.create({
      data: {
        sourceId: actor.id,
        targetId: acc.id,
        type: "OWNS",
        confidence: randomFloat(0.6, 0.9)
      }
    });

    // randomly assign to a platform
    const platformName = platforms[randomInt(0, platforms.length - 1)];
    await prisma.relationship.create({
      data: {
        sourceId: acc.id,
        targetId: platformIds[platformName],
        type: "OBSERVED_ON",
        confidence: 1.0
      }
    });
  }

  // Create Investigations
  const inv1 = await prisma.investigation.create({
    data: {
      caseId: "INV-2026-0042",
      title: "Operation Cross-Platform Overlap",
      status: "OPEN",
      priority: "CRITICAL",
      investigator: "A. Smith",
      confidence: 0.92,
    }
  });

  const inv2 = await prisma.investigation.create({
    data: {
      caseId: "INV-2026-0058",
      title: "NeonNinja Distro Network",
      status: "OPEN",
      priority: "HIGH",
      investigator: "J. Doe",
      confidence: 0.88,
    }
  });

  await prisma.investigationEntity.create({ data: { investigationId: inv1.id, entityId: targetActor.id }});
  await prisma.investigationEntity.create({ data: { investigationId: inv2.id, entityId: emergentActor.id }});

  // Story C: Activity Burst & Alerts
  for(let i=0; i<15; i++) {
    await prisma.activityEvent.create({
      data: {
        entityId: targetActor.id,
        type: "LOGIN",
        source: "GenesisMarket",
        timestamp: new Date(Date.now() - i * 3600000)
      }
    });
  }

  await prisma.alert.create({
    data: {
      type: "ACTIVITY_SPIKE",
      severity: "CRITICAL",
      title: "Massive Activity Spike on ShadowBroker",
      description: "Activity increased 3.4x over the previous 14-day baseline.",
      status: "UNREAD",
      entityId: targetActor.id
    }
  });
  
  await prisma.alert.create({
    data: {
      type: "NEW_LINK",
      severity: "WARNING",
      title: "New Cross-Platform Association",
      description: "Entity shares two identifiers with a second high-priority account.",
      status: "ACKNOWLEDGED",
      entityId: emergentActor.id
    }
  });

  // Seed Evidence
  await prisma.evidence.create({
    data: {
      type: "MARKETPLACE_DUMP",
      source: "GenesisMarket",
      description: "Encrypted PGP block containing shadow99@proton.me email.",
      confidence: 0.98,
      entityId: targetActor.id,
      investigationId: inv1.id
    }
  });

  // Seed Legal Reference
  await prisma.legalReference.create({
    data: {
      jurisdiction: "Chandigarh/India",
      provision: "IT Act Sec 66C (Identity Theft)",
      reason: "Fraudulent use of digital identifiers to facilitate illicit transactions.",
      entityId: targetActor.id
    }
  });

  // Seed Actions
  await prisma.actionItem.create({
    data: {
      title: "Prepare ED Escalation",
      status: "DRAFT",
      priority: "CRITICAL",
      reason: "Financial indicators require further review and potential inter-agency escalation.",
      type: "ESCALATION",
      investigationId: inv1.id,
      entityId: targetActor.id
    }
  });
  await prisma.actionItem.create({
    data: {
      title: "Prepare Bank Account Information Request",
      status: "PENDING",
      priority: "HIGH",
      reason: "Synthetic account is linked to a high-risk investigation entity.",
      type: "BANK_REQUEST",
      investigationId: inv1.id
    }
  });
  await prisma.actionItem.create({
    data: {
      title: "Prepare Account Suspension / Freeze Request",
      status: "DRAFT",
      priority: "HIGH",
      reason: "Potential association with suspicious proceeds.",
      type: "FREEZE",
      entityId: targetActor.id
    }
  });
  await prisma.actionItem.create({
    data: {
      title: "Contact Bank Investigation Team",
      status: "DRAFT",
      priority: "MEDIUM",
      reason: "Additional account and transaction information may be required.",
      type: "BANK_REQUEST",
      investigationId: inv2.id
    }
  });
  await prisma.actionItem.create({
    data: {
      title: "Generate Intelligence Report",
      status: "READY",
      priority: "LOW",
      reason: "Investigation has sufficient evidence for a preliminary report.",
      type: "REPORT",
      investigationId: inv2.id
    }
  });

  // Seed Notes
  await prisma.note.create({
    data: {
      content: "The observed identifier overlap is suggestive but does not independently establish that both accounts are controlled by the same person. Requires verification via bank request.",
      author: "Investigator A. Smith",
      entityId: targetActor.id,
      investigationId: inv1.id
    }
  });

  console.log("Seeding complete.");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
