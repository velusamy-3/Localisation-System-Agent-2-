# Website Cloner & Localisation System

An AI-powered automation system that reconstructs modern websites (React/Next.js) into static HTML and localises content for different regions.

---

## 🚀 Overview

This project is designed to fully automate the process of:

* Cloning a live website without source code access
* Converting it into a static, deployable version
* Rewriting all visible content for a target market
* Producing a ready-to-deploy output

The system eliminates manual effort in website localisation and reconstruction.

---

## 🧠 System Architecture

The system follows a **two-agent pipeline**:

```id="9m5wrp"
Input Website URL
        ↓
Agent 1 — Cloning Engine
        ↓
Static Website Output
        ↓
Agent 2 — Localisation Engine
        ↓
Localised Website
```

---

## ⚙️ Agent 1 — Cloning Engine

### Purpose

Reconstruct a dynamic website into a static HTML version.

### Key Capabilities

* Uses Puppeteer to render React / Next.js websites
* Captures fully hydrated DOM content
* Extracts:

  * HTML
  * CSS
  * Images
  * Fonts
  * Videos
* Removes all JavaScript bundles
* Rebuilds UI components using lightweight logic:

  * Navigation dropdowns
  * FAQ accordions
* Generates a clean static website

### Tech Stack

* Node.js
* Puppeteer
* Axios
* fs-extra
* Prettier

---

## 🌍 Agent 2 — Localisation Engine

### Purpose

Transform website content to match a target region using AI.

### Workflow

1. Read HTML files
2. Extract visible text nodes
3. Send content to LLM
4. Rewrite content for target region
5. Inject updated text back into HTML

---

### Key Features

* Smart text classification:

  * **PROTECT** → unchanged (brand names, numbers)
  * **TRANSLATE** → rewritten content
* British English localisation:

  * ₹ → £
  * +91 → +44
  * India → United Kingdom
* Maintains DOM structure without breaking layout

### Tech Stack

* n8n
* Cheerio
* LLM (Cohere / Claude)

---

## 🛡️ System Guarantees

* Deterministic mapping of text nodes
* Line count validation (prevents mismatch errors)
* Structural preservation of HTML

---

## 📂 Project Structure

```id="d1akg9"
/agent-1-cloner
  cloner.js
  crawler.js

/agent-2-localizer
  extraction-node.js
  injection-node.js
  prompt.txt
```

---

## ▶️ How to Use

### Step 1 — Run Cloning Engine

```bash id="d9a5xk"
node cloner.js
```

➡️ Output: `/cloned-site`

---

### Step 2 — Run Localisation Pipeline

* Import workflow into n8n
* Execute localisation workflow

➡️ Output: Localised HTML files

---

## 📦 Output

The system generates:

* Fully static website
* Localised content
* Deployment-ready files

---

## 🔗 Output Repository

👉 Technozis UK (Final Output)
(Add your GitHub repo link here)

---

## 🎯 Use Cases

* Website localisation automation
* Static site generation from dynamic apps
* Competitor analysis
* AI-powered content transformation

---

## 🚀 Future Improvements

* Multi-country localisation support
* Smart node classification
* Parallel processing for faster execution
* Automated validation of transformed content

---

## 👨‍💻 Author

Velusamy
Automation & AI Engineering Project
