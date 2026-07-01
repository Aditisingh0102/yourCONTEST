import { useState, useMemo, useEffect } from 'react';
import { X, Check, CheckCircle, XCircle, FileBarChart, Clock, RefreshCcw, AlertCircle } from 'lucide-react';
import { deleteSubmission, updateSubmission } from '../../api';

export default function AnalyticsModal({ contest, submissions, onClose, initialStudent = null }) {
  const [selectedStudent, setSelectedStudent] = useState(initialStudent);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [extendPrompt, setExtendPrompt] = useState({ show: false, minutes: '' });

  const totalMarks = contest?.questionList?.reduce((acc, q) => acc + q.marks, 0) || 0;

  // Deduplicate submissions strictly by studentName/studentId keeping the most recent
  const uniqueSubmissions = useMemo(() => {
    const map = new Map();
    submissions.forEach(sub => {
      const key = `${sub.studentId || sub.studentName}`;
      if (!map.has(key)) {
        map.set(key, sub);
      } else {
        const existing = map.get(key);
        if (new Date(sub.submittedAt) > new Date(existing.submittedAt)) {
          map.set(key, sub);
        }
      }
    });
    const arr = Array.from(map.values());
    arr.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    return arr;
  }, [submissions]);

  useEffect(() => {
    if (selectedStudent) {
      const updatedSub = uniqueSubmissions.find(s => s._id === selectedStudent._id);
      if (updatedSub && JSON.stringify(updatedSub.answers) !== JSON.stringify(selectedStudent.answers)) {
        let calculatedScore = 0;
        if (contest && contest.questionList && updatedSub.answers) {
          contest.questionList.forEach(q => {
            if (q.type === 'MCQ' && updatedSub.answers[q.id] === q.correctOption) {
              calculatedScore += q.marks || 0;
            }
          });
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedStudent({...updatedSub, calculatedScore});
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueSubmissions]);

  const handleRetest = async () => {
    if (!selectedStudent) return;
    
    try {
      await deleteSubmission(selectedStudent._id);
      setSelectedStudent(null);
      onClose();
    } catch(err) {
      console.error("Failed to allow retest:", err);
      alert("Failed to delete submission.");
    }
    setResetConfirm(false);
  };

  const handleExtend = async () => {
    if (!selectedStudent) return;
    const mins = parseInt(extendPrompt.minutes);
    if (!mins || isNaN(mins) || mins <= 0) return;
    
    try {
      await updateSubmission(selectedStudent._id, {
        extraTime: (selectedStudent.extraTime || 0) + mins,
        status: 'reopened'
      });
      alert(`Granted ${mins} extra minutes to ${selectedStudent.studentName}.`);
      onClose(); // Close modal so parent refreshes
    } catch(err) {
      console.error(err);
      alert("Failed to extend time");
    }
    setExtendPrompt({ show: false, minutes: '' });
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
              <FileBarChart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 leading-tight">Analytics: {contest?.title || contest?.name}</h2>
              <p className="text-sm text-gray-500 font-medium mt-0.5">
                {uniqueSubmissions.length} {uniqueSubmissions.length === 1 ? 'Submission' : 'Submissions'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Panel: Student List */}
          <div className={`w-full md:w-1/3 border-r border-gray-100 bg-gray-50 flex flex-col overflow-y-auto ${selectedStudent ? 'hidden md:flex' : 'flex'}`}>
            {uniqueSubmissions.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                No submissions found for this contest.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {uniqueSubmissions.map((sub, idx) => {
                  
                  // Calculate dynamic score based on correct options
                  let calculatedScore = 0;
                  if (contest && contest.questionList && sub.answers) {
                    contest.questionList.forEach(q => {
                      if (q.type === 'MCQ' && sub.answers[q.id] === q.correctOption) {
                        calculatedScore += q.marks || 0;
                      }
                    });
                  }

                  const isSelected = selectedStudent?._id === sub._id;
                  
                  return (
                    <button
                      key={sub._id || idx}
                      onClick={() => setSelectedStudent({...sub, calculatedScore})}
                      className={`w-full text-left p-4 hover:bg-white transition-colors focus:outline-none ${isSelected ? 'bg-white border-l-4 border-blue-600' : 'border-l-4 border-transparent'}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-gray-900 text-sm">{sub.studentName}</span>
                        <span className="text-[13px] font-semibold text-blue-600">{calculatedScore} <span className="text-gray-400 text-[11px]">/ {totalMarks}</span></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(sub.submittedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Panel: Detailed View */}
          <div className={`w-full md:w-2/3 bg-white flex flex-col overflow-y-auto ${!selectedStudent ? 'hidden md:flex' : 'flex'}`}>
            {!selectedStudent ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <FileBarChart className="w-12 h-12 text-gray-200 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Submission</h3>
                <p className="text-sm text-gray-500 max-w-sm">Choose a student from the list to view their detailed question-by-question analysis.</p>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                <div className="md:hidden mb-4">
                  <button 
                    onClick={() => setSelectedStudent(null)}
                    className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    &larr; Back to Student List
                  </button>
                </div>
                
                <div className="flex items-start justify-between mb-2 pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{selectedStudent.studentName}'s Report</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-600 font-medium mb-3">
                      {selectedStudent.studentId && (
                        <span className="bg-gray-100 px-2 py-1 rounded border border-gray-200 text-gray-700">ID: {selectedStudent.studentId}</span>
                      )}
                      {selectedStudent.batch && (
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">Batch: {selectedStudent.batch}</span>
                      )}
                      <span className="flex items-center gap-1.5 text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        Submitted: {new Date(selectedStudent.submittedAt).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button 
                        onClick={() => setExtendPrompt({ show: true, minutes: '' })}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                        title="Grant extra time and reopen this submission"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        Extend Time
                      </button>
                      <button 
                        onClick={() => setResetConfirm(true)}
                        className="px-3 py-1.5 bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                        title="Delete this submission so the student can re-take the contest"
                      >
                        <RefreshCcw className="w-3.5 h-3.5" />
                        Reset Test
                      </button>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Score</p>
                    <p className="text-2xl font-semibold text-blue-600 leading-none">{selectedStudent.calculatedScore} <span className="text-base text-gray-400 font-semibold">/ {totalMarks}</span></p>
                  </div>
                </div>

                {!contest.questionList ? (
                  <div className="text-center py-10 text-gray-500">No questions data available.</div>
                ) : (
                  contest.questionList.map((prob, index) => {
                    const studentAnswer = selectedStudent.answers?.[prob.id];
                    const isCorrect = prob.type === 'MCQ' && studentAnswer === prob.correctOption;
                    const isAttempted = studentAnswer !== undefined && studentAnswer !== '';

                    return (
                      <div key={prob.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-[12px] font-semibold shrink-0">
                              Q{index + 1}
                            </span>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded">
                              {prob.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-gray-600">
                              {isCorrect ? prob.marks : 0} <span className="text-gray-400 font-medium">/ {prob.marks} Marks</span>
                            </span>
                            {prob.type === 'MCQ' && (
                              isCorrect ? (
                                <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2.5 py-1 rounded border border-green-200">
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span className="text-[11px] font-semibold uppercase tracking-wider">Correct</span>
                                </div>
                              ) : isAttempted ? (
                                <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2.5 py-1 rounded border border-red-200">
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span className="text-[11px] font-semibold uppercase tracking-wider">Incorrect</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-gray-500 bg-gray-100 px-2.5 py-1 rounded border border-gray-200">
                                  <span className="text-[11px] font-semibold uppercase tracking-wider">Skipped</span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                        
                        <div className="p-5">
                          <h3 className="text-[15px] font-medium text-gray-900 mb-5 leading-relaxed whitespace-pre-wrap">
                            {prob.question}
                          </h3>

                          {prob.type === 'MCQ' && (
                            <div className="space-y-3 mt-4">
                              {prob.options.map((opt, optIdx) => {
                                const isStudentChoice = studentAnswer === optIdx;
                                const isActualCorrect = prob.correctOption === optIdx;
                                
                                let optionClass = "border-gray-200 bg-white";
                                let icon = null;

                                if (isActualCorrect) {
                                  optionClass = "border-green-500 bg-green-50";
                                  icon = <Check className="w-4 h-4 text-green-600 shrink-0" />;
                                } else if (isStudentChoice && !isActualCorrect) {
                                  optionClass = "border-red-400 bg-red-50";
                                  icon = <X className="w-4 h-4 text-red-500 shrink-0" />;
                                }

                                return (
                                  <div key={optIdx} className={`p-3 rounded-lg border flex items-center justify-between transition-colors ${optionClass}`}>
                                    <div className="flex items-center gap-3">
                                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                        isStudentChoice ? (isActualCorrect ? 'border-green-500' : 'border-red-500') : (isActualCorrect ? 'border-green-500' : 'border-gray-300')
                                      }`}>
                                        {isStudentChoice && <div className={`w-2.5 h-2.5 rounded-full ${isActualCorrect ? 'bg-green-500' : 'bg-red-500'}`}></div>}
                                      </div>
                                      <span className={`text-[14px] ${isActualCorrect ? 'text-green-600 font-semibold' : isStudentChoice ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                                        {opt}
                                      </span>
                                    </div>
                                    {icon}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {prob.type === 'Coding' && (
                            <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                              <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">
                                Student's Submitted Code
                              </div>
                              <div className="bg-[#1e293b] p-4 overflow-x-auto">
                                <pre className="text-gray-300 text-[13px] font-mono leading-relaxed">
                                  {studentAnswer || '// No code submitted'}
                                </pre>
                              </div>
                            </div>
                          )}
                          
                          {prob.type === 'Theory' && (
                            <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                              <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">
                                Student's Answer
                              </div>
                              <div className="bg-white p-4">
                                <p className="text-gray-700 text-[14px] whitespace-pre-wrap leading-relaxed">
                                  {studentAnswer || <span className="text-gray-400 italic">No answer submitted</span>}
                                </p>
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {resetConfirm && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reset Submission?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to allow <strong>{selectedStudent?.studentName}</strong> to retest? This will permanently delete their current submission.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setResetConfirm(false)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleRetest}
                className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
              >
                Yes, Delete It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extend Time Prompt Modal */}
      {extendPrompt.show && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Extend Time</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              How many extra minutes do you want to grant to <strong>{selectedStudent?.studentName}</strong>?
            </p>
            <input 
              type="number"
              min="1"
              placeholder="e.g. 10"
              value={extendPrompt.minutes}
              onChange={(e) => setExtendPrompt({...extendPrompt, minutes: e.target.value})}
              className="w-full px-4 py-2.5 mb-6 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 transition-all text-sm"
              autoFocus
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setExtendPrompt({ show: false, minutes: '' })}
                className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleExtend}
                className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
