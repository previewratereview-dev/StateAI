const fs = require("fs");
const path = require("path");

const DIRECTORY = path.join(__dirname, "../src/components/crm");

const REPLACEMENTS = [
  // 1. Quoted stand-alone colors
  { from: /"rgb\(13 13 18 \/ 70%\)"/g, to: '"#FFFFFF"' },
  { from: /"rgb\(13\s+13\s+18\s*\/\s*70%\)"/g, to: '"#FFFFFF"' },
  { from: /"#0d0d12"/g, to: '"#FFFFFF"' },
  { from: /"#11121a"/g, to: '"#FFFFFF"' },
  { from: /"#1a1a23"/g, to: '"#FFFFFF"' },
  { from: /"rgba\(255,255,255,0.02\)"/g, to: '"#F8FAFC"' },
  { from: /"rgba\(255,255,255,0.03\)"/g, to: '"#FAFBFD"' },
  { from: /"rgba\(255,255,255,0.04\)"/g, to: '"#FFFFFF"' },
  { from: /"rgba\(255,255,255,0.05\)"/g, to: '"#F1F5F9"' },
  { from: /"rgba\(255,255,255,0.06\)"/g, to: '"#FFFFFF"' },
  { from: /"rgba\(255,255,255,0.08\)"/g, to: '"#FAFBFD"' },
  { from: /"rgba\(255,255,255,0.1\)"/g, to: '"#F1F5F9"' },
  { from: /"rgba\(255,255,255,0.12\)"/g, to: '"#E2E8F0"' },
  { from: /"rgba\(177,178,180,0.04\)"/g, to: '"#E2E8F0"' },
  { from: /"rgba\(177,178,180,0.06\)"/g, to: '"#E2E8F0"' },
  { from: /"rgba\(177,178,180,0.08\)"/g, to: '"#E2E8F0"' },
  { from: /"rgba\(177,178,180,0.1\)"/g, to: '"#E2E8F0"' },
  { from: /"rgba\(177,178,180,0.12\)"/g, to: '"#E2E8F0"' },
  { from: /"rgba\(177,178,180,0.15\)"/g, to: '"#E2E8F0"' },
  { from: /"rgba\(177,178,180,0.2\)"/g, to: '"#E2E8F0"' },
  { from: /"#fcfcfe"/g, to: '"#1E293B"' },
  { from: /"#b1b2b4"/g, to: '"#64748B"' },
  { from: /"#818286"/g, to: '"#64748B"' },
  { from: /"#5d5e60"/g, to: '"#94A3B8"' },
  { from: /"#3d3e40"/g, to: '"#94A3B8"' },
  { from: /"#08080c"/g, to: '"#F5F7FB"' },

  // 2. Unquoted inline nested values (e.g. inside "1px solid rgba(...)")
  { from: /rgba\(177,178,180,0.04\)/g, to: "#E2E8F0" },
  { from: /rgba\(177,178,180,0.06\)/g, to: "#E2E8F0" },
  { from: /rgba\(177,178,180,0.08\)/g, to: "#E2E8F0" },
  { from: /rgba\(177,178,180,0.1\)/g, to: "#E2E8F0" },
  { from: /rgba\(177,178,180,0.12\)/g, to: "#E2E8F0" },
  { from: /rgba\(177,178,180,0.15\)/g, to: "#E2E8F0" },
  { from: /rgba\(177,178,180,0.2\)/g, to: "#E2E8F0" },
  { from: /rgba\(255,255,255,0.08\)/g, to: "#FAFBFD" },
  { from: /rgba\(255,255,255,0.05\)/g, to: "#F1F5F9" },
  { from: /rgba\(255,255,255,0.1\)/g, to: "#F1F5F9" },
  { from: /rgba\(255,255,255,0.02\)/g, to: "#F8FAFC" },
  { from: /rgba\(255,255,255,0.03\)/g, to: "#FAFBFD" },
  { from: /rgba\(255,255,255,0.04\)/g, to: "#FFFFFF" },
  { from: /rgba\(255,255,255,0.06\)/g, to: "#FFFFFF" },

  // Form selection styling helper
  { from: /style=\{\{\s*\.\.\.inputStyle,\s*cursor:\s*"pointer"\s*\}\}/g, to: 'style={{ ...inputStyle, cursor: "pointer", background: "#FFFFFF", color: "#1E293B" }}' },
  { from: /style=\{\{\s*background:\s*"#0d0d12"\s*\}\}/g, to: 'style={{ background: "#FFFFFF", color: "#1E293B" }}' },
  { from: /option\s+value="([^"]*)"\s+style=\{\{\s*background:\s*"#0d0d12"\s*\}\}/g, to: 'option value="$1" style={{ background: "#FFFFFF", color: "#1E293B" }}' }
];

function refactorFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  for (const rep of REPLACEMENTS) {
    if (rep.from.test(content)) {
      content = content.replace(rep.from, rep.to);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Refactored: ${filePath}`);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      // Exclude manually checked files
      if (file !== "Dashboard.tsx" && file !== "ContactsTable.tsx" && file !== "CRMSidebar.tsx") {
        refactorFile(fullPath);
      }
    }
  }
}

console.log("Starting safe theme refactoring in CRM components...");
processDirectory(DIRECTORY);
refactorFile(path.join(__dirname, "../src/components/CRMDashboard.tsx"));
console.log("Theme refactoring complete!");
