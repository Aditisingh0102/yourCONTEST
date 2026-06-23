import React, { useState } from 'react';
import { BookOpen, Video, Clock, CheckCircle, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const allCourses = [
  {
    id: 1,
    title: 'Full-Stack Web Development',
    professor: 'Dr. Sarah Jenkins',
    progress: 65,
    totalModules: 12,
    completedModules: 8,
    color: 'bg-blue-500',
    iconColor: 'text-blue-500',
    bgLight: 'bg-blue-50',
    tags: ['React', 'Node.js', 'MongoDB']
  },
  {
    id: 2,
    title: 'Data Structures in Java',
    professor: 'Prof. Alan Turing',
    progress: 30,
    totalModules: 10,
    completedModules: 3,
    color: 'bg-indigo-500',
    iconColor: 'text-indigo-500',
    bgLight: 'bg-indigo-50',
    tags: ['Java', 'Algorithms', 'DSA']
  },
  {
    id: 3,
    title: 'Machine Learning Basics',
    professor: 'Dr. Andrew Ng',
    progress: 100,
    totalModules: 8,
    completedModules: 8,
    color: 'bg-green-500',
    iconColor: 'text-green-500',
    bgLight: 'bg-green-50',
    tags: ['Python', 'AI', 'TensorFlow']
  },
  {
    id: 4,
    title: 'Cloud Computing with AWS',
    professor: 'Ms. Emily Chen',
    progress: 10,
    totalModules: 6,
    completedModules: 0,
    color: 'bg-orange-500',
    iconColor: 'text-orange-500',
    bgLight: 'bg-orange-50',
    tags: ['AWS', 'DevOps', 'Cloud']
  },
  {
    id: 5,
    title: 'Advanced Database Systems',
    professor: 'Dr. Robert Smith',
    progress: 0,
    totalModules: 14,
    completedModules: 0,
    color: 'bg-purple-500',
    iconColor: 'text-purple-500',
    bgLight: 'bg-purple-50',
    tags: ['SQL', 'Postgres', 'Redis']
  },
  {
    id: 6,
    title: 'Operating Systems Core',
    professor: 'Dr. Linus Torvalds',
    progress: 100,
    totalModules: 10,
    completedModules: 10,
    color: 'bg-teal-500',
    iconColor: 'text-teal-500',
    bgLight: 'bg-teal-50',
    tags: ['C', 'Linux', 'OS']
  }
];

export default function Courses() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ongoing'); // 'ongoing' or 'completed'

  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.professor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeTab === 'ongoing') return matchesSearch && course.progress < 100;
    if (activeTab === 'completed') return matchesSearch && course.progress === 100;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
          <p className="text-sm text-gray-500 mt-1">Access lectures, documentation, and related tests</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-80 shrink-0">
          <input 
            type="text" 
            placeholder="Search courses, subjects, mentors..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium shadow-sm"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100/80 p-1 rounded-xl w-max">
        <button 
          onClick={() => setActiveTab('ongoing')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'ongoing' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Ongoing & New
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'completed' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Completed
        </button>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {filteredCourses.length === 0 && (
          <div className="col-span-full py-16 text-center bg-gray-50/50 rounded-2xl border border-gray-100 border-dashed">
             <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
             <p className="text-gray-500 font-medium text-[15px]">No courses found matching your search.</p>
          </div>
        )}
        
        {filteredCourses.map(course => (
          <div 
            key={course.id} 
            onClick={() => navigate(`/student/courses/${course.id}`)}
            className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] overflow-hidden hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full"
          >
            {/* Header/Cover Image */}
            <div className={`h-32 ${course.bgLight} relative p-6 flex flex-col justify-between shrink-0`}>
               <div className="flex justify-between items-start">
                  <div className={`p-2.5 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform ${course.iconColor}`}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  {course.progress === 100 && (
                    <span className="bg-green-100 text-green-700 text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-green-200">
                      <CheckCircle className="w-3.5 h-3.5" /> Completed
                    </span>
                  )}
               </div>
               <div className="flex gap-2 mt-auto pt-4">
                 {course.tags.map((tag, i) => (
                   <span key={i} className="text-[10px] font-bold text-gray-700 bg-white/70 px-2 py-0.5 rounded-md backdrop-blur-md border border-white/40 shadow-sm">
                     {tag}
                   </span>
                 ))}
               </div>
            </div>

            {/* Course Info */}
            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-[16px] font-bold text-gray-900 mb-1.5 leading-tight group-hover:text-blue-600 transition-colors">
                {course.title}
              </h3>
              <p className="text-[13px] text-gray-500 mb-5">{course.professor}</p>

              {/* Progress */}
              <div className="mb-5 mt-auto">
                 <div className="flex justify-between items-end mb-2">
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Progress</span>
                   <span className="text-[12px] font-bold text-gray-700">{course.progress}%</span>
                 </div>
                 <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                   <div className={`h-full ${course.color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${course.progress}%` }}></div>
                 </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                <div className="flex items-center gap-4 text-[12px] text-gray-500 font-medium">
                   <div className="flex items-center gap-1.5">
                     <Video className="w-4 h-4 text-gray-400" />
                     {course.completedModules}/{course.totalModules}
                   </div>
                   <div className="flex items-center gap-1.5">
                     <Clock className="w-4 h-4 text-gray-400" />
                     {course.totalModules * 2}h
                   </div>
                </div>
                <button className={`text-[12px] font-bold px-4 py-1.5 rounded-lg transition-colors ${
                  course.progress === 100 
                    ? 'text-green-600 bg-green-50 group-hover:bg-green-100' 
                    : course.progress > 0 
                      ? 'text-blue-600 bg-blue-50 group-hover:bg-blue-100'
                      : 'text-purple-600 bg-purple-50 group-hover:bg-purple-100'
                }`}>
                  {course.progress === 100 ? 'Review' : course.progress > 0 ? 'Continue' : 'Start'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
