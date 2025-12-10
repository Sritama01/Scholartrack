"use client";

import { useState } from "react";

/**
 * Final ScholarshipSearch component
 * - Keeps original search behavior (same validations and same API call)
 * - Maps chance -> requiredCgpa in the 6.0 .. 8.0 range:
 *     requiredCgpa = 8 - (chance / 100) * 2
 * - Automatically calculates the next milestone CGPA by rounding up to next 0.5
 *   (6.0 -> 6.5, 6.5 -> 7.0, 7.4 -> 7.5, 7.6 -> 8.0)
 * - No user input for increase rate; the site auto-predicts next milestone
 * - Shows unlockable scholarships and which will be unlocked at next milestone
 * - Keeps search part exactly as before
 */

export default function ScholarshipSearch() {
  const [cgpa, setCgpa] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const [nextCgpa, setNextCgpa] = useState<number | null>(null);
  const [unlockablesIfIncrease, setUnlockablesIfIncrease] = useState<any[]>([]);
  const [unlockAtNextMilestone, setUnlockAtNextMilestone] = useState<any[]>([]);

  // Map chance -> required CGPA in [6.0, 8.0]
  const estimateRequiredCGPA = (chance: number) => {
    const clampedChance = Math.max(0, Math.min(100, chance || 50));
    return Number((8 - (clampedChance / 100) * 2).toFixed(2));
  };

  const clamp = (v: number) => Math.max(0, Math.min(10, Number(v)));

  // Calculate next milestone = round UP to next 0.5 step.
  // If already exactly on a 0.5 step, go to the next one.
  // e.g. 6.0 -> 6.5, 6.1 -> 6.5, 6.5 -> 7.0
  const getNextMilestone = (current: number) => {
    const x = current * 2;
    const eps = 1e-9;
    const isInteger = Math.abs(x - Math.round(x)) < eps;
    if (isInteger) {
      return clamp((x + 1) / 2);
    } else {
      return clamp(Math.ceil(x) / 2);
    }
  };

  // keep validations and same API call as your original
  const searchScholarships = async () => {
    const c = Number(cgpa);

    if (c === 0) {
      alert("❌ 0 CGPA students are NOT eligible for scholarships.");
      return;
    }

    if (c < 5) {
      alert("❌ Minimum CGPA 5.0 required.");
      return;
    }

    setLoading(true);
    setResults([]);
    setUnlockablesIfIncrease([]);
    setUnlockAtNextMilestone([]);
    setNextCgpa(null);

    try {
      const res = await fetch(`/api/scholarships?cgpa=${cgpa}`);
      const data = await res.json();
      const list = data.results || [];

      // annotate with estimated required CGPA (6.0..8.0)
      const annotated = list.map((s: any) => {
        const chance = Number(s.chance ?? 50);
        const requiredCgpa = estimateRequiredCGPA(chance);
        return { ...s, requiredCgpa };
      });

      setResults(annotated);

      // unlockables = scholarships that require > current CGPA
      const unlockables = annotated
        .filter((s: any) => s.requiredCgpa > c)
        .sort((a: any, b: any) => a.requiredCgpa - b.requiredCgpa);

      setUnlockablesIfIncrease(unlockables);

      // compute next milestone and scholarships unlocked at that milestone
      const milestone = getNextMilestone(c);
      setNextCgpa(milestone);

      const unlockAtNext = annotated
        .filter((s: any) => s.requiredCgpa <= milestone && s.requiredCgpa > c)
        .sort((a: any, b: any) => a.requiredCgpa - b.requiredCgpa);

      setUnlockAtNextMilestone(unlockAtNext);

      setShowPopup(true);
    } catch (err) {
      console.error(err);
      alert("Error fetching scholarships.");
    } finally {
      setLoading(false);
    }
  };

  // delta required relative to current CGPA
  const deltaFor = (required: number) => {
    const d = Number((required - Number(cgpa)).toFixed(2));
    return d > 0 ? d : 0;
  };

  return (
    <div className="p-5 border rounded bg-white shadow">
      <h2 className="text-xl font-bold mb-3">Indian Engineering Scholarship Finder</h2>

      <input
        type="number"
        step="0.1"
        placeholder="Enter Your CGPA"
        value={cgpa}
        onChange={(e) => setCgpa(e.target.value)}
        className="border p-2 w-full mb-3"
      />

      <button
        onClick={searchScholarships}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        Search Scholarships
      </button>

      {loading && <p className="mt-4">Searching...</p>}

      {/* full results kept as before */}
      <div className="mt-6 space-y-4">
        {results.map((s: any, i: number) => {
          const required = s.requiredCgpa;
          const delta = deltaFor(required);
          const meets = required <= Number(cgpa);

          return (
            <div key={i} className="border p-4 rounded bg-gray-100 shadow relative">
              {s.isBest && (
                <span className="absolute top-2 right-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded">
                  🏆 BEST
                </span>
              )}

              <h3 className="text-lg font-bold">{s.title}</h3>
              <p className="text-sm text-gray-700 mt-1">{s.description}</p>

              <p className="mt-2"><strong>Category:</strong> {s.category}</p>

              <p className="mt-1"><strong>Chance:</strong> {s.chance}%</p>

              <p className="mt-1 text-sm text-gray-600">
                <strong>Estimated required CGPA:</strong> {required}
              </p>

              {meets ? (
                <p className="mt-1 text-sm text-green-600">✅ You meet this (estimated)</p>
              ) : (
                <p className="mt-1 text-sm text-red-600">
                  ⏳ Need <b>+{delta.toFixed(2)}</b> CGPA to unlock
                </p>
              )}

              <a
                href={s.link}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-3 bg-blue-600 text-white px-4 py-2 rounded"
              >
                Apply Now
              </a>
            </div>
          );
        })}
      </div>

      {/* Animated popup: Option C - Highlight Box with motivational text (Option 3) */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-end md:items-center z-50">
          <div
            className="bg-white p-6 rounded-t-2xl md:rounded-2xl shadow-xl w-full md:max-w-3xl
                       transform transition-transform duration-300 ease-out translate-y-0"
            style={{ animation: "slideup 0.28s ease-out" }}
          >
            <style>{`
              @keyframes slideup {
                from { transform: translateY(18px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
            `}</style>

            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">
                  🎯 Your next achievement level is CGPA {nextCgpa}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Reach this milestone to unlock scholarship opportunities — unlockables shown below.
                </p>
              </div>

              <button
                onClick={() => setShowPopup(false)}
                className="text-gray-600 hover:text-black"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Highlight Box: unlockables if you increase above current */}
            <div className="mt-5 p-4 rounded-lg border-2 border-dashed bg-gradient-to-r from-yellow-50 to-white">
              <h4 className="font-semibold mb-2">🌟 Scholarships you will unlock if you increase above {cgpa}:</h4>

              {unlockablesIfIncrease.length === 0 ? (
                <p className="text-sm text-gray-600">No higher-tier scholarships detected — you may already meet most estimated requirements.</p>
              ) : (
                <div className="space-y-3">
                  {unlockablesIfIncrease.map((s: any, idx: number) => {
                    const delta = deltaFor(s.requiredCgpa);
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-md bg-white shadow-sm border flex justify-between items-center"
                      >
                        <div>
                          <div className="font-semibold">{s.title}</div>
                          <div className="text-xs text-gray-600">
                            Requires {s.requiredCgpa} CGPA • Chance {s.chance}%
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-red-600 font-medium">
                            +{delta.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">needed</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Next milestone unlocks */}
            <div className="mt-6 p-4 rounded-lg border bg-gray-50">
              <h4 className="font-semibold">🔮 Unlocks at CGPA {nextCgpa}</h4>

              {nextCgpa ? (
                <>
                  {unlockAtNextMilestone.length === 0 ? (
                    <p className="text-sm text-gray-600 mt-1">No new scholarships unlocked at this milestone.</p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {unlockAtNextMilestone.map((s: any, i: number) => (
                        <li key={i} className="p-2 bg-white rounded shadow-sm flex justify-between items-center">
                          <div>
                            <div className="font-medium">{s.title}</div>
                            <div className="text-xs text-gray-500">
                              requires {s.requiredCgpa} CGPA • chance {s.chance}%
                            </div>
                          </div>

                          <div className="text-right text-sm">
                            <div className="text-green-600 font-semibold">Unlocked</div>
                            <div className="text-xs text-gray-500">at {nextCgpa}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-600 mt-1">No milestone computed.</p>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowPopup(false)}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
