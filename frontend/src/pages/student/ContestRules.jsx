import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, AlertTriangle, Clock, HelpCircle, FileText, User, ChevronLeft } from 'lucide-react';
import { getContests } from '../../api';

export default function ContestRules() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [contest, setContest] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  React.useEffect(() => {
    if (!sessionStorage.getItem('student_profile')) {
      navigate('/');
    }
  }, [navigate]);

  React.useEffect(() => {
    const fetchContestData = async () => {
      try {
        const res = await getContests();
        const current = res.data.find(c => (c._id || c.id).toString() === id);
        if (current) setContest(current);
      } catch (err) {
        console.error(err);
      }
    };
    fetchContestData();
  }, [id]);

  React.useEffect(() => {
    if (!contest || contest.status !== 'Upcoming') return;

    let start = 0;
    if (contest.startTime && contest.startTime.includes(',')) {
      const parts = contest.startTime.split(', ');
      if (parts.length === 2) {
        start = new Date(`${parts[0]}T${parts[1]}:00`).getTime();
      }
    } else if (contest.date && contest.time) {
      start = new Date(`${contest.date}T${contest.time}:00`).getTime();
    } else if (contest.startTime) {
      start = new Date(contest.startTime).getTime();
    }

    if (!start || isNaN(start)) return;

    const updateTimer = () => {
      const now = Date.now();
      const diff = start - now;
      if (diff <= 0) {
        setContest(prev => ({ ...prev, status: 'Live' }));
        setTimeLeft('');
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      const pad = (num) => num.toString().padStart(2, '0');

      if (h >= 24) {
        const days = Math.floor(h / 24);
        const remH = h % 24;
        setTimeLeft(`${days}d ${pad(remH)}h ${pad(m)}m ${pad(s)}s`);
      } else {
        setTimeLeft(`${pad(h)}h ${pad(m)}m ${pad(s)}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [contest]);

  if (!contest) return <div className="p-8 text-center">Loading Contest Details...</div>;

  const handleStart = () => {
    if (contest.status === 'Past') {
      navigate('/student/reports');
      return;
    }
    if (agreed || contest.status !== 'Live') {
      navigate(`/student/arena/${id}`);
    }
  };

  const theme = (() => {
    if (contest.type === 'Assessment') return {
      bgLight: 'bg-purple-50', borderLight: 'border-purple-100', textMain: 'text-purple-600', textDark: 'text-purple-700', bgMain: 'bg-purple-600', bgHover: 'hover:bg-purple-700', bgMuted: 'bg-purple-100', peerCheckedBg: 'peer-checked:bg-purple-600 peer-checked:border-purple-600'
    };
    if (contest.type === 'Mock Test') return {
      bgLight: 'bg-orange-50', borderLight: 'border-orange-100', textMain: 'text-orange-600', textDark: 'text-orange-700', bgMain: 'bg-orange-600', bgHover: 'hover:bg-orange-700', bgMuted: 'bg-orange-100', peerCheckedBg: 'peer-checked:bg-orange-600 peer-checked:border-orange-600'
    };
    return {
      bgLight: 'bg-blue-50', borderLight: 'border-gray-100', textMain: 'text-blue-600', textDark: 'text-blue-700', bgMain: 'bg-blue-600', bgHover: 'hover:bg-blue-700', bgMuted: 'bg-blue-100', peerCheckedBg: 'peer-checked:bg-blue-600 peer-checked:border-blue-600'
    };
  })();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/student/contests')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 leading-tight">{contest.title}</h1>
            <p className="text-sm text-gray-500 font-medium mt-0.5">Assigned by Faculty</p>
          </div>
        </div>
        <span className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg uppercase tracking-wider flex items-center gap-2 border ${contest.status === 'Live' ? 'bg-red-50 text-red-600 border-red-200' :
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
          <div className={`${theme.bgLight} border-b ${theme.borderLight} p-5 flex items-center gap-3`}>
            <FileText className={`w-6 h-6 ${theme.textMain}`} />
            <h2 className="text-lg font-semibold text-gray-900">{contest.type || 'Assessment'} Details</h2>
          </div>

          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Duration</p>
              <p className="text-[15px] font-semibold text-gray-900">{contest.duration}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5" /> Questions</p>
              <p className="text-[15px] font-semibold text-gray-900">{contest.questions}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Total Marks</p>
              <p className="text-[15px] font-semibold text-gray-900">{(contest.questionList || []).reduce((acc, q) => acc + q.marks, 0)} Marks</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Type</p>
              <p className="text-[15px] font-semibold text-gray-900">{contest.type}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="bg-red-50 border-b border-red-100 p-5 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900">Important Instructions & Rules</h2>
          </div>

          <div className="p-6">
            <ul className="space-y-5 text-[14px] text-gray-700 font-medium leading-relaxed">
              <li className="flex items-start gap-4">
                <span className="w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 text-[13px] font-semibold">1</span>
                <p className="mt-0.5">This is a strictly monitored assessment. <strong className="text-red-600 font-semibold">Navigating away from the test window, changing tabs, or opening other applications is strictly prohibited.</strong> Any attempt to switch tabs will be recorded as a violation.</p>
              </li>
              <li className="flex items-start gap-4">
                <span className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center shrink-0 text-[13px] font-semibold">2</span>
                <p className="mt-0.5">Your screen, audio, and video may be recorded for proctoring purposes during the entire duration of the test. Ensure you are in a quiet environment.</p>
              </li>
              <li className="flex items-start gap-4">
                <span className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center shrink-0 text-[13px] font-semibold">3</span>
                <p className="mt-0.5">The timer will start automatically once you click the 'Start Contest' button below and cannot be paused under any circumstances.</p>
              </li>
              {contest.customRules && (Array.isArray(contest.customRules) ? contest.customRules : [contest.customRules]).map((rule, idx) => rule.trim() !== '' && (
                <li key={idx} className="flex items-start gap-4">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[13px] font-semibold ${theme.bgMuted} ${theme.textMain}`}>{4 + idx}</span>
                  <p className="mt-0.5 whitespace-pre-wrap"><strong className={theme.textDark}>Faculty Rules:</strong> {rule}</p>
                </li>
              ))}
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
                <div className={`w-6 h-6 border-2 border-gray-300 rounded-md transition-colors ${theme.peerCheckedBg}`}></div>
                <Check className="w-4 h-4 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none stroke-[3]" />
              </div>
              <p className="text-[14px] text-gray-700 font-semibold group-hover:text-gray-900 transition-colors leading-snug">
                I have read all the instructions carefully and agree to abide by the rules. I understand that any violation will lead to immediate disqualification.
              </p>
            </label>

            <button
              onClick={handleStart}
              disabled={!agreed}
              className={`shrink-0 px-8 py-3.5 rounded-xl font-semibold text-[15px] shadow-sm transition-all ${agreed
                ? `${theme.bgMain} text-white ${theme.bgHover} hover:shadow-md hover:-translate-y-0.5 cursor-pointer`
                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                }`}
              >
                Start the test!
              </button>
            </div>
          ) : contest.status === 'Upcoming' ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl shadow-sm p-8 flex flex-col items-center justify-center text-center">
              <Clock className="w-12 h-12 text-yellow-500 mb-3 animate-pulse" />
              <h3 className="text-xl font-bold text-yellow-800 mb-2">Contest Starts In</h3>
              {timeLeft ? (
                <div className="text-4xl font-black text-yellow-600 font-mono tracking-wider mb-4 drop-shadow-sm">
                  {timeLeft}
                </div>
              ) : (
                <p className="text-yellow-700 font-semibold mb-4">Fetching schedule...</p>
              )}
              <p className="text-yellow-700 font-medium text-sm max-w-md">
                The "Start the test!" button will automatically appear here once the countdown reaches zero. Ensure you have read all rules.
              </p>
            </div>
          ) : (
            <div className="flex justify-center">
              <button onClick={handleStart} className={`px-8 py-3 ${theme.bgMain} text-white rounded-xl font-semibold ${theme.bgHover}`}>
                View Results & Submissions
              </button>
            </div>
          )}
      </div>
    </div>
  );
}
