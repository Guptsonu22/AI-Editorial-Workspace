// ==============================================================================
// Seed Data: AI Editorial Workspace
// Pre-populates the workspace with authentic, high-signal editorial records
// ==============================================================================

import {
  ResearchProject,
  NewsletterArticle,
  WritingDraft,
  EditorialMetrics,
} from "@/types/editorial";

const sampleMetrics: EditorialMetrics = {
  wordCount: 412,
  charCount: 2680,
  sentenceCount: 22,
  avgSentenceLength: 18.7,
  readingTimeMinutes: 1.9,
  fleschReadingEase: 62.4,
  fleschKincaidGrade: 9.1,
  readabilityLabel: "Plain English (9th Grade)",
  hardSentenceCount: 2,
  veryHardSentenceCount: 1,
  passiveVoiceCount: 2,
  jargonCount: 3,
  fillerCount: 1,
};

export const SEED_PROJECTS: ResearchProject[] = [
  {
    id: "proj-deepseek-r1",
    title: "DeepSeek R1 Architecture & Open Weights Cost Revolution",
    description:
      "Deep dive into DeepSeek's open-weights reasoning model, cold-start reinforcement learning, and the economic ripple effects on frontier AI pricing.",
    status: "completed",
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    sources: [
      {
        id: "src-ds-1",
        projectId: "proj-deepseek-r1",
        url: "https://github.com/deepseek-ai/DeepSeek-R1",
        title: "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning",
        author: "DeepSeek-AI Research Collective",
        publishedAt: "2025-01-20T00:00:00Z",
        cleanedContent:
          "DeepSeek-R1-Zero and DeepSeek-R1 represent our frontier reasoning models trained via large-scale reinforcement learning without supervised fine-tuning (SFT) as a preliminary step. R1 utilizes a Mixture-of-Experts (MoE) architecture with 671 billion total parameters, activating 37 billion parameters per token. The post-training process introduces multi-stage cold-start data and iterative rule-based RL, matching OpenAI-o1-1217 performance across AIME 2024 (79.8% Pass@1) and MATH-500 (97.3%). Distilled models at 1.5B, 7B, 14B, and 32B based on Qwen and Llama architectures demonstrate reasoning transfer without massive parameter footprints.",
        wordCount: 88,
        extractionStatus: "success",
        createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      },
      {
        id: "src-ds-2",
        projectId: "proj-deepseek-r1",
        url: "https://semianalysis.com/deepseek-r1-compute-economics",
        title: "The Compute Economics of DeepSeek-R1: MoE, Multi-Head Latent Attention, and Cluster Budgets",
        author: "Dylan Patel & Gerald Wong",
        publishedAt: "2025-01-22T00:00:00Z",
        cleanedContent:
          "The training of DeepSeek-V3 base architecture required approximately 2.788 million H800 GPU hours at an estimated operational compute cost of $5.94 million. R1 was built on top of this foundation utilizing Multi-Head Latent Attention (MLA) and DeepSeekMoE architecture. The architectural breakthrough stems from dual-pipe parallel computation and native FP8 mixed precision, which compresses memory bandwidth requirements by over 45% compared to conventional transformer baselines. Consequently, API token pricing was listed at $0.14 per million input tokens and $0.55 per million output tokens, representing an approximate 95% discount relative to competing frontier reasoning APIs.",
        wordCount: 96,
        extractionStatus: "success",
        createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      },
      {
        id: "src-ds-3",
        projectId: "proj-deepseek-r1",
        url: "https://technologyreview.com/2025/01/24/deepseek-impact-open-source-ai",
        title: "Why the AI Industry is Reeling from DeepSeek's Open Reasoning Weights",
        author: "Will Douglas Heaven",
        publishedAt: "2025-01-24T00:00:00Z",
        cleanedContent:
          "The immediate availability of DeepSeek-R1 weights under an MIT license has disrupted enterprise AI roadmaps. For the first time, organizations with stringent data privacy mandates can deploy an o1-class reasoning model on on-premises sovereign infrastructure or private cloud VPCs. However, cybersecurity analysts caution that un-gated reasoning weights reduce barriers for malicious code synthesis and exploit discovery. Venture capital sentiments suggest a bifurcation: infrastructure providers facing margin compression, while application-layer startups gain unprecedented cost leverage.",
        wordCount: 79,
        extractionStatus: "success",
        createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      },
    ],
    brief: {
      id: "brief-deepseek-r1",
      projectId: "proj-deepseek-r1",
      whatHappened:
        "DeepSeek released DeepSeek-R1, an open-weights reasoning model matching proprietary frontier benchmarks (79.8% on AIME 2024) utilizing pure reinforcement learning, a 671B Mixture-of-Experts architecture (37B active), and an estimated $5.94M training compute foundation.",
      whyItMatters:
        "It shatters the prevailing assumption that frontier reasoning models require tens of billions in proprietary capital expenditures, collapsing commercial inference pricing by 90%+ and enabling sovereign on-prem reasoning deployments.",
      whoShouldCare: {
        engineers:
          "AI Engineers can now run distilled 7B and 14B reasoning models locally or fine-tune the 671B MoE checkpoint using FP8 quantization on commodity clusters.",
        founders:
          "SaaS founders can integrate chain-of-thought verification without incurring $15–$60 per million output token expenses from closed API vendors.",
        enterprises:
          "Regulated defense, healthcare, and financial institutions gain access to o1-tier reasoning behind air-gapped internal firewalls.",
      },
      keyDevelopments: [
        {
          event: "DeepSeek open-sourced R1 and R1-Zero weights under the permissive MIT license [Source 1].",
          sourceIndex: 1,
        },
        {
          event: "Architecture employs Multi-Head Latent Attention (MLA) and native FP8 execution, slashing VRAM bandwidth bottlenecks by 45% [Source 2].",
          sourceIndex: 2,
        },
        {
          event: "Commercial API was priced at $0.14 per million input tokens, creating an immediate 95% price deficit for closed frontier vendors [Source 2].",
          sourceIndex: 2,
        },
        {
          event: "Distilled reasoning checkpoints (1.5B to 32B) were released for edge and local GPU deployment [Source 1, Source 3].",
          sourceIndex: 1,
        },
      ],
      verifiedFacts: [
        {
          fact: "DeepSeek-V3 base training consumed ~2.788M H800 GPU hours for an estimated $5.94M compute cost.",
          sourceIndex: 2,
          quote: "The training of DeepSeek-V3 base architecture required approximately 2.788 million H800 GPU hours at an estimated operational compute cost of $5.94 million.",
        },
        {
          fact: "The R1 architecture activates 37B parameters out of 671B total parameters per inference token.",
          sourceIndex: 1,
          quote: "R1 utilizes a Mixture-of-Experts (MoE) architecture with 671 billion total parameters, activating 37 billion parameters per token.",
        },
        {
          fact: "DeepSeek-R1 achieved 79.8% Pass@1 on AIME 2024 and 97.3% on MATH-500.",
          sourceIndex: 1,
        },
      ],
      speculation: [
        {
          claim: "DeepSeek's low cost implies western hyperscalers wasted hundreds of billions on unneeded GPUs.",
          sourceIndex: 3,
          editorialNote:
            "Speculative: Foundation model pretraining at scale still requires massive capacity; DeepSeek optimized post-training efficiency on top of substantial prior open research.",
        },
        {
          claim: "Unrestricted reasoning weights will cause immediate automated zero-day cyber attacks.",
          sourceIndex: 3,
          editorialNote:
            "Unsubstantiated risk claim: Frontier models assist in code auditing, but automated zero-day weaponization remains speculative.",
        },
      ],
      builderOpportunities: [
        "Self-hosted code review and PR agents running distilled 14B R1 locally on developer MacBooks.",
        "Private document extraction pipelines in HIPAA/GDPR environments using air-gapped vLLM inference.",
        "Hybrid routing architectures: delegating fast queries to 7B R1 and routing multi-step mathematics to the full 671B MoE.",
      ],
      editorialAngles: [
        {
          id: "angle-1",
          title: "The $6 Million Miracle: How MoE and Native FP8 Upended the GPU Cartel",
          premise:
            "A technical breakdown of how algorithmic innovations (MLA, dual-pipe parallelism) outmaneuvered raw brute-force compute budgets.",
          targetAudience: "Engineers & Builders",
        },
        {
          id: "angle-2",
          title: "The Air-Gapped Reasoning Era: Why Enterprises Are Ditching Proprietary APIs",
          premise:
            "Why healthcare, legal, and financial enterprises are shifting reasoning workloads into private cloud VPCs.",
          targetAudience: "Founders & Executives",
        },
        {
          id: "angle-3",
          title: "Distillation Wins: Running O1-Class Logic on a $1,200 Consumer Laptop",
          premise:
            "Hands-on analysis of the distilled 1.5B, 7B, and 14B Qwen-based models running on Ollama and llama.cpp.",
          targetAudience: "Engineers & Builders",
        },
      ],
      citations: [
        {
          sourceIndex: 1,
          sourceId: "src-ds-1",
          title: "DeepSeek-R1 Technical Paper & Weights Repository",
          url: "https://github.com/deepseek-ai/DeepSeek-R1",
        },
        {
          sourceIndex: 2,
          sourceId: "src-ds-2",
          title: "SemiAnalysis: Compute Economics of DeepSeek-R1",
          url: "https://semianalysis.com/deepseek-r1-compute-economics",
        },
        {
          sourceIndex: 3,
          sourceId: "src-ds-3",
          title: "MIT Technology Review: Open Source Reasoning Impact",
          url: "https://technologyreview.com/2025/01/24/deepseek-impact-open-source-ai",
        },
      ],
      createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    },
  },
  {
    id: "proj-claude-computer-use",
    title: "Claude 3.5 Sonnet Computer Use & Agentic UI Automation",
    description:
      "Analysis of Anthropic's Computer Use API, virtual desktop interaction mechanisms, and the shift from text chatbots to operating system action agents.",
    status: "completed",
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    sources: [
      {
        id: "src-cc-1",
        projectId: "proj-claude-computer-use",
        url: "https://www.anthropic.com/news/3-5-models-and-computer-use",
        title: "Introducing Computer Use, a New Claude 3.5 Sonnet, and Claude 3.5 Haiku",
        author: "Anthropic Research",
        publishedAt: "2024-10-22T00:00:00Z",
        cleanedContent:
          "Anthropic announced an upgraded Claude 3.5 Sonnet alongside a groundbreaking public beta capability: Computer Use. Developers can direct Claude to interact with computer interfaces as humans do—by viewing a virtual screen, moving the cursor, clicking buttons, and typing keystrokes via accessibility API hooks and framebuffer screenshots. Across OSWorld benchmarks measuring realistic multi-step desktop tasks, Claude 3.5 Sonnet scored 14.9% in screenshot-only categories, roughly doubling the prior state-of-the-art model performance of 7.8%. Human baseline performance on OSWorld remains 70–75%.",
        wordCount: 78,
        extractionStatus: "success",
        createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
      },
      {
        id: "src-cc-2",
        projectId: "proj-claude-computer-use",
        url: "https://venturebeat.com/ai/anthropic-computer-use-enterprise-rpa-revolution",
        title: "How Anthropic's Computer Use is Upending Legacy Robotic Process Automation",
        author: "Michael Nuñez",
        publishedAt: "2024-10-23T00:00:00Z",
        cleanedContent:
          "Enterprise software leaders including Asana, Canva, Cognition, and Replit have begun testing Anthropic's Computer Use API. Legacy Robotic Process Automation (RPA) tools like UiPath rely on rigid DOM selectors or fragile coordinate scripts that break upon minor CSS shifts. Claude's visual perception loop observes the desktop dynamically, self-correcting when dialogs open unexpectedly. However, enterprise CISOs raise critical prompt injection risks, noting that malicious web text could trick the model into executing unintended desktop commands.",
        wordCount: 81,
        extractionStatus: "success",
        createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
      },
      {
        id: "src-cc-3",
        projectId: "proj-claude-computer-use",
        url: "https://news.ycombinator.com/item?id=41914800",
        title: "Show HN: Building Autonomous QA Testers with Claude Computer Use",
        author: "Community Builders",
        publishedAt: "2024-10-25T00:00:00Z",
        cleanedContent:
          "Engineers experimenting with the Docker reference environment note high latency (3–5 seconds per action turn) and occasional mouse coordinate hallucination on complex canvas elements. Despite these early limitations, end-to-end regression testing of responsive web apps and spreadsheet data entry shows massive reliability gains over headless Playwright scripts when UI elements lack explicit test IDs.",
        wordCount: 61,
        extractionStatus: "success",
        createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
      },
    ],
  },
];

export const SEED_ARTICLES: NewsletterArticle[] = [
  {
    id: "art-deepseek-moe",
    projectId: "proj-deepseek-r1",
    projectTitle: "DeepSeek R1 Architecture & Open Weights Cost Revolution",
    angleId: "angle-1",
    angleTitle: "The $6 Million Miracle: How MoE and Native FP8 Upended the GPU Cartel",
    headline: "The $6 Million Shakedown: Why DeepSeek-R1 Upends Frontier AI Economics",
    content: `When DeepSeek open-sourced its flagship reasoning model this month, Silicon Valley experienced an immediate reckoning. For over eighteen months, the dominant narrative held that frontier-grade reasoning demanded hundreds of millions in bespoke capital expenditures. DeepSeek-R1 dismantled that orthodoxy with a reported $5.94 million base training budget and an MIT-licensed release that matches OpenAI’s o1 across gold-standard mathematical benchmarks.

The breakthrough is structural rather than purely computational. Built on a Mixture-of-Experts (MoE) architecture comprising 671 billion parameters, R1 activates only 37 billion parameters for any given token. By coupling Multi-Head Latent Attention (MLA) with dual-pipe parallel computation and native FP8 mixed precision, DeepSeek compressed memory bandwidth bottlenecks by over 45%. The operational dividends are staggering: commercial API access launched at just $0.14 per million input tokens—a 95% discount compared to prevailing proprietary alternatives.

For builders and technology leaders, the implications are profound. Until now, deploying multi-step chain-of-thought verification required accepting prohibitive token costs and routing proprietary customer data through third-party cloud endpoints. With distilled 7B and 14B checkpoints running on consumer silicon and the full 671B model deployable in air-gapped private clouds, the strategic moat has shifted decisively from raw model weights to proprietary data and domain integration.

The lesson for editorial curators and engineering leaders is unmistakable: brute-force compute scaling is no longer the sole path to intelligence. Algorithmic efficiency, cold-start reinforcement learning, and open weights have democratized frontier reasoning, permanently resetting the unit economics of AI-native software.

### Primary Sources
1. [DeepSeek-R1 Technical Paper & Weights](https://github.com/deepseek-ai/DeepSeek-R1)
2. [SemiAnalysis: Compute Economics of DeepSeek-R1](https://semianalysis.com/deepseek-r1-compute-economics)
3. [MIT Technology Review: Open Source Reasoning Impact](https://technologyreview.com/2025/01/24/deepseek-impact-open-source-ai)`,
    wordCount: 396,
    targetWordCount: 400,
    status: "ready",
    sourceLinks: [
      {
        title: "DeepSeek-R1 Technical Paper & Weights",
        url: "https://github.com/deepseek-ai/DeepSeek-R1",
        sourceIndex: 1,
      },
      {
        title: "SemiAnalysis: Compute Economics of DeepSeek-R1",
        url: "https://semianalysis.com/deepseek-r1-compute-economics",
        sourceIndex: 2,
      },
      {
        title: "MIT Technology Review: Open Source Reasoning Impact",
        url: "https://technologyreview.com/2025/01/24/deepseek-impact-open-source-ai",
        sourceIndex: 3,
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

export const SEED_DRAFTS: WritingDraft[] = [
  {
    id: "draft-sample-1",
    articleId: "art-deepseek-moe",
    title: "DeepSeek-R1 Newsletter Editorial (Draft Edition)",
    content: `When DeepSeek open-sourced its flagship reasoning model this month, Silicon Valley experienced an immediate reckoning. For over eighteen months, the dominant narrative held that frontier-grade reasoning demanded hundreds of millions in bespoke capital expenditures. DeepSeek-R1 dismantled that orthodoxy with a reported $5.94 million base training budget and an MIT-licensed release that matches OpenAI’s o1 across gold-standard mathematical benchmarks.

The breakthrough is structural rather than purely computational. Built on a Mixture-of-Experts architecture comprising 671 billion parameters, R1 activates only 37 billion parameters for any given token. By coupling Multi-Head Latent Attention with dual-pipe parallel computation and native FP8 mixed precision, DeepSeek compressed memory bandwidth bottlenecks by over 45%. The operational dividends are staggering: commercial API access launched at just $0.14 per million input tokens—a 95% discount compared to prevailing proprietary alternatives.

For builders and technology leaders, the implications are profound. Until now, deploying multi-step chain-of-thought verification required accepting prohibitive token costs and routing proprietary customer data through third-party cloud endpoints. With distilled 7B and 14B checkpoints running on consumer silicon and the full 671B model deployable in air-gapped private clouds, the strategic moat has shifted decisively from raw model weights to proprietary data and domain integration.

The lesson for editorial curators and engineering leaders is unmistakable: brute-force compute scaling is no longer the sole path to intelligence. Algorithmic efficiency, cold-start reinforcement learning, and open weights have democratized frontier reasoning, permanently resetting the unit economics of AI-native software.`,
    originalContent: `When DeepSeek open-sourced its flagship reasoning model this month, Silicon Valley experienced an immediate reckoning, due to the fact that for over eighteen months, the dominant narrative held that frontier-grade reasoning demanded hundreds of millions of dollars in bespoke capital expenditures. DeepSeek-R1 dismantled that orthodoxy with a reported $5.94 million base training budget and an MIT-licensed release that matches OpenAI’s o1 across gold-standard mathematical benchmarks.

The breakthrough is structural rather than purely computational in nature. Built on a Mixture-of-Experts architecture comprising 671 billion parameters, R1 activates only 37 billion parameters for any given token, which is very advantageous. By coupling Multi-Head Latent Attention with dual-pipe parallel computation and native FP8 mixed precision, memory bandwidth bottlenecks were compressed by over 45% by the engineering team. The operational dividends are staggering: commercial API access was launched at just $0.14 per million input tokens—a paradigm shift representing a 95% discount compared to prevailing proprietary alternatives.

For builders and technology leaders, the implications are profound. At the end of the day, until now, deploying multi-step chain-of-thought verification required accepting prohibitive token costs and routing proprietary customer data through third-party cloud endpoints. With distilled 7B and 14B checkpoints running on consumer silicon and the full 671B model deployable in air-gapped private clouds, the strategic moat has shifted decisively from raw model weights to proprietary data and domain integration.

The lesson for editorial curators and engineering leaders is unmistakable: brute-force compute scaling is no longer the sole path to intelligence. Algorithmic efficiency, cold-start reinforcement learning, and open weights have democratized frontier reasoning, permanently resetting the unit economics of AI-native software.`,
    metrics: sampleMetrics,
    status: "analyzed",
    suggestions: [
      {
        id: "sugg-1",
        draftId: "draft-sample-1",
        type: "long_sentence",
        originalText:
          "When DeepSeek open-sourced its flagship reasoning model this month, Silicon Valley experienced an immediate reckoning, due to the fact that for over eighteen months, the dominant narrative held that frontier-grade reasoning demanded hundreds of millions of dollars in bespoke capital expenditures.",
        suggestedText:
          "When DeepSeek open-sourced its flagship reasoning model this month, Silicon Valley experienced an immediate reckoning. For eighteen months, conventional wisdom held that frontier reasoning demanded hundreds of millions in capital expenditures.",
        explanation:
          "This sentence is 42 words long with multiple dependent clauses, causing cognitive strain for newsletter readers.",
        whyItMatters:
          "Newsletter skimmers retain key takeaways faster when opening paragraphs are split into crisp, declarative assertions.",
        startIndex: 0,
        endIndex: 285,
        status: "accepted",
        createdAt: new Date().toISOString(),
      },
      {
        id: "sugg-2",
        draftId: "draft-sample-1",
        type: "filler_phrase",
        originalText: "due to the fact that",
        suggestedText: "because",
        explanation:
          "'Due to the fact that' is a classic wordy filler construction.",
        whyItMatters: "Direct causal phrasing preserves momentum.",
        startIndex: 110,
        endIndex: 130,
        status: "accepted",
        createdAt: new Date().toISOString(),
      },
      {
        id: "sugg-3",
        draftId: "draft-sample-1",
        type: "passive_voice",
        originalText:
          "memory bandwidth bottlenecks were compressed by over 45% by the engineering team.",
        suggestedText:
          "DeepSeek compressed memory bandwidth bottlenecks by over 45%.",
        explanation:
          "Passive voice obscures the active subject and weakens narrative authority.",
        whyItMatters:
          "Active verbs attribute agency directly and reduce overall word count.",
        startIndex: 580,
        endIndex: 662,
        status: "accepted",
        createdAt: new Date().toISOString(),
      },
      {
        id: "sugg-4",
        draftId: "draft-sample-1",
        type: "jargon",
        originalText: "a paradigm shift",
        suggestedText: "an architectural shift",
        explanation:
          "'Paradigm shift' is an overused cliché in tech editorial copy.",
        whyItMatters:
          "Readers respond better to precise descriptions than generic buzzwords.",
        startIndex: 760,
        endIndex: 776,
        status: "accepted",
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];
