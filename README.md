# AI Editorial Workspace
### Forward Deployed Engineer (FDE) Intern Take Home Assignment — *This Week in AI*

> An AI-powered editorial workbench engineered to transform raw, multi-source tech reporting into evidence-backed research briefs, Hemingway-style polished prose, and publication-ready 300–500 word newsletter editions.

---

## 1. Product Overview & Vision

Publishing a high-signal technology newsletter (such as *This Week in AI*, *The Batch*, or *Stratechery*) requires high-integrity fact synthesis and tight, jargon-free prose. Most generic AI wrappers fail because they hallucinate facts, invent citations, and destructively overwrite the author's draft with homogenized marketing copy.

The **AI Editorial Workspace** was built from first principles as an **opinionated editorial operating system** with three integrated pillars:
1. **Research Assistant:** Ingests $\ge 3$ heterogeneous article URLs, extracts clean article text with SSRF protection, and generates an evidence-backed Research Brief (Facts vs. Speculation grid, chronology, citations, builder takeaways, and 3 distinct editorial angles).
2. **Writing Assistant:** A Hemingway-inspired dual-pane editor that checks prose against 7 linguistic rules (long sentences, difficult sentences, passive voice, jargon, filler phrases, repetition, complexity), calculates real-time Flesch-Kincaid metrics, and provides atomic suggestion accept/reject controls without overwriting the author's original manuscript.
3. **Newsletter Studio:** Connects directly to saved research briefs and selected angles to synthesize tightly scoped 300–500 word publication units with traceable source hyperlinks, featuring a 1-click bridge into the Writing Assistant for line-level polish.

---

## 2. Architecture & Tech Stack

```
AI Editorial Workspace/
├── docs/                               # 6 Foundational Engineering & Product Documents
│   ├── PRD.md                          # Product Requirements Document
│   ├── TRD.md                          # Technical Requirements Document
│   ├── APP_FLOW.md                     # Screen-by-Screen User Journey & States
│   ├── UI_UX_DESIGN_BRIEF.md           # Linear/Notion/Stripe Design System Tokens
│   ├── BACKEND_SCHEMA.md               # Relational Entity Schema & Store Adapters
│   └── IMPLEMENTATION_PLAN.md          # Phased Build Sequence & Deliverables
├── src/
│   ├── app/                            # Next.js 14+ App Router
│   │   ├── api/                        # Server-side API Routes
│   │   │   ├── dashboard/              # Workspace metrics & activity feeds
│   │   │   ├── research/               # Extraction & brief synthesis (>=3 sources gate)
│   │   │   ├── writing/                # Linguistic linter & readability calculation
│   │   │   ├── studio/                 # 300-500w newsletter synthesis & updates
│   │   │   └── settings/               # Provider status & system config
│   │   ├── research/page.tsx           # Research Assistant Workspace
│   │   ├── writing/page.tsx            # Writing Assistant (Hemingway Dual-Pane)
│   │   ├── studio/page.tsx             # Newsletter Studio Workspace
│   │   ├── saved/page.tsx              # Saved Research Library
│   │   ├── settings/page.tsx           # Workspace Settings & JSON Backups
│   │   ├── layout.tsx                  # Global AppShell, Dark Mode, Fonts
│   │   └── page.tsx                    # Overview Dashboard
│   ├── components/                     # Reusable UI Primitives & Layout
│   │   ├── layout/                     # Sidebar, Header, AppShell
│   │   └── ui/                         # Radix-style Buttons, Badges, Cards, Dialogs, Tooltips
│   ├── lib/                            # Business Logic & Infrastructure
│   │   ├── ai/                         # Claude / OpenAI / Heuristic Engine Client
│   │   ├── analysis/                   # Flesch-Kincaid & Linguistic Linter
│   │   ├── extraction/                 # Cheerio Scraper & SSRF Defense Validator
│   │   └── db/                         # Thread-safe Local JSON Store & Seed Data
│   └── types/                          # Domain TypeScript Definitions
├── PRODUCT_AND_ENGINEERING_NOTE.md     # Architectural Decisions & Rationale
├── SAMPLE_EDITORIAL_OUTPUT.md          # 396-word Verified Sample Newsletter Edition
├── WRITING_SAMPLE_BEFORE_AFTER.md      # Itemized Before & After Linter Audit Log
├── package.json                        # Dependencies & Scripts
├── tsconfig.json                       # Strict TypeScript Config
└── tailwind.config.ts                  # Editorial Theme Tokens & Typography
```

### Core Technologies:
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript 5.x (Strict mode)
- **Styling:** Tailwind CSS with `@tailwindcss/typography`
- **UI Architecture:** Custom Zinc dark-first primitives (Linear/Notion inspired)
- **Icons:** Lucide React
- **Validation:** Zod 3.x
- **Web Extraction:** Cheerio with custom DOM sanitizer
- **AI Engine:** Anthropic Claude 3.5 Sonnet / OpenAI GPT-4o with zero-credential Heuristic Fallback
- **Persistence:** Dual-mode atomic file store in `.data/editorial-store.json` with Supabase PostgreSQL adapter capabilities

---

## 3. Environment Variables Configuration

Create a `.env.local` file in the root directory:

```bash
# Server-side AI Provider Keys (Optional: Heuristic fallback operates if omitted)
AI_MODEL_PROVIDER="anthropic" # "anthropic" | "openai" | "heuristic"
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..."

# Supabase Persistence (Optional: Local file storage operates if omitted)
NEXT_PUBLIC_SUPABASE_URL=""
SUPABASE_SERVICE_ROLE_KEY=""

# Application Host URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

> **Zero-Config Guarantee:** If no API keys or database URLs are provided, the system activates the internal **High-Signal Heuristic Engine** and file-backed JSON store in `.data/editorial-store.json`. The entire application runs immediately out-of-the-box without network paywalls or configuration blockers.

---

## 4. Local Development & Installation

### Prerequisites:
- **Node.js:** v18.17+ or v20.x
- **Package Manager:** npm or pnpm

### Installation Steps:
```bash
# 1. Clone or navigate to the workspace
cd "AI Editorial Workspace"

# 2. Install dependencies
npm install

# 3. Start the Next.js development server
npm run dev

# 4. Open in browser
# Navigate to http://localhost:3000
```

---

## 5. What Was Personally Implemented & Tested

### 1. Ingestion & SSRF Protection (`src/lib/extraction/`)
- Implemented `validateSafeUrl`: blocks loopback (`127.0.0.1`, `localhost`), link-local (`169.254.169.254`), private subnets (`10.0.0.0/8`, `192.168.0.0/16`), and non-standard ports.
- Implemented `extractArticleContent`: uses Cheerio to strip boilerplate, scripts, ads, and navigation, extracting clean plaintext and word counts with an 8-second timeout.
- Handled edge cases: 403 bot blocks and paywalls trigger an accessible modal dialog allowing editors to paste content manually without breaking the workflow.

### 2. Evidence Synthesis Engine (`src/lib/ai/`)
- Enforced the **3-Source Quorum Gate**: the UI visually tracks source readiness (amber $\to$ emerald) and blocks generation if $<3$ verified sources exist.
- Implemented structured synthesis parsing: segregates **Verified Facts** (with quotes and 1-based source citations) from **Speculation** (unsubstantiated vendor claims).
- Implemented 3 distinct **Editorial Angles** tailored for *Builders & Engineers*, *Founders & Executives*, and *Tech Policy & Investors*.

### 3. Hemingway-Inspired Writing Assistant (`src/app/writing/` & `src/lib/analysis/`)
- Coded exact mathematical formulas for **Flesch Reading Ease** and **Flesch-Kincaid Grade Level** with syllable counting and abbreviation-aware sentence segmentation.
- Built 7 heuristic rule checkers:
  1. Long sentences ($\ge 25$ words)
  2. Difficult sentences ($\ge 35$ words)
  3. Passive voice (`auxiliary + past participle`)
  4. Unnecessary jargon ("paradigm shift", "synergy", "game-changer", "leverage")
  5. Filler phrases ("due to the fact that", "in order to", "at the end of the day", "it is important to note that")
  6. Repetitive non-stop words across sliding sentence windows
  7. Wordy complexity
- Implemented **Atomic Suggestion Acceptance**: clicking `[ Accept ]` directly replaces the target segment in the live editor, recomputes metrics, and marks the card as resolved without modifying the surrounding prose.
- Implemented **Side-by-Side Diff View** comparing the unedited draft with the current polished edition.

### 4. Newsletter Studio (`src/app/studio/`)
- Connected research briefs and angle selectors to generate 300–500 word publication drafts.
- Added live word count validator indicating whether text is within the optimal 300–500 word range.
- Added 1-click **"Send to Writing Assistant"** bridge that transfers the generated draft into the copy editor for line-level polish.

### 5. Persistence Layer (`src/lib/db/`)
- Implemented thread-safe atomic file persistence in `.data/editorial-store.json`.
- Pre-populated the store with authentic research projects (DeepSeek-R1, Claude 3.5 Sonnet Computer Use) on initial launch.
- Built `/api/dashboard` computing real database entity statistics (no arbitrary static numbers).

---

## 6. Verification & Testing Instructions

To verify all core workflows end-to-end:

### Test Case 1: Overview Dashboard
1. Open `http://localhost:3000`.
2. Confirm the 4 metric cards reflect real database records (Projects, Sources, Drafts, Articles).
3. Verify the "Editorial Workflow Shortcuts" navigate directly to `/research`, `/studio`, and `/writing`.

### Test Case 2: Research Assistant & 3-Source Gate
1. Navigate to `/research`.
2. Observe the source counter. Attempt to click "Generate Research Brief" with fewer than 3 sources — verify it is disabled.
3. Add a source URL or use the pre-populated 3 sources.
4. Click "Edit / Paste Content Manually" on any source to test the manual fallback modal.
5. Click **"Generate Research Brief"**. Observe the multi-step progress animation.
6. Verify the rendered brief contains:
   - "What Happened?" and "Why Does It Matter?"
   - Audience breakdown (Engineers, Founders, Enterprises)
   - "Verified Facts" with `[Source X]` citations
   - "Speculation vs. Verified Reality"
   - At least 3 distinct editorial angles with a "Write This Edition" button.

### Test Case 3: Writing Assistant (Hemingway Linter)
1. Navigate to `/writing`.
2. Inspect the live metrics bar (Word Count, Reading Time, Avg Sentence Length, Flesch-Kincaid Grade Level).
3. Review the identified suggestion cards on the right pane (e.g. passive voice, filler phrases, long sentences).
4. Click **[ Accept ]** on a suggestion card: verify the sentence updates immediately in the left text editor and metrics recalculate.
5. Click **[ Side-by-Side Diff ]**: verify the original draft and revised draft are rendered side-by-side for comparison.

### Test Case 4: Newsletter Studio & End-to-End Hand-off
1. Navigate to `/studio`.
2. Select a project and one of its synthesized angles.
3. Click **"Generate Newsletter Draft"**.
4. Confirm the generated article contains a compelling headline, 300–500 words, and traceable source links.
5. Click **"Send to Writing Assistant"**: verify the draft is seamlessly transferred into `/writing` with its title and content intact.

---

## 7. Deployment Instructions

### Deploy to Vercel:
1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Set environment variables in the Vercel dashboard:
   - `ANTHROPIC_API_KEY` (Optional)
   - `OPENAI_API_KEY` (Optional)
   - `NEXT_PUBLIC_APP_URL` (Set to production domain)
4. Click **Deploy**. Next.js App Router and API Routes deploy automatically as edge/serverless functions.

---

## 8. 6 Documents Reference

The 6 foundational engineering and product design documents created prior to code generation are permanently cataloged in `docs/`:
- [`docs/PRD.md`](docs/PRD.md)
- [`docs/TRD.md`](docs/TRD.md)
- [`docs/APP_FLOW.md`](docs/APP_FLOW.md)
- [`docs/UI_UX_DESIGN_BRIEF.md`](docs/UI_UX_DESIGN_BRIEF.md)
- [`docs/BACKEND_SCHEMA.md`](docs/BACKEND_SCHEMA.md)
- [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md)
