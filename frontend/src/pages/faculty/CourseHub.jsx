import React, { useState } from 'react';
import { BookOpen, Video, FileText, Plus, Edit3, Trash2, Users, BarChart2, Search, Filter, X, Image as ImageIcon, UploadCloud } from 'lucide-react';

const initialCourses = [
  {
    id: 1,
    title: 'Full-Stack Web Development',
    subject: 'Computer Science',
    students: 450,
    modules: 12,
    status: 'Published',
    rating: 4.8,
    thumbnail: 'bg-gradient-to-br from-blue-500 to-blue-600',
    icon: BookOpen
  },
  {
    id: 2,
    title: 'Advanced DSA & Algorithms',
    subject: 'Computer Science',
    students: 820,
    modules: 15,
    status: 'Published',
    rating: 4.9,
    thumbnail: 'bg-gradient-to-br from-purple-500 to-purple-600',
    icon: BookOpen
  },
  {
    id: 3,
    title: 'Machine Learning Basics',
    subject: 'Artificial Intelligence',
    students: 120,
    modules: 8,
    status: 'Draft',
    rating: 0,
    thumbnail: 'bg-gradient-to-br from-green-500 to-green-600',
    icon: BookOpen
  }
];

export default function CourseHub() {
  const [courses, setCourses] = useState(initialCourses);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', subject: '', modules: '', status: 'Draft' });

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    course.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = (e) => {
    e.preventDefault();
    if(!formData.title) return;

    const newCourse = {
      id: Date.now(),
      title: formData.title,
      subject: formData.subject || 'General',
      students: 0,
      modules: parseInt(formData.modules) || 0,
      status: formData.status,
      rating: 0,
      thumbnail: 'bg-gradient-to-br from-orange-500 to-red-500', // random default
      icon: BookOpen
    };

    setCourses([newCourse, ...courses]);
    setShowModal(false);
    setFormData({ title: '', subject: '', modules: '', status: 'Draft' });
  };

  const handleDelete = (id) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  return (
    <div className="max-w-[1200px] mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Hub</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your courses, lectures, and study materials</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[14px] font-bold hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap w-max"
        >
          <Plus className="w-4 h-4" /> Create New Course
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Courses', value: courses.length, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Active Students', value: '1.2k', icon: Users, color: 'text-green-500', bg: 'bg-green-50' },
          { label: 'Total Modules', value: courses.reduce((acc, curr) => acc + curr.modules, 0), icon: Video, color: 'text-purple-500', bg: 'bg-purple-50' },
          { label: 'Pending Reviews', value: 24, icon: FileText, color: 'text-orange-500', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
            <div className={`p-3 rounded-xl border border-gray-100 ${stat.color} ${stat.bg}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search courses..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 font-bold text-sm w-full sm:w-auto justify-center">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div key={course.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all group flex flex-col">
            <div className={`h-32 ${course.thumbnail} p-5 relative`}>
              <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-bold text-white uppercase tracking-wider border border-white/20">
                {course.status}
              </div>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/20 mt-4 shadow-sm">
                <course.icon className="w-6 h-6" />
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="mb-4">
                <h3 className="text-[16px] font-bold text-gray-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors">{course.title}</h3>
                <p className="text-[13px] text-gray-500">{course.subject}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Students</p>
                    <p className="text-[13px] font-bold text-gray-800">{course.students}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Modules</p>
                    <p className="text-[13px] font-bold text-gray-800">{course.modules}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-auto pt-4 border-t border-gray-50 flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-lg text-[12px] font-bold transition-colors">
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-50 hover:bg-green-50 text-gray-700 hover:text-green-600 rounded-lg text-[12px] font-bold transition-colors">
                  <BarChart2 className="w-3.5 h-3.5" /> Analytics
                </button>
                <button 
                  onClick={() => handleDelete(course.id)}
                  className="px-3 py-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                  title="Delete Course"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredCourses.length === 0 && (
          <div className="col-span-full bg-gray-50 border border-gray-100 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Courses Found</h3>
            <p className="text-sm text-gray-500">You haven't created any courses yet or none match your search.</p>
          </div>
        )}
      </div>

      {/* Create Course Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
             <div className="flex justify-between items-center p-5 border-b border-gray-100">
               <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                 <BookOpen className="w-5 h-5 text-blue-600" /> Create New Course
               </h2>
               <button onClick={() => setShowModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <form onSubmit={handleCreate} className="p-6 space-y-5">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Course Title</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="E.g. React Native Masterclass"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Subject Category</label>
                    <input 
                      type="text" 
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      placeholder="E.g. Mobile Dev"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Total Modules/Units</label>
                    <input 
                      type="number" 
                      value={formData.modules}
                      onChange={(e) => setFormData({...formData, modules: e.target.value})}
                      placeholder="E.g. 10"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Initial Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
                  >
                    <option value="Draft">Draft (Hidden from students)</option>
                    <option value="Published">Published (Visible to students)</option>
                  </select>
                </div>

                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                   <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                   <p className="text-[13px] font-bold text-gray-700">Upload Course Thumbnail</p>
                   <p className="text-[11px] text-gray-500 mt-1">PNG, JPG up to 5MB</p>
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
                    Create Course
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
