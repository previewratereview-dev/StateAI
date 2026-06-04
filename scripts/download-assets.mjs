import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetsDir = path.join(root, "public", "assets");
const baseUrl = "https://stateai.in";

const assets = [
  "logo.png",
  "herobg1.jpeg",
  "herobg2.jpeg",
  "footer-bg.jpeg",
  "Sartaj-ahmad.png",
  "Rayees-amin.png",
  "Hikaru-Saito.jpeg",
  "Shamil.jpeg",
  "service-customer-support.png",
  "service-medical-imaging.png",
  "service-predictive-analytics.png",
  "service-ai-content.png",
  "service-quality-inspection.png",
  "service-fraud-detection.png",
];

fs.mkdirSync(assetsDir, { recursive: true });

for (const asset of assets) {
  const url = `${baseUrl}/assets/${asset}`;
  const target = path.join(assetsDir, asset);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Failed (${response.status}): ${url}`);
      continue;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(target, buffer);
    console.log(`Downloaded: ${asset}`);
  } catch (error) {
    console.warn(`Error downloading ${asset}:`, error.message);
  }
}
