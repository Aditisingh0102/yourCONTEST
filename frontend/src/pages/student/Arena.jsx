import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, Send, Clock, CheckCircle, ShieldAlert, AlertCircle, BookOpen } from 'lucide-react';
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
  const [error, setError] = useState(null);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [rulesChecked, setRulesChecked] = useState(false);
  const [violations, setViolations] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const isViolatingRef = React.useRef(false);

  const fetchContestData = async () => {
    try {
      const res = await getContests();
      const current = res.data.find(c => (c._id || c.id).toString() === id);
      if (current) {
        setContest(current);
        if (current.status === 'Live') {
          setIsWaiting(false);
        } else {
          setIsWaiting(true);
        }
      } else {
        setError("Contest not found. It might have been removed or the server restarted.");
      }
    } catch(err) {
      console.error(err);
      setError("Failed to load contest data. Please check your connection.");
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
      let start = 0;
      if (contest.startTime && contest.startTime.includes(',')) {
          const parts = contest.startTime.split(', ');
          if(parts.length === 2) {
             start = new Date(`${parts[0]}T${parts[1]}:00`).getTime();
          }
      } else if (contest.date && contest.time) {
          start = new Date(`${contest.date}T${contest.time}:00`).getTime();
      } else {
          start = new Date(contest.startTime).getTime();
      }

      const now = new Date().getTime();
      const diff = start - now;
      
      if (diff <= 0 || isNaN(diff)) {
        setTimeRemaining('00:00:00');
        if(!isNaN(diff)) setIsWaiting(false);
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

  const questions = contest?.questionList || [];

  useEffect(() => {
    if (!isWaiting && hasAgreed && questions.length > 0 && !activeProblem) {
      setActiveProblem(questions[0]);
    }
  }, [isWaiting, hasAgreed, questions, activeProblem]);

  useEffect(() => {
    if (isWaiting || !hasAgreed) return;
    if (contest && contest.strictFullscreen === false) return;

    const handleViolation = () => {
      if (isViolatingRef.current) return;
      isViolatingRef.current = true;

      setViolations(prev => {
        const newCount = prev + 1;
        if (newCount > 1) { 
          if (document.fullscreenElement) {
             document.exitFullscreen().catch(() => {});
          }
          alert("Contest auto-submitted due to rule violations (tab switching or exiting fullscreen).");
          navigate('/student/dashboard');
        } else {
          setShowWarning(true);
        }
        return newCount;
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') handleViolation();
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) handleViolation();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isWaiting, hasAgreed, navigate, contest]);

  useEffect(() => {
    if (contest && contest.disableCopyPaste !== false && !isWaiting && hasAgreed) {
      const handleCopyPaste = (e) => {
        e.preventDefault();
        alert("Copying and pasting is strictly disabled during this assessment.");
      };
      
      document.addEventListener('copy', handleCopyPaste);
      document.addEventListener('paste', handleCopyPaste);
      document.addEventListener('cut', handleCopyPaste);
      
      return () => {
        document.removeEventListener('copy', handleCopyPaste);
        document.removeEventListener('paste', handleCopyPaste);
        document.removeEventListener('cut', handleCopyPaste);
      };
    }
  }, [contest, isWaiting, hasAgreed]);

  const handleStartAssessment = () => {
    if (contest && contest.strictFullscreen === false) {
      setHasAgreed(true);
      return;
    }
    
    document.documentElement.requestFullscreen().then(() => {
      setHasAgreed(true);
    }).catch(err => {
      alert("Fullscreen mode is required to start the contest. Please allow fullscreen.");
    });
  };

  const handleAnswerChange = (qId, val) => {
    setAnswers({ ...answers, [qId]: val });
  };

  const submitContest = () => {
    if (document.fullscreenElement) {
       document.exitFullscreen().catch(() => {});
    }
    alert('Contest Submitted Successfully!');
    navigate('/student/dashboard');
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-[#0f172a] flex flex-col items-center justify-center font-sans z-50">
        <div className="bg-[#1e293b] p-10 rounded-3xl shadow-2xl border border-slate-700/50 text-center max-w-md w-full mx-4">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-red-500 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Oops!</h2>
          <p className="text-slate-400 font-medium mb-8 leading-relaxed">{error}</p>
          <button onClick={() => navigate('/student/contests')} className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-900/20">
             Go Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="fixed inset-0 bg-[#0f172a] flex flex-col items-center justify-center font-sans z-50">
         <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mb-6"></div>
         <p className="text-slate-400 font-bold tracking-widest uppercase">Loading Arena...</p>
      </div>
    );
  }

  if (isWaiting || !hasAgreed) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex flex-col font-sans">
        <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6 shrink-0 shadow-sm">
           <button onClick={() => navigate('/student/contests')} className="text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-2 font-medium">
             <ChevronLeft className="w-5 h-5" /> Back to Dashboard
           </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
           <div className="bg-white max-w-3xl w-full rounded-2xl shadow-xl border border-gray-100 p-8">
              <h1 className="text-2xl font-black text-gray-900 mb-6 border-b pb-4">Rules & Regulations</h1>
              
              <div className="space-y-4 text-gray-600 text-sm mb-8">
                <p className="flex gap-3"><span className="text-blue-600 font-bold">1.</span> <span>Do not switch tabs or minimize the browser window during the assessment. Doing so may result in automatic submission.</span></p>
                <p className="flex gap-3"><span className="text-blue-600 font-bold">2.</span> <span>Ensure you have a stable internet connection before starting the contest.</span></p>
                <p className="flex gap-3"><span className="text-blue-600 font-bold">3.</span> <span>For coding questions, write your solution in the provided editor and verify with Sample Test Cases before submitting.</span></p>
                <p className="flex gap-3"><span className="text-blue-600 font-bold">4.</span> <span>The timer will start automatically once you enter the Arena. The test will auto-submit when the time is up.</span></p>
                <p className="flex gap-3"><span className="text-blue-600 font-bold">5.</span> <span>Any malpractice or copying will lead to immediate disqualification.</span></p>
              </div>

              {isWaiting ? (
                <div className="bg-gray-900 text-white rounded-xl p-8 text-center mt-8">
                   <div className="w-16 h-16 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                     <Clock className="w-8 h-8" />
                   </div>
                   <h2 className="text-xl font-bold mb-2">Assessment Starts In</h2>
                   <div className="text-5xl font-mono font-bold tracking-tight text-orange-400">{timeRemaining || "Loading..."}</div>
                </div>
              ) : (
                <div className="mt-8 bg-blue-50 border border-blue-100 p-6 rounded-xl">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={rulesChecked}
                      onChange={(e) => setRulesChecked(e.target.checked)}
                    />
                    <span className="text-gray-700 font-medium text-sm">
                      I have read all the rules and regulations. I understand that any violation will lead to disqualification. I am ready to begin the assessment.
                    </span>
                  </label>
                  
                  <button 
                    disabled={!rulesChecked}
                    onClick={handleStartAssessment}
                    className={`mt-6 w-full py-3.5 rounded-xl font-bold text-white transition-all ${
                      rulesChecked 
                        ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30' 
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    Start Assessment Now
                  </button>
                </div>
              )}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0f172a] text-gray-300 z-50 flex flex-col font-sans">
      {showWarning && (
        <div className="fixed inset-0 bg-red-900/95 z-[9999] flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-black/80 border border-red-500/30 p-10 rounded-2xl max-w-lg text-center shadow-2xl shadow-red-900/50">
            <ShieldAlert className="w-20 h-20 text-red-500 mx-auto mb-6 animate-pulse" />
            <h1 className="text-3xl font-black text-white mb-4 tracking-tight">Violation Detected!</h1>
            <p className="text-red-200 text-lg mb-2">You have exited fullscreen or switched tabs.</p>
            <p className="text-red-400 font-bold mb-8">Warning 1 of 1. If this happens again, your test will be automatically submitted.</p>
            <button 
              onClick={() => {
                document.documentElement.requestFullscreen().then(() => {
                  setShowWarning(false);
                  setTimeout(() => { isViolatingRef.current = false; }, 500);
                }).catch(() => alert("Fullscreen required!"));
              }}
              className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-900/50 transition-all active:scale-95"
            >
              Return to Fullscreen & Continue
            </button>
          </div>
        </div>
      )}
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
                      Q{idx + 1}. {prob.type === 'MCQ' ? 'Multiple Choice' : prob.type === 'Theory' ? 'Theory Q&A' : 'Coding'}
                    </span>
                    <span className="text-xs text-gray-500 mt-0.5 truncate max-w-[180px]">
                      {prob.type === 'Coding' ? prob.title : prob.question?.slice(0, 40)}{prob.type !== 'Coding' && prob.question?.length > 40 ? '…' : ''}
                    </span>
                    <span className="text-xs text-gray-600 mt-0.5">{prob.marks} Marks</span>
                  </div>
                  {answers[prob.id] && <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
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
                      onClick={() => handleAnswerChange(activeProblem.id, idx)}
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
          ) : activeProblem.type === 'Theory' ? (
            <div className="flex-1 bg-[#0f172a] p-8 overflow-y-auto">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3" /> Theory
                  </span>
                  <span className="text-gray-400 text-sm font-medium">{activeProblem.marks} Marks</span>
                </div>

                <h2 className="text-xl font-medium text-white mb-8 leading-relaxed">
                  {activeProblem.question}
                </h2>

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Your Answer</label>
                  <textarea
                    className="w-full min-h-[240px] bg-[#1e293b] border border-gray-700 focus:border-amber-500 rounded-xl p-4 text-gray-200 text-sm resize-y outline-none transition-colors placeholder-gray-600 leading-relaxed"
                    placeholder="Write your answer here..."
                    value={answers[activeProblem.id] || ''}
                    onChange={(e) => handleAnswerChange(activeProblem.id, e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-2">Write a clear and complete answer. Your response will be evaluated by the faculty.</p>
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
