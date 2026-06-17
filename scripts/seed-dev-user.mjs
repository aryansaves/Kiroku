// scripts/seed-dev-user.mjs
// ────────────────────────────────────────────────────────────
// Creates a test user in MongoDB for local dev login.
//
// Usage:
//   node scripts/seed-dev-user.mjs <username> [displayName]
//
// Requires: MONGODB_URI env var (same as kiroku-api .env)
// ────────────────────────────────────────────────────────────

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI is not set. Source your kiroku-api .env first.");
  process.exit(1);
}

const username = process.argv[2]?.trim().toLowerCase();
if (!username) {
  console.error("Usage: node scripts/seed-dev-user.mjs <username> [displayName]");
  process.exit(1);
}

const displayName = process.argv[3] || username;

try {
  // Use dynamic import so this works without installing mongodb globally
  const { MongoClient } = await import("mongodb");
  const client = new MongoClient(MONGODB_URI);

  await client.connect();
  const db = client.db();
  const users = db.collection("users");

  const existing = await users.findOne({ username });
  if (existing) {
    console.log(`User "${username}" already exists (telegramId: ${existing.telegramId}).`);
    console.log("You can now login at http://localhost:3001/login using dev login.");
    await client.close();
    process.exit(0);
  }

  await users.insertOne({
    telegramId: `dev_${Date.now()}`,
    username,
    displayName,
    bio: "Local dev account.",
    links: [],
    avatarUrl: null,
    theme: {
      colorScheme: {
        background: "#faf8f0",
        text: "#16141c",
        accent: "#dc8719",
        card: "#f5f2e8"
      },
      font: "var(--font-serif)",
      layout: "grid",
      customCss: "",
      stickers: [],
      nowPlaying: { url: null, source: null },
      guestbookEnabled: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  console.log(`Created user "${username}" (displayName: "${displayName}").`);
  console.log("You can now login at http://localhost:3001/login using dev login.");
  await client.close();
} catch (err) {
  console.error("Failed to seed user:", err.message);
  process.exit(1);
}
