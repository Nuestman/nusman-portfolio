import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { getDb } from "./index";
import { users } from "./schema";
import { hashPassword } from "../lib/password";

config({ path: ".env.local" });

async function seed() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) {
    throw new Error("ADMIN_EMAIL is not set");
  }

  const name = process.env.ADMIN_NAME?.trim() || "Numan Usman";
  const password = process.env.ADMIN_PASSWORD ?? "";
  const db = getDb();
  const [existing] = await db
    .select({
      id: users.id,
      passwordHash: users.passwordHash,
      imageUrl: users.imageUrl,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const passwordHash = password ? hashPassword(password) : null;

  if (existing) {
    await db
      .update(users)
      .set({
        ...(existing.passwordHash || !passwordHash
          ? {}
          : { passwordHash }),
        ...(existing.imageUrl ? {} : { imageUrl: "/avatars/numan.png" }),
        role: "owner",
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing.id));
    console.log(`Operator present: ${email}`);
    return;
  }

  await db.insert(users).values({
    email,
    name,
    title: "Owner",
    imageUrl: "/avatars/numan.png",
    passwordHash,
    role: "owner",
  });
  console.log(`Seeded operator: ${email}`);
}

seed().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
