# GSoC 2026 Org Finder & Matcher

[![Deploy Status](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-blue?style=for-the-badge&logo=github)](https://23f2004661.github.io/scrapers-/)

A premium, interactive React dashboard designed to help prospective Google Summer of Code (GSoC) contributors find and analyze participating organizations matching their skills, programming stacks, and domain interests.

🖥️ **Live Web Application:** [https://23f2004661.github.io/scrapers-/](https://23f2004661.github.io/scrapers-/)

---

## ⚡ Key Features

* **🔍 Smart Global Search & Category Filters:** Search instantly through organization names, licenses, descriptions, technology lists, and categories.
* **🔬 Deep Keyword Interest Matching:** Match scores check beyond structured tags—scanning organization taglines and detailed about text. Perfect for finding niche domains like `GIS`, `compiler`, or `robotics` which might not be listed as explicit tech stacks.
* **🖍️ Dynamic Text Highlighting:** Matched interests are highlighted in **green**, and global search matches are highlighted in **amber** dynamically as you type or select tags.
* **📊 Ecosystem Analytics Dashboard:** Visual charts ranking the top programming stacks used in GSoC 2026, category breakdown, open source licenses, and metadata readiness ratios (Ideas list and guidance URLs).
* **🔖 Local Bookmarks / Favorites:** Shortlist organizations and save them locally to your browser. Filter by bookmarked lists instantly.
* **📑 Exploratory Sliding Drawer Details:** Access direct links to **Project Ideas lists**, **Contributor guidelines**, repository codes, and live communication channels (Discord, Slack, IRC, mailing lists). Click on any tag inside the drawer to append it to your active filters!

---

## 📁 Repository Structure

* `gsoc/` - Core Google Summer of Code Matcher project folder.
  * `gsoc/main.py` - Scraper script used to crawl and fetch official GSoC organization metadata.
  * `gsoc/data.json` - Raw scraped dataset of participating GSoC organizations.
  * `gsoc/frontend/` - React frontend application directory (Vite, React, Vanilla CSS).
    * `gsoc/frontend/public/data.json` - Target dataset copy fetched by the React client.
    * `gsoc/frontend/src/App.jsx` - Core React app logic, interest matching algorithms, and state.
    * `gsoc/frontend/src/components/` - Sub-components including `OrgCard`, `OrgDetails` sliding drawer, and `StatsPanel` analytics dashboard.
    * `gsoc/frontend/src/index.css` - Custom glassmorphic styles, transitions, animations, and typography variables.

---

## 🛠️ Local Setup & Run Instructions

### 1. Requirements
Ensure you have **Node.js** (v18+) and **Python 3** installed locally.

### 2. Run the Frontend React App
Navigate to the `gsoc/frontend/` directory, install dependencies, and start the Vite server:

```bash
cd gsoc/frontend
npm install
npm run dev
```
Open your browser to `http://localhost:5173`.

### 3. Run the Scraper (Optional)
To refresh the dataset from Google Summer of Code, run the scraper script in the root directory:
```bash
python3 gsoc/main.py
```

### 4. Deploying Updates to GitHub Pages
To update the live web application on your GitHub repository page:
```bash
cd gsoc/frontend
npm run deploy
```
This automatically compiles the React code and pushes the production assets to your `gh-pages` branch.
