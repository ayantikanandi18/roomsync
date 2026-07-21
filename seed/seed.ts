/**
 * Seeds demo roommate profiles so Discover isn't empty on a first run.
 * Every seeded account uses the password "password123" — log into two of
 * them in separate browser sessions (or incognito) to test real swiping,
 * matching, and messaging between two accounts.
 *
 * Run: npx prisma db seed  (or: npx tsx seed/seed.ts)
 * Safe to re-run — upserts by email.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

const DEMO_PASSWORD = "password123";

const DEMO_PROFILES = [
  {
    name: "Jordan Smith",
    email: "demo.jordan@roomsync.test",
    budgetMin: 1100,
    budgetMax: 1400,
    moveInDate: daysFromNow(21),
    location: "Austin, TX",
    cleanliness: 5,
    schedule: "flexible" as const,
    petsOk: true,
    smokingOk: false,
    socialLevel: 3,
    bio: "Quiet during the week, loves hosting on weekends. Clean freak, has a cat.",
  },
  {
    name: "Alex Chen",
    email: "demo.alex@roomsync.test",
    budgetMin: 900,
    budgetMax: 1300,
    moveInDate: daysFromNow(14),
    location: "Austin, TX",
    cleanliness: 4,
    schedule: "night_owl" as const,
    petsOk: true,
    smokingOk: false,
    socialLevel: 4,
    bio: "Grad student, night owl, into cooking. Looking for a chill place.",
  },
  {
    name: "Sam Rivera",
    email: "demo.sam@roomsync.test",
    budgetMin: 1500,
    budgetMax: 2000,
    moveInDate: daysFromNow(30),
    location: "Austin, TX",
    cleanliness: 2,
    schedule: "early_bird" as const,
    petsOk: false,
    smokingOk: true,
    socialLevel: 5,
    bio: "Early riser, love having people over. Not super tidy, heads up.",
  },
  {
    name: "Taylor Brooks",
    email: "demo.taylor@roomsync.test",
    budgetMin: 1200,
    budgetMax: 1600,
    moveInDate: daysFromNow(10),
    location: "Seattle, WA",
    cleanliness: 4,
    schedule: "flexible" as const,
    petsOk: true,
    smokingOk: false,
    socialLevel: 2,
    bio: "Software engineer, WFH most days, keeps to myself.",
  },
  {
    name: "Morgan Lee",
    email: "demo.morgan@roomsync.test",
    budgetMin: 1000,
    budgetMax: 1300,
    moveInDate: daysFromNow(5),
    location: "Austin, TX",
    cleanliness: 5,
    schedule: "early_bird" as const,
    petsOk: true,
    smokingOk: false,
    socialLevel: 2,
    bio: "Yoga every morning, very tidy, easygoing otherwise.",
  },
  {
    name: "Casey Kim",
    email: "demo.casey@roomsync.test",
    budgetMin: 800,
    budgetMax: 1100,
    moveInDate: daysFromNow(60),
    location: "Denver, CO",
    cleanliness: 3,
    schedule: "night_owl" as const,
    petsOk: false,
    smokingOk: false,
    socialLevel: 3,
    bio: "Freelance designer, night owl, low-key.",
  },
  {
    name: "Riley Patel",
    email: "demo.riley@roomsync.test",
    budgetMin: 1300,
    budgetMax: 1700,
    moveInDate: daysFromNow(21),
    location: "Austin, TX",
    cleanliness: 4,
    schedule: "flexible" as const,
    petsOk: true,
    smokingOk: true,
    socialLevel: 4,
    bio: "Musician, plays shows on weekends, friendly and social.",
  },
  {
    name: "Jamie Fox",
    email: "demo.jamie@roomsync.test",
    budgetMin: 950,
    budgetMax: 1200,
    moveInDate: daysFromNow(7),
    location: "Austin, TX",
    cleanliness: 3,
    schedule: "night_owl" as const,
    petsOk: true,
    smokingOk: false,
    socialLevel: 3,
    bio: "Nurse, works odd shifts, easy to live with.",
  },
];

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const { email, name, ...profileData } of DEMO_PROFILES) {
    const user = await prisma.user.upsert({
      where: { email },
      update: { name, passwordHash },
      create: { email, name, passwordHash },
    });

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: profileData,
      create: { userId: user.id, ...profileData },
    });
  }

  console.log(`Seeded ${DEMO_PROFILES.length} demo profiles (password: "${DEMO_PASSWORD}" for all).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
