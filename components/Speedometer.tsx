export default function Speedometer({ value }: { value: number }) {
  const max = 10;
  const percent = (value / max) * 180; // Convert SGPA to angle

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="120">
        {/* Background semicircle */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#ddd"
          strokeWidth="15"
        />

        {/* Progress */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#6366f1"
          strokeWidth="15"
          strokeDasharray="180"
          strokeDashoffset={180 - percent}
          strokeLinecap="round"
        />

        {/* Needle */}
        <line
          x1="100"
          y1="100"
          x2={100 + 70 * Math.cos(Math.PI - (percent * Math.PI) / 180)}
          y2={100 - 70 * Math.sin(Math.PI - (percent * Math.PI) / 180)}
          stroke="#f43f5e"
          strokeWidth="4"
        />
      </svg>

      <p className="font-bold text-lg mt-2">SGPA: {value}</p>
    </div>
  );
}
