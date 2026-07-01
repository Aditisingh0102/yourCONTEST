import { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Calendar, Clock, Users, PlayCircle, Plus, Edit3, Trash2, Search, Filter, CheckCircle2, AlertCircle, FileText, BarChart2 } from 'lucide-react';
import { getContests, updateContest, deleteContest, getSubmissions, updateSubmission, deleteSubmission } from '../../api';
import { socket } from '../../socket';
import AnalyticsModal from './AnalyticsModal';

export default function ContestManager() {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Active');
  const [expandedContestId, setExpandedContestId] = useState(null);
  const [extendModal, setExtendModal] = useState({ show: false, contestId: null, minutes: 30 });
  const [analyticsModal, setAnalyticsModal] = useState({ show: false, contest: null, initialStudent: null });
  const [manageStudentModal, setManageStudentModal] = useState({ show: false, submission: null, extraTime: 0, notes: '' });
  const [resetConfirmModal, setResetConfirmModal] = useState({ show: false, submission: null });
  const [endTestConfirmModal, setEndTestConfirmModal] = useState({ show: false, contestId: null });

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchContests();

    const handleUpdate = () => {
      fetchContests(); // Refresh data when changes happen
    };

    socket.on('CONTEST_UPDATED', handleUpdate);
    socket.on('SUBMISSION_ADDED', handleUpdate);
    socket.on('SUBMISSION_DELETED', handleUpdate);
    socket.on('SUBMISSION_UPDATED', handleUpdate);

    return () => {
      socket.off('CONTEST_UPDATED', handleUpdate);
      socket.off('SUBMISSION_ADDED', handleUpdate);
      socket.off('SUBMISSION_DELETED', handleUpdate);
      socket.off('SUBMISSION_UPDATED', handleUpdate);
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

  const handleEndTest = async () => {
    if (!endTestConfirmModal.contestId) return;
    try {
      await updateContest(endTestConfirmModal.contestId, { status: 'Past', endTime: new Date().toISOString() });
      fetchContests();
    } catch(err) {
      console.error(err);
      alert('Failed to end test.');
    }
    setEndTestConfirmModal({ show: false, contestId: null });
  };


  const handleManageStudentSubmit = async () => {
    if (!manageStudentModal.submission) return;
    try {
      await updateSubmission(manageStudentModal.submission._id, {
        extraTime: manageStudentModal.extraTime,
        notes: manageStudentModal.notes,
        status: manageStudentModal.extraTime > 0 ? 'reopened' : manageStudentModal.submission.status
      });
      fetchContests(); // refresh data
    } catch (err) {
      console.error(err);
    }
    setManageStudentModal({ show: false, submission: null, extraTime: 0, notes: '' });
  };

  const handleResetStudent = async () => {
    if (!resetConfirmModal.submission) return;
    try {
      await deleteSubmission(resetConfirmModal.submission._id);
      fetchContests(); // refresh data
    } catch(err) {
      console.error(err);
      alert('Failed to reset test.');
    }
    setResetConfirmModal({ show: false, submission: null });
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
                  <Fragment key={contest.id || contest._id}>
                    <tr 
                      className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                      onClick={(e) => {
                        if(e.target.closest('button')) return;
                        setExpandedContestId(expandedContestId === (contest._id || contest.id) ? null : (contest._id || contest.id));
                      }}
                    >
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
                      <div className="flex items-center justify-end gap-3">
                        {contest.status === 'Live' && (
                          <div className="flex gap-2 mr-2">
                            <button 
                              onClick={() => setExtendModal({ show: true, contestId: contest._id || contest.id, minutes: 30 })}
                              className="px-3 py-1.5 text-[11px] font-semibold bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 rounded-lg transition-colors whitespace-nowrap"
                              title="Extend Time"
                            >
                              + Extend Time
                            </button>
                            <button 
                              onClick={() => setEndTestConfirmModal({ show: true, contestId: contest._id || contest.id })}
                              className="px-3 py-1.5 text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-lg transition-colors whitespace-nowrap"
                              title="End Test"
                            >
                              End Test
                            </button>
                          </div>
                        )}
                        <div className="flex items-center bg-gray-50/80 border border-gray-200/80 rounded-xl p-1 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-300">
                          <button 
                            onClick={() => navigate(`/faculty/edit-contest/${contest._id || contest.id}`)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white hover:shadow-sm rounded-lg transition-all duration-200 relative group" 
                            title="Edit Details">
                            <Edit3 className="w-4 h-4 transition-transform group-hover:scale-110" />
                          </button>
                          <div className="w-px h-4 bg-gray-200 mx-0.5"></div>
                          <button 
                            onClick={() => navigate(`/faculty/manage-contests/${contest._id || contest.id}/questions`)}
                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg transition-all duration-200 relative group" 
                            title="Manage Questions">
                            <FileText className="w-4 h-4 transition-transform group-hover:scale-110" />
                          </button>
                          <div className="w-px h-4 bg-gray-200 mx-0.5"></div>
                          <button 
                            onClick={() => setAnalyticsModal({ show: true, contest, initialStudent: null })}
                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-white hover:shadow-sm rounded-lg transition-all duration-200 relative group" 
                            title="View Analytics">
                            <BarChart2 className="w-4 h-4 transition-transform group-hover:scale-110" />
                          </button>
                          <div className="w-px h-4 bg-gray-200 mx-0.5"></div>
                          <button 
                            onClick={() => handleDelete(contest._id || contest.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 hover:shadow-sm rounded-lg transition-all duration-200 relative group" 
                            title="Delete Contest">
                            <Trash2 className="w-4 h-4 transition-transform group-hover:scale-110" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                  {expandedContestId === (contest._id || contest.id) && (
                    <tr>
                      <td colSpan="5" className="p-0 border-b border-gray-100 bg-gray-50/50">
                        <div className="p-6">
                          <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-blue-600" /> Student Submissions</h4>
                          {submissions.filter(s => s.contestId === (contest._id || contest.id)).length === 0 ? (
                            <p className="text-sm text-gray-500 bg-white p-4 rounded-xl border border-gray-100 text-center">No submissions yet.</p>
                          ) : (
                            <div className="flex flex-col gap-3">
                              {submissions.filter(s => s.contestId === (contest._id || contest.id)).map(sub => {
                                let calculatedScore = 0;
                                let totalMarks = contest.questionList?.reduce((acc, q) => acc + (q.marks || 0), 0) || 0;
                                if (contest.questionList && sub.answers) {
                                  contest.questionList.forEach(q => {
                                    if (q.type === 'MCQ' && sub.answers[q.id] === q.correctOption) {
                                      calculatedScore += q.marks || 0;
                                    }
                                  });
                                }
                                return (
                                  <div 
                                    key={sub._id} 
                                    onClick={(e) => {
                                      if(e.target.closest('button')) return;
                                      setAnalyticsModal({ show: true, contest, initialStudent: { ...sub, calculatedScore } });
                                    }}
                                    className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:border-blue-300 transition-colors cursor-pointer"
                                  >
                                    <div>
                                      <p className="font-bold text-gray-900 text-sm mb-1">{sub.studentName}</p>
                                      <div className="flex items-center gap-3">
                                        <p className="text-[11px] text-gray-500 flex items-center gap-1.5"><Clock className="w-3 h-3" /> {sub.status === 'in_progress' ? 'Started: ' : ''}{new Date(sub.startedAt || sub.submittedAt).toLocaleString()}</p>
                                        {sub.status === 'in_progress' && (
                                          <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold rounded flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                            Live Now
                                          </span>
                                        )}
                                        {sub.status === 'reopened' && (
                                          <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-200 text-[10px] font-bold rounded">Reopened</span>
                                        )}
                                      </div>
                                      {sub.notes && (
                                        <p className="mt-2 text-[11px] text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 line-clamp-2 max-w-2xl">
                                          <span className="font-bold text-gray-700">Note:</span> {sub.notes}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-6">
                                      <div className="text-right border-r border-gray-100 pr-6">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Score</p>
                                        <p className="text-lg font-black text-blue-600 leading-none">{sub.status === 'in_progress' ? '--' : calculatedScore} <span className="text-[10px] text-gray-400">/ {totalMarks}</span></p>
                                      </div>
                                      <div className="flex gap-2">
                                        <button 
                                          onClick={() => setManageStudentModal({ 
                                            show: true, 
                                            submission: sub, 
                                            extraTime: sub.extraTime || 0, 
                                            notes: sub.notes || '' 
                                          })}
                                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors border border-blue-200"
                                        >
                                          Extend Time
                                        </button>
                                        <button 
                                          onClick={() => setResetConfirmModal({ show: true, submission: sub })}
                                          className="text-[11px] font-bold text-orange-600 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-lg transition-colors border border-orange-200"
                                        >
                                          Reset Test
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                  </Fragment>
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
          onClose={() => setAnalyticsModal({ show: false, contest: null, initialStudent: null })}
          initialStudent={analyticsModal.initialStudent}
        />
      )}

      {/* Manage Student Modal */}
      {manageStudentModal.show && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Manage Student</h3>
            </div>
            
            <p className="text-sm font-bold text-gray-800 mb-5">Student: <span className="font-normal text-gray-600">{manageStudentModal.submission?.studentName}</span></p>

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Extend Time (Minutes)</label>
              <p className="text-[11px] text-gray-400 mb-2">If you grant time, the student's test will be reopened, allowing them to re-enter and use this extra time to complete it.</p>
              <input 
                type="number"
                min="0"
                placeholder="e.g. 10"
                value={manageStudentModal.extraTime || ''}
                onChange={(e) => setManageStudentModal({...manageStudentModal, extraTime: e.target.value === '' ? 0 : parseInt(e.target.value)})}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 transition-all text-sm"
              />
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Faculty Notes</label>
              <textarea 
                rows="3"
                placeholder="Internal notes about this student's submission..."
                value={manageStudentModal.notes || ''}
                onChange={(e) => setManageStudentModal({...manageStudentModal, notes: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 transition-all text-sm resize-none"
              ></textarea>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setManageStudentModal({ show: false, submission: null, extraTime: 0, notes: '' })}
                className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleManageStudentSubmit}
                className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {resetConfirmModal.show && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reset Submission?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to permanently delete <strong>{resetConfirmModal.submission?.studentName}'s</strong> submission? This allows them to retake the test from scratch.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setResetConfirmModal({ show: false, submission: null })}
                className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleResetStudent}
                className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
              >
                Yes, Delete It
              </button>
            </div>
          </div>
        </div>
      )}
      {/* End Test Confirmation Modal */}
      {endTestConfirmModal.show && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">End Contest?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to end this live contest immediately? This will permanently close the contest and stop any ongoing submissions.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setEndTestConfirmModal({ show: false, contestId: null })}
                className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleEndTest}
                className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
              >
                Yes, End It
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
