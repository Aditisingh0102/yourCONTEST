import React, { useState, useEffect, useMemo } from 'react';
import { FileBarChart, CheckCircle, Clock, AlertCircle, X, Check, XCircle, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { getSubmissions, getContests } from '../../api';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentProfile = JSON.parse(sessionStorage.getItem('student_profile')) || { name: 'Aditi Singh', id: 'ERP101', batch: 'Alpha 1' };
        
        const [subRes, contRes] = await Promise.all([
          getSubmissions(),
          getContests()
        ]);

        const contests = contRes.data || [];
        const cmap = {};
        contests.forEach(c => {
          cmap[c.id || c._id] = c;
        });

        const mySubs = (subRes.data || []).filter(sub => sub.studentName === studentProfile.name);
        
        const uniqueSubsMap = {};
        mySubs.forEach(sub => {
          if (!uniqueSubsMap[sub.contestId] || new Date(sub.submittedAt) > new Date(uniqueSubsMap[sub.contestId].submittedAt)) {
            uniqueSubsMap[sub.contestId] = sub;
          }
        });
        const uniqueSubs = Object.values(uniqueSubsMap);
        
        const formattedReports = uniqueSubs.map(sub => {
          const contest = cmap[sub.contestId];
          const totalMarks = contest?.questionList?.reduce((acc, q) => acc + q.marks, 0) || 0;
          
          let calculatedScore = 0;
          if (contest && contest.questionList && sub.answers) {
            contest.questionList.forEach(q => {
              if (q.type === 'MCQ' && sub.answers[q.id] === q.correctOption) {
                calculatedScore += q.marks || 0;
              }
            });
          }

          return {
            id: sub._id || sub.id,
            submission: sub,
            contest: contest,
            title: sub.contestName || contest?.title || 'Unknown Assessment',
            date: new Date(sub.submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            time: new Date(sub.submittedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            score: calculatedScore,
            total: totalMarks,
            status: 'Completed',
            bg: 'bg-green-50',
            color: 'text-green-600'
          };
        });

        // Sort by submittedAt descending
        formattedReports.sort((a, b) => new Date(b.submission.submittedAt) - new Date(a.submission.submittedAt));

        setReports(formattedReports);
      } catch (err) {
        console.error("Failed to fetch reports", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const trendData = useMemo(() => {
    return [...reports].reverse().map(r => ({
      name: r.title.length > 15 ? r.title.substring(0, 15) + '...' : r.title,
      score: r.total > 0 ? Math.round((r.score / r.total) * 100) : 0,
      fullTitle: r.title,
    }));
  }, [reports]);

  const latestReportStats = useMemo(() => {
    if (!reports || reports.length === 0) return null;
    const latest = reports[0];
    if (!latest.contest || !latest.contest.questionList) return null;

    let correct = 0, incorrect = 0, skipped = 0;
    latest.contest.questionList.forEach(q => {
      const ans = latest.submission.answers?.[q.id];
      if (ans === undefined || ans === '') {
        skipped++;
      } else if (q.type === 'MCQ' && ans === q.correctOption) {
        correct++;
      } else {
        incorrect++;
      }
    });

    return [
      { name: 'Correct', value: correct, color: '#22c55e' },
      { name: 'Incorrect', value: incorrect, color: '#ef4444' },
      { name: 'Skipped', value: skipped, color: '#94a3b8' },
    ];
  }, [reports]);

  const closeAnalysis = () => setSelectedReport(null);

  return (
    <div className="max-w-[1000px] mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Detailed analysis of your assessments and mock tests</p>
        </div>
      </div>

      {/* Analytics Summary */}
      {!loading && reports.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Trend */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h2 className="text-[16px] font-semibold text-gray-900">Performance Trend</h2>
            </div>
            {trendData.length > 0 ? (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} domain={[0, 100]} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`${value}%`, 'Score']}
                      labelStyle={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}
                    />
                    <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#2563eb' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
               <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">Not enough data to show trend</div>
            )}
          </div>

          {/* Latest Assessment Accuracy */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <PieChartIcon className="w-5 h-5 text-purple-600" />
              <h2 className="text-[16px] font-semibold text-gray-900">Latest Assessment Accuracy</h2>
            </div>
            {latestReportStats && latestReportStats.some(s => s.value > 0) ? (
              <div className="flex items-center h-[250px]">
                <div className="flex-1 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={latestReportStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {latestReportStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontWeight: '500' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-40 flex flex-col justify-center gap-4 border-l border-gray-100 pl-6">
                  {latestReportStats.map((stat, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: stat.color }}></div>
                        <span className="text-sm font-medium text-gray-600">{stat.name}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{stat.value}</span>
                    </div>
                  ))}
                  <div className="pt-3 mt-1 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Total</span>
                    <span className="text-sm font-bold text-gray-900">
                      {latestReportStats.reduce((sum, s) => sum + s.value, 0)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
               <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">Detailed analysis not available for the latest report</div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 font-semibold animate-pulse">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
              <FileBarChart className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No Reports Available</h3>
            <p className="text-sm text-gray-500 max-w-sm">You haven't completed any assessments yet. Your detailed performance reports will appear here once you take a test.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[12px] uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-semibold">Assessment Name</th>
                  <th className="p-4 font-semibold">Date Taken</th>
                  <th className="p-4 font-semibold">Score</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${report.bg} ${report.color}`}>
                          <FileBarChart className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{report.title}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <div>{report.date}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{report.time}</div>
                    </td>
                    <td className="p-4 text-sm font-semibold text-gray-900">
                      {report.score} <span className="text-gray-400 font-medium">/ {report.total}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded text-[11px] font-semibold tracking-wider uppercase border border-white/0 ${report.bg} ${report.color}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {report.contest?.status === 'Live' || report.contest?.status === 'Upcoming' ? (
                        <span className="text-[12px] font-medium text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 cursor-not-allowed whitespace-nowrap" title="Analysis will be available after the contest ends">
                          Available After Contest
                        </span>
                      ) : (
                        <button 
                          onClick={() => setSelectedReport(report)}
                          className="text-[13px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          View Analysis
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Analysis Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedReport.bg} ${selectedReport.color}`}>
                  <FileBarChart className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 leading-tight">{selectedReport.title}</h2>
                  <p className="text-sm text-gray-500 font-medium mt-0.5">Submitted on {selectedReport.date} at {selectedReport.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Total Score</p>
                  <p className="text-xl font-semibold text-blue-600 leading-none">{selectedReport.score} <span className="text-sm text-gray-400 font-semibold">/ {selectedReport.total}</span></p>
                </div>
                <button 
                  onClick={closeAnalysis}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-6">
              {!selectedReport.contest || !selectedReport.contest.questionList ? (
                <div className="text-center py-10 text-gray-500">
                  Detailed question data is not available for this contest.
                </div>
              ) : (
                selectedReport.contest.questionList.map((prob, index) => {
                  const studentAnswer = selectedReport.submission.answers?.[prob.id];
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
                              Your Submitted Code
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
                              Your Answer
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

          </div>
        </div>
      )}

    </div>
  );
}
