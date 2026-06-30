import React, { useState, useEffect } from 'react';
import { faculty } from '../../data/mockData';
import { Trophy, Users, FileCheck, CheckSquare, BarChart, Calendar, Edit3, PlusCircle, AlertCircle, Library, Eye, Trash2, Save, X, Plus, Rocket, Zap, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getContests } from '../../api';
import { socket } from '../../socket';

export default function Dashboard() {
  const navigate = useNavigate();
  const [showBatches, setShowBatches] = useState(false);
  const [showStudents, setShowStudents] = useState(false);

  const allocatedBatchesList = [
    { id: 1, name: 'Alpha 1', course: 'Data Structures & Algorithms', students: 45, icon: Rocket, color: 'text-orange-500', bg: 'bg-orange-100' },
    { id: 2, name: 'Alpha 2', course: 'Machine Learning', students: 38, icon: Zap, color: 'text-blue-500', bg: 'bg-blue-100' },
    { id: 3, name: 'Beta 1', course: 'Java Programming', students: 15, icon: Target, color: 'text-green-500', bg: 'bg-green-100' }
  ];

  const [notes, setNotes] = useState(() => {
    const saved = sessionStorage.getItem('faculty_notes');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Prepare questions for Alpha 1 Mid-Term' },
      { id: 2, text: 'Review Beta 1 assignment submissions' }
    ];
  });
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState('');

  const [managedContests, setManagedContests] = useState([]);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await getContests();
        setManagedContests(res.data);
      } catch (error) {
        console.error("Failed to fetch contests", error);
      }
    };
    
    fetchContests();

    socket.on('CONTEST_UPDATED', fetchContests);
    return () => socket.off('CONTEST_UPDATED');
  }, []);

  useEffect(() => {
    sessionStorage.setItem('faculty_notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotes([{ id: Date.now(), text: newNote }, ...notes]);
    setNewNote('');
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const saveEdit = (id) => {
    if (!editingNoteText.trim()) return;
    setNotes(notes.map(n => n.id === id ? { ...n, text: editingNoteText } : n));
    setEditingNoteId(null);
  };

  const [profileData, setProfileData] = useState(() => {
    const saved = sessionStorage.getItem('faculty_profile');
    if (saved) return JSON.parse(saved);
    return {
      name: faculty.name,
      avatar: faculty.avatar
    };
  });

  useEffect(() => {
    const handleUpdate = () => {
      const saved = sessionStorage.getItem('faculty_profile');
      if (saved) setProfileData(JSON.parse(saved));
    };
    window.addEventListener('profile-updated', handleUpdate);
    return () => window.removeEventListener('profile-updated', handleUpdate);
  }, []);

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 dark:from-slate-900 dark:via-[#0b1120] dark:to-[#020617] rounded-2xl p-8 shadow-md flex items-center gap-6 relative overflow-hidden border border-transparent dark:border-blue-900/30 text-white">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 dark:bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute left-0 bottom-0 w-48 h-48 bg-transparent dark:bg-indigo-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>
        
        <img src={profileData.avatar} alt="Profile" className="w-16 h-16 rounded-full border-2 border-white/20 dark:border-blue-500/30 shadow-sm relative z-10 object-cover bg-white dark:bg-[#0b1120]" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-1 text-white">{profileData.name}</h1>
          <p className="text-blue-100 dark:text-blue-200/60 text-sm">{faculty.role} • {faculty.university}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: 98, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50', path: '/faculty/student-records' },
          { label: 'Batches Allocated', value: 3, icon: Library, color: 'text-indigo-500', bg: 'bg-indigo-50', path: '/faculty/my-batches' },
          { label: 'Active Contests', value: managedContests.filter(c => c.status === 'Live').length, icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-50', path: '/faculty/manage-contests' },
          { label: 'Upcoming Contests', value: managedContests.filter(c => c.status === 'Upcoming').length, icon: Calendar, color: 'text-orange-500', bg: 'bg-orange-50', path: '/faculty/manage-contests' },
        ].map((stat, i) => (
          <div
            key={i}
            onClick={() => {
              if (stat.label === 'Batches Allocated') setShowBatches(true);
              else if (stat.label === 'Total Students') setShowStudents(true);
              else navigate(stat.path);
            }}
            className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-zinc-600 hover:-translate-y-0.5 transition-all cursor-pointer group"
          >
            <div className={`p-3 rounded-xl border border-gray-100 ${stat.color} ${stat.bg} group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5 group-hover:text-blue-500 transition-colors">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">

          {/* Active & Upcoming Contests */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-[15px] font-bold text-gray-800 flex items-center gap-2"><Trophy className="w-4 h-4 text-blue-600" /> Managed Contests</h2>
              <button onClick={() => navigate('/faculty/manage-contests')} className="text-[13px] font-bold text-blue-600 hover:text-blue-700">View All</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {managedContests.length === 0 ? (
                <div className="col-span-2 py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-sm text-gray-500 font-medium">No contests created yet.</p>
                  <button onClick={() => navigate('/faculty/create-contest')} className="mt-3 text-[13px] font-bold text-blue-600 hover:text-blue-700">Create your first contest</button>
                </div>
              ) : (
                managedContests.slice(0, 4).map((contest) => (
                  <div
                    key={contest.id}
                    onClick={() => navigate('/faculty/manage-contests')}
                    className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-100 dark:hover:border-zinc-600 transition-all cursor-pointer relative overflow-hidden group"
                  >
                    <div className={`absolute top-4 right-4 text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider border ${contest.status === 'Live' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                      {contest.status === 'Live' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse mr-1"></span>}
                      {contest.status === 'Live' ? 'Live Now' : contest.date || 'Upcoming'}
                    </div>

                    <div className={`p-2 w-max rounded-lg mb-3 ${contest.type === 'Assessment' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-500'}`}>
                      <Trophy className="w-4 h-4" />
                    </div>
                    <h3 className="text-[14px] font-bold text-gray-800 leading-tight mb-1 group-hover:text-blue-600 transition-colors truncate" title={contest.title}>{contest.title}</h3>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">{contest.type}</p>

                    <div className="text-[11px] font-bold text-gray-500 flex justify-between items-center border-t border-gray-50 pt-3">
                      <span className="flex items-center gap-1.5"><CheckSquare className="w-3.5 h-3.5 text-gray-400" /> {contest.questions} Questions</span>
                      <span className="text-blue-600 hover:underline">Manage</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>



        </div>

        {/* Sidebar Area */}
        <div className="space-y-6">

          {/* Quick Actions */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-[15px] font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'New Contest', icon: PlusCircle, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', path: '/faculty/create-contest' },
                { name: 'Question Bank', icon: Library, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', path: '/faculty/question-bank' },
                { name: 'Submissions', icon: FileCheck, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', path: '/faculty/manage-contests' },
                { name: 'Analytics', icon: BarChart, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', path: '/faculty/student-records' },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() => navigate(action.path)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all gap-2 ${action.bg} ${action.border} hover:shadow-md hover:-translate-y-0.5`}
                >
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                  <span className={`text-[11px] font-bold ${action.color}`}>{action.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Notes */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col h-[350px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[15px] font-bold text-gray-800 flex items-center gap-2"><CheckSquare className="w-4 h-4 text-green-600" /> Quick Notes</h2>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 scrollbar-thin scrollbar-thumb-gray-200">
              {notes.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No notes added yet.</p>
              ) : (
                notes.map(note => (
                  <div key={note.id} className="group bg-gray-50 border border-gray-100 rounded-lg p-3 relative hover:border-gray-200 transition-colors">
                    {editingNoteId === note.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingNoteText}
                          onChange={(e) => setEditingNoteText(e.target.value)}
                          className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-green-500"
                          autoFocus
                        />
                        <button onClick={() => saveEdit(note.id)} className="text-green-600 hover:text-green-700">
                          <Save className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingNoteId(null)} className="text-gray-400 hover:text-gray-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-sm text-gray-700 leading-snug break-words flex-1">{note.text}</p>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => { setEditingNoteId(note.id); setEditingNoteText(note.text); }}
                            className="p-1 text-gray-400 hover:text-blue-600 rounded"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="p-1 text-gray-400 hover:text-red-600 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <form onSubmit={addNote} className="relative mt-auto">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Type a new note..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:bg-white focus:border-green-500 transition-colors"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-md transition-colors"
                disabled={!newNote.trim()}
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Batches Modal */}
      {showBatches && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-gray-900">Allocated Batches</h3>
                <p className="text-sm text-gray-500 font-medium mt-1">Batches currently assigned to you</p>
              </div>
              <button
                onClick={() => setShowBatches(false)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {allocatedBatchesList.map((batch) => {
                const Icon = batch.icon;
                return (
                  <div key={batch.id} className="group flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md hover:border-gray-200 transition-all cursor-pointer">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${batch.bg} ${batch.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[15px] font-bold text-gray-900">{batch.name}</h4>
                      <p className="text-[13px] font-medium text-gray-500">{batch.course}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[12px] font-bold text-gray-700">{batch.students}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowBatches(false)}
                className="px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Students Modal */}
      {showStudents && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-gray-900">Total Students Overview</h3>
                <p className="text-sm text-gray-500 font-medium mt-1">Breakdown of students across your allocated batches</p>
              </div>
              <button
                onClick={() => setShowStudents(false)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {allocatedBatchesList.map((batch) => {
                const Icon = batch.icon;
                return (
                  <div key={batch.id} className="group flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md hover:border-gray-200 transition-all cursor-pointer">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${batch.bg} ${batch.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[15px] font-bold text-gray-900">{batch.name} Students</h4>
                      <p className="text-[13px] font-medium text-gray-500">{batch.course}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg shadow-sm">
                        <Users className="w-4 h-4" />
                        <span className="text-[14px] font-black">{batch.students}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <span className="text-xs font-bold text-gray-500 uppercase">Total:</span>
                <span className="text-sm font-black text-gray-900">
                  {allocatedBatchesList.reduce((acc, b) => acc + b.students, 0)} Students
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowStudents(false)}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-100 text-sm font-bold rounded-xl transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowStudents(false);
                    navigate('/faculty/student-records');
                  }}
                  className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 flex items-center gap-2"
                >
                  View Detailed Records
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
