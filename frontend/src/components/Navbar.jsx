import React, { useState, useEffect } from 'react';
import { BookOpen, Moon, Sun, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10 shrink-0 navbar-container">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
        <div className="bg-blue-600 text-white p-1.5 rounded-lg logo-icon">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="flex flex-col border-l border-gray-300 pl-3 logo-text-container">
          <span className="text-[15px] font-bold text-gray-800 leading-tight">University Platform</span>
          <span className="text-[11px] text-gray-500 leading-tight">{user.role === 'student' ? 'Student Portal' : 'Faculty Portal'}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-5">
        <button onClick={toggleTheme} className="text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-gray-100">
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button className="text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-gray-100">
          <Bell className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3 pl-4 cursor-pointer">
          <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-gray-200" />
          <div className="text-left hidden sm:block">
            <p className="text-[13px] font-semibold text-gray-800 leading-tight">{user.name}</p>
            <p className="text-[11px] text-gray-500 capitalize leading-tight">{user.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
