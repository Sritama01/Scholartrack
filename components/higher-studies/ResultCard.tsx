export default function ResultCard({
  type,
  eligibility,
  institutes,
  bestMatch,
  reason,
}: any) {
  return (
    <div className="border rounded p-4 relative">
      {bestMatch && eligibility > 0 && (
        <span className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
          Best Match
        </span>
      )}

      <h3 className="font-bold text-lg">
        {type} —{" "}
        {eligibility > 0 ? `${eligibility}% Eligible` : "Not Eligible ❌"}
      </h3>

      {reason && (
        <p className="text-sm text-red-600 mt-1">{reason}</p>
      )}

      {institutes.length > 0 && (
        <ul className="mt-2 list-disc list-inside text-sm">
          {institutes.map((i: string) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
