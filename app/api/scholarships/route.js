export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const cgpa = Number(searchParams.get("cgpa"));

    if (!process.env.SERP_API_KEY) {
      return Response.json({ results: [], error: "API key missing" }, { status: 500 });
    }

    if (!cgpa || cgpa < 5) {
      return Response.json({
        results: [],
        error: "Minimum 5 CGPA required",
      });
    }

    // ✅ SAFE GOOGLE SEARCH (NO AGGRESSIVE FILTERING)
    const query = `
      scholarship for engineering students India apply online ${cgpa} CGPA
      site:gov.in OR site:sbi.co.in OR site:aicte-india.org 
      OR site:buddy4study.com OR site:vidyasaarathi.co.in
    `;

    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(
      query
    )}&engine=google&api_key=${process.env.SERP_API_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    let results = (data.organic_results || []).filter(item => {
      const link = (item.link || "").toLowerCase();
      const title = (item.title || "").toLowerCase();

      // ✅ BLOCK DIRECT PDFs ONLY
      if (link.endsWith(".pdf")) return false;

      // ✅ BLOCK OBVIOUS SCHOOL DOMAINS
      if (
        link.includes("cbse") ||
        link.includes("kvs") ||
        title.includes("class 10") ||
        title.includes("class 12")
      ) return false;

      return true; // ✅ EVERYTHING ELSE ALLOWED
    }).map(item => {
      const title = item.title || "Scholarship";
      const link = item.link;
      const snippet = item.snippet || "";

      let category = "Private Organisation";
      if (link.includes("gov.in")) category = "Central/State Govt";
      if (link.includes("sbi")) category = "Bank Scholarship";
      if (link.includes("aicte")) category = "AICTE Scholarship";

      let chance = 55;
      if (cgpa >= 9) chance = 90;
      else if (cgpa >= 8) chance = 80;
      else if (cgpa >= 7) chance = 65;

      return {
        title,
        link,
        description: snippet,
        category,
        chance,
        isBest: chance >= 85,
      };
    });

    // ✅ GUARANTEED FALLBACK (NEVER EMPTY)
    if (results.length === 0) {
      return Response.json({
        results: [
          {
            title: "National Scholarship Portal – Govt of India",
            link: "https://scholarships.gov.in/",
            description: "Official Central Government scholarship portal",
            category: "Central Govt",
            chance: 85,
            isBest: true
          },
          {
            title: "AICTE Scholarship Portal",
            link: "https://www.aicte-india.org/schemes",
            description: "AICTE scholarships for engineering students",
            category: "AICTE",
            chance: 82,
            isBest: false
          }
        ]
      });
    }

    results.sort((a, b) => b.chance - a.chance);

    return Response.json({ results });

  } catch (err) {
    return Response.json(
      { error: "Scholarship API failed", details: err.message },
      { status: 500 }
    );
  }
}
