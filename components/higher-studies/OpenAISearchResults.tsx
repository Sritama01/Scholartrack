"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Result = {
  type: string
  eligibility: number
  bestMatch: boolean
  reason: string
  institutes: string[]
}

export default function OpenAISearchResults({ dgpa }: { dgpa: number }) {
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)

    fetch("/api/higher-studies/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dgpa }),
    })
      .then((r) => r.json())
      .then((d) => setResults(d.results || []))
      .finally(() => setLoading(false))
  }, [dgpa])

  if (loading) return <p>🔍 Searching best paths...</p>

  if (!results.length)
    return <p className="text-sm text-gray-500"></p>

  return (
    <div className="space-y-4">
      {results.map((r, i) => (
        <Card key={i} className={r.bestMatch ? "border-2 border-indigo-500" : ""}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{r.type}</CardTitle>

            {r.bestMatch && (
              <Badge className="bg-indigo-600 text-white">
                ⭐ Best Match
              </Badge>
            )}
          </CardHeader>

          <CardContent className="space-y-2">
            <p className="font-semibold">
              Eligibility: {r.eligibility}%
            </p>
            <p className="text-sm text-gray-600">{r.reason}</p>

            <ul className="list-disc ml-5 text-sm">
              {r.institutes.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
