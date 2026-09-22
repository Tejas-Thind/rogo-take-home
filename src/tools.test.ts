import { describe, expect, it } from "vitest";
import { executeTool, ToolError } from "./tools.ts";

describe("searchCompanies", () => {
  it("returns every match for an ambiguous name", async () => {
    const results = (await executeTool("searchCompanies", { query: "Acme" })) as { name: string }[];
    const names = results.map((r) => r.name).sort();
    expect(names).toEqual(["Acme Corp", "Acme Robotics"]);
  });

  it("also matches on ticker, case-insensitively", async () => {
    const results = (await executeTool("searchCompanies", { query: "glbx" })) as { name: string }[];
    expect(results.map((r) => r.name)).toEqual(["Globex Inc"]);
  });
});

describe("getCompanyProfile", () => {
  it("resolves an unambiguous exact name", async () => {
    const profile = (await executeTool("getCompanyProfile", { company: "Acme Corp" })) as { ticker: string };
    expect(profile.ticker).toBe("ACME");
  });

  it("resolves a ticker", async () => {
    const profile = (await executeTool("getCompanyProfile", { company: "GLBX" })) as { name: string };
    expect(profile.name).toBe("Globex Inc");
  });

  it("trims whitespace before resolving", async () => {
    const profile = (await executeTool("getCompanyProfile", { company: "  Acme Corp  " })) as { ticker: string };
    expect(profile.ticker).toBe("ACME");
  });

  it("throws naming both candidates when a partial name is ambiguous", async () => {
    await expect(executeTool("getCompanyProfile", { company: "Acme" })).rejects.toThrow(ToolError);
    await expect(executeTool("getCompanyProfile", { company: "Acme" })).rejects.toThrow(
      /Acme Corp.*Acme Robotics|Acme Robotics.*Acme Corp/,
    );
  });

  it("does not let a coincidental exact ticker match bypass a genuine name collision", async () => {
    // Acme Corp's ticker is literally "ACME" — the same string as the
    // ambiguous colloquial name. An exact-ticker-first resolver would
    // silently return Acme Corp here and defeat the ambiguity check
    // entirely; this must still throw and name both companies.
    await expect(executeTool("getCompanyProfile", { company: "ACME" })).rejects.toThrow(ToolError);
    await expect(executeTool("getCompanyProfile", { company: "ACME" })).rejects.toThrow(/Acme Robotics/);
  });

  it("throws for a company that doesn't exist", async () => {
    await expect(executeTool("getCompanyProfile", { company: "Nonexistent Co" })).rejects.toThrow(ToolError);
  });
});

describe("getFinancials", () => {
  it("resolves a ticker to the right company's financials", async () => {
    const record = (await executeTool("getFinancials", { company: "ITCH" })) as { company: string };
    expect(record.company).toBe("Initech");
  });

  it("also throws the ambiguity error for a partial name (separate call site, same rule)", async () => {
    await expect(executeTool("getFinancials", { company: "Acme" })).rejects.toThrow(ToolError);
  });

  it("surfaces data-quality warnings instead of hiding them", async () => {
    const record = (await executeTool("getFinancials", { company: "Initech" })) as {
      warnings?: string[];
      annual: { fiscalYear: number; revenue: number | null }[];
    };
    expect(record.warnings?.length).toBeGreaterThan(0);
    expect(record.annual.find((a) => a.fiscalYear === 2025)?.revenue).toBeNull();
  });
});

describe("searchDocuments", () => {
  it("rejects queries longer than twelve terms", async () => {
    await expect(
      executeTool("searchDocuments", {
        query: "one two three four five six seven eight nine ten eleven twelve thirteen",
      }),
    ).rejects.toThrow(ToolError);
  });

  it("accepts queries up to twelve terms", async () => {
    const results = await executeTool("searchDocuments", {
      query: "revenue growth margin subscription transition license perpetual customer retention risk factor outlook",
    });
    expect(Array.isArray(results)).toBe(true);
  });

  it("resolves a ticker in the company filter", async () => {
    const results = (await executeTool("searchDocuments", {
      query: "revenue",
      company: "ITCH",
    })) as { company: string }[];
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((doc) => doc.company === "Initech")).toBe(true);
  });

  it("throws the ambiguity error when the company filter is an ambiguous name", async () => {
    await expect(executeTool("searchDocuments", { query: "revenue", company: "Acme" })).rejects.toThrow(ToolError);
  });

  it("returns an empty array, not an error, when nothing matches", async () => {
    const results = await executeTool("searchDocuments", { query: "zzz_no_such_keyword" });
    expect(results).toEqual([]);
  });
});

describe("executeTool", () => {
  it("throws for an unknown tool name", async () => {
    await expect(executeTool("notARealTool", {})).rejects.toThrow(ToolError);
  });
});
