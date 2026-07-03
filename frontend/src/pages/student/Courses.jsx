import React, { useState, useEffect } from 'react';
import { BookOpen, Video, Clock, CheckCircle, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const allCourses = [
  {
    id: 1,
    title: 'Full-Stack Web Development',
    professor: 'Dr. Sarah Jenkins',
    progress: 0,
    totalModules: 12,
    completedModules: 0,
    color: 'bg-blue-500',
    iconColor: 'text-blue-500',
    bgLight: 'bg-blue-50',
    tags: ['React', 'Node.js', 'MongoDB']
  },
  {
    id: 2,
    title: 'Data Structures in Java',
    professor: 'Prof. Alan Turing',
    progress: 0,
    totalModules: 10,
    completedModules: 0,
    color: 'bg-indigo-500',
    iconColor: 'text-indigo-500',
    bgLight: 'bg-indigo-50',
    tags: ['Java', 'Algorithms', 'DSA']
  },
  {
    id: 3,
    title: 'Machine Learning Basics',
    professor: 'Dr. Andrew Ng',
    progress: 0,
    totalModules: 8,
    completedModules: 8,
    color: 'bg-green-500',
    iconColor: 'text-green-500',
    bgLight: 'bg-green-50',
    tags: ['Python', 'AI', 'TensorFlow'],
    status: 'Draft'
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
    progress: 0,
    totalModules: 10,
    completedModules: 0,
    color: 'bg-teal-500',
    iconColor: 'text-teal-500',
    bgLight: 'bg-teal-50',
    tags: ['C', 'Linux', 'OS']
  },
  {
    id: 7,
    title: 'Cybersecurity Fundamentals',
    professor: 'Prof. Kevin Mitnick',
    progress: 0,
    totalModules: 15,
    completedModules: 0,
    color: 'bg-rose-500',
    iconColor: 'text-rose-500',
    bgLight: 'bg-rose-50',
    tags: ['Security', 'Network', 'Ethics']
  },
  {
    id: 8,
    title: 'Advanced System Design',
    professor: 'Mr. Alex Xu',
    progress: 0,
    totalModules: 15,
    completedModules: 0,
    color: 'bg-emerald-500',
    iconColor: 'text-emerald-500',
    bgLight: 'bg-emerald-50',
    tags: ['Architecture', 'Scaling', 'Backend']
  },
  {
    id: 9,
    title: 'Go Programming Masterclass',
    professor: 'Mr. Rob Pike',
    progress: 0,
    totalModules: 12,
    completedModules: 0,
    color: 'bg-cyan-500',
    iconColor: 'text-cyan-500',
    bgLight: 'bg-cyan-50',
    tags: ['Go', 'Concurrency', 'Backend']
  },
  {
    id: 10,
    title: 'Kubernetes for DevOps',
    professor: 'Mr. Kelsey Hightower',
    progress: 0,
    totalModules: 10,
    completedModules: 0,
    color: 'bg-sky-500',
    iconColor: 'text-sky-500',
    bgLight: 'bg-sky-50',
    tags: ['K8s', 'Docker', 'DevOps']
  }
];

export default function Courses() {
  const navigate = useNavigate();
  
  const [studentProfile] = useState(() => {
    const saved = sessionStorage.getItem('student_profile');
    if (saved) return JSON.parse(saved);
    // Fallback to a default name if not found
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      try {
         const u = JSON.parse(userStr);
         if (u.name) return { name: u.name, batch: 'Alpha 1', branch: 'B.Tech CSE' };
      } catch(e) {}
    }
    return { name: 'Aditi Singh', batch: 'Alpha 1', branch: 'B.Tech CSE' };
  });

  const getStorageKey = () => `v2_student_enrolled_courses_${studentProfile.name.replace(/\s+/g, '_')}`;

  const [enrolledCourses, setEnrolledCourses] = useState(() => {
    const saved = localStorage.getItem(getStorageKey());
    if (saved) return JSON.parse(saved);
    return []; 
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(enrolledCourses.length > 0 ? 'ongoing' : 'new');
  const [updateTrigger, setUpdateTrigger] = useState(0);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key && e.key.startsWith('course_') && e.key.endsWith('_details')) {
        setUpdateTrigger(prev => prev + 1);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleEnroll = (courseId) => {
    const updated = [...enrolledCourses, courseId];
    setEnrolledCourses(updated);
    localStorage.setItem(getStorageKey(), JSON.stringify(updated));
    setActiveTab('ongoing');
  };

  const filteredCourses = allCourses.filter(course => {
    // Check localStorage for dynamic status changes made by faculty across tabs
    const savedDetails = localStorage.getItem(`course_${course.id}_details`);
    let currentStatus = course.status || 'Published';
    if (savedDetails) {
      try {
        const parsed = JSON.parse(savedDetails);
        if (parsed.status) currentStatus = parsed.status;
      } catch (e) {}
    }

    // Hide draft courses
    if (currentStatus !== 'Published') {
      return false;
    }

    // Hide Cybersecurity Fundamentals from Ambar
    if (course.id === 7 && studentProfile.name.toLowerCase().includes('ambar')) {
      return false;
    }

    // Hide Rahul's custom courses from other students
    if ([8, 9, 10].includes(course.id) && !studentProfile.name.toLowerCase().includes('rahul')) {
      return false;
    }

    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.professor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const isEnrolled = enrolledCourses.includes(course.id);

    if (activeTab === 'ongoing') return matchesSearch && isEnrolled && course.progress < 100;
    if (activeTab === 'completed') return matchesSearch && isEnrolled && course.progress === 100;
    if (activeTab === 'new') return matchesSearch && !isEnrolled;
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Courses</h1>
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
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'ongoing' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          Ongoing
        </button>
        <button
          onClick={() => setActiveTab('new')}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'new' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          New Courses
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'completed' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
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
                  <span className="bg-green-100 text-green-700 text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-green-200">
                    <CheckCircle className="w-3.5 h-3.5" /> Completed
                  </span>
                )}
              </div>
              <div className="flex gap-2 mt-auto pt-4">
                {course.tags.map((tag, i) => (
                  <span key={i} className="text-[10px] font-semibold text-gray-700 bg-white/70 px-2 py-0.5 rounded-md backdrop-blur-md border border-white/40 shadow-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Course Info */}
            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-[16px] font-semibold text-gray-900 mb-1.5 leading-tight group-hover:text-blue-600 transition-colors">
                {course.title}
              </h3>
              <p className="text-[13px] text-gray-500 mb-5">{course.professor}</p>

              {/* Progress */}
              <div className="mb-5 mt-auto">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Progress</span>
                  <span className="text-[12px] font-semibold text-gray-700">{course.progress}%</span>
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
                {activeTab === 'new' ? (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleEnroll(course.id); }}
                    className="text-[12px] font-semibold px-4 py-1.5 rounded-lg transition-colors text-orange-600 bg-orange-50 hover:bg-orange-100">
                    Enroll Now
                  </button>
                ) : (
                  <button className={`text-[12px] font-semibold px-4 py-1.5 rounded-lg transition-colors ${course.progress === 100
                      ? 'text-green-600 bg-green-50 group-hover:bg-green-100'
                      : course.progress > 0
                        ? 'text-blue-600 bg-blue-50 group-hover:bg-blue-100'
                        : 'text-purple-600 bg-purple-50 group-hover:bg-purple-100'
                    }`}>
                    {course.progress === 100 ? 'Review' : course.progress > 0 ? 'Continue' : 'Start'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
