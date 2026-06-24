import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Plus, Code, CheckCircle2, Trash2, BookOpen,
  HelpCircle, Edit2, XCircle, ChevronRight, ChevronLeft,
  LayoutList, Sparkles, Check, Clock
} from 'lucide-react';
import { getContests, updateContest } from '../../api';

/* ─── Type meta ─────────────────────────────────────────── */
const TYPE_META = {
  mcq: {
    label: 'MCQ',
    fullLabel: 'Multiple Choice',
    icon: CheckCircle2,
    badgeCls: 'bg-blue-50 text-blue-600 border-blue-200',
    accentCls: 'text-blue-600',
    headerGrad: 'from-blue-500 to-blue-600',
    tabActive: 'border-blue-600 text-blue-600',
    btnCls: 'bg-blue-600 hover:bg-blue-700',
  },
  theory: {
    label: 'Theory Q&A',
    fullLabel: 'Definition / Explanation',
    icon: BookOpen,
    badgeCls: 'bg-amber-50 text-amber-700 border-amber-200',
    accentCls: 'text-amber-600',
    headerGrad: 'from-amber-500 to-orange-500',
    tabActive: 'border-amber-500 text-amber-600',
    btnCls: 'bg-amber-500 hover:bg-amber-600',
  },
  coding: {
    label: 'Coding',
    fullLabel: 'Programming Problem',
    icon: Code,
    badgeCls: 'bg-purple-50 text-purple-600 border-purple-200',
    accentCls: 'text-purple-600',
    headerGrad: 'from-violet-500 to-purple-600',
    tabActive: 'border-purple-600 text-purple-600',
    btnCls: 'bg-purple-600 hover:bg-purple-700',
  },
};

/* ─── Empty forms ───────────────────────────────────────── */
const emptyMCQ    = { question: '', options: ['', '', '', ''], correctOption: 0, marks: 1 };
const emptyTheory = { question: '', answer: '', marks: 5 };
const emptyCoding = { title: '', problemStatement: '', inputFormat: '', outputFormat: '', constraints: '', sampleInput: '', sampleOutput: '', marks: 10 };

/* ─── MCQ form ──────────────────────────────────────────── */
function MCQForm({ data, onChange, onSubmit, editing }) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Question Text</label>
        <textarea
          required rows="3"
          value={data.question}
          onChange={e => onChange({ ...data, question: e.target.value })}
          placeholder="Enter the question..."
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 transition-all text-sm resize-none"
        />
      </div>
      <div className="space-y-3">
        <label className="block text-[13px] font-bold text-gray-700">Options
          <span className="text-gray-400 font-normal ml-1">(click radio to mark correct)</span>
        </label>
        {data.options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <button type="button"
              onClick={() => onChange({ ...data, correctOption: idx })}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                ${data.correctOption === idx ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
              {data.correctOption === idx && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
            </button>
            <input
              required type="text"
              value={opt}
              onChange={e => {
                const opts = [...data.options]; opts[idx] = e.target.value;
                onChange({ ...data, options: opts });
              }}
              placeholder={`Option ${idx + 1}${data.correctOption === idx ? ' ✓ (Correct)' : ''}`}
              className={`flex-1 px-4 py-2 rounded-xl border text-sm transition-all focus:outline-none
                ${data.correctOption === idx
                  ? 'border-blue-300 bg-blue-50 focus:border-blue-500'
                  : 'border-gray-200 bg-white focus:border-blue-500'}`}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-4 items-end">
        <div className="w-32">
          <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Marks</label>
          <input type="number" min="1"
            value={data.marks}
            onChange={e => onChange({ ...data, marks: parseInt(e.target.value) || 1 })}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>
        <button type="submit"
          className="flex-1 py-2.5 bg-blue-600 text-white font-bold text-[14px] rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors">
          {editing ? <><Edit2 className="w-4 h-4" /> Update MCQ</> : <><Check className="w-4 h-4" /> Save MCQ</>}
        </button>
      </div>
    </form>
  );
}

/* ─── Theory Q&A form ───────────────────────────────────── */
function TheoryForm({ data, onChange, onSubmit, editing }) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Question / Topic</label>
        <textarea
          required rows="2"
          value={data.question}
          onChange={e => onChange({ ...data, question: e.target.value })}
          placeholder="e.g. Define polymorphism in OOP."
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-amber-400 transition-all text-sm resize-none"
        />
      </div>
      <div>
        <label className="block text-[13px] font-bold text-gray-700 mb-1.5">
          Expected Answer / Definition
          <span className="text-gray-400 font-normal ml-1">(Model answer for evaluation)</span>
        </label>
        <textarea
          required rows="6"
          value={data.answer}
          onChange={e => onChange({ ...data, answer: e.target.value })}
          placeholder="Write the ideal / expected answer here. Students will write their own — this is for faculty reference & auto-grading hints."
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-amber-400 transition-all text-sm resize-none"
        />
      </div>
      <div className="flex gap-4 items-end">
        <div className="w-32">
          <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Marks</label>
          <input type="number" min="1"
            value={data.marks}
            onChange={e => onChange({ ...data, marks: parseInt(e.target.value) || 1 })}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-amber-400 text-sm"
          />
        </div>
        <button type="submit"
          className="flex-1 py-2.5 bg-amber-500 text-white font-bold text-[14px] rounded-xl hover:bg-amber-600 flex items-center justify-center gap-2 transition-colors">
          {editing ? <><Edit2 className="w-4 h-4" /> Update Question</> : <><Check className="w-4 h-4" /> Save Question</>}
        </button>
      </div>
    </form>
  );
}

/* ─── Coding form ───────────────────────────────────────── */
function CodingForm({ data, onChange, onSubmit, editing }) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Problem Title</label>
        <input required type="text"
          value={data.title}
          onChange={e => onChange({ ...data, title: e.target.value })}
          placeholder="E.g. Find the Missing Number"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-purple-500 transition-all text-sm"
        />
      </div>
      <div>
        <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Problem Statement</label>
        <textarea required rows="4"
          value={data.problemStatement}
          onChange={e => onChange({ ...data, problemStatement: e.target.value })}
          placeholder="Describe the coding problem in detail..."
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-purple-500 transition-all text-sm resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Input Format</label>
          <textarea required rows="2"
            value={data.inputFormat}
            onChange={e => onChange({ ...data, inputFormat: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-purple-500 text-sm resize-none"
          />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Output Format</label>
          <textarea required rows="2"
            value={data.outputFormat}
            onChange={e => onChange({ ...data, outputFormat: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-purple-500 text-sm resize-none"
          />
        </div>
      </div>
      <div>
        <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Constraints
          <span className="text-gray-400 font-normal ml-1">(Optional)</span>
        </label>
        <input type="text"
          value={data.constraints}
          onChange={e => onChange({ ...data, constraints: e.target.value })}
          placeholder="e.g. 1 ≤ N ≤ 10^5, time limit: 1 sec"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-purple-500 text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Sample Input</label>
          <textarea required rows="3"
            value={data.sampleInput}
            onChange={e => onChange({ ...data, sampleInput: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-mono text-sm resize-none focus:outline-none focus:border-purple-500"
          />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Sample Output</label>
          <textarea required rows="3"
            value={data.sampleOutput}
            onChange={e => onChange({ ...data, sampleOutput: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-mono text-sm resize-none focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>
      <div className="flex gap-4 items-end">
        <div className="w-32">
          <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Marks</label>
          <input type="number" min="1"
            value={data.marks}
            onChange={e => onChange({ ...data, marks: parseInt(e.target.value) || 1 })}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-purple-500 text-sm"
          />
        </div>
        <button type="submit"
          className="flex-1 py-2.5 bg-purple-600 text-white font-bold text-[14px] rounded-xl hover:bg-purple-700 flex items-center justify-center gap-2 transition-colors">
          {editing ? <><Edit2 className="w-4 h-4" /> Update Problem</> : <><Check className="w-4 h-4" /> Save Problem</>}
        </button>
      </div>
    </form>
  );
}

/* ─── Sidebar slot item ─────────────────────────────────── */
function SlotItem({ slot, slotIdx, active, filled, onClick }) {
  const meta = TYPE_META[slot.type];
  const Icon = meta.icon;
  return (
    <button
      onClick={() => onClick(slotIdx)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all
        ${active ? 'bg-gray-900 text-white shadow-sm' : 'hover:bg-gray-50 text-gray-700'}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
        bg-gradient-to-br ${meta.headerGrad}`}>
        {filled
          ? <Check className="w-4 h-4 text-white" strokeWidth={3} />
          : <Icon className="w-3.5 h-3.5 text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[12px] font-bold truncate ${active ? 'text-white' : 'text-gray-800'}`}>
          {meta.label} #{slot.localIdx}
        </p>
        <p className={`text-[11px] truncate ${active ? 'text-gray-300' : 'text-gray-400'}`}>
          {filled ? '✓ Saved' : 'Pending'}
        </p>
      </div>
      {active && <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
    </button>
  );
}

/* ─── Main page ─────────────────────────────────────────── */
export default function ContestQuestions() {
  const { id }         = useParams();
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();

  const [contest, setContest]       = useState(null);
  const [dbContestId, setDbContestId] = useState(null);
  const [questions, setQuestions]   = useState([]);
  const [currentSlotIdx, setCurrentSlotIdx] = useState(0);
  const [editingQId, setEditingQId] = useState(null);

  // Per-form state
  const [mcqForm,    setMcqForm]    = useState({ ...emptyMCQ });
  const [theoryForm, setTheoryForm] = useState({ ...emptyTheory });
  const [codingForm, setCodingForm] = useState({ ...emptyCoding });

  /* Build slot queue from URL params */
  const slots = useMemo(() => {
    const mcqCount    = parseInt(searchParams.get('mcq'))    || 0;
    const theoryCount = parseInt(searchParams.get('theory')) || 0;
    const codingCount = parseInt(searchParams.get('coding')) || 0;

    const result = [];
    for (let i = 1; i <= mcqCount;    i++) result.push({ type: 'mcq',    localIdx: i });
    for (let i = 1; i <= theoryCount; i++) result.push({ type: 'theory', localIdx: i });
    for (let i = 1; i <= codingCount; i++) result.push({ type: 'coding', localIdx: i });
    return result;
  }, [searchParams]);

  const hasSlots = slots.length > 0;

  /* Load contest */
  useEffect(() => {
    getContests().then(res => {
      const current = res.data.find(c => (c._id || c.id).toString() === id);
      if (current) {
        setContest(current);
        setDbContestId(current._id || current.id);
        setQuestions(current.questionList || []);
      }
    });
  }, [id]);

  /* When slot changes, preload its existing question (if already saved) */
  useEffect(() => {
    if (!hasSlots) return;
    const slot = slots[currentSlotIdx];
    const slotQ = questions[currentSlotIdx];
    if (slotQ) {
      setEditingQId(slotQ.id);
      if (slot.type === 'mcq')    setMcqForm({ question: slotQ.question, options: slotQ.options, correctOption: slotQ.correctOption, marks: slotQ.marks });
      if (slot.type === 'theory') setTheoryForm({ question: slotQ.question, answer: slotQ.answer, marks: slotQ.marks });
      if (slot.type === 'coding') setCodingForm({ title: slotQ.title, problemStatement: slotQ.problemStatement, inputFormat: slotQ.inputFormat, outputFormat: slotQ.outputFormat, constraints: slotQ.constraints || '', sampleInput: slotQ.sampleInput, sampleOutput: slotQ.sampleOutput, marks: slotQ.marks });
    } else {
      setEditingQId(null);
      setMcqForm({ ...emptyMCQ });
      setTheoryForm({ ...emptyTheory });
      setCodingForm({ ...emptyCoding });
    }
  }, [currentSlotIdx, hasSlots]);

  /* Save questions to DB */
  const persist = async (updatedList) => {
    setQuestions(updatedList);
    if (dbContestId) {
      try {
        await updateContest(dbContestId, { questionList: updatedList, questions: updatedList.length });
      } catch (err) {
        console.error('Save error', err);
      }
    }
  };

  /* Generic slot save — replaces or inserts at slotIdx */
  const saveSlot = (qData, advanceNext = true) => {
    const updated = [...questions];
    updated[currentSlotIdx] = { id: editingQId || Date.now() + currentSlotIdx, ...qData };
    persist(updated);
    if (advanceNext && currentSlotIdx < slots.length - 1) {
      setCurrentSlotIdx(i => i + 1);
    }
  };

  const handleMCQSubmit = (e) => {
    e.preventDefault();
    saveSlot({ type: 'MCQ', ...mcqForm });
  };
  const handleTheorySubmit = (e) => {
    e.preventDefault();
    saveSlot({ type: 'Theory', ...theoryForm });
  };
  const handleCodingSubmit = (e) => {
    e.preventDefault();
    saveSlot({ type: 'Coding', ...codingForm });
  };

  /* ── Delete (free-list mode) */
  const handleDelete = (qId) => {
    persist(questions.filter(q => q.id !== qId));
  };

  /* ── Edit (free-list mode) */
  const handleEdit = (q) => {
    setEditingQId(q.id);
    if (q.type === 'MCQ')    setMcqForm({ question: q.question, options: q.options, correctOption: q.correctOption, marks: q.marks });
    if (q.type === 'Theory') setTheoryForm({ question: q.question, answer: q.answer, marks: q.marks });
    if (q.type === 'Coding') setCodingForm({ title: q.title, problemStatement: q.problemStatement, inputFormat: q.inputFormat, outputFormat: q.outputFormat, constraints: q.constraints || '', sampleInput: q.sampleInput, sampleOutput: q.sampleOutput, marks: q.marks });
  };

  /* ── Free-list save (no slots) */
  const [freeTab, setFreeTab] = useState('MCQ');
  const handleFreeSave = (type, data) => {
    if (editingQId) {
      persist(questions.map(q => q.id === editingQId ? { ...q, ...data } : q));
      setEditingQId(null);
    } else {
      persist([...questions, { id: Date.now(), type, ...data }]);
    }
    if (type === 'MCQ')    setMcqForm({ ...emptyMCQ });
    if (type === 'Theory') setTheoryForm({ ...emptyTheory });
    if (type === 'Coding') setCodingForm({ ...emptyCoding });
  };

  if (!contest) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500 font-medium">Loading contest...</p>
      </div>
    </div>
  );

  /* ────────────────── SLOT MODE (URL params present) ─────── */
  if (hasSlots) {
    const slot     = slots[currentSlotIdx];
    const meta     = TYPE_META[slot.type];
    const Icon     = meta.icon;
    const filled   = (idx) => Boolean(questions[idx]);
    const doneCount = questions.filter(Boolean).length;
    const totalSlots = slots.length;
    const progress = Math.round((doneCount / totalSlots) * 100);
    const allDone  = doneCount >= totalSlots;

    return (
      <div className="max-w-[1200px] mx-auto py-6 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/faculty/manage-contests')}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Add Questions</h1>
            <p className="text-sm text-gray-500 mt-0.5">{contest.title}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-bold text-gray-700">Progress</span>
            <span className="text-[13px] font-bold text-gray-500">{doneCount} / {totalSlots} questions saved</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            {['mcq', 'theory', 'coding'].map(t => {
              const count = slots.filter(s => s.type === t).length;
              if (!count) return null;
              const m = TYPE_META[t];
              return (
                <span key={t} className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${m.badgeCls}`}>
                  <m.icon className="w-3 h-3" /> {count} {m.label}
                </span>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

          {/* ── Left sidebar: slot list */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sticky top-4">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">
                All Slots
              </p>
              <div className="space-y-1 max-h-[70vh] overflow-y-auto">
                {slots.map((s, idx) => (
                  <SlotItem
                    key={idx}
                    slot={s}
                    slotIdx={idx}
                    active={idx === currentSlotIdx}
                    filled={filled(idx)}
                    onClick={setCurrentSlotIdx}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: current form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

              {/* Form header */}
              <div className={`px-6 py-4 bg-gradient-to-r ${meta.headerGrad} flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-black text-[15px]">{meta.label} #{slot.localIdx}</p>
                    <p className="text-white/70 text-[12px]">{meta.fullLabel}</p>
                  </div>
                </div>
                <span className="bg-white/20 text-white text-[12px] font-bold px-3 py-1 rounded-full">
                  {currentSlotIdx + 1} of {totalSlots}
                </span>
              </div>

              {/* Form body */}
              <div className="p-6">
                {slot.type === 'mcq' && (
                  <MCQForm data={mcqForm} onChange={setMcqForm} onSubmit={handleMCQSubmit} editing={Boolean(editingQId && questions[currentSlotIdx])} />
                )}
                {slot.type === 'theory' && (
                  <TheoryForm data={theoryForm} onChange={setTheoryForm} onSubmit={handleTheorySubmit} editing={Boolean(editingQId && questions[currentSlotIdx])} />
                )}
                {slot.type === 'coding' && (
                  <CodingForm data={codingForm} onChange={setCodingForm} onSubmit={handleCodingSubmit} editing={Boolean(editingQId && questions[currentSlotIdx])} />
                )}
              </div>

              {/* Nav footer */}
              <div className="px-6 pb-5 flex items-center justify-between border-t border-gray-100 pt-4">
                <button
                  disabled={currentSlotIdx === 0}
                  onClick={() => setCurrentSlotIdx(i => i - 1)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <div className="flex items-center gap-3">
                  <button
                    disabled={currentSlotIdx === totalSlots - 1}
                    onClick={() => setCurrentSlotIdx(i => i + 1)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                  {allDone && (
                    <button
                      onClick={() => navigate('/faculty/manage-contests')}
                      className="px-5 py-2 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 flex items-center gap-2 shadow-sm shadow-green-200 transition-colors">
                      <Sparkles className="w-4 h-4" /> Finish & Publish
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ────────────────── FREE-LIST MODE (no URL params / edit existing) ── */
  const TAB_OPTIONS = [
    { key: 'MCQ',    label: 'Add MCQ',           Icon: CheckCircle2 },
    { key: 'Theory', label: 'Add Theory Q&A',    Icon: BookOpen },
    { key: 'Coding', label: 'Add Coding',         Icon: Code },
  ];

  return (
    <div className="max-w-[1200px] mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
        <button onClick={() => navigate('/faculty/manage-contests')}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Manage Questions</h1>
          <p className="text-sm text-gray-500 mt-1">{contest.title} • {questions.length} questions added</p>
        </div>
        {editingQId && (
          <button
            onClick={() => { setEditingQId(null); setMcqForm({ ...emptyMCQ }); setTheoryForm({ ...emptyTheory }); setCodingForm({ ...emptyCoding }); }}
            className="px-4 py-2 bg-red-50 text-red-600 font-bold text-sm rounded-lg hover:bg-red-100 flex items-center gap-2">
            <XCircle className="w-4 h-4" /> Cancel Edit
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form panel */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50 px-6 pt-4">
              {TAB_OPTIONS.map(({ key, label, Icon }) => {
                const meta = TYPE_META[key.toLowerCase()];
                return (
                  <button key={key}
                    onClick={() => setFreeTab(key)}
                    className={`pb-3 px-4 text-[13px] font-bold border-b-2 transition-colors flex items-center gap-2 mr-1
                      ${freeTab === key ? meta.tabActive : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                    <Icon className="w-4 h-4" /> {label}
                  </button>
                );
              })}
            </div>
            <div className="p-6">
              {freeTab === 'MCQ' && (
                <MCQForm data={mcqForm} onChange={setMcqForm}
                  onSubmit={(e) => { e.preventDefault(); handleFreeSave('MCQ', mcqForm); }}
                  editing={Boolean(editingQId)} />
              )}
              {freeTab === 'Theory' && (
                <TheoryForm data={theoryForm} onChange={setTheoryForm}
                  onSubmit={(e) => { e.preventDefault(); handleFreeSave('Theory', theoryForm); }}
                  editing={Boolean(editingQId)} />
              )}
              {freeTab === 'Coding' && (
                <CodingForm data={codingForm} onChange={setCodingForm}
                  onSubmit={(e) => { e.preventDefault(); handleFreeSave('Coding', codingForm); }}
                  editing={Boolean(editingQId)} />
              )}
            </div>
          </div>
        </div>

        {/* Question list */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center justify-between">
            Added Questions
            <span className="bg-blue-100 text-blue-600 text-xs px-2.5 py-1 rounded-full">{questions.length}</span>
          </h3>
          <div className="space-y-3 max-h-[800px] overflow-y-auto pr-1">
            {questions.length === 0 ? (
              <div className="bg-gray-50 border border-gray-100 border-dashed rounded-xl p-8 text-center">
                <HelpCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-600">No questions yet</p>
                <p className="text-xs text-gray-400 mt-1">Add your first question using the form.</p>
              </div>
            ) : (
              questions.map((q, idx) => {
                const typeKey = (q.type || '').toLowerCase();
                const meta    = TYPE_META[typeKey] || TYPE_META.mcq;
                const Icon    = meta.icon;
                return (
                  <div key={q.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm relative group">
                    <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { handleEdit(q); setFreeTab(q.type); }}
                        className="text-gray-400 hover:text-blue-500 transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(q.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${meta.badgeCls}`}>
                        {meta.label}
                      </span>
                      <span className="text-xs font-bold text-gray-400">Q{idx + 1} • {q.marks} Marks</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 line-clamp-2">
                      {q.type === 'Coding' ? q.title : q.question}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
