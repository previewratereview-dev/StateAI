const { Client } = require("pg");

const connectionString = "postgresql://postgres.zfljbcdachfjaarbsume:ecL8AeJibWpYuvOV@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres";

async function run() {
  const email = "rayees@gmail.com";
  const fullName = "Rayees";
  const role = "admin";

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to database successfully.");

    // Update email confirmation in auth.users
    const updateAuthQuery = `
      UPDATE auth.users 
      SET 
        email_confirmed_at = NOW(), 
        last_sign_in_at = NOW(),
        raw_user_meta_data = raw_user_meta_data || '{"role": "admin", "full_name": "Rayees"}'::jsonb
      WHERE LOWER(email) = LOWER($1)
      RETURNING id;
    `;
    const res = await client.query(updateAuthQuery, [email]);

    if (res.rows.length === 0) {
      console.error("✗ Failed to locate user in auth.users database table.");
    } else {
      const userId = res.rows[0].id;
      console.log(`✓ Confirmed user in auth.users (ID: ${userId})`);

      // Ensure profile row exists in public.profiles with role = 'admin'
      const insertProfileQuery = `
        INSERT INTO public.profiles (id, full_name, role)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO UPDATE SET role = $3, full_name = $2;
      `;
      await client.query(insertProfileQuery, [userId, fullName, role]);
      console.log("✓ Public profile successfully created & synced as admin!");
    }

  } catch (err) {
    console.error("✗ Database error:", err.message);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
}

run();
