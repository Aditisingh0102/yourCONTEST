import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Moon, Sun, Bell, Menu, Coffee, LogOut, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ user, onToggleSidebar, isCollapsed, theme, onCycleTheme }) {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="h-16 bg-white dark:bg-[#0f172a] border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 sticky top-0 z-10 shrink-0 navbar-container transition-colors duration-300">
      <div className="flex items-center gap-4">
        {/* Sidebar Hamburger Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-100"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="bg-blue-600 dark:bg-gradient-to-br dark:from-gray-700 dark:to-black text-white p-1.5 rounded-lg logo-icon hidden sm:block shadow-sm border border-transparent dark:border-gray-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex flex-col sm:border-l sm:border-gray-300 dark:sm:border-gray-600 sm:pl-3 logo-text-container">
            <span className="text-[15px] font-bold text-gray-800 dark:text-gray-100 leading-tight">University Platform</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">{user.role === 'student' ? 'Student Portal' : 'Technical Trainer Portal'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* ── Dark / Light / Warm Mode Toggle ── */}
        <button
          onClick={onCycleTheme}
          aria-label={`Current theme is ${theme}. Click to change.`}
          title={`Current theme is ${theme}. Click to change.`}
          className={`
            relative flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1
            ${theme === 'dark'
              ? 'bg-slate-800 border-slate-700 focus:ring-slate-400 text-blue-300 hover:bg-slate-700'
              : theme === 'warm'
              ? 'bg-[#f6f3eb] border-[#e8e4d9] focus:ring-amber-400 text-amber-700 hover:bg-[#eee8d5]'
              : 'bg-blue-50 border-blue-200 focus:ring-blue-400 text-yellow-500 hover:bg-blue-100'}
          `}
        >
          {theme === 'dark' ? (
            <Moon className="w-5 h-5" />
          ) : theme === 'warm' ? (
            <Coffee className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </button>

        {/* Bell */}
        <button className="text-gray-400 dark:text-gray-500 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <Bell className="w-5 h-5" />
        </button>

        {/* Avatar */}
        <div className="relative" ref={dropdownRef}>
          <div 
            className="flex items-center gap-3 pl-2 cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {user?.role === 'faculty' ? (
              <img 
                src={user.avatar} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 object-cover" 
                onError={(e) => { e.target.onerror = null; e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}&backgroundColor=0D8ABC&textColor=fff`; }} 
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-700 text-white flex items-center justify-center font-bold text-[13px] shrink-0 border border-blue-700 shadow-sm">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
              </div>
            )}
            <div className="text-left hidden sm:block">
              <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-100 leading-tight">{user.name}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 capitalize leading-tight">{user.role === 'faculty' ? 'Technical Trainer' : user.role}</p>
            </div>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1e293b] rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-50 overflow-hidden">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  const profileRoute = user?.role === 'student' ? '/student/profile' : '/faculty/profile';
                  navigate(profileRoute);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Key className="w-4 h-4" />
                <span>Change Password</span>
              </button>
              <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigate('/');
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
