import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Video, FileText, CheckCircle2, PlayCircle, Download, ChevronLeft, FileCode, Image as ImageIcon, X, CheckSquare, Save, Edit3, Trash2, Plus, Trophy, AlertCircle, Library } from 'lucide-react';
import { getContests } from '../../api';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('lectures'); // lectures, documentation

  const [activeFile, setActiveFile] = useState(null);

  const [notes, setNotes] = useState(() => {
    const saved = sessionStorage.getItem('student_notes');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Review Data Structures concepts', reminderTime: '2026-07-04T10:00' },
    ];
  });
  const [newNote, setNewNote] = useState('');
  const [newNoteTime, setNewNoteTime] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [editingNoteTime, setEditingNoteTime] = useState('');

  React.useEffect(() => {
    sessionStorage.setItem('student_notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotes([{ id: Date.now(), text: newNote, reminderTime: newNoteTime }, ...notes]);
    setNewNote('');
    setNewNoteTime('');
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const saveEdit = (id) => {
    if (!editingNoteText.trim()) return;
    setNotes(notes.map(n => n.id === id ? { ...n, text: editingNoteText, reminderTime: editingNoteTime } : n));
    setEditingNoteId(null);
  };

  const courseBaseDetails = {
    '1': { title: 'Full-Stack Web Development', professor: 'Dr. Sarah Jenkins', progress: 65, tags: ['React', 'Node.js', 'MongoDB'] },
    '2': { title: 'Data Structures in Java', professor: 'Prof. Alan Turing', progress: 30, tags: ['Java', 'Algorithms', 'DSA'] },
    '3': { title: 'Machine Learning Basics', professor: 'Dr. Andrew Ng', progress: 100, tags: ['Python', 'AI', 'TensorFlow'] },
    '4': { title: 'Cloud Computing with AWS', professor: 'Ms. Emily Chen', progress: 10, tags: ['AWS', 'DevOps', 'Cloud'] },
    '5': { title: 'Advanced Database Systems', professor: 'Dr. Robert Smith', progress: 0, tags: ['SQL', 'Postgres', 'Redis'] },
    '6': { title: 'Operating Systems Core', professor: 'Dr. Linus Torvalds', progress: 100, tags: ['C', 'Linux', 'OS'] },
    '7': { title: 'Cybersecurity Fundamentals', professor: 'Prof. Kevin Mitnick', progress: 15, tags: ['Security', 'Network', 'Ethics'] },
  };

  const base = courseBaseDetails[id] || courseBaseDetails['2'];

  const savedLecturesStr = sessionStorage.getItem(`course_${id}_lectures`);
  const savedNotesStr = sessionStorage.getItem(`course_${id}_notes`);
  const savedAssignmentsStr = sessionStorage.getItem(`course_${id}_assignments`);
  let savedLectures = null;
  let savedNotes = null;
  let savedAssignments = null;
  
  if (savedLecturesStr && savedLecturesStr !== 'null') {
    try {
      const parsed = JSON.parse(savedLecturesStr);
      if (Array.isArray(parsed)) {
        savedLectures = parsed.map(l => ({ ...l, url: l.url?.startsWith('blob:') ? null : l.url }));
      }
    } catch (e) {}
  }

  if (savedNotesStr && savedNotesStr !== 'null') {
    try {
      const parsed = JSON.parse(savedNotesStr);
      if (Array.isArray(parsed)) {
        savedNotes = parsed.map(n => ({ ...n, url: n.url?.startsWith('blob:') ? null : n.url }));
      }
    } catch (e) {}
  }

  if (savedAssignmentsStr && savedAssignmentsStr !== 'null') {
    try {
      const parsed = JSON.parse(savedAssignmentsStr);
      if (Array.isArray(parsed)) {
        savedAssignments = parsed.map(a => ({ ...a, url: a.url?.startsWith('blob:') ? null : a.url }));
      }
    } catch (e) {}
  }

  const [upcomingContests, setUpcomingContests] = useState([]);
  const [pastContests, setPastContests] = useState([]);

  React.useEffect(() => {
    getContests().then(res => {
      // Strictly filter to only show contests explicitly created for THIS specific course
      const filtered = res.data.filter(c => c.courseId?.toString() === id.toString());
      setUpcomingContests(filtered.filter(c => c.status === 'Upcoming' || c.status === 'Live'));
      setPastContests(filtered.filter(c => c.status === 'Completed' || c.status === 'Past'));
    }).catch(console.error);
  }, [id]);

  const course = {
    ...base,
    lectures: savedLectures || [
      { id: 1, title: 'Lecture 1: Introduction to Time Complexity', duration: '45 mins', completed: true, url: 'https://www.youtube.com/embed/1yrh60og6qc' },
      { id: 2, title: 'Lecture 2: Arrays and Strings deep dive', duration: '55 mins', completed: true, url: 'https://www.youtube.com/embed/1yrh60og6qc' },
      { id: 3, title: 'Lecture 3: Linked Lists implementations', duration: '1h 10m', completed: true, url: 'https://www.youtube.com/embed/1yrh60og6qc' },
      { id: 4, title: 'Lecture 4: Stacks & Queues', duration: '50 mins', completed: false, url: 'https://www.youtube.com/embed/1yrh60og6qc' },
      { id: 5, title: 'Lecture 5: Recursion and Backtracking', duration: '1h 20m', completed: false, url: 'https://www.youtube.com/embed/1yrh60og6qc' },
      { id: 6, title: 'Lecture 6: Trees and Graphs', duration: '2h', completed: false, url: 'https://www.youtube.com/embed/1yrh60og6qc' },
    ],
    documents: savedNotes || [
      { id: 1, title: 'Unit 1: Complexity Notes.pdf', size: '2.4 MB', type: 'PDF', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      { id: 2, title: 'Unit 2: Linear Data Structures.pdf', size: '3.1 MB', type: 'PDF', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      { id: 3, title: 'Cheat Sheet: Big O Notation.pdf', size: '1.1 MB', type: 'PDF', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    ],
    assignments: savedAssignments || [
      { id: 101, title: 'Build a React Portfolio', type: 'Project', format: 'GitHub Repo Submission', status: 'Upcoming' },
      { id: 102, title: 'Data Structures Problem Set', type: 'Homework', format: 'PDF Upload', status: 'Ended' }
    ]
  };

  const openFile = (file) => {
    let finalUrl = file.url;
    if (!finalUrl) {
      if (file.type?.includes('pdf') || file.title?.includes('.pdf')) {
        const dummyHtml = `<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;color:#666;background:#f9fafb;"><h2>This is a dummy file. Upload a real file in the Faculty portal.</h2></body></html>`;
        finalUrl = URL.createObjectURL(new Blob([dummyHtml], {type: 'text/html'}));
      } else {
        finalUrl = 'https://www.youtube.com/embed/1yrh60og6qc';
      }
    } else if (finalUrl.startsWith('data:')) {
      // Chrome blocks data:application/pdf in iframes. Convert back to local blob to fix this.
      try {
        const arr = finalUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], {type: mime});
        finalUrl = URL.createObjectURL(blob);
      } catch (e) {
        console.error("Failed to convert data URL to blob", e);
      }
    }
    setActiveFile({ ...file, url: finalUrl });
  };

  const getFileIcon = (lec) => {
    if (lec.completed) return <CheckCircle2 className="w-5 h-5" />;
    const type = lec.type;
    if (!type) return <PlayCircle className="w-5 h-5 ml-0.5" />;
    if (type.includes('video') || type.includes('audio')) return <PlayCircle className="w-5 h-5 ml-0.5" />;
    if (type.includes('image')) return <ImageIcon className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const getDocIcon = (type) => {
    if (!type) return <FileText className="w-5 h-5" />;
    if (type.includes('video') || type.includes('audio')) return <PlayCircle className="w-5 h-5 ml-0.5" />;
    if (type.includes('image')) return <ImageIcon className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Back Button & Header */}
      <div>
        <button 
          onClick={() => navigate('/student/courses')}
          className="flex items-center text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Courses
        </button>
        
        <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="absolute left-0 bottom-0 w-40 h-40 bg-indigo-900/40 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                 {course.tags.map((tag, i) => (
                   <span key={i} className="text-[10px] font-semibold text-indigo-900 bg-indigo-100 px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
                     {tag}
                   </span>
                 ))}
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold mb-2">{course.title}</h1>
              <p className="text-indigo-100 text-sm md:text-base font-medium flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Instructed by {course.professor}
              </p>
            </div>
            
            <div className="bg-black/20 backdrop-blur-md border border-white/20 p-5 rounded-2xl w-full md:w-64 shrink-0">
               <div className="flex justify-between items-end mb-2">
                 <span className="text-[11px] font-semibold text-indigo-100 uppercase tracking-wider">Course Progress</span>
                 <span className="text-lg font-semibold">{course.progress}%</span>
               </div>
               <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                 <div className="h-full bg-green-400 rounded-full" style={{ width: `${course.progress}%` }}></div>
               </div>
               <button className="w-full mt-4 py-2 bg-white text-indigo-600 text-sm font-semibold rounded-lg hover:bg-indigo-50 transition-colors">
                 Resume Course
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Main Content (Left) */}
        <div className="lg:w-2/3 space-y-6">
           <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 md:p-6">
              
              {/* Tabs */}
              <div className="flex gap-6 md:gap-8 border-b border-gray-100 mb-6 overflow-x-auto whitespace-nowrap pb-1 no-scrollbar">
                <button 
                  onClick={() => setActiveTab('lectures')}
                  className={`pb-4 text-[15px] font-semibold transition-all relative ${
                    activeTab === 'lectures' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span className="flex items-center gap-2"><Video className="w-4 h-4" /> Video Lectures</span>
                  {activeTab === 'lectures' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
                </button>
                <button 
                  onClick={() => setActiveTab('documentation')}
                  className={`pb-4 text-[15px] font-semibold transition-all relative ${
                    activeTab === 'documentation' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Documentation & PDFs</span>
                  {activeTab === 'documentation' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
                </button>
                <button 
                  onClick={() => setActiveTab('assignments')}
                  className={`pb-4 text-[15px] font-semibold transition-all relative ${
                    activeTab === 'assignments' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span className="flex items-center gap-2"><FileCode className="w-4 h-4" /> Assignments</span>
                  {activeTab === 'assignments' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
                </button>
                <button 
                  onClick={() => setActiveTab('contests')}
                  className={`pb-4 text-[15px] font-semibold transition-all relative ${
                    activeTab === 'contests' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span className="flex items-center gap-2"><Trophy className="w-4 h-4" /> Contests & Reports</span>
                  {activeTab === 'contests' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'lectures' ? (
                <div className="space-y-3">
                  {course.lectures.map((lec) => (
                    <div 
                      key={lec.id} 
                      onClick={() => openFile(lec)}
                      className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group"
                    >
                       <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                           lec.completed ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                         } transition-colors`}>
                           {getFileIcon(lec)}
                         </div>
                         <div>
                           <h4 className={`text-[14px] font-semibold ${lec.completed ? 'text-gray-900' : 'text-gray-700 group-hover:text-blue-600'} transition-colors`}>
                             {lec.title}
                           </h4>
                           <p className="text-[12px] font-medium text-gray-400 mt-0.5">{lec.duration}</p>
                         </div>
                       </div>
                       <button 
                         onClick={(e) => { e.stopPropagation(); openFile(lec); }}
                         className={`px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                         lec.completed ? 'text-gray-400 bg-gray-50 hover:bg-gray-100' : 'text-blue-600 bg-blue-50 hover:bg-blue-100 opacity-0 group-hover:opacity-100'
                       }`}>
                         {lec.completed ? 'Watch Again' : (lec.type?.includes('image') ? 'View Image' : (lec.type?.includes('video') || lec.type?.includes('audio') || !lec.type) ? 'Play Video' : 'Open')}
                       </button>
                    </div>
                  ))}
                </div>
              ) : activeTab === 'documentation' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {course.documents.map((doc) => (
                    <div 
                      key={doc.id} 
                      onClick={() => openFile(doc)}
                      className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all cursor-pointer group"
                    >
                       <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                         {getDocIcon(doc.type)}
                       </div>
                       <div className="flex-1">
                         <h4 className="text-[14px] font-semibold text-gray-900 group-hover:text-orange-600 transition-colors leading-tight mb-1">
                           {doc.title}
                         </h4>
                         <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{doc.type?.split('/').pop() || doc.type} • {doc.size}</p>
                       </div>
                       <button 
                         onClick={(e) => { e.stopPropagation(); openFile(doc); }}
                         className="text-gray-400 hover:text-orange-600 transition-colors"
                       >
                         <Download className="w-5 h-5" />
                       </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {course.assignments.map((assignment) => (
                    <div key={assignment.id} className="p-5 rounded-xl border border-gray-100 bg-gray-50/30 hover:bg-white hover:border-purple-200 hover:shadow-md transition-all group">
                       <div className="flex justify-between items-start mb-2">
                         <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase border bg-purple-50 text-purple-700 border-purple-200">
                           {assignment.type}
                         </span>
                         <span className="text-[11px] font-semibold tracking-wider uppercase text-gray-400">
                           {assignment.status || 'Upcoming'}
                         </span>
                       </div>
                       <h4 className="text-[16px] font-semibold text-gray-900 mb-1 leading-tight group-hover:text-purple-600 transition-colors">{assignment.title}</h4>
                       <p className="text-[13px] font-medium text-gray-500 mb-2">{assignment.format}</p>
                       
                       {assignment.deadline && (
                         <p className="text-[11px] font-semibold text-red-500 mb-4 bg-red-50 inline-block px-2 py-0.5 rounded border border-red-100">
                           Due: {new Date(assignment.deadline).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                         </p>
                       )}
                       
                       <div className="flex gap-3 mt-2">
                         {assignment.url && (
                           <button onClick={() => openFile({ url: assignment.url, title: assignment.title, type: assignment.fileType })} className="px-4 py-2 rounded-lg text-[13px] font-semibold bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition-colors shadow-sm">
                             View Doc
                           </button>
                         )}
                         <label className="flex-1 text-center cursor-pointer px-5 py-2 rounded-lg text-[13px] font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-sm">
                           Start Submission
                           <input 
                             type="file" 
                             className="hidden" 
                             onChange={(e) => {
                               if (e.target.files[0]) {
                                 alert(`File "${e.target.files[0].name}" submitted successfully!`);
                                 e.target.value = ''; // Reset so they can upload again if needed
                               }
                             }}
                           />
                         </label>
                       </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'contests' && (
                <div className="space-y-6">
                  {/* Upcoming Contests */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-orange-500" /> Upcoming Contests</h3>
                    {upcomingContests.length === 0 ? (
                      <p className="text-sm text-gray-500 py-4 text-center">No upcoming contests.</p>
                    ) : (
                      <div className="flex flex-col gap-[1px] bg-gray-200 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                        {upcomingContests.map((contest) => (
                          <div key={contest.id} className="bg-white p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div>
                              <h4 className="text-[15px] font-semibold text-gray-900 mb-1">{contest.title}</h4>
                              <p className="text-[13px] text-gray-500">{contest.type} • {contest.duration}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-orange-50 text-orange-600 border border-orange-100">
                                {contest.status}
                              </span>
                              <button onClick={() => navigate(`/student/contests/${contest.id}`)} className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800">
                                View Details
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Past Contests & Reports */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4 mt-6 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Past Tests & Reports</h3>
                    {pastContests.length === 0 ? (
                      <p className="text-sm text-gray-500 py-4 text-center">No past tests.</p>
                    ) : (
                      <div className="flex flex-col gap-[1px] bg-gray-200 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                        {pastContests.map((contest) => (
                          <div key={contest.id} className="bg-white p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div>
                              <h4 className="text-[15px] font-semibold text-gray-900 mb-1">{contest.title}</h4>
                              <p className="text-[13px] text-gray-500">{contest.type} • Score: <span className="font-semibold text-gray-700">{contest.score}</span></p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
                                Completed
                              </span>
                              <button onClick={() => navigate(`/student/contests/${contest.id}`)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                                View Report
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

           </div>
        </div>

        {/* Sidebar (Right) */}
        <div className="lg:w-1/3 space-y-6">
           {/* Quick Actions */}
           <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 md:p-6">
             <h3 className="text-[16px] font-semibold text-gray-900 mb-5">
               Quick Actions
             </h3>
             <div className="grid grid-cols-2 gap-[1px] bg-gray-100 border border-gray-100 rounded-xl overflow-hidden">
               <button 
                 onClick={() => setActiveTab('contests')}
                 className="flex flex-col items-center justify-center py-4 bg-[#c9d6ef] hover:opacity-90 transition-opacity"
               >
                 <AlertCircle className="w-5 h-5 text-blue-600 mb-2" strokeWidth={2.5} />
                 <span className="text-[12px] font-semibold text-blue-600">Upcoming Contests</span>
               </button>
               <button 
                 onClick={() => navigate('/student/question-bank')}
                 className="flex flex-col items-center justify-center py-4 bg-[#d6c8ed] hover:opacity-90 transition-opacity"
               >
                 <Library className="w-5 h-5 text-purple-600 mb-2" strokeWidth={2.5} />
                 <span className="text-[12px] font-semibold text-purple-600">Question Bank</span>
               </button>
             </div>
           </div>

           {/* Course Assignments */}
           <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 md:p-6">
             <h3 className="text-[16px] font-semibold text-gray-900 mb-5 flex items-center gap-2">
               <FileCode className="w-5 h-5 text-purple-600" /> Course Assignments
             </h3>
             
             <div className="space-y-4">
               {course.assignments.map((assignment) => (
                 <div key={assignment.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-purple-200 hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2 py-0.5 rounded text-[9px] font-semibold tracking-wider uppercase border bg-purple-50 text-purple-700 border-purple-200">
                        {assignment.type}
                      </span>
                      <span className="text-[10px] font-semibold tracking-wider uppercase text-gray-400">
                        {assignment.status}
                      </span>
                    </div>
                    <h4 className="text-[14px] font-semibold text-gray-900 mb-1 leading-tight group-hover:text-purple-600 transition-colors">{assignment.title}</h4>
                    <p className="text-[12px] font-medium text-gray-500 mb-4">{assignment.format}</p>
                    
                    <button 
                      onClick={() => navigate('/student/assignments')}
                      className="w-full py-2.5 rounded-lg text-[12px] font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-100 transition-colors"
                    >
                      View Details
                    </button>
                 </div>
               ))}
             </div>
           </div>

           {/* Quick Notes */}
           <div className="bg-white border border-gray-100 rounded-2xl p-4 md:p-6 shadow-sm flex flex-col h-[400px]">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-[16px] font-semibold text-gray-900 flex items-center gap-2"><CheckSquare className="w-5 h-5 text-green-600" /> Quick Notes</h3>
             </div>

             <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 scrollbar-thin scrollbar-thumb-gray-200">
               {notes.length === 0 ? (
                 <p className="text-sm text-gray-400 text-center py-4">No notes added yet.</p>
               ) : (
                 notes.map(note => (
                   <div key={note.id} className="group bg-gray-50 border border-gray-100 rounded-lg p-3 relative hover:border-gray-200 transition-colors">
                     {editingNoteId === note.id ? (
                       <div className="flex flex-col gap-2">
                         <input
                           type="text"
                           value={editingNoteText}
                           onChange={(e) => setEditingNoteText(e.target.value)}
                           className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-green-500"
                           autoFocus
                         />
                         <div className="flex items-center gap-2">
                           <input
                             type="datetime-local"
                             value={editingNoteTime}
                             onChange={(e) => setEditingNoteTime(e.target.value)}
                             className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-500 focus:outline-none focus:border-green-500"
                           />
                           <button onClick={() => saveEdit(note.id)} className="text-green-600 hover:text-green-700 bg-green-50 px-2 py-1 rounded">
                             <Save className="w-4 h-4" />
                           </button>
                           <button onClick={() => setEditingNoteId(null)} className="text-gray-400 hover:text-gray-600 bg-gray-100 px-2 py-1 rounded">
                             <X className="w-4 h-4" />
                           </button>
                         </div>
                       </div>
                     ) : (
                       <div className="flex justify-between items-start gap-2">
                         <div className="flex-1">
                           <p className="text-sm text-gray-700 leading-snug break-words mb-1.5">{note.text}</p>
                           {note.reminderTime && (
                             <p className="text-[10px] font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full inline-block border border-green-200">
                               Reminder: {new Date(note.reminderTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                             </p>
                           )}
                         </div>
                         <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
                           <button
                             onClick={() => { setEditingNoteId(note.id); setEditingNoteText(note.text); setEditingNoteTime(note.reminderTime || ''); }}
                             className="p-1 text-gray-400 hover:text-blue-600 rounded"
                           >
                             <Edit3 className="w-3.5 h-3.5" />
                           </button>
                           <button
                             onClick={() => deleteNote(note.id)}
                             className="p-1 text-gray-400 hover:text-red-600 rounded"
                           >
                             <Trash2 className="w-3.5 h-3.5" />
                           </button>
                         </div>
                       </div>
                     )}
                   </div>
                 ))
               )}
             </div>

             <form onSubmit={addNote} className="flex flex-col gap-2 mt-auto">
               <input
                 type="text"
                 value={newNote}
                 onChange={(e) => setNewNote(e.target.value)}
                 placeholder="Type a new note..."
                 className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:bg-white focus:border-green-500 transition-colors"
               />
               <div className="flex gap-2">
                 <input
                   type="datetime-local"
                   value={newNoteTime}
                   onChange={(e) => setNewNoteTime(e.target.value)}
                   className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:bg-white focus:border-green-500 text-gray-500"
                 />
                 <button
                   type="submit"
                   className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors flex items-center justify-center font-semibold"
                   disabled={!newNote.trim()}
                 >
                   <Plus className="w-4 h-4" />
                 </button>
               </div>
             </form>
           </div>
        </div>
      </div>

      {/* File Viewer Modal */}
      {activeFile && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-lg truncate max-w-[80%]">{activeFile.title}</h3>
              <button onClick={() => setActiveFile(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                 <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 bg-gray-50 flex items-center justify-center p-4 relative" style={{ minHeight: '60vh' }}>
              {activeFile.url?.includes('youtube.com') ? (
                <iframe 
                  src={activeFile.url} 
                  title={activeFile.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-[70vh] rounded-lg shadow-sm bg-black border-0"
                />
              ) : (activeFile.type?.includes('video') || activeFile.type?.includes('audio') || activeFile.title?.match(/\.(mp4|webm|ogg|mkv|avi|mov)$/i) || (!activeFile.type && activeFile.title?.includes('Lecture'))) ? (
                <video 
                  src={activeFile.url} 
                  controls 
                  autoPlay 
                  className="w-full max-h-[70vh] rounded-lg shadow-sm bg-black"
                >
                  <source src={activeFile.url} />
                  Your browser does not support the video tag.
                </video>
              ) : activeFile.type?.includes('image') ? (
                <img src={activeFile.url} alt={activeFile.title} className="max-w-full max-h-full object-contain" />
              ) : (
                <iframe src={activeFile.url} className="w-full h-full border-0" title={activeFile.title} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
