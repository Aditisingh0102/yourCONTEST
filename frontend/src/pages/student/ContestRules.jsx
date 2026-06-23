import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, AlertTriangle, Clock, HelpCircle, FileText, User, ChevronLeft } from 'lucide-react';

export default function ContestRules() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);

  const [contest, setContest] = useState(null);

  React.useEffect(() => {
    const saved = localStorage.getItem('app_contests');
    if (saved) {
      const all = JSON.parse(saved);
      const current = all.find(c => c.id === parseInt(id));
      if (current) setContest(current);
    }
  }, [id]);

  if (!contest) return <div className="p-8 text-center">Loading Contest Details...</div>;

  const handleStart = () => {
    if (agreed || contest.status !== 'Live') {
      navigate(`/student/contests/${id}/arena`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/student/contests')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">{contest.title}</h1>
              <p className="text-sm text-gray-500 font-medium mt-0.5">Assigned by Faculty</p>
            </div>
         </div>
         <span className={`px-3 py-1.5 text-[11px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-2 border ${
           contest.status === 'Live' ? 'bg-red-50 text-red-600 border-red-200' : 
           contest.status === 'Upcoming' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
           'bg-gray-100 text-gray-600 border-gray-200'
         }`}>
            {contest.status === 'Live' && <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>}
            {contest.status}
         </span>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-[800px] w-full mx-auto py-8 px-6">
         
         <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="bg-blue-50/50 border-b border-gray-100 p-5 flex items-center gap-3">
               <FileText className="w-6 h-6 text-blue-600" />
               <h2 className="text-lg font-bold text-gray-900">Assessment Details</h2>
            </div>
            
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
               <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Duration</p>
                  <p className="text-[15px] font-bold text-gray-900">{contest.duration}</p>
               </div>
               <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5" /> Questions</p>
                  <p className="text-[15px] font-bold text-gray-900">{contest.questions}</p>
               </div>
               <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Total Marks</p>
                  <p className="text-[15px] font-bold text-gray-900">{(contest.questionList || []).reduce((acc, q) => acc + q.marks, 0)} Marks</p>
               </div>
               <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Type</p>
                  <p className="text-[15px] font-bold text-gray-900">{contest.type}</p>
               </div>
            </div>
         </div>

         <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-8">
            <div className="bg-red-50/50 border-b border-red-100 p-5 flex items-center gap-3">
               <AlertTriangle className="w-6 h-6 text-red-500" />
               <h2 className="text-lg font-bold text-gray-900">Important Instructions & Rules</h2>
            </div>
            
            <div className="p-6">
               <ul className="space-y-5 text-[14px] text-gray-700 font-medium leading-relaxed">
                  <li className="flex items-start gap-4">
                     <span className="w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 text-[13px] font-bold">1</span>
                     <p className="mt-0.5">This is a strictly monitored assessment. <strong className="text-red-600 font-bold">Navigating away from the test window, changing tabs, or opening other applications is strictly prohibited.</strong> Any attempt to switch tabs will be recorded as a violation.</p>
                  </li>
                  <li className="flex items-start gap-4">
                     <span className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center shrink-0 text-[13px] font-bold">2</span>
                     <p className="mt-0.5">Your screen, audio, and video may be recorded for proctoring purposes during the entire duration of the test. Ensure you are in a quiet environment.</p>
                  </li>
                  <li className="flex items-start gap-4">
                     <span className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center shrink-0 text-[13px] font-bold">3</span>
                     <p className="mt-0.5">The timer will start automatically once you click the 'Start Contest' button below and cannot be paused under any circumstances.</p>
                  </li>
                  {contest.customRules && (
                    <li className="flex items-start gap-4">
                       <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 text-[13px] font-bold">4</span>
                       <p className="mt-0.5 whitespace-pre-wrap"><strong className="text-blue-700">Faculty Rules:</strong> {contest.customRules}</p>
                    </li>
                  )}
               </ul>
            </div>
         </div>

         {contest.status === 'Live' ? (
           <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <label className="flex items-start gap-4 cursor-pointer group flex-1">
                 <div className="relative flex items-center justify-center mt-1 shrink-0">
                   <input 
                     type="checkbox" 
                     className="peer sr-only"
                     checked={agreed}
                     onChange={(e) => setAgreed(e.target.checked)}
                   />
                   <div className="w-6 h-6 border-2 border-gray-300 rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors"></div>
                   <Check className="w-4 h-4 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none stroke-[3]" />
                 </div>
                 <p className="text-[14px] text-gray-700 font-bold group-hover:text-gray-900 transition-colors leading-snug">
                   I have read all the instructions carefully and agree to abide by the rules. I understand that any violation will lead to immediate disqualification.
                 </p>
              </label>

              <button 
                onClick={handleStart}
                disabled={!agreed}
                className={`shrink-0 px-8 py-3.5 rounded-xl font-bold text-[15px] shadow-sm transition-all ${
                  agreed 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5 cursor-pointer' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                }`}
              >
                Submit & Start
              </button>
           </div>
         ) : contest.status === 'Upcoming' ? (
           <div className="bg-yellow-50 border border-yellow-200 rounded-2xl shadow-sm p-6 text-center text-yellow-800 font-bold">
             This contest will start on {contest.date} at {contest.time}. The "Start Contest" button will appear here once it is live.
           </div>
         ) : (
           <div className="flex justify-center">
             <button onClick={handleStart} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
               View Results & Submissions
             </button>
           </div>
         )}
      </div>
    </div>
  );
}
