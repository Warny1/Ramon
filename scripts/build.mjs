import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const dist = join(root, "dist");
const requiredFiles = [
  "index.html",
  "styles.css",
  "supabase-config.js",
  "app.js",
  "attendance-data.js",
  "manifest.webmanifest",
  "service-worker.js",
  "icon.svg",
  "demo-data.json",
];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const file of requiredFiles) {
  await cp(join(root, file), join(dist, file));
}

const env = await loadEnvLocal();
const supabaseUrl = process.env.SUPABASE_URL || env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || "";
await writeFile(
  join(dist, "supabase-config.js"),
  `window.SUPABASE_CONFIG = ${JSON.stringify({ url: supabaseUrl, anonKey: supabaseAnonKey }, null, 2)};\n`,
);

const manifest = JSON.parse(await readFile(join(dist, "manifest.webmanifest"), "utf8"));
if (manifest.start_url !== "/" || manifest.scope !== "/") {
  throw new Error("manifest.webmanifest must use root start_url and scope for Vercel PWA install.");
}

const index = await readFile(join(dist, "index.html"), "utf8");
const serviceWorker = await readFile(join(dist, "service-worker.js"), "utf8");
if (!index.includes('href="/manifest.webmanifest"') || !index.includes('register("/service-worker.js")')) {
  throw new Error("index.html must reference the manifest and service worker from the site root.");
}
if (!serviceWorker.includes('"/index.html"') || !serviceWorker.includes('"/manifest.webmanifest"') || !serviceWorker.includes('"/supabase-config.js"')) {
  throw new Error("service-worker.js is missing required root-cache entries.");
}

await writeFile(join(dist, ".vercel-build-ok"), new Date().toISOString());

async function loadEnvLocal() {
  try {
    const text = await readFile(join(root, ".env.local"), "utf8");
    return Object.fromEntries(
      text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
        .map((line) => {
          const [key, ...value] = line.split("=");
          return [key.trim(), value.join("=").trim().replace(/^["']|["']$/g, "")];
        }),
    );
  } catch {
    return {};
  }
}
