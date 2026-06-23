import React, { useState } from 'react';
import { User, Mail, Building2, BookOpen, Users, Phone, MapPin, Award, CheckCircle2, Rocket, Zap, Target, X } from 'lucide-react';

const facultyData = {
  name: 'Arun Kudiyal',
  erpId: 'UU9087',
  role: 'Senior Faculty & Corporate Trainer',
  email: 'UU9087@uumail.in',
  phone: '+91 98765 43210',
  university: 'Uttaranchal University, Dehradun',
  college: 'Department of Computer Science',
  batchesAllocated: 3,
  totalStudents: 98,
  joinDate: 'August 2018',
  expertise: ['Data Structures', 'Machine Learning', 'Java Programming'],
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arun',
  allocatedBatchesList: [
    { id: 1, name: 'Alpha 1', course: 'Data Structures & Algorithms', students: 45, icon: Rocket, color: 'text-orange-500', bg: 'bg-orange-100' },
    { id: 2, name: 'Alpha 2', course: 'Machine Learning', students: 38, icon: Zap, color: 'text-blue-500', bg: 'bg-blue-100' },
    { id: 3, name: 'Beta 1', course: 'Java Programming', students: 15, icon: Target, color: 'text-green-500', bg: 'bg-green-100' }
  ]
};

export default function FacultyProfile() {
  const [showBatches, setShowBatches] = useState(false);
  return (
    <div className="max-w-[1000px] mx-auto py-6 space-y-6">
      
      {/* Profile Cover & Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-12 relative z-10">
            <div className="flex items-end gap-6">
              <div className="p-1.5 bg-white rounded-2xl shadow-sm shrink-0">
                <img src={facultyData.avatar} alt="Profile" className="w-24 h-24 rounded-xl bg-gray-50 border border-gray-100" />
              </div>
              <div className="pb-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-gray-900">{facultyData.name}</h1>
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-[15px] font-medium text-gray-500 mt-1">{facultyData.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Stats & Skills */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-5">Overview Stats</h2>
            
            <div className="space-y-4">
              <div 
                onClick={() => setShowBatches(true)}
                className="flex items-center gap-4 bg-indigo-50/50 border border-indigo-100/50 p-4 rounded-xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-all group"
              >
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-500">Batches Allocated</p>
                  <p className="text-lg font-black text-gray-900">{facultyData.batchesAllocated}</p>
                </div>
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-bold">View</span>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-green-50/50 border border-green-100/50 p-4 rounded-xl">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500">Total Students</p>
                  <p className="text-lg font-black text-gray-900">{facultyData.totalStudents}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-5">Areas of Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {facultyData.expertise.map((skill, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 text-[13px] font-bold rounded-lg">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Information */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-5">Contact Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-gray-500 mb-0.5">University Email</p>
                  <p className="text-[14px] font-semibold text-gray-900">{facultyData.email}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-gray-500 mb-0.5">ERP ID</p>
                  <p className="text-[14px] font-semibold text-gray-900">{facultyData.erpId}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-gray-500 mb-0.5">Phone Number</p>
                  <p className="text-[14px] font-semibold text-gray-900">{facultyData.phone}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-5">Institutional Details</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-gray-500 mb-0.5">University</p>
                  <p className="text-[15px] font-semibold text-gray-900">{facultyData.university}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-gray-500 mb-0.5">College / Department</p>
                  <p className="text-[15px] font-semibold text-gray-900">{facultyData.college}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-gray-500 mb-0.5">Joining Date</p>
                  <p className="text-[15px] font-semibold text-gray-900">{facultyData.joinDate}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Batches Modal */}
      {showBatches && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-gray-900">Allocated Batches</h3>
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
              {facultyData.allocatedBatchesList.map((batch) => {
                const Icon = batch.icon;
                return (
                  <div key={batch.id} className="group flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md hover:border-gray-200 transition-all cursor-pointer">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${batch.bg} ${batch.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[15px] font-bold text-gray-900">{batch.name}</h4>
                      <p className="text-[13px] font-medium text-gray-500">{batch.course}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[12px] font-bold text-gray-700">{batch.students}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setShowBatches(false)}
                className="px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
