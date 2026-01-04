import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { dgpa } = await req.json()

  const scholarships = []

  if (dgpa >= 8.5) {
    scholarships.push("High-value Merit Scholarships")
  }
  if (dgpa >= 7.5) {
    scholarships.push("Country-funded Scholarships")
  }
  if (dgpa >= 7.0) {
    scholarships.push("University-level Grants")
  }

  return NextResponse.json(scholarships)
}
