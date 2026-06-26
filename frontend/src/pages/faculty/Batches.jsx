import React, { useState } from 'react';
import { Users, BookOpen, ChevronDown, ChevronUp, Search, UserCircle, Rocket, Zap, Target } from 'lucide-react';

const mockBatches = [
  {
    id: 1,
    name: 'Alpha 1',
    course: 'Data Structures and Algorithms',
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-100',
    icon: Rocket,
    studentsCount: 45,
    students: Array.from({ length: 45 }, (_, i) => ({
      erpId: `CS24${String(i + 101).padStart(3, '0')}`,
      name: ['Aarav Sharma', 'Riya Gupta', 'Vihaan Singh', 'Ananya Patel', 'Kabir Das', 'Diya Reddy'][i % 6] + (i > 5 ? ` ${i}` : ''),
      attendance: Math.floor(Math.random() * 30) + 70 // 70 to 100%
    }))
  },
  {
    id: 2,
    name: 'Alpha 2',
    course: 'Machine Learning',
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-100',
    icon: Zap,
    studentsCount: 38,
    students: Array.from({ length: 38 }, (_, i) => ({
      erpId: `IT25${String(i + 201).padStart(3, '0')}`,
      name: ['Arjun Kumar', 'Sneha Iyer', 'Vivaan Joshi', 'Priya Desai', 'Sai Nath', 'Kavya Pillai'][i % 6] + (i > 5 ? ` ${i}` : ''),
      attendance: Math.floor(Math.random() * 30) + 70
    }))
  },
  {
    id: 3,
    name: 'Beta 1',
    course: 'Java Programming',
    iconColor: 'text-green-500',
    iconBg: 'bg-green-100',
    icon: Target,
    studentsCount: 15,
    students: Array.from({ length: 15 }, (_, i) => ({
      erpId: `PG26${String(i + 301).padStart(3, '0')}`,
      name: ['Rohan Mehta', 'Neha Sharma', 'Amit Verma', 'Pooja Singh', 'Vikram Yadav'][i % 5] + (i > 4 ? ` ${i}` : ''),
      attendance: Math.floor(Math.random() * 20) + 80
    }))
  }
];

export default function FacultyBatches() {
  const [expandedBatch, setExpandedBatch] = useState(mockBatches[0].id);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="max-w-[1000px] mx-auto py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Batches</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage all your assigned student batches</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Assigned Batches</p>
            <p className="text-2xl font-black text-gray-900">{mockBatches.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
            <UserCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Students</p>
            <p className="text-2xl font-black text-gray-900">
              {mockBatches.reduce((acc, curr) => acc + curr.studentsCount, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Batches List */}
      <div className="space-y-4">
        {mockBatches.map(batch => {
          const Icon = batch.icon;
          return (
          <div key={batch.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            
            {/* Batch Header (Clickable) */}
            <div 
              onClick={() => setExpandedBatch(expandedBatch === batch.id ? null : batch.id)}
              className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${batch.iconBg} ${batch.iconColor}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">{batch.name}</h3>
                  <p className="text-sm text-gray-500 font-medium">{batch.course}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-bold text-gray-700">{batch.studentsCount} Students</span>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                  {expandedBatch === batch.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Batch Students List (Collapsible) */}
            {expandedBatch === batch.id && (
              <div className="border-t border-gray-100 bg-gray-50/50 p-5">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-bold text-gray-800">Enrolled Students</h4>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search by name or ERP..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-indigo-500 text-sm w-64"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="max-h-[400px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">ERP ID</th>
                          <th className="px-6 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                          <th className="px-6 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Attendance</th>
                          <th className="px-6 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {batch.students
                          .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.erpId.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((student) => (
                            <tr key={student.erpId} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-3">
                                <span className="text-[13px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                                  {student.erpId}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-[14px] font-medium text-gray-900">
                                {student.name}
                              </td>
                              <td className="px-6 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full ${student.attendance >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
                                      style={{ width: `${student.attendance}%` }}
                                    ></div>
                                  </div>
                                  <span className={`text-[12px] font-bold ${student.attendance >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                                    {student.attendance}%
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-3 text-right">
                                <button className="text-[12px] font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all px-4 py-2 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95">
                                  View Profile
                                </button>
                              </td>
                            </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
          );
        })}
      </div>

    </div>
  );
}
