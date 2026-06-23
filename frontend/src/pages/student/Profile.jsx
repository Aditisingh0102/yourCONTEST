import React from 'react';
import { Mail, Phone, Award, CheckCircle, Clock, Shield, Rocket } from 'lucide-react';

export default function Profile() {
  return (
    <div className="max-w-[1000px] mx-auto py-6 space-y-6">
      
      {/* Top Banner / ID Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative">
        {/* Cover Photo Area */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        
        {/* Profile Details */}
        <div className="px-8 pb-8 relative">
           <img 
             src="https://ui-avatars.com/api/?name=Aditi+Singh&background=0D8ABC&color=fff&size=128" 
             alt="Aditi Singh" 
             className="w-24 h-24 rounded-2xl border-4 border-white shadow-md absolute -top-12 bg-white object-cover"
           />
           
           <div className="pt-16 flex flex-col md:flex-row md:justify-between md:items-start gap-6">
             <div>
               <h1 className="text-3xl font-bold text-gray-900">Aditi Singh</h1>
               <p className="text-gray-500 font-medium text-lg">B.Tech CSE • 4th Year Student</p>
               <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                 <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-gray-400" /> aditi@uudoon.in</span>
                 <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-gray-400" /> +91 98765 43210</span>
               </div>
             </div>
             
             {/* Batch Badge */}
             <div className="bg-orange-50 border border-orange-100 p-5 rounded-2xl flex items-center gap-4 shadow-sm shrink-0">
                <div className="w-14 h-14 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center shadow-inner">
                  <Rocket className="w-7 h-7" />
                </div>
                <div>
                   <p className="text-[11px] uppercase tracking-wider font-bold text-orange-600 mb-0.5">Assigned Batch</p>
                   <h3 className="text-xl font-bold text-gray-900 leading-none">Alpha 1</h3>
                   <p className="text-xs text-gray-500 mt-1 font-medium">Session 2023-2027</p>
                </div>
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Academic Info */}
        <div className="md:col-span-1 space-y-6">
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
             <h3 className="text-[15px] font-bold text-gray-900 mb-5">Academic Details</h3>
             <ul className="space-y-4">
                <li className="flex justify-between items-center border-b border-gray-50 pb-3">
                  <span className="text-sm text-gray-500">University</span>
                  <span className="text-sm font-bold text-gray-800 text-right">Uttaranchal University</span>
                </li>
                <li className="flex justify-between items-center border-b border-gray-50 pb-3">
                  <span className="text-sm text-gray-500">College</span>
                  <span className="text-sm font-bold text-gray-800">UIT</span>
                </li>
                <li className="flex justify-between items-center border-b border-gray-50 pb-3">
                  <span className="text-sm text-gray-500">Program</span>
                  <span className="text-sm font-bold text-gray-800">B.Tech CSE</span>
                </li>
                <li className="flex justify-between items-center border-b border-gray-50 pb-3">
                  <span className="text-sm text-gray-500">Current Year</span>
                  <span className="text-sm font-bold text-gray-800">4th Year</span>
                </li>
                <li className="flex justify-between items-center border-b border-gray-50 pb-3">
                  <span className="text-sm text-gray-500">Roll Number</span>
                  <span className="text-sm font-bold text-gray-800">2023CSE1042</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Mentors</span>
                  <span className="text-sm font-bold text-gray-800 text-right">Arun Kudiyal Sir<br/>Mahi Sir</span>
                </li>
             </ul>
           </div>
        </div>

        {/* Right Column: Platform Stats */}
        <div className="md:col-span-2 space-y-6">
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
             <h3 className="text-[15px] font-bold text-gray-900 mb-5">Platform Statistics</h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
                   <Trophy className="w-6 h-6 text-blue-600 mb-3" />
                   <p className="text-2xl font-bold text-gray-900">0</p>
                   <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider">Total Contests</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 hover:shadow-md transition-shadow">
                   <Clock className="w-6 h-6 text-orange-600 mb-3" />
                   <p className="text-2xl font-bold text-gray-900">0</p>
                   <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider">Mock Tests Taken</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 hover:shadow-md transition-shadow">
                   <Shield className="w-6 h-6 text-purple-600 mb-3" />
                   <p className="text-2xl font-bold text-gray-900">0</p>
                   <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider">Assessments Given</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-100 hover:shadow-md transition-shadow">
                   <CheckCircle className="w-6 h-6 text-green-600 mb-3" />
                   <p className="text-2xl font-bold text-gray-900">0%</p>
                   <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider">Avg. Score</p>
                </div>
             </div>
           </div>

        </div>
      </div>

    </div>
  );
}

// Need Trophy icon
import { Trophy } from 'lucide-react';
