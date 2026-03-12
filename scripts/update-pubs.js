import fs from "fs";
import fetch from "node-fetch";
import { sanitizeHtml } from "./sanitize.js";

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

      // SENTINEL: Do not leak raw response payloads in error messages
      throw new Error(`❌ Zotero API error (${response.status})`);
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

  // SENTINEL: Do not leak raw response payloads in error messages
  throw new Error(`❌ Zotero API error after ${attempts} attempts: ${lastError?.message || "Transient failure"}`);
};

const payload = await fetchWithRetry(url);

let items;
try {
  items = JSON.parse(payload);
} catch (err) {
  // SENTINEL: Do not leak raw response payloads in error messages
  throw new Error(`❌ Unexpected Zotero API response (could not parse JSON).`);
}
const doiRegex = /(?<!doi\.org\/)\b(10\.\d{4,9}\/[-._;()/:A-Z0-9]+)\b/gi;
// SENTINEL: Exclude quotes to prevent XSS in generated HTML attributes
const urlRegex = /(?<!href=")(https?:\/\/[^\s<"']+)/gi;
// SENTINEL: Restrict href extraction to http/https to prevent javascript: or data: XSS
const hrefRegex = /href="(https?:\/\/[^"]+)"/i;

const extractYear = s => (s?.match(/\b(19|20)\d{2}\b/) ? +s.match(/\b(19|20)\d{2}\b/)[0] : 0);

function normalizeBibDate(bib, rawDate) {
  const year = extractYear(rawDate) || extractYear(bib);
  if (!year) return bib;

  // Normalize Zotero's mixed date styles (e.g., "(2025, April)", "(2025, Nov 19)") to a single output format: "(YYYY)".
  return bib.replace(/\([^()]*\b(?:19|20)\d{2}\b[^()]*\)/, `(${year})`);
}

function linkify(t) {
  // SENTINEL: Use replacer functions to prevent string injection attacks from user-controlled URLs containing $&, $', etc.
  return t
    .replace(doiRegex, (match, p1) => `<a href="https://doi.org/${p1}" target="_blank" rel="noopener noreferrer">${p1}</a>`)
    .replace(urlRegex, (match, p1) => `<a href="${p1}" target="_blank" rel="noopener noreferrer">${p1}</a>`);
}

function categorize(it) {
  const t = it.data.itemType;
  const webinarText = [it.data.title, it.data.event, it.data.genre, it.bib]
    .filter(Boolean)
    .join(" ");
  if (/\bwebinar\b/i.test(webinarText)) return "Webinars";
  if (t === "journalArticle") return "Journal Articles";
  if (t === "presentation" || t === "conferencePaper") return "Presentations";
  if (t === "thesis") return "Thesis";
  if (t === "preprint" || /referee report/i.test(it.data.title || "")) return "Peer Reviews";
  return "Media Coverage";
}

function escapeHtml(unsafe) {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const grouped = {};
items.forEach(it => {
  if (it.data.itemType === "attachment") return;
  const type = categorize(it);
  grouped[type] ??= [];
  // SENTINEL: Linkify BEFORE sanitization to ensure injected tags are parsed and sanitized safely
  const normalizedBib = normalizeBibDate(it.bib, it.data.date);
  const linkedBib = linkify(normalizedBib);
  const safeBib = sanitizeHtml(linkedBib);
  grouped[type].push({
    year: extractYear(it.data.date),
    bib: safeBib,
    abs: escapeHtml(it.data.abstractNote),
    link: safeBib.match(hrefRegex)?.[1] || "",
    title: escapeHtml(it.data.title || ""),
    isWebinar: type === "Webinars"
  });
});

const typeOrder = ["Journal Articles","Thesis","Presentations","Webinars","Peer Reviews","Media Coverage"];

let pubs = typeOrder
  .filter(type => grouped[type])
  .map(type =>
    `<h2 class="type-heading">${type}</h2>` +
    grouped[type]
      .sort((a, b) => b.year - a.year)
      .map(e => {
        const linkBtnText = e.isWebinar ? "Watch Now" : "View Online";
        const linkBtnLabel = e.isWebinar ? "Watch webinar" : "View Online";
        const linkBtnClass = e.isWebinar ? "entry-link-btn webinar-link-btn" : "entry-link-btn";
        const linkBtn = e.link ? `<a class="${linkBtnClass}" href="${e.link}" target="_blank" rel="noopener noreferrer" aria-label="${linkBtnLabel}: ${e.title}">${linkBtnText}</a>` : "";
        const copyBtn = `<button class="copy-btn" title="Copy citation" aria-live="polite"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy</button>`;
        const details = e.abs ? `<details><summary>Summary</summary><p>${e.abs}</p></details>` : "";
        const actions = (linkBtn || details) ? `<div class="entry-actions">${linkBtn}${copyBtn}${details}</div>` : `<div class="entry-actions">${copyBtn}</div>`;
        return `<div class="entry">${e.bib}${actions}</div>`;
      })
      .join("")
  )
  .join("");

// SENTINEL: Use replacer function to prevent injection from user-controlled data containing replacement patterns (e.g., $', $&)
pubs = pubs.replace(/Weidig,\s*N\.?\s*C\.?/g, (match) => `<strong>${match}</strong>`);

let indexFile = fs.readFileSync(indexPath, "utf8");

if (!indexFile.includes("<!-- START PUBS -->") || !indexFile.includes("<!-- END PUBS -->")) {
  throw new Error("❌ START PUBS / END PUBS markers not found in index.html");
}

// SENTINEL: Use replacer function to prevent injection from user-controlled data containing replacement patterns (e.g., $', $&)
indexFile = indexFile.replace(
  /<!-- START PUBS -->[\s\S]*<!-- END PUBS -->/,
  () => `<!-- START PUBS -->\n${pubs}\n<!-- END PUBS -->`
);

fs.writeFileSync(indexPath, indexFile);

console.log("✅ Research injected into index.html");
