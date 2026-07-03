import { useState, useEffect } from 'react';
import { BookOpen, Video, FileText, Plus, Edit3, Trash2, Users, BarChart2, Search, Filter, X, UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const initialCourses = [
  {
    id: 1,
    title: 'Full-Stack Web Development',
    subject: 'Computer Science',
    students: 450,
    modules: 12,
    status: 'Published',
    rating: 4.8,
    bgLight: 'bg-blue-50',
    iconColor: 'text-blue-500',
    tags: ['React', 'Node.js', 'MongoDB'],
    icon: BookOpen
  },
  {
    id: 2,
    title: 'Data Structures in Java',
    subject: 'Computer Science',
    students: 820,
    modules: 10,
    status: 'Published',
    rating: 4.9,
    bgLight: 'bg-indigo-50',
    iconColor: 'text-indigo-500',
    tags: ['Java', 'Algorithms', 'DSA'],
    icon: BookOpen
  },
  {
    id: 4,
    title: 'Cloud Computing with AWS',
    subject: 'Cloud & DevOps',
    students: 310,
    modules: 6,
    status: 'Published',
    rating: 4.7,
    bgLight: 'bg-orange-50',
    iconColor: 'text-orange-500',
    tags: ['AWS', 'DevOps', 'Cloud'],
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
    bgLight: 'bg-green-50',
    iconColor: 'text-green-500',
    tags: ['Python', 'AI', 'TensorFlow'],
    icon: BookOpen
  },
  {
    id: 5,
    title: 'Advanced Database Systems',
    subject: 'Database Management',
    students: 540,
    modules: 14,
    status: 'Published',
    rating: 4.6,
    bgLight: 'bg-purple-50',
    iconColor: 'text-purple-500',
    tags: ['SQL', 'Postgres', 'Redis'],
    icon: BookOpen
  },
  {
    id: 6,
    title: 'Operating Systems Core',
    subject: 'Computer Science',
    students: 630,
    modules: 10,
    status: 'Published',
    rating: 4.9,
    bgLight: 'bg-teal-50',
    iconColor: 'text-teal-500',
    tags: ['C', 'Linux', 'OS'],
    icon: BookOpen
  },
  {
    id: 7,
    title: 'Cybersecurity Fundamentals',
    subject: 'Security',
    students: 210,
    modules: 15,
    status: 'Published',
    rating: 4.8,
    bgLight: 'bg-rose-50',
    iconColor: 'text-rose-500',
    tags: ['Security', 'Network', 'Ethics'],
    icon: BookOpen
  }
];

export default function CourseHub() {
  const [courses, setCourses] = useState(initialCourses);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', subject: '', modules: '', status: 'Draft' });

  useEffect(() => {
    setCourses(prevCourses => prevCourses.map(course => {
      const savedDetails = localStorage.getItem(`course_${course.id}_details`);
      if (savedDetails) {
        try {
          const parsed = JSON.parse(savedDetails);
          if (parsed.status) {
            return { ...course, status: parsed.status };
          }
        } catch (e) {}
      }
      return course;
    }));
  }, []);
  
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedCourseForAnalytics, setSelectedCourseForAnalytics] = useState(null);

  const mockProgressData = [
    { id: 1, name: 'Aditi Singh', rollNo: '2023CSE1042', progress: 100, lastActive: '2 hrs ago' },
    { id: 2, name: 'Ambar Kumar', rollNo: '2023CSE1043', progress: 65, lastActive: '1 day ago' },
    { id: 3, name: 'Rahul Sharma', rollNo: '2023CSE1045', progress: 40, lastActive: '3 days ago' },
    { id: 4, name: 'Sneha Gupta', rollNo: '2023CSE1046', progress: 10, lastActive: '1 week ago' },
  ];

  const navigate = useNavigate();

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
      bgLight: 'bg-orange-50',
      iconColor: 'text-orange-500',
      tags: [formData.subject || 'New'],
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
          <h1 className="text-2xl font-semibold text-gray-900">Course Hub</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your courses, lectures, and study materials</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-[14px] font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:from-blue-500 hover:to-indigo-500 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 whitespace-nowrap w-max"
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
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{stat.label}</p>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
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
        <button className="flex items-center gap-2 px-4 py-2.5 text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 font-semibold text-sm w-full sm:w-auto justify-center">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div 
            key={course.id} 
            onClick={() => navigate(`/faculty/course-hub/${course.id}`)}
            className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] overflow-hidden hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 transition-all group flex flex-col h-full cursor-pointer"
          >
            <div className={`h-32 ${course.bgLight || 'bg-blue-50'} relative p-6 flex flex-col justify-between shrink-0`}>
               <div className="flex justify-between items-start">
                  <div className={`p-2.5 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform ${course.iconColor || 'text-blue-500'}`}>
                    <course.icon className="w-5 h-5" />
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider border shadow-sm ${course.status === 'Published' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                    {course.status}
                  </span>
               </div>
               <div className="flex gap-2 mt-auto pt-4">
                 {(course.tags || []).map((tag, i) => (
                   <span key={i} className="text-[10px] font-semibold text-gray-700 bg-white/70 px-2 py-0.5 rounded-md backdrop-blur-md border border-white/40 shadow-sm">
                     {tag}
                   </span>
                 ))}
               </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="mb-4">
                <h3 className="text-[16px] font-semibold text-gray-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors">{course.title}</h3>
                <p className="text-[13px] text-gray-500">{course.subject}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Students</p>
                    <p className="text-[13px] font-semibold text-gray-800">{course.students}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Modules</p>
                    <p className="text-[13px] font-semibold text-gray-800">{course.modules}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-auto pt-4 border-t border-gray-50 flex gap-2" onClick={e => e.stopPropagation()}>
                <button onClick={() => navigate(`/faculty/course-hub/${course.id}`)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-lg text-[12px] font-semibold transition-colors">
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => { setSelectedCourseForAnalytics(course); setShowAnalyticsModal(true); }} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-50 hover:bg-green-50 text-gray-700 hover:text-green-600 rounded-lg text-[12px] font-semibold transition-colors">
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
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No Courses Found</h3>
            <p className="text-sm text-gray-500">You haven't created any courses yet or none match your search.</p>
          </div>
        )}
      </div>

      {/* Create Course Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
             <div className="flex justify-between items-center p-5 border-b border-gray-100">
               <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                 <BookOpen className="w-5 h-5 text-blue-600" /> Create New Course
               </h2>
               <button onClick={() => setShowModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <form onSubmit={handleCreate} className="p-6 space-y-5">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Course Title</label>
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
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Subject Category</label>
                    <input 
                      type="text" 
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      placeholder="E.g. Mobile Dev"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Total Modules/Units</label>
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
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Initial Status</label>
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
                   <p className="text-[13px] font-semibold text-gray-700">Upload Course Thumbnail</p>
                   <p className="text-[11px] text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                </div>

                <div className="pt-2 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold text-[14px] rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-[14px] rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:from-blue-500 hover:to-indigo-500 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
                  >
                    Create Course
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && selectedCourseForAnalytics && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden">
             <div className="flex justify-between items-center p-5 border-b border-gray-100">
               <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                 <BarChart2 className="w-5 h-5 text-green-600" /> Analytics: {selectedCourseForAnalytics.title}
               </h2>
               <button onClick={() => setShowAnalyticsModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                 <X className="w-5 h-5" />
               </button>
             </div>
             <div className="p-0 max-h-[60vh] overflow-y-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider">
                     <th className="p-4 font-semibold border-b">Student</th>
                     <th className="p-4 font-semibold border-b">Progress</th>
                     <th className="p-4 font-semibold border-b">Last Active</th>
                   </tr>
                 </thead>
                 <tbody>
                   {mockProgressData.map(student => (
                     <tr key={student.id} className="border-b hover:bg-gray-50/50 transition-colors">
                       <td className="p-4">
                         <p className="font-semibold text-sm text-gray-900">{student.name}</p>
                         <p className="text-xs font-medium text-gray-500">{student.rollNo}</p>
                       </td>
                       <td className="p-4">
                         <div className="flex items-center gap-3">
                           <div className="w-full bg-gray-200 rounded-full h-2 max-w-[150px]">
                             <div className={`h-2 rounded-full ${student.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${student.progress}%` }}></div>
                           </div>
                           <span className="text-xs font-semibold text-gray-700">{student.progress}%</span>
                         </div>
                       </td>
                       <td className="p-4">
                         <span className="text-xs font-medium text-gray-500">{student.lastActive}</span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
