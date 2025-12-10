"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { GraduationCap, Calculator, Award, TrendingUp, Plus, Trash2 } from "lucide-react"
import ScholarshipSearch from "../components/ScholarshipSearch.client"
import PerformanceAnalyzer from "../components/PerformanceAnalyzer"



type Subject = {
  id: string
  name: string
  marks: number
  credits: number
  grade: string
  gradePoints: number
}

type Scholarship = {
  name: string
  provider: string
  minCGPA: number
  maxCGPA: number
  amount: string
  description: string
  eligibility: string[]
}

const scholarships: Scholarship[] = [
  {
    name: "Excellence Merit Scholarship",
    provider: "University Foundation",
    minCGPA: 9.5,
    maxCGPA: 10.0,
    amount: "₹2,50,000",
    description: "For outstanding academic performance",
    eligibility: [],
  },
  {
    name: "Academic Achievement Award",
    provider: "Education Trust",
    minCGPA: 9.25,
    maxCGPA: 10.0,
    amount: "₹1,50,000",
    description: "For high achievers",
    eligibility: [],
  },
  {
    name: "Dean's India Scholarship",
    provider: "College Administration",
    minCGPA: 9.0,
    maxCGPA: 10.0,
    amount: "₹1,25,000",
    description: "For consistent excellence",
    eligibility: [],
  },
]

function gradeFromMarks(marks: number) {
  if (marks >= 90) return { grade: "O", gp: 10 }
  if (marks >= 80) return { grade: "E", gp: 9 }
  if (marks >= 70) return { grade: "A", gp: 8 }
  if (marks >= 60) return { grade: "B", gp: 7 }
  if (marks >= 50) return { grade: "C", gp: 6 }
  if (marks >= 40) return { grade: "D", gp: 5 }
  return { grade: "F", gp: 0 }
}

const SEMESTER_CREDITS: Record<number, number> = {
  1: 20,
  2: 20,
  3: 25,
  4: 25,
  5: 25,
  6: 25,
  7: 25,
  8: 25,
}

function gpaToPercentage(gpa: number) {
  if (!gpa || gpa <= 0) return 0
  return Number(((gpa - 0.75) * 10).toFixed(2))
}

function emptySubject(): Subject {
  return {
    id: Math.random().toString(36).slice(2),
    name: "",
    marks: 0,
    credits: 3,
    grade: "F",
    gradePoints: 0,
  }
}



export default function StudentPortal() {
  const initial: Record<number, Subject[]> = {}
  for (let s = 1; s <= 8; s++) initial[s] = [emptySubject()]

  const [subjectsBySemester, setSubjectsBySemester] = useState(initial)
  const [selectedSemester, setSelectedSemester] = useState(1)
  const [computedSgpa, setComputedSgpa] = useState<Record<number, number>>({})
  const [manualSemesterSgpa, setManualSemesterSgpa] = useState<Record<number, string>>({})
  const [lastCalculatedYGPA, setLastCalculatedYGPA] = useState<Record<number, number>>({})
  const [singleMarks, setSingleMarks] = useState<number | "">("")


  function updateSubject(sem: number, id: string, field: keyof Subject, value: any) {
    setSubjectsBySemester((prev) => {
      const copy = { ...prev }
      copy[sem] = copy[sem].map((sub) => {
        if (sub.id !== id) return sub
        const updated: Subject = { ...(sub as Subject), [field]: value }
        if (field === "marks") {
          const g = gradeFromMarks(Number(value))
          updated.grade = g.grade
          updated.gradePoints = g.gp
        }
        return updated
      })
      return copy
    })
  }

  function addSubjectToSemester(sem: number) {
    setSubjectsBySemester((prev) => ({
      ...prev,
      [sem]: [...prev[sem], emptySubject()],
    }))
  }

  function removeSubjectFromSemester(sem: number, id: string) {
    setSubjectsBySemester((prev) => {
      const copy = { ...prev }
      if (copy[sem].length === 1) return prev
      copy[sem] = copy[sem].filter((s) => s.id !== id)
      return copy
    })
  }


  function calculateSGPAForSemester(sem: number) {
    const subjects = subjectsBySemester[sem] ?? []
    let totalCredits = 0
    let totalGPxCredits = 0

    subjects.forEach((s) => {
      const gp = s.gradePoints ?? gradeFromMarks(s.marks).gp
      const credits = Number(s.credits) || 0
      totalCredits += credits
      totalGPxCredits += gp * credits
    })

    const sgpa =
      totalCredits > 0 ? Number((totalGPxCredits / totalCredits).toFixed(2)) : 0
    setComputedSgpa((prev) => ({ ...prev, [sem]: sgpa }))
    return sgpa
  }

  function calculateCGPA() {
    let totalCredits = 0
    let weighted = 0

    for (let sem = 1; sem <= 8; sem++) {
      const sg =
        computedSgpa[sem] ??
        (manualSemesterSgpa[sem] ? Number(manualSemesterSgpa[sem]) : NaN)
      if (!sg || Number.isNaN(sg) || sg <= 0) continue

      const credits = SEMESTER_CREDITS[sem]
      totalCredits += credits
      weighted += sg * credits
    }

    return totalCredits === 0 ? 0 : Number((weighted / totalCredits).toFixed(2))
  }

  function calculateYGPAForYear(year: number) {
    if (year < 1 || year > 4) return null
    const semA = (year - 1) * 2 + 1
    const semB = semA + 1
    const sgpaA =
      computedSgpa[semA] ??
      (manualSemesterSgpa[semA] ? Number(manualSemesterSgpa[semA]) : NaN)
    const sgpaB =
      computedSgpa[semB] ??
      (manualSemesterSgpa[semB] ? Number(manualSemesterSgpa[semB]) : NaN)
    const cA = SEMESTER_CREDITS[semA] ?? 0
    const cB = SEMESTER_CREDITS[semB] ?? 0

    if (Number.isNaN(sgpaA) || Number.isNaN(sgpaB) || cA + cB === 0) return null

    const ygpa = Number(((sgpaA * cA + sgpaB * cB) / (cA + cB)).toFixed(2))
    setLastCalculatedYGPA((prev) => ({ ...prev, [year]: ygpa }))
    return ygpa
  }

  const currentCGPA = useMemo(
    () => calculateCGPA(),
    [computedSgpa, manualSemesterSgpa]
  )

  const singleGradeInfo =
    typeof singleMarks === "number"
      ? gradeFromMarks(singleMarks)
      : { grade: "-", gp: 0 }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <GraduationCap className="text-blue-600" /> Student Academic Portal
          </h1>
          <p className="text-sm text-gray-600">
            Track your academic progress & find scholarships
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="grade-converter" className="space-y-6">
         
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="grade-converter" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" /> Grade Converter
            </TabsTrigger>
            <TabsTrigger value="sgpa" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" /> SGPA
            </TabsTrigger>
            <TabsTrigger value="cgpa-calculator" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" /> CGPA
            </TabsTrigger>
            <TabsTrigger value="scholarships" className="flex items-center gap-2">
              <Award className="h-4 w-4" /> Scholarships
            </TabsTrigger>
            <TabsTrigger value="ygpa" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" /> YGPA
            </TabsTrigger>
            <TabsTrigger value="analyzer" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Analyzer
            </TabsTrigger>
          </TabsList>

        
          <TabsContent value="grade-converter">
            <Card>
              <CardHeader>
                <CardTitle>Marks to Grade Converter</CardTitle>
                <CardDescription>
                  Convert marks → grade & grade points. Also convert SGPA/CGPA → % (MAKAUT)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* marks → grade */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="marks">Enter your marks (0-100)</Label>
                    <Input
                      id="marks"
                      type="number"
                      min={0}
                      max={100}
                      value={singleMarks === "" ? "" : singleMarks}
                      onChange={(e) => {
                        const v = e.target.value === "" ? "" : Number(e.target.value)
                        setSingleMarks(v)
                      }}
                      placeholder="Enter marks"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Grade:</span>
                        <Badge variant="secondary" className="text-lg">
                          {singleMarks === "" ? "-" : singleGradeInfo.grade}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-medium text-gray-600">
                          Grade Points:
                        </span>
                        <span className="text-lg font-bold text-blue-600">
                          {singleMarks === "" ? "-" : singleGradeInfo.gp}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* GPA → % */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Quick GPA → Percentage Converter
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 bg-white rounded shadow-sm">
                      <Label>SGPA → %</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          id="sgpaToPercent"
                          type="number"
                          placeholder="e.g., 8.23"
                          onChange={() => {}}
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        Example: using current semester SGPA (if calculated):{" "}
                        <strong>{computedSgpa[selectedSemester] ?? "-"}</strong> →{" "}
                        <strong>
                          {computedSgpa[selectedSemester]
                            ? `${gpaToPercentage(computedSgpa[selectedSemester])} %`
                            : "-"}
                        </strong>
                      </p>
                    </div>

                    <div className="p-4 bg-white rounded shadow-sm">
                      <Label>CGPA → %</Label>
                      <p className="mt-2 text-sm text-gray-600">
                        Current CGPA (from entered semester SGPAs):{" "}
                        <strong>{currentCGPA || "-"}</strong> →{" "}
                        <strong>
                          {currentCGPA ? `${gpaToPercentage(currentCGPA)} %` : "-"}
                        </strong>
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Grading scale table */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Grading Scale</h3>
                  <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {[
                      { range: "90-100", grade: "O", points: "10.0" },
                      { range: "80-89", grade: "E", points: "9.0" },
                      { range: "70-79", grade: "A", points: "8.0" },
                      { range: "60-69", grade: "B", points: "7.0" },
                      { range: "50-59", grade: "C", points: "6.0" },
                      { range: "40-49", grade: "D", points: "5.0" },
                      { range: "0-39", grade: "F", points: "0.0" },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm">{item.range}</span>
                        <Badge variant="outline">{item.grade}</Badge>
                        <span className="text-sm font-medium">{item.points}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---------------- SGPA CALCULATOR TAB ---------------- */}
          <TabsContent value="sgpa">
            <Card>
              <CardHeader>
                <CardTitle>SGPA Calculator (MAKAUT)</CardTitle>
                <CardDescription>
                  Choose semester, enter subject marks & credits to compute SGPA and %
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Label>Semester</Label>
                  <Select
                    value={String(selectedSemester)}
                    onValueChange={(v) => setSelectedSemester(Number(v))}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 8 }, (_, i) => (
                        <SelectItem key={i} value={String(i + 1)}>
                          Sem {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="ml-auto text-sm text-gray-600">
                    Semester credits: <strong>{SEMESTER_CREDITS[selectedSemester]}</strong>
                  </div>
                </div>

                <div className="space-y-4">
                  {(subjectsBySemester[selectedSemester] || []).map((sub, idx) => (
                    <div key={sub.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Subject {idx + 1}</h4>
                        {subjectsBySemester[selectedSemester].length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              removeSubjectFromSemester(selectedSemester, sub.id)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid md:grid-cols-4 gap-4">
                        <div>
                          <Label>Subject Name</Label>
                          <Input
                            value={sub.name}
                            onChange={(e) =>
                              updateSubject(
                                selectedSemester,
                                sub.id,
                                "name",
                                e.target.value,
                              )
                            }
                            placeholder="e.g., Mathematics"
                          />
                        </div>

                        <div>
                          <Label>Marks (0-100)</Label>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={sub.marks}
                            onChange={(e) =>
                              updateSubject(
                                selectedSemester,
                                sub.id,
                                "marks",
                                Number(e.target.value),
                              )
                            }
                          />
                        </div>

                        <div>
                          <Label>Credits</Label>
                          <Input
                            type="number"
                            min={1}
                            max={6}
                            value={sub.credits}
                            onChange={(e) =>
                              updateSubject(
                                selectedSemester,
                                sub.id,
                                "credits",
                                Number(e.target.value),
                              )
                            }
                          />
                        </div>

                        <div>
                          <Label>Grade (auto)</Label>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{sub.grade}</Badge>
                            <span className="text-sm text-gray-600">
                              ({sub.gradePoints})
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => addSubjectToSemester(selectedSemester)}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Subject
                  </Button>
                  <Button onClick={() => calculateSGPAForSemester(selectedSemester)}>
                    Calculate SGPA for Sem {selectedSemester}
                  </Button>
                </div>

                {computedSgpa[selectedSemester] !== undefined && (
                  <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-blue-800 mb-2">
                        SGPA — Semester {selectedSemester}
                      </h3>
                      <div className="text-4xl font-bold text-blue-600 mb-2">
                        {computedSgpa[selectedSemester]}
                      </div>
                      <p className="text-sm text-gray-700">
                        Equivalent Percentage:{" "}
                        <strong>
                          {gpaToPercentage(computedSgpa[selectedSemester])} %
                        </strong>
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

      
          <TabsContent value="cgpa-calculator">
            <Card>
              <CardHeader>
                <CardTitle>CGPA Calculator (MAKAUT)</CardTitle>
                <CardDescription>
                  CGPA is computed using semester SGPAs weighted by MAKAUT semester credits
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    You can either calculate each semester&apos;s SGPA (SGPA tab above) or
                    enter SGPAs manually below. CGPA will use computed SGPAs first, then fall
                    back to manual inputs.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 8 }, (_, i) => {
                    const sem = i + 1
                    return (
                      <div key={sem} className="p-3 border rounded">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium">Semester {sem}</div>
                          <div className="text-xs text-gray-500">
                            Credits: {SEMESTER_CREDITS[sem]}
                          </div>
                        </div>

                        <Input
                          placeholder={`SGPA (computed ${computedSgpa[sem] ?? "-"})`}
                          value={manualSemesterSgpa[sem] ?? ""}
                          onChange={(e) =>
                            setManualSemesterSgpa((p) => ({
                              ...p,
                              [sem]: e.target.value,
                            }))
                          }
                        />
                        <div className="mt-2 text-sm text-gray-600">
                          Computed: <strong>{computedSgpa[sem] ?? "-"}</strong>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="flex gap-4 mt-4">
                  <Button
                    onClick={() => {
                     
                    }}
                  >
                    Calculate CGPA
                  </Button>
                </div>

                <div className="mt-4 p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-green-800">
                        Current CGPA
                      </h3>
                      <div className="text-3xl font-bold text-green-600">
                        {currentCGPA || "-"}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-gray-700">
                        Equivalent Percentage
                      </div>
                      <div className="text-xl font-semibold">
                        {currentCGPA ? `${gpaToPercentage(currentCGPA)} %` : "-"}
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-gray-700">
                    Note: CGPA calculation uses MAKAUT semester credit weights
                    (1:20,2:20,3:25...). If you calculated SGPA per semester (SGPA tab),
                    those values are used automatically.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          
          <TabsContent value="scholarships">
            <Card>
              <CardHeader>
                <CardTitle>Scholarships</CardTitle>
                <CardDescription>
                  Find scholarships based on your CGPA (via your API)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScholarshipSearch />
              </CardContent>
            </Card>
          </TabsContent>

         
          <TabsContent value="ygpa">
            <Card>
              <CardHeader>
                <CardTitle>YGPA Calculator (MAKAUT)</CardTitle>
                <CardDescription>
                  Yearly GPA computed using the two semester SGPAs and MAKAUT semester
                  credits
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <p className="text-sm text-gray-600">
                  Enter or compute SGPAs for semesters; then pick a year to compute YGPA.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 8 }, (_, i) => {
                    const sem = i + 1
                    return (
                      <div key={sem} className="p-3 border rounded">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium">Semester {sem}</div>
                          <div className="text-xs text-gray-500">
                            Credits: {SEMESTER_CREDITS[sem]}
                          </div>
                        </div>

                        <Input
                          placeholder={`Computed SGPA: ${computedSgpa[sem] ?? "-"}`}
                          value={manualSemesterSgpa[sem] ?? ""}
                          onChange={(e) =>
                            setManualSemesterSgpa((p) => ({
                              ...p,
                              [sem]: e.target.value,
                            }))
                          }
                        />
                        <div className="mt-2 text-xs text-gray-500">
                          Computed: {computedSgpa[sem] ?? "-"}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="flex gap-3 mt-4 flex-wrap">
                  <Button onClick={() => calculateYGPAForYear(1)}>
                    Calculate YGPA (1st Year)
                  </Button>
                  <Button onClick={() => calculateYGPAForYear(2)}>
                    Calculate YGPA (2nd Year)
                  </Button>
                  <Button onClick={() => calculateYGPAForYear(3)}>
                    Calculate YGPA (3rd Year)
                  </Button>
                  <Button onClick={() => calculateYGPAForYear(4)}>
                    Calculate YGPA (4th Year)
                  </Button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  {Object.entries(lastCalculatedYGPA).length === 0 ? (
                    <div className="text-sm text-gray-600">
                      No YGPA calculated yet — calculate using the buttons above after SGPAs
                      are available.
                    </div>
                  ) : (
                    Object.entries(lastCalculatedYGPA).map(([year, val]) => (
                      <div
                        key={year}
                        className="p-4 rounded bg-emerald-50 border border-emerald-200"
                      >
                        <div className="text-sm text-gray-700">Year {year} YGPA</div>
                        <div className="text-2xl font-bold text-emerald-700">
                          {val}
                        </div>
                        <div className="text-sm text-gray-600">
                          Equivalent %: {gpaToPercentage(val)} %
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          
          <TabsContent value="analyzer">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analyzer</CardTitle>
                <CardDescription>
                  Enter SGPA values to visualize trend & prediction
                </CardDescription>
              </CardHeader>

              <CardContent>
                <PerformanceAnalyzer />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
