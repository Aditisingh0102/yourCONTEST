import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function SharedLayout({ user, role, theme, onCycleTheme, children }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsMobileOpen(!isMobileOpen);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex h-screen overflow-hidden">
      <Sidebar 
        role={role} 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
      />
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <Navbar user={user} onToggleSidebar={toggleSidebar} isCollapsed={false} theme={theme} onCycleTheme={onCycleTheme} />
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}
