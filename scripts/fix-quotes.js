const fs = require("fs");
const path = require("path");

const FILES_TO_FIX = [
  "../src/components/crm/ApplicationsClient.tsx",
  "../src/components/crm/DealsTable.tsx",
  "../src/components/crm/JobForm.tsx",
  "../src/components/crm/JobsClient.tsx",
  "../src/components/crm/LeadsPipeline.tsx",
  "../src/components/crm/Mailbox.tsx",
  "../src/components/crm/Reports.tsx",
  "../src/components/crm/TasksBoard.tsx",
  "../src/components/crm/ContactDetail.tsx",
  "../src/components/crm/Settings.tsx",
  "../src/components/CRMDashboard.tsx"
].map(p => path.join(__dirname, p));

function fixQuotes(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  let content = fs.readFileSync(filePath, "utf8");
  
  // 1. Replace nested double quotes around color hex values like ""#FFFFFF""
  content = content.replace(/""(#[A-Fa-f0-9]+)""/g, '"$1"');
  
  // 2. Replace nested double quotes inside other strings like "1px solid "#E2E8F0"" -> "1px solid #E2E8F0"
  content = content.replace(/"([^"]*)"(#[A-Fa-f0-9]+)""/g, '"$1$2"');
  content = content.replace(/"([^"]*)"(#[A-Fa-f0-9]+)"/g, '"$1$2"');
  
  // 3. Fix cases like borderBottom: "1px solid "#E2E8F0"" -> "1px solid #E2E8F0"
  content = content.replace(/borderBottom:\s*"([^"]*)"(#[A-Fa-f0-9]+)""/g, 'borderBottom: "$1$2"');
  content = content.replace(/borderLeft:\s*"([^"]*)"(#[A-Fa-f0-9]+)""/g, 'borderLeft: "$1$2"');
  content = content.replace(/borderRight:\s*"([^"]*)"(#[A-Fa-f0-9]+)""/g, 'borderRight: "$1$2"');
  content = content.replace(/borderTop:\s*"([^"]*)"(#[A-Fa-f0-9]+)""/g, 'borderTop: "$1$2"');
  content = content.replace(/border:\s*"([^"]*)"(#[A-Fa-f0-9]+)""/g, 'border: "$1$2"');

  // Let's also do a general cleanup of duplicate double quotes that might sit around hexes
  content = content.replace(/""(#[A-Fa-f0-9]+)/g, '"$1');
  content = content.replace(/(#[A-Fa-f0-9]+)""/g, '$1"');
  content = content.replace(/""(#F1F5F9)/g, '"$1');

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Fixed quotes in: ${filePath}`);
}

console.log("Starting quotes fixing...");
for (const file of FILES_TO_FIX) {
  fixQuotes(file);
}
console.log("Quotes fixing complete!");
