import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Building2,
  BookOpen,
  Users,
  Phone,
  Award,
  CheckCircle2,
  Rocket,
  Zap,
  Target,
  X,
  Camera,
  Edit,
  Save,
  Lock
} from 'lucide-react';
import { faculty } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';

const iconMap = {
  Rocket,
  Zap,
  Target
};

export default function FacultyProfile() {
  const navigate = useNavigate();
  const [showBatches, setShowBatches] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [profileData, setProfileData] = useState(() => {
    const defaultData = {
      name: faculty.name,
      facultyId: 'UU-FAC-2018-042',
      department: 'Computer Science',
      designation: faculty.role,
      email: faculty.erp,
      phone: '+91 98765 43210',
      avatar: faculty.avatar,
      role: 'faculty',
      joinDate: 'August 2018',
      batchesAllocated: 3,
      totalStudents: 98,
      expertise: ['Data Structures', 'Machine Learning', 'Java Programming'],
      allocatedBatchesList: [
        { id: 1, name: 'Alpha 1', course: 'Data Structures & Algorithms', students: 45, iconName: 'Rocket', color: 'text-orange-500', bg: 'bg-orange-100' },
        { id: 2, name: 'Alpha 2', course: 'Machine Learning', students: 38, iconName: 'Zap', color: 'text-blue-500', bg: 'bg-blue-100' },
        { id: 3, name: 'Beta 1', course: 'Java Programming', students: 15, iconName: 'Target', color: 'text-green-500', bg: 'bg-green-100' }
      ]
    };

    const saved = sessionStorage.getItem('faculty_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.designation && parsed.designation.includes('Corporate Trainer')) {
          parsed.designation = parsed.designation.replace('Corporate Trainer', 'Trainer');
          sessionStorage.setItem('faculty_profile', JSON.stringify({ ...defaultData, ...parsed }));
        }
        return { ...defaultData, ...parsed };
      } catch (e) {
        console.error("Failed to parse faculty_profile", e);
      }
    }
    return defaultData;
  });

  const [editForm, setEditForm] = useState({ ...profileData });

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
        sessionStorage.setItem('faculty_profile', JSON.stringify(updated));
        window.dispatchEvent(new Event('profile-updated'));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    setProfileData(editForm);
    sessionStorage.setItem('faculty_profile', JSON.stringify(editForm));
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

      {/* Profile Cover & Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-gray-800 dark:to-black border-b border-transparent dark:border-zinc-800"></div>
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-12 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="pb-2 pt-14 md:pt-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold text-gray-900">{profileData.name}</h1>
                  <CheckCircle2 className="w-5 h-5 text-blue-500 animate-pulse" />
                </div>
                <p className="text-[15px] font-medium text-gray-500 mt-1">{profileData.designation}</p>
              </div>
            </div>

            <div className="flex gap-3 pb-2">
              <button
                onClick={() => {
                  if (!isEditing) setEditForm({ ...profileData });
                  setIsEditing(!isEditing);
                }}
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
            <Edit className="w-5 h-5 text-blue-500" /> Edit Faculty Profile Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Faculty Name</label>
              <input
                type="text"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">University Email</label>
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
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Faculty ID / ERP</label>
              <input
                type="text"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                value={editForm.facultyId}
                onChange={(e) => setEditForm({ ...editForm, facultyId: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Designation / Role</label>
              <input
                type="text"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                value={editForm.designation}
                onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Department / College</label>
              <input
                type="text"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                value={editForm.department}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
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
          {/* Left Column: Stats & Skills */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-5">Overview Stats</h2>

              <div className="space-y-4">
                <div
                  onClick={() => setShowBatches(true)}
                  className="flex items-center gap-4 bg-indigo-50/50 border border-indigo-100/50 p-4 rounded-xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-all group"
                >
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-500">Batches Allocated</p>
                    <p className="text-lg font-semibold text-gray-900">{profileData.batchesAllocated}</p>
                  </div>
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-semibold">View</span>
                  </div>
                </div>

                <div
                  className="flex items-center gap-4 bg-green-50/50 border border-green-100/50 p-4 rounded-xl cursor-pointer hover:bg-green-100/60 hover:border-green-300/60 transition-all duration-200"
                  onClick={() => navigate('/faculty/student-records')}
                >
                  <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500">Total Students</p>
                    <p className="text-lg font-semibold text-gray-900">{profileData.totalStudents}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-5">Areas of Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {(profileData.expertise || []).map((skill, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 text-[13px] font-semibold rounded-lg">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Information */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-5">Contact Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-gray-500 mb-0.5">University Email</p>
                    <p className="text-[14px] font-semibold text-gray-900">{profileData.email}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-gray-500 mb-0.5">ERP Faculty ID</p>
                    <p className="text-[14px] font-semibold text-gray-900">{profileData.facultyId}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-gray-500 mb-0.5">Phone Number</p>
                    <p className="text-[14px] font-semibold text-gray-900">{profileData.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-5">Institutional Details</h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-gray-500 mb-0.5">University</p>
                    <p className="text-[15px] font-semibold text-gray-900">Uttaranchal University</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-gray-500 mb-0.5">Department / Designation</p>
                    <p className="text-[15px] font-semibold text-gray-900">{profileData.department} • {profileData.designation}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Award className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-gray-500 mb-0.5">Joining Date</p>
                    <p className="text-[15px] font-semibold text-gray-900">{profileData.joinDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Batches Modal */}
      {showBatches && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Allocated Batches</h3>
                <p className="text-sm text-gray-500 font-medium mt-1">Batches currently assigned to you</p>
              </div>
              <button
                onClick={() => setShowBatches(false)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {(profileData.allocatedBatchesList || []).map((batch) => {
                const Icon = iconMap[batch?.iconName] || BookOpen;
                return (
                  <div key={batch.id} className="group flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md hover:border-gray-200 transition-all cursor-pointer">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${batch.bg} ${batch.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[15px] font-semibold text-gray-900">{batch.name}</h4>
                      <p className="text-[13px] font-medium text-gray-500">{batch.course}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[12px] font-semibold text-gray-700">{batch.students}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowBatches(false)}
                className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
              >
                Close
              </button>
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
