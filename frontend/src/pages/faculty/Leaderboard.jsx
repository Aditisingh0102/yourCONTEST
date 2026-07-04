import React, { useState } from 'react';
import { Medal, Filter, ChevronDown, CheckSquare, Users } from 'lucide-react';
import LeaderboardComponent from '../../components/Leaderboard';
import { upcomingContests } from '../../data/mockData';

const MOCK_BATCHES = ['Alpha 1', 'Alpha 2', 'Beta 1'];

export default function FacultyLeaderboard() {
  // Filter contests that make sense to show a leaderboard for (e.g. not upcoming)
  const availableContests = upcomingContests.filter(c => c.status !== 'Upcoming');

  const [selectedBatch, setSelectedBatch] = useState(MOCK_BATCHES[0]);
  const [selectedContest, setSelectedContest] = useState(availableContests.length > 0 ? availableContests[0].id : null);
  
  // Fallback to first available if the currently selected one is not valid
  const effectiveContestId = selectedContest || (availableContests.length > 0 ? availableContests[0].id : null);

  return (
    <div className="max-w-[1200px] mx-auto py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Medal className="w-6 h-6 text-blue-600 dark:text-blue-500" />
            Batch Leaderboards
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track student performance across different batches and contests
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-medium text-sm whitespace-nowrap">
          <Filter className="w-4 h-4" /> Filters:
        </div>
        
        {/* Batch Selector */}
        <div className="flex-1 w-full sm:w-auto relative group">
          <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 block">Select Batch</label>
          <div className="relative">
            <Users className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full appearance-none pl-9 pr-10 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer transition-colors"
            >
              {MOCK_BATCHES.map(batch => (
                <option key={batch} value={batch}>{batch}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Contest Selector */}
        <div className="flex-[2] w-full sm:w-auto relative group">
          <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 block">Select Contest</label>
          <div className="relative">
            <CheckSquare className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={effectiveContestId || ''}
              onChange={(e) => setSelectedContest(Number(e.target.value))}
              className="w-full appearance-none pl-9 pr-10 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer transition-colors"
            >
              {availableContests.map(contest => (
                <option key={contest.id} value={contest.id}>
                  {contest.name} ({contest.type})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Leaderboard View */}
      <div className="min-h-[500px]">
        {effectiveContestId ? (
          <LeaderboardComponent 
            contestId={effectiveContestId} 
            batch={selectedBatch} 
            isFaculty={true} 
          />
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-xl p-12 text-center shadow-sm">
            <Medal className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No contests available to display leaderboard.</p>
          </div>
        )}
      </div>
      
    </div>
  );
}
