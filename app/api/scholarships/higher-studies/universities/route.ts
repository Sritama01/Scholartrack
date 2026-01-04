import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { dgpa, branch } = await req.json()

  let results = []

  if (dgpa >= 8.5) {
    results.push({ name: "Top Global Universities", match: 90 })
  }
  if (dgpa >= 7.5) {
    results.push({ name: "Mid-tier International Universities", match: 80 })
  }
  if (dgpa >= 6.5) {
    results.push({ name: "Applied Science Universities", match: 70 })
  }

  return NextResponse.json(results)
}
