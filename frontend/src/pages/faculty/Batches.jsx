import { useState } from 'react';
import { Users, ChevronDown, ChevronUp, Search, UserCircle, Rocket, Zap, Target, Plus, X, Briefcase } from 'lucide-react';

const mockBatches = [
  {
    id: 1,
    name: 'Alpha 1',
    course: 'Data Structures and Algorithms',
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-100',
    icon: Rocket,
    studentsCount: 46,
    students: [
      { erpId: '23210101548', name: 'Aditi Singh', attendance: 95 },
      ...Array.from({ length: 45 }, (_, i) => ({
        erpId: `CS24${String(i + 101).padStart(3, '0')}`,
        name: ['Aarav Sharma', 'Riya Gupta', 'Vihaan Singh', 'Ananya Patel', 'Kabir Das', 'Diya Reddy'][i % 6] + (i > 5 ? ` ${i}` : ''),
        attendance: Math.floor(Math.random() * 30) + 70 // 70 to 100%
      }))
    ]
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
    studentsCount: 16,
    students: [
      { erpId: '23210101763', name: 'Ambar Kumar', attendance: 88 },
      ...Array.from({ length: 15 }, (_, i) => ({
        erpId: `PG26${String(i + 301).padStart(3, '0')}`,
        name: ['Rohan Mehta', 'Neha Sharma', 'Amit Verma', 'Pooja Singh', 'Vikram Yadav'][i % 5] + (i > 4 ? ` ${i}` : ''),
        attendance: Math.floor(Math.random() * 20) + 80
      }))
    ]
  }
];

export default function FacultyBatches() {
  const [batches, setBatches] = useState(mockBatches);
  const [expandedBatch, setExpandedBatch] = useState(mockBatches[0]?.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBatch, setNewBatch] = useState({ name: '', course: '', studentsCount: 30 });

  const handleCreateBatch = (e) => {
    e.preventDefault();
    if (!newBatch.name || !newBatch.course) return;

    const newId = batches.length > 0 ? Math.max(...batches.map(b => b.id)) + 1 : 1;
    const count = parseInt(newBatch.studentsCount) || 30;
    
    const createdBatch = {
      id: newId,
      name: newBatch.name,
      course: newBatch.course,
      iconColor: 'text-purple-500',
      iconBg: 'bg-purple-100',
      icon: Briefcase,
      studentsCount: count,
      students: Array.from({ length: count }, (_, i) => ({
        erpId: `NEW26${String(i + 401).padStart(3, '0')}`,
        name: ['Samir Sen', 'Tara Singh', 'Ishan Gupta', 'Priya Roy', 'Mohit Verma'][i % 5] + (i > 4 ? ` ${i}` : ''),
        attendance: Math.floor(Math.random() * 20) + 80
      }))
    };

    setBatches([...batches, createdBatch]);
    setShowCreateModal(false);
    setNewBatch({ name: '', course: '', studentsCount: 30 });
    setExpandedBatch(newId);
  };

  return (
    <div className="max-w-[1000px] mx-auto py-6 space-y-6 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Batches</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage all your assigned student batches</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:from-blue-500 hover:to-indigo-500 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Create New Batch
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Assigned Batches</p>
            <p className="text-2xl font-semibold text-gray-900">{batches.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
            <UserCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Students</p>
            <p className="text-2xl font-semibold text-gray-900">
              {batches.reduce((acc, curr) => acc + curr.studentsCount, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Batches List */}
      <div className="space-y-4">
        {batches.map(batch => {
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
                  <h3 className="text-base font-semibold text-gray-900">{batch.name}</h3>
                  <p className="text-sm text-gray-500 font-medium">{batch.course}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-semibold text-gray-700">{batch.studentsCount} Students</span>
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
                  <h4 className="text-sm font-semibold text-gray-800">Enrolled Students</h4>
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
                          <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">ERP ID</th>
                          <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Student Name</th>
                          <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Attendance</th>
                          <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {batch.students
                          .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.erpId.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((student) => (
                            <tr key={student.erpId} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-3">
                                <span className="text-[13px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
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
                                  <span className={`text-[12px] font-semibold ${student.attendance >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                                    {student.attendance}%
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-3 text-right">
                                <button className="text-[12px] font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all px-4 py-2 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95">
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

      {/* Create Batch Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Create New Batch</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateBatch} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Batch Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Gamma 1"
                  value={newBatch.name}
                  onChange={(e) => setNewBatch({...newBatch, name: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Course Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Web Development"
                  value={newBatch.course}
                  onChange={(e) => setNewBatch({...newBatch, course: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Number of Students</label>
                <input 
                  type="number" 
                  min="1"
                  required
                  value={newBatch.studentsCount}
                  onChange={(e) => setNewBatch({...newBatch, studentsCount: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                />
                <p className="text-xs text-gray-500 mt-1.5">This will generate mock student profiles for the new batch.</p>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Create Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
