import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Check } from 'lucide-react';

const ScoreDonut = ({ score, total, isComplete }) => {
  if (isComplete) {
    return (
      <div className="w-16 h-16 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Check className="w-8 h-8 text-green-500 mb-1" />
          <span className="text-xs font-bold text-gray-800">Completed</span>
        </div>
      </div>
    );
  }

  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: total - score }
  ];

  return (
    <div className="w-20 h-12 relative">
      <ResponsiveContainer width="100%" height="200%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius={25}
            outerRadius={35}
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

export default function SummaryGrid({ scores }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-gray-200 bg-gray-50 mb-6">
      {scores.map((item, index) => (
        <div 
          key={index} 
          className="border border-gray-200 p-5 bg-gray-50/50 flex flex-col justify-between h-40"
        >
          <h3 className="text-[13px] font-bold text-gray-800 mb-2">{item.title}</h3>
          
          <div className="flex items-end justify-between mt-auto">
            {!item.isComplete ? (
              <div className="flex items-baseline">
                <span className="text-3xl font-light text-gray-800 leading-none">{item.score}</span>
                <span className="text-xs font-bold text-gray-800 ml-1 leading-none">/{item.total}</span>
              </div>
            ) : (
              <div></div>
            )}
            
            <div className="-mb-2">
              <ScoreDonut score={item.score} total={item.total} isComplete={item.isComplete} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
