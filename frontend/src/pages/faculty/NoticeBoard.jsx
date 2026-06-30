import React, { useState, useEffect } from 'react';
import { FileText, AlertCircle, Calendar, Briefcase, Info, BookOpen, Plus, X, Edit3, Trash2, ChevronDown, Check } from 'lucide-react';
import { getNotices, createNotice, updateNotice, deleteNotice } from '../../api';
import { socket } from '../../socket';

const iconMap = {
  Info, AlertCircle, FileText, Briefcase, BookOpen
};

export default function FacultyNoticeBoard() {
  const [notices, setNotices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', type: 'Important', batch: ['All'] });
  
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const batchDropdownRef = React.useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (batchDropdownRef.current && !batchDropdownRef.current.contains(event.target)) {
        setIsBatchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    let iconName = 'Info';
    let color = 'text-gray-600';
    let bg = 'bg-gray-100';
    let borderColor = 'border-gray-200';

    switch(formData.type) {
      case 'Important': iconName = 'AlertCircle'; color = 'text-red-600'; bg = 'bg-red-50'; borderColor = 'border-red-100'; break;
      case 'Result': iconName = 'FileText'; color = 'text-blue-600'; bg = 'bg-blue-50'; borderColor = 'border-blue-100'; break;
      case 'Placement': iconName = 'Briefcase'; color = 'text-purple-600'; bg = 'bg-purple-50'; borderColor = 'border-purple-100'; break;
      case 'Course': iconName = 'BookOpen'; color = 'text-green-600'; bg = 'bg-green-50'; borderColor = 'border-green-100'; break;
      default: break;
    }

    const payload = {
      title: formData.title,
      content: formData.content,
      type: formData.type, // backend schema priority but we can store as type or adjust model
      batch: formData.batch,
      author: 'Arun Kudiyal',
      iconName, color, bg, borderColor
    };

    try {
      if (editingId) {
        await updateNotice(editingId, payload);
      } else {
        await createNotice(payload);
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ title: '', content: '', type: 'Important' });
    } catch (error) {
      console.error("Failed to save notice", error);
    }
  };

  const handleEdit = (notice) => {
    setFormData({ title: notice.title, content: notice.content, type: notice.type || 'Important', batch: Array.isArray(notice.batch) ? notice.batch : (notice.batch ? [notice.batch] : ['All']) });
    setEditingId(notice._id);
    setShowModal(true);
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
    setEditingId(null);
    setFormData({ title: '', content: '', type: 'Important', batch: ['All'] });
    setShowModal(true);
  };

  return (
    <div className="max-w-[1000px] mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Notices</h1>
          <p className="text-sm text-gray-500 mt-1">Publish announcements and view existing notices</p>
        </div>
        <button 
          onClick={openNewModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-200"
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
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Notices Published</h3>
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
                      <h3 className="text-[16px] font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">{notice.title}</h3>
                      <div className="flex gap-2 flex-wrap">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase border w-max ${notice.bg} ${notice.color} ${notice.borderColor}`}>
                          {notice.type}
                        </span>
                        {notice.batch && notice.batch.length > 0 && !notice.batch.includes('All') && (
                          <span className="px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase border w-max bg-gray-50 text-gray-600 border-gray-200">
                            {Array.isArray(notice.batch) ? notice.batch.join(', ') : notice.batch}
                          </span>
                        )}
                        {(!notice.batch || notice.batch.includes('All')) && (
                          <span className="px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase border w-max bg-gray-50 text-gray-600 border-gray-200">
                            All Batches
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-[14px] text-gray-600 mb-4 leading-relaxed">
                      {notice.content}
                    </p>
                    
                    <div className="flex items-center gap-4 text-[12px] font-bold text-gray-400 border-t border-gray-50 pt-3 mt-4">
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

      {/* Create Notice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
             <div className="flex justify-between items-center p-5 border-b border-gray-100">
               <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                 <MegaphoneIcon className="w-5 h-5 text-blue-600" /> Publish New Notice
               </h2>
               <button onClick={() => setShowModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <form onSubmit={handleCreate} className="p-6 space-y-5">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Notice Title</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="E.g. Mid-Term Syllabus updated"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
                    required
                  />
                </div>

                <div ref={batchDropdownRef} className="relative z-20">
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Target Batch</label>
                  <div 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer flex justify-between items-center text-sm font-medium focus:outline-none focus:border-blue-500 transition-all"
                    onClick={() => setIsBatchOpen(!isBatchOpen)}
                  >
                    <span className="truncate text-gray-700">
                      {formData.batch.includes('All') ? 'All Batches' : formData.batch.join(', ')}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isBatchOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {isBatchOpen && (
                    <div className="absolute z-30 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 overflow-hidden">
                      {['All', 'Alpha 1', 'Alpha 2', 'Beta 1'].map(b => (
                        <div 
                          key={b} 
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between text-sm transition-colors"
                          onClick={() => {
                            if (b === 'All') {
                              setFormData({ ...formData, batch: ['All'] });
                            } else {
                              let newBatch = formData.batch.filter(x => x !== 'All');
                              if (newBatch.includes(b)) {
                                newBatch = newBatch.filter(x => x !== b);
                              } else {
                                newBatch.push(b);
                              }
                              if (newBatch.length === 0) newBatch = ['All'];
                              setFormData({ ...formData, batch: newBatch });
                            }
                          }}
                        >
                          <span className={formData.batch.includes(b) ? 'font-bold text-blue-600' : 'font-medium text-gray-700'}>
                            {b === 'All' ? 'All Batches' : b}
                          </span>
                          {formData.batch.includes(b) && <Check className="w-4 h-4 text-blue-600" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Notice Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
                  >
                    <option value="Important">Important / Alert</option>
                    <option value="Result">Result Declaration</option>
                    <option value="Course">Course Update</option>
                    <option value="Placement">Placement / Internship</option>
                    <option value="Info">General Info</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Notice Content</label>
                  <textarea 
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="Write your announcement here..."
                    rows="4"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium resize-none"
                    required
                  ></textarea>
                </div>

                <div className="pt-2 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold text-[14px] rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-2.5 bg-blue-600 text-white font-bold text-[14px] rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-200 transition-colors"
                  >
                    Publish Notice
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}
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
