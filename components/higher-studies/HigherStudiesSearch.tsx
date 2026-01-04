"use client"
import { useEffect, useState } from "react"
import ResultCard from "./ResultCard"

export default function HigherStudiesSearch({ dgpa }: { dgpa: number | null }) {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!dgpa) return

    setLoading(true)
    fetch("/api/higher-studies/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dgpa }),
    })
      .then((res) => res.json())
      .then((data) => {
        setResults(Array.isArray(data) ? data : [])
      })
      .finally(() => setLoading(false))
  }, [dgpa])

  if (!dgpa) {
    return <p>📊 Calculate DGPA in Analyzer first</p>
  }

  return (
    <div className="space-y-4">
      {loading && <p>🔍 Finding best higher studies options…</p>}

      {!loading && results.length === 0 && (
        <p className="text-sm text-gray-500">
          No recommendations found.
        </p>
      )}

      {results.map((r) => (
        <ResultCard key={r.type} {...r} />
      ))}
    </div>
  )
}
