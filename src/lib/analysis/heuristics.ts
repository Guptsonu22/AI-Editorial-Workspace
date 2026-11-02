// ==============================================================================
// Linguistic Heuristics & Style Linter Engine (Hemingway Style)
// Identifies long sentences, passive voice, jargon, filler phrases, and repetition
// ==============================================================================

import { WritingSuggestion, SuggestionType } from "@/types/editorial";
import { splitIntoSentences, splitIntoWords } from "./readability";

interface FillerRule {
  pattern: RegExp;
  replacement: string;
  explanation: string;
  whyItMatters: string;
}

const FILLER_RULES: FillerRule[] = [
  {
    pattern: /\bdue to the fact that\b/gi,
    replacement: "because",
    explanation: "'Due to the fact that' is a verbose substitute for 'because'.",
    whyItMatters: "Direct causal conjunctions sharpen newsletter pacing.",
  },
  {
    pattern: /\bin order to\b/gi,
    replacement: "to",
    explanation: "'In order to' adds filler words without additional meaning.",
    whyItMatters: "Trimming infinitives improves scannability.",
  },
  {
    pattern: /\bat this point in time\b/gi,
    replacement: "now",
    explanation: "'At this point in time' can be replaced by 'now' or 'currently'.",
    whyItMatters: "Clear temporal words reduce reader fatigue.",
  },
  {
    pattern: /\bat the end of the day\b/gi,
    replacement: "ultimately",
    explanation: "'At the end of the day' is an overused editorial cliché.",
    whyItMatters: "Executive newsletters demand concise prose over conversational idioms.",
  },
  {
    pattern: /\bit is important to note that\b/gi,
    replacement: "",
    explanation: "'It is important to note that' is an empty meta-announcement.",
    whyItMatters: "State your point directly; readers already know you consider it important.",
  },
  {
    pattern: /\bit is worth mentioning that\b/gi,
    replacement: "",
    explanation: "'It is worth mentioning that' acts as throat-clearing prose.",
    whyItMatters: "Deleting prefatory phrases increases information density.",
  },
  {
    pattern: /\bhas the ability to\b/gi,
    replacement: "can",
    explanation: "'Has the ability to' is a passive substitute for 'can'.",
    whyItMatters: "Active modal verbs deliver crisper technical descriptions.",
  },
  {
    pattern: /\bin the event that\b/gi,
    replacement: "if",
    explanation: "'In the event that' is wordy legalese.",
    whyItMatters: "'If' is simpler and easier to parse.",
  },
];

interface JargonRule {
  pattern: RegExp;
  replacement: string;
  explanation: string;
  whyItMatters: string;
}

const JARGON_RULES: JargonRule[] = [
  {
    pattern: /\bparadigm shift\b/gi,
    replacement: "fundamental shift",
    explanation: "'Paradigm shift' is overused corporate buzzword territory.",
    whyItMatters: "Precise technical phrasing sounds more credible to engineers.",
  },
  {
    pattern: /\bsynergy\b|\bsynergistic\b/gi,
    replacement: "integration",
    explanation: "'Synergy' is generic corporate speak.",
    whyItMatters: "Describe the specific technical integration or cost benefit.",
  },
  {
    pattern: /\bgame[- ]changer\b/gi,
    replacement: "breakthrough",
    explanation: "'Game-changer' is hyperbolic marketing language.",
    whyItMatters: "Editorial authority comes from understated, substantiated facts.",
  },
  {
    pattern: /\bleverage\b(?!\s+(?:ratio|buyout|margin))/gi,
    replacement: "use",
    explanation: "Using 'leverage' as a generic verb for 'use' or 'apply' adds needless weight.",
    whyItMatters: "'Use' or 'deploy' is clearer and less pretentious.",
  },
  {
    pattern: /\butilize\b/gi,
    replacement: "use",
    explanation: "'Utilize' almost never adds meaning over 'use'.",
    whyItMatters: "Direct Anglo-Saxon roots ('use') read faster than Latinate derivations.",
  },
  {
    pattern: /\btable stakes\b/gi,
    replacement: "baseline requirement",
    explanation: "'Table stakes' is casual boardroom jargon.",
    whyItMatters: "Specifying exact technical requirements aids analytical clarity.",
  },
  {
    pattern: /\bdisruptive innovation\b/gi,
    replacement: "new alternative",
    explanation: "'Disruptive innovation' has lost its rigorous Christensen meaning in tech press.",
    whyItMatters: "Clarify whether a development is cheaper, faster, or architecturally distinct.",
  },
];

// Passive Voice Pattern: Auxiliary verb + optional adverb + past participle
const PASSIVE_VOICE_REGEX =
  /\b(am|is|are|was|were|be|been|being)\s+([a-zA-Z]+ly\s+)?([a-zA-Z]+(?:ed|en|wn|t|ne|de))\b/i;

export function analyzeProseHeuristics(content: string): WritingSuggestion[] {
  const suggestions: WritingSuggestion[] = [];
  if (!content || content.trim().length === 0) return suggestions;

  const sentences = splitIntoSentences(content);

  sentences.forEach((sentence) => {
    const startIndex = content.indexOf(sentence);
    const endIndex = startIndex + sentence.length;
    const words = splitIntoWords(sentence);
    const wordCount = words.length;

    // 1. Difficult-to-read sentences (>= 35 words)
    if (wordCount >= 35) {
      suggestions.push({
        id: `sugg-diff-${startIndex}`,
        type: "difficult_sentence",
        originalText: sentence,
        suggestedText: splitCompoundSentence(sentence),
        explanation: `This sentence is ${wordCount} words long with heavy syntactic layering.`,
        whyItMatters:
          "Sentences over 35 words trigger cognitive overload for newsletter skimmers. Split it into two declarative statements.",
        startIndex,
        endIndex,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
    }
    // 2. Long sentences (25 to 34 words)
    else if (wordCount >= 25) {
      suggestions.push({
        id: `sugg-long-${startIndex}`,
        type: "long_sentence",
        originalText: sentence,
        suggestedText: splitCompoundSentence(sentence),
        explanation: `This sentence contains ${wordCount} words.`,
        whyItMatters:
          "Aim for a rhythm where sentences average 15–20 words to preserve reading velocity.",
        startIndex,
        endIndex,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
    }

    // 3. Passive Voice Detection
    const passiveMatch = sentence.match(PASSIVE_VOICE_REGEX);
    if (passiveMatch && !isFalsePositivePassive(passiveMatch[0])) {
      const matchText = passiveMatch[0];
      const matchIndex = sentence.indexOf(matchText);
      suggestions.push({
        id: `sugg-passive-${startIndex + matchIndex}`,
        type: "passive_voice",
        originalText: sentence,
        suggestedText: suggestActiveRewrite(sentence, matchText),
        explanation: `Identified passive construction: '${matchText}'.`,
        whyItMatters:
          "Passive voice hides the actor and dampens energetic storytelling. Rephrase so the subject performs the action.",
        startIndex,
        endIndex,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
    }

    // 4. Jargon & Buzzwords
    JARGON_RULES.forEach((rule, rIdx) => {
      const match = sentence.match(rule.pattern);
      if (match) {
        const jargonText = match[0];
        const jIndex = sentence.indexOf(jargonText);
        suggestions.push({
          id: `sugg-jargon-${startIndex + jIndex}-${rIdx}`,
          type: "jargon",
          originalText: jargonText,
          suggestedText: rule.replacement,
          explanation: rule.explanation,
          whyItMatters: rule.whyItMatters,
          startIndex: startIndex + jIndex,
          endIndex: startIndex + jIndex + jargonText.length,
          status: "pending",
          createdAt: new Date().toISOString(),
        });
      }
    });

    // 5. Filler Phrases
    FILLER_RULES.forEach((rule, rIdx) => {
      const match = sentence.match(rule.pattern);
      if (match) {
        const fillerText = match[0];
        const fIndex = sentence.indexOf(fillerText);
        suggestions.push({
          id: `sugg-filler-${startIndex + fIndex}-${rIdx}`,
          type: "filler_phrase",
          originalText: fillerText,
          suggestedText: rule.replacement,
          explanation: rule.explanation,
          whyItMatters: rule.whyItMatters,
          startIndex: startIndex + fIndex,
          endIndex: startIndex + fIndex + fillerText.length,
          status: "pending",
          createdAt: new Date().toISOString(),
        });
      }
    });
  });

  // 6. Repetitive Expressions Check (Sliding 3-sentence window)
  checkRepetitiveTerms(sentences, content, suggestions);

  return suggestions;
}

// ------------------------------------------------------------------------------
// Linguistic Helpers
// ------------------------------------------------------------------------------

function splitCompoundSentence(sentence: string): string {
  // Look for natural coordinating conjunctions or semicolons
  if (sentence.includes(";")) {
    const parts = sentence.split(";");
    return `${parts[0].trim()}. ${capitalizeFirst(parts[1]?.trim() || "")}`;
  }

  const conjunctionMatch = sentence.match(/,\s+(and|but|while|whereas|however|because)\s+/i);
  if (conjunctionMatch && conjunctionMatch.index && conjunctionMatch.index > 30) {
    const firstPart = sentence.slice(0, conjunctionMatch.index).trim();
    const secondPart = sentence.slice(
      conjunctionMatch.index + conjunctionMatch[0].length
    ).trim();
    return `${firstPart}. ${capitalizeFirst(secondPart)}`;
  }

  return sentence;
}

function suggestActiveRewrite(sentence: string, passiveSnippet: string): string {
  // If sentence has 'by [actor]', try flipping
  const byMatch = sentence.match(/\bby\s+([a-zA-Z0-9_\s]+?)(?:[.,;]|$)/i);
  if (byMatch && byMatch[1]) {
    const actor = byMatch[1].trim();
    return `[Active proposal]: Rephrase with '${actor}' as the lead subject performing the action.`;
  }
  return `[Active proposal]: Identify the subject and rephrase to eliminate '${passiveSnippet}'.`;
}

function isFalsePositivePassive(phrase: string): boolean {
  const lower = phrase.toLowerCase();
  // Filter adjective uses that look like passive participles
  const adjectives = ["is located", "are based", "was interested", "were excited", "is closed"];
  return adjectives.some((adj) => lower.includes(adj));
}

function checkRepetitiveTerms(
  sentences: string[],
  fullText: string,
  outSuggestions: WritingSuggestion[]
): void {
  const STOP_WORDS = new Set([
    "the", "and", "that", "this", "with", "from", "they", "have", "been", "were",
    "will", "their", "which", "about", "would", "these", "other", "there", "what",
  ]);

  for (let i = 0; i < sentences.length - 1; i++) {
    const s1Words = splitIntoWords(sentences[i].toLowerCase()).filter(
      (w) => w.length > 5 && !STOP_WORDS.has(w)
    );
    const s2Words = splitIntoWords(sentences[i + 1].toLowerCase()).filter(
      (w) => w.length > 5 && !STOP_WORDS.has(w)
    );

    const overlap = s1Words.filter((w) => s2Words.includes(w));
    if (overlap.length >= 2) {
      const repeatedWord = overlap[0];
      const sIndex = fullText.indexOf(sentences[i + 1]);
      outSuggestions.push({
        id: `sugg-rep-${sIndex}`,
        type: "repetition",
        originalText: repeatedWord,
        suggestedText: `[Synonym for '${repeatedWord}']`,
        explanation: `The term '${repeatedWord}' appears in consecutive sentences.`,
        whyItMatters:
          "Repeating non-trivial words in back-to-back sentences diminishes vocabulary variety.",
        startIndex: sIndex,
        endIndex: sIndex + repeatedWord.length,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      break; // Cap repetition warnings to prevent noise
    }
  }
}

function capitalizeFirst(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
