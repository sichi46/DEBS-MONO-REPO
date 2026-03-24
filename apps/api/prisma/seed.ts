import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log("Seeding database...");

  // Create Admin User
  const adminPassword = await hashPassword("Admin123!");
  const admin = await prisma.user.upsert({
    where: { email: "admin@debsinsurance.com" },
    update: {},
    create: {
      email: "admin@debsinsurance.com",
      password: adminPassword,
      name: "Sarah Banda",
      phone: "+260 97 123 4567",
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: true,
    },
  });
  console.log(`Admin user created: ${admin.email}`);

  // Create Agent User
  const agentPassword = await hashPassword("Agent123!");
  const agent = await prisma.user.upsert({
    where: { email: "michael.lungu@debsinsurance.com" },
    update: {},
    create: {
      email: "michael.lungu@debsinsurance.com",
      password: agentPassword,
      name: "Michael Lungu",
      phone: "+260 96 222 3333",
      role: "AGENT",
      status: "ACTIVE",
      emailVerified: true,
    },
  });
  console.log(`Agent user created: ${agent.email}`);

  // Create Regular Users
  const userPassword = await hashPassword("User1234!");
  const users = [];
  const userData = [
    {
      email: "john.mwape@example.com",
      name: "John Mwape",
      phone: "+260 96 111 2222",
    },
    {
      email: "grace.phiri@example.com",
      name: "Grace Phiri",
      phone: "+260 97 333 4444",
    },
    {
      email: "david.tembo@example.com",
      name: "David Tembo",
      phone: "+260 95 555 6666",
    },
    {
      email: "mary.banda@example.com",
      name: "Mary Banda",
      phone: "+260 96 777 8888",
      status: "INACTIVE" as const,
    },
    {
      email: "peter.zulu@example.com",
      name: "Peter Zulu",
      phone: "+260 97 999 0000",
      status: "SUSPENDED" as const,
    },
  ];

  for (const u of userData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        password: userPassword,
        name: u.name,
        phone: u.phone,
        role: "USER",
        status: u.status || "ACTIVE",
        emailVerified: true,
      },
    });
    users.push(user);
    console.log(`User created: ${user.email}`);
  }

  // Create Policy Types
  const policyTypes = await Promise.all([
    prisma.policyType.upsert({
      where: { name: "Life Insurance" },
      update: {},
      create: {
        name: "Life Insurance",
        description: "Comprehensive life coverage",
        icon: "heart",
        minPremium: 500,
      },
    }),
    prisma.policyType.upsert({
      where: { name: "Health Insurance" },
      update: {},
      create: {
        name: "Health Insurance",
        description: "Full health coverage",
        icon: "activity",
        minPremium: 350,
      },
    }),
    prisma.policyType.upsert({
      where: { name: "Auto Insurance" },
      update: {},
      create: {
        name: "Auto Insurance",
        description: "Vehicle coverage",
        icon: "car",
        minPremium: 250,
      },
    }),
    prisma.policyType.upsert({
      where: { name: "Home Insurance" },
      update: {},
      create: {
        name: "Home Insurance",
        description: "Property protection",
        icon: "home",
        minPremium: 400,
      },
    }),
    prisma.policyType.upsert({
      where: { name: "Travel Insurance" },
      update: {},
      create: {
        name: "Travel Insurance",
        description: "Travel coverage",
        icon: "plane",
        minPremium: 150,
      },
    }),
  ]);
  console.log(`${policyTypes.length} policy types created`);

  // Create Policies
  const policies = [];
  const policyData = [
    {
      user: users[0],
      type: policyTypes[0],
      number: "LP-2024-001234",
      coverage: 500000,
      premium: 1200,
      status: "ACTIVE" as const,
      start: new Date("2024-01-15"),
      end: new Date("2034-01-15"),
    },
    {
      user: users[0],
      type: policyTypes[1],
      number: "HI-2024-005678",
      coverage: 250000,
      premium: 850,
      status: "ACTIVE" as const,
      start: new Date("2024-03-01"),
      end: new Date("2025-03-01"),
    },
    {
      user: users[0],
      type: policyTypes[2],
      number: "AI-2024-009012",
      coverage: 150000,
      premium: 450,
      status: "PENDING" as const,
      start: null,
      end: null,
    },
    {
      user: users[1],
      type: policyTypes[0],
      number: "LI-2024-002345",
      coverage: 750000,
      premium: 1500,
      status: "ACTIVE" as const,
      start: new Date("2024-02-01"),
      end: new Date("2034-02-01"),
    },
    {
      user: users[1],
      type: policyTypes[1],
      number: "HI-2024-006789",
      coverage: 300000,
      premium: 950,
      status: "ACTIVE" as const,
      start: new Date("2024-02-15"),
      end: new Date("2025-02-15"),
    },
    {
      user: users[2],
      type: policyTypes[2],
      number: "AI-2024-010123",
      coverage: 200000,
      premium: 500,
      status: "ACTIVE" as const,
      start: new Date("2024-03-10"),
      end: new Date("2025-03-10"),
    },
    {
      user: users[2],
      type: policyTypes[3],
      number: "HM-2024-011234",
      coverage: 400000,
      premium: 600,
      status: "ACTIVE" as const,
      start: new Date("2024-04-01"),
      end: new Date("2025-04-01"),
    },
    {
      user: users[1],
      type: policyTypes[4],
      number: "TR-2024-012345",
      coverage: 100000,
      premium: 200,
      status: "ACTIVE" as const,
      start: new Date("2024-05-01"),
      end: new Date("2024-11-01"),
    },
  ];

  for (const p of policyData) {
    const policy = await prisma.policy.upsert({
      where: { policyNumber: p.number },
      update: {},
      create: {
        policyNumber: p.number,
        userId: p.user.id,
        policyTypeId: p.type.id,
        coverageAmount: p.coverage,
        premiumAmount: p.premium,
        status: p.status,
        startDate: p.start,
        endDate: p.end,
      },
    });
    policies.push(policy);
  }
  console.log(`${policies.length} policies created`);

  // Create Beneficiaries
  await prisma.beneficiary.createMany({
    data: [
      {
        policyId: policies[0].id,
        name: "Mary Mwape",
        relationship: "Spouse",
        percentage: 60,
      },
      {
        policyId: policies[0].id,
        name: "James Mwape",
        relationship: "Son",
        percentage: 40,
      },
      {
        policyId: policies[1].id,
        name: "John Mwape",
        relationship: "Self",
        percentage: 100,
      },
      {
        policyId: policies[3].id,
        name: "Grace Phiri",
        relationship: "Self",
        percentage: 100,
      },
    ],
    skipDuplicates: true,
  });
  console.log("Beneficiaries created");

  // Create Claims
  const claims = [
    {
      userId: users[0].id,
      policyId: policies[1].id,
      number: "CLM-2024-0001",
      type: "Medical",
      status: "APPROVED" as const,
      amount: 5000,
      desc: "Hospital admission for minor surgery.",
      processedAt: new Date("2025-10-12"),
      processedBy: admin.id,
    },
    {
      userId: users[0].id,
      policyId: policies[0].id,
      number: "CLM-2024-0002",
      type: "Critical Illness",
      status: "PENDING" as const,
      amount: 50000,
      desc: "Critical illness benefit claim.",
    },
    {
      userId: users[0].id,
      policyId: policies[1].id,
      number: "CLM-2024-0003",
      type: "Hospital",
      status: "UNDER_REVIEW" as const,
      amount: 12500,
      desc: "Extended hospitalization claim.",
    },
    {
      userId: users[0].id,
      policyId: policies[2].id,
      number: "CLM-2024-0004",
      type: "Accident",
      status: "REJECTED" as const,
      amount: 8000,
      desc: "Rejected - policy not yet active.",
      processedAt: new Date("2025-09-10"),
      processedBy: admin.id,
    },
    {
      userId: users[0].id,
      policyId: policies[1].id,
      number: "CLM-2024-0005",
      type: "Medical",
      status: "APPROVED" as const,
      amount: 2500,
      desc: "Outpatient consultation.",
      processedAt: new Date("2025-08-22"),
      processedBy: admin.id,
    },
    {
      userId: users[1].id,
      policyId: policies[3].id,
      number: "CLM-2024-0006",
      type: "Critical Illness",
      status: "APPROVED" as const,
      amount: 75000,
      desc: "Critical illness benefit.",
      processedAt: new Date("2025-09-05"),
      processedBy: admin.id,
    },
    {
      userId: users[1].id,
      policyId: policies[4].id,
      number: "CLM-2024-0007",
      type: "Medical",
      status: "PENDING" as const,
      amount: 8500,
      desc: "Specialist consultation and tests.",
    },
  ];

  for (const c of claims) {
    await prisma.claim.upsert({
      where: { claimNumber: c.number },
      update: {},
      create: {
        claimNumber: c.number,
        userId: c.userId,
        policyId: c.policyId,
        claimType: c.type,
        status: c.status,
        amount: c.amount,
        description: c.desc,
        processedAt: c.processedAt || null,
        processedBy: c.processedBy || null,
      },
    });
  }
  console.log(`${claims.length} claims created`);

  // Create Payments
  const months = [
    new Date("2025-07-01"),
    new Date("2025-08-01"),
    new Date("2025-09-01"),
    new Date("2025-10-01"),
  ];
  const methods = ["MOBILE_MONEY", "BANK_TRANSFER", "CARD"] as const;

  let paymentCount = 0;
  for (const month of months) {
    // John's policies
    await prisma.payment.create({
      data: {
        userId: users[0].id,
        policyId: policies[0].id,
        amount: 1200,
        status: "PAID",
        method: methods[0],
        paidAt: month,
      },
    });
    await prisma.payment.create({
      data: {
        userId: users[0].id,
        policyId: policies[1].id,
        amount: 850,
        status: "PAID",
        method: methods[1],
        paidAt: month,
      },
    });
    // Grace's policies
    await prisma.payment.create({
      data: {
        userId: users[1].id,
        policyId: policies[3].id,
        amount: 1500,
        status: "PAID",
        method: methods[1],
        paidAt: month,
      },
    });
    await prisma.payment.create({
      data: {
        userId: users[1].id,
        policyId: policies[4].id,
        amount: 950,
        status: "PAID",
        method: methods[0],
        paidAt: month,
      },
    });
    // David's policies
    await prisma.payment.create({
      data: {
        userId: users[2].id,
        policyId: policies[5].id,
        amount: 500,
        status: "PAID",
        method: methods[2],
        paidAt: month,
      },
    });
    paymentCount += 5;
  }

  // One pending payment
  await prisma.payment.create({
    data: {
      userId: users[2].id,
      policyId: policies[6].id,
      amount: 600,
      status: "PENDING",
      method: "CARD",
    },
  });
  paymentCount++;

  console.log(`${paymentCount} payments created`);

  console.log("\nSeed completed successfully!");
  console.log("\nAdmin login: admin@debsinsurance.com / Admin123!");
  console.log("Agent login: michael.lungu@debsinsurance.com / Agent123!");
  console.log("User login:  john.mwape@example.com / User1234!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
