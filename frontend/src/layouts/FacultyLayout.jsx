import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { faculty } from '../data/mockData';

export default function FacultyLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col h-screen overflow-hidden">
      <Navbar user={faculty} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar role="faculty" />
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
