import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Plus, Code, CheckCircle2, Trash2, BookOpen,
  HelpCircle, Edit2, XCircle, ChevronRight, ChevronLeft,
  LayoutList, Sparkles, Check, Clock, Upload, FileText
} from 'lucide-react';
import { getContests, updateContest, uploadQuestionsDocument } from '../../api';

/* ─── Import Modal ───────────────────────────────────────── */
function ImportModal({ onClose, onImport }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parsed, setParsed] = useState([]);
  const [selected, setSelected] = useState(new Set());

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('document', file);
    
    try {
      const res = await uploadQuestionsDocument(formData);
      if (res.data.questions && res.data.questions.length > 0) {
        setParsed(res.data.questions);
        setSelected(new Set(res.data.questions.map(q => q.id))); // select all by default
      } else {
        setError('No valid questions found in the document. Please check the format.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleImport = () => {
    const toImport = parsed.filter(q => selected.has(q.id));
    onImport(toImport);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" /> Import Questions
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {parsed.length === 0 ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors">
                <input type="file" id="docUpload" className="hidden" accept=".txt,.pdf,.docx" onChange={e => setFile(e.target.files[0])} />
                <label htmlFor="docUpload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-10 h-10 text-gray-400 mb-3" />
                  <p className="text-sm font-semibold text-gray-700">{file ? file.name : 'Click to select a document'}</p>
                  <p className="text-xs text-gray-500 mt-1">Supports .txt, .pdf, .docx</p>
                </label>
              </div>
              {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
              
              <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm">
                <p className="font-semibold mb-1">Expected Format Example:</p>
                <pre className="font-mono text-xs opacity-80 whitespace-pre-wrap">
{`1. What is React?
a) Library
b) Framework
c) Language
d) Tool
Answer: a`}
                </pre>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-semibold text-gray-700">Found {parsed.length} questions</p>
                <button 
                  onClick={() => setSelected(selected.size === parsed.length ? new Set() : new Set(parsed.map(q => q.id)))}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                  {selected.size === parsed.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              {parsed.map((q, i) => (
                <div key={q.id} className="flex gap-3 p-3 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors cursor-pointer" onClick={() => toggleSelect(q.id)}>
                  <input type="checkbox" checked={selected.has(q.id)} onChange={() => toggleSelect(q.id)} className="mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">Q{i+1}. {q.question}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                      {q.options.map((opt, oIdx) => (
                        <span key={oIdx} className={`text-xs ${oIdx === q.correctOption ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
                          {['A', 'B', 'C', 'D'][oIdx] || oIdx+1}. {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            Cancel
          </button>
          {parsed.length === 0 ? (
            <button onClick={handleUpload} disabled={!file || loading} className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-2">
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Upload & Parse
            </button>
          ) : (
            <button onClick={handleImport} disabled={selected.size === 0} className="px-5 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-xl transition-colors">
              Import Selected ({selected.size})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Question Bank Modal ───────────────────────────────── */
function QuestionBankModal({ onClose, onImport, currentQuestions = [] }) {
  const [allQuestions, setAllQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAllQuestions = async () => {
      try {
        const res = await getContests();
        const contests = res.data || [];
        const aggregated = [];
        contests.forEach((contest) => {
          const qs = contest.questionList || [];
          qs.forEach((q) => {
            if (!currentQuestions.some(cq => cq.id === q.id || (cq.question && cq.question === q.question) || (cq.title && cq.title === q.title))) {
              aggregated.push({ ...q, contestName: contest.title || contest.name || 'Untitled Contest' });
            }
          });
        });
        const unique = [];
        const seen = new Set();
        aggregated.forEach(q => {
           const identifier = q.id || q.question || q.title;
           if (!seen.has(identifier)) {
              seen.add(identifier);
              unique.push(q);
           }
        });
        setAllQuestions(unique);
      } catch (err) {
        console.error('Failed to fetch questions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllQuestions();
  }, [currentQuestions]);

  const filtered = allQuestions.filter((q) => {
    const text = (q.question || q.title || q.problemStatement || '').toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const toggleSelect = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleImport = () => {
    const toImport = allQuestions.filter(q => selected.has(q.id));
    onImport(toImport);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-500" /> Question Bank
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4 border-b border-gray-100">
          <input
            type="text"
            placeholder="Search questions by text or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 text-sm"
          />
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
          {loading ? (
             <div className="text-center text-gray-500 text-sm py-10">Loading questions...</div>
          ) : filtered.length === 0 ? (
             <div className="text-center text-gray-500 text-sm py-10">No questions found.</div>
          ) : (
            <div className="space-y-3">
              {filtered.map((q, i) => (
                <div key={q.id} className={`flex gap-3 p-4 bg-white border rounded-xl hover:border-purple-300 transition-colors cursor-pointer shadow-sm ${selected.has(q.id) ? 'border-purple-500 bg-purple-50/30' : 'border-gray-200'}`} onClick={() => toggleSelect(q.id)}>
                  <input type="checkbox" checked={selected.has(q.id)} onChange={() => toggleSelect(q.id)} className="mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{q.type}</span>
                      <span className="text-[11px] text-gray-400 font-medium">{q.contestName}</span>
                      <span className="text-[11px] font-semibold text-gray-500 ml-auto">{q.marks || 0} Marks</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 line-clamp-2">{q.type === 'Coding' ? q.title : q.question}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3 bg-white rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            Cancel
          </button>
          <button onClick={handleImport} disabled={selected.size === 0} className="px-5 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl transition-colors shadow-sm">
            Import Selected ({selected.size})
          </button>
        </div>
      </div>
    </div>
  );
}

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
const emptyCoding = { title: '', problemStatement: '', inputFormat: '', outputFormat: '', constraints: '', testCases: [{ input: '', output: '' }], hiddenTestCases: [{ input: '', output: '' }], marks: 10 };

/* ─── MCQ form ──────────────────────────────────────────── */
function MCQForm({ data, onChange, onSubmit, editing, error }) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <div className="mb-2">
          <p className="text-sm font-semibold text-red-500 flex items-center gap-2 bg-red-50 py-2 px-3 rounded-lg border border-red-100 inline-flex">
            <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-xs">!</span>
            {error}
          </p>
        </div>
      )}
      <div>
        <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Question Text</label>
        <textarea
          required rows="3"
          value={data.question}
          onChange={e => onChange({ ...data, question: e.target.value })}
          placeholder="Enter the question..."
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 transition-all text-sm resize-none"
        />
      </div>
      <div className="space-y-3">
        <label className="block text-[13px] font-semibold text-gray-700">Options</label>
        {data.options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span className="w-6 text-center text-sm font-semibold text-gray-400">{idx + 1}.</span>
            <input
              required type="text"
              value={opt}
              onChange={e => {
                const opts = [...data.options]; opts[idx] = e.target.value;
                onChange({ ...data, options: opts });
              }}
              placeholder={`Option ${idx + 1}`}
              className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm transition-all focus:outline-none focus:border-blue-500 bg-white"
            />
          </div>
        ))}
      </div>
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Correct Option</label>
          <select
            value={data.correctOption}
            onChange={e => onChange({ ...data, correctOption: parseInt(e.target.value) })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 text-sm"
          >
            {data.options.map((_, idx) => (
              <option key={idx} value={idx}>Option {idx + 1}</option>
            ))}
          </select>
        </div>
        <div className="w-32">
          <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Marks</label>
          <input type="number" min="1"
            value={data.marks}
            onChange={e => onChange({ ...data, marks: parseInt(e.target.value) || 1 })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>
        <button type="submit"
          className="flex-[2] py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-[14px] rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:from-blue-500 hover:to-indigo-500 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2">
          {editing ? <><Edit2 className="w-4 h-4" /> Update MCQ</> : <><Check className="w-4 h-4" /> Save MCQ</>}
        </button>
      </div>
    </form>
  );
}

/* ─── Theory Q&A form ───────────────────────────────────── */
function TheoryForm({ data, onChange, onSubmit, editing, error }) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <div className="mb-2">
          <p className="text-sm font-semibold text-red-500 flex items-center gap-2 bg-red-50 py-2 px-3 rounded-lg border border-red-100 inline-flex">
            <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-xs">!</span>
            {error}
          </p>
        </div>
      )}
      <div>
        <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Question / Topic</label>
        <textarea
          required rows="2"
          value={data.question}
          onChange={e => onChange({ ...data, question: e.target.value })}
          placeholder="e.g. Define polymorphism in OOP."
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-amber-400 transition-all text-sm resize-none"
        />
      </div>
      <div>
        <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
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
          <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Marks</label>
          <input type="number" min="1"
            value={data.marks}
            onChange={e => onChange({ ...data, marks: parseInt(e.target.value) || 1 })}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-amber-400 text-sm"
          />
        </div>
        <button type="submit"
          className="flex-1 py-2.5 bg-amber-500 text-white font-semibold text-[14px] rounded-xl hover:bg-amber-600 flex items-center justify-center gap-2 transition-colors">
          {editing ? <><Edit2 className="w-4 h-4" /> Update Question</> : <><Check className="w-4 h-4" /> Save Question</>}
        </button>
      </div>
    </form>
  );
}

/* ─── Coding form ───────────────────────────────────────── */
function CodingForm({ data, onChange, onSubmit, editing }) {
  const testCases = data.testCases || [{ input: '', output: '' }];
  const hiddenTestCases = data.hiddenTestCases || [{ input: '', output: '' }];

  const addTestCase = () => {
    onChange({ ...data, testCases: [...testCases, { input: '', output: '' }] });
  };
  const removeTestCase = (idx) => {
    const newTestCases = [...testCases];
    newTestCases.splice(idx, 1);
    onChange({ ...data, testCases: newTestCases });
  };
  const updateTestCase = (idx, field, value) => {
    const newTestCases = [...testCases];
    newTestCases[idx][field] = value;
    onChange({ ...data, testCases: newTestCases });
  };

  const addHiddenTestCase = () => {
    onChange({ ...data, hiddenTestCases: [...hiddenTestCases, { input: '', output: '' }] });
  };
  const removeHiddenTestCase = (idx) => {
    const newTestCases = [...hiddenTestCases];
    newTestCases.splice(idx, 1);
    onChange({ ...data, hiddenTestCases: newTestCases });
  };
  const updateHiddenTestCase = (idx, field, value) => {
    const newTestCases = [...hiddenTestCases];
    newTestCases[idx][field] = value;
    onChange({ ...data, hiddenTestCases: newTestCases });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <div className="mb-2">
          <p className="text-sm font-semibold text-red-500 flex items-center gap-2 bg-red-50 py-2 px-3 rounded-lg border border-red-100 inline-flex">
            <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-xs">!</span>
            {error}
          </p>
        </div>
      )}
      <div>
        <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Problem Title</label>
        <input required type="text"
          value={data.title}
          onChange={e => onChange({ ...data, title: e.target.value })}
          placeholder="E.g. Find the Missing Number"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-purple-500 transition-all text-sm"
        />
      </div>
      <div>
        <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Problem Statement</label>
        <textarea required rows="4"
          value={data.problemStatement}
          onChange={e => onChange({ ...data, problemStatement: e.target.value })}
          placeholder="Describe the coding problem in detail..."
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-purple-500 transition-all text-sm resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Input Format</label>
          <textarea required rows="2"
            value={data.inputFormat}
            onChange={e => onChange({ ...data, inputFormat: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-purple-500 text-sm resize-none"
          />
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Output Format</label>
          <textarea required rows="2"
            value={data.outputFormat}
            onChange={e => onChange({ ...data, outputFormat: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-purple-500 text-sm resize-none"
          />
        </div>
      </div>
      <div>
        <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Constraints
          <span className="text-gray-400 font-normal ml-1">(Optional)</span>
        </label>
        <input type="text"
          value={data.constraints}
          onChange={e => onChange({ ...data, constraints: e.target.value })}
          placeholder="e.g. 1 ≤ N ≤ 10^5, time limit: 1 sec"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-purple-500 text-sm"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-[13px] font-semibold text-gray-700">Sample Test Cases</label>
          <button type="button" onClick={addTestCase} className="text-purple-600 hover:text-purple-700 font-semibold text-sm flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Test Case
          </button>
        </div>
        {testCases.map((tc, idx) => (
          <div key={idx} className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 space-y-3 relative group">
            {testCases.length > 1 && (
              <button type="button" onClick={() => removeTestCase(idx)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <p className="text-xs font-semibold text-gray-500">Test Case {idx + 1}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Input</label>
                <textarea required rows="3"
                  value={tc.input}
                  onChange={e => updateTestCase(idx, 'input', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white font-mono text-sm resize-none focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Output</label>
                <textarea required rows="3"
                  value={tc.output}
                  onChange={e => updateTestCase(idx, 'output', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white font-mono text-sm resize-none focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-[13px] font-semibold text-gray-700">Hidden Test Cases (For Evaluation)</label>
          <button type="button" onClick={addHiddenTestCase} className="text-purple-600 hover:text-purple-700 font-semibold text-sm flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Hidden Test Case
          </button>
        </div>
        {hiddenTestCases.map((tc, idx) => (
          <div key={idx} className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 space-y-3 relative group">
            {hiddenTestCases.length > 1 && (
              <button type="button" onClick={() => removeHiddenTestCase(idx)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <p className="text-xs font-semibold text-gray-500">Hidden Test Case {idx + 1}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Hidden Input</label>
                <textarea required rows="3"
                  value={tc.input}
                  onChange={e => updateHiddenTestCase(idx, 'input', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white font-mono text-sm resize-none focus:outline-none focus:border-purple-500"
                  placeholder="Hidden from student..."
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Hidden Output</label>
                <textarea required rows="3"
                  value={tc.output}
                  onChange={e => updateHiddenTestCase(idx, 'output', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white font-mono text-sm resize-none focus:outline-none focus:border-purple-500"
                  placeholder="Hidden expected output..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 items-end">
        <div className="w-32">
          <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Marks</label>
          <input type="number" min="1"
            value={data.marks}
            onChange={e => onChange({ ...data, marks: parseInt(e.target.value) || 1 })}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-purple-500 text-sm"
          />
        </div>
        <button type="submit"
          className="flex-1 py-2.5 bg-purple-600 text-white font-semibold text-[14px] rounded-xl hover:bg-purple-700 flex items-center justify-center gap-2 transition-colors">
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
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all border
        ${active ? 'bg-blue-50 border-blue-200 shadow-sm' : 'border-transparent hover:bg-gray-50'}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
        bg-gradient-to-br ${meta.headerGrad}`}>
        {filled
          ? <Check className="w-4 h-4 text-white" strokeWidth={3} />
          : <Icon className="w-3.5 h-3.5 text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[12px] font-semibold truncate ${active ? 'text-blue-900' : 'text-gray-800'}`}>
          {meta.label} #{slot.localIdx}
        </p>
        <p className={`text-[11px] truncate ${active ? 'text-blue-600/70' : 'text-gray-400'}`}>
          {filled ? '✓ Saved' : 'Pending'}
        </p>
      </div>
      {active && <ChevronRight className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />}
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
  const [showImportModal, setShowImportModal] = useState(false);
  const [showQuestionBankModal, setShowQuestionBankModal] = useState(false);

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
      if (slot.type === 'coding') setCodingForm({ title: slotQ.title, problemStatement: slotQ.problemStatement, inputFormat: slotQ.inputFormat, outputFormat: slotQ.outputFormat, constraints: slotQ.constraints || '', testCases: slotQ.testCases || (slotQ.sampleInput ? [{ input: slotQ.sampleInput, output: slotQ.sampleOutput }] : [{ input: '', output: '' }]), hiddenTestCases: slotQ.hiddenTestCases || (slotQ.hiddenInput ? [{ input: slotQ.hiddenInput, output: slotQ.hiddenOutput }] : [{ input: '', output: '' }]), marks: slotQ.marks });
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

  const isDuplicateQuestion = (newText, currentId, currentIndex) => {
    if (!newText) return false;
    const normalized = newText.toLowerCase().trim();
    return questions.some((q, idx) => {
      if (!q) return false;
      if (currentId && q.id === currentId) return false;
      if (currentIndex !== undefined && idx === currentIndex) return false;
      
      if (q.type === 'Coding') {
        return q.title?.toLowerCase().trim() === normalized || q.problemStatement?.toLowerCase().trim() === normalized;
      }
      return q.question?.toLowerCase().trim() === normalized;
    });
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

  const currentMcqError = useMemo(() => {
    const opts = mcqForm.options.map(o => o.trim()).filter(Boolean);
    if (new Set(opts).size !== opts.length) return "Options cannot be repeated.";
    if (isDuplicateQuestion(mcqForm.question, editingQId, currentSlotIdx)) return "This question already exists in the contest.";
    return null;
  }, [mcqForm, questions, editingQId, currentSlotIdx]);

  const currentTheoryError = useMemo(() => {
    if (isDuplicateQuestion(theoryForm.question, editingQId, currentSlotIdx)) return "This question already exists in the contest.";
    return null;
  }, [theoryForm, questions, editingQId, currentSlotIdx]);

  const currentCodingError = useMemo(() => {
    if (isDuplicateQuestion(codingForm.title, editingQId, currentSlotIdx) || isDuplicateQuestion(codingForm.problemStatement, editingQId, currentSlotIdx)) return "This problem already exists in the contest.";
    return null;
  }, [codingForm, questions, editingQId, currentSlotIdx]);

  const freeMcqError = useMemo(() => {
    const opts = mcqForm.options.map(o => o.trim()).filter(Boolean);
    if (new Set(opts).size !== opts.length) return "Options cannot be repeated.";
    if (isDuplicateQuestion(mcqForm.question, editingQId)) return "This question already exists in the contest.";
    return null;
  }, [mcqForm, questions, editingQId]);

  const freeTheoryError = useMemo(() => {
    if (isDuplicateQuestion(theoryForm.question, editingQId)) return "This question already exists in the contest.";
    return null;
  }, [theoryForm, questions, editingQId]);

  const freeCodingError = useMemo(() => {
    if (isDuplicateQuestion(codingForm.title, editingQId) || isDuplicateQuestion(codingForm.problemStatement, editingQId)) return "This problem already exists in the contest.";
    return null;
  }, [codingForm, questions, editingQId]);

  const handleMCQSubmit = (e) => {
    e.preventDefault();
    if (currentMcqError) return;
    saveSlot({ type: 'MCQ', ...mcqForm });
  };
  const handleTheorySubmit = (e) => {
    e.preventDefault();
    if (currentTheoryError) return;
    saveSlot({ type: 'Theory', ...theoryForm });
  };
  const handleCodingSubmit = (e) => {
    e.preventDefault();
    if (currentCodingError) return;
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
    if (q.type === 'Coding') setCodingForm({ title: q.title, problemStatement: q.problemStatement, inputFormat: q.inputFormat, outputFormat: q.outputFormat, constraints: q.constraints || '', testCases: q.testCases || (q.sampleInput ? [{ input: q.sampleInput, output: q.sampleOutput }] : [{ input: '', output: '' }]), hiddenTestCases: q.hiddenTestCases || (q.hiddenInput ? [{ input: q.hiddenInput, output: q.hiddenOutput }] : [{ input: '', output: '' }]), marks: q.marks });
  };

  /* ── Free-list save (no slots) */
  const [freeTab, setFreeTab] = useState('MCQ');
  const handleFreeSave = (type, data) => {
    if (type === 'MCQ' && freeMcqError) return;
    if (type === 'Theory' && freeTheoryError) return;
    if (type === 'Coding' && freeCodingError) return;

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
            <h1 className="text-2xl font-semibold text-gray-900">Add Questions</h1>
            <p className="text-sm text-gray-500 mt-0.5">{contest.title}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowQuestionBankModal(true)}
              className="px-4 py-2 bg-purple-50 text-purple-600 font-semibold text-sm rounded-lg hover:bg-purple-100 flex items-center gap-2 transition-colors">
              <BookOpen className="w-4 h-4" /> Question Bank
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 bg-blue-50 text-blue-600 font-semibold text-sm rounded-lg hover:bg-blue-100 flex items-center gap-2 transition-colors">
              <Upload className="w-4 h-4" /> Import Document
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-semibold text-gray-700">Progress</span>
            <span className="text-[13px] font-semibold text-gray-500">{doneCount} / {totalSlots} questions saved</span>
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
                <span key={t} className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${m.badgeCls}`}>
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
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
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
                    <p className="text-white font-semibold text-[15px]">{meta.label} #{slot.localIdx}</p>
                    <p className="text-white/70 text-[12px]">{meta.fullLabel}</p>
                  </div>
                </div>
                <span className="bg-white/20 text-white text-[12px] font-semibold px-3 py-1 rounded-full">
                  {currentSlotIdx + 1} of {totalSlots}
                </span>
              </div>

              {/* Form body */}
              <div className="p-6">
                {slot.type === 'mcq' && (
                  <MCQForm error={currentMcqError} data={mcqForm} onChange={setMcqForm} onSubmit={handleMCQSubmit} editing={Boolean(editingQId && questions[currentSlotIdx])} />
                )}
                {slot.type === 'theory' && (
                  <TheoryForm error={currentTheoryError} data={theoryForm} onChange={setTheoryForm} onSubmit={handleTheorySubmit} editing={Boolean(editingQId && questions[currentSlotIdx])} />
                )}
                {slot.type === 'coding' && (
                  <CodingForm error={currentCodingError} data={codingForm} onChange={setCodingForm} onSubmit={handleCodingSubmit} editing={Boolean(editingQId && questions[currentSlotIdx])} />
                )}
              </div>

              {/* Nav footer */}
              <div className="px-6 pb-5 flex items-center justify-between border-t border-gray-100 pt-4">
                <button
                  disabled={currentSlotIdx === 0}
                  onClick={() => setCurrentSlotIdx(i => i - 1)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <div className="flex items-center gap-3">
                  <button
                    disabled={currentSlotIdx === totalSlots - 1}
                    onClick={() => setCurrentSlotIdx(i => i + 1)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                  {allDone && (
                    <button
                      onClick={() => navigate('/faculty/manage-contests')}
                      className="px-5 py-2 bg-green-600 text-white font-semibold text-sm rounded-xl hover:bg-green-700 flex items-center gap-2 shadow-sm shadow-green-200 transition-colors">
                      <Sparkles className="w-4 h-4" /> Finish & Publish
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {showImportModal && (
          <ImportModal 
            onClose={() => setShowImportModal(false)} 
            onImport={(importedQuestions) => {
              const nextQuestions = [...questions, ...importedQuestions];
              persist(nextQuestions);
              setShowImportModal(false);
            }} 
          />
        )}

        {showQuestionBankModal && (
          <QuestionBankModal
            onClose={() => setShowQuestionBankModal(false)}
            currentQuestions={questions}
            onImport={(importedQuestions) => {
              const nextQuestions = [...questions, ...importedQuestions];
              persist(nextQuestions);
              setShowQuestionBankModal(false);
            }}
          />
        )}
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
          <h1 className="text-2xl font-semibold text-gray-900">Manage Questions</h1>
          <p className="text-sm text-gray-500 mt-1">{contest.title} • {questions.length} questions added</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowQuestionBankModal(true)}
            className="px-4 py-2 bg-purple-50 text-purple-600 font-semibold text-sm rounded-lg hover:bg-purple-100 flex items-center gap-2 transition-colors">
            <BookOpen className="w-4 h-4" /> Question Bank
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-blue-50 text-blue-600 font-semibold text-sm rounded-lg hover:bg-blue-100 flex items-center gap-2 transition-colors">
            <Upload className="w-4 h-4" /> Import Document
          </button>
        </div>
        {editingQId && (
          <button
            onClick={() => { setEditingQId(null); setMcqForm({ ...emptyMCQ }); setTheoryForm({ ...emptyTheory }); setCodingForm({ ...emptyCoding }); }}
            className="px-4 py-2 bg-red-50 text-red-600 font-semibold text-sm rounded-lg hover:bg-red-100 flex items-center gap-2">
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
                    className={`pb-3 px-4 text-[13px] font-semibold border-b-2 transition-colors flex items-center gap-2 mr-1
                      ${freeTab === key ? meta.tabActive : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                    <Icon className="w-4 h-4" /> {label}
                  </button>
                );
              })}
            </div>
            <div className="p-6">
              {freeTab === 'MCQ' && (
                <MCQForm error={freeMcqError} data={mcqForm} onChange={setMcqForm}
                  onSubmit={(e) => { e.preventDefault(); handleFreeSave('MCQ', mcqForm); }}
                  editing={Boolean(editingQId)} />
              )}
              {freeTab === 'Theory' && (
                <TheoryForm error={freeTheoryError} data={theoryForm} onChange={setTheoryForm}
                  onSubmit={(e) => { e.preventDefault(); handleFreeSave('Theory', theoryForm); }}
                  editing={Boolean(editingQId)} />
              )}
              {freeTab === 'Coding' && (
                <CodingForm error={freeCodingError} data={codingForm} onChange={setCodingForm}
                  onSubmit={(e) => { e.preventDefault(); handleFreeSave('Coding', codingForm); }}
                  editing={Boolean(editingQId)} />
              )}
            </div>
          </div>
        </div>

        {/* Question list */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-between">
            Added Questions
            <span className="bg-blue-100 text-blue-600 text-xs px-2.5 py-1 rounded-full">{questions.length}</span>
          </h3>
          <div className="space-y-3 max-h-[800px] overflow-y-auto pr-1">
            {questions.length === 0 ? (
              <div className="bg-gray-50 border border-gray-100 border-dashed rounded-xl p-8 text-center">
                <HelpCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-600">No questions yet</p>
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
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase ${meta.badgeCls}`}>
                        {meta.label}
                      </span>
                      <span className="text-xs font-semibold text-gray-400">Q{idx + 1} • {q.marks} Marks</span>
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
      
      {showImportModal && (
        <ImportModal 
          onClose={() => setShowImportModal(false)} 
          onImport={(importedQuestions) => {
            const nextQuestions = [...questions, ...importedQuestions];
            persist(nextQuestions);
            setShowImportModal(false);
          }} 
        />
      )}

      {showQuestionBankModal && (
        <QuestionBankModal
          onClose={() => setShowQuestionBankModal(false)}
          currentQuestions={questions}
          onImport={(importedQuestions) => {
            const nextQuestions = [...questions, ...importedQuestions];
            persist(nextQuestions);
            setShowQuestionBankModal(false);
          }}
        />
      )}
    </div>
  );
}
