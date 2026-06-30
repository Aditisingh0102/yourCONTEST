import React, { useState } from 'react';
import { Upload, XCircle, FileText } from 'lucide-react';
import { uploadQuestionsDocument, createQuestion } from '../../api';

export default function BulkUploadModal({ onClose, onSuccess }) {
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

  const handleImport = async () => {
    const toImport = parsed.filter(q => selected.has(q.id));
    if (toImport.length === 0) return;
    
    setLoading(true);
    try {
      await createQuestion(toImport); // This triggers the bulk upload POST /api/questions array
      onSuccess(toImport.length);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save questions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
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
                <input type="file" id="docUpload" className="hidden" accept=".txt,.pdf,.docx,.xlsx,.csv" onChange={e => setFile(e.target.files[0])} />
                <label htmlFor="docUpload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-10 h-10 text-gray-400 mb-3" />
                  <p className="text-sm font-bold text-gray-700">{file ? file.name : 'Click to select a document'}</p>
                  <p className="text-xs text-gray-500 mt-1">Supports .txt, .pdf, .docx, .xlsx, .csv</p>
                </label>
              </div>
              {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
              
              <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm">
                <p className="font-bold mb-1">Expected Format Example:</p>
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
                <p className="text-sm font-bold text-gray-700">Found {parsed.length} questions</p>
                <button 
                  onClick={() => setSelected(selected.size === parsed.length ? new Set() : new Set(parsed.map(q => q.id)))}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700">
                  {selected.size === parsed.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              {parsed.map((q, i) => (
                <div key={q.id} className="flex gap-3 p-3 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors cursor-pointer" onClick={() => toggleSelect(q.id)}>
                  <input type="checkbox" checked={selected.has(q.id)} onChange={() => toggleSelect(q.id)} className="mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">Q{i+1}. {q.question}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                      {q.options.map((opt, oIdx) => (
                        <span key={oIdx} className={`text-xs ${oIdx === q.correctOption ? 'text-green-600 font-bold' : 'text-gray-500'}`}>
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
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            Cancel
          </button>
          {parsed.length === 0 ? (
            <button onClick={handleUpload} disabled={!file || loading} className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-2">
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Upload & Parse
            </button>
          ) : (
            <button onClick={handleImport} disabled={selected.size === 0} className="px-5 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-xl transition-colors">
              Import Selected ({selected.size})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
