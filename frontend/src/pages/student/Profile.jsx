import React, { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  Award,
  CheckCircle,
  Clock,
  Shield,
  Rocket,
  Trophy,
  Camera,
  Edit,
  Save,
  X,
  Lock
} from 'lucide-react';

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [profileData, setProfileData] = useState(() => {
    const saved = sessionStorage.getItem('student_profile');
    if (saved) return JSON.parse(saved);
    return {
      name: 'Aditi Singh',
      rollNo: '2023CSE1042',
      regNo: 'UU23104209',
      branch: 'B.Tech CSE',
      semester: '8th Semester',
      email: 'aditi@uudoon.in',
      phone: '+91 98765 43210',
      avatar: 'https://ui-avatars.com/api/?name=Aditi+Singh&background=0D8ABC&color=fff&size=128',
      role: 'student',
      joinDate: 'August 2023'
    };
  });

  const [editForm, setEditForm] = useState({ ...profileData });

  // Sync edits when profile changes
  useEffect(() => {
    setEditForm({ ...profileData });
  }, [profileData]);

  // ESC key for password modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowPasswordModal(false);
    };
    if (showPasswordModal) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPasswordModal]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updated = { ...profileData, avatar: reader.result };
        setProfileData(updated);
        sessionStorage.setItem('student_profile', JSON.stringify(updated));
        window.dispatchEvent(new Event('profile-updated'));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    setProfileData(editForm);
    sessionStorage.setItem('student_profile', JSON.stringify(editForm));
    window.dispatchEvent(new Event('profile-updated'));
    setIsEditing(false);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (passwordForm.new.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    // Success simulation
    setPasswordSuccess(true);
    setPasswordForm({ current: '', new: '', confirm: '' });
    setTimeout(() => {
      setShowPasswordModal(false);
      setPasswordSuccess(false);
    }, 1500);
  };

  return (
    <div className="max-w-[1000px] mx-auto py-6 space-y-6">

      {/* Top Banner / ID Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-gray-800 dark:to-black border-b border-transparent dark:border-zinc-800"></div>

        <div className="px-8 pb-8 relative">
          {/* Avatar Section with Upload Overlay */}
          <div className="absolute -top-12 left-8 group w-24 h-24 rounded-2xl border-4 border-white shadow-md bg-white overflow-hidden">
            <img
              src={profileData.avatar}
              alt={profileData.name}
              className="w-full h-full object-cover"
            />
            <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Camera className="w-6 h-6 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="pt-16 flex flex-col md:flex-row md:justify-between md:items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-semibold text-gray-900">{profileData.name}</h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100 capitalize">
                  {profileData.role}
                </span>
              </div>
              <p className="text-gray-500 font-medium text-lg mt-1">{profileData.branch} • {profileData.semester}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-gray-400" /> {profileData.email}</span>
                <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-gray-400" /> {profileData.phone}</span>
              </div>
            </div>

            {/* Edit Actions & Password Change */}
            <div className="flex flex-wrap gap-3 shrink-0">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-white text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2 shadow-sm outline-none cursor-pointer"
              >
                {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
              <button
                onClick={() => {
                  setPasswordError('');
                  setPasswordSuccess(false);
                  setPasswordForm({ current: '', new: '', confirm: '' });
                  setShowPasswordModal(true);
                }}
                className="px-4 py-2 bg-white text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2 shadow-sm outline-none cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>

      {isEditing ? (
        /* Edit Profile Form Panel */
        <form onSubmit={handleProfileSave} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-50 pb-3 flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-500" /> Edit Profile Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Student Name</label>
              <input
                type="text"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Contact Number</label>
              <input
                type="text"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Course / Branch</label>
              <input
                type="text"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                value={editForm.branch}
                onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Current Semester</label>
              <input
                type="text"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                value={editForm.semester}
                onChange={(e) => setEditForm({ ...editForm, semester: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Roll Number</label>
              <input
                type="text"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                value={editForm.rollNo}
                onChange={(e) => setEditForm({ ...editForm, rollNo: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Registration Number</label>
              <input
                type="text"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                value={editForm.regNo}
                onChange={(e) => setEditForm({ ...editForm, regNo: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-50">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-white text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all outline-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm outline-none cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </form>
      ) : (
        /* Academic details & Stats Dashboard Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Academic Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-[15px] font-semibold text-gray-900 mb-5">Academic Details</h3>
              <ul className="space-y-4">
                <li className="flex justify-between items-center border-b border-gray-50 pb-3">
                  <span className="text-sm text-gray-500">Program / Branch</span>
                  <span className="text-sm font-semibold text-gray-800 text-right">{profileData.branch}</span>
                </li>
                <li className="flex justify-between items-center border-b border-gray-50 pb-3">
                  <span className="text-sm text-gray-500">Current Semester</span>
                  <span className="text-sm font-semibold text-gray-800">{profileData.semester}</span>
                </li>
                <li className="flex justify-between items-center border-b border-gray-50 pb-3">
                  <span className="text-sm text-gray-500">Roll Number</span>
                  <span className="text-sm font-semibold text-gray-800">{profileData.rollNo}</span>
                </li>
                <li className="flex justify-between items-center border-b border-gray-50 pb-3">
                  <span className="text-sm text-gray-500">Registration ID</span>
                  <span className="text-sm font-semibold text-gray-800">{profileData.regNo}</span>
                </li>
                <li className="flex justify-between items-center border-b border-gray-50 pb-3">
                  <span className="text-sm text-gray-500">University Join Date</span>
                  <span className="text-sm font-semibold text-gray-800">{profileData.joinDate}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Assigned Mentors</span>
                  <span className="text-sm font-semibold text-gray-800 text-right">Arun Kudiyal Sir<br />Mahi Sir</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Platform Stats */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-[15px] font-semibold text-gray-900 mb-5">Platform Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
                  <Trophy className="w-6 h-6 text-blue-600 mb-3" />
                  <p className="text-2xl font-semibold text-gray-900">0</p>
                  <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wider">Total Contests</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 hover:shadow-md transition-shadow">
                  <Clock className="w-6 h-6 text-orange-600 mb-3" />
                  <p className="text-2xl font-semibold text-gray-900">0</p>
                  <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wider">Mock Tests Taken</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 hover:shadow-md transition-shadow">
                  <Shield className="w-6 h-6 text-purple-600 mb-3" />
                  <p className="text-2xl font-semibold text-gray-900">0</p>
                  <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wider">Assessments Given</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-100 hover:shadow-md transition-shadow">
                  <CheckCircle className="w-6 h-6 text-green-600 mb-3" />
                  <p className="text-2xl font-semibold text-gray-900">0%</p>
                  <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wider">Avg. Score</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Dialog Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            onClick={() => setShowPasswordModal(false)}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300 ease-out animate-in fade-in"
          />

          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative z-10 animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Lock className="w-5 h-5 text-orange-500" /> Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"><X className="w-4 h-4" /></button>
            </div>

            {passwordError && (
              <div className="mb-4 p-2.5 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-lg text-center">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 p-2.5 bg-green-50 border border-green-100 text-green-600 text-xs font-semibold rounded-lg text-center">
                Password updated successfully!
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Current Password</label>
                <input
                  type="password"
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:bg-white focus:border-orange-500"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">New Password</label>
                <input
                  type="password"
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:bg-white focus:border-orange-500"
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:bg-white focus:border-orange-500"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 bg-white text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-colors cursor-pointer"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
