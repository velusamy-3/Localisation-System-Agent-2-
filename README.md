# Website Cloner & Localisation System

An AI-powered automation system that reconstructs modern websites (React/Next.js) into static HTML and localises content for different regions.

---

## 🚀 Overview

This system automates the complete process of:

* Cloning a live website without source code access
* Converting it into a fully static version
* Rewriting all visible content for a target market
* Producing a deployment-ready output

The result is a **fully localised static website** with zero manual effort.

---

## 🧠 System Architecture

The system follows a **two-agent pipeline**:

```
Input Website URL
        ↓
Agent 1 — Cloning Engine
        ↓
Static Website Output
        ↓
Local Development Server (server.js)
        ↓
Agent 2 — Localisation Engine (n8n + LLM)
        ↓
Localised Website Output
        ↓
Deployment (Vercel)
```

---

## ⚙️ Agent 1 — Cloning Engine

### Purpose

Convert dynamic websites into fully functional static HTML sites.

### Key Capabilities

* Uses Puppeteer to render React / Next.js websites
* Captures fully hydrated DOM content
* Extracts:

  * HTML
  * CSS
  * Images
  * Fonts
  * Videos
* Removes all JavaScript bundles and frameworks
* Rebuilds UI components:

  * Navigation dropdowns
  * FAQ accordions
* Rewrites internal links and asset paths

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
3. Classify content (PROTECT / TRANSLATE)
4. Send text to LLM
5. Rewrite content for target region
6. Inject updated text back into HTML

---

### Key Features

* Smart text classification:

  * **PROTECT** → brand names, numbers, technical terms
  * **TRANSLATE** → user-facing content
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

## 🧩 Local Development Server (Integration Layer)

### Purpose

A lightweight Node.js server (`server.js`) is used during development to support the localisation workflow.

### Why it is needed

During Agent 2 (n8n localisation pipeline):

* HTML files need consistent access via URLs
* Clean routing must be maintained (`/about` → `/about/index.html`)
* Relative paths must resolve correctly
* Browser-based rendering and testing must work properly

The server ensures:

* Stable file serving environment
* Correct routing for nested pages
* Smooth integration with n8n workflow

---

### Usage

```bash
node server.js
```

Then open:

```
http://localhost:3000
```

---

### Important Notes

* This server is used **only during development and processing**
* It is **not required in production**
* Final output is deployed as a static site (e.g., Vercel)

---

## 🛡️ System Guarantees

* Deterministic mapping of text nodes
* Line count validation (prevents mismatch errors)
* Structural preservation of HTML
* No modification of DOM hierarchy

---

## 📂 Project Structure

```
/agent-1-cloner
  cloner.js
  crawler.js

/agent-2-localizer
  extraction-node.js
  injection-node.js
  prompt.txt

/server.js
```

---

## ▶️ How to Use

### Step 1 — Run Cloning Engine

```bash
node cloner.js
```

➡️ Output: `/cloned-site`

---

### Step 2 — Start Local Server

```bash
node server.js
```

---

### Step 3 — Run Localisation Pipeline

* Import workflow into n8n
* Execute localisation workflow

➡️ Output: Localised HTML files

---

## 📦 Output

The system generates:

* Fully static HTML website
* Localised content for target region
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
* Automated validation layer

---

## 👨‍💻 Author

Velusamy
Automation & AI Engineering Project
