import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trophy, Save } from 'lucide-react';
import { getContests, createContest, updateContest } from '../../api';

export default function ContestForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // if present, we are in edit mode
  
  const [formData, setFormData] = useState({ 
    title: '', type: 'Mock Test', startDate: '', startTime: '', duration: '', customRules: '' 
  });
  const [dbContestId, setDbContestId] = useState(null);

  useEffect(() => {
    if (id) {
      getContests().then(res => {
        const contest = res.data.find(c => (c._id || c.id).toString() === id);
        if (contest) {
          setDbContestId(contest._id || contest.id);
          const [datePart, timePart] = contest.startTime ? contest.startTime.split(', ') : ['', ''];
          setFormData({
            title: contest.title || '',
            type: contest.type || 'Mock Test',
            startDate: datePart || '',
            startTime: timePart || '',
            duration: contest.duration ? parseInt(contest.duration) : '',
            customRules: contest.customRules || ''
          });
        }
      });
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let contestIdToRedirect = id;
      
      if (id && dbContestId) {
        // Edit Mode
        await updateContest(dbContestId, {
          title: formData.title,
          type: formData.type,
          startTime: `${formData.startDate}, ${formData.startTime}`,
          duration: `${formData.duration} mins`,
          customRules: formData.customRules || ''
        });
      } else {
        // Create Mode
        const newContest = {
          title: formData.title,
          type: formData.type,
          status: 'Upcoming', 
          startTime: `${formData.startDate}, ${formData.startTime}`,
          endTime: 'TBD', 
          duration: `${formData.duration} mins`,
          registered: 0,
          questions: 0,
          submissions: 0,
          customRules: formData.customRules || '',
          questionList: []
        };
        const res = await createContest(newContest);
        contestIdToRedirect = res.data._id || res.data.id;
      }
      
      // Redirect immediately to questions page
      navigate(`/faculty/manage-contests/${contestIdToRedirect}/questions`);
    } catch(err) {
      console.error(err);
      alert("Error saving contest");
    }
  };

  return (
    <div className="max-w-[800px] mx-auto py-6">
      <div className="flex items-center gap-4 border-b border-gray-100 pb-6 mb-6">
        <button onClick={() => navigate('/faculty/manage-contests')} className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-blue-600" />
            {id ? 'Edit Contest Details' : 'Configure New Contest'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {id ? 'Update the details and rules for this contest.' : 'Set up the basic details and rules before adding questions.'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-8">
            
            {/* Basic Details */}
            <div>
              <h3 className="text-[15px] font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</span> 
                Basic Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pl-8">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Contest Name</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. End Semester Exam: Data Structures"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 transition-all text-sm font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Contest Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 transition-all text-sm font-medium"
                  >
                    <option value="Assessment">Assessment (Mid/End Term)</option>
                    <option value="Mock Test">Mock Test</option>
                    <option value="Coding Challenge">Weekly Coding Challenge</option>
                    <option value="Lab Exam">Lab Exam</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Scheduling */}
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-[15px] font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">2</span> 
                Scheduling
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pl-8">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Start Date</label>
                  <input 
                    type="date" 
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 transition-all text-sm font-medium text-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Start Time</label>
                  <input 
                    type="time" 
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 transition-all text-sm font-medium text-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Duration (Mins)</label>
                  <input 
                    type="number" 
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="e.g. 120"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 transition-all text-sm font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Rules & Proctoring */}
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-[15px] font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">3</span> 
                Rules & Proctoring
              </h3>
              <div className="space-y-5 pl-8">
                <div className="flex gap-4">
                  <label className="flex flex-1 items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" defaultChecked />
                    <span className="text-[14px] font-bold text-gray-800">Strict Fullscreen Mode</span>
                  </label>
                  <label className="flex flex-1 items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" defaultChecked />
                    <span className="text-[14px] font-bold text-gray-800">Disable Copy/Paste</span>
                  </label>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Custom Instructions for Students (Optional)</label>
                  <textarea 
                    rows="3"
                    value={formData.customRules}
                    onChange={(e) => setFormData({...formData, customRules: e.target.value})}
                    placeholder="e.g. You are allowed to use rough paper. Calculators are strictly prohibited."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 transition-all text-sm font-medium resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-8 mt-8 flex gap-4 border-t border-gray-100">
            <button 
              type="button" 
              onClick={() => navigate('/faculty/manage-contests')}
              className="px-8 py-3 bg-gray-100 text-gray-700 font-bold text-[15px] rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 py-3 bg-blue-600 text-white font-bold text-[15px] rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-200 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save & Proceed to Questions 
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
