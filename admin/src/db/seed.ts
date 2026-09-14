import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { getDb } from "./index";
import { users } from "./schema";

config({ path: ".env.local" });

async function seed() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) {
    throw new Error("ADMIN_EMAIL is not set");
  }

  const db = getDb();
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    await db
      .update(users)
      .set({ name: "Numan Usman", updatedAt: new Date() })
      .where(eq(users.id, existing.id));
    console.log(`Operator already present: ${email}`);
    return;
  }

  await db.insert(users).values({
    email,
    name: "Numan Usman",
  });
  console.log(`Seeded operator: ${email}`);
}

seed().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
