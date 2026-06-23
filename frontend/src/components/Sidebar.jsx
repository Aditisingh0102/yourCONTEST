import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Megaphone, BookOpen, Code, Trophy, Video, Briefcase, User, FileBarChart } from 'lucide-react';

const studentLinks = [
  { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
  { name: 'Notice Board', path: '/student/notice', icon: Megaphone },
  { name: 'Courses', path: '/student/courses', icon: BookOpen },
  { name: 'Contests', path: '/student/contests', icon: Trophy },
  { name: 'Reports', path: '/student/reports', icon: FileBarChart },
  { name: 'Profile', path: '/student/profile', icon: User },
];

const facultyLinks = [
  { name: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
  { name: 'Notice Board', path: '/faculty/notice', icon: Megaphone },
  { name: 'Course Hub', path: '/faculty/course-hub', icon: BookOpen },
  { name: 'Contest Manager', path: '/faculty/manage-contests', icon: Trophy },
  { name: 'My Batches', path: '/faculty/batches', icon: Briefcase },
  { name: 'Student Records', path: '/faculty/students', icon: User },
  { name: 'Profile', path: '/faculty/profile', icon: User },
];

export default function Sidebar({ role }) {
  const links = role === 'student' ? studentLinks : facultyLinks;

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] flex flex-col py-4 shrink-0 overflow-y-auto sidebar-container">
      <nav className="flex-1 px-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{link.name}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 mt-auto">
        <NavLink 
          to="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <span className="text-sm font-medium">Logout</span>
        </NavLink>
      </div>
    </div>
  );
}
