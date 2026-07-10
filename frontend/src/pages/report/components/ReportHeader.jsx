import React from 'react';
import { Phone, Mail } from 'lucide-react';

export default function ReportHeader({ data }) {
  return (
    <div className="border border-gray-300 rounded-sm p-6 bg-white mb-6 shadow-sm">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{data.name}</h1>
      
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-gray-700 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-blue-600 font-semibold">Test ID:</span> {data.testId}
        </div>
        <div className="w-px h-4 bg-gray-300 hidden sm:block"></div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-blue-600" /> {data.phone}
        </div>
        <div className="w-px h-4 bg-gray-300 hidden sm:block"></div>
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-blue-600" /> {data.email}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <span className="text-blue-600 font-semibold">Test Date:</span> {data.testDate}
      </div>
    </div>
  );
}
