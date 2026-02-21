import archiver from "archiver";
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const extDist = path.join(root, "extension", "dist");
const outDir = path.join(root, "dist", "public");
const outZip = path.join(outDir, "whispers-extension.zip");

async function zipExtension() {
  await mkdir(outDir, { recursive: true });

  const output = createWriteStream(outZip);
  const archive = archiver("zip", { zlib: { level: 9 } });

  await new Promise<void>((resolve, reject) => {
    output.on("close", () => resolve());
    archive.on("error", (err) => reject(err));
    archive.pipe(output);
    archive.directory(extDist, false);
    archive.finalize();
  });

  console.log("Created dist/public/whispers-extension.zip");
}

zipExtension().catch((err) => {
  console.error(err);
  process.exit(1);
});
