import React, { useState, useEffect } from 'react';
import { socket } from '../socket';
import { Trophy, Medal, Clock, CheckCircle, Search } from 'lucide-react';
import { getSubmissions } from '../api';

export default function Leaderboard({ contestId, batch, isFaculty = false }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSubs = async () => {
      try {
        const res = await getSubmissions();
        const relevantSubs = res.data.filter(s => 
          (s.contestId === contestId) && 
          (!batch || s.batch === batch) // if batch is provided, filter by it
        );
        setSubmissions(relevantSubs);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchSubs();

    const handleNewSubmission = (newSub) => {
      if (newSub.contestId === contestId && (!batch || newSub.batch === batch)) {
        setSubmissions(prev => {
          // Replace if exists (retake/update scenario), else append
          const exists = prev.find(p => p._id === newSub._id || p.studentId === newSub.studentId);
          if (exists) {
            return prev.map(p => (p.studentId === newSub.studentId ? newSub : p));
          }
          return [...prev, newSub];
        });
      }
    };

    socket.on('SUBMISSION_ADDED', handleNewSubmission);
    socket.on('SUBMISSION_UPDATED', handleNewSubmission);

    return () => {
      socket.off('SUBMISSION_ADDED', handleNewSubmission);
      socket.off('SUBMISSION_UPDATED', handleNewSubmission);
    };
  }, [contestId, batch]);

  // Sort: Highest score first, then earliest timestamp
  const sortedLeaderboard = [...submissions].sort((a, b) => {
    const scoreA = a.score || 0;
    const scoreB = b.score || 0;
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    const timeA = a.submittedAt || Date.now();
    const timeB = b.submittedAt || Date.now();
    return timeA - timeB;
  });

  const filteredLeaderboard = sortedLeaderboard.filter(sub => 
    sub.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading Leaderboard...</div>;
  }

  if (submissions.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 dark:bg-[#0b1120] rounded-xl border border-gray-100 dark:border-gray-800">
        <Trophy className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">No submissions yet for {batch ? `batch ${batch}` : 'this contest'}.</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Leaderboard will update automatically in real-time.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" /> 
            Live Leaderboard
          </h3>
          {batch && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Batch: <span className="font-semibold text-blue-600 dark:text-blue-400">{batch}</span></p>}
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search student..." 
            className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:text-white w-full sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-gray-800 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
              <th className="px-6 py-4">Rank</th>
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4 text-right">Score</th>
              <th className="px-6 py-4 text-right hidden sm:table-cell">Submitted At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {filteredLeaderboard.map((sub, idx) => {
              const rank = sortedLeaderboard.findIndex(s => s._id === sub._id) + 1;
              
              let rankColor = "text-gray-500 dark:text-gray-400";
              let badgeBg = "bg-gray-100 dark:bg-gray-800";
              if (rank === 1) { rankColor = "text-yellow-600 dark:text-yellow-400"; badgeBg = "bg-yellow-100 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20"; }
              else if (rank === 2) { rankColor = "text-gray-600 dark:text-gray-300"; badgeBg = "bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"; }
              else if (rank === 3) { rankColor = "text-orange-700 dark:text-orange-400"; badgeBg = "bg-orange-100 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20"; }

              return (
                <tr key={sub._id} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${badgeBg} ${rankColor}`}>
                      {rank === 1 ? <Trophy className="w-4 h-4" /> : rank === 2 || rank === 3 ? <Medal className="w-4 h-4" /> : rank}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-200 dark:border-blue-800">
                        {sub.studentName ? sub.studentName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">{sub.studentName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{sub.studentId || sub.batch}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 font-semibold border border-green-100 dark:border-green-500/20 text-sm">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {sub.score || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right hidden sm:table-cell">
                    <div className="flex items-center justify-end gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {sub.submittedAt ? new Date(sub.submittedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}) : 'N/A'}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredLeaderboard.length === 0 && searchTerm && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No students found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
}
