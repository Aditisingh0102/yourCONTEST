import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useDarkMode } from '../hooks/useDarkMode';

export default function StudentLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDark, toggleDark] = useDarkMode();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(() => {
    const saved = sessionStorage.getItem('student_profile');
    if (saved) return JSON.parse(saved);
    return null;
  });

  useEffect(() => {
    const handleUpdate = () => {
      const saved = sessionStorage.getItem('student_profile');
      if (saved) setProfileData(JSON.parse(saved));
    };
    window.addEventListener('profile-updated', handleUpdate);
    return () => window.removeEventListener('profile-updated', handleUpdate);
  }, []);

  useEffect(() => {
    if (!sessionStorage.getItem('student_profile')) {
      navigate('/');
    }
  }, [navigate]);

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  if (!profileData) return null;

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
