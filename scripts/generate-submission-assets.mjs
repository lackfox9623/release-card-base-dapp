import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(new URL("..", import.meta.url).pathname);
const outDir = join(root, "base-submission");
const W = 1284;
const H = 2778;

const c = {
  bg: "#0f1115",
  panel: "#111822",
  deep: "#0b0f14",
  grid: "rgba(109,240,194,0.08)",
  mint: "#6df0c2",
  amber: "#ffb84d",
  text: "#f4f7fb",
  soft: "#d9fff2",
  line: "rgba(109,240,194,0.42)",
};

function esc(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function wrap(text, maxChars) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function frame(content) {
  return `
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="${c.bg}"/>
    <path d="M0 0H1284V2778H0Z" fill="${c.bg}"/>
    <path d="M0 0H1284M0 260H1284M0 520H1284M0 780H1284M0 1040H1284M0 1300H1284M0 1560H1284M0 1820H1284M0 2080H1284M0 2340H1284M0 2600H1284" stroke="${c.grid}" stroke-width="3"/>
    <path d="M96 0V2778M356 0V2778M616 0V2778M876 0V2778M1136 0V2778" stroke="${c.grid}" stroke-width="3"/>
    <circle cx="220" cy="190" r="270" fill="${c.mint}" opacity="0.14"/>
    <circle cx="1110" cy="2600" r="300" fill="${c.amber}" opacity="0.12"/>
    ${content}
  </svg>`;
}

function titleBlock(title, subtitle) {
  return `
    <text x="72" y="126" font-family="Courier New, monospace" font-size="32" font-weight="900" fill="${c.mint}">RELEASE CARD</text>
    <text x="72" y="238" font-family="Arial, sans-serif" font-size="82" font-weight="900" fill="${c.text}">${esc(title)}</text>
    <text x="78" y="304" font-family="Arial, sans-serif" font-size="32" font-weight="800" fill="${c.soft}">${esc(subtitle)}</text>
  `;
}

function releaseCard(x, y, project, version, status, summary) {
  const lines = wrap(summary, 34).slice(0, 5);
  return `
    <rect x="${x}" y="${y}" width="1060" height="1040" rx="28" fill="${c.panel}" stroke="${c.line}" stroke-width="5"/>
    <rect x="${x}" y="${y}" width="1060" height="80" rx="28" fill="${c.deep}"/>
    <circle cx="${x + 52}" cy="${y + 40}" r="12" fill="#ff5f57"/>
    <circle cx="${x + 92}" cy="${y + 40}" r="12" fill="#ffbd2e"/>
    <circle cx="${x + 132}" cy="${y + 40}" r="12" fill="#28c840"/>
    <text x="${x + 58}" y="${y + 148}" font-family="Courier New, monospace" font-size="25" font-weight="900" fill="${c.mint}">PROJECT RELEASE</text>
    <text x="${x + 58}" y="${y + 260}" font-family="Arial, sans-serif" font-size="82" font-weight="900" fill="${c.text}">${esc(project)}</text>
    <rect x="${x + 58}" y="${y + 338}" width="300" height="138" rx="18" fill="${c.deep}" stroke="${c.line}" stroke-width="4"/>
    <text x="${x + 86}" y="${y + 394}" font-family="Courier New, monospace" font-size="22" font-weight="900" fill="${c.mint}">VERSION</text>
    <text x="${x + 86}" y="${y + 452}" font-family="Arial, sans-serif" font-size="44" font-weight="900" fill="${c.text}">${esc(version)}</text>
    <rect x="${x + 386}" y="${y + 338}" width="300" height="138" rx="18" fill="${c.amber}"/>
    <text x="${x + 414}" y="${y + 394}" font-family="Courier New, monospace" font-size="22" font-weight="900" fill="#5a3500">STATUS</text>
    <text x="${x + 414}" y="${y + 452}" font-family="Arial, sans-serif" font-size="44" font-weight="900" fill="${c.bg}">${esc(status)}</text>
    <rect x="${x + 58}" y="${y + 558}" width="944" height="320" rx="18" fill="${c.deep}" stroke="${c.line}" stroke-width="4"/>
    <text x="${x + 90}" y="${y + 622}" font-family="Courier New, monospace" font-size="22" font-weight="900" fill="${c.mint}">SUMMARY</text>
    ${lines.map((line, i) => `<text x="${x + 90}" y="${y + 686 + i * 44}" font-family="Arial, sans-serif" font-size="32" font-weight="800" fill="${c.soft}">${esc(line)}</text>`).join("")}
    <rect x="${x + 58}" y="${y + 932}" width="944" height="76" rx="18" fill="${c.deep}" stroke="${c.line}" stroke-width="4"/>
    <text x="${x + 90}" y="${y + 982}" font-family="Courier New, monospace" font-size="23" font-weight="900" fill="${c.mint}">SHIPPER WALLET + TIMESTAMP STORED ON BASE</text>
  `;
}

function feature(x, y, title, body, accent) {
  return `
    <rect x="${x}" y="${y}" width="540" height="220" rx="22" fill="${c.panel}" stroke="${c.line}" stroke-width="5"/>
    <rect x="${x}" y="${y}" width="540" height="16" rx="8" fill="${accent}"/>
    <text x="${x + 34}" y="${y + 82}" font-family="Arial, sans-serif" font-size="38" font-weight="900" fill="${c.text}">${esc(title)}</text>
    ${wrap(body, 30).slice(0, 3).map((line, i) => `<text x="${x + 34}" y="${y + 134 + i * 34}" font-family="Arial, sans-serif" font-size="27" font-weight="800" fill="${c.soft}">${esc(line)}</text>`).join("")}
  `;
}

function screenshot1() {
  return frame(`
    ${titleBlock("Log what shipped.", "Publish version updates with wallet proof on Base.")}
    ${releaseCard(112, 460, "Orbit Notes", "v1.2.0", "Shipped", "Added faster wallet recovery, cleaned the mobile flow, and shipped a clearer Base transaction receipt.")}
    ${feature(72, 1640, "Version card", "Project, version, status, and summary.", c.mint)}
    ${feature(672, 1640, "On Base", "Shipper wallet and timestamp stay public.", c.amber)}
  `);
}

function screenshot2() {
  return frame(`
    ${titleBlock("Show the changelog.", "Each release gets an ID and a readable card.")}
    ${feature(72, 390, "Release ID", "Load any shipped update by number.", c.amber)}
    ${feature(672, 390, "Status", "Shipped, beta, patch, or milestone.", c.mint)}
    ${releaseCard(112, 730, "Base Widget", "beta-04", "Beta", "Tested the account connection, improved empty states, and made the publish button easier to spot on mobile.")}
  `);
}

function screenshot3() {
  return frame(`
    ${titleBlock("Built for builders.", "A tiny public log for app progress and releases.")}
    ${releaseCard(112, 430, "Signal Kit", "patch-7", "Patch", "Fixed the share preview, added BaseScan links, and trimmed the transaction copy to make confirmations simpler.")}
    ${feature(72, 1650, "BaseScan link", "Open the transaction after publishing.", c.mint)}
    ${feature(672, 1650, "Mobile first", "Fast to read inside Base App.", c.amber)}
  `);
}

function iconSvg() {
  return `
  <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <rect width="1024" height="1024" fill="${c.bg}"/>
    <rect x="138" y="158" width="748" height="708" rx="62" fill="${c.panel}" stroke="${c.mint}" stroke-width="26"/>
    <rect x="138" y="158" width="748" height="110" rx="55" fill="${c.deep}"/>
    <circle cx="214" cy="214" r="18" fill="#ff5f57"/>
    <circle cx="274" cy="214" r="18" fill="#ffbd2e"/>
    <circle cx="334" cy="214" r="18" fill="#28c840"/>
    <path d="M300 420H724M300 540H590M300 660H684" stroke="${c.text}" stroke-width="44" stroke-linecap="round"/>
    <rect x="300" y="728" width="300" height="70" rx="20" fill="${c.amber}"/>
  </svg>`;
}

function thumbnailSvg() {
  return `
  <svg width="1910" height="1000" viewBox="0 0 1910 1000" xmlns="http://www.w3.org/2000/svg">
    <rect width="1910" height="1000" fill="${c.bg}"/>
    <path d="M0 180H1910" stroke="${c.line}" stroke-width="5"/>
    <text x="96" y="132" font-family="Arial, sans-serif" font-size="108" font-weight="900" fill="${c.text}">Release Card</text>
    <text x="104" y="250" font-family="Arial, sans-serif" font-size="42" font-weight="800" fill="${c.soft}">Publish compact release notes on Base.</text>
    ${feature(106, 370, "Project update", "Version, status, summary.", c.mint)}
    ${feature(106, 635, "Onchain log", "Wallet and timestamp saved.", c.amber)}
    ${releaseCard(760, 244, "Orbit Notes", "v1.2.0", "Shipped", "Added faster wallet recovery, cleaned the mobile flow, and shipped a clearer Base transaction receipt.")}
  </svg>`;
}

async function writePng(name, svg, width = W, height = H) {
  const file = join(outDir, name);
  await sharp(Buffer.from(svg)).resize(width, height).png({ compressionLevel: 9 }).toFile(file);
  return file;
}

async function writeJpg(name, svg, width, height) {
  const file = join(outDir, name);
  await sharp(Buffer.from(svg)).resize(width, height).jpeg({ quality: 88, mozjpeg: true }).toFile(file);
  return file;
}

await mkdir(outDir, { recursive: true });

const files = [
  await writeJpg("app-icon.jpg", iconSvg(), 1024, 1024),
  await writeJpg("app-thumbnail.jpg", thumbnailSvg(), 1910, 1000),
  await writePng("screenshot-1.png", screenshot1()),
  await writePng("screenshot-2.png", screenshot2()),
  await writePng("screenshot-3.png", screenshot3()),
];

await writeFile(join(outDir, "asset-manifest.json"), JSON.stringify({ generatedAt: new Date().toISOString(), files }, null, 2), "utf8");
await writeFile(
  join(outDir, "submission-copy.md"),
  [
    "# Release Card",
    "",
    "App Name: Release Card",
    "Tagline: Log what shipped",
    "Description: Publish a compact release note with version, status, wallet, and timestamp on Base.",
    "",
    "Domain: https://release-card.vercel.app",
    "",
    "Assets:",
    "- app-icon.jpg",
    "- app-thumbnail.jpg",
    "- screenshot-1.png",
    "- screenshot-2.png",
    "- screenshot-3.png",
  ].join("\n"),
  "utf8",
);

for (const file of files) console.log(file);
