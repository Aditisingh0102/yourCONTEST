import React, { useState, useEffect } from 'react';
import { FileText, AlertCircle, Calendar, Briefcase, Info, BookOpen, Plus, X, Edit3, Trash2, MegaphoneIcon as MegaphoneIconSvg } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getNotices, deleteNotice } from '../../api';
import { socket } from '../../socket';

const iconMap = {
  Info, AlertCircle, FileText, Briefcase, BookOpen
};

export default function FacultyNoticeBoard() {
  const navigate = useNavigate();
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

  const handleEdit = (notice) => {
    navigate(`/faculty/edit-notice/${notice._id || notice.id}`);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteNotice(id);
    } catch (error) {
      console.error("Failed to delete notice", error);
    }
  };

  const openNewModal = () => {
    navigate('/faculty/create-notice');
  };

  return (
    <div className="max-w-[1000px] mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Manage Notices</h1>
          <p className="text-sm text-gray-500 mt-1">Publish announcements and view existing notices</p>
        </div>
        <button 
          onClick={openNewModal}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:from-blue-500 hover:to-indigo-500 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
        >
          <Plus className="w-5 h-5" /> Create Notice
        </button>
      </div>

      <div className="space-y-4">
        {notices.length === 0 ? (
          <div className="bg-gray-50 border border-gray-100 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center mt-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <MegaphoneIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No Notices Published</h3>
            <p className="text-sm text-gray-500 max-w-sm">You haven't published any announcements yet. Click 'Create Notice' to broadcast a message to students.</p>
          </div>
        ) : (
          notices.map((notice) => {
            const IconComponent = iconMap[notice.iconName] || Info;
            return (
              <div key={notice._id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group relative">
                <button 
                  onClick={(e) => handleDelete(notice._id, e)}
                  className="absolute top-4 right-4 p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete Notice"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex gap-5 flex-col sm:flex-row">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${notice.bg} ${notice.color} border ${notice.borderColor} group-hover:scale-105 transition-transform`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-2 gap-2 pr-8">
                      <h3 className="text-[16px] font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">{notice.title}</h3>
                      <div className="flex gap-2 flex-wrap">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-semibold tracking-wider uppercase border w-max ${notice.bg} ${notice.color} ${notice.borderColor}`}>
                          {notice.type}
                        </span>
                        {notice.batch && notice.batch.length > 0 && !notice.batch.includes('All') && (
                          <span className="px-2.5 py-1 rounded text-[10px] font-semibold tracking-wider uppercase border w-max bg-gray-50 text-gray-600 border-gray-200">
                            {Array.isArray(notice.batch) ? notice.batch.join(', ') : notice.batch}
                          </span>
                        )}
                        {(!notice.batch || notice.batch.includes('All')) && (
                          <span className="px-2.5 py-1 rounded text-[10px] font-semibold tracking-wider uppercase border w-max bg-gray-50 text-gray-600 border-gray-200">
                            All Batches
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-[14px] text-gray-600 mb-4 leading-relaxed">
                      {notice.content}
                    </p>
                    
                    <div className="flex items-center gap-4 text-[12px] font-semibold text-gray-400 border-t border-gray-50 pt-3 mt-4">
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
                      
                      {/* Action Buttons */}
                      <div className="ml-auto flex items-center gap-2">
                        <button 
                          onClick={() => handleEdit(notice)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit Notice"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(notice._id, e)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Notice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
