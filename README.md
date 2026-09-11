# Backpocket — Campus Lost & Found Web App

An accessible, mobile-first **Lost & Found** web application built for university campuses. Designed to bridge the gap between campus desk officers and students, allowing staff to catalog newly turned-in property and enabling students to search, filter, and reclaim misplaced belongings.


---

## 🌟 Key Features & User Roles

### 🧑‍🎓 Student & Public Users (No Login Required)
* **Instant Landing Experience**: Clean, mobile-first hero routing directly to public search.
* **Smart Keyword Search**: Real-time filtering against item descriptions and found locations.
* **Category Filter Chips**: Filter by *Electronics*, *ID Cards*, *Bags*, *Books*, and *Other*.
* **Status-Enforced**: Displays exclusively active (`status: "available"`) inventory.
* **60-Character Safe Previews**: Result cards truncate long descriptions to 60 characters with ellipses.
* **URL & LocalStorage Persistence**: Search keywords and selected categories persist across browser reloads.
* **Item Detail View**: Full non-truncated descriptions, photos, exact locations, timestamps, and campus pickup office instructions.
* **Availability Guards**: Items with `status: "collected"` or invalid IDs automatically render an *"Item not found or already collected"* status screen.

### 🛡️ Office Worker / Staff (Authenticated Session)
* **Secure Access Code**: Quick demo authentication using code `STAFF2026`, backed by `localStorage` session flags.
* **Route Protection**: Direct visits to `/staff/dashboard` are redirected to `/staff/login`.
* **Add Found Item Form**:
  * **Client-Side Image Compression**: Compresses photos client-side via HTML5 Canvas targeting **<200KB** (well under 1MB).
  * **Auto-Generated Metadata**: ISO `dateAdded` timestamp is generated automatically at submit time.
  * **Inline Validation**: Immediate error messaging under required empty fields.
  * **Long Text Handling**: Gracefully wraps 400+ character descriptions without layout distortion.
  * **Duplicate Submission Guard**: Button disables on click with spinner; debounced by a 1200ms timestamp ref.
  * **Mid-Flow Refresh Restoration**: Form draft auto-saves to `sessionStorage` in real time with an optional *"Clear Draft"* control.
  * **Distinct Success View**: Full confirmation screen with a *"Log Another Found Item"* action.
* **AI Auto-Tag Suggestion (Stretch Feature)**:
  * Asynchronously invokes Hugging Face Vision AI (`google/vit-base-patch16-224`) on photo upload.
  * Suggests category and pre-fills the dropdown without locking it.
  * Non-blocking: 4-second timeout; if offline or rate-limited, displays *"Tag suggestion unavailable (optional)"* without disrupting submission.
* **Active Inventory Management**:
  * Live running total count (e.g. *"5 items currently listed"*).
  * **Mark Collected**: Sends a `PATCH` request to set `status: "collected"`, removing it from active lists without page reloads.
  * **Accidental Deletion Guard**: Modal confirmation dialog (*"Are you sure you want to delete this item?"*) before any deletion occurs.

---

## 🛠️ Tech Stack

* **Frontend**: React 19, Vite 8, React Router v7
* **Styling & UI**: Tailwind CSS v3, DaisyUI v4, Lucide React Icons
* **Design System**: Custom collegiate campus theme (`#1e3a8a` deep navy, `#d97706` amber, `#059669` emerald), 8pt spacing tokens, custom vector watermark seal
* **Mock Backend**: `json-server` (port 3001, CORS enabled, RESTful JSON endpoints)
* **Client Storage**: `localStorage` (auth flag & search state), `sessionStorage` (form draft auto-save)
* **Image Processing**: Client-side HTML5 Canvas compressor (`src/utils/imageCompressor.js`)
* **AI / ML**: Hugging Face Inference API (`google/vit-base-patch16-224`)

---

## 🚀 How to Run Locally

### Prerequisites
* Node.js v18+ (tested on Node v24)
* npm v9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Mock API Backend
Runs `json-server` on port 3001 with CORS enabled:
```bash
npm run mock-api
```
*API will be live at `http://localhost:3001/items`.*

### 3. Start the Vite Frontend (in a separate terminal)
```bash
npm run dev
```
*Web app will be live at `http://localhost:5173`.*

### 4. Build for Production
```bash
npm run build
```

---

## 📊 Core Data Model Contract

All items across the database, API, and frontend strictly adhere to this exact schema:

```typescript
interface Item {
  id: string;                                                          // Unique item ID (e.g., "item-1")
  description: string;                                                 // Plain text description (Required)
  location: string;                                                    // Plain text location (Required)
  photoUrl?: string;                                                   // Optional compressed data URL or image link
  category?: "Electronics" | "ID Cards" | "Bags" | "Books" | "Other"; // Optional enum
  dateAdded: string;                                                   // ISO timestamp, auto-generated at submit
  status: "available" | "collected";                                  // Strict binary availability state
}
```

---

## 🌐 Deployment Guide (Vercel & Free Backend)

### Why Vercel?
We recommend **Vercel** for deploying this application because:
1. **Zero-Config Vite SPA Detection**: Vercel automatically detects the Vite framework and outputs optimized edge distributions.
2. **SPA Routing**: The included `vercel.json` file handles SPA routing rewrites (`/* -> /index.html`) so refreshing `/search` or `/item/:id` never returns a 404.
3. **Instant Global Edge CDN**: Ensures fast response times and high Lighthouse performance scores.

### Deploying Frontend to Vercel:
1. Push this repository to GitHub or GitLab.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import this repository. Vercel will auto-detect:
   * **Framework Preset**: Vite
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
4. In Environment Variables, set:
   * `VITE_API_URL`: Your deployed backend URL (see below).
5. Click **Deploy**.

### Deploying the Mock API Backend (Free Tier):
Since `json-server` requires a running Node process, deploy the mock backend using one of the following free options:

#### Option A: Render (Free Web Service)
1. Create a simple `server.js` or use Render's Node environment:
   * **Build Command**: `npm install`
   * **Start Command**: `npm run mock-api`
2. Set Environment Variable: `PORT=3001`.
3. Set your Vercel frontend `VITE_API_URL` to your Render service URL (e.g. `https://backpocket-api.onrender.com`).

#### Option B: Mockoon / My-JSON-Server (Static Mock)
* Point to a GitHub repo using `https://my-json-server.typicode.com/<username>/<repo>` for instant zero-server public REST mocking.

---

## 🤖 AI Tools Used (Hackathon Disclosure)

In compliance with the hackathon rules, the following AI tools and models were used during development:

1. **Google Antigravity**:
   * Autonomous agent environment used for project orchestration, code authoring, responsive layout verification, and stress-test hardening.
2. **Gemini 3.8 Flash (High)**:
   * Foundation model powering code generation, architecture planning, and debugging through Google Antigravity.
   

