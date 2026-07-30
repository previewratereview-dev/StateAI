const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "../.env.local");
const envContent = fs.readFileSync(envPath, "utf8");
const envVars = {};
envContent.split("\n").forEach(line => {
  const parts = line.split("=");
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join("=").trim();
    envVars[key] = value;
  }
});

const supabaseUrl = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const supabaseAnonKey = envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Anon Key length:", supabaseAnonKey ? supabaseAnonKey.length : 0);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const email = "Rayees@gmail.com";
  const password = "Test@12345";

  console.log("Attempting signUp...");
  const result = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: "Rayees",
        role: "admin"
      }
    }
  });

  console.log("Result error:", result.error);
  console.log("Result data user:", result.data ? result.data.user : null);
}

run();
