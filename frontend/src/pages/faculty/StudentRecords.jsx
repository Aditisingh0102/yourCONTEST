import React, { useState } from 'react';
import { Search, Filter, Download, UserCircle, CheckCircle, XCircle, MoreVertical } from 'lucide-react';

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
                      <button className="text-blue-600 hover:text-blue-800 text-[13px] font-bold transition-colors">View Report</button>
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

    </div>
  );
}
