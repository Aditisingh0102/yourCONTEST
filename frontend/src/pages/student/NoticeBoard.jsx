import React, { useState, useEffect } from 'react';
import { FileText, AlertCircle, Calendar, Briefcase, Info, BookOpen } from 'lucide-react';
import { getNotices } from '../../api';
import { socket } from '../../socket';

const iconMap = {
  Info, AlertCircle, FileText, Briefcase, BookOpen
};

export default function NoticeBoard() {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    fetchNotices();

    socket.on('NOTICE_UPDATED', (data) => {
      if (data.type === 'CREATE') setNotices(prev => [data.notice, ...prev]);
      else if (data.type === 'UPDATE') setNotices(prev => prev.map(n => n._id === data.notice._id ? data.notice : n));
      else if (data.type === 'DELETE') setNotices(prev => prev.filter(n => n._id !== data.id));
    });

    return () => socket.off('NOTICE_UPDATED');
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await getNotices();
      setNotices(res.data);
    } catch (error) {
      console.error("Failed to fetch notices", error);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notice Board</h1>
          <p className="text-sm text-gray-500 mt-1">Updates and announcements from your mentors and university</p>
        </div>
      </div>

      <div className="space-y-4">
        {notices.length === 0 ? (
          <div className="bg-gray-50 border border-gray-100 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center mt-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <MegaphoneIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Recent Notices</h3>
            <p className="text-sm text-gray-500 max-w-sm">You're all caught up! There are no new announcements from your mentors or university at this moment.</p>
          </div>
        ) : (
          notices.map((notice) => {
            const IconComponent = iconMap[notice.iconName] || Info;
            return (
              <div key={notice._id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex gap-5 flex-col sm:flex-row">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${notice.bg} ${notice.color} border ${notice.borderColor}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-2 gap-2">
                      <h3 className="text-[16px] font-bold text-gray-900 leading-tight">{notice.title}</h3>
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase border w-max ${notice.bg} ${notice.color} ${notice.borderColor}`}>
                        {notice.type}
                      </span>
                    </div>
                    
                    <p className="text-[14px] text-gray-600 mb-4 leading-relaxed">
                      {notice.content}
                    </p>
                    
                    <div className="flex items-center gap-4 text-[12px] font-bold text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-600 uppercase">
                          {notice.author.charAt(0)}
                        </span>
                        <span className="text-gray-600">{notice.author}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {notice.date}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function MegaphoneIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
    </svg>
  );
}
