// ==============================================================================
// Readability Mathematics Engine
// Implements Flesch Reading Ease, Flesch-Kincaid Grade Level, and sentence metrics
// ==============================================================================

import { EditorialMetrics } from "@/types/editorial";

export function calculateReadability(text: string): EditorialMetrics {
  const cleanText = text.trim();

  if (!cleanText) {
    return {
      wordCount: 0,
      charCount: 0,
      sentenceCount: 0,
      avgSentenceLength: 0,
      readingTimeMinutes: 0,
      fleschReadingEase: 100,
      fleschKincaidGrade: 0,
      readabilityLabel: "N/A",
      hardSentenceCount: 0,
      veryHardSentenceCount: 0,
      passiveVoiceCount: 0,
      jargonCount: 0,
      fillerCount: 0,
    };
  }

  const sentences = splitIntoSentences(cleanText);
  const words = splitIntoWords(cleanText);

  const wordCount = words.length;
  const sentenceCount = Math.max(sentences.length, 1);
  const charCount = cleanText.length;

  const totalSyllables = words.reduce(
    (acc, word) => acc + countWordSyllables(word),
    0
  );

  const avgSentenceLength = Number((wordCount / sentenceCount).toFixed(1));
  const syllablesPerWord = wordCount > 0 ? totalSyllables / wordCount : 0;

  // Flesch Reading Ease Formula:
  // 206.835 - (1.015 * ASL) - (84.6 * ASW)
  let fleschReadingEase =
    206.835 - 1.015 * avgSentenceLength - 84.6 * syllablesPerWord;
  fleschReadingEase = Math.max(0, Math.min(100, Number(fleschReadingEase.toFixed(1))));

  // Flesch-Kincaid Grade Level Formula:
  // (0.39 * ASL) + (11.8 * ASW) - 15.59
  let fleschKincaidGrade =
    0.39 * avgSentenceLength + 11.8 * syllablesPerWord - 15.59;
  fleschKincaidGrade = Math.max(0, Number(fleschKincaidGrade.toFixed(1)));

  // Calculate Reading Time (Standard editorial velocity: 220 words per minute)
  const readingTimeMinutes = Number((wordCount / 220).toFixed(1));

  // Determine Grade Level Label
  let readabilityLabel = "Plain English (8th–9th Grade)";
  if (fleschReadingEase >= 90) {
    readabilityLabel = "Very Easy (5th Grade)";
  } else if (fleschReadingEase >= 80) {
    readabilityLabel = "Easy (6th Grade)";
  } else if (fleschReadingEase >= 70) {
    readabilityLabel = "Fairly Easy (7th Grade)";
  } else if (fleschReadingEase >= 60) {
    readabilityLabel = "Plain English (8th–9th Grade)";
  } else if (fleschReadingEase >= 50) {
    readabilityLabel = "Fairly Difficult (High School)";
  } else if (fleschReadingEase >= 30) {
    readabilityLabel = "Difficult (College Level)";
  } else {
    readabilityLabel = "Very Confusing (Graduate / Academic)";
  }

  // Count sentence difficulty buckets
  let hardSentenceCount = 0;
  let veryHardSentenceCount = 0;

  for (const s of sentences) {
    const sWords = splitIntoWords(s).length;
    if (sWords >= 35) {
      veryHardSentenceCount++;
    } else if (sWords >= 25) {
      hardSentenceCount++;
    }
  }

  return {
    wordCount,
    charCount,
    sentenceCount,
    avgSentenceLength,
    readingTimeMinutes,
    fleschReadingEase,
    fleschKincaidGrade,
    readabilityLabel,
    hardSentenceCount,
    veryHardSentenceCount,
    passiveVoiceCount: 0, // Augmented by heuristics engine
    jargonCount: 0,
    fillerCount: 0,
  };
}

// ------------------------------------------------------------------------------
// Internal Linguistic Parsers
// ------------------------------------------------------------------------------

export function splitIntoSentences(text: string): string[] {
  // Regex designed to respect common abbreviations without improper splits
  const rawSentences = text
    .replace(/(mr|mrs|ms|dr|prof|sr|jr|e\.g|i\.e|vs|etc)\./gi, "$1_DOT_")
    .split(/(?<=[.?!])\s+(?=[A-Z0-9"“'‘])/g);

  return rawSentences
    .map((s) => s.replace(/_DOT_/g, ".").trim())
    .filter((s) => s.length > 0);
}

export function splitIntoWords(text: string): string[] {
  const matches = text.match(/\b[a-zA-Z0-9_\-'’]+\b/g);
  return matches || [];
}

export function countWordSyllables(rawWord: string): number {
  const word = rawWord.toLowerCase().replace(/[^a-z]/g, "");
  if (!word) return 0;
  if (word.length <= 3) return 1;

  // Remove common non-syllabic endings
  const clean = word
    .replace(/(?:[^laeiouy]|ed|es|e)$/, "")
    .replace(/^y/, "");

  // Match vowel sequences
  const syllables = clean.match(/[aeiouy]{1,2}/g);
  return syllables ? Math.max(1, syllables.length) : 1;
}
