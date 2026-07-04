import React, { useState, useEffect } from 'react';
import { getSubmissions } from '../../api';
import { socket } from '../../socket';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  PieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts';
import { BarChart as BarChartIcon, Target, Users, BookOpen, Clock } from 'lucide-react';

const allocatedBatchesList = [
  { id: 1, name: 'Alpha 1', students: 45 },
  { id: 2, name: 'Alpha 2', students: 38 },
  { id: 3, name: 'Beta 1', students: 15 }
];

export default function Analytics() {
  const [batchPerformanceData, setBatchPerformanceData] = useState([]);
  const [contestResultData, setContestResultData] = useState([]);
  const [scoreDistributionData, setScoreDistributionData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const subsRes = await getSubmissions();
        const submissionsData = subsRes.data;

        // Calculate Batch Performance dynamically
        const bpData = allocatedBatchesList.map(batch => {
          const batchName = batch.name;
          const batchSubs = submissionsData.filter(s => s.batch === batchName);
          if (batchSubs.length === 0) return { name: batchName, averageScore: 0, topScore: 0 };
          
          const scores = batchSubs.map(s => s.score || 0);
          const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
          const top = Math.max(...scores);
          return { name: batchName, averageScore: avg, topScore: top };
        });
        setBatchPerformanceData(bpData);

        // Calculate Overall Results dynamically
        const totalStudents = allocatedBatchesList.reduce((acc, curr) => acc + curr.students, 0);
        const totalSubs = submissionsData.length;
        
        const passed = submissionsData.filter(s => (s.score || 0) >= 5).length;
        const failed = totalSubs - passed;
        const notAttempted = Math.max(0, totalStudents - totalSubs);

        setContestResultData([
          { name: 'Passed', value: passed, color: '#22c55e' },
          { name: 'Failed', value: failed, color: '#ef4444' },
          { name: 'Not Attempted', value: notAttempted, color: '#94a3b8' },
        ]);

        // Calculate Score Distribution (Area Chart)
        const buckets = { '0-2': 0, '3-5': 0, '6-8': 0, '9-10+': 0 };
        submissionsData.forEach(s => {
          const score = s.score || 0;
          if (score <= 2) buckets['0-2']++;
          else if (score <= 5) buckets['3-5']++;
          else if (score <= 8) buckets['6-8']++;
          else buckets['9-10+']++;
        });

        setScoreDistributionData([
          { range: '0-2 Points', count: buckets['0-2'] },
          { range: '3-5 Points', count: buckets['3-5'] },
          { range: '6-8 Points', count: buckets['6-8'] },
          { range: '9-10+ Points', count: buckets['9-10+'] },
        ]);
        
      } catch (error) {
        console.error("Failed to fetch analytics data", error);
      }
    };
    
    fetchData();

    socket.on('SUBMISSION_ADDED', fetchData);
    socket.on('SUBMISSION_UPDATED', fetchData);
    return () => {
      socket.off('SUBMISSION_ADDED', fetchData);
      socket.off('SUBMISSION_UPDATED', fetchData);
    };
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChartIcon className="w-6 h-6 text-blue-600 dark:text-blue-500" />
          Results & Analytics
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Deep dive into student performance, contest success rates, and score distributions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Batch Performance (Bar Chart) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" /> Batch Performance
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={batchPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="averageScore" name="Avg Score" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={25} />
                <Bar dataKey="topScore" name="Top Score" fill="#818cf8" radius={[4, 4, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Overall Results (Doughnut Chart) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-500" /> Overall Engagement & Results
          </h3>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={contestResultData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {contestResultData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }} verticalAlign="bottom" height={40}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Distribution (Area Chart) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-500" /> Score Distribution Trend
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scoreDistributionData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="count" name="Number of Students" stroke="#ea580c" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
