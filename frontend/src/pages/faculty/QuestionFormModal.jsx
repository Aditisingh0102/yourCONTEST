import React, { useState } from 'react';
import { XCircle, CheckCircle2, BookOpen, Code, Layers } from 'lucide-react';
import { TYPE_META, emptyMCQ, emptyTheory, emptyCoding, MCQForm, TheoryForm, CodingForm } from './QuestionForms';
import { createQuestion } from '../../api';

export default function QuestionFormModal({ onClose, onSuccess }) {
  const [selectedType, setSelectedType] = useState('mcq');
  const [formData, setFormData] = useState(emptyMCQ);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTypeChange = (type) => {
    setSelectedType(type);
    if (type === 'mcq') setFormData(emptyMCQ);
    else if (type === 'theory') setFormData(emptyTheory);
    else if (type === 'coding') setFormData(emptyCoding);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = { ...formData, type: selectedType === 'mcq' ? 'MCQ' : selectedType === 'theory' ? 'Theory' : 'Coding' };
      await createQuestion(payload);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500" /> Create Question
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
          {/* Question Type Selector */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {Object.entries(TYPE_META).map(([key, meta]) => {
              const Icon = meta.icon;
              const isActive = selectedType === key;
              return (
                <button
                  key={key}
                  onClick={() => handleTypeChange(key)}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all overflow-hidden ${
                    isActive 
                      ? `${meta.tabActive} bg-white shadow-sm ring-4 ring-gray-50/50` 
                      : 'border-transparent bg-white text-gray-500 hover:border-gray-200 shadow-sm'
                  }`}
                >
                  {isActive && <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${meta.headerGrad} opacity-10 rounded-bl-full`} />}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${isActive ? meta.badgeCls : 'bg-gray-100 text-gray-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className={`font-bold ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>{meta.label}</h3>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">{meta.fullLabel}</p>
                </button>
              );
            })}
          </div>

          {/* Form */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${TYPE_META[selectedType].badgeCls}`}>
                {React.createElement(TYPE_META[selectedType].icon, { className: "w-4 h-4" })}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">New {TYPE_META[selectedType].label}</h3>
                <p className="text-xs text-gray-500 font-medium">Independent question for Question Bank</p>
              </div>
            </div>

            {selectedType === 'mcq' && <MCQForm data={formData} onChange={setFormData} onSubmit={handleSubmit} error={error} />}
            {selectedType === 'theory' && <TheoryForm data={formData} onChange={setFormData} onSubmit={handleSubmit} error={error} />}
            {selectedType === 'coding' && <CodingForm data={formData} onChange={setFormData} onSubmit={handleSubmit} error={error} />}
          </div>
        </div>
      </div>
    </div>
  );
}
