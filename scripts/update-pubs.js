import fs from "fs";
import fetch from "node-fetch";

const indexPath = "./index.html"; 
const userID = 11988712;

const url =
  `https://api.zotero.org/users/${userID}/publications/items?format=json&include=bib,data&style=apa&limit=200`;

// load index.html early so we can error out explicitly if missing
if (!fs.existsSync(indexPath)) {
  throw new Error("❌ index.html not found in repo root.");
}

// ===== FIX STARTS HERE =====
const fetchWithRetry = async (url, { attempts = 3, delayMs = 1_000 } = {}) => {
  let lastPayload = "";
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(url);
      const payload = await response.text();

      if (response.ok) {
        return payload;
      }

      lastPayload = payload;

      // Retry transient server errors with exponential backoff
      if (response.status >= 500 && attempt < attempts) {
        const wait = delayMs * attempt;
        console.warn(
          `⚠️ Zotero API error (${response.status}) on attempt ${attempt}/${attempts}; retrying in ${wait}ms...`
        );
        await new Promise(resolve => setTimeout(resolve, wait));
        continue;
      }

      throw new Error(`❌ Zotero API error (${response.status}): ${payload}`);
    } catch (err) {
      lastError = err;

      if (attempt < attempts) {
        const wait = delayMs * attempt;
        console.warn(
          `⚠️ Zotero API request failed on attempt ${attempt}/${attempts} (${err?.message ?? err}); retrying in ${wait}ms...`
        );
        await new Promise(resolve => setTimeout(resolve, wait));
        continue;
      }

      throw new Error(`❌ Zotero API request failed after ${attempts} attempts: ${err?.message ?? err}`);
    }
  }

  throw new Error(`❌ Zotero API error after ${attempts} attempts: ${lastPayload || lastError}`);
};

const payload = await fetchWithRetry(url);

let items;
try {
  items = JSON.parse(payload);
} catch (err) {
  throw new Error(`❌ Unexpected Zotero API response: ${payload}`);
}
const doiRegex = /(?<!doi\.org\/)\b(10\.\d{4,9}\/[-._;()/:A-Z0-9]+)\b/gi;
const urlRegex = /(?<!href=")(https?:\/\/[^\s<]+)/gi;

const extractYear = s => (s?.match(/\b(19|20)\d{2}\b/) ? +s.match(/\b(19|20)\d{2}\b/)[0] : 0);

function linkify(t) {
  return t
    .replace(doiRegex, '<a href="https://doi.org/$1" target="_blank">$1</a>')
    .replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
}

function categorize(it) {
  const t = it.data.itemType;
  if (t === "journalArticle") return "Publications";
  if (t === "presentation" || t === "conferencePaper") return "Presentations";
  if (t === "thesis") return "Theses";
  if (t === "preprint" || /referee report/i.test(it.data.title || "")) return "Peer Reviews";
  return "Media Coverage";
}

const grouped = {};
items.forEach(it => {
  if (it.data.itemType === "attachment") return;
  const type = categorize(it);
  grouped[type] ??= [];
  grouped[type].push({
    year: extractYear(it.data.date),
    bib: linkify(it.bib),
    abs: it.data.abstractNote || ""
  });
});

const typeOrder = ["Publications","Presentations","Theses","Peer Reviews","Media Coverage"];

let pubs = typeOrder
  .filter(type => grouped[type])
  .map(type =>
    `<div class="type-heading">${type}</div>` +
    grouped[type]
      .sort((a, b) => b.year - a.year)
      .map(e => `<div class="entry">${e.bib}${e.abs ? `<details><summary>Abstract</summary><p>${e.abs}</p></details>` : ""}</div>`)
      .join("")
  )
  .join("");

pubs = pubs.replace(/Weidig,\s*N\.?\s*C\.?/g, "<strong>$&</strong>");

let indexFile = fs.readFileSync(indexPath, "utf8");

if (!indexFile.includes("<!-- START PUBS -->") || !indexFile.includes("<!-- END PUBS -->")) {
  throw new Error("❌ START PUBS / END PUBS markers not found in index.html");
}

indexFile = indexFile.replace(
  /<!-- START PUBS -->[\s\S]*<!-- END PUBS -->/,
  `<!-- START PUBS -->\n${pubs}\n<!-- END PUBS -->`
);

fs.writeFileSync(indexPath, indexFile);

console.log("✅ Publications injected into index.html");
