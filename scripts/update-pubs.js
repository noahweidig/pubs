// update-pubs.js (runs on GitHub Actions)

import fs from "fs";
import fetch from "node-fetch";

const userID = 11988712;
const url = `https://api.zotero.org/users/${userID}/publications/items?format=json&include=bib,data&style=apa&limit=200`;

const items = await fetch(url).then(r => r.json());

const doiRegex = /\b(10\.\d{4,9}\/[-._;()/:A-Z0-9]+)\b/gi;
const urlRegex = /(?<!href=")(https?:\/\/[^\s<]+)/gi;

function extractYear(str) {
  const m = str?.match(/\b(19|20)\d{2}\b/);
  return m ? +m[0] : 0;
}

function mapType(it) {
  const t = it.data.itemType;
  if (t === "journalArticle") return "Publications";
  if (t === "presentation" || t === "conferencePaper") return "Presentations";
  if (t === "thesis") return "Theses";
  if (t === "preprint" || /referee report/i.test(it.data.title || "")) return "Peer Reviews";
  return "Media Coverage";
}

function linkify(text) {
  return text
    .replace(doiRegex, '<a href="https://doi.org/$1" target="_blank">$1</a>')
    .replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
}

const grouped = {};

items.forEach(it => {
  if (it.data.itemType === "attachment") return;
  const type = mapType(it);
  grouped[type] ??= [];
  grouped[type].push({
    year: extractYear(it.data.date),
    bib: linkify(it.bib),
    abs: it.data.abstractNote || ""
  });
});

const typeOrder = ["Publications", "Presentations", "Theses", "Peer Reviews", "Media Coverage"];

let html = typeOrder.map(type =>
  grouped[type]
    ? `<div class="type-heading">${type}</div>` +
      grouped[type]
        .sort((a, b) => b.year - a.year)
        .map(e => `<div class="entry">${e.bib}${e.abs ? `<details><summary>Abstract</summary><p>${e.abs}</p></details>` : ""}</div>`)
        .join("")
    : ""
).join("");

html = html.replace(/Weidig,\s*N\.?\s*C\.?/g, "<strong>$&</strong>");

fs.writeFileSync("publications.html", html);
console.log("✅ publications.html updated");
