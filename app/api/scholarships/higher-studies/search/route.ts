import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API safely
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { dgpa } = await req.json();

    if (!dgpa || typeof dgpa !== "number") {
      return NextResponse.json({ results: [] });
    }

    // Use the 1.5 Flash model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json", // Forces JSON output
      }
    });

    const prompt = `
      DGPA Score: ${dgpa}
      Student Profile: B.Tech Graduate.
      
      Rules:
      - If DGPA < 7.7 → Not eligible for abroad
      - If DGPA < 8.0 → Not eligible for India
      - Suggest higher studies options
      - Give eligibility percentage (0–100)
      - Recommend specific universities
      - Exactly ONE option must have "bestMatch": true

      Return a JSON array of objects with these keys: 
      "type" (string), "eligibility" (number), "bestMatch" (boolean), "reason" (string), "institutes" (string array).
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON result from Gemini
    const results = JSON.parse(text);

    console.log("🟢 GEMINI RESULTS:", results);
    return NextResponse.json({ results });

  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json({ results: [] });
  }
}