import React from 'react';

const PersonalityChart = ({ traits }) => {
  return (
    <div className="relative h-64 border-b border-gray-800 mb-8 mt-12 w-full max-w-3xl">
      {/* Y-Axis labels */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-gray-500 w-6 items-end pb-0 -ml-8">
        <span>100</span>
        <span>80</span>
        <span>60</span>
        <span>40</span>
        <span>20</span>
        <span>0</span>
      </div>
      
      {/* Grid lines */}
      <div className="absolute left-0 top-0 w-full h-full flex flex-col justify-between pointer-events-none">
        <div className="border-b border-dashed border-gray-300 w-full"></div>
        <div className="border-b border-dashed border-gray-300 w-full"></div>
        <div className="border-b border-dashed border-gray-300 w-full"></div>
        <div className="border-b border-dashed border-gray-300 w-full"></div>
        <div className="border-b border-dashed border-gray-300 w-full"></div>
        <div className="border-b border-gray-800 w-full"></div>
      </div>

      {/* Bars */}
      <div className="absolute left-0 bottom-0 w-full h-full flex justify-around items-end pb-px px-4">
        {traits.map((trait, idx) => (
          <div key={idx} className="relative flex flex-col items-center group w-12">
            {/* Marker / Pin */}
            <div 
              className="absolute -top-7 flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold text-white z-10 shadow-sm"
              style={{ backgroundColor: trait.color }}
            >
              {trait.score}
              <div className="absolute -bottom-1 w-2 h-2 rotate-45" style={{ backgroundColor: trait.color }}></div>
            </div>
            
            {/* Bar */}
            <div 
              className="w-6 rounded-t-sm z-0 relative"
              style={{ height: `${trait.score}%`, backgroundColor: '#3b82f6' }}
            >
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-0.5 h-16" style={{ backgroundColor: trait.lineColor }}></div>
            </div>
            
            {/* Label */}
            <div className="absolute -bottom-24 text-[10px] text-gray-600 text-center w-24 left-1/2 -translate-x-1/2 font-medium">
              {trait.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TraitDetail = ({ trait }) => {
  return (
    <div className="mb-10 pb-10 border-b border-gray-200 last:border-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {trait.icon && <div className="text-blue-500">{trait.icon}</div>}
          <h3 className="text-lg font-bold text-gray-800">{trait.name}</h3>
        </div>
        <div className="flex flex-col items-center w-64">
           <div className="relative w-full h-1.5 bg-gray-200 rounded-full mt-6 mb-1">
              <div 
                className="absolute -top-3 flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white z-10 -translate-x-1/2 shadow-sm"
                style={{ left: `${trait.score}%`, backgroundColor: trait.color }}
              >
                {trait.score}
                <div className="absolute -bottom-0.5 w-1.5 h-1.5 rotate-45" style={{ backgroundColor: trait.color }}></div>
              </div>
              <div className="absolute left-0 top-0 h-full bg-teal-400 rounded-full" style={{ width: `${trait.score}%` }}></div>
           </div>
           <div className="flex justify-between w-full text-[9px] font-bold text-gray-500 uppercase mt-1">
             <span>{trait.leftLabel}</span>
             <span>{trait.rightLabel}</span>
           </div>
        </div>
      </div>
      
      <p className="text-sm text-gray-700 mb-4 leading-relaxed font-medium">
        {trait.description}
      </p>
      
      <ul className="list-disc pl-6 space-y-1.5">
        {trait.points.map((point, idx) => (
          <li key={idx} className="text-[13px] text-gray-700 font-medium">
            <span className="text-blue-600 mr-1">•</span> {point}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PersonalityProfile({ traits }) {
  return (
    <div className="border border-gray-300 bg-white mb-6">
      <div className="p-4 border-b border-gray-300 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">Personality</h2>
        <span className="text-sm font-bold text-gray-800 border-l border-gray-300 pl-4">Completed</span>
      </div>
      
      <div className="flex flex-col md:flex-row">
        {/* Main Content */}
        <div className="flex-1 p-8 border-r border-gray-300">
          <div className="flex justify-center mb-32 ml-8">
            <PersonalityChart traits={traits} />
          </div>
          
          <div className="mt-8">
            {traits.map((trait, idx) => (
              <TraitDetail key={idx} trait={trait} />
            ))}
          </div>
        </div>
        
        {/* Side Panel */}
        <div className="w-full md:w-64 p-6 bg-gray-50 shrink-0 hidden md:block">
           <h3 className="text-sm font-bold text-gray-800 mb-6 text-center mt-[350px]">Work attributes</h3>
           
           <div className="space-y-6">
              <div>
                 <p className="text-[11px] font-semibold text-gray-600 mb-1">People Interaction</p>
                 <div className="w-full h-1.5 bg-gray-200 rounded-full"><div className="w-3/4 h-full bg-green-400 rounded-full"></div></div>
              </div>
              <div>
                 <p className="text-[11px] font-semibold text-gray-600 mb-1">Self-Drive</p>
                 <div className="w-full h-1.5 bg-gray-200 rounded-full"><div className="w-[85%] h-full bg-green-400 rounded-full"></div></div>
              </div>
              <div>
                 <p className="text-[11px] font-semibold text-gray-600 mb-1">Trainability</p>
                 <div className="w-full h-1.5 bg-gray-200 rounded-full"><div className="w-[90%] h-full bg-green-400 rounded-full"></div></div>
              </div>
              <div>
                 <p className="text-[11px] font-semibold text-gray-600 mb-1">Repetitive Job Suitability</p>
                 <div className="w-full h-1.5 bg-gray-200 rounded-full"><div className="w-[20%] h-full bg-yellow-400 rounded-full"></div></div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
