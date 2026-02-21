import { build as viteBuild } from "vite";
import { copyFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

async function buildExtension() {
  process.env.BUILD_EXTENSION = "1";

  console.log("Building extension (Vite)...");
  await viteBuild({
    configFile: path.join(root, "vite.config.ts"),
  });

  const extDist = path.join(root, "extension", "dist");
  const manifestSrc = path.join(root, "extension", "manifest.json");
  await copyFile(manifestSrc, path.join(extDist, "manifest.json"));
  console.log("Copied extension/manifest.json -> extension/dist/");

  // Copy favicon if it exists (optional)
  const faviconSrc = path.join(root, "client", "public", "favicon.png");
  try {
    await copyFile(faviconSrc, path.join(extDist, "favicon.png"));
    console.log("Copied favicon.png");
  } catch {
    // ignore
  }

  console.log("\nExtension built to extension/dist/");
  console.log("Load in Chrome: chrome://extensions -> Load unpacked -> select extension/dist");
}

buildExtension().catch((err) => {
  console.error(err);
  process.exit(1);
});
