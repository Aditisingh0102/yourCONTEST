import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, Send, Clock, CheckCircle, ShieldAlert, AlertCircle } from 'lucide-react';
import { getContests } from '../../api';
import { socket } from '../../socket';

export default function Arena() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [activeProblem, setActiveProblem] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isWaiting, setIsWaiting] = useState(true);

  const fetchContestData = async () => {
    try {
      const res = await getContests();
      const current = res.data.find(c => (c._id || c.id).toString() === id);
      if (current) {
        setContest(current);
        if (current.status === 'Live') {
          setIsWaiting(false);
          if (current.questionList && current.questionList.length > 0 && !activeProblem) {
            setActiveProblem(current.questionList[0]);
          }
        } else {
          setIsWaiting(true);
        }
      }
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchContestData();
    socket.on('CONTEST_UPDATED', fetchContestData);
    return () => socket.off('CONTEST_UPDATED');
  }, [id]);

  useEffect(() => {
    if (!contest || contest.status !== 'Upcoming') return;
    
    const interval = setInterval(() => {
      const start = new Date(contest.startTime).getTime();
      const now = new Date().getTime();
      const diff = start - now;
      
      if (diff <= 0) {
        setTimeRemaining('00:00:00');
        // Once time hits zero, it could automatically turn live if faculty didn't
        setIsWaiting(false);
        clearInterval(interval);
      } else {
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [contest]);

  const handleAnswerChange = (qId, val) => {
    setAnswers({ ...answers, [qId]: val });
  };

  const submitContest = () => {
    alert('Contest Submitted Successfully!');
    navigate('/student/dashboard');
  };

  if (!contest) return <div className="fixed inset-0 bg-[#0f172a] text-white flex items-center justify-center">Loading Arena...</div>;

  if (isWaiting) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex flex-col font-sans">
        <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6 shrink-0 shadow-sm">
           <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-2 font-medium">
             <ChevronLeft className="w-5 h-5" /> Back to Dashboard
           </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
           <div className="bg-white max-w-2xl w-full rounded-2xl shadow-xl border border-gray-100 p-10 text-center">
              <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-pulse">
                <Clock className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">{contest.title}</h1>
              <p className="text-gray-500 font-medium mb-8">This contest hasn't started yet. Please wait in the arena.</p>
              
              <div className="bg-gray-900 text-white rounded-xl p-6 mb-8 inline-block min-w-[300px]">
                 <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-2">Starts In</p>
                 <div className="text-5xl font-mono font-bold tracking-tight text-orange-400">{timeRemaining || "Loading..."}</div>
              </div>
              
              <div className="text-left bg-blue-50 border border-blue-100 rounded-xl p-6">
                <h3 className="font-bold text-blue-900 flex items-center gap-2 mb-4">
                  <ShieldAlert className="w-5 h-5 text-blue-600" /> Rules and Regulations
                </h3>
                <ul className="space-y-3 text-sm text-blue-800">
                  <li className="flex gap-2"><span className="text-blue-400 font-bold">•</span> Questions will be visible exactly at the start time.</li>
                  <li className="flex gap-2"><span className="text-blue-400 font-bold">•</span> Do not refresh the page during the contest.</li>
                  <li className="flex gap-2"><span className="text-blue-400 font-bold">•</span> Tab switching is strictly prohibited and will be logged.</li>
                  <li className="flex gap-2"><span className="text-blue-400 font-bold">•</span> Ensure stable internet connection before time begins.</li>
                </ul>
              </div>
           </div>
        </div>
      </div>
    );
  }

  const questions = contest.questionList || [];

  return (
    <div className="fixed inset-0 bg-[#0f172a] text-gray-300 z-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <div className="h-14 bg-[#1e293b] border-b border-gray-700 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-white tracking-wide">{contest.title}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-orange-400 font-mono bg-gray-800 px-3 py-1.5 rounded-lg">
            <Clock className="w-4 h-4" />
            <span>{contest.duration}</span>
          </div>
          <button onClick={submitContest} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded-lg font-medium transition-colors text-sm">
            <Send className="w-4 h-4" />
            Submit Contest
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Problems List */}
        <div className="w-64 bg-[#1e293b] border-r border-gray-700 flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-700 font-semibold text-gray-400 uppercase text-xs tracking-wider shrink-0 flex justify-between items-center">
            <span>Questions</span>
            <span className="bg-gray-800 px-2 py-0.5 rounded-full">{questions.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {questions.length === 0 ? (
              <div className="p-4 text-sm text-gray-500 text-center">No questions added yet.</div>
            ) : (
              questions.map((prob, idx) => (
                <button 
                  key={prob.id}
                  onClick={() => setActiveProblem(prob)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-700/50 hover:bg-gray-800 transition-colors flex items-center justify-between ${activeProblem?.id === prob.id ? 'bg-gray-800 border-l-2 border-l-blue-500' : ''}`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-200">
                      Q{idx + 1}. {prob.type === 'MCQ' ? 'Multiple Choice' : 'Coding'}
                    </span>
                    <span className="text-xs text-gray-500 mt-0.5">{prob.marks} Marks</span>
                  </div>
                  {answers[prob.id] && <CheckCircle className="w-4 h-4 text-green-500" />}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Center/Right Panel - Question Viewer */}
        {activeProblem ? (
          activeProblem.type === 'MCQ' ? (
            <div className="flex-1 bg-[#0f172a] p-8 overflow-y-auto">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">MCQ</span>
                  <span className="text-gray-400 text-sm font-medium">{activeProblem.marks} Marks</span>
                </div>
                
                <h2 className="text-xl font-medium text-white mb-8 leading-relaxed">
                  {activeProblem.question}
                </h2>

                <div className="space-y-3">
                  {activeProblem.options.map((opt, idx) => (
                    <label 
                      key={idx} 
                      className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                        answers[activeProblem.id] === idx 
                          ? 'bg-blue-900/30 border-blue-500/50' 
                          : 'bg-[#1e293b] border-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          answers[activeProblem.id] === idx ? 'border-blue-500' : 'border-gray-500'
                        }`}>
                          {answers[activeProblem.id] === idx && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>}
                        </div>
                        <span className="text-gray-200 text-[15px]">{opt}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Coding Question Viewer */}
              <div className="flex-1 bg-[#0f172a] border-r border-gray-700 overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-white">{activeProblem.title}</h1>
                  <span className="px-3 py-1 bg-purple-900/40 text-purple-400 border border-purple-700/50 rounded-full text-xs font-bold tracking-wide">
                    {activeProblem.marks} Marks
                  </span>
                </div>
                <div className="prose prose-invert max-w-none text-gray-300">
                  <p className="whitespace-pre-wrap">{activeProblem.problemStatement}</p>
                  
                  <h3 className="text-lg font-bold text-white mt-8 mb-2">Input Format</h3>
                  <p className="whitespace-pre-wrap">{activeProblem.inputFormat}</p>
                  
                  <h3 className="text-lg font-bold text-white mt-6 mb-2">Output Format</h3>
                  <p className="whitespace-pre-wrap">{activeProblem.outputFormat}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <div>
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Sample Input</h4>
                      <pre className="bg-gray-800 p-4 rounded-lg text-sm text-gray-200 overflow-x-auto m-0"><code>{activeProblem.sampleInput}</code></pre>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Sample Output</h4>
                      <pre className="bg-gray-800 p-4 rounded-lg text-sm text-gray-200 overflow-x-auto m-0"><code>{activeProblem.sampleOutput}</code></pre>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel - Code Editor */}
              <div className="w-1/2 flex flex-col bg-[#1e293b] shrink-0">
                <div className="h-10 bg-[#0f172a] border-b border-gray-700 flex items-center px-4 justify-between shrink-0">
                  <select className="bg-gray-800 text-sm text-gray-300 border-none outline-none rounded px-2 py-1 focus:ring-1 focus:ring-blue-500">
                    <option>C++</option>
                    <option>Java</option>
                    <option>Python 3</option>
                    <option>JavaScript</option>
                  </select>
                </div>
                <div className="flex-1 p-4 font-mono text-[13px] overflow-y-auto leading-relaxed outline-none">
                  <textarea 
                    className="w-full h-full bg-transparent text-blue-100 resize-none outline-none focus:ring-0 placeholder-gray-600"
                    placeholder="// Write your solution here..."
                    value={answers[activeProblem.id] || ''}
                    onChange={(e) => handleAnswerChange(activeProblem.id, e.target.value)}
                    spellCheck="false"
                  ></textarea>
                </div>
                <div className="h-14 border-t border-gray-700 bg-[#0f172a] flex items-center justify-end px-4 gap-3 shrink-0">
                   <button className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                      <Play className="w-4 h-4" /> Run Code
                   </button>
                   <button 
                     onClick={() => handleAnswerChange(activeProblem.id, (answers[activeProblem.id] || ' ') + ' ')} 
                     className="px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors"
                   >
                      Submit Solution
                   </button>
                </div>
              </div>
            </>
          )
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            No questions available for this contest.
          </div>
        )}
      </div>
    </div>
  );
}
