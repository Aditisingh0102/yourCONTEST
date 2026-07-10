import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const ScoreDonutSmall = ({ score, total }) => {
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: total - score }
  ];

  return (
    <div className="w-8 h-4 relative inline-block align-middle mr-2">
      <ResponsiveContainer width="100%" height="200%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius={10}
            outerRadius={16}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            <Cell fill="#fbbf24" />
            <Cell fill="#f3f4f6" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const ProgressBar = ({ score, total, color = "bg-yellow-400" }) => {
  const percentage = Math.min(100, Math.max(0, (score / total) * 100));
  
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 h-1.5 bg-gray-200 rounded-full flex items-center">
        <div 
          className={`absolute left-0 top-0 h-full rounded-full ${color}`} 
          style={{ width: `${percentage}%` }}
        ></div>
        <div 
          className={`absolute w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm bg-white ${color.replace('bg-', 'border-')}`}
          style={{ left: `calc(${percentage}% - 5px)` }}
        ></div>
      </div>
      <div className="shrink-0 flex items-baseline w-16">
        <span className="text-sm font-bold text-gray-800">{score}</span>
        <span className="text-[10px] font-bold text-gray-800 ml-1">/ {total}</span>
      </div>
    </div>
  );
};

export default function DetailedSection({ title, score, total, subsections }) {
  // Rotate colors for subsections to match the PDF if desired, or keep consistent
  const colors = ['bg-yellow-400', 'bg-yellow-400', 'bg-red-500', 'bg-yellow-400', 'bg-green-500'];

  return (
    <div className="border border-gray-300 bg-[#f9f9f9] mb-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-300">
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        <div className="flex items-center">
          <ScoreDonutSmall score={score} total={total} />
          <div className="flex items-baseline">
            <span className="text-sm font-bold text-gray-800">{score}</span>
            <span className="text-[10px] font-bold text-gray-800 ml-1">/ {total}</span>
          </div>
        </div>
      </div>

      {/* Subsections */}
      {subsections && subsections.length > 0 && (
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
            {subsections.map((sub, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-gray-700">{sub.name}</span>
                <ProgressBar score={sub.score} total={sub.total} color={colors[idx % colors.length]} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
