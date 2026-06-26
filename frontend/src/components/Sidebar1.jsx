import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Megaphone, 
  BookOpen, 
  Code, 
  Trophy, 
  Video, 
  Briefcase, 
  User, 
  FileBarChart,
  LogOut,
  X,
  GraduationCap
} from 'lucide-react';

const studentLinks = [
  { name: 'Dashboard', path: '/student1/dashboard', icon: LayoutDashboard },
  { name: 'Notice Board', path: '/student1/notice', icon: Megaphone },
  { name: 'Courses', path: '/student1/courses', icon: BookOpen },
  { name: 'Contests', path: '/student1/contests', icon: Trophy },
  { name: 'Reports', path: '/student1/reports', icon: FileBarChart },
];

const facultyLinks = [
  { name: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
  { name: 'Notice Board', path: '/faculty/notice', icon: Megaphone },
  { name: 'Course Hub', path: '/faculty/course-hub', icon: BookOpen },
  { name: 'Contest Manager', path: '/faculty/manage-contests', icon: Trophy },
  { name: 'My Batches', path: '/faculty/batches', icon: Briefcase },
  { name: 'Student Records', path: '/faculty/students', icon: GraduationCap },
];

import { faculty } from '../data/mockData';

export default function Sidebar1({ role, isCollapsed, isMobileOpen, setIsMobileOpen }) {
  const navigate = useNavigate();
  const links = role === 'student' ? studentLinks : facultyLinks;
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem(role === 'student' ? 'student1_profile' : 'faculty_profile');
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
      const saved = localStorage.getItem(role === 'student' ? 'student1_profile' : 'faculty_profile');
      if (saved) setProfileData(JSON.parse(saved));
    };
    window.addEventListener('profile1-updated', handleUpdate);
    return () => window.removeEventListener('profile1-updated', handleUpdate);
  }, [role]);

  // Close modal on ESC keypress
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowLogoutConfirm(false);
      }
    };
    if (showLogoutConfirm) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showLogoutConfirm]);

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
        className={`bg-white dark:bg-[#0f172a] border-r border-gray-200 dark:border-gray-700 flex flex-col py-4 shrink-0 sidebar-container fixed inset-y-0 left-0 h-screen lg:h-[calc(100vh-4rem)] lg:static z-50 lg:z-auto transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20 lg:overflow-y-visible' : 'w-64 lg:overflow-y-auto'
        } overflow-y-auto ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header (Only visible on mobile overlay drawer) */}
        <div className="flex items-center justify-between px-6 pb-4 mb-4 border-b border-gray-100 dark:border-gray-700 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 dark:bg-gradient-to-br dark:from-gray-700 dark:to-black text-white p-1.5 rounded-lg logo-icon shadow-sm border border-transparent dark:border-gray-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[15px] font-bold text-gray-800 dark:text-gray-100 leading-tight">University Platform</span>
          </div>
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>



        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600 dark:!bg-none dark:!bg-gradient-to-r dark:!from-zinc-800 dark:!to-zinc-900 dark:!text-white font-semibold shadow-sm border border-transparent dark:!border-zinc-700' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-white'
                  } ${isCollapsed ? 'justify-center px-2' : 'px-4'}`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="text-sm transition-opacity duration-300">{link.name}</span>}
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-16 top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-md z-50">
                    {link.name}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Account Sections Block (Profile + Redesigned Logout Button) */}
        <div className="p-4 mt-auto border-t border-gray-100 dark:border-gray-700 pt-4 space-y-3 shrink-0">
          {/* Profile Card Section */}
          <div 
            onClick={() => {
              navigate(role === 'student' ? '/student1/profile' : '/faculty/profile');
              if (setIsMobileOpen) setIsMobileOpen(false);
            }}
            className={`flex items-center gap-3 p-3 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-800 hover:border-blue-100 dark:hover:border-gray-600 cursor-pointer transition-all duration-200 group relative w-full ${
              isCollapsed ? 'justify-center p-1.5' : ''
            }`}
          >
            {isCollapsed ? (
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-700 text-white flex items-center justify-center font-bold text-[15px] shrink-0 border border-blue-700 shadow-sm">
                  {profileData?.name ? profileData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                
                {/* Tooltip for collapsed Profile Card */}
                <div className="absolute left-16 top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-md z-50">
                  <p className="font-bold">{profileData.name}</p>
                  <p className="text-[10px] text-gray-400 capitalize">{profileData.role}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full bg-blue-600 dark:bg-blue-700 text-white flex items-center justify-center font-bold text-[16px] shrink-0 border border-blue-700 shadow-sm">
                    {profileData?.name ? profileData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate leading-snug">{profileData.name}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      role === 'student' ? 'bg-blue-50 text-blue-600 border border-blue-100 dark:!bg-zinc-800 dark:!text-gray-300 dark:!border-zinc-700' : 'bg-purple-50 text-purple-600 border border-purple-100 dark:!bg-zinc-800 dark:!text-gray-300 dark:!border-zinc-700'
                    }`}>
                      {role}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{role === 'student' ? profileData.rollNo : profileData.facultyId}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Premium Logout Button */}
          {isCollapsed ? (
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="w-10 h-10 mx-auto flex items-center justify-center bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl shadow-md hover:shadow-lg hover:shadow-red-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 relative group outline-none"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5 shrink-0 text-white" />
              
              {/* Tooltip for collapsed state */}
              <div className="absolute left-16 top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-md z-50">
                Logout
              </div>
            </button>
          ) : (
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl shadow-md shadow-red-200/50 hover:shadow-lg hover:shadow-red-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 select-none group font-semibold text-sm outline-none cursor-pointer"
            >
              <LogOut className="w-5 h-5 shrink-0 text-white" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* Modern Dialog Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop with blur & fade in */}
          <div 
            onClick={() => setShowLogoutConfirm(false)}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300 ease-out animate-in fade-in"
          />

          {/* Modal Container */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full p-6 relative z-10 animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Confirm Logout</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Are you sure you want to logout from your account?</p>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 outline-none cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowLogoutConfirm(false);
                  navigate('/');
                }}
                className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-red-200/30 hover:shadow-lg hover:shadow-red-300/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 outline-none cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
