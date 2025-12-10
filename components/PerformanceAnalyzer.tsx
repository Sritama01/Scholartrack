"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import Speedometer from "@/components/Speedometer"; // <-- ADD THIS

// MAKAUT credit structure (Sem 1–8)
const SEM_CREDITS = [20, 20, 25, 25, 25, 25, 25, 25];

export default function PerformanceAnalyzer() {
  const [sgpa, setSgpa] = useState<string[]>(Array(8).fill(""));
  const [isDark, setIsDark] = useState(false);

  // -------- Load SGPA from localStorage on mount --------
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("sgpa_values");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 8) {
          setSgpa(parsed);
        }
      } catch {}
    }
  }, []);

  // -------- Save SGPA to localStorage --------
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("sgpa_values", JSON.stringify(sgpa));
  }, [sgpa]);

  const handleInputChange = (index: number, value: string) => {
    const updated = [...sgpa];
    updated[index] = value;
    setSgpa(updated);
  };

  const sg = sgpa.map((v) => Number(v) || 0);

  // -------- DGPA --------
  const calcDGPA = () => {
    let totalCredits = 0;
    let weightedSum = 0;

    sg.forEach((value, i) => {
      if (value > 0) {
        totalCredits += SEM_CREDITS[i];
        weightedSum += value * SEM_CREDITS[i];
      }
    });

    if (totalCredits === 0) return null;
    return Number((weightedSum / totalCredits).toFixed(2));
  };

  const dgpa = calcDGPA();

  // -------- Strongest & Weakest --------
  const validSemesters = sg
    .map((value, index) => ({ sem: index + 1, value }))
    .filter((d) => d.value > 0);

  const strongest =
    validSemesters.length > 0
      ? validSemesters.reduce((max, curr) =>
          curr.value > max.value ? curr : max
        )
      : null;

  const weakest =
    validSemesters.length > 0
      ? validSemesters.reduce((min, curr) =>
          curr.value < min.value ? curr : min
        )
      : null;

  // Chart Data
  const chartData = sg.map((value, index) => ({
    sem: `S${index + 1}`,
    sgpa: value > 0 ? value : null,
  }));

  const containerClasses = isDark
    ? "space-y-8 bg-slate-900 text-slate-100 p-4 rounded-xl"
    : "space-y-8";

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold">Performance Dashboard</h2>

        <button
          type="button"
          onClick={() => setIsDark((d) => !d)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border ${
            isDark
              ? "bg-slate-800 border-slate-600"
              : "bg-slate-100 border-slate-300"
          }`}
        >
          <span>{isDark ? "Dark mode" : "Light mode"}</span>
        </button>
      </div>

      {/* SGPA Input Grid */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {sgpa.map((value, index) => (
          <div
            key={index}
            className={`rounded-xl p-4 shadow-md border text-sm ${
              isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
            }`}
          >
            <label className="block font-semibold mb-1">
              Semester {index + 1}
            </label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.01"
              value={value}
              onChange={(e) => handleInputChange(index, e.target.value)}
              className={`w-full border rounded-md p-2 text-sm ${
                isDark ? "bg-slate-900 border-slate-600" : "bg-white border-gray-300"
              }`}
              placeholder="Enter SGPA"
            />
          </div>
        ))}
      </motion.div>

      {/* SGPA Trend Chart */}
      <motion.div
        className={`rounded-xl shadow-md border p-6 ${
          isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
        }`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h3 className="text-sm font-semibold mb-4">📈 SGPA Trend</h3>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sem" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="sgpa"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 5, fill: "#6366f1" }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ⭐ NEW: Speedometer Block */}
      <motion.div
        className={`rounded-xl shadow-md border p-6 ${
          isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
        }`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h3 className="text-sm font-semibold mb-4">⏱ Semester Progress Speedometer</h3>

        {validSemesters.length >= 2 ? (
          <>
            <Speedometer value={validSemesters.at(-1)!.value} />

            <p className="text-xs mt-3 opacity-80">
              Previous: {validSemesters.at(-2)!.value}  
              <br />
              Current: {validSemesters.at(-1)!.value}
            </p>

            <p className="text-sm mt-2 font-bold">
              {(() => {
                const prev = validSemesters.at(-2)!.value;
                const curr = validSemesters.at(-1)!.value;
                const diff = ((curr - prev) / prev) * 100;

                return diff >= 0
                  ? `📈 Improved by ${diff.toFixed(2)}%`
                  : `📉 Dropped by ${Math.abs(diff).toFixed(2)}%`;
              })()}
            </p>
          </>
        ) : (
          <p className="text-xs opacity-80">
            Enter at least 2 SGPA values to view progression.
          </p>
        )}
      </motion.div>

      {/* DGPA + Strongest + Weakest */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* DGPA Card */}
        <motion.div
          className="rounded-xl shadow-md border p-6 bg-indigo-50"
        >
          <h2 className="text-sm font-semibold">🎓 DGPA</h2>
          <p className="text-4xl font-extrabold mt-3">{dgpa ?? "-"}</p>
        </motion.div>

        {/* Strongest */}
        <motion.div className="rounded-xl shadow-md border p-6 bg-green-50">
          <h2 className="text-sm font-semibold text-green-700">🟢 Strongest</h2>
          {strongest ? (
            <p className="text-2xl font-bold mt-3">
              S{strongest.sem} — {strongest.value}
            </p>
          ) : (
            <p className="text-xs opacity-80">Enter SGPA values.</p>
          )}
        </motion.div>

        {/* Weakest */}
        <motion.div className="rounded-xl shadow-md border p-6 bg-red-50">
          <h2 className="text-sm font-semibold text-red-700">🔴 Weakest</h2>
          {weakest ? (
            <p className="text-2xl font-bold mt-3">
              S{weakest.sem} — {weakest.value}
            </p>
          ) : (
            <p className="text-xs opacity-80">Enter SGPA values.</p>
          )}
        </motion.div>

      </div>
    </div>
  );
}
