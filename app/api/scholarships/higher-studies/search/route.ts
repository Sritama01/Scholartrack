console.log("🔵 FRONTEND RESULTS:", results)


import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(req: Request) {
  try {
    const { dgpa } = await req.json()

    // Safety check
    if (!dgpa || typeof dgpa !== "number") {
      return NextResponse.json({ results: [] })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            "You are a backend API. You MUST return ONLY valid JSON. No explanations. No markdown.",
        },
        {
          role: "user",
          content: `
DGPA: ${dgpa}

Rules:
- If DGPA < 7.7 → Not eligible for abroad
- If DGPA < 8.0 → Not eligible for India
- Student is a B.Tech graduate
- Suggest higher studies options
- Give eligibility percentage (0–100)
- Recommend universities
- Exactly ONE option must have "bestMatch": true

Return ONLY a JSON array like this:
[
  {
    "type": "MS Abroad",
    "eligibility": 85,
    "bestMatch": true,
    "reason": "Strong academic profile",
    "institutes": ["TU Munich", "RWTH Aachen"]
  }
]
`,
        },
      ],
    })

    // 🔥 HARD JSON CLEANING (THIS FIXES YOUR ISSUE)
    const raw = completion.choices[0].message.content || "[]"

    const start = raw.indexOf("[")
    const end = raw.lastIndexOf("]") + 1

    if (start === -1 || end === -1) {
      return NextResponse.json({ results: [] })
    }

    const cleanJson = raw.slice(start, end)
    const parsed = JSON.parse(cleanJson)

    return NextResponse.json({ results: parsed })
  } catch (error) {
    console.error("Higher studies API error:", error)
    return NextResponse.json({ results: [] })
  }
}
