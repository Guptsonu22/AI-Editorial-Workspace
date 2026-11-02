# UI/UX Design Brief
## AI Editorial Workspace ("This Week in AI" Edition)

**Document Version:** 1.0.0  
**Status:** Approved for Implementation  
**Role:** Senior Product Designer & Design Systems Lead  

---

## 1. Design Philosophy & Inspiration

The design language of the **AI Editorial Workspace** is inspired by high-density, high-focus modern SaaS products:
- **Linear:** Precision typography, subtle borders, high-contrast dark surfaces, and deliberate keyboard-first micro-interactions.
- **Notion:** Document-first clarity, unobtrusive controls, and clean typographic hierarchy for long-form reading.
- **Stripe Dashboard:** Clear state badges, tabular density without clutter, robust metrics visualization, and unambiguous system feedback.

### Anti-Patterns Explicitly Avoided
- ❌ No rainbow gradients or flashy decorative mesh backgrounds.
- ❌ No heavy glassmorphism or blurred backdrop noise that impedes legibility.
- ❌ No generic card-within-card UI nesting.
- ❌ No gimmicky 3D canvas animations or distracting loaders.

---

## 2. Color System & Semantic Palette

The workspace utilizes an editorial dark-first theme based on the Tailwind **Zinc** palette, paired with purposeful semantic accents for editorial status cues.

### 2.1. Neutrals & Canvas Surfaces
| Token | Hex / Value | Semantic Role |
|---|---|---|
| `canvas-bg` | `#09090b` (`zinc-950`) | Global application background |
| `surface-1` | `#121215` (`zinc-900/90`) | Sidebar, header, and primary panel surfaces |
| `surface-2` | `#18181b` (`zinc-900`) | Interactive cards, modal dialogs, and dropdowns |
| `surface-hover` | `#27272a` (`zinc-800`) | Hover state for buttons and list items |
| `border-subtle` | `#27272a` (`zinc-800`) | 1px border defining structural separation |
| `border-active` | `#3f3f46` (`zinc-700`) | Focused inputs, active tabs, and highlighted cards |

### 2.2. Text Hierarchy
| Token | Class | Semantic Role |
|---|---|---|
| `text-primary` | `text-zinc-100` | Headlines, active content, primary metrics |
| `text-secondary` | `text-zinc-400` | Supporting descriptions, metadata, inactive tabs |
| `text-muted` | `text-zinc-500` | Timestamps, placeholders, subtle advisory notes |

### 2.3. Editorial Status & Linguistic Highlights
| Category | Border / Highlight Color | Badge Fill | Meaning |
|---|---|---|---|
| **Very Hard Sentences** | `border-purple-500/50 bg-purple-500/10` | `text-purple-300 bg-purple-950/60` | Complex multi-clause sentence (>35 words) |
| **Hard Sentences** | `border-amber-500/50 bg-amber-500/10` | `text-amber-300 bg-amber-950/60` | Lengthy sentence (>25 words) |
| **Passive Voice** | `border-sky-500/50 bg-sky-500/10` | `text-sky-300 bg-sky-950/60` | Passive verb construction |
| **Jargon / Buzzwords** | `border-rose-500/50 bg-rose-500/10` | `text-rose-300 bg-rose-950/60` | Overused tech jargon or cliché |
| **Filler Phrases** | `border-emerald-500/50 bg-emerald-500/10` | `text-emerald-300 bg-emerald-950/60` | Redundant phrase that can be tightened |

---

## 3. Typography Architecture

- **Primary UI Sans:** `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`
  - Font features: `font-feature-settings: "cv02", "cv03", "cv04", "cv11"` (enables tall numerals and clean punctuation).
- **Long-Form Editorial Reading (Studio & Briefs):** `Newsreader`, `Charter`, `Georgia`, `serif`
  - Used for rendered newsletter articles and research briefs to simulate reading a high-end publication.
- **Editorial Monospace:** `JetBrains Mono`, `ui-monospace`, `monospace`
  - Used for code blocks, URL paths, sentence length counters, and readability statistics.

---

## 4. Layout Grid & Workspace Proportions

### 4.1. Shell Architecture
- **Sidebar:** Fixed 240px desktop width, collapsible on tablets, bottom sheet / drawer on mobile.
- **Top Header:** 56px fixed height with breadcrumbs and contextual actions.
- **Main Viewport:** Flexible container with `max-w-7xl` centering for dashboards and full-width split view for the Writing Assistant.

### 4.2. Dual-Pane Ratio for Writing Assistant
- **Desktop ( $\ge 1024$px ):**
  - Left Editing Canvas: 60% viewport width (`flex-1`).
  - Right Editorial Inspector: 40% viewport width (`w-[460px]`).
- **Mobile / Tablet ( $< 1024$px ):**
  - Segmented control tabs toggle between `[ Document Editor ]` and `[ Suggestions (X) ]`.

---

## 5. Micro-Interactions & State Patterns

1. **Button States:**
   - Default: Subtle border, solid dark background, crisp white typography.
   - Hover: 1px border brightness shift (`zinc-800` $\to$ `zinc-700`) with smooth 150ms transition.
   - Active: Scale down slightly (`active:scale-[0.98]`).
   - Loading: Button text transitions to animated inline spinner while retaining original button width to prevent layout jitter.
2. **Suggestion Acceptance Animation:**
   - When user clicks `[ Accept ]`, the suggestion card slides out gracefully (`opacity: 0, x: 20px`) and the corresponding text in the editor reflects the replacement with a temporary 1-second subtle green highlight (`bg-emerald-500/20`).
3. **Empty States:**
   - Every workspace contains an illustrated, actionable empty state with a 1-click sample dataset loader so evaluators and editors can experience the app immediately without searching for external URLs.
