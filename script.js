// Global variables
let subjects = [{ id: "1", name: "", marks: 0, credits: 3, grade: "", gradePoints: 0 }]
let cgpa = 0


const scholarships = [
  {
    name: "Excellence Merit Scholarship",
    provider: "University Foundation",
    minCGPA: 9.5,
    maxCGPA: 10.0,
    amount: "₹2,50,000",
    description: "For students with outstanding academic performance",
    eligibility: ["Minimum 9.5 CGPA", "Full-time enrollment", "Community service"],
  },
  {
    name: "Academic Achievement Award",
    provider: "Education Trust",
    minCGPA: 9.0,
    maxCGPA: 10.0,
    amount: "₹1,50,000",
    description: "Supporting high-achieving students in their academic journey",
    eligibility: ["Minimum 9.0 CGPA", "Leadership experience", "Essay required"],
  },
  {
    name: "Dean's India Scholarship",
    provider: "College Administration",
    minCGPA: 9.0,
    maxCGPA: 10.0,
    amount: "₹1,25,000",
    description: "Recognition for consistent academic excellence",
    eligibility: ["Minimum 9.0 CGPA", "No disciplinary actions", "Recommendation letter"],
  },
  {
    name: "Progress Scholarship",
    provider: "Student Support Fund",
    minCGPA: 8.5,
    maxCGPA: 9.1,
    amount: "₹75,000",
    description: "Encouraging students showing academic improvement",
    eligibility: ["Minimum 8.5 CGPA", "Financial need", "Academic improvement"],
  },
  {
    name: "Foundation Support Grant",
    provider: "Alumni Association",
    minCGPA: 7.5,
    maxCGPA: 8.9,
    amount: "₹50,000",
    description: "Supporting students in their academic development",
    eligibility: ["Minimum 7.75 CGPA", "First-generation college student", "Community involvement"],
  },
  {
    name: "SBI Platinum Jubilee Asha Scholarship",
    provider: "SBI",
    minCGPA: 7.0,
    maxCGPA: 8.0,
    amount: "₹3,50,000",
    description: "Supporting students in their academic development",
    eligibility: ["Minimum 7.0 CGPA", "First-generation college student", "Community involvement"],
  },
  {
    name: "Reliance Foundation Scholarship",
    provider: "Reliance Foundation",
    minCGPA: 7.5,
    maxCGPA: 8.5,
    amount: "₹4,0,000",
    description: "Recognition for consistent academic excellence",
    eligibility: ["Minimum 7.5 CGPA", "No disciplinary actions", "Recommendation letter"],
  },

   {
    name:   "SwamiVivakananda Scholarship",
    provider: "Goverment",
    minCGPA: 6.5,
    maxCGPA: 7.0,
    amount: "₹6000",
    description: "Recognition for consistent academic excellence",
    eligibility: ["Minimum 6.5 CGPA","NO disciplinary actions","Recommendation letter"],
  },
]


function getGradeFromMarks(marks) {
  if (marks >= 90) return { grade: "O", gradePoints: 10.0 }
  if (marks >= 80) return { grade: "E", gradePoints: 9.0 }
  if (marks >= 70) return { grade: "A", gradePoints: 8.0 }
  if (marks >= 60) return { grade: "B", gradePoints: 7.0 }
  if (marks >= 50) return { grade: "C", gradePoints: 6.0 }
  if (marks >= 40) return { grade: "D", gradePoints: 5.0 }
  return { grade: "F", gradePoints: 0.0 }
}

function initializeTabs() {
  const tabButtons = document.querySelectorAll(".tab-button")
  const tabContents = document.querySelectorAll(".tab-content")

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetTab = button.getAttribute("data-tab")

      tabButtons.forEach((btn) => btn.classList.remove("active"))
      tabContents.forEach((content) => content.classList.remove("active"))

      button.classList.add("active")
      document.getElementById(targetTab).classList.add("active")
    })
  })
}

function initializeGradeConverter() {
  const marksInput = document.getElementById("single-marks")
  const gradeDisplay = document.getElementById("single-grade")
  const pointsDisplay = document.getElementById("single-points")

  marksInput.addEventListener("input", () => {
    const marks = Number.parseInt(marksInput.value) || 0
    const gradeInfo = getGradeFromMarks(marks)

    gradeDisplay.textContent = gradeInfo.grade
    pointsDisplay.textContent = gradeInfo.gradePoints.toFixed(1)
  })
}

function createSubjectHTML(subject, index) {
  return `
        <div class="subject-card" data-id="${subject.id}">
            <div class="subject-header">
                <h4 class="subject-title">Subject ${index + 1}</h4>
                ${subjects.length > 1 ? `<button class="btn btn-danger" onclick="removeSubject('${subject.id}')"><i class="fas fa-trash"></i></button>` : ""}
            </div>
            <div class="subject-grid">
                <div class="form-group">
                    <label>Subject Name</label>
                    <input type="text" value="${subject.name}" placeholder="e.g., Mathematics" onchange="updateSubject('${subject.id}', 'name', this.value)">
                </div>
                <div class="form-group">
                    <label>Marks</label>
                    <input type="number" min="0" max="100" value="${subject.marks}" placeholder="0-100" onchange="updateSubject('${subject.id}', 'marks', parseInt(this.value) || 0)">
                </div>
                <div class="form-group">
                    <label>Credits</label>
                    <select onchange="updateSubject('${subject.id}', 'credits', parseInt(this.value))">
                        <option value="1" ${subject.credits === 1 ? "selected" : ""}>1</option>
                        <option value="2" ${subject.credits === 2 ? "selected" : ""}>2</option>
                        <option value="3" ${subject.credits === 3 ? "selected" : ""}>3</option>
                        <option value="4" ${subject.credits === 4 ? "selected" : ""}>4</option>
                        <option value="5" ${subject.credits === 5 ? "selected" : ""}>5</option>
                        <option value="6" ${subject.credits === 6 ? "selected" : ""}>6</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Grade</label>
                    <div class="grade-display">
                        <span class="grade-badge">${subject.grade}</span>
                        <span class="points">(${subject.gradePoints})</span>
                    </div>
                </div>
            </div>
        </div>
    `
}
