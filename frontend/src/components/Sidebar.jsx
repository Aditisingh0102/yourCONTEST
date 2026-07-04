import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Megaphone, 
  BookOpen, 
  Trophy,
  FileBarChart,
  Briefcase,
  X,
  GraduationCap,
  Medal
} from 'lucide-react';

const getStudentLinks = () => {
  const base = window.location.pathname.startsWith('/student1') ? '/student1' : '/student';
  return [
    { name: 'Dashboard', path: `${base}/dashboard`, icon: LayoutDashboard },
    { name: 'Notice Board', path: `${base}/notice`, icon: Megaphone },
    { name: 'Courses', path: `${base}/courses`, icon: BookOpen },
    { name: 'Contests', path: `${base}/contests`, icon: Trophy },
    { name: 'Reports', path: `${base}/reports`, icon: FileBarChart },
  ];
};

const facultyLinks = [
  { name: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
  { name: 'Notice Board', path: '/faculty/notice', icon: Megaphone },
  { name: 'Course Hub', path: '/faculty/course-hub', icon: BookOpen },
  { name: 'Contest Manager', path: '/faculty/manage-contests', icon: Trophy },
  { name: 'Leaderboard', path: '/faculty/leaderboard', icon: Medal },
  { name: 'Analytics', path: '/faculty/results', icon: FileBarChart },
  { name: 'My Batches', path: '/faculty/batches', icon: Briefcase },
  { name: 'Student Records', path: '/faculty/students', icon: GraduationCap },
];

import { faculty } from '../data/mockData';

export default function Sidebar({ role, isCollapsed, isMobileOpen, setIsMobileOpen }) {
  const navigate = useNavigate();
  const links = role === 'student' ? getStudentLinks() : facultyLinks;

  const [profileData, setProfileData] = useState(() => {
    const saved = sessionStorage.getItem(role === 'student' ? 'student_profile' : 'faculty_profile');
    if (saved) return JSON.parse(saved);
    
    return role === 'student' ? {
      name: 'Aditi Singh',
      rollNo: '2023CSE1042',
      regNo: 'UU23104209',
      branch: 'B.Tech CSE',
      semester: '8th Semester',
      email: 'aditi@uudoon.in',
      phone: '+91 98765 43210',
      avatar: 'https://ui-avatars.com/api/?name=Aditi+Singh&background=0D8ABC&color=fff&size=128',
      role: 'student',
      joinDate: 'August 2023'
    } : {
      name: faculty.name,
      facultyId: faculty.erpId,
      department: faculty.college,
      designation: faculty.role,
      email: faculty.email,
      phone: faculty.phone,
      avatar: faculty.avatar,
      role: 'faculty',
      joinDate: 'August 2018'
    };
  });

  useEffect(() => {
    const handleUpdate = () => {
      const saved = sessionStorage.getItem(role === 'student' ? 'student_profile' : 'faculty_profile');
      if (saved) setProfileData(JSON.parse(saved));
    };
    window.addEventListener('profile-updated', handleUpdate);
    return () => window.removeEventListener('profile-updated', handleUpdate);
  }, [role]);

  return (
    <>
      {/* Mobile Sidebar Overlay Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
        />
      )}

      {/* Sidebar Container */}
      <div 
        className={`bg-white dark:bg-[#0f172a] sidebar-container border-r border-gray-200 dark:border-gray-700 flex flex-col py-4 fixed lg:static inset-y-0 left-0 h-full z-50 transition-[width,padding,transform,box-shadow,background-color] duration-300 ease-in-out group overflow-hidden ${
          isMobileOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full lg:translate-x-0 w-[80px] lg:hover:w-[280px] lg:hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]'
        }`}
      >
        {/* Header Section */}
        <div className="flex items-center h-[44px] mb-6 whitespace-nowrap overflow-hidden">
          <div className="shrink-0 flex justify-center w-[80px]">
            <div className="bg-blue-600 dark:bg-gradient-to-br dark:from-gray-700 dark:to-black text-white p-1.5 rounded-[12px] shadow-sm flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[16px] font-bold text-gray-900 dark:text-gray-100 opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 ease-in-out delay-75">
            University Platform
          </span>
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="ml-auto mr-4 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 transition-colors lg:hidden opacity-100"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1 mt-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center rounded-[16px] transition-all duration-200 relative overflow-hidden ${
                    isActive 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium shadow-sm border border-blue-100 dark:border-blue-800' 
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 border border-transparent'
                  } pl-[16px] py-[12px]`
                }
              >
                <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={2.2} />
                <span className="text-[14px] ml-[14px] whitespace-nowrap opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 ease-in-out delay-75 pointer-events-none lg:group-hover:pointer-events-auto">
                  {link.name}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Account Sections Block (Profile) */}
        <div className="p-3 mt-auto shrink-0 w-full overflow-hidden">
          <div 
            onClick={() => {
              const base = window.location.pathname.startsWith('/student1') ? '/student1' : '/student';
              navigate(role === 'student' ? `${base}/profile` : '/faculty/profile');
              if (setIsMobileOpen) setIsMobileOpen(false);
            }}
            className="flex items-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-[20px] hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-200 dark:hover:border-blue-500/40 cursor-pointer transition-all duration-300 p-1.5 whitespace-nowrap overflow-hidden"
          >
             <div className="relative shrink-0 flex items-center justify-center w-[36px] h-[36px] ml-0.5">
               {profileData?.role === 'faculty' ? (
                 <img 
                   src={profileData.avatar} 
                   alt="Avatar" 
                   className="w-[36px] h-[36px] rounded-full border border-gray-200 dark:border-gray-600 object-cover bg-white dark:bg-slate-800"
                   onError={(e) => { e.target.onerror = null; e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${profileData.name}&backgroundColor=0D8ABC&textColor=fff`; }}
                 />
               ) : (
                 <div className="w-[36px] h-[36px] rounded-full bg-blue-600 dark:bg-blue-700 text-white flex items-center justify-center font-bold text-[14px] border border-blue-700 shadow-sm">
                   {profileData?.name ? profileData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                 </div>
               )}
               <div className="absolute -bottom-0.5 -right-0.5 w-[12px] h-[12px] bg-green-500 border-[2.5px] border-white rounded-full"></div>
             </div>
             
             <div className="flex-1 min-w-0 text-left ml-[14px] opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 ease-in-out delay-100">
               <h4 className="text-[13px] font-bold text-gray-900 dark:text-gray-100 truncate leading-tight">{profileData.name}</h4>
               <div className="flex items-center gap-1.5 mt-0.5">
                 <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 truncate">
                   {role === 'student' ? profileData.rollNo : profileData.facultyId}
                 </span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </>
  );
}
