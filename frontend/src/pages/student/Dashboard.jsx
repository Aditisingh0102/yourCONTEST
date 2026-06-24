import React, { useState, useEffect } from 'react';
import { upcomingContests, user } from '../../data/mockData';
import { Trophy, CheckCircle, Flame, Award, BookOpen, Users, Megaphone, AlertCircle, FileText, Briefcase, Info, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getNotices, getContests } from '../../api';
import { socket } from '../../socket';

const iconMap = {
  Info, AlertCircle, FileText, Briefcase, BookOpen
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [contests, setContests] = useState([]);

  useEffect(() => {
    fetchNotices();
    fetchContests();

    socket.on('NOTICE_UPDATED', (data) => {
      if (data.type === 'CREATE') setNotices(prev => [data.notice, ...prev]);
      else if (data.type === 'UPDATE') setNotices(prev => prev.map(n => n._id === data.notice._id ? data.notice : n));
      else if (data.type === 'DELETE') setNotices(prev => prev.filter(n => n._id !== data.id));
    });

    socket.on('CONTEST_UPDATED', (data) => {
      if (data.type === 'CREATE') setContests(prev => [data.contest, ...prev]);
      else if (data.type === 'UPDATE') setContests(prev => prev.map(c => c._id === data.contest._id ? data.contest : c));
      else if (data.type === 'DELETE') setContests(prev => prev.filter(c => c._id !== data.id));
    });

    return () => {
      socket.off('NOTICE_UPDATED');
      socket.off('CONTEST_UPDATED');
    };
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await getNotices();
      setNotices(res.data.slice(0, 3));
    } catch (error) {
      console.error("Failed to fetch notices", error);
    }
  };

  const fetchContests = async () => {
    try {
      const res = await getContests();
      setContests(res.data.filter(c => c.status !== 'Ended').slice(0, 2)); // Show up to 2 active/upcoming
    } catch (error) {
      console.error("Failed to fetch contests", error);
    }
  };

  const [studentName, setStudentName] = useState(() => {
    const saved = localStorage.getItem('student_profile');
    if (saved) return JSON.parse(saved).name;
    return 'Aditi Singh';
  });

  useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem('student_profile');
      if (saved) setStudentName(JSON.parse(saved).name);
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 dark:bg-blue-500/10 rounded-full text-[11px] font-bold tracking-wider mb-3 shadow-sm border border-white/10 dark:border-blue-400/20 uppercase text-white dark:text-blue-200">
            <Rocket className="w-3.5 h-3.5 text-white dark:text-blue-300" /> BATCH: ALPHA 1
          </div>
          <h1 className="text-3xl font-bold mb-1 text-white">{studentName}</h1>
          <p className="text-blue-100 dark:text-blue-200/60 text-sm mb-4">UIT • B.Tech CSE • 4th Year Student</p>

        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Contests', value: 0, icon: Trophy, color: 'text-blue-500' },
          { label: 'Mock Tests Taken', value: 0, icon: BookOpen, color: 'text-orange-500' },
          { label: 'Assessments Given', value: 0, icon: Users, color: 'text-purple-500' },
          { label: 'Avg. Score', value: '0%', icon: CheckCircle, color: 'text-green-500' },
        ].map((stat, i) => (
          <div
            key={i}
            onClick={() => {
              if (stat.label === 'Avg. Score') navigate('/student/profile');
              else navigate('/student/contests');
            }}
            className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-zinc-600 hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div className={`p-3 rounded-xl bg-gray-50/50 border border-gray-100 group-hover:scale-110 transition-transform ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-0.5">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Contests */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-bold text-gray-800">Upcoming Contests</h2>
              <button className="text-[13px] font-medium text-blue-600 hover:underline" onClick={() => navigate('/student/contests')}>View all</button>
            </div>

            {contests.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-10 flex flex-col items-center justify-center text-center">
                <Trophy className="w-12 h-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-bold text-gray-800 mb-1">No Upcoming Contests</h3>
                <p className="text-sm text-gray-500 mb-4 max-w-sm">You're all caught up! Keep an eye out for new mock tests or assessments scheduled by your mentors.</p>
                <button className="text-sm font-medium text-blue-600 flex items-center gap-1 hover:underline" onClick={() => navigate('/student/contests')}>
                  View Past Contests &rarr;
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {contests.map((contest) => (
                  <div key={contest._id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                      <h3 className="text-[15px] font-bold text-gray-900">{contest.name || contest.title || "Untitled Contest"}</h3>
                      <p className="text-[13px] text-gray-500">{contest.subject || contest.type || 'Contest'} • {contest.duration}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${contest.status === 'Live' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-orange-50 text-orange-600 border border-orange-100'
                        }`}>
                        {contest.status}
                      </span>
                      <button onClick={() => navigate('/student/contests')} className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-800">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notice Board */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[15px] font-bold text-gray-800 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-orange-500" />
                Notice Board
              </h2>
              <button onClick={() => navigate('/student/notices')} className="text-[13px] font-medium text-blue-600 hover:underline">View all</button>
            </div>

            <div className="space-y-4">
              {notices.length === 0 ? (
                <div onClick={() => navigate('/student/notices')} className="text-center py-8 rounded-xl border border-gray-100 border-dashed hover:bg-gray-50 transition-colors cursor-pointer group">
                  <p className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors">No new notices from your faculty.</p>
                </div>
              ) : (
                notices.map((notice) => {
                  const IconComponent = iconMap[notice.iconName] || Info;
                  return (
                    <div key={notice._id} onClick={() => navigate('/student/notices')} className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-300 dark:border-zinc-800/80 dark:hover:border-zinc-700 bg-gray-50/30 hover:bg-gray-100/50 dark:bg-[#121212] dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group">
                      <div className={`w-10 h-10 rounded-full ${notice.bg} flex items-center justify-center shrink-0 ${notice.color} group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex justify-between items-start mb-1 gap-4">
                          <h3 className="text-[14px] font-bold text-gray-900 leading-tight">{notice.title}</h3>
                          <span className={`text-[10px] font-bold ${notice.color} ${notice.bg} px-2 py-0.5 rounded border ${notice.borderColor} whitespace-nowrap`}>{notice.type}</span>
                        </div>
                        <p className="text-[13px] text-gray-600 mb-2 leading-relaxed line-clamp-2">{notice.content}</p>
                        <p className="text-[11px] font-bold text-gray-400">By {notice.author} • {new Date(notice.date).toLocaleDateString()}</p>
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
            onClick={() => navigate('/student/profile')}
            className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 hover:scale-[1.02] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <Rocket className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-[16px] font-bold text-gray-800 leading-none group-hover:text-blue-600 transition-colors">Alpha 1</h2>
                  <p className="text-[11px] text-gray-500 font-medium mt-1">Session 2023-2027</p>
                </div>
              </div>
              <button className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100">View Profile</button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-purple-500 mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 leading-none mb-1">Assigned Mentors</p>
                  <p className="text-[13px] font-bold text-gray-800">Arun Kudiyal<br />Mahesh Sharma</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BookOpen className="w-4 h-4 text-purple-500 mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 leading-none mb-1">Program</p>
                  <p className="text-[13px] font-bold text-gray-800">B.Tech CSE</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// Adding missing icons required for above component
import { Code, User } from 'lucide-react';
