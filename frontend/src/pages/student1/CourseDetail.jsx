import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Video, FileText, CheckCircle2, PlayCircle, Download, ChevronLeft, FileCode } from 'lucide-react';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('lectures'); // lectures, documentation

  // Dummy data
  const course = {
    title: 'Data Structures in Java',
    professor: 'Prof. Alan Turing',
    progress: 30,
    tags: ['Java', 'Algorithms', 'DSA'],
    lectures: [
      { id: 1, title: 'Lecture 1: Introduction to Time Complexity', duration: '45 mins', completed: true },
      { id: 2, title: 'Lecture 2: Arrays and Strings deep dive', duration: '55 mins', completed: true },
      { id: 3, title: 'Lecture 3: Linked Lists implementations', duration: '1h 10m', completed: true },
      { id: 4, title: 'Lecture 4: Stacks & Queues', duration: '50 mins', completed: false },
      { id: 5, title: 'Lecture 5: Recursion and Backtracking', duration: '1h 20m', completed: false },
      { id: 6, title: 'Lecture 6: Trees and Graphs', duration: '2h', completed: false },
    ],
    documents: [
      { id: 1, title: 'Unit 1: Complexity Notes.pdf', size: '2.4 MB', type: 'PDF' },
      { id: 2, title: 'Unit 2: Linear Data Structures.pdf', size: '3.1 MB', type: 'PDF' },
      { id: 3, title: 'Cheat Sheet: Big O Notation.pdf', size: '1.1 MB', type: 'PDF' },
    ],
    tests: [
      { id: 101, title: 'Mid-Term Mock Test', type: 'Assessment', format: '40 MCQ + 3 Coding', status: 'Upcoming' },
      { id: 102, title: 'Unit 1 Quiz', type: 'Quiz', format: '15 MCQ', status: 'Live' },
      { id: 103, title: 'Arrays Practice Contest', type: 'Coding', format: '4 Coding Qs', status: 'Ended' },
    ]
  };

  return (
    <div className="max-w-[1200px] mx-auto py-6 space-y-6">
      
      {/* Back Button & Header */}
      <div>
        <button 
          onClick={() => navigate('/student1/courses')}
          className="flex items-center text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Courses
        </button>
        
        <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="absolute left-0 bottom-0 w-40 h-40 bg-indigo-900/40 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex gap-2 mb-4">
                 {course.tags.map((tag, i) => (
                   <span key={i} className="text-[10px] font-bold text-indigo-900 bg-indigo-100 px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
                     {tag}
                   </span>
                 ))}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{course.title}</h1>
              <p className="text-indigo-100 text-sm md:text-base font-medium flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Instructed by {course.professor}
              </p>
            </div>
            
            <div className="bg-black/20 backdrop-blur-md border border-white/20 p-5 rounded-2xl w-full md:w-64 shrink-0">
               <div className="flex justify-between items-end mb-2">
                 <span className="text-[11px] font-bold text-indigo-100 uppercase tracking-wider">Course Progress</span>
                 <span className="text-lg font-bold">{course.progress}%</span>
               </div>
               <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                 <div className="h-full bg-green-400 rounded-full" style={{ width: `${course.progress}%` }}></div>
               </div>
               <button className="w-full mt-4 py-2 bg-white text-indigo-600 text-sm font-bold rounded-lg hover:bg-indigo-50 transition-colors">
                 Resume Course
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Main Content (Left) */}
        <div className="lg:w-2/3 space-y-6">
           <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
              
              {/* Tabs */}
              <div className="flex gap-8 border-b border-gray-100 mb-6">
                <button 
                  onClick={() => setActiveTab('lectures')}
                  className={`pb-4 text-[15px] font-bold transition-all relative ${
                    activeTab === 'lectures' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span className="flex items-center gap-2"><Video className="w-4 h-4" /> Video Lectures</span>
                  {activeTab === 'lectures' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
                </button>
                <button 
                  onClick={() => setActiveTab('documentation')}
                  className={`pb-4 text-[15px] font-bold transition-all relative ${
                    activeTab === 'documentation' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Documentation & PDFs</span>
                  {activeTab === 'documentation' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'lectures' ? (
                <div className="space-y-3">
                  {course.lectures.map((lec, idx) => (
                    <div key={lec.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group">
                       <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                           lec.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600'
                         } transition-colors`}>
                           {lec.completed ? <CheckCircle2 className="w-5 h-5" /> : <PlayCircle className="w-5 h-5 ml-0.5" />}
                         </div>
                         <div>
                           <h4 className={`text-[14px] font-bold ${lec.completed ? 'text-gray-900' : 'text-gray-700 group-hover:text-blue-600'} transition-colors`}>
                             {lec.title}
                           </h4>
                           <p className="text-[12px] font-medium text-gray-400 mt-0.5">{lec.duration}</p>
                         </div>
                       </div>
                       <button className={`px-4 py-1.5 rounded-lg text-[12px] font-bold transition-colors ${
                         lec.completed ? 'text-gray-400 bg-gray-50 hover:bg-gray-100' : 'text-blue-600 bg-blue-50 hover:bg-blue-100 opacity-0 group-hover:opacity-100'
                       }`}>
                         {lec.completed ? 'Watch Again' : 'Play Video'}
                       </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {course.documents.map((doc) => (
                    <div key={doc.id} className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all cursor-pointer group">
                       <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                         <FileText className="w-5 h-5" />
                       </div>
                       <div className="flex-1">
                         <h4 className="text-[14px] font-bold text-gray-900 group-hover:text-orange-600 transition-colors leading-tight mb-1">
                           {doc.title}
                         </h4>
                         <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{doc.type} • {doc.size}</p>
                       </div>
                       <button className="text-gray-400 hover:text-orange-600 transition-colors">
                         <Download className="w-5 h-5" />
                       </button>
                    </div>
                  ))}
                </div>
              )}

           </div>
        </div>

        {/* Sidebar (Right) - Related Tests */}
        <div className="lg:w-1/3">
           <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sticky top-6">
             <h3 className="text-[16px] font-bold text-gray-900 mb-5 flex items-center gap-2">
               <FileCode className="w-5 h-5 text-purple-600" /> Related Tests
             </h3>
             
             <div className="space-y-4">
               {course.tests.map((test) => (
                 <div key={test.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-purple-200 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border ${
                        test.type === 'Assessment' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                        test.type === 'Quiz' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {test.type}
                      </span>
                      <span className={`text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 ${
                        test.status === 'Live' ? 'text-red-600' : 'text-gray-400'
                      }`}>
                        {test.status === 'Live' && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>}
                        {test.status}
                      </span>
                    </div>
                    <h4 className="text-[14px] font-bold text-gray-900 mb-1 leading-tight">{test.title}</h4>
                    <p className="text-[12px] font-medium text-gray-500 mb-4">{test.format}</p>
                    
                    <button 
                      onClick={() => navigate('/student1/contests')}
                      className={`w-full py-2.5 rounded-lg text-[12px] font-bold transition-colors ${
                        test.status === 'Live' ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm shadow-purple-200' : 
                        test.status === 'Upcoming' ? 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-100' : 
                        'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      {test.status === 'Live' ? 'Start Test Now' : test.status === 'Upcoming' ? 'View Details' : 'View Results'}
                    </button>
                 </div>
               ))}
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
