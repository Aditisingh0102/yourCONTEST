import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Calendar, Clock, Users, PlayCircle, Plus, Edit3, Trash2, Search, Filter, X, CheckCircle2, AlertCircle, FileText, BarChart2 } from 'lucide-react';
import { getContests, updateContest, deleteContest, getSubmissions } from '../../api';
import { socket } from '../../socket';
import AnalyticsModal from './AnalyticsModal';

export default function ContestManager() {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Active');
  const [extendModal, setExtendModal] = useState({ show: false, contestId: null, minutes: 30 });
  const [analyticsModal, setAnalyticsModal] = useState({ show: false, contest: null });

  const fetchContests = async () => {
    try {
      const [contRes, subRes] = await Promise.all([
        getContests(),
        getSubmissions()
      ]);
      setContests(contRes.data);
      
      const rawSubmissions = subRes.data || [];
      const uniqueSubsMap = new Map();
      rawSubmissions.forEach(sub => {
        const key = `${sub.contestId}-${sub.studentId || sub.studentName}`;
        if (!uniqueSubsMap.has(key)) {
          uniqueSubsMap.set(key, sub);
        } else {
          const existing = uniqueSubsMap.get(key);
          if (new Date(sub.submittedAt) > new Date(existing.submittedAt)) {
            uniqueSubsMap.set(key, sub);
          }
        }
      });
      
      setSubmissions(Array.from(uniqueSubsMap.values()));
    } catch (error) {
      console.error("Failed to fetch contests/submissions", error);
    }
  };

  useEffect(() => {
    fetchContests();

    const handleUpdate = () => {
      fetchContests(); // Refresh data when changes happen
    };

    socket.on('CONTEST_UPDATED', handleUpdate);
    socket.on('SUBMISSION_ADDED', handleUpdate);
    socket.on('SUBMISSION_DELETED', handleUpdate);

    return () => {
      socket.off('CONTEST_UPDATED', handleUpdate);
      socket.off('SUBMISSION_ADDED', handleUpdate);
      socket.off('SUBMISSION_DELETED', handleUpdate);
    };
  }, []);

  const filteredContests = contests.filter(c => {
    const matchesSearch = (c.title || c.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const isActive = c.status === 'Live' || c.status === 'Upcoming';
    if (activeTab === 'Active') return matchesSearch && isActive;
    return matchesSearch && !isActive;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Live': return 'bg-red-50 text-red-600 border-red-200';
      case 'Upcoming': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Past': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteContest(id);
      fetchContests();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExtendTime = async () => {
    const contest = contests.find(c => c._id === extendModal.contestId || c.id === extendModal.contestId);
    if (!contest) return;
    
    const currentMins = parseInt(contest.duration) || 0;
    try {
      await updateContest(contest._id || contest.id, { duration: `${currentMins + extendModal.minutes} mins` });
      fetchContests();
    } catch(err) {
      console.error(err);
    }
    setExtendModal({ show: false, contestId: null, minutes: 30 });
  };


  return (
    <div className="max-w-[1200px] mx-auto py-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Contest Manager</h1>
          <p className="text-sm text-gray-500 mt-1">Create, schedule and manage coding assessments</p>
        </div>
        <button 
          onClick={() => navigate('/faculty/create-contest')}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:from-blue-500 hover:to-indigo-500 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Create New Contest
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Contests</p>
            <p className="text-2xl font-semibold text-gray-900">{contests.length}</p>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
            <PlayCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Live Now</p>
            <p className="text-2xl font-semibold text-gray-900">{contests.filter(c => c.status === 'Live').length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Upcoming</p>
            <p className="text-2xl font-semibold text-gray-900">{contests.filter(c => c.status === 'Upcoming').length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Submissions</p>
            <p className="text-2xl font-semibold text-gray-900">{submissions.length}</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Tabs & Search */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex gap-6">
            <button 
              onClick={() => setActiveTab('Active')}
              className={`pb-4 text-sm font-semibold transition-all relative ${activeTab === 'Active' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Live & Upcoming
              {activeTab === 'Active' && <div className="absolute bottom-[-21px] left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
            </button>
            <button 
              onClick={() => setActiveTab('Past')}
              className={`pb-4 text-sm font-semibold transition-all relative ${activeTab === 'Past' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Past Contests
              {activeTab === 'Past' && <div className="absolute bottom-[-21px] left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search contests..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full md:w-64"
              />
            </div>
            <button className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-medium text-gray-400 uppercase tracking-wider">Contest Details</th>
                <th className="px-6 py-4 text-[11px] font-medium text-gray-400 uppercase tracking-wider">Schedule</th>
                <th className="px-6 py-4 text-[11px] font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[11px] font-medium text-gray-400 uppercase tracking-wider">Participation</th>
                <th className="px-6 py-4 text-[11px] font-medium text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredContests.length > 0 ? (
                filteredContests.map((contest) => (
                  <tr key={contest.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 text-sm mb-1">{contest.title}</div>
                      <div className="text-[13px] text-gray-500 flex items-center gap-2">
                        <span>{contest.type}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span>{contest.questions} Questions</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[13px] font-medium text-gray-800 mb-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" /> {contest.startTime}
                      </div>
                      <div className="flex items-center gap-2 text-[13px] text-gray-500">
                        <Clock className="w-3.5 h-3.5 text-gray-400" /> Duration: {contest.duration}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-md uppercase tracking-wider border ${getStatusColor(contest.status)}`}>
                        {contest.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[13px] text-gray-600 font-medium">
                        <Users className="w-4 h-4 text-gray-400" /> {submissions.filter(s => s.contestId === (contest._id || contest.id)).length} Submissions
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {contest.status === 'Live' && (
                          <button 
                            onClick={() => setExtendModal({ show: true, contestId: contest._id || contest.id, minutes: 30 })}
                            className="px-3 py-1.5 text-[11px] font-semibold bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 rounded-lg transition-colors whitespace-nowrap"
                            title="Extend Time"
                          >
                            + Extend Time
                          </button>
                        )}
                        <button 
                          onClick={() => navigate(`/faculty/edit-contest/${contest._id || contest.id}`)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                          title="Edit Details">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => navigate(`/faculty/manage-contests/${contest._id || contest.id}/questions`)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" 
                          title="Manage Questions">
                          <FileText className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setAnalyticsModal({ show: true, contest })}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="View Analytics">
                          <BarChart2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(contest._id || contest.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Contest">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-500 text-sm">No contests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Extend Time Modal */}
      {extendModal.show && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Extend Time</h3>
            </div>
            <p className="text-sm text-gray-600 mb-5">How many extra minutes do you want to provide for this live contest?</p>
            
            <div className="flex items-center gap-4 mb-4">
              {[15, 30, 45, 60].map(mins => (
                <button 
                  key={mins}
                  onClick={() => setExtendModal({...extendModal, minutes: mins})}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${extendModal.minutes === mins ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  +{mins}m
                </button>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Custom Time (Minutes)</label>
              <input 
                type="number"
                min="1"
                placeholder="e.g. 20"
                value={extendModal.minutes || ''}
                onChange={(e) => setExtendModal({...extendModal, minutes: e.target.value ? parseInt(e.target.value) : ''})}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-green-500 transition-all text-sm"
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setExtendModal({ show: false, contestId: null, minutes: 30 })}
                className="flex-1 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleExtendTime}
                className="flex-1 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {analyticsModal.show && (
        <AnalyticsModal 
          contest={analyticsModal.contest}
          submissions={submissions.filter(s => s.contestId === (analyticsModal.contest._id || analyticsModal.contest.id))}
          onClose={() => setAnalyticsModal({ show: false, contest: null })}
        />
      )}

    </div>
  );
}
