import React, { useState, useEffect } from 'react';
import { getSubmissions } from '../../api';
import { socket } from '../../socket';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  PieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts';
import { BarChart as BarChartIcon, Target, Users, BookOpen, Filter } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const allocatedBatchesList = [
  { id: 1, name: 'Alpha 1', students: 45 },
  { id: 2, name: 'Alpha 2', students: 38 },
  { id: 3, name: 'Beta 1', students: 15 }
];

export default function Analytics() {
  const [theme] = useTheme();

  // Raw Data State
  const [allSubmissions, setAllSubmissions] = useState([]);

  // Filter State
  const [selectedBatch, setSelectedBatch] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState('All');

  // Filter Options State
  const [availableBatches, setAvailableBatches] = useState(['All']);
  const [availableStudents, setAvailableStudents] = useState(['All']);

  // Chart Data State
  const [batchPerformanceData, setBatchPerformanceData] = useState([]);
  const [contestResultData, setContestResultData] = useState([]);
  const [scoreDistributionData, setScoreDistributionData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const subsRes = await getSubmissions();
        const submissionsData = subsRes.data;
        setAllSubmissions(submissionsData);

        // Extract unique options for filters
        const batches = [...new Set(submissionsData.map(s => s.batch).filter(Boolean))];
        const students = [...new Set(submissionsData.map(s => s.studentName).filter(Boolean))];

        // Include batches from our allocated list even if no submissions exist yet
        allocatedBatchesList.forEach(b => {
          if (!batches.includes(b.name)) batches.push(b.name);
        });

        setAvailableBatches(['All', ...batches.sort()]);
        setAvailableStudents(['All', ...students.sort()]);
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

  // Recalculate metrics whenever filters or raw data change
  useEffect(() => {
    // 1. Filter the submissions based on current selections
    const filteredSubs = allSubmissions.filter(s => {
      const matchBatch = selectedBatch === 'All' || s.batch === selectedBatch;
      const matchStudent = selectedStudent === 'All' || s.studentName === selectedStudent;
      return matchBatch && matchStudent;
    });

    // 2. Batch Performance (Bar Chart)
    const batchesToProcess = selectedBatch === 'All'
      ? allocatedBatchesList.map(b => b.name)
      : [selectedBatch];

    const bpData = batchesToProcess.map(batchName => {
      const batchSubs = filteredSubs.filter(s => s.batch === batchName);
      if (batchSubs.length === 0) return { name: batchName, averageScore: 0, topScore: 0 };

      const scores = batchSubs.map(s => s.score || 0);
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      const top = Math.max(...scores);
      return { name: batchName, averageScore: avg, topScore: top };
    });
    // If a specific student is selected and they don't belong to some batches, 
    // filter out zero-data batches to make the chart cleaner for individual student view
    const finalBpData = selectedStudent === 'All' ? bpData : bpData.filter(d => d.averageScore > 0 || d.topScore > 0);
    setBatchPerformanceData(finalBpData);

    // 3. Overall Results (Pie Chart)
    const passed = filteredSubs.filter(s => (s.score || 0) >= 2).length;
    const failed = filteredSubs.filter(s => (s.score || 0) < 2).length;

    // Estimate 'Not Attempted' based on selection context
    let notAttempted = 0;
    if (selectedStudent === 'All') {
      const totalStudents = selectedBatch === 'All'
        ? allocatedBatchesList.reduce((acc, curr) => acc + curr.students, 0)
        : (allocatedBatchesList.find(b => b.name === selectedBatch)?.students || 0);
      notAttempted = Math.max(0, totalStudents - filteredSubs.length);
    }

    setContestResultData([
      { name: 'Passed', value: passed },
      { name: 'Failed', value: failed },
      ...(notAttempted > 0 ? [{ name: 'Not Attempted', value: notAttempted }] : [])
    ]);

    // 4. Score Distribution (Area Chart)
    const buckets = { '0-2': 0, '3-5': 0, '6-8': 0, '9-10+': 0 };
    filteredSubs.forEach(s => {
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
  }, [allSubmissions, selectedBatch, selectedStudent]);

  const pieColors = {
    light: ['#22c55e', '#ef4444', '#94a3b8'],
    dark: ['#4ade80', '#f87171', '#475569'],
    warm: ['#84cc16', '#f97316', '#d6d3d1']
  };

  const currentPieColors = pieColors[theme] || pieColors.light;

  return (
    <div className="max-w-[1200px] mx-auto py-6 space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChartIcon className="w-6 h-6 text-blue-600 dark:text-blue-500" />
            Results & Analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Deep dive into student performance, contest success rates, and score distributions.
          </p>
        </div>

        {/* Dynamic Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 shadow-sm">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedBatch}
              onChange={(e) => {
                setSelectedBatch(e.target.value);
                setSelectedStudent('All'); // Reset student filter when batch changes
              }}
              className="bg-transparent border-none text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-0 cursor-pointer p-0 pr-4"
            >
              {availableBatches.map(b => (
                <option key={b} value={b}>{b === 'All' ? 'All Batches' : b}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 shadow-sm">
            <Users className="w-4 h-4 text-gray-400" />
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="bg-transparent border-none text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-0 cursor-pointer p-0 pr-4 max-w-[150px] truncate"
            >
              {availableStudents.map(s => (
                <option key={s} value={s}>{s === 'All' ? 'All Students' : s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Batch Performance (Bar Chart) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" /> {selectedStudent !== 'All' ? 'Student Performance' : 'Batch Performance'}
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={batchPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} style={{ outline: 'none' }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="averageScore" name="Avg Score" fill={theme === 'warm' ? '#e6a96b' : '#3b82f6'} radius={[4, 4, 0, 0]} barSize={25} />
                <Bar dataKey="topScore" name="Top Score" fill={theme === 'warm' ? '#fde68a' : '#818cf8'} radius={[4, 4, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Overall Results (Doughnut Chart) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-500" /> {selectedStudent !== 'All' ? 'Student Results' : 'Overall Engagement & Results'}
          </h3>
          <div className="h-72 w-full flex items-center justify-center">
            {contestResultData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart style={{ outline: 'none' }}>
                  <Pie
                    data={contestResultData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    style={{ outline: 'none' }}
                    label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                    labelLine={false}
                  >
                    {contestResultData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={currentPieColors[index % currentPieColors.length]} style={{ outline: 'none' }} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }} verticalAlign="bottom" height={40} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-400 font-medium">No data available</div>
            )}
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
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="count" name={selectedStudent !== 'All' ? "Scores in Range" : "Number of Students"} stroke="#ea580c" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
