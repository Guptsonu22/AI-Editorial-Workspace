// ==============================================================================
// Web Article Extraction Service
// Scrapes readable text, strips boilerplate, detects paywalls, and parses metadata
// ==============================================================================

import * as cheerio from "cheerio";
import { validateSafeUrl } from "./ssrf-validator";
import { SourceRecord, ExtractionStatus } from "@/types/editorial";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (AI-Editorial-Workspace/1.0; +https://thisweekin.ai)";

const TIMEOUT_MS = 8000;
const MAX_BYTES = 2.5 * 1024 * 1024; // 2.5MB cap

export interface ExtractionResult {
  success: boolean;
  url: string;
  title: string;
  cleanedContent: string;
  wordCount: number;
  author?: string;
  publishedAt?: string;
  status: ExtractionStatus;
  error?: string;
}

export async function extractArticleContent(
  targetUrl: string,
  manualFallback?: string,
  titleOverride?: string
): Promise<ExtractionResult> {
  // If manual content is provided upfront, use it as verified input
  if (manualFallback && manualFallback.trim().length > 50) {
    const cleaned = sanitizeArticleText(manualFallback);
    const words = countWords(cleaned);
    return {
      success: true,
      url: targetUrl || "https://manual-source.internal",
      title: titleOverride?.trim() || extractFirstHeadingOrSummary(cleaned),
      cleanedContent: cleaned,
      wordCount: words,
      status: "manual",
    };
  }

  // 1. SSRF and Protocol Validation
  const validation = validateSafeUrl(targetUrl);
  if (!validation.isValid || !validation.sanitizedUrl) {
    // If manual content exists, downgrade to manual
    if (manualFallback && manualFallback.trim().length > 0) {
      const cleaned = sanitizeArticleText(manualFallback);
      return {
        success: true,
        url: targetUrl,
        title: titleOverride || "Manual Article Note",
        cleanedContent: cleaned,
        wordCount: countWords(cleaned),
        status: "manual",
        error: validation.error,
      };
    }
    return {
      success: false,
      url: targetUrl,
      title: titleOverride || targetUrl,
      cleanedContent: "",
      wordCount: 0,
      status: "failed",
      error: validation.error || "Invalid URL",
    };
  }

  // 2. Network Fetch with Timeout & Byte Guard
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(validation.sanitizedUrl.toString(), {
      headers: {
        "User-Agent": USER_AGENT,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7",
        "Accept-Language": "en-US,en;q=0.9",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
      },
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      // Handle HTTP errors (403 bot blocks, 404, etc.)
      const errorMsg = `HTTP ${response.status}: ${response.statusText}`;
      if (manualFallback && manualFallback.trim().length > 20) {
        const cleaned = sanitizeArticleText(manualFallback);
        return {
          success: true,
          url: targetUrl,
          title: titleOverride || "Manual Fallback Source",
          cleanedContent: cleaned,
          wordCount: countWords(cleaned),
          status: "manual",
          error: `${errorMsg} (Manual text preserved)`,
        };
      }
      return {
        success: false,
        url: targetUrl,
        title: titleOverride || targetUrl,
        cleanedContent: "",
        wordCount: 0,
        status: "failed",
        error: `Website inaccessible (${errorMsg}). Please provide content manually.`,
      };
    }

    const html = await response.text();
    if (html.length > MAX_BYTES) {
      throw new Error("Article payload exceeded 2.5MB maximum allowed threshold.");
    }

    // 3. Cheerio Parsing & Boilerplate Removal
    const $ = cheerio.load(html);

    // Strip non-content and clutter elements
    $(
      "script, style, noscript, nav, header, footer, aside, svg, iframe, form, button, [role='dialog'], [role='alert'], .ad, .advertisement, .cookie-banner, .social-share, .newsletter-signup"
    ).remove();

    // Extract Title
    const title =
      titleOverride?.trim() ||
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="twitter:title"]').attr("content") ||
      $("title").text().trim() ||
      $("h1").first().text().trim() ||
      targetUrl;

    // Extract Author & Published Date
    const author =
      $('meta[name="author"]').attr("content") ||
      $('meta[property="article:author"]').attr("content") ||
      $('[rel="author"]').first().text().trim() ||
      undefined;

    const publishedAt =
      $('meta[property="article:published_time"]').attr("content") ||
      $('time[datetime]').attr("datetime") ||
      $('meta[name="publish-date"]').attr("content") ||
      undefined;

    // Extract Main Article Body
    let articleText = "";
    const primaryContainers = $("article, main, .post-content, .article-content, #content, .story-body");

    if (primaryContainers.length > 0) {
      articleText = primaryContainers.first().text();
    } else {
      // Fallback to all paragraph tags
      const paragraphs: string[] = [];
      $("p").each((_, el) => {
        const pText = $(el).text().trim();
        if (pText.length > 35) {
          paragraphs.push(pText);
        }
      });
      articleText = paragraphs.join("\n\n");
    }

    const cleaned = sanitizeArticleText(articleText);
    const wordCount = countWords(cleaned);

    // If extracted text is suspiciously sparse, check if paywall or bot protection blocked body
    if (wordCount < 60) {
      if (manualFallback && manualFallback.trim().length > 40) {
        const fallbackCleaned = sanitizeArticleText(manualFallback);
        return {
          success: true,
          url: targetUrl,
          title: title || "Manual Fallback Source",
          cleanedContent: fallbackCleaned,
          wordCount: countWords(fallbackCleaned),
          status: "manual",
          error: "Extracted body was minimal (likely paywalled). Manual content active.",
        };
      }
      return {
        success: false,
        url: targetUrl,
        title,
        cleanedContent: cleaned,
        wordCount,
        status: "failed",
        error: "Insufficient text extracted (site may be behind a paywall or JavaScript wall). Please use manual text fallback.",
      };
    }

    return {
      success: true,
      url: targetUrl,
      title: cleanTitle(title),
      cleanedContent: cleaned,
      wordCount,
      author,
      publishedAt,
      status: "success",
    };
  } catch (err: any) {
    const errorMsg =
      err.name === "AbortError"
        ? "Network connection timed out after 8 seconds."
        : err.message || "Failed to fetch article content.";

    if (manualFallback && manualFallback.trim().length > 30) {
      const fallbackCleaned = sanitizeArticleText(manualFallback);
      return {
        success: true,
        url: targetUrl,
        title: titleOverride || "Manual Fallback Source",
        cleanedContent: fallbackCleaned,
        wordCount: countWords(fallbackCleaned),
        status: "manual",
        error: `${errorMsg} (Manual text fallback enabled)`,
      };
    }

    return {
      success: false,
      url: targetUrl,
      title: titleOverride || targetUrl,
      cleanedContent: "",
      wordCount: 0,
      status: "failed",
      error: `${errorMsg}. Please paste article text manually.`,
    };
  }
}

// ------------------------------------------------------------------------------
// Internal Helpers
// ------------------------------------------------------------------------------

export function sanitizeArticleText(text: string): string {
  if (!text) return "";
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();
}

export function countWords(text: string): number {
  if (!text) return 0;
  const matches = text.match(/\b[a-zA-Z0-9_\-'’]+\b/g);
  return matches ? matches.length : 0;
}

function cleanTitle(title: string): string {
  return title
    .replace(/\s+/g, " ")
    .replace(/ - [^-\n]+$/, "") // Strip trailing site names like " - TechCrunch"
    .replace(/ \| [^|\n]+$/, "") // Strip trailing site names like " | The Verge"
    .trim();
}

function extractFirstHeadingOrSummary(text: string): string {
  const firstLine = text.split("\n")[0]?.trim();
  if (firstLine && firstLine.length < 120) {
    return firstLine;
  }
  return "Pasted Article Content";
}
