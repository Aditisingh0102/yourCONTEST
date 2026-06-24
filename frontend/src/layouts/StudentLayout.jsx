import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useDarkMode } from '../hooks/useDarkMode';

export default function StudentLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDark, toggleDark] = useDarkMode();

  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem('student_profile');
    if (saved) return JSON.parse(saved);
    return {
      name: 'Aditi Singh',
      avatar: 'https://ui-avatars.com/api/?name=Aditi+Singh&background=0D8ABC&color=fff&size=128',
      role: 'student'
    };
  });

  useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem('student_profile');
      if (saved) setProfileData(JSON.parse(saved));
    };
    window.addEventListener('profile-updated', handleUpdate);
    return () => window.removeEventListener('profile-updated', handleUpdate);
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col h-screen overflow-hidden">
      <Navbar user={profileData} onToggleSidebar={toggleSidebar} isCollapsed={isCollapsed} isDark={isDark} onToggleDark={toggleDark} />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          role="student" 
          isCollapsed={isCollapsed} 
          isMobileOpen={isMobileOpen} 
          setIsMobileOpen={setIsMobileOpen} 
        />
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
