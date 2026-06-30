import React from 'react';
import { Edit2, Check, Plus, Trash2, CheckCircle2, BookOpen, Code } from 'lucide-react';

export const TYPE_META = {
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

export const emptyMCQ    = { question: '', options: ['', '', '', ''], correctOption: 0, marks: 1 };
export const emptyTheory = { question: '', answer: '', marks: 5 };
export const emptyCoding = { title: '', problemStatement: '', inputFormat: '', outputFormat: '', constraints: '', testCases: [{ input: '', output: '' }], hiddenTestCases: [{ input: '', output: '' }], marks: 10 };

export function MCQForm({ data, onChange, onSubmit, editing, error }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-5">
      {error && (
        <div className="mb-2">
          <p className="text-sm font-bold text-red-500 flex items-center gap-2 bg-red-50 py-2 px-3 rounded-lg border border-red-100 inline-flex">
            <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-xs">!</span>
            {error}
          </p>
        </div>
      )}
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
        <label className="block text-[13px] font-bold text-gray-700">Options</label>
        {data.options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span className="w-6 text-center text-sm font-bold text-gray-400">{idx + 1}.</span>
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
          <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Correct Option</label>
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
          <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Marks</label>
          <input type="number" min="1"
            value={data.marks}
            onChange={e => onChange({ ...data, marks: parseInt(e.target.value) || 1 })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>
        <button type="submit"
          className="flex-[2] py-2.5 bg-blue-600 text-white font-bold text-[14px] rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors">
          {editing ? <><Edit2 className="w-4 h-4" /> Update MCQ</> : <><Check className="w-4 h-4" /> Save MCQ</>}
        </button>
      </div>
    </form>
  );
}

export function TheoryForm({ data, onChange, onSubmit, editing, error }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-5">
      {error && (
        <div className="mb-2">
          <p className="text-sm font-bold text-red-500 flex items-center gap-2 bg-red-50 py-2 px-3 rounded-lg border border-red-100 inline-flex">
            <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-xs">!</span>
            {error}
          </p>
        </div>
      )}
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

export function CodingForm({ data, onChange, onSubmit, editing, error }) {
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
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-5">
      {error && (
        <div className="mb-2">
          <p className="text-sm font-bold text-red-500 flex items-center gap-2 bg-red-50 py-2 px-3 rounded-lg border border-red-100 inline-flex">
            <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-xs">!</span>
            {error}
          </p>
        </div>
      )}
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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-[13px] font-bold text-gray-700">Sample Test Cases</label>
          <button type="button" onClick={addTestCase} className="text-purple-600 hover:text-purple-700 font-bold text-sm flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Test Case
          </button>
        </div>
        {testCases.map((tc, idx) => (
          <div key={idx} className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 space-y-3 relative group">
            {testCases.length > 1 && (
              <button type="button" onClick={() => removeTestCase(idx)} className="absolute -top-3 -right-3 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Input</label>
                <textarea rows="2" required value={tc.input} onChange={e => updateTestCase(idx, 'input', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 outline-none text-xs font-mono" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Expected Output</label>
                <textarea rows="2" required value={tc.output} onChange={e => updateTestCase(idx, 'output', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 outline-none text-xs font-mono" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-[13px] font-bold text-gray-700">Hidden Test Cases</label>
          <button type="button" onClick={addHiddenTestCase} className="text-purple-600 hover:text-purple-700 font-bold text-sm flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Hidden Test Case
          </button>
        </div>
        {hiddenTestCases.map((tc, idx) => (
          <div key={idx} className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 space-y-3 relative group">
            {hiddenTestCases.length > 1 && (
              <button type="button" onClick={() => removeHiddenTestCase(idx)} className="absolute -top-3 -right-3 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Input</label>
                <textarea rows="2" required value={tc.input} onChange={e => updateHiddenTestCase(idx, 'input', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 outline-none text-xs font-mono" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Expected Output</label>
                <textarea rows="2" required value={tc.output} onChange={e => updateHiddenTestCase(idx, 'output', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 outline-none text-xs font-mono" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 items-center justify-end pt-4 border-t border-gray-100">
        <div className="w-32">
          <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Marks</label>
          <input type="number" min="1" required
            value={data.marks}
            onChange={e => onChange({ ...data, marks: parseInt(e.target.value) || 1 })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-purple-500 text-sm"
          />
        </div>
        <button type="submit"
          className="px-6 py-2.5 bg-purple-600 text-white font-bold text-[14px] rounded-xl hover:bg-purple-700 flex items-center justify-center gap-2 transition-colors mt-6">
          {editing ? <><Edit2 className="w-4 h-4" /> Update Coding Question</> : <><Check className="w-4 h-4" /> Save Coding Question</>}
        </button>
      </div>
    </form>
  );
}
