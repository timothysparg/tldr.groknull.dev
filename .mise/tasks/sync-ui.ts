#!/usr/bin/env -S bun -i
//MISE description="Sync UI bundle and assets from a GitHub release"
//MISE alias="ui"
//MISE tools={bun="latest"}
//USAGE arg "[version]" help="UI version to sync (e.g. v1.2.3, latest, beta). Defaults to current playbook version."

import fs from "node:fs";
import { createHash } from "node:crypto";
import { parse, stringify } from "yaml";

const FILE = "antora-playbook.yml";
const REPO = "timothysparg/tldr-ui";
const TARGET_ASSETS = ["antora-tldr-ui.js", "asciidoc-tldr-ui.js"];

async function getLatestTag() {
  const response = await fetch(`https://github.com/${REPO}/releases/latest`, {
    redirect: "manual",
  });
  const location = response.headers.get("location");
  if (!location) {
    throw new Error("Could not resolve latest release tag");
  }
  return location.split("/").pop();
}

async function getReleaseData(tag: string) {
  const url = `https://api.github.com/repos/${REPO}/releases/${tag === "latest" ? "latest" : `tags/${tag}`}`;
  const response = await fetch(url, {
    headers: { "Accept": "application/vnd.github.v3+json" }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch release info for tag '${tag}': ${response.statusText}`);
  }
  return await response.json();
}

async function downloadAsset(url: string, filename: string) {
  process.stdout.write(`  ↓ ${filename}... `);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`\nFailed to download ${filename} from ${url}: ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(filename, Buffer.from(buffer));
  const stats = fs.statSync(filename);
  const size = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`${size} MB`);
}

function sha256File(filename: string) {
  const hash = createHash("sha256");
  hash.update(fs.readFileSync(filename));
  return hash.digest("hex");
}

function needsDownload(asset: { name: string; digest: string | null }) {
  if (!fs.existsSync(asset.name)) return true;
  if (!asset.digest) return true;
  return sha256File(asset.name) !== asset.digest;
}

function extractTagFromUrl(url: string): string {
  const parts = url.split("/");
  const tagIndex = parts.indexOf("download") + 1;
  if (tagIndex > 0 && tagIndex < parts.length) {
    return parts[tagIndex];
  }
  throw new Error(`Could not extract tag from URL: ${url}`);
}

async function main() {
  if (!fs.existsSync(FILE)) {
    throw new Error(`File not found: ${FILE}`);
  }

  // Use the environment variable provided by mise for the [version] argument
  const requestedVersion = process.env.usage_version;
  
  const fileContent = fs.readFileSync(FILE, "utf8");
  const playbook = parse(fileContent);
  
  let tag: string;
  let updatePlaybook = false;

  if (requestedVersion) {
    console.log(`Switching UI version to: ${requestedVersion}`);
    if (requestedVersion.toLowerCase() === "latest") {
      tag = await getLatestTag() as string;
    } else {
      tag = requestedVersion;
    }
    updatePlaybook = true;
  } else {
    console.log("No version specified. Syncing with current playbook configuration...");
    const currentUrl = playbook.ui?.bundle?.url;
    if (!currentUrl) {
      throw new Error("No UI bundle URL found in playbook. Please specify a version.");
    }
    tag = extractTagFromUrl(currentUrl);
  }

  const targetUrl = `https://github.com/${REPO}/releases/download/${tag}/ui-bundle.zip`;
  const isSnapshot = tag === "beta";

  if (updatePlaybook) {
    if (!playbook.ui) playbook.ui = {};
    if (!playbook.ui.bundle) playbook.ui.bundle = {};
    playbook.ui.bundle.url = targetUrl;
    playbook.ui.bundle.snapshot = isSnapshot;
    fs.writeFileSync(FILE, stringify(playbook), "utf8");
    console.log(`Updated ${FILE} to version ${tag} (snapshot: ${isSnapshot})`);
  }

  console.log(`Fetching release data for: ${tag}...`);
  const releaseData = await getReleaseData(tag);

  const assetsToDownload = releaseData.assets
    .map((a: any) => ({
      name: a.name,
      url: a.browser_download_url,
      digest: typeof a.digest === "string" ? a.digest.replace(/^sha256:/, "") : null,
    }))
    .filter((a: any) => TARGET_ASSETS.includes(a.name));

  const hasAssetChanges = assetsToDownload.some((asset: any) => needsDownload(asset));

  if (releaseData.body && hasAssetChanges) {
    console.log("\n--- Release Notes ---");
    const rendered = await Bun.markdown.ansi(releaseData.body);
    console.log(rendered);
    console.log("---------------------\n");
  }

  console.log(`Syncing assets for tag: ${tag}`);
  if (assetsToDownload.length === 0) {
    console.log("No matching JS assets found in this release.");
  } else {
    for (const asset of assetsToDownload) {
      if (!needsDownload(asset)) {
        console.log(`  = ${asset.name} unchanged, skipping download`);
        continue;
      }
      await downloadAsset(asset.url, asset.name);
    }
  }

  console.log("\nUI Resources Synchronized successfully.");
}

main().catch(err => {
  console.error(`\nError: ${err.message}`);
  process.exit(1);
});
