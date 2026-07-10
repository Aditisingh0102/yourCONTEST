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

const CodingScoreSlider = ({ title, score, total, description, color }) => {
  const percentage = total > 0 ? (score / total) * 100 : 0;
  return (
    <div className="mb-6">
      <h4 className="text-sm font-bold text-gray-800 mb-4">{title}</h4>
      <div className="flex items-center gap-4 mb-2">
        <div className="relative flex-1 h-1 bg-gray-200">
           <div className={`absolute left-0 top-0 h-full ${color}`} style={{ width: `${percentage}%` }}></div>
           <div className={`absolute w-2 h-2 rounded-full border border-white bg-white shadow-sm`} style={{ left: `calc(${percentage}% - 4px)`, top: '-2px', borderColor: color.replace('bg-', '') }}></div>
        </div>
        <div className="flex items-baseline w-16 shrink-0">
          <span className="text-lg font-bold text-gray-800 leading-none">{score}</span>
          <span className="text-[9px] font-bold text-gray-500 ml-1 leading-none">/ {total}</span>
        </div>
      </div>
      <p className="text-[11px] text-gray-600 font-medium leading-relaxed pr-8">{description}</p>
    </div>
  );
}

export default function CodingResponse({ codingQuestions }) {
  if (!codingQuestions || codingQuestions.length === 0) return null;

  return (
    <div className="mt-8 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        <span className="text-red-500 mr-2">3 |</span> Coding Response
      </h2>

      {codingQuestions.map((item, index) => {
         const { questionData, studentAnswer } = item;
         const qMarks = questionData.marks || 1;
         const score = (studentAnswer && studentAnswer.trim().length > 0) ? qMarks : 0;

         return (
          <div key={index} className="border border-gray-300 bg-[#f9f9f9] mb-8 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-300">
              <h3 className="text-lg font-bold text-gray-800">Coding Question {index + 1}</h3>
              <div className="flex items-center">
                <ScoreDonutSmall score={score} total={qMarks} />
                <div className="flex items-baseline">
                  <span className="text-sm font-bold text-gray-800">{score}</span>
                  <span className="text-[10px] font-bold text-gray-800 ml-1">/ {qMarks}</span>
                </div>
              </div>
            </div>

            {/* Question */}
            <div className="p-4 border-b border-gray-300 bg-white">
              <p className="text-[14px] text-gray-800 font-medium leading-relaxed whitespace-pre-wrap">
                {questionData.question}
              </p>
            </div>

            {/* Scores Overview */}
            <div className="p-4 border-b border-gray-300 bg-white">
              <h4 className="text-sm font-bold text-gray-800 mb-6">Scores</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                <div>
                  <CodingScoreSlider 
                    title="Code Submitted" 
                    score={score} total={qMarks} 
                    description={score > 0 ? "You have successfully submitted code for this problem." : "No code was submitted for this problem."}
                    color={score > 0 ? "bg-green-500" : "bg-gray-400"}
                  />
                </div>
              </div>
            </div>

            {/* Code Analysis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 bg-white">
              {/* Left: Code Submitted */}
              <div className="border-r border-gray-300 md:border-b-0 border-b">
                 <div className="flex justify-between items-center p-3 border-b border-gray-300 bg-gray-50">
                    <h4 className="text-[13px] font-bold text-gray-800">Final Code Submitted</h4>
                    <span className="text-[13px] font-bold text-gray-800">Status: {score > 0 ? 'Submitted' : 'Not Attempted'}</span>
                 </div>
                 <div className="p-4 overflow-x-auto text-[12px] font-mono leading-relaxed bg-[#1e293b] text-gray-300 min-h-[150px]">
                    <pre className="whitespace-pre-wrap">
                      {studentAnswer || '// No code submitted'}
                    </pre>
                 </div>
              </div>

              {/* Right: Analysis */}
              <div>
                 <div className="p-3 border-b border-gray-300 bg-gray-50">
                    <h4 className="text-[13px] font-bold text-gray-800">Code Analysis</h4>
                 </div>
                 
                 <div className="border-b border-gray-300 h-full min-h-[150px] p-6 flex flex-col items-center justify-center text-center">
                    <div className="text-[13px] text-gray-500">
                       <p className="mb-2">Advanced static code analysis requires a backend evaluator compiler.</p>
                       <p>Currently showing raw submission data.</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
         );
      })}
    </div>
  );
}
