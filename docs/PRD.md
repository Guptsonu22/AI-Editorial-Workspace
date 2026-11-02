# Product Requirements Document (PRD)
## AI Editorial Workspace ("This Week in AI" Edition)

**Document Version:** 1.0.0  
**Status:** Approved for Implementation  
**Role:** Senior Product Manager & AI Architect  
**Author:** Engineering Team  

---

## 1. App Overview & Vision

The **AI Editorial Workspace** is a specialized editorial workbench engineered for modern technology newsletter editors, journalists, and research analysts. It bridges the gap between chaotic multi-source research inputs and polished, publication-ready newsletter editions.

Rather than acting as a generic text-generation prompt wrapper, this application is a **governed editorial operating system** where:
- Every factual claim is bound to a verified source citation.
- AI never invents statistics, quotes, or assertions.
- Sentence-level editorial craftsmanship (clarity, voice, conciseness) is evaluated with deterministic heuristics and granular suggestion reviews.
- Multi-angle story synthesis produces 300–500 word publication units targeting high-signal editorial distributions.

---

## 2. Target Users

1. **Newsletter Editors & Curators:** Editors running tech/AI publications (e.g., *This Week in AI*, *The Batch*, *ByteDance Dispatch*) who digest 20+ links daily and need to curate actionable newsletters.
2. **Technical Columnists & Analysts:** Builders and product managers writing thought-leadership digests who require strict fact-checking and distinction between substantiated developments and corporate PR hype.
3. **Editorial Operations Teams:** Small teams needing a centralized hub to preserve source links, research notes, angles, and revision histories across publishing sprints.

---

## 3. Problem Statement

Modern newsletter workflows suffer from three critical bottlenecks:

1. **The Hallucination & Citation Problem:** Generic LLMs invent citations, blend opinions with facts, and hallucinate timelines. In an editorial context, a single fabricated metric destroys publication trust.
2. **The Extraction & Synthesis Friction:** Converting 3 to 10 heterogeneous URLs (blogs, arXiv papers, paywalled articles, product releases) into a coherent, multi-perspective briefing requires tedious copy-pasting, cleaning, and summarization.
3. **The "Passive AI Rewrite" Trap:** Typical AI tools replace entire drafts with homogenized, generic marketing copy, stripping technical nuance and removing editorial control. Editors need an interactive critique environment (like a digital copy editor) where every suggestion can be inspected, accepted, or rejected.

---

## 4. Main Features & Requirements

### 4.1. Research Assistant
- **Multi-Source Ingestion:** Accepts single or multiple article URLs, title overrides, and raw text fallback.
- **Strict Source Quorum:** Enforces a minimum of **three (3) valid sources** before synthesizing a comprehensive Research Brief to ensure multi-perspective triangulated evidence.
- **Robust Extraction Pipeline:** Extracts clean readable text, removes navigation/footer boilerplate, detects paywalls, and surfaces extraction statuses with graceful manual fallback.
- **Structured Evidence Brief Synthesis:**
  - *What Happened?* (Core factual event)
  - *Why Does It Matter?* (Macro impact)
  - *Who Should Care?* (Segmented audience analysis: engineers, founders, enterprise executives)
  - *Key Developments & Chronology*
  - *Verified Facts vs. Speculation Grid* (Crucial editorial triage)
  - *Founder & Builder Opportunities* (Actionable takeaways)
  - *Editorial Angles* (Minimum 3 distinct angles for newsletter formatting)
- **Traceable Citation Mapping:** Every claim contains bracketed anchor links `[Source 1: Title]` back to original verified URLs.

### 4.2. Writing Assistant (Hemingway-Inspired Linter)
- **Interactive Dual-Pane Workspace:** Left pane interactive text editor, right pane live editorial critique feed.
- **Rule-Based Linguistic Checks:**
  1. *Long Sentences* (>25 words)
  2. *Very Difficult / Convoluted Sentences* (>35 words or dense sub-clauses)
  3. *Passive Voice* constructions
  4. *Unnecessary Jargon & Buzzwords*
  5. *Filler Phrases* ("in order to", "at the end of the day", "it is important to note")
  6. *Repetitive Vocabulary*
  7. *Syntactic Complexity / Redundancy*
- **Actionable Suggestion Cards:**
  - Issue tag & severity
  - Original sentence in situ
  - Editorial rationale ("Why this matters")
  - Targeted rewrite proposal
  - Atomic **Accept** (replaces inline with preserved caret state) & **Reject** buttons
- **Editorial Metrics Engine:**
  - Real-time word count, character count, sentence count
  - Average sentence length
  - Reading time (based on 220 WPM standard)
  - Readability grade (Flesch-Kincaid Grade Level & Reading Ease) with explanatory advisory noting it as editorial guidance rather than absolute truth.

### 4.3. Newsletter Studio
- **Research Bridge:** Pulls structured briefs directly from Saved Research projects.
- **Angle Selection:** Allows editor to select an angle (e.g. *Infrastructure Focus*, *Venture Landscape*, *Open Source Implications*).
- **Draft Generator:** Produces tight, 300–500 word editorial articles following the newsletter structure:
  - Catchy, non-clickbait headline
  - Narrative lede
  - What happened
  - Context & data
  - Why it matters
  - Builder implications
  - Closing takeaway
  - Explicit linked sources
- **Roundtrip Writing Assistant Integration:** 1-click "Send to Writing Assistant" to run linguistic quality analysis and apply incremental improvements before final export.

### 4.4. Unified Dashboard & Persistence
- **Metric Tiles:** Real-time counts of actual Research Projects, Sources Analyzed, Writing Drafts Polished, and Newsletter Articles Published.
- **Recent Research Feed:** Quick resumption of ongoing projects.
- **Recent Drafts Feed:** Quick navigation to drafts under active refinement.
- **Local + Cloud Persistence:** Local filesystem-backed zero-config storage engine with seamless Supabase PostgreSQL adapter capabilities.

---

## 5. User Stories

| ID | As a... | I want to... | So that... |
|---|---|---|---|
| US-01 | Tech Editor | Input 3 URLs about an AI release | I get a cross-checked research brief with clear citations and no hallucinations. |
| US-02 | Editor | Manually paste text when a site blocks scraping | My research workflow is not interrupted by paywalls or bot guards. |
| US-03 | Writer | See identified jargon and passive voice highlighted | I can choose whether to simplify or retain technical terms. |
| US-04 | Editor | Accept a suggestion with one click | The draft updates instantly without me retyping the sentence. |
| US-05 | Publisher | Pick an editorial angle from my research | I can generate a 350-word newsletter draft tailored to engineers or executives. |
| US-06 | Reviewer | Compare original draft with revised draft | I can verify that AI did not alter my editorial intent or technical accuracy. |

---

## 6. Success Metrics

1. **Citation Density:** 100% of factual assertions in generated briefs are mapped to indexed source numbers.
2. **Verification Integrity:** 0% invented source URLs or fabricated quotes.
3. **Workflow Acceleration:** Reduce time to produce a 400-word verified newsletter issue from 90 minutes to under 15 minutes.
4. **Editorial Retention:** Writers retain granular control with an average suggestion acceptance rate tracked without destructive full-text overwriting.

---

## 7. MVP Scope & Version 1 Guardrails

### In Scope for v1:
- Full interactive Next.js 14+ App Router application with responsive layout.
- Real URL fetching & content extraction with Cheerio and HTML sanitation.
- In-memory/file-based local database fallback ensuring immediate out-of-the-box functionality without mandatory third-party credentials.
- AI integration supporting Anthropic Claude / OpenAI with offline/mock test fallback.
- Client-side and server-side deterministic readability analysis (Flesch-Kincaid).
- Complete Hemingway-style interactive suggestions card system.
- Newsletter Studio with angle selection and target word-count governance (300–500 words).
- End-to-end data flow: Research -> Brief -> Angle -> Newsletter Draft -> Writing Assistant.

### Out of Scope for v1:
- Multi-user team permissions and SSO.
- Automated email ESP dispatch (Substack, Mailchimp, Beehiiv direct publish).
- Automated scheduled web crawling / RSS feeds (v2).
