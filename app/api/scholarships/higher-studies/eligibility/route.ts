import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { dgpa, hasGre, projects } = await req.json()

  const gaps: string[] = []
  const suggestions: string[] = []

  if (dgpa < 7.0) gaps.push("Low DGPA for MS Abroad")
  if (!hasGre) gaps.push("GRE not attempted")
  if (projects < 2) gaps.push("Insufficient projects")

  if (!hasGre) suggestions.push("Prepare GRE within 3 months")
  if (projects < 2) suggestions.push("Build 1–2 strong projects")

  return NextResponse.json({ gaps, suggestions })
}

