const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const connectionString = "postgresql://postgres.zfljbcdachfjaarbsume:ecL8AeJibWpYuvOV@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres";

const SQL_FILES = [
  "schema.sql",
  "crm_schema.sql",
  "crm_v2_schema.sql",
  "add_assigned_mailbox.sql",
  "add_contact_locks.sql",
  "email_bucket_and_attachments.sql",
  "resume_bucket_setup.sql",
  "contact_interactions_schema.sql",
  "jobs_schema.sql",
  "job_applications_schema.sql",
  "add_indexes.sql",
  "update_jobs_type_check.sql"
];

async function run() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log("Connecting to Supabase PostgreSQL database...");
    await client.connect();
    console.log("Connected successfully!");

    for (const file of SQL_FILES) {
      const filePath = path.join(__dirname, "../supabase", file);
      if (!fs.existsSync(filePath)) {
        console.warn(`Warning: SQL file not found: ${file}. Skipping.`);
        continue;
      }

      console.log(`Executing ${file}...`);
      const sqlContent = fs.readFileSync(filePath, "utf8");
      
      try {
        await client.query(sqlContent);
        console.log(`✓ ${file} executed successfully.`);
      } catch (err) {
        console.error(`✗ Error executing ${file}:`, err.message);
        // Continue to execute other files since some might already be partially deployed
      }
    }

  } catch (err) {
    console.error("Database connection error:", err.stack);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
}

run();
