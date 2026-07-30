const { Client } = require("pg");

const connectionString = "postgresql://postgres.zfljbcdachfjaarbsume:ecL8AeJibWpYuvOV@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres";

async function run() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to database.");

    const res = await client.query("SELECT id, email, email_confirmed_at, created_at FROM auth.users WHERE email = $1", ["Rayees@gmail.com"]);
    console.log("User query result:", res.rows);

    if (res.rows.length === 0) {
      console.log("User does not exist in auth.users table.");
    }
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.end();
  }
}

run();
