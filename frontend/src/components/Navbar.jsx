import React from 'react';
import { BookOpen, Moon, Sun, Bell, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ user, onToggleSidebar, isCollapsed, isDark, onToggleDark }) {
  const navigate = useNavigate();

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
        {/* ── Dark / Light Mode Toggle ── */}
        <button
          onClick={onToggleDark}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className={`
            relative flex items-center w-[56px] h-[28px] rounded-full border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1
            ${isDark
              ? 'bg-slate-700 border-slate-600'
              : 'bg-blue-50 border-blue-200'}
          `}
        >
          {/* Track icons */}
          <Sun  className={`absolute left-[5px]  w-3.5 h-3.5 transition-all duration-300 ${isDark ? 'opacity-30 text-slate-400' : 'opacity-100 text-yellow-500'}`} />
          <Moon className={`absolute right-[5px] w-3.5 h-3.5 transition-all duration-300 ${isDark ? 'opacity-100 text-blue-300' : 'opacity-30 text-slate-400'}`} />

          {/* Thumb */}
          <span
            className={`
              absolute top-[3px] w-[22px] h-[22px] rounded-full shadow-md transition-all duration-300 flex items-center justify-center
              ${isDark
                ? 'left-[29px] bg-slate-900'
                : 'left-[3px]  bg-white border border-blue-100'}
            `}
          >
            {isDark
              ? <Moon className="w-3 h-3 text-blue-300" />
              : <Sun  className="w-3 h-3 text-yellow-500" />
            }
          </span>
        </button>

        {/* Bell */}
        <button className="text-gray-400 dark:text-gray-500 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <Bell className="w-5 h-5" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-3 pl-2 cursor-pointer">
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
      </div>
    </div>
  );
}
