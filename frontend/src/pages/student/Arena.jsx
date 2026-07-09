import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Sun, Moon, Coffee, Play, Send, Clock, CheckCircle, ShieldAlert, AlertCircle, BookOpen, Loader2, Terminal, List } from 'lucide-react';
import { getContests, getSubmissions, updateSubmission, submitContestAnswers } from '../../api';
import { socket } from '../../socket';
import Leaderboard from '../../components/Leaderboard';
import { useTheme } from '../../hooks/useTheme';
import Editor from '@monaco-editor/react';

export default function Arena() {
  const [theme, cycleTheme] = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [activeProblem, setActiveProblem] = useState(null);
  const [codingLanguages, setCodingLanguages] = useState({});
  const activeLanguage = codingLanguages[activeProblem?.id] || '71'; // 71 = Python 3
  const [submissionStatus, setSubmissionStatus] = useState('idle'); // 'idle' | 'evaluating' | 'submitting'
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [showProblemList, setShowProblemList] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);

  const getMonacoLanguage = (id) => {
    switch(id) {
      case '54': return 'cpp';
      case '62': return 'java';
      case '71': return 'python';
      case '63': return 'javascript';
      default: return 'javascript';
    }
  };
  const [answers, setAnswers] = useState({});
  const [extraTime, setExtraTime] = useState(0);
  const [existingSubmissionId, setExistingSubmissionId] = useState(null);
  const answersRef = React.useRef(answers);
  const codingLanguagesRef = React.useRef(codingLanguages);

  useEffect(() => {
    if (!sessionStorage.getItem('student_profile')) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const [timeRemaining, setTimeRemaining] = useState('');
  const [assessmentTimeRemaining, setAssessmentTimeRemaining] = useState('');
  const [isWaiting, setIsWaiting] = useState(true);
  const [error, setError] = useState(null);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [rulesChecked, setRulesChecked] = useState(false);
  const [violations, setViolations] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const isViolatingRef = React.useRef(false);
  const graceTimerRef = React.useRef(null);

  const fetchContestData = async () => {
    try {
      const res = await getContests();
      const current = res.data.find(c => (c._id || c.id).toString() === id);

      const subsRes = await getSubmissions();
      const profileStr = sessionStorage.getItem('student_profile');
      if (!profileStr) return; // Prevent execution if not logged in (will be redirected)
      const studentProfile = JSON.parse(profileStr);
      const existingSub = subsRes.data.find(sub => {
        if (sub.contestId !== id) return false;
        if (sub.studentId && studentProfile.id) {
          return sub.studentId === studentProfile.id;
        }
        return sub.studentName === studentProfile.name;
      });

      if (existingSub) {
        if (existingSub.status === 'reopened' || existingSub.status === 'in_progress') {
          setAnswers(existingSub.answers || {});
          answersRef.current = existingSub.answers || {};
          setExtraTime(existingSub.extraTime || 0);
          setExistingSubmissionId(existingSub._id);
        } else {
          setError("You have already submitted this assessment. You cannot retake it.");
          return;
        }
      }

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
    } catch (err) {
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
        if (parts.length === 2) {
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
        if (!isNaN(diff)) setIsWaiting(false);
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
  const currentIndex = activeProblem ? questions.findIndex(q => q.id === activeProblem.id) : -1;

  useEffect(() => {
    if (!isWaiting && hasAgreed && questions.length > 0 && !activeProblem) {
      setActiveProblem(questions[0]);
    }
  }, [isWaiting, hasAgreed, questions, activeProblem]);

  useEffect(() => {
    if (isWaiting || !hasAgreed) return;
    if (contest && contest.strictFullscreen === false) return;

    const warningLimit = contest?.warningLimit !== undefined ? parseInt(contest.warningLimit) : 1;
    const gracePeriodMs = (contest?.windowSwitchGracePeriod !== undefined ? parseInt(contest.windowSwitchGracePeriod) : 0) * 1000;

    const triggerViolation = () => {
      if (isViolatingRef.current) return;
      isViolatingRef.current = true;

      setViolations(prev => {
        const newCount = prev + 1;
        if (newCount > warningLimit) {
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => { });
          }
          performSubmission();
        } else {
          setShowWarning(true);
        }
        return newCount;
      });
    };

    const handleViolationStart = () => {
      if (isViolatingRef.current) return;
      if (gracePeriodMs > 0) {
        if (!graceTimerRef.current) {
          graceTimerRef.current = setTimeout(() => {
            triggerViolation();
          }, gracePeriodMs);
        }
      } else {
        triggerViolation();
      }
    };

    const handleViolationEnd = () => {
      if (graceTimerRef.current && !isViolatingRef.current) {
        clearTimeout(graceTimerRef.current);
        graceTimerRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleViolationStart();
      } else {
        handleViolationEnd();
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        handleViolationStart();
      } else {
        handleViolationEnd();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
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

  useEffect(() => {
    if (!contest || !hasAgreed) return;

    const storageKey = `contest_${contest.id || contest._id}_startTime`;
    const extraStorageKey = `contest_${contest.id || contest._id}_extraStartTime`;

    let studentStartTime = sessionStorage.getItem(storageKey);
    let extraStartTime = sessionStorage.getItem(extraStorageKey);

    if (!studentStartTime) {
      studentStartTime = Date.now().toString();
      sessionStorage.setItem(storageKey, studentStartTime);
    }

    studentStartTime = parseInt(studentStartTime, 10);

    let start = 0;
    if (contest.startTime && contest.startTime.includes(',')) {
      const parts = contest.startTime.split(', ');
      if (parts.length === 2) {
        start = new Date(`${parts[0]}T${parts[1]}:00`).getTime();
      }
    } else if (contest.date && contest.time) {
      start = new Date(`${contest.date}T${contest.time}:00`).getTime();
    } else {
      start = new Date(contest.startTime).getTime();
    }

    const durationMatch = contest.duration?.match(/(\d+)/);
    const durationMins = durationMatch ? parseInt(durationMatch[1], 10) : 60;
    const durationMs = durationMins * 60 * 1000;

    const absoluteEndTime = (start && !isNaN(start)) ? start + durationMs : studentStartTime + durationMs;
    const normalEndTime = studentStartTime + durationMs;

    let endTime = Math.min(normalEndTime, absoluteEndTime);

    if (extraTime > 0) {
      if (!extraStartTime) {
        extraStartTime = Date.now().toString();
        sessionStorage.setItem(extraStorageKey, extraStartTime);
      }
      endTime = parseInt(extraStartTime, 10) + (extraTime * 60 * 1000);
    }

    const interval = setInterval(() => {
      const diff = endTime - Date.now();

      if (diff <= 0) {
        clearInterval(interval);
        setAssessmentTimeRemaining('00:00:00');

        performSubmission();
      } else {
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setAssessmentTimeRemaining(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [contest, hasAgreed, navigate]);

  const handleStartAssessment = () => {
    const start = async () => {
      setHasAgreed(true);
      try {
        const profileStr = sessionStorage.getItem('student_profile');
        if (profileStr && !existingSubmissionId) {
          const studentProfile = JSON.parse(profileStr);
          const payload = {
            contestId: contest?._id || contest?.id,
            contestName: contest?.title || contest?.name,
            studentId: studentProfile.id,
            studentName: studentProfile.name,
            batch: studentProfile.batch,
            answers: {},
            score: 0,
            status: 'in_progress',
            startedAt: new Date().toISOString(),
            submittedAt: new Date().toISOString()
          };
          const res = await submitContestAnswers(payload);
          if (res && res.data && res.data._id) {
            setExistingSubmissionId(res.data._id);
          }
        }
      } catch (err) {
        console.error("Failed to mark contest as started:", err);
      }
    };

    if (contest && contest.strictFullscreen === false) {
      start();
      return;
    }

    document.documentElement.requestFullscreen().then(() => {
      start();
    }).catch(err => {
      alert("Fullscreen mode is required to start the contest. Please allow fullscreen.");
    });
  };

  const handleAnswerChange = async (qId, val) => {
    const newAnswers = { ...answers, [qId]: val };
    setAnswers(newAnswers);

    if (existingSubmissionId) {
      try {
        await updateSubmission(existingSubmissionId, {
          answers: newAnswers
        });
      } catch (err) {
        console.error("Live update failed", err);
      }
    }
  };

  const performSubmission = async () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => { });
    }
    
    setSubmissionStatus('evaluating');

    let score = 0;
    const questions = contest?.questionList || [];
    
    questions.forEach(q => {
      if (q.type === 'MCQ' && answersRef.current[q.id] === q.correctOption) {
        score += q.marks || 1;
      }
    });

    const codingQuestions = questions.filter(q => q.type === 'Coding');
    for (const q of codingQuestions) {
      const rawSource = answersRef.current[q.id];
      if (!rawSource || rawSource.trim() === "") continue;
      
      const langId = codingLanguagesRef.current[q.id] || '71';
      const testCases = q.testCases?.length > 0 ? q.testCases : (q.sampleInput ? [{input: q.sampleInput, output: q.sampleOutput}] : []);
      
      let passedAll = true;
      for (const tc of testCases) {
        try {
          const sourceCode = wrapCodeForExecution(rawSource, langId, tc.input);
          const response = await fetch("https://ce.judge0.com/submissions?base64_encoded=false&wait=true", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({
              source_code: sourceCode,
              language_id: parseInt(langId),
              stdin: tc.input
            })
          });
          const data = await response.json();
          if (data.status?.id === 3) {
             const actualOutput = (data.stdout || "").trim();
             const expectedOutput = (tc.output || "").trim();
             if (actualOutput !== expectedOutput) {
                passedAll = false;
                break;
             }
          } else {
             passedAll = false;
             break;
          }
        } catch (e) {
          console.error("Evaluation failed", e);
          passedAll = false;
          break;
        }
      }
      if (passedAll) {
        score += parseInt(q.marks || 10, 10);
      }
    }
    
    setSubmissionStatus('submitting');

    try {
      const profileStr = sessionStorage.getItem('student_profile');
      if (!profileStr) return;
      const studentProfile = JSON.parse(profileStr);
      if (existingSubmissionId) {
        await updateSubmission(existingSubmissionId, {
          answers: answersRef.current,
          score: score,
          status: 'submitted',
          submittedAt: new Date().toISOString()
        });
      } else {
        const payload = {
          contestId: contest?._id || contest?.id,
          contestName: contest?.title || contest?.name,
          studentId: studentProfile.id,
          studentName: studentProfile.name,
          batch: studentProfile.batch,
          answers: answersRef.current,
          score: score,
          status: 'submitted',
          submittedAt: new Date().toISOString()
        };
        await submitContestAnswers(payload);
      }
    } catch (err) {
      console.error("Failed to save submission:", err);
    }

    const storageKey = `contest_${contest?.id || contest?._id}_startTime`;
    const extraStorageKey = `contest_${contest?.id || contest?._id}_extraStartTime`;
    sessionStorage.removeItem(storageKey);
    sessionStorage.removeItem(extraStorageKey);
    setSubmittedResult({ score, total: questions.length });
    setSubmissionStatus('idle');
  };

  const submitContest = async () => {
    await performSubmission();
  };

  const formatJavaLiteral = (val, type) => {
    if (val.startsWith('[')) {
        const items = val.replace('[', '{').replace(']', '}');
        if (type.includes('int[]')) return `new int[] ${items}`;
        if (type.includes('String[]')) return `new String[] ${items}`;
        return `new int[] ${items}`;
    }
    return val;
  };

  const wrapCodeForExecution = (userCode, langId, stdin) => {
    try {
      const rawValues = (stdin || "").match(/\[.*?\]|-?\d+|".*?"/g) || [];

      // Java
      if (langId === '62' && userCode.includes('class Solution')) {
        if (userCode.includes('public static void main')) return userCode;
        
        const methodMatch = userCode.match(/public\s+([a-zA-Z0-9_\[\]<>]+)\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
        if (!methodMatch) return userCode;
        
        const returnType = methodMatch[1].trim();
        const methodName = methodMatch[2].trim();
        const paramList = methodMatch[3].split(',').map(p => p.trim());
        const paramTypes = paramList.map(p => p.split(/\s+/)[0]);
        
        let invocationArgs = [];
        for (let i = 0; i < paramTypes.length; i++) {
            const val = rawValues[i] || 'null';
            invocationArgs.push(formatJavaLiteral(val, paramTypes[i]));
        }
        
        let printStatement = `System.out.println(result);`;
        if (returnType === "int[]" || returnType === "String[]") {
            printStatement = `System.out.println(java.util.Arrays.toString(result));`;
        }
        
        const driverCode = `
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        ${returnType !== 'void' ? `${returnType} result = ` : ''}sol.${methodName}(${invocationArgs.join(', ')});
        ${returnType !== 'void' ? printStatement : ''}
    }
}`;
        return userCode + "\n" + driverCode;
      }
      
      // Python 3
      if (langId === '71' && userCode.includes('class Solution')) {
        if (userCode.includes('if __name__')) return userCode;
        const pyMatch = userCode.match(/def\s+([a-zA-Z0-9_]+)\s*\(/);
        if (!pyMatch) return userCode;
        const methodName = pyMatch[1];
        const driverCode = `\nif __name__ == '__main__':\n    sol = Solution()\n    print(sol.${methodName}(${rawValues.join(', ')}))`;
        return userCode + "\n" + driverCode;
      }
      
      // JavaScript
      if (langId === '63' && (userCode.includes('var ') || userCode.includes('let ') || userCode.includes('const ') || userCode.includes('function '))) {
         if (userCode.includes('console.log(')) return userCode; // user already wrote testing code
         const funcMatch = userCode.match(/(?:var|let|const|function)\s+([a-zA-Z0-9_]+)\s*=?\s*(?:function)?\s*\(/);
         if (funcMatch) {
             const driverCode = `\nconsole.log(JSON.stringify(${funcMatch[1]}(${rawValues.join(', ')})));`;
             return userCode + "\n" + driverCode;
         }
      }
      
    } catch (e) {
      console.warn("Failed to generate driver code:", e);
    }
    return userCode;
  };

  const executeCode = async () => {
    if (!answers[activeProblem.id]?.trim()) {
      alert("Please write some code before running.");
      return;
    }
    
    setIsExecuting(true);
    setExecutionResult({ isRunning: true });
    
    try {
      const rawSource = answers[activeProblem.id];
      const stdin = activeProblem.sampleInput || (activeProblem.testCases && activeProblem.testCases.length > 0 ? activeProblem.testCases[0].input : "");
      const sourceCode = wrapCodeForExecution(rawSource, activeLanguage, stdin);
      
      const response = await fetch("https://ce.judge0.com/submissions?base64_encoded=false&wait=true", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          source_code: sourceCode,
          language_id: parseInt(activeLanguage),
          stdin: stdin
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to execute code (${response.status}). Judge0 API might be down or rate-limited.`);
      }
      
      const data = await response.json();
      setExecutionResult(data);
    } catch (err) {
      console.error(err);
      setExecutionResult({ error: err.message });
    } finally {
      setIsExecuting(false);
    }
  };

  if (submittedResult) {
    const studentProfile = JSON.parse(sessionStorage.getItem('student_profile') || '{}');
    return (
      <div className="fixed inset-0 bg-slate-50 flex flex-col font-sans z-50 overflow-y-auto p-6 md:p-10">
        <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start mt-10">

          {/* Left Panel: Personal Result */}
          <div className="bg-white glass-card p-10 rounded-3xl shadow-2xl border border-gray-200 text-center w-full">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Assessment Submitted</h2>
            <p className="text-gray-500 font-medium mb-6 leading-relaxed">You have successfully submitted the assessment. Your answers have been recorded.</p>

            <div className="bg-gray-100/50 border border-gray-200 rounded-2xl p-6 mb-8">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Score</p>
              <p className="text-4xl font-semibold text-gray-900">{submittedResult.score} <span className="text-xl text-gray-500">/ {submittedResult.total}</span></p>
              <p className="text-xs text-gray-500 mt-3">Detailed reports will be available once the contest completely ends for all participants.</p>
            </div>

            <button onClick={() => navigate('/student/dashboard')} className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-900/20">
              Return to Dashboard
            </button>
          </div>

          {/* Right Panel: Live Leaderboard */}
          <div className="h-[600px] flex flex-col bg-white glass-card rounded-3xl shadow-2xl border border-gray-200 overflow-hidden dark">
            <Leaderboard contestId={contest?._id || contest?.id} batch={studentProfile.batch} />
          </div>

        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center font-sans z-50">
        <div className="bg-white glass-card p-10 rounded-3xl shadow-2xl border border-gray-200 text-center max-w-md w-full mx-4">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-red-500 animate-pulse" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Oops!</h2>
          <p className="text-gray-500 font-medium mb-8 leading-relaxed">{error}</p>
          <button onClick={() => navigate('/student/contests')} className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-900/20">
            Go Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center font-sans z-50">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mb-6"></div>
        <p className="text-gray-500 font-semibold tracking-widest uppercase">Loading Arena...</p>
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
            <h1 className="text-2xl font-semibold text-gray-900 mb-6 border-b pb-4">Rules & Regulations</h1>

            <div className="space-y-4 text-gray-600 text-sm mb-8">
              <p className="flex gap-3"><span className="text-blue-600 font-semibold">1.</span> <span>Do not exit fullscreen mode (e.g., by pressing Esc), switch tabs, or minimize the browser window. Doing so will trigger a warning or automatic submission.</span></p>
              <p className="flex gap-3"><span className="text-blue-600 font-semibold">2.</span> <span>Ensure you have a stable internet connection before starting the contest.</span></p>
              <p className="flex gap-3"><span className="text-blue-600 font-semibold">3.</span> <span>For coding questions, write your solution in the provided editor and verify with Sample Test Cases before submitting.</span></p>
              <p className="flex gap-3"><span className="text-blue-600 font-semibold">4.</span> <span>The timer will start automatically once you enter the Arena. The test will auto-submit when the time is up.</span></p>
              <p className="flex gap-3"><span className="text-blue-600 font-semibold">5.</span> <span>Any malpractice or copying will lead to immediate disqualification.</span></p>
              {contest?.customRules && (Array.isArray(contest.customRules) ? contest.customRules : [contest.customRules]).map((rule, idx) => rule.trim() !== '' && (
                <p key={idx} className="flex gap-3"><span className="text-blue-600 font-semibold">{6 + idx}.</span> <span className="whitespace-pre-wrap"><strong className="text-blue-700">Faculty Instructions: </strong>{rule}</span></p>
              ))}
            </div>

            {isWaiting ? (
              <div className="bg-gray-50 text-gray-900 rounded-xl p-8 text-center mt-8">
                <div className="w-16 h-16 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Clock className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Assessment Starts In</h2>
                <div className="text-5xl font-mono font-semibold tracking-tight text-orange-400">{timeRemaining || "Loading..."}</div>
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
                  className={`mt-6 w-full py-3.5 rounded-xl font-semibold text-gray-900 transition-all ${rulesChecked
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30'
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
    <div className="fixed inset-0 bg-slate-50 text-gray-800 z-50 flex flex-col font-sans">
      {submissionStatus !== 'idle' && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center">
             <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
             <h2 className="text-xl font-bold text-gray-900 mb-2">
               {submissionStatus === 'evaluating' ? "Evaluating Code..." : "Submitting Contest..."}
             </h2>
             <p className="text-gray-500 text-sm">
               {submissionStatus === 'evaluating' ? "Running your code against hidden test cases. Please wait." : "Saving your results..."}
             </p>
          </div>
        </div>
      )}
      {showWarning && (
        <div className="fixed inset-0 bg-red-900/95 z-[9999] flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-black/80 border border-red-500/30 p-10 rounded-2xl max-w-lg text-center shadow-2xl shadow-red-900/50">
            <ShieldAlert className="w-20 h-20 text-red-500 mx-auto mb-6 animate-pulse" />
            <h1 className="text-3xl font-semibold text-gray-900 mb-4 tracking-tight">Violation Detected!</h1>
            <p className="text-red-200 text-lg mb-2">You have exited fullscreen or switched tabs.</p>
            <p className="text-red-400 font-semibold mb-8">
              Warning {violations} of {contest?.warningLimit !== undefined ? contest.warningLimit : 1}. If you exceed the limit, your test will be automatically submitted.
            </p>
            <button
              onClick={() => {
                document.documentElement.requestFullscreen().then(() => {
                  setShowWarning(false);
                  setTimeout(() => { isViolatingRef.current = false; }, 500);
                }).catch(() => alert("Fullscreen required!"));
              }}
              className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl shadow-lg shadow-red-900/50 transition-all active:scale-95"
            >
              Return to Fullscreen & Continue
            </button>
          </div>
        </div>
      )}
      {/* Top Navbar */}
      <div className="h-14 bg-white glass-card border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowProblemList(!showProblemList)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            <List className="w-4 h-4" /> Problem List
          </button>
          <span className="font-semibold text-gray-900 tracking-wide">{contest.title}</span>
        </div>
        <div className="flex items-center gap-4">

          <button
            onClick={cycleTheme}
            className={`
              relative flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-300 focus:outline-none
              ${theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-blue-300 hover:bg-slate-700'
                : theme === 'warm'
                  ? 'bg-[#f6f3eb] border-[#e8e4d9] text-amber-700 hover:bg-[#eee8d5]'
                  : 'bg-blue-50 border-blue-200 text-yellow-500 hover:bg-blue-100'}
            `}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Moon className="w-4 h-4" /> : theme === 'warm' ? <Coffee className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2 text-orange-400 font-mono bg-gray-100 px-3 py-1.5 rounded-lg">
            <Clock className="w-4 h-4" />
            <span>{assessmentTimeRemaining || contest.duration}</span>
          </div>
          <button onClick={submitContest} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded-lg font-medium transition-colors text-sm">
            <Send className="w-4 h-4" />
            Submit Contest
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Problems List (Collapsible) */}
        {showProblemList && (
          <div className="w-64 bg-white glass-card border-r border-gray-200 flex flex-col shrink-0 z-10 shadow-lg absolute h-[calc(100vh-56px)] md:relative md:h-auto md:shadow-none">
            <div className="p-4 border-b border-gray-200 font-semibold text-gray-500 uppercase text-xs tracking-wider shrink-0 flex justify-between items-center">
              <span>Questions</span>
              <span className="bg-gray-100 px-2 py-0.5 rounded-full">{questions.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {questions.length === 0 ? (
                <div className="p-4 text-sm text-gray-500 text-center">No questions added yet.</div>
              ) : (
                questions.map((prob, idx) => (
                  <button
                    key={prob.id}
                    onClick={() => {
                      setActiveProblem(prob);
                      if (window.innerWidth < 768) setShowProblemList(false);
                    }}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-100 transition-colors flex items-center justify-between ${activeProblem?.id === prob.id ? 'bg-gray-100 border-l-2 border-l-blue-500' : ''}`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        Q{idx + 1}. {prob.type === 'MCQ' ? 'Multiple Choice' : prob.type === 'Theory' ? 'Theory Q&A' : 'Coding'}
                      </span>
                      <span className="text-xs text-gray-500 mt-0.5 truncate max-w-[180px]">
                        {prob.type === 'Coding' ? prob.title : prob.question?.slice(0, 40)}{prob.type !== 'Coding' && prob.question?.length > 40 ? '…' : ''}
                      </span>
                      <span className="text-xs text-gray-600 mt-0.5">{prob.marks} Marks</span>
                    </div>
                    {answers[prob.id] !== undefined && answers[prob.id] !== '' && <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Center/Right Panel - Question Viewer */}
        {activeProblem ? (
          activeProblem.type === 'MCQ' ? (
            <div className="flex-1 bg-slate-50 p-8 overflow-y-auto">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">MCQ</span>
                    <span className="text-gray-500 text-sm font-medium">{activeProblem.marks} Marks</span>
                  </div>
                  {answers[activeProblem.id] !== undefined && answers[activeProblem.id] !== '' && (
                    <button
                      onClick={() => handleAnswerChange(activeProblem.id, undefined)}
                      className="text-gray-500 hover:text-gray-900 text-xs font-semibold uppercase tracking-wider transition-colors"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                <h2 className="text-xl font-medium text-gray-900 mb-8 leading-relaxed">
                  {activeProblem.question}
                </h2>

                <div className="space-y-3">
                  {activeProblem.options.map((opt, idx) => (
                    <label
                      key={idx}
                      onClick={() => handleAnswerChange(activeProblem.id, idx)}
                      className={`block p-4 rounded-xl border cursor-pointer transition-all ${answers[activeProblem.id] === idx
                          ? 'bg-blue-900/30 border-blue-500/50'
                          : 'bg-white glass-card border-gray-200 hover:border-gray-500'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${answers[activeProblem.id] === idx ? 'border-blue-500' : 'border-gray-500'
                          }`}>
                          {answers[activeProblem.id] === idx && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>}
                        </div>
                        <span className="text-gray-900 text-[15px]">{opt}</span>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-12 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setActiveProblem(questions[currentIndex - 1])}
                    disabled={currentIndex <= 0}
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium text-gray-900 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setActiveProblem(questions[currentIndex + 1])}
                    disabled={currentIndex === questions.length - 1}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium text-white transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          ) : activeProblem.type === 'Theory' ? (
            <div className="flex-1 bg-slate-50 p-8 overflow-y-auto">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <span className="bg-amber-500 text-gray-900 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3" /> Theory
                  </span>
                  <span className="text-gray-500 text-sm font-medium">{activeProblem.marks} Marks</span>
                </div>

                <h2 className="text-xl font-medium text-gray-900 mb-8 leading-relaxed">
                  {activeProblem.question}
                </h2>

                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Your Answer</label>
                  <textarea
                    className="w-full min-h-[240px] bg-white glass-card border border-gray-200 focus:border-amber-500 rounded-xl p-4 text-gray-900 text-sm resize-y outline-none transition-colors placeholder-gray-600 leading-relaxed"
                    placeholder="Write your answer here..."
                    value={answers[activeProblem.id] || ''}
                    onChange={(e) => handleAnswerChange(activeProblem.id, e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-2">Write a clear and complete answer. Your response will be evaluated by the faculty.</p>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-12 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setActiveProblem(questions[currentIndex - 1])}
                    disabled={currentIndex <= 0}
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium text-gray-900 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setActiveProblem(questions[currentIndex + 1])}
                    disabled={currentIndex === questions.length - 1}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium text-white transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Coding Question Viewer */}
              <div className="flex-1 bg-slate-50 border-r border-gray-200 overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-semibold text-gray-900">{activeProblem.title}</h1>
                  <span className="px-3 py-1 bg-purple-900/40 text-purple-400 border border-purple-700/50 rounded-full text-xs font-semibold tracking-wide">
                    {activeProblem.marks} Marks
                  </span>
                </div>
                <div className="prose prose-invert max-w-none text-gray-800">
                  <p className="whitespace-pre-wrap">{activeProblem.problemStatement}</p>

                  <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-2">Input Format</h3>
                  <p className="whitespace-pre-wrap">{activeProblem.inputFormat}</p>

                  <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Output Format</h3>
                  <p className="whitespace-pre-wrap">{activeProblem.outputFormat}</p>

                  <div className="space-y-6 mt-8">
                    {(activeProblem.testCases || (activeProblem.sampleInput ? [{ input: activeProblem.sampleInput, output: activeProblem.sampleOutput }] : [])).map((tc, idx) => (
                      <div key={idx} className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Sample Input {idx + 1}</h4>
                          <pre className="bg-gray-100 p-4 rounded-lg text-sm text-gray-900 overflow-x-auto m-0"><code>{tc.input}</code></pre>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Sample Output {idx + 1}</h4>
                          <pre className="bg-gray-100 p-4 rounded-lg text-sm text-gray-900 overflow-x-auto m-0"><code>{tc.output}</code></pre>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between mt-12 pt-6 border-t border-gray-200 pb-8">
                    <button
                      onClick={() => setActiveProblem(questions[currentIndex - 1])}
                      disabled={currentIndex <= 0}
                      className="px-6 py-2.5 bg-gray-100 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium text-gray-900 transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setActiveProblem(questions[currentIndex + 1])}
                      disabled={currentIndex === questions.length - 1}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium text-white transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Panel - Code Editor */}
              <div className="w-1/2 flex flex-col bg-white glass-card shrink-0">
                <div className="h-10 bg-slate-50 border-b border-gray-200 flex items-center px-4 justify-between shrink-0">
                  <select 
                    value={activeLanguage}
                    onChange={(e) => {
                       const val = e.target.value;
                       setCodingLanguages(prev => ({ ...prev, [activeProblem.id]: val }));
                       codingLanguagesRef.current[activeProblem.id] = val;
                    }}
                    className="bg-gray-100 text-sm text-gray-800 border-none outline-none rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="54">C++</option>
                    <option value="62">Java</option>
                    <option value="71">Python 3</option>
                    <option value="63">JavaScript</option>
                  </select>
                </div>
                <div className="flex-1 overflow-hidden border-b border-gray-200">
                  <Editor
                    height="100%"
                    language={getMonacoLanguage(activeLanguage)}
                    theme={theme === 'dark' ? 'vs-dark' : 'light'}
                    value={answers[activeProblem.id] || ''}
                    onChange={(val) => handleAnswerChange(activeProblem.id, val)}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      scrollBeyondLastLine: false,
                      smoothScrolling: true,
                      padding: { top: 16 }
                    }}
                  />
                </div>

                {/* Console / Results Panel */}
                {(isExecuting || executionResult) && (
                  <div className="h-56 bg-[#1e1e1e] text-gray-300 font-mono text-[13px] flex flex-col shrink-0 overflow-hidden border-t border-gray-200">
                    <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-[#404040]">
                      <div className="flex items-center gap-2 font-semibold text-gray-200">
                        <Terminal className="w-4 h-4" /> Console
                      </div>
                      <button onClick={() => setExecutionResult(null)} className="text-gray-400 hover:text-white">✕</button>
                    </div>
                    <div className="p-4 overflow-y-auto flex-1">
                      {isExecuting ? (
                        <div className="flex items-center gap-2 text-blue-400">
                          <Loader2 className="w-4 h-4 animate-spin" /> Running code on Judge0...
                        </div>
                      ) : executionResult?.error ? (
                        <div className="text-red-400">Error: {executionResult.error}</div>
                      ) : executionResult?.compile_output ? (
                        <div className="text-red-400 whitespace-pre-wrap">{executionResult.compile_output}</div>
                      ) : executionResult?.stderr ? (
                        <div className="text-red-400 whitespace-pre-wrap">{executionResult.stderr}</div>
                      ) : executionResult?.status?.id > 3 ? (
                        <div className="text-red-400">
                          <div className="font-semibold text-red-500 mb-1">{executionResult.status.description}</div>
                          {executionResult.message && <div className="whitespace-pre-wrap">{executionResult.message}</div>}
                        </div>
                      ) : (
                        <>
                          <div className="text-green-400 mb-2 font-semibold">Execution Successful!</div>
                          <div className="text-gray-400 mb-1">Output:</div>
                          <div className="whitespace-pre-wrap mb-4 bg-black/30 p-2 rounded border border-gray-800">{executionResult?.stdout || "No output"}</div>
                          <div className="text-gray-500 text-xs flex gap-4">
                            <span>Time: {executionResult?.time}s</span>
                            <span>Memory: {executionResult?.memory} KB</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="h-14 border-t border-gray-200 bg-slate-50 flex items-center justify-end px-4 gap-3 shrink-0">
                  <button 
                    onClick={executeCode}
                    disabled={isExecuting}
                    className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-900 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-gray-300"
                  >
                    {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    {isExecuting ? "Running..." : "Run Code"}
                  </button>
                  <button
                    onClick={() => handleAnswerChange(activeProblem.id, (answers[activeProblem.id] || ' ') + ' ')}
                    className="px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                  >
                    Save Solution
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
