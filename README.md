BEGIN README

# Zotero → Static Publications Page (Auto-Updating)

This repository automatically pulls publications from my Zotero **My Publications** library and builds a static HTML page. The result is committed to `index.html` and published using GitHub Pages.

I embed the page in Google Sites so visitors **never trigger Zotero API calls** and the page loads instantly.

---

## ✅ How it works

1. A GitHub Action runs every 14 days (and can also be triggered manually).
2. The action fetches Zotero records using the Zotero Web API:
   https://api.zotero.org/users/{userID}/publications
3. The script `scripts/update-pubs.js` inserts formatted publication HTML into `index.html` by replacing everything between:
   ```
   <!-- START PUBS -->
   <!-- END PUBS -->
   ```
4. The updated `index.html` is committed to the repo.
5. GitHub Pages serves the updated static website.

No JS runs in the browser.  
No API is hit when someone views the embedded page.

---

## 📁 Repository structure

```
/
├─ index.html                  # Final static webpage served by GitHub Pages
├─ package.json                # Specifies dependency (node-fetch)
├─ scripts/
│    └─ update-pubs.js         # Fetches Zotero + injects HTML into index.html
└─ .github/
     └─ workflows/
          └─ update.yml        # Scheduled automation (cron)
```

---

## 🔁 Manual update

GitHub → Actions → `Update Zotero Publications` → **Run workflow**

This forces an update immediately instead of waiting 14 days.

---

## 🌐 Embed into Personal Website

Personal Site → Insert → Embed → URL  
Paste this URL:

```
https://YOUR_USERNAME.github.io/Zotero
```

---

## 🕒 Change update frequency

Modify `.github/workflows/update.yml`

Example: once a week  
```
schedule:
  - cron: "0 0 * * 1"
```

---

## Requirements

- Zotero library must be public
- GitHub Pages must be enabled:  
  Settings → Pages → Deploy from branch → main → root
- `index.html` must be in the **repo root**

---

## License

MIT License — use freely.

END README
