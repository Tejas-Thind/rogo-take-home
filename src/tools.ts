/**
 * The agent's tools. These stand in for the real research APIs — same shapes,
 * local data, plus a little latency so the app behaves like the real thing.
 */

import type Anthropic from "@anthropic-ai/sdk";
import { companies, documents, financials, type Company } from "./data.ts";

/** Thrown when a tool cannot service a request. */
export class ToolError extends Error {}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const toolSchemas: Anthropic.Tool[] = [
  {
    name: "searchCompanies",
    description:
      "Search the coverage universe for companies matching a name or ticker. Returns the company name, ticker and sector for each match.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "A company name, ticker, or part of a name." },
      },
      required: ["query"],
    },
  },
  {
    name: "getCompanyProfile",
    description:
      "Get a company's profile: description, sector, headquarters, headcount, business segments and the filings we hold. Accepts a company name or ticker. If the name matches more than one company, this returns an error naming the candidates — ask the analyst which one they mean rather than guessing.",
    input_schema: {
      type: "object",
      properties: {
        company: { type: "string", description: "The company name or ticker." },
      },
      required: ["company"],
    },
  },
  {
    name: "getFinancials",
    description:
      "Get annual and quarterly financials for a company: revenue, gross margin, operating income, net income and free cash flow. Accepts a company name or ticker. If the name matches more than one company, this returns an error naming the candidates — ask the analyst which one they mean rather than guessing.",
    input_schema: {
      type: "object",
      properties: {
        company: { type: "string", description: "The company name or ticker." },
      },
      required: ["company"],
    },
  },
  {
    name: "searchDocuments",
    description:
      "Keyword search over earnings call transcripts, filing excerpts and press releases. Accepts at most 12 search terms.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Keywords to search for." },
        company: {
          type: "string",
          description: "Optional. Restrict the search to one company (name or ticker).",
        },
      },
      required: ["query"],
    },
  },
];

const MAX_SEARCH_TERMS = 12;

/**
 * Resolves a name/ticker reference to a single company. A ticker match only
 * wins outright if it doesn't *also* collide with another company's name —
 * Acme Corp's ticker is literally "ACME", the same string as the ambiguous
 * colloquial name, so an exact-ticker-first check would silently resolve
 * "Acme" to Acme Corp and defeat the whole point of this function. Name
 * ambiguity is checked first; only once it's clear the query isn't an
 * ambiguous name fragment does an exact ticker match get to decide it.
 */
function resolveCompany(query: string): Company {
  const needle = query.trim().toLowerCase();

  const nameMatches = companies.filter((c) => c.name.toLowerCase().includes(needle));
  const tickerMatch = companies.find((c) => c.ticker.toLowerCase() === needle);

  if (tickerMatch && nameMatches.length <= 1) return tickerMatch;

  if (nameMatches.length === 1) return nameMatches[0];
  if (nameMatches.length > 1) {
    const candidates = nameMatches.map((c) => `${c.name} (${c.ticker})`).join(" or ");
    throw new ToolError(`"${query}" is ambiguous — did you mean ${candidates}?`);
  }

  throw new ToolError(`no company found matching "${query}"`);
}

async function searchCompanies(query: string) {
  await sleep(250);
  const needle = String(query).trim().toLowerCase();
  const matches = companies.filter(
    (c) => c.name.toLowerCase().includes(needle) || c.ticker.toLowerCase() === needle,
  );
  return matches.map((c) => ({
    name: c.name,
    ticker: c.ticker,
    sector: c.sector,
  }));
}

async function getCompanyProfile(company: string) {
  await sleep(450);
  return resolveCompany(company);
}

async function getFinancials(company: string) {
  await sleep(800);
  const resolved = resolveCompany(company);
  const record = financials.find((f) => f.company === resolved.name);
  if (!record) {
    throw new ToolError(`no financials found for "${resolved.name}"`);
  }
  return record;
}

async function searchDocuments(query: string, company?: string) {
  await sleep(700);

  const terms = String(query).trim().split(/\s+/).filter(Boolean);
  // The upstream document index rejects overly long queries.
  if (terms.length > MAX_SEARCH_TERMS) {
    throw new ToolError(
      `document search accepts at most ${MAX_SEARCH_TERMS} terms (received ${terms.length})`,
    );
  }

  const resolvedCompanyName = company ? resolveCompany(company).name : undefined;
  const pool = resolvedCompanyName
    ? documents.filter((d) => d.company === resolvedCompanyName)
    : documents;

  const scored = pool.map((doc) => {
    const haystack = `${doc.title} ${doc.body}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (haystack.includes(term.toLowerCase())) score += 1;
    }
    return { doc, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((s) => s.doc);
}

export async function executeTool(
  name: string,
  input: Record<string, unknown>,
): Promise<unknown> {
  switch (name) {
    case "searchCompanies":
      return searchCompanies(input.query as string);
    case "getCompanyProfile":
      return getCompanyProfile(input.company as string);
    case "getFinancials":
      return getFinancials(input.company as string);
    case "searchDocuments":
      return searchDocuments(input.query as string, input.company as string | undefined);
    default:
      throw new ToolError(`unknown tool "${name}"`);
  }
}
