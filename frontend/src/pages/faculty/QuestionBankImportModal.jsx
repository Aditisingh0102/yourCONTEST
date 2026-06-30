import React, { useState, useEffect } from 'react';
import { XCircle, BookOpen, Layers } from 'lucide-react';
import { getQuestions } from '../../api';

export default function QuestionBankImportModal({ onClose, onImport }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    getQuestions().then(res => {
      setQuestions(res.data || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const toggleSelect = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleImport = () => {
    const toImport = questions.filter(q => selected.has(q._id || q.id));
    onImport(toImport);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" /> Question Bank
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <p className="text-center text-sm text-gray-500 py-10">Loading questions...</p>
          ) : questions.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <Layers className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-500">No independent questions available.</p>
              <p className="text-xs text-gray-400">Go to Question Bank to create or upload questions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-bold text-gray-700">Available ({questions.length})</p>
                <button 
                  onClick={() => setSelected(selected.size === questions.length ? new Set() : new Set(questions.map(q => q._id || q.id)))}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
                  {selected.size === questions.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              {questions.map((q, i) => (
                <div key={q._id || q.id} className="flex gap-3 p-3 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors cursor-pointer" onClick={() => toggleSelect(q._id || q.id)}>
                  <input type="checkbox" checked={selected.has(q._id || q.id)} onChange={() => toggleSelect(q._id || q.id)} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">{q.type}</span>
                      <span className="text-[10px] font-bold text-gray-400">{q.marks} Marks</span>
                    </div>
                    <p className="text-sm font-bold text-gray-800 line-clamp-2">{q.question || q.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            Cancel
          </button>
          <button onClick={handleImport} disabled={selected.size === 0} className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors">
            Import Selected ({selected.size})
          </button>
        </div>
      </div>
    </div>
  );
}
