import { useState, useEffect } from 'react';
import { Trophy, CheckCircle, BookOpen, Users, Megaphone, AlertCircle, FileText, Briefcase, Info, Rocket, Target, User, X, CheckSquare, Save, Edit3, Trash2, Plus, FileCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getNotices, getContests, getSubmissions } from '../../api';
import { socket } from '../../socket';
import { filterNoticesForStudent, getStudentBatchFromSession } from '../../utils/noticeUtils';

const iconMap = {
  Info, AlertCircle, FileText, Briefcase, BookOpen
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [contests, setContests] = useState([]);
  const [upcomingContestsList, setUpcomingContestsList] = useState([]);
  const [pastContestsList, setPastContestsList] = useState([]);
  const [stats, setStats] = useState({ totalContests: 0, mockTestsTaken: 0, assessmentsGiven: 0, avgScore: 0 });
  const [showNoticePopup, setShowNoticePopup] = useState(false);
  const [latestNotice, setLatestNotice] = useState(null);

  const [notes, setNotes] = useState(() => {
    const saved = sessionStorage.getItem('student_notes');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Review Data Structures concepts', reminderTime: '2026-07-04T10:00' },
    ];
  });
  const [newNote, setNewNote] = useState('');
  const [newNoteTime, setNewNoteTime] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [editingNoteTime, setEditingNoteTime] = useState('');

  const [pendingAssignments] = useState([
    { id: 201, title: 'Build a React Portfolio', course: 'Full-Stack Web Development', deadline: '2026-07-05T23:59:00', status: 'Pending' }
  ]);

  useEffect(() => {
    sessionStorage.setItem('student_notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotes([{ id: Date.now(), text: newNote, reminderTime: newNoteTime }, ...notes]);
    setNewNote('');
    setNewNoteTime('');
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const saveEdit = (id) => {
    if (!editingNoteText.trim()) return;
    setNotes(notes.map(n => n.id === id ? { ...n, text: editingNoteText, reminderTime: editingNoteTime } : n));
    setEditingNoteId(null);
  };

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await getNotices();
        const studentBatch = getStudentBatchFromSession();
        const filteredNotices = filterNoticesForStudent(res.data, studentBatch);

        if (filteredNotices.length > 0) {
          if (sessionStorage.getItem('hasSeenNoticePopup') !== 'true') {
            setLatestNotice(filteredNotices[0]);
            setShowNoticePopup(true);
            sessionStorage.setItem('hasSeenNoticePopup', 'true');
          }
        }

        setNotices(filteredNotices.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch notices", error);
      }
    };

    const fetchContests = async () => {
      try {
        const [res, subRes] = await Promise.all([getContests(), getSubmissions()]);
        const studentProfileStr = sessionStorage.getItem('student_profile');
        const studentProfile = studentProfileStr ? JSON.parse(studentProfileStr) : { name: 'Aditi Singh', id: '23210101548', batch: 'Alpha 1' };
        const studentBatch = studentProfile.batch || 'Alpha 1';
        
        const filtered = res.data.filter(c => (!c.batch || (Array.isArray(c.batch) ? (c.batch.includes('All') || c.batch.includes(studentBatch)) : (c.batch === 'All' || c.batch === studentBatch))));
        
        setUpcomingContestsList(filtered.filter(c => c.status === 'Live' || c.status === 'Upcoming').slice(0, 2));
        setPastContestsList(filtered.filter(c => c.status === 'Past').slice(0, 2));

        let totalContests = filtered.length;
        let mockTestsTaken = 0;
        let assessmentsGiven = 0;
        let totalScore = 0;
        let totalMaxMarks = 0;

        const mySubs = (subRes.data || []).filter(sub => {
          if (sub.studentId && studentProfile.id) return sub.studentId === studentProfile.id;
          return sub.studentName === studentProfile.name;
        });

        mySubs.forEach(sub => {
          const contest = res.data.find(c => (c._id || c.id) === sub.contestId);
          if (contest) {
            if (contest.type === 'Mock Test' || contest.type === 'Mock') mockTestsTaken++;
            if (contest.type === 'Assessment') assessmentsGiven++;
            
            if (sub.status === 'submitted') {
              let maxMarks = contest.questionList?.reduce((acc, q) => acc + (q.marks || 0), 0) || 0;
              
              let calcScore = 0;
              if (sub.score !== undefined) {
                 calcScore = sub.score;
              } else if (sub.answers && contest.questionList) {
                 contest.questionList.forEach(q => {
                   if (q.type === 'MCQ' && sub.answers[q.id] === q.correctOption) calcScore += q.marks || 0;
                 });
              }

              totalMaxMarks += maxMarks;
              totalScore += calcScore;
            }
          }
        });

        let avgScore = totalMaxMarks > 0 ? Math.round((totalScore / totalMaxMarks) * 100) : 0;
        setStats({ totalContests, mockTestsTaken, assessmentsGiven, avgScore });

      } catch (error) {
        console.error("Failed to fetch contests", error);
      }
    };

    fetchNotices();
    fetchContests();

    const handleNoticeUpdate = (data) => {
      if (data.type === 'CREATE') {
        setNotices(prev => {
          const next = [data.notice, ...prev];
          return filterNoticesForStudent(next, getStudentBatchFromSession()).slice(0, 3);
        });
        return;
      }

      if (data.type === 'UPDATE') {
        setNotices(prev => filterNoticesForStudent(
          prev.map((n) => (n._id === data.notice._id ? data.notice : n)),
          getStudentBatchFromSession()
        ).slice(0, 3));
        return;
      }

      if (data.type === 'DELETE') {
        setNotices(prev => prev.filter((n) => n._id !== data.id));
      }
    };

    socket.on('NOTICE_UPDATED', handleNoticeUpdate);

    socket.on('CONTEST_UPDATED', (data) => {
      if (data.type === 'CREATE') setContests(prev => [data.contest, ...prev]);
      else if (data.type === 'UPDATE') setContests(prev => prev.map(c => c._id === data.contest._id ? data.contest : c));
      else if (data.type === 'DELETE') setContests(prev => prev.filter(c => c._id !== data.id));
    });

    return () => {
      socket.off('NOTICE_UPDATED', handleNoticeUpdate);
      socket.off('CONTEST_UPDATED');
    };
  }, []);

  const [studentProfile, setStudentProfile] = useState(() => {
    const saved = sessionStorage.getItem('student_profile');
    if (saved) return JSON.parse(saved);
    return { name: 'Aditi Singh', batch: 'Alpha 1', branch: 'B.Tech CSE' };
  });

  useEffect(() => {
    const handleUpdate = () => {
      const saved = sessionStorage.getItem('student_profile');
      if (saved) setStudentProfile(JSON.parse(saved));
    };
    window.addEventListener('profile-updated', handleUpdate);
    return () => window.removeEventListener('profile-updated', handleUpdate);
  }, []);

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 dark:from-slate-900 dark:via-[#0b1120] dark:to-[#020617] rounded-2xl p-8 shadow-md border border-transparent dark:border-blue-900/30 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 dark:bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute left-0 bottom-0 w-48 h-48 bg-transparent dark:bg-indigo-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 dark:bg-blue-500/10 rounded-full text-[11px] font-semibold tracking-wider mb-3 shadow-sm border border-white/10 dark:border-blue-400/20 uppercase text-white dark:text-blue-200">
            {studentProfile.batch === 'Beta 1' ? <Target className="w-3.5 h-3.5 text-white dark:text-blue-300" /> : <Rocket className="w-3.5 h-3.5 text-white dark:text-blue-300" />} BATCH: {studentProfile.batch || 'ALPHA 1'}
          </div>
          <h1 className="text-3xl font-semibold mb-1 text-white">{studentProfile.name}</h1>
          <p className="text-blue-100 dark:text-blue-200/60 text-sm mb-4">UIT • {studentProfile.branch || 'B.Tech CSE'} • 4th Year Student</p>

        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Contests', value: stats.totalContests, icon: Trophy, color: 'text-blue-500' },
          { label: 'Mock Tests Taken', value: stats.mockTestsTaken, icon: BookOpen, color: 'text-orange-500' },
          { label: 'Assessments Given', value: stats.assessmentsGiven, icon: Users, color: 'text-purple-500' },
          { label: 'Avg. Score', value: `${stats.avgScore}%`, icon: CheckCircle, color: 'text-green-500' },
        ].map((stat, i) => (
          <div
            key={i}
            onClick={() => {
              if (stat.label === 'Avg. Score') navigate(`/student/profile`);
              else navigate(`/student/contests`);
            }}
            className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-zinc-600 hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div className={`p-3 rounded-xl bg-gray-50/50 border border-gray-100 group-hover:scale-110 transition-transform ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-0.5">{stat.label}</p>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Contests */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-semibold text-gray-800">Upcoming Contests</h2>
              <button className="text-[13px] font-medium text-blue-600 hover:underline" onClick={() => navigate(`/student/contests`)}>View all</button>
            </div>

            {upcomingContestsList.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-10 flex flex-col items-center justify-center text-center">
                <Trophy className="w-12 h-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-1">No Upcoming Contests</h3>
                <p className="text-sm text-gray-500 mb-4 max-w-sm">You're all caught up! Keep an eye out for new mock tests or assessments scheduled by your mentors.</p>
                <button className="text-sm font-medium text-blue-600 flex items-center gap-1 hover:underline" onClick={() => navigate(`/student/contests`)}>
                  View Past Contests &rarr;
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-[1px] bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
                {upcomingContestsList.map((contest) => (
                  <div key={contest._id} className="bg-white dark:bg-slate-900 p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                    <div>
                      <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">{contest.name || contest.title || "Untitled Contest"}</h3>
                      <p className="text-[13px] text-gray-500">{contest.subject || contest.type || 'Contest'} • {contest.duration}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${contest.status === 'Live' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-orange-50 text-orange-600 border border-orange-100'
                        }`}>
                        {contest.status}
                      </span>
                      <button onClick={() => navigate(`/student/contests/${contest._id || contest.id}`)} className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Contests */}
          {pastContestsList.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3 mt-8">
                <h2 className="text-[15px] font-semibold text-gray-800">Past Contests</h2>
                <button className="text-[13px] font-medium text-blue-600 hover:underline" onClick={() => navigate(`/student/contests`)}>View all</button>
              </div>

              <div className="flex flex-col gap-[1px] bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
                {pastContestsList.map((contest) => (
                  <div key={contest._id} className="bg-white dark:bg-slate-900 p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                    <div>
                      <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">{contest.name || contest.title || "Untitled Contest"}</h3>
                      <p className="text-[13px] text-gray-500">{contest.subject || contest.type || 'Contest'} • {contest.duration}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
                        Past
                      </span>
                      <button onClick={() => navigate(`/student/contests/${contest._id || contest.id}`)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                        View Results
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Assignments */}
          <div>
            <div className="flex items-center justify-between mb-3 mt-8">
              <h2 className="text-[15px] font-semibold text-gray-800 flex items-center gap-2"><FileCheck className="w-4 h-4 text-purple-600" /> Pending Assignments</h2>
              <button className="text-[13px] font-medium text-purple-600 hover:underline" onClick={() => navigate(`/student/courses`)}>View all</button>
            </div>
            <div className="flex flex-col gap-[1px] bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
              {pendingAssignments.map((assignment) => (
                <div key={assignment.id} className="bg-white dark:bg-slate-900 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                  <div>
                    <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">{assignment.title}</h3>
                    <p className="text-[13px] text-gray-500">{assignment.course}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Deadline</p>
                      <p className="text-[13px] font-semibold text-red-500">{new Date(assignment.deadline).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                    </div>
                    <button className="px-4 py-2 bg-purple-50 text-purple-600 border border-purple-100 text-sm font-semibold rounded-lg hover:bg-purple-100 transition-colors">
                      Submit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notice Board */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[15px] font-semibold text-gray-800 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-orange-500" />
                Notice Board
              </h2>
              <button onClick={() => navigate(`/student/notices`)} className="text-[13px] font-medium text-blue-600 hover:underline">View all</button>
            </div>

            <div className="flex flex-col gap-[1px] bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
              {notices.length === 0 ? (
                <div onClick={() => navigate(`/student/notices`)} className="text-center py-8 bg-gray-50 dark:bg-slate-900 transition-colors cursor-pointer group">
                  <p className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors">No new notices from your faculty.</p>
                </div>
              ) : (
                notices.map((notice) => {
                  const IconComponent = iconMap[notice.iconName] || Info;
                  return (
                    <div key={notice._id} onClick={() => navigate(`/student/notices`)} className="flex gap-4 p-4 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                      <div className={`w-10 h-10 rounded-full ${notice.bg} flex items-center justify-center shrink-0 ${notice.color} group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex justify-between items-start mb-1 gap-4">
                          <h3 className="text-[14px] font-semibold text-gray-900 dark:text-gray-100 leading-tight">{notice.title}</h3>
                          <span className={`text-[10px] font-semibold ${notice.color} ${notice.bg} px-2 py-0.5 rounded border ${notice.borderColor} whitespace-nowrap`}>{notice.type}</span>
                        </div>
                        <p className="text-[13px] text-gray-600 dark:text-gray-400 mb-2 leading-relaxed line-clamp-2">{notice.content}</p>
                        <p className="text-[11px] font-medium text-gray-400">By {notice.author} • {new Date(notice.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Batch & Mentor Info */}
          <div
            onClick={() => navigate(`/student/profile`)}
            className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 hover:scale-[1.02] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${studentProfile.batch === 'Beta 1' ? 'bg-green-100 text-green-500' : 'bg-orange-100 text-orange-500'} rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                  {studentProfile.batch === 'Beta 1' ? <Target className="w-5 h-5" /> : <Rocket className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-[16px] font-semibold text-gray-800 leading-none group-hover:text-blue-600 transition-colors">{studentProfile.batch || 'Alpha 1'}</h2>
                  <p className="text-[11px] text-gray-500 font-medium mt-1">Session 2023-2027</p>
                </div>
              </div>
              <button className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100">View Profile</button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-purple-500 mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase font-semibold text-gray-400 leading-none mb-1">Assigned Mentors</p>
                  <p className="text-[13px] font-semibold text-gray-800">Arun Kudiyal<br />Mahesh Sharma</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BookOpen className="w-4 h-4 text-purple-500 mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase font-semibold text-gray-400 leading-none mb-1">Program</p>
                  <p className="text-[13px] font-semibold text-gray-800">{studentProfile.branch || 'B.Tech CSE'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Notes */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col h-[350px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[15px] font-semibold text-gray-800 flex items-center gap-2"><CheckSquare className="w-4 h-4 text-green-600" /> Quick Notes</h2>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 scrollbar-thin scrollbar-thumb-gray-200">
              {notes.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No notes added yet.</p>
              ) : (
                notes.map(note => (
                  <div key={note.id} className="group bg-gray-50 border border-gray-100 rounded-lg p-3 relative hover:border-gray-200 transition-colors">
                    {editingNoteId === note.id ? (
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={editingNoteText}
                          onChange={(e) => setEditingNoteText(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-green-500"
                          autoFocus
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="datetime-local"
                            value={editingNoteTime}
                            onChange={(e) => setEditingNoteTime(e.target.value)}
                            className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-500 focus:outline-none focus:border-green-500"
                          />
                          <button onClick={() => saveEdit(note.id)} className="text-green-600 hover:text-green-700 bg-green-50 px-2 py-1 rounded">
                            <Save className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingNoteId(null)} className="text-gray-400 hover:text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <p className="text-sm text-gray-700 leading-snug break-words mb-1.5">{note.text}</p>
                          {note.reminderTime && (
                            <p className="text-[10px] font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full inline-block border border-green-200">
                              Reminder: {new Date(note.reminderTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </p>
                          )}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => { setEditingNoteId(note.id); setEditingNoteText(note.text); setEditingNoteTime(note.reminderTime || ''); }}
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

            <form onSubmit={addNote} className="flex flex-col gap-2 mt-auto">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Type a new note..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:bg-white focus:border-green-500 transition-colors"
              />
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={newNoteTime}
                  onChange={(e) => setNewNoteTime(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:bg-white focus:border-green-500 text-gray-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors flex items-center justify-center font-semibold"
                  disabled={!newNote.trim()}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showNoticePopup && latestNotice && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className={`h-2 ${latestNotice.bg} w-full`}></div>
            <div className="p-6 relative">
              <button 
                onClick={() => setShowNoticePopup(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-4 pr-8">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${latestNotice.bg} ${latestNotice.color}`}>
                  <Megaphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 leading-tight">New Announcement</h3>
                  <p className="text-sm text-gray-500 font-medium">From {latestNotice.author}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 mb-5">
                <h4 className="text-[16px] font-semibold text-gray-900 mb-2">{latestNotice.title}</h4>
                <p className="text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap">{latestNotice.content}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded text-[11px] font-semibold tracking-wider uppercase border w-max ${latestNotice.bg} ${latestNotice.color} ${latestNotice.borderColor}`}>
                  {latestNotice.type}
                </span>
                <button 
                  onClick={() => setShowNoticePopup(false)}
                  className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
