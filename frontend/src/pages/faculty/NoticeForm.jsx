import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, ChevronDown, Check } from 'lucide-react';
import { getNotices, createNotice, updateNotice } from '../../api';

export default function NoticeForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({ title: '', content: '', type: 'Important', batch: ['All'] });
  const [saving, setSaving] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const batchDropdownRef = useRef(null);

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
    if (id) {
      getNotices().then(res => {
        const notice = res.data.find(n => (n._id || n.id).toString() === id);
        if (notice) {
          setFormData({
            title: notice.title || '',
            content: notice.content || '',
            type: notice.type || 'Important',
            batch: Array.isArray(notice.batch) ? notice.batch : (notice.batch ? [notice.batch] : ['All'])
          });
        }
      });
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;
    setSaving(true);

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
      title: formData.title.trim(),
      content: formData.content.trim(),
      type: formData.type,
      batch: formData.batch,
      author: 'Arun Kudiyal',
      iconName,
      color,
      bg,
      borderColor
    };

    try {
      if (id) {
        await updateNotice(id, payload);
      } else {
        await createNotice(payload);
      }
      navigate('/faculty/notice');
    } catch (error) {
      console.error("Failed to save notice", error);
      alert('Error saving notice');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[800px] mx-auto py-6">
      {/* Page Header */}
      <div className="flex items-center gap-4 border-b border-gray-100 pb-6 mb-6">
        <button onClick={() => navigate('/faculty/notice')}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-blue-600">
              <path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
            </svg>
            {id ? 'Edit Notice' : 'Publish New Notice'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {id
              ? 'Update the details of this announcement.'
              : 'Create a new announcement for students.'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-6">
            
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Notice Title</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="E.g. Mid-Term Syllabus updated"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div ref={batchDropdownRef} className="relative z-20">
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Target Batch</label>
                <div 
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer flex justify-between items-center text-sm font-medium focus:outline-none focus:border-blue-500 transition-all"
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
                        <span className={formData.batch.includes(b) ? 'font-semibold text-blue-600' : 'font-medium text-gray-700'}>
                          {b === 'All' ? 'All Batches' : b}
                        </span>
                        {formData.batch.includes(b) && <Check className="w-4 h-4 text-blue-600" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Notice Type</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
                >
                  <option value="Important">Important / Alert</option>
                  <option value="Result">Result Declaration</option>
                  <option value="Course">Course Update</option>
                  <option value="Placement">Placement / Internship</option>
                  <option value="Info">General Info</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Notice Content</label>
              <textarea 
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                placeholder="Write your announcement here..."
                rows="6"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium resize-none"
                required
              ></textarea>
            </div>

          </div>

          {/* Footer actions */}
          <div className="pt-8 mt-8 flex gap-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/faculty/notice')}
              className="px-8 py-3 bg-gray-100 text-gray-700 font-semibold text-[15px] rounded-xl hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-[15px] rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:from-blue-500 hover:to-indigo-500 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : (id ? 'Update Notice' : 'Publish Notice')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
