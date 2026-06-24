import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, UserCircle, CheckCircle, XCircle, MoreVertical } from 'lucide-react';
import { getSubmissions } from '../../api';

const mockStudents = [
  { id: 'ERP101', name: 'Aarav Sharma', batch: 'Alpha 1', testsTaken: 12, avgScore: 85, status: 'Excellent' },
  { id: 'ERP102', name: 'Riya Gupta', batch: 'Alpha 1', testsTaken: 11, avgScore: 92, status: 'Excellent' },
  { id: 'ERP103', name: 'Vihaan Singh', batch: 'Alpha 1', testsTaken: 12, avgScore: 65, status: 'Average' },
  { id: 'ERP104', name: 'Ananya Patel', batch: 'Alpha 1', testsTaken: 8, avgScore: 45, status: 'Needs Attention' },
  { id: 'ERP201', name: 'Arjun Kumar', batch: 'Alpha 2', testsTaken: 10, avgScore: 78, status: 'Good' },
  { id: 'ERP202', name: 'Sneha Iyer', batch: 'Alpha 2', testsTaken: 9, avgScore: 88, status: 'Excellent' },
  { id: 'ERP203', name: 'Vivaan Joshi', batch: 'Alpha 2', testsTaken: 10, avgScore: 55, status: 'Average' },
  { id: 'ERP301', name: 'Rohan Mehta', batch: 'Beta 1', testsTaken: 5, avgScore: 95, status: 'Excellent' },
  { id: 'ERP302', name: 'Neha Sharma', batch: 'Beta 1', testsTaken: 4, avgScore: 72, status: 'Good' },
];

export default function StudentRecords() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBatch, setFilterBatch] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const fetchSubs = async () => {
      try {
        const res = await getSubmissions();
        setSubmissions(res.data || []);
      } catch(err) {
        console.error("Failed to fetch submissions:", err);
      }
    };
    fetchSubs();
  }, []);

  const studentSubmissions = submissions.filter(sub => sub.studentId === selectedStudent?.id);

  const handleDownloadPDF = (sub) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>${sub.studentName} - ${sub.contestName} Report</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #111; line-height: 1.5; }
            h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
            .meta { margin-bottom: 30px; font-size: 14px; color: #555; }
            .meta p { margin: 5px 0; }
            .section { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; page-break-inside: avoid; }
            .question { font-weight: bold; margin-bottom: 8px; }
            pre { background: #f4f4f4; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 13px; white-space: pre-wrap; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Contest Submission Report</h1>
          <div class="meta">
            <p><strong>Student Name:</strong> ${sub.studentName}</p>
            <p><strong>Student ID:</strong> ${sub.studentId}</p>
            <p><strong>Batch:</strong> ${sub.batch}</p>
            <p><strong>Contest Name:</strong> ${sub.contestName}</p>
            <p><strong>Total Score:</strong> ${sub.score} Marks</p>
            <p><strong>Submitted At:</strong> ${new Date(sub.submittedAt).toLocaleString()}</p>
          </div>
          
          <h2>Student Answers & Code</h2>
          ${Object.keys(sub.answers).map(qId => `
            <div class="section">
              <div class="question">Question ID: ${qId}</div>
              <pre>${sub.answers[qId]}</pre>
            </div>
          `).join('')}
          
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredStudents = mockStudents.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBatch = filterBatch === 'All' || s.batch.includes(filterBatch);
    return matchesSearch && matchesBatch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Excellent': return 'bg-green-50 text-green-700 border-green-200';
      case 'Good': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Average': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Needs Attention': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto py-6 space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Records</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track student performances across all your batches</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-[14px] font-bold hover:bg-gray-50 transition-colors shadow-sm">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by student name or ERP ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all text-sm font-medium"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={filterBatch}
            onChange={(e) => setFilterBatch(e.target.value)}
            className="w-full md:w-auto px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 text-sm font-bold text-gray-700"
          >
            <option value="All">All Batches</option>
            <option value="Alpha 1">Alpha 1</option>
            <option value="Alpha 2">Alpha 2</option>
            <option value="Beta 1">Beta 1</option>
          </select>
          <button className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Student Info</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Batch</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tests Taken</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Avg Score</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Overall Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold shrink-0">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-[14px]">{student.name}</div>
                        <div className="text-[12px] font-medium text-gray-500">{student.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">{student.batch}</span>
                    </td>
                    <td className="px-6 py-4 text-[14px] font-bold text-gray-900">
                      {student.testsTaken}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold text-gray-900">{student.avgScore}%</span>
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${student.avgScore >= 75 ? 'bg-green-500' : student.avgScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${student.avgScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md uppercase tracking-wider border ${getStatusColor(student.status)}`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setSelectedStudent(student)} className="text-blue-600 hover:text-blue-800 text-[13px] font-bold transition-colors">View Report</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500 text-sm">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                        <UserCircle className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-[14px] font-bold text-gray-900">No Students Found</p>
                      <p className="text-[13px] text-gray-500 mt-1">Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
                       {selectedStudent.name.charAt(0)}
                    </div>
                    <div>
                       <h2 className="text-xl font-bold text-gray-900">{selectedStudent.name}</h2>
                       <p className="text-sm text-gray-500 font-medium">{selectedStudent.id} • Batch: {selectedStudent.batch}</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedStudent(null)} className="p-2 text-gray-400 hover:text-gray-600 bg-white rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
                   <XCircle className="w-5 h-5" />
                 </button>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Performance Overview</p>
                    <div className="flex items-end gap-2 mb-2">
                       <span className="text-3xl font-black text-gray-900">{selectedStudent.avgScore}%</span>
                       <span className="text-sm font-medium text-gray-500 mb-1">Avg. Score</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                       <div className={`h-full rounded-full ${selectedStudent.avgScore >= 75 ? 'bg-green-500' : selectedStudent.avgScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${selectedStudent.avgScore}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">Across {selectedStudent.testsTaken} tests taken</p>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                       <span className="text-sm font-medium text-gray-600">Overall Status</span>
                       <span className={`px-3 py-1 text-[11px] font-bold rounded-md uppercase tracking-wider border ${getStatusColor(selectedStudent.status)}`}>
                         {selectedStudent.status}
                       </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                       <span className="text-sm font-medium text-gray-600">Total Tests Taken</span>
                       <span className="text-lg font-bold text-gray-900">{selectedStudent.testsTaken}</span>
                    </div>
                 </div>
              </div>
              
              <div className="px-6 pb-6">
                 <h3 className="text-sm font-bold text-gray-800 mb-3">Recent Assessments</h3>
                 <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {studentSubmissions.length === 0 ? <div className="text-sm text-gray-500 py-2">No submissions found.</div> : null}
                    {studentSubmissions.map((sub, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-default">
                        <div className="flex items-center gap-3">
                           <CheckCircle className="w-4 h-4 text-green-500" />
                           <div className="flex flex-col">
                             <span className="text-[13px] font-bold text-gray-700">{sub.contestName}</span>
                             <span className="text-[11px] text-gray-500">{new Date(sub.submittedAt).toLocaleString()}</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className="text-[13px] font-bold text-gray-900">{sub.score} Marks</span>
                           <button onClick={() => handleDownloadPDF(sub)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors" title="Download Report">
                             <Download className="w-4 h-4" />
                           </button>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
              
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                 <button onClick={() => setSelectedStudent(null)} className="px-5 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors">
                    Close Report
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
