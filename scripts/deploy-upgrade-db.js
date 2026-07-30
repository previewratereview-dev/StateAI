const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const connectionString = "postgresql://postgres.zfljbcdachfjaarbsume:ecL8AeJibWpYuvOV@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres";

async function run() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Connecting to Supabase PostgreSQL database...");
    await client.connect();
    console.log("Connected successfully!");

    const filePath = path.join(__dirname, "../supabase/upgrade_schema.sql");
    if (!fs.existsSync(filePath)) {
      console.error("upgrade_schema.sql not found!");
      process.exit(1);
    }

    console.log("Executing upgrade_schema.sql...");
    const sql = fs.readFileSync(filePath, "utf8");
    await client.query(sql);
    console.log("✓ Database upgraded successfully!");

  } catch (err) {
    console.error("✗ Error upgrading database:", err.message);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
}

run();
