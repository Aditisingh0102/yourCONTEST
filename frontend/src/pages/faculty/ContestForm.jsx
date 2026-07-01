import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Trophy, Save, CheckCircle2, Code, BookOpen, 
  Plus, Minus, ChevronRight, X, Sparkles, ListChecks, Trash2,
  ChevronDown, Check
} from 'lucide-react';
import { getContests, createContest, updateContest } from '../../api';

/* ────────────────────────────────────────────────────────
   Question-type config — shown after contest is saved
──────────────────────────────────────────────────────── */
const TYPE_CONFIG = [
  {
    key: 'mcq',
    label: 'MCQ',
    sublabel: 'Multiple Choice',
    icon: CheckCircle2,
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
    light: 'bg-blue-50 border-blue-200 text-blue-700',
    ring: 'ring-blue-400',
    description: 'Objective questions with 4 options',
  },
  {
    key: 'theory',
    label: 'Theory Q&A',
    sublabel: 'Definition / Explanation',
    icon: BookOpen,
    color: 'amber',
    gradient: 'from-amber-500 to-orange-500',
    light: 'bg-amber-50 border-amber-200 text-amber-700',
    ring: 'ring-amber-400',
    description: 'Written answer / definition questions',
  },
  {
    key: 'coding',
    label: 'Coding',
    sublabel: 'Programming Problems',
    icon: Code,
    color: 'purple',
    gradient: 'from-violet-500 to-purple-600',
    light: 'bg-purple-50 border-purple-200 text-purple-700',
    ring: 'ring-purple-400',
    description: 'Code submission with test cases',
  },
];

function QuestionTypeModal({ contestId, onClose }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState({ mcq: false, theory: false, coding: false });
  const [counts, setCounts]     = useState({ mcq: 5, theory: 3, coding: 2 });

  const toggleType = (key) =>
    setSelected(prev => ({ ...prev, [key]: !prev[key] }));

  const changeCount = (key, delta) =>
    setCounts(prev => ({ ...prev, [key]: Math.max(1, (prev[key] || 1) + delta) }));

  const anySelected = Object.values(selected).some(Boolean);

  const handleConfirm = () => {
    const params = new URLSearchParams();
    TYPE_CONFIG.forEach(({ key }) => {
      if (selected[key]) params.set(key, counts[key]);
    });
    navigate(`/faculty/manage-contests/${contestId}/questions?${params.toString()}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-modalIn">

        {/* Header */}
        <div className="px-7 pt-7 pb-5 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                <ListChecks className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Configure Questions</h2>
                <p className="text-[13px] text-gray-500 mt-0.5">Choose question types & how many of each</p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Type selector cards */}
        <div className="px-7 py-6 space-y-3">
          {TYPE_CONFIG.map(({ key, label, sublabel, icon: Icon, gradient, light, ring, description }) => {
            const isOn = selected[key];
            return (
              <div key={key}
                onClick={() => toggleType(key)}
                className={`relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                  ${isOn ? `${light} border-current ring-2 ${ring} ring-offset-1` : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/60'}`}>

                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm
                  bg-gradient-to-br ${gradient}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>

                {/* Labels */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[14px] text-gray-900">{label}</span>
                    <span className="text-[11px] text-gray-500 font-medium">— {sublabel}</span>
                  </div>
                  <p className="text-[12px] text-gray-400 mt-0.5">{description}</p>
                </div>

                {/* Checkbox visual */}
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
                  ${isOn ? `bg-gradient-to-br ${gradient} border-transparent` : 'border-gray-300'}`}>
                  {isOn && <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Count steppers — only shown for selected types */}
        {anySelected && (
          <div className="px-7 pb-6">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
              How many questions?
            </p>
            <div className="space-y-2">
              {TYPE_CONFIG.filter(({ key }) => selected[key]).map(({ key, label, icon: Icon, gradient }) => (
                <div key={key} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br ${gradient}`}>
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-[13px] font-semibold text-gray-800">{label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={(e) => { e.stopPropagation(); changeCount(key, -1); }}
                      className="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-[15px] font-semibold text-gray-900">{counts[key]}</span>
                    <button onClick={(e) => { e.stopPropagation(); changeCount(key, 1); }}
                      className="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total badge */}
            <div className="mt-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl px-4 py-3 border border-blue-100">
              <span className="text-[13px] font-semibold text-blue-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Total Questions
              </span>
              <span className="text-[18px] font-semibold text-blue-700">
                {TYPE_CONFIG.filter(({ key }) => selected[key]).reduce((sum, { key }) => sum + counts[key], 0)}
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-7 pb-7 pt-1 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-200 transition-colors">
            Back
          </button>
          <button
            onClick={handleConfirm}
            disabled={!anySelected}
            className={`flex-1 py-2.5 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all
              ${anySelected
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
            Start Adding Questions <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modalIn { animation: modalIn 0.22s ease-out both; }
      `}</style>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   Main ContestForm
──────────────────────────────────────────────────────── */
export default function ContestForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    title: '', type: 'Mock Test', startDate: '', startTime: '', duration: '', customRules: [], strictFullscreen: true, disableCopyPaste: true, batch: ['All'],
    warningLimit: 1, windowSwitchGracePeriod: 0
  });
  const [dbContestId, setDbContestId]   = useState(null);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [savedContestId, setSavedContestId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dateError, setDateError] = useState('');

  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const batchDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (batchDropdownRef.current && !batchDropdownRef.current.contains(event.target)) {
        setIsBatchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (id) {
      getContests().then(res => {
        const contest = res.data.find(c => (c._id || c.id).toString() === id);
        if (contest) {
          setDbContestId(contest._id || contest.id);
          const [datePart, timePart] = contest.startTime ? contest.startTime.split(', ') : ['', ''];
          setFormData({
            title: contest.title || '',
            type: contest.type || 'Mock Test',
            startDate: datePart || '',
            startTime: timePart || '',
            duration: contest.duration ? parseInt(contest.duration) : '',
            customRules: Array.isArray(contest.customRules) ? contest.customRules : (contest.customRules ? [contest.customRules] : []),
            strictFullscreen: contest.strictFullscreen !== false,
            disableCopyPaste: contest.disableCopyPaste !== false,
            batch: Array.isArray(contest.batch) ? contest.batch : (contest.batch ? [contest.batch] : ['All']),
            warningLimit: contest.warningLimit !== undefined ? contest.warningLimit : 1,
            windowSwitchGracePeriod: contest.windowSwitchGracePeriod !== undefined ? contest.windowSwitchGracePeriod : 0
          });
        }
      });
    }
  }, [id]);

  useEffect(() => {
    if (formData.startDate && formData.startTime) {
      const selectedDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      if (selectedDateTime < new Date()) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDateError("Start date and time cannot be in the past!");
      } else {
        setDateError('');
      }
    } else {
      setDateError('');
    }
  }, [formData.startDate, formData.startTime]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDateError('');

    const selectedDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    if (selectedDateTime < new Date()) {
      setDateError("Start date and time cannot be in the past!");
      return;
    }

    setSaving(true);

    try {
      if (id && dbContestId) {
        // Edit mode — just save and return
        await updateContest(dbContestId, {
          title: formData.title,
          type: formData.type,
          startTime: `${formData.startDate}, ${formData.startTime}`,
          duration: `${formData.duration} mins`,
          customRules: formData.customRules || [],
          strictFullscreen: formData.strictFullscreen,
          disableCopyPaste: formData.disableCopyPaste,
          batch: formData.batch,
          warningLimit: parseInt(formData.warningLimit) || 1,
          windowSwitchGracePeriod: parseInt(formData.windowSwitchGracePeriod) || 0
        });
        navigate('/faculty/manage-contests');
      } else {
        // Create mode — save new contest, then open modal
        const newContest = {
          title: formData.title,
          type: formData.type,
          status: 'Upcoming',
          startTime: `${formData.startDate}, ${formData.startTime}`,
          endTime: 'TBD',
          duration: `${formData.duration} mins`,
          registered: 0,
          questions: 0,
          submissions: 0,
          customRules: formData.customRules || [],
          strictFullscreen: formData.strictFullscreen,
          disableCopyPaste: formData.disableCopyPaste,
          batch: formData.batch,
          warningLimit: parseInt(formData.warningLimit) || 1,
          windowSwitchGracePeriod: parseInt(formData.windowSwitchGracePeriod) || 0,
          questionList: []
        };
        const res = await createContest(newContest);
        setSavedContestId(res.data._id || res.data.id);
        setShowTypeModal(true);
      }
    } catch (err) {
      console.error(err);
      alert('Error saving contest');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[800px] mx-auto">

      {/* Page Header */}
      <div className="flex items-center gap-4 border-b border-gray-100 pb-6 mb-6">
        <button onClick={() => navigate('/faculty/manage-contests')}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-blue-600" />
            {id ? 'Edit Contest Details' : 'Configure New Contest'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {id
              ? 'Update the details and rules for this contest.'
              : 'Set up the basic details and rules before adding questions.'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-8">

            {/* ① Basic Details */}
            <div>
              <h3 className="text-[15px] font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">1</span>
                Basic Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pl-8">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Contest Name</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. End Semester Exam: Data Structures"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 transition-all text-sm font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Contest Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 transition-all text-sm font-medium"
                  >
                    <option value="Assessment">Assessment</option>
                    <option value="Mock Test">Mock Test</option>
                    <option value="Coding Challenge">Weekly Coding Challenge</option>
                    <option value="Lab Exam">Lab Exam</option>
                  </select>
                </div>
                <div ref={batchDropdownRef} className="relative">
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Select Batch</label>
                  <div 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white cursor-pointer flex justify-between items-center text-sm font-medium focus:outline-none focus:border-blue-500 transition-all"
                    onClick={() => setIsBatchOpen(!isBatchOpen)}
                  >
                    <span className="truncate text-gray-700">
                      {formData.batch.includes('All') ? 'All Batches' : formData.batch.join(', ')}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isBatchOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {isBatchOpen && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 overflow-hidden">
                      {['All', 'Alpha 1', 'Alpha 2', 'Beta 1'].map(b => (
                        <div 
                          key={b} 
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between text-sm transition-colors"
                          onClick={() => {
                            if (b === 'All') {
                              setFormData({ ...formData, batch: ['All'] });
                            } else {
                              let newBatch = formData.batch.filter(x => x !== 'All');
                              if (newBatch.includes(b)) {
                                newBatch = newBatch.filter(x => x !== b);
                              } else {
                                newBatch.push(b);
                              }
                              if (newBatch.length === 0) newBatch = ['All'];
                              setFormData({ ...formData, batch: newBatch });
                            }
                          }}
                        >
                          <span className={formData.batch.includes(b) ? 'font-semibold text-blue-600' : 'font-medium text-gray-700'}>
                            {b === 'All' ? 'All Batches' : b}
                          </span>
                          {formData.batch.includes(b) && <Check className="w-4 h-4 text-blue-600" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ② Scheduling */}
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-[15px] font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">2</span>
                Scheduling
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pl-8">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Start Date</label>
                  <input
                    type="date"
                    min={today}
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 transition-all text-sm font-medium text-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 transition-all text-sm font-medium text-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Duration (Mins)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 120"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 transition-all text-sm font-medium"
                    required
                  />
                </div>
              </div>
              {dateError && (
                <div className="mt-4 pl-8">
                  <p className="text-sm font-semibold text-red-500 flex items-center gap-2 bg-red-50 py-2 px-3 rounded-lg border border-red-100 inline-flex">
                    <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-xs">!</span>
                    {dateError}
                  </p>
                </div>
              )}
            </div>

            {/* ③ Rules & Proctoring */}
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-[15px] font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">3</span>
                Rules & Proctoring
              </h3>
              <div className="space-y-5 pl-8">
                <div className="flex flex-col gap-4">
                  <div className="flex gap-4">
                    <label className="flex flex-1 items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" 
                        checked={formData.strictFullscreen} 
                        onChange={(e) => setFormData({...formData, strictFullscreen: e.target.checked})} 
                      />
                      <span className="text-[14px] font-semibold text-gray-800">Strict Fullscreen Mode</span>
                    </label>
                    <label className="flex flex-1 items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" 
                        checked={formData.disableCopyPaste} 
                        onChange={(e) => setFormData({...formData, disableCopyPaste: e.target.checked})} 
                      />
                      <span className="text-[14px] font-semibold text-gray-800">Disable Copy/Paste</span>
                    </label>
                  </div>
                  
                  {formData.strictFullscreen && (
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Max Warnings Allowed</label>
                        <input
                          type="number"
                          min="1"
                          value={formData.warningLimit}
                          onChange={(e) => setFormData({ ...formData, warningLimit: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 transition-all text-sm font-medium"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Number of times student can exit fullscreen before auto-submission.</p>
                      </div>
                      <div className="flex-1">
                        <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Window Switch Grace Period (Sec)</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.windowSwitchGracePeriod}
                          onChange={(e) => setFormData({ ...formData, windowSwitchGracePeriod: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 transition-all text-sm font-medium"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Time allowed outside the window before a warning is given (0 for strict).</p>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[13px] font-semibold text-gray-700">Custom Instructions for Students (Optional)</label>
                    <button type="button" onClick={() => setFormData({...formData, customRules: [...formData.customRules, '']})} className="text-blue-600 hover:text-blue-700 font-semibold text-xs flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" /> Add Instruction
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.customRules.map((rule, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <textarea
                          rows="2"
                          value={rule}
                          onChange={(e) => {
                            const newRules = [...formData.customRules];
                            newRules[idx] = e.target.value;
                            setFormData({ ...formData, customRules: newRules });
                          }}
                          placeholder={`Instruction ${idx + 1}`}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 transition-all text-sm font-medium resize-none"
                        />
                        <button type="button" onClick={() => {
                          const newRules = [...formData.customRules];
                          newRules.splice(idx, 1);
                          setFormData({ ...formData, customRules: newRules });
                        }} className="mt-2 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {formData.customRules.length === 0 && (
                      <div className="text-center py-4 bg-gray-50 border border-gray-200 border-dashed rounded-xl">
                        <p className="text-xs text-gray-500">No custom instructions added.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Footer actions */}
          <div className="pt-8 mt-8 flex gap-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/faculty/manage-contests')}
              className="px-8 py-3 bg-gray-100 text-gray-700 font-semibold text-[15px] rounded-xl hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-[15px] rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:from-blue-500 hover:to-indigo-500 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : (id ? 'Save Changes' : 'Save & Proceed to Questions')}
            </button>
          </div>
        </form>
      </div>

      {/* Question Type Modal */}
      {showTypeModal && savedContestId && (
        <QuestionTypeModal
          contestId={savedContestId}
          onClose={() => setShowTypeModal(false)}
        />
      )}
      </div>
    </div>
  );
}
