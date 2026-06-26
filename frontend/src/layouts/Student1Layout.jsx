import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar1 from '../components/Sidebar1';
import { useDarkMode } from '../hooks/useDarkMode';

export default function Student1Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDark, toggleDark] = useDarkMode();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem('student1_profile');
    if (saved) return JSON.parse(saved);
    return {
      name: 'Ambar Kumar',
      avatar: 'https://ui-avatars.com/api/?name=Ambar+Kumar&background=0D8ABC&color=fff&size=128',
      role: 'student'
    };
  });

  useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem('student1_profile');
      if (saved) setProfileData(JSON.parse(saved));
    };
    window.addEventListener('profile1-updated', handleUpdate);
    return () => window.removeEventListener('profile1-updated', handleUpdate);
  }, []);

  useEffect(() => {
    const currentProfile = JSON.parse(localStorage.getItem('student1_profile') || '{}');
    if (currentProfile.batch !== 'Beta 1') {
      const ambarProfile = {
        name: 'Ambar Kumar',
        rollNo: '23210101763',
        regNo: 'UU23104210',
        branch: 'B.Tech IT',
        semester: '7th Semester',
        batch: 'Beta 1',
        role: 'student'
      };
      localStorage.setItem('student1_profile', JSON.stringify(ambarProfile));
      setProfileData(ambarProfile);
      window.dispatchEvent(new Event('profile1-updated'));
    }
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
        <Sidebar1 
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
