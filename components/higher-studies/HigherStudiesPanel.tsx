import MatchedUniversities from "./MatchedUniversities"
import EligibilityGaps from "./EligibilityGaps"
import TargetScholarships from "./TargetScholarships"

export default function HigherStudiesPanel({ dgpa }: { dgpa: number }) {
  if (!dgpa) return <p>Calculate DGPA in Analyzer first</p>

  return (
    <div className="space-y-6">
      <MatchedUniversities dgpa={dgpa} />
      <EligibilityGaps dgpa={dgpa} />
      <TargetScholarships dgpa={dgpa} />
    </div>
  )
}
