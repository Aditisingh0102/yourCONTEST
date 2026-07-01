import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ArrowRight, Lock, User } from 'lucide-react';

export default function Login() {
  const [erpId, setErpId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (erpId === '23210101548@uudoon.in' || erpId === '2321010548@uudoon.in') {
      sessionStorage.setItem('student_profile', JSON.stringify({
        name: 'Aditi Singh',
        rollNo: '23210101548',
        regNo: 'UU23104209',
        branch: 'B.Tech CSE',
        semester: '7th Semester',
        email: '23210101548@uudoon.in',
        phone: '+91 98765 43210',
        avatar: 'https://ui-avatars.com/api/?name=Aditi+Singh&background=0D8ABC&color=fff&size=128',
        role: 'student',
        joinDate: 'August 2023',
        batch: 'Alpha 1'
      }));
      sessionStorage.removeItem('hasSeenNoticePopup');
      window.dispatchEvent(new Event('profile-updated'));
      navigate('/student/dashboard');
    } else if (erpId === '23210101763@uudoon.in') {
      sessionStorage.setItem('student_profile', JSON.stringify({
        name: 'Ambar Kumar',
        rollNo: '23210101763',
        regNo: 'UU23104299',
        branch: 'B.Tech IT',
        semester: '7th Semester',
        email: '23210101763@uudoon.in',
        phone: '+91 98765 99999',
        avatar: 'https://ui-avatars.com/api/?name=Ambar+Kumar&background=0D8ABC&color=fff&size=128',
        role: 'student',
        joinDate: 'August 2023',
        batch: 'Beta 1'
      }));
      sessionStorage.removeItem('hasSeenNoticePopup');
      window.dispatchEvent(new Event('profile-updated'));
      navigate('/student/dashboard');
    } else if (/^\d{1,11}@uumail\.in$/.test(erpId)) {
      sessionStorage.setItem('faculty_profile', JSON.stringify({
        name: 'Arun Kudiyal',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arun',
        role: 'Senior Faculty & Trainer',
        erp: erpId,
        university: 'Uttaranchal University, Dehradun'
      }));
      window.dispatchEvent(new Event('profile-updated'));
      navigate('/faculty/dashboard');
    } else {
      setError('Invalid ERP ID. Access is restricted to authorized users.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Trophy className="w-10 h-10 text-orange-500" />
          <h1 className="text-4xl font-semibold tracking-tight">
            <span className="text-orange-500">v</span><span className="text-white">Decided</span>
          </h1>
        </div>
        <p className="text-blue-200 text-lg">Built to challenge you. Designed to grow you.</p>
      </div>

      <div className="w-full max-w-md p-8 glass-panel">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Welcome Back</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100/80 border border-red-200 text-red-600 rounded-lg text-sm text-center backdrop-blur-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ERP ID</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" /> 
              </div>
              <input 
                type="email" 
                required
	  	maxLength={21}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="student@uudoon.in"
                value={erpId}
                onChange={(e) => setErpId(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="password" 
                required
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Sign In
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
