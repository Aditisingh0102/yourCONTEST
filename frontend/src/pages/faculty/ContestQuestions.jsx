import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Code, CheckCircle2, Trash2, HelpCircle } from 'lucide-react';
import { getContests, updateContest } from '../../api';

export default function ContestQuestions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [dbContestId, setDbContestId] = useState(null);
  
  const [activeTab, setActiveTab] = useState('MCQ');
  const [questions, setQuestions] = useState([]);
  
  // MCQ Form
  const [mcqForm, setMcqForm] = useState({ question: '', options: ['', '', '', ''], correctOption: 0, marks: 1 });
  
  // Coding Form
  const [codingForm, setCodingForm] = useState({ 
    title: '', problemStatement: '', inputFormat: '', outputFormat: '', 
    constraints: '', sampleInput: '', sampleOutput: '', marks: 10 
  });

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

  const saveQuestions = async (updatedList) => {
    setQuestions(updatedList);
    if (dbContestId) {
      try {
        await updateContest(dbContestId, { questionList: updatedList, questions: updatedList.length });
      } catch(err) {
        console.error("Error saving questions", err);
      }
    }
  };

  const handleAddMCQ = (e) => {
    e.preventDefault();
    if (!mcqForm.question) return;
    const newQ = { id: Date.now(), type: 'MCQ', ...mcqForm };
    saveQuestions([...questions, newQ]);
    setMcqForm({ question: '', options: ['', '', '', ''], correctOption: 0, marks: 1 });
  };

  const handleAddCoding = (e) => {
    e.preventDefault();
    if (!codingForm.title) return;
    const newQ = { id: Date.now(), type: 'Coding', ...codingForm };
    saveQuestions([...questions, newQ]);
    setCodingForm({ title: '', problemStatement: '', inputFormat: '', outputFormat: '', constraints: '', sampleInput: '', sampleOutput: '', marks: 10 });
  };

  const handleDelete = (qId) => {
    saveQuestions(questions.filter(q => q.id !== qId));
  };

  if (!contest) return <div className="p-8 text-center text-gray-500">Loading contest...</div>;

  return (
    <div className="max-w-[1200px] mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
        <button onClick={() => navigate('/faculty/manage-contests')} className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Questions</h1>
          <p className="text-sm text-gray-500 mt-1">{contest.title} • {contest.questions} Total Questions Planned</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-100 bg-gray-50 px-6 pt-4">
               <button onClick={() => setActiveTab('MCQ')} className={`pb-3 px-4 text-[13px] font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'MCQ' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                 <CheckCircle2 className="w-4 h-4" /> Add MCQ
               </button>
               <button onClick={() => setActiveTab('Coding')} className={`pb-3 px-4 text-[13px] font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'Coding' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                 <Code className="w-4 h-4" /> Add Coding Question
               </button>
            </div>

            <div className="p-6">
              {activeTab === 'MCQ' ? (
                <form onSubmit={handleAddMCQ} className="space-y-5">
                  <div>
                    <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Question Text</label>
                    <textarea 
                      required
                      rows="3"
                      value={mcqForm.question}
                      onChange={e => setMcqForm({...mcqForm, question: e.target.value})}
                      placeholder="Enter the question..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 transition-all text-sm resize-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[13px] font-bold text-gray-700">Options</label>
                    {mcqForm.options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          name="correctOpt" 
                          checked={mcqForm.correctOption === idx}
                          onChange={() => setMcqForm({...mcqForm, correctOption: idx})}
                          className="w-4 h-4 text-blue-600"
                        />
                        <input 
                          required
                          type="text" 
                          value={opt}
                          onChange={e => {
                            const newOpts = [...mcqForm.options];
                            newOpts[idx] = e.target.value;
                            setMcqForm({...mcqForm, options: newOpts});
                          }}
                          placeholder={`Option ${idx + 1}`}
                          className="flex-1 px-4 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 transition-all text-sm"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 items-end">
                    <div className="w-32">
                      <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Marks</label>
                      <input 
                        type="number" 
                        value={mcqForm.marks}
                        onChange={e => setMcqForm({...mcqForm, marks: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 transition-all text-sm"
                      />
                    </div>
                    <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white font-bold text-[14px] rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" /> Save MCQ
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleAddCoding} className="space-y-5">
                  <div>
                    <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Problem Title</label>
                    <input 
                      required
                      type="text" 
                      value={codingForm.title}
                      onChange={e => setCodingForm({...codingForm, title: e.target.value})}
                      placeholder="E.g. Find the Missing Number"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Problem Statement</label>
                    <textarea 
                      required
                      rows="4"
                      value={codingForm.problemStatement}
                      onChange={e => setCodingForm({...codingForm, problemStatement: e.target.value})}
                      placeholder="Describe the coding problem in detail..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 transition-all text-sm resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Input Format</label>
                      <textarea 
                        required rows="2"
                        value={codingForm.inputFormat}
                        onChange={e => setCodingForm({...codingForm, inputFormat: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 transition-all text-sm resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Output Format</label>
                      <textarea 
                        required rows="2"
                        value={codingForm.outputFormat}
                        onChange={e => setCodingForm({...codingForm, outputFormat: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 transition-all text-sm resize-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Sample Input</label>
                      <textarea 
                        required rows="3"
                        value={codingForm.sampleInput}
                        onChange={e => setCodingForm({...codingForm, sampleInput: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-mono text-sm resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Sample Output</label>
                      <textarea 
                        required rows="3"
                        value={codingForm.sampleOutput}
                        onChange={e => setCodingForm({...codingForm, sampleOutput: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-mono text-sm resize-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 items-end">
                    <div className="w-32">
                      <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Marks</label>
                      <input 
                        type="number" 
                        value={codingForm.marks}
                        onChange={e => setCodingForm({...codingForm, marks: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 transition-all text-sm"
                      />
                    </div>
                    <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white font-bold text-[14px] rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" /> Save Coding Problem
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center justify-between">
            Added Questions
            <span className="bg-blue-100 text-blue-600 text-xs px-2.5 py-1 rounded-full">{questions.length} / {contest.questions}</span>
          </h3>
          
          <div className="space-y-3 max-h-[800px] overflow-y-auto pr-2">
            {questions.length === 0 ? (
              <div className="bg-gray-50 border border-gray-100 border-dashed rounded-xl p-8 text-center">
                <HelpCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-600">No questions yet</p>
                <p className="text-xs text-gray-400 mt-1">Add your first question using the form.</p>
              </div>
            ) : (
              questions.map((q, idx) => (
                <div key={q.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm relative group">
                  <button 
                    onClick={() => handleDelete(q.id)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${q.type === 'MCQ' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                      {q.type}
                    </span>
                    <span className="text-xs font-bold text-gray-400">Q{idx + 1} • {q.marks} Marks</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 line-clamp-2">
                    {q.type === 'MCQ' ? q.question : q.title}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
