import React from 'react';
import { FileBarChart, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const reports = [];

export default function Reports() {
  return (
    <div className="max-w-[1000px] mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Detailed analysis of your assessments and mock tests</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {reports.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
              <FileBarChart className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Reports Available</h3>
            <p className="text-sm text-gray-500 max-w-sm">You haven't completed any assessments yet. Your detailed performance reports will appear here once you take a test.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[12px] uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-bold">Assessment Name</th>
                  <th className="p-4 font-bold">Date Taken</th>
                  <th className="p-4 font-bold">Score</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${report.bg} ${report.color}`}>
                          <FileBarChart className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-gray-900 text-sm">{report.title}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{report.date}</td>
                    <td className="p-4 text-sm font-bold text-gray-900">
                      {report.score} <span className="text-gray-400 font-medium">/ {report.total}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded text-[11px] font-bold tracking-wider uppercase border border-white/0 ${report.bg} ${report.color}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-[13px] font-bold text-blue-600 hover:text-blue-800 hover:underline">
                        View Analysis
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
