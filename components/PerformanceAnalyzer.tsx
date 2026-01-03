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
import Speedometer from "@/components/Speedometer";

const SEM_CREDITS = [20, 20, 25, 25, 25, 25, 25, 25];

export default function PerformanceAnalyzer() {
  const [sgpa, setSgpa] = useState<string[]>(Array(8).fill(""));
  const [isDark, setIsDark] = useState(false);
  const [aiPrediction, setAiPrediction] = useState<number | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const getAIPrediction = async () => {
    if (validSemesters.length < 3) {
      setAiPrediction(null);
      return;
    }

    setIsAiLoading(true);
    try {
      const lastThree = validSemesters.slice(-3).map(s => s.value);

      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prev3: lastThree[0],
          prev2: lastThree[1],
          prev1: lastThree[2],
        }),
      });

      const data = await response.json();
      setAiPrediction(data.predicted_sgpa);
    } catch (error) {
      console.error("AI Server offline:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("sgpa_values");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 8) {
          setSgpa(parsed);
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sgpa_values", JSON.stringify(sgpa));
  }, [sgpa]);

  useEffect(() => {
    getAIPrediction();
  }, [sgpa]);

  const handleInputChange = (i: number, v: string) => {
    const updated = [...sgpa];
    updated[i] = v;
    setSgpa(updated);
  };

  const sg = sgpa.map((v) => Number(v) || 0);

 
  const calcDGPA = () => {
    let credits = 0;
    let sum = 0;

    sg.forEach((v, i) => {
      if (v > 0) {
        credits += SEM_CREDITS[i];
        sum += v * SEM_CREDITS[i];
      }
    });

    return credits === 0 ? null : Number((sum / credits).toFixed(2));
  };

  const dgpa = calcDGPA();

  
  const validSemesters = sg
    .map((v, i) => ({ sem: i + 1, value: v }))
    .filter((d) => d.value > 0);

  const allSemestersCompleted = validSemesters.length === 8;

  const predictNextSGPA = () => {
    if (validSemesters.length < 2) return null;

    const lastSem = validSemesters.at(-1)!.sem;
    if (lastSem >= 8) return null;

    const deltas: number[] = [];
    for (let i = 1; i < validSemesters.length; i++) {
      deltas.push(
        validSemesters[i].value - validSemesters[i - 1].value
      );
    }

    const avgDelta =
      deltas.reduce((a, b) => a + b, 0) / deltas.length;

    const predicted =
      validSemesters.at(-1)!.value + avgDelta;

    return Math.min(10, Math.max(0, Number(predicted.toFixed(2))));
  };

  const trendPrediction = predictNextSGPA();

  const chartData = sg.map((v, i) => ({
    sem: `S${i + 1}`,
    sgpa: v > 0 ? v : null,
  }));

  if (trendPrediction && !allSemestersCompleted) {
    chartData.push({
      sem: `S${validSemesters.at(-1)!.sem + 1}`,
      sgpa: trendPrediction,
    });
  }

  
  return (
    <div
      className={`max-w-6xl mx-auto border-2 rounded-2xl p-6 space-y-8 ${
        isDark
          ? "bg-slate-900 text-slate-100 border-slate-700"
          : "bg-slate-50 border-slate-300"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-extrabold">
          🎓 Performance Dashboard
        </h2>
        <button
          onClick={() => setIsDark((d) => !d)}
          className="px-4 py-1.5 text-xs rounded-full border"
        >
          {isDark ? "Dark" : "Light"} mode
        </button>
      </div>

      {/* SGPA Inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {sgpa.map((v, i) => (
          <div
            key={i}
            className="p-4 rounded-xl border bg-white"
          >
            <label className="text-sm font-semibold">
              Semester {i + 1}
            </label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.01"
              value={v}
              onChange={(e) =>
                handleInputChange(i, e.target.value)
              }
              className="w-full border p-2 rounded mt-2"
              placeholder="Enter SGPA"
            />
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="p-6 rounded-xl border bg-white">
        <h3 className="font-semibold mb-4">📊 SGPA Trend</h3>
        <div className="h-72">
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <defs>
                <linearGradient
                  id="lineGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="4 4"
                opacity={0.3}
              />
              <XAxis dataKey="sem" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Line
                dataKey="sgpa"
                type="monotone"
                stroke="url(#lineGradient)"
                strokeWidth={4}
                dot={{ r: 6 }}
                activeDot={{ r: 8 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Speedometer */}
      <div className="p-6 rounded-xl border bg-white shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-indigo-900">
            🤖 AI Trend Forecast
          </h3>
          {isAiLoading && <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full animate-pulse">AI ANALYZING</span>}
        </div>

        {aiPrediction ? (
          <>
            <Speedometer value={aiPrediction} />
            <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
              <p className="text-xs text-indigo-500 font-bold uppercase tracking-tight">Predicted by Scholartrack AI</p>
              <p className="text-2xl font-black text-indigo-900">
                SGPA: {aiPrediction}
              </p>
            </div>
          </>
        ) : (
          <p className="text-xs opacity-70 italic text-center py-10">
            {validSemesters.length < 3
              ? "Enter at least 3 semesters to unlock AI analysis."
              : "Waiting for AI calculation..."}
          </p>
        )}
      </div>

      {/* DGPA */}
      <div className="p-6 rounded-xl border bg-indigo-100">
        <h3 className="font-semibold">🎓 Final DGPA</h3>

        {allSemestersCompleted ? (
          <motion.p
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-extrabold mt-2"
          >
            {dgpa}
          </motion.p>
        ) : (
          <p className="text-xs opacity-70 mt-2">
            Enter SGPA for all 8 semesters to view final DGPA.
          </p>
        )}
      </div>
    </div>
  );
}
