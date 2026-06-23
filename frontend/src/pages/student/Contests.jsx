import React, { useState, useEffect } from 'react';
import { Trophy, ChevronLeft, ChevronRight, SlidersHorizontal, AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getContests } from '../../api';
import { socket } from '../../socket';

export default function Contests() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [allContests, setAllContests] = useState([]);
  const [toastMessage, setToastMessage] = useState('');

  const fetchContests = async () => {
    try {
      const res = await getContests();
      setAllContests(res.data);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchContests();
    socket.on('CONTEST_UPDATED', fetchContests);
    return () => socket.off('CONTEST_UPDATED');
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleContestClick = (contest) => {
    if (contest.status === 'Past') {
      navigate(`/student/contests/${contest._id || contest.id}`);
      return;
    }
    
    if (contest.status === 'Upcoming') {
      // Check if it's within 30 minutes of start time
      const startTime = new Date(contest.startTime).getTime();
      const now = new Date().getTime();
      const diffMins = (startTime - now) / 1000 / 60;
      
      // If it's more than 30 mins away, show soft message
      if (diffMins > 30) {
        showToast("The contest hasn't started yet. The waiting room will open 30 minutes before the start time.");
        return;
      }
    }
    
    // Within 30 mins or Live -> go to Arena
    navigate(`/student/arena/${contest._id || contest.id}`);
  };

  const activeContests = allContests.filter(c => c.status === 'Live' || c.status === 'Upcoming');
  const pastContests = allContests.filter(c => c.status === 'Past');

  const displayedContests = activeTab === 'upcoming' ? activeContests : pastContests;

  return (
    <div className="max-w-[1000px] mx-auto py-6 relative">
      {/* Soft Toast Message */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-5">
          <AlertCircle className="w-5 h-5 text-orange-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="ml-2 text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] overflow-hidden border border-gray-100">
        
        {/* Header / Tabs */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 pt-4">
          <div className="flex gap-6">
            <button 
              onClick={() => setActiveTab('upcoming')}
              className={`pb-4 text-sm font-bold transition-all relative ${
                activeTab === 'upcoming' 
                  ? 'text-blue-600' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Active & Upcoming
              {activeTab === 'upcoming' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('past')}
              className={`pb-4 text-sm font-bold transition-all relative ${
                activeTab === 'past' 
                  ? 'text-blue-600' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Past Contests
              {activeTab === 'past' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>
              )}
            </button>
          </div>
          <button className="p-1.5 mb-3 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="flex flex-col">
          {displayedContests.length === 0 && (
            <div className="py-12 text-center text-gray-500">
               No contests found in this category.
            </div>
          )}
          {displayedContests.map((contest, idx) => (
            <div 
               key={contest._id || contest.id} 
               onClick={() => handleContestClick(contest)}
               className={`flex items-center justify-between p-6 hover:bg-blue-50/50 transition-colors cursor-pointer group ${idx !== displayedContests.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              
              <div className="flex items-center gap-5">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                  contest.type === 'Assessment' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-500'
                }`}>
                  <Trophy className="w-6 h-6" />
                </div>
                
                {/* Details */}
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <h3 className="text-[16px] font-bold text-gray-900 leading-none group-hover:text-blue-600 transition-colors">{contest.name}</h3>
                    {contest.status === 'Live' && (
                       <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-red-50 text-red-600 border border-red-200 flex items-center gap-1">
                         <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                         Live
                       </span>
                    )}
                  </div>
                  <p className="text-[13px] text-gray-500 font-medium">
                    {contest.date}, {contest.time} • {contest.duration}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center justify-center px-3 py-1 bg-gray-100 rounded-lg text-[13px] font-bold text-gray-600">
                  {contest.participants} <span className="font-normal text-gray-500 ml-1">Joined</span>
                </div>
                
                {/* Type Tag */}
                <div className="text-[11px] font-bold tracking-wider uppercase hidden sm:block">
                     {contest.type === 'Assessment' ? (
                       <span className="text-purple-600 bg-purple-50 px-2.5 py-1.5 rounded-lg border border-purple-200">★ Assessment</span>
                     ) : (
                       <span className="text-orange-600 bg-orange-50 px-2.5 py-1.5 rounded-lg border border-orange-200">📝 Mock Test</span>
                     )}
                </div>

                <button 
                  className={`px-6 py-1.5 rounded-lg text-[13px] font-bold border transition-colors ${
                    contest.status === 'Live' 
                      ? 'bg-blue-600 border-blue-600 text-white group-hover:bg-blue-700 shadow-sm' 
                      : contest.status === 'Upcoming'
                      ? 'bg-white border-gray-300 text-gray-700 group-hover:border-gray-400 group-hover:bg-gray-50'
                      : 'bg-white border-gray-300 text-gray-700 group-hover:border-gray-400 group-hover:bg-gray-50'
                  }`}
                >
                  {contest.status === 'Live' ? 'Start Test' : contest.status === 'Upcoming' ? 'View Details' : 'View Results'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center py-5 bg-white border-t border-gray-100 gap-2">
           <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
              <ChevronLeft className="w-4 h-4" />
           </button>
           <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white text-[13px] font-bold shadow-sm">
              1
           </button>
           <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-[13px] font-bold">
              2
           </button>
           <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-[13px] font-bold">
              3
           </button>
           <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-[13px] font-bold">
              4
           </button>
           <span className="text-gray-400 px-1 text-sm font-bold">...</span>
           <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-[13px] font-bold">
              87
           </button>
           <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
              <ChevronRight className="w-4 h-4" />
           </button>
        </div>

      </div>
    </div>
  );
}
