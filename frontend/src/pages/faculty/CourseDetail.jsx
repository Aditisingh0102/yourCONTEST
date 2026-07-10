import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Video, FileText, PlayCircle, ChevronLeft, FileCode, UploadCloud, Plus, Trash2, ExternalLink, Image as ImageIcon, X, Users, CheckSquare, Save, Edit3, PlusCircle, Library, FileCheck, BarChart2, Trophy, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getContests } from '../../api';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('lectures'); // lectures, notes, assignments


  const courseBaseDetails = {
    '1': { title: 'Full-Stack Web Development', professor: 'Dr. Sarah Jenkins', progress: 65, tags: ['React', 'Node.js', 'MongoDB'], status: 'Published' },
    '2': { title: 'Data Structures in Java', professor: 'Prof. Alan Turing', progress: 30, tags: ['Java', 'Algorithms', 'DSA'], status: 'Published' },
    '3': { title: 'Machine Learning Basics', professor: 'Dr. Andrew Ng', progress: 100, tags: ['Python', 'AI', 'TensorFlow'], status: 'Draft' },
    '4': { title: 'Cloud Computing with AWS', professor: 'Ms. Emily Chen', progress: 10, tags: ['AWS', 'DevOps', 'Cloud'], status: 'Published' },
    '5': { title: 'Advanced Database Systems', professor: 'Dr. Robert Smith', progress: 0, tags: ['SQL', 'Postgres', 'Redis'], status: 'Published' },
    '6': { title: 'Operating Systems Core', professor: 'Dr. Linus Torvalds', progress: 100, tags: ['C', 'Linux', 'OS'], status: 'Published' },
    '7': { title: 'Cybersecurity Fundamentals', professor: 'Prof. Kevin Mitnick', progress: 15, tags: ['Security', 'Network', 'Ethics'], status: 'Published' },
  };

  const base = courseBaseDetails[id] || courseBaseDetails['1'];

  const [course, setCourse] = useState(() => {
    const saved = localStorage.getItem(`course_${id}_details`);
    return saved ? JSON.parse(saved) : { ...base };
  });

  useEffect(() => {
    localStorage.setItem(`course_${id}_details`, JSON.stringify(course));
  }, [course, id]);

  const [lectures, setLectures] = useState(() => {
    const saved = sessionStorage.getItem(`course_${id}_lectures`);
    if (saved && saved !== 'null') {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(item => ({
            ...item,
            url: item.url?.startsWith('blob:') ? null : item.url
          }));
        }
      } catch (e) { console.error("Failed to parse lectures", e); }
    }
    return [
      { id: 1, title: 'Lecture 1: Introduction', duration: '45 mins', type: 'video/mp4', url: 'https://www.youtube.com/embed/1yrh60og6qc' },
      { id: 2, title: 'Lecture 2: Core Concepts', duration: '55 mins', type: 'video/mp4', url: 'https://www.youtube.com/embed/1yrh60og6qc' },
      { id: 3, title: 'Lecture 3: Advanced Techniques', duration: '1h 10m', type: 'video/mp4', url: 'https://www.youtube.com/embed/1yrh60og6qc' },
      { id: 4, title: 'Lecture 4: Real-world Applications', duration: '50 mins', type: 'video/mp4', url: 'https://www.youtube.com/embed/1yrh60og6qc' },
      { id: 5, title: 'Lecture 5: Best Practices', duration: '1h 5m', type: 'video/mp4', url: 'https://www.youtube.com/embed/1yrh60og6qc' },
      { id: 6, title: 'Lecture 6: Summary and Q&A', duration: '1h 30m', type: 'video/mp4', url: 'https://www.youtube.com/embed/1yrh60og6qc' },
    ];
  });

  const [notes, setNotes] = useState(() => {
    const saved = sessionStorage.getItem(`course_${id}_notes`);
    if (saved && saved !== 'null') {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(item => ({
            ...item,
            url: item.url?.startsWith('blob:') ? null : item.url
          }));
        }
      } catch (e) { console.error("Failed to parse notes", e); }
    }
    return [
      { id: 1, title: 'Unit 1 Notes.pdf', size: '2.4 MB', type: 'application/pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      { id: 2, title: 'Unit 2 Notes.pdf', size: '3.1 MB', type: 'application/pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      { id: 3, title: 'Cheat Sheet.pdf', size: '1.2 MB', type: 'application/pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      { id: 4, title: 'Case Study.pdf', size: '4.5 MB', type: 'application/pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    ];
  });

  const [assignments, setAssignments] = useState(() => {
    const saved = sessionStorage.getItem(`course_${id}_assignments`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error("Failed to parse assignments", e); }
    }
    return [
      { id: 101, title: 'Build a React Portfolio', type: 'Project', format: 'GitHub Repo Submission', status: 'Upcoming' },
      { id: 102, title: 'Data Structures Problem Set', type: 'Homework', format: 'PDF Upload', status: 'Ended' }
    ];
  });

  const [activeFile, setActiveFile] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', duration: '', file: null });
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentData, setAssignmentData] = useState({ title: '', type: 'Project', format: 'GitHub Repo Submission', file: null, deadline: '' });
  const [assignmentError, setAssignmentError] = useState('');
  
  const [upcomingContests, setUpcomingContests] = useState([]);
  const [pastContests, setPastContests] = useState([]);

  useEffect(() => {
    getContests().then(res => {
      const filtered = res.data.filter(c => !c.courseId || c.courseId === 'All' || c.courseId === id);
      setUpcomingContests(filtered.filter(c => c.status === 'Upcoming' || c.status === 'Live'));
      setPastContests(filtered.filter(c => c.status === 'Completed' || c.status === 'Past'));
    }).catch(console.error);
  }, [id]);

  const [quickNotes, setQuickNotes] = useState(() => {
    const saved = sessionStorage.getItem(`faculty_course_${id}_quicknotes`);
    return saved ? JSON.parse(saved) : [];
  });
  const [newQuickNote, setNewQuickNote] = useState('');
  const [newQuickNoteTime, setNewQuickNoteTime] = useState('');
  const [editingQuickNoteId, setEditingQuickNoteId] = useState(null);
  const [editingQuickNoteText, setEditingQuickNoteText] = useState('');
  const [editingQuickNoteTime, setEditingQuickNoteTime] = useState('');

  useEffect(() => {
    sessionStorage.setItem(`faculty_course_${id}_quicknotes`, JSON.stringify(quickNotes));
  }, [quickNotes, id]);

  const addQuickNote = (e) => {
    e.preventDefault();
    if (!newQuickNote.trim()) return;
    setQuickNotes([{ id: Date.now(), text: newQuickNote, reminderTime: newQuickNoteTime }, ...quickNotes]);
    setNewQuickNote('');
    setNewQuickNoteTime('');
  };

  const deleteQuickNote = (id) => {
    setQuickNotes(quickNotes.filter(n => n.id !== id));
  };

  const saveQuickEdit = (id) => {
    if (!editingQuickNoteText.trim()) return;
    setQuickNotes(quickNotes.map(n => n.id === id ? { ...n, text: editingQuickNoteText, reminderTime: editingQuickNoteTime } : n));
    setEditingQuickNoteId(null);
  };
  
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [showCourseAnalytics, setShowCourseAnalytics] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const mockSubmissions = [
    { id: 1, name: 'Aditi Singh', rollNo: '2023CSE1042', status: 'Submitted', time: '2 mins ago', file: 'portfolio_aditi.pdf', grade: '-' },
    { id: 2, name: 'Ambar', rollNo: '2023CSE1043', status: 'Submitted', time: '1 hour ago', file: 'project_ambar.zip', grade: '95/100' },
    { id: 3, name: 'Rahul Sharma', rollNo: '2023CSE1045', status: 'Pending', time: '-', file: null, grade: '-' },
    { id: 4, name: 'Sneha Gupta', rollNo: '2023CSE1046', status: 'Submitted', time: 'Yesterday', file: 'assignment_final.pdf', grade: '88/100' },
  ];

  useEffect(() => {
    sessionStorage.setItem(`course_${id}_lectures`, JSON.stringify(lectures));
  }, [lectures, id]);

  useEffect(() => {
    sessionStorage.setItem(`course_${id}_notes`, JSON.stringify(notes));
  }, [notes, id]);

  useEffect(() => {
    sessionStorage.setItem(`course_${id}_assignments`, JSON.stringify(assignments));
  }, [assignments, id]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadData(prev => ({ ...prev, file, title: prev.title || file.name }));
    }
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    const { file, title, duration } = uploadData;
    if (!file) return alert("Please select a file.");

    const fileType = file.type || (activeTab === 'lectures' ? 'video/mp4' : 'application/pdf');
    let formattedDuration = duration ? duration.trim() : 'New Upload';
    if (/^\d+$/.test(formattedDuration)) {
      formattedDuration += ' mins';
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Note: File is over 2MB. It will be temporarily saved and might not open in the Student Tab. For cross-tab testing, upload a smaller file.");
      const fileUrl = URL.createObjectURL(file);
      const newFile = {
        id: Date.now(),
        title: title || file.name,
        type: fileType,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        url: fileUrl,
        duration: formattedDuration
      };
      if (activeTab === 'lectures') setLectures([...lectures, newFile]);
      else if (activeTab === 'notes') setNotes([...notes, newFile]);
      setShowUploadModal(false);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const newFile = {
        id: Date.now(),
        title: title || file.name,
        type: fileType,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        url: reader.result,
        duration: formattedDuration
      };

      if (activeTab === 'lectures') {
        setLectures([...lectures, newFile]);
      } else if (activeTab === 'notes') {
        setNotes([...notes, newFile]);
      }
      setShowUploadModal(false);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    setUploadData({ title: '', duration: '', file: null });
    setShowUploadModal(true);
  };

  const handleAssignmentSubmit = (e) => {
    e.preventDefault();
    if (!assignmentData.title) return alert("Please enter a title");
    
    if (assignmentData.deadline) {
      if (new Date(assignmentData.deadline) < new Date()) {
        return alert("Error: The deadline date and time cannot be in the past.");
      }
    }
    
    const finalizeSubmit = (url, size, type) => {
      const newAssignment = {
        id: Date.now(),
        title: assignmentData.title,
        type: assignmentData.type,
        format: assignmentData.format,
        deadline: assignmentData.deadline,
        status: 'Upcoming',
        url: url,
        fileSize: size,
        fileType: type
      };
      
      setAssignments([...assignments, newAssignment]);
      setShowAssignmentModal(false);
    };

    if (assignmentData.file) {
      const file = assignmentData.file;
      if (file.size > 2 * 1024 * 1024) {
        alert("Note: File is over 2MB. It will be temporarily saved.");
        finalizeSubmit(URL.createObjectURL(file), (file.size / (1024 * 1024)).toFixed(2) + ' MB', file.type);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          finalizeSubmit(reader.result, (file.size / (1024 * 1024)).toFixed(2) + ' MB', file.type);
        };
        reader.readAsDataURL(file);
      }
    } else {
      finalizeSubmit(null, null, null);
    }
  };

  const handleDelete = (type, itemId) => {
    if (type === 'lecture') setLectures(lectures.filter(l => l.id !== itemId));
    if (type === 'note') setNotes(notes.filter(n => n.id !== itemId));
    if (type === 'assignment') setAssignments(assignments.filter(a => a.id !== itemId));
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

  const getFileIcon = (type) => {
    if (!type) return <FileText className="w-5 h-5" />;
    if (type.includes('video') || type.includes('audio')) return <PlayCircle className="w-5 h-5 ml-0.5" />;
    if (type.includes('image')) return <ImageIcon className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  return (
    <div className="max-w-[1200px] mx-auto py-6 space-y-6">
      
      {/* Back Button & Header */}
      <div>
        <button 
          onClick={() => navigate('/faculty/course-hub')}
          className="flex items-center text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Course Hub
        </button>
        
        <div className="dashboard-banner bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="absolute left-0 bottom-0 w-40 h-40 bg-blue-900/40 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex gap-2 mb-4">
                 {course.tags.map((tag, i) => (
                   <span key={i} className="text-[10px] font-semibold text-blue-900 bg-blue-100 px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
                     {tag}
                   </span>
                 ))}
                 <span className={`text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-wider shadow-sm border ${course.status === 'Published' ? 'bg-green-500 text-white border-green-400' : 'bg-white/20 text-white border-white/30 backdrop-blur-md'}`}>
                   {course.status}
                 </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold mb-2">{course.title}</h1>
              <p className="text-blue-100 text-sm md:text-base font-medium flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Manage your course content
              </p>
            </div>
            
            <div className="bg-black/20 backdrop-blur-md border border-white/20 p-5 rounded-2xl w-full md:w-64 shrink-0">
               <div className="flex justify-between items-center mb-3">
                 <span className="text-[11px] font-semibold text-blue-100 uppercase tracking-wider">Total Lectures</span>
                 <span className="text-lg font-semibold">{lectures.length}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-[11px] font-semibold text-blue-100 uppercase tracking-wider">Total Notes</span>
                 <span className="text-lg font-semibold">{notes.length}</span>
               </div>
               <button 
                 onClick={triggerFileInput}
                 className="w-full mt-4 py-2 bg-white text-blue-600 flex items-center justify-center gap-2 text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
               >
                 <UploadCloud className="w-4 h-4" /> Upload Material
               </button>
               <button 
                 onClick={() => setCourse({...course, status: course.status === 'Published' ? 'Draft' : 'Published'})}
                 className={`w-full mt-2 py-2 flex items-center justify-center gap-2 text-sm font-semibold rounded-lg transition-colors border shadow-sm ${course.status === 'Published' ? 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700' : 'bg-green-500 text-white border-green-600 hover:bg-green-600'}`}
               >
                 {course.status === 'Published' ? 'Unpublish Course' : 'Publish Course'}
               </button>
               {/* Hidden file input removed, using modal now */}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Main Content (Left) */}
        <div className="lg:w-2/3 space-y-6">
           <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
              
              {/* Tabs */}
              <div className="flex gap-8 border-b border-gray-100 mb-6 overflow-x-auto no-scrollbar">
                <button 
                  onClick={() => setActiveTab('lectures')}
                  className={`pb-4 text-[15px] font-semibold transition-all whitespace-nowrap relative ${
                    activeTab === 'lectures' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span className="flex items-center gap-2"><Video className="w-4 h-4" /> Video Lectures</span>
                  {activeTab === 'lectures' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
                </button>
                <button 
                  onClick={() => setActiveTab('notes')}
                  className={`pb-4 text-[15px] font-semibold transition-all whitespace-nowrap relative ${
                    activeTab === 'notes' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Notes & PDFs</span>
                  {activeTab === 'notes' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
                </button>
                <button 
                  onClick={() => setActiveTab('assignments')}
                  className={`pb-4 text-[15px] font-semibold transition-all whitespace-nowrap relative ${
                    activeTab === 'assignments' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span className="flex items-center gap-2"><FileCode className="w-4 h-4" /> Assignments</span>
                  {activeTab === 'assignments' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
                </button>
                <button 
                  onClick={() => setActiveTab('contests')}
                  className={`pb-4 text-[15px] font-semibold transition-all whitespace-nowrap relative ${
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
                  {lectures.length === 0 ? (
                     <div className="text-center py-10">
                       <p className="text-gray-500 text-sm">No lectures uploaded yet.</p>
                     </div>
                  ) : lectures.map((lec) => (
                    <div key={lec.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                       <div className="flex items-center gap-4 cursor-pointer" onClick={() => openFile(lec)}>
                         <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-blue-100 text-blue-600 transition-colors">
                           {getFileIcon(lec.type)}
                         </div>
                         <div>
                           <h4 className="text-[14px] font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                             {lec.title}
                           </h4>
                           <p className="text-[12px] font-medium text-gray-400 mt-0.5">{lec.duration}</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-2">
                         <button onClick={() => openFile(lec)} className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center gap-1.5">
                           <ExternalLink className="w-3.5 h-3.5" /> Open
                         </button>
                         <button onClick={() => handleDelete('lecture', lec.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                    </div>
                  ))}
                  <button onClick={() => { setActiveTab('lectures'); triggerFileInput(); }} className="w-full mt-2 py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-semibold text-sm hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 flex items-center justify-center gap-2 transition-all">
                    <Plus className="w-4 h-4" /> Add New Lecture Video
                  </button>
                </div>
              ) : activeTab === 'notes' ? (
                <div className="space-y-3">
                  {notes.length === 0 ? (
                     <div className="text-center py-10">
                       <p className="text-gray-500 text-sm">No notes uploaded yet.</p>
                     </div>
                  ) : notes.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all group">
                       <div className="flex items-center gap-4 cursor-pointer" onClick={() => openFile(doc)}>
                         <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                           {getFileIcon(doc.type)}
                         </div>
                         <div>
                           <h4 className="text-[14px] font-semibold text-gray-900 group-hover:text-orange-600 transition-colors leading-tight mb-1">
                             {doc.title}
                           </h4>
                           <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{doc.type?.split('/').pop() || 'File'} • {doc.size}</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-2">
                         <button onClick={() => openFile(doc)} className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors flex items-center gap-1.5">
                           <ExternalLink className="w-3.5 h-3.5" /> Open
                         </button>
                         <button onClick={() => handleDelete('note', doc.id)} className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                    </div>
                  ))}
                  <button onClick={() => { setActiveTab('notes'); triggerFileInput(); }} className="w-full mt-2 py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-semibold text-sm hover:bg-gray-50 hover:border-orange-300 hover:text-orange-600 flex items-center justify-center gap-2 transition-all">
                    <Plus className="w-4 h-4" /> Upload Note/PDF
                  </button>
                </div>
              ) : activeTab === 'assignments' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">Course Assignments</h3>
                    <button 
                      onClick={() => {
                        setAssignmentData({ title: '', type: 'Project', format: 'GitHub Repo Submission', file: null, deadline: '' });
                        setAssignmentError('');
                        setShowAssignmentModal(true);
                      }}
                      className="flex items-center gap-1.5 text-sm font-semibold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Create Assignment
                    </button>
                  </div>
                  {assignments.map((test) => (
                    <div key={test.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-purple-200 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <span className="px-2 py-0.5 rounded text-[9px] font-semibold tracking-wider uppercase border bg-purple-50 text-purple-700 border-purple-200">
                            {test.type}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-semibold tracking-wider uppercase text-gray-400">
                              {test.status}
                            </span>
                            <button onClick={() => handleDelete('assignment', test.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                       <h4 className="text-[14px] font-semibold text-gray-900 mb-1 leading-tight">{test.title}</h4>
                       <p className="text-[12px] font-medium text-gray-500 mb-2">{test.format}</p>
                       {test.deadline && (
                         <p className="text-[11px] font-semibold text-red-500 mb-4 bg-red-50 inline-block px-2 py-0.5 rounded border border-red-100">
                           Due: {new Date(test.deadline).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                         </p>
                       )}
                       <div className="flex gap-2 mt-2">
                         {test.url && (
                           <button onClick={() => openFile({ url: test.url, title: test.title, type: test.fileType })} className="flex-1 py-2 rounded-lg text-[11px] font-semibold bg-blue-50 border border-blue-100 text-blue-700 hover:bg-blue-100 transition-colors">
                             Open Doc
                           </button>
                         )}
                         <button className="flex-1 py-2 rounded-lg text-[11px] font-semibold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                           Edit
                         </button>
                         <button onClick={() => { setSelectedAssignment(test); setShowSubmissionsModal(true); }} className="flex-1 py-2 rounded-lg text-[11px] font-semibold bg-purple-50 border border-purple-100 text-purple-700 hover:bg-purple-100 transition-colors">
                           Submissions
                         </button>
                       </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {activeTab === 'contests' && (
                <div className="space-y-6">
                  {/* Upcoming Contests */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-orange-500" /> Scheduled Contests</h3>
                    {upcomingContests.length === 0 ? (
                      <p className="text-sm text-gray-500 py-4 text-center">No upcoming contests scheduled.</p>
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
                              <button onClick={() => navigate(`/faculty/contest/${contest.id}`)} className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800">
                                Manage
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Past Contests & Reports */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4 mt-6 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Past Contests & Reports</h3>
                    {pastContests.length === 0 ? (
                      <p className="text-sm text-gray-500 py-4 text-center">No past contests.</p>
                    ) : (
                      <div className="flex flex-col gap-[1px] bg-gray-200 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                        {pastContests.map((contest) => (
                          <div key={contest.id} className="bg-white p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div>
                              <h4 className="text-[15px] font-semibold text-gray-900 mb-1">{contest.title}</h4>
                              <p className="text-[13px] text-gray-500">{contest.type} • Avg Score: <span className="font-semibold text-gray-700">{contest.averageScore}</span></p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
                                Completed
                              </span>
                              <button onClick={() => navigate(`/faculty/contest/${contest.id}/report`)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
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

        {/* Sidebar (Right) - Quick Stats/Actions */}
        <div className="lg:w-1/3 space-y-6">
           {/* Quick Actions (Contest Section) */}
           <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
             <h3 className="text-[16px] font-semibold text-gray-900 mb-5">
               Quick Actions
             </h3>
             <div className="grid grid-cols-2 grid-rows-2 gap-[1px] bg-gray-100 border border-gray-100 rounded-xl overflow-hidden">
               <button 
                 onClick={() => navigate('/faculty/create-contest')}
                 className="flex flex-col items-center justify-center py-4 bg-[#c9d6ef] hover:opacity-90 transition-opacity"
               >
                 <PlusCircle className="w-5 h-5 text-[#c06518] mb-2" strokeWidth={2.5} />
                 <span className="text-[12px] font-semibold text-[#c06518]">New Contest</span>
               </button>
               <button 
                 onClick={() => navigate('/faculty/question-bank')}
                 className="flex flex-col items-center justify-center py-4 bg-[#d6c8ed] hover:opacity-90 transition-opacity"
               >
                 <Library className="w-5 h-5 text-purple-600 mb-2" strokeWidth={2.5} />
                 <span className="text-[12px] font-semibold text-purple-600">Question Bank</span>
               </button>
               <button 
                 onClick={() => setActiveTab('assignments')}
                 className="flex flex-col items-center justify-center py-4 bg-[#f0cdb6] hover:opacity-90 transition-opacity"
               >
                 <FileCheck className="w-5 h-5 text-[#d94d1a] mb-2" strokeWidth={2.5} />
                 <span className="text-[12px] font-semibold text-[#d94d1a]">Submissions</span>
               </button>
                <button 
                  onClick={() => setShowCourseAnalytics(true)}
                  className="flex flex-col items-center justify-center py-4 bg-[#b7dfbc] hover:opacity-90 transition-opacity"
                >
                  <BarChart2 className="w-5 h-5 text-[#228b22] mb-2" strokeWidth={2.5} />
                  <span className="text-[12px] font-semibold text-[#228b22]">Analytics</span>
                </button>
             </div>
           </div>

           <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
             <h3 className="text-[16px] font-semibold text-gray-900 mb-5 flex items-center gap-2">
               <Users className="w-5 h-5 text-green-600" /> Class Insights
             </h3>
             
             <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-[11px] font-semibold text-green-600 uppercase tracking-wider mb-1">Enrolled Students</p>
                  <p className="text-2xl font-semibold text-gray-900">124</p>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <p className="text-[11px] font-semibold text-orange-600 uppercase tracking-wider mb-1">Avg. Assignment Score</p>
                  <p className="text-2xl font-semibold text-gray-900">82%</p>
                </div>
                
                <button 
                  onClick={() => setShowCourseAnalytics(true)}
                  className="w-full mt-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-md"
                >
                  View Full Analytics
                </button>
             </div>
           </div>

           {/* Quick Notes */}
           <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col h-[400px]">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-[16px] font-semibold text-gray-900 flex items-center gap-2"><CheckSquare className="w-5 h-5 text-green-600" /> Quick Notes</h3>
             </div>

             <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 scrollbar-thin scrollbar-thumb-gray-200">
               {quickNotes.length === 0 ? (
                 <p className="text-sm text-gray-400 text-center py-4">No notes added yet.</p>
               ) : (
                 quickNotes.map(note => (
                   <div key={note.id} className="group bg-gray-50 border border-gray-100 rounded-lg p-3 relative hover:border-gray-200 transition-colors">
                     {editingQuickNoteId === note.id ? (
                       <div className="flex flex-col gap-2">
                         <input
                           type="text"
                           value={editingQuickNoteText}
                           onChange={(e) => setEditingQuickNoteText(e.target.value)}
                           className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-green-500"
                           autoFocus
                         />
                         <div className="flex items-center gap-2">
                           <input
                             type="datetime-local"
                             value={editingQuickNoteTime}
                             onChange={(e) => setEditingQuickNoteTime(e.target.value)}
                             className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-500 focus:outline-none focus:border-green-500"
                           />
                           <button onClick={() => saveQuickEdit(note.id)} className="text-green-600 hover:text-green-700 bg-green-50 px-2 py-1 rounded">
                             <Save className="w-4 h-4" />
                           </button>
                           <button onClick={() => setEditingQuickNoteId(null)} className="text-gray-400 hover:text-gray-600 bg-gray-100 px-2 py-1 rounded">
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
                             onClick={() => { setEditingQuickNoteId(note.id); setEditingQuickNoteText(note.text); setEditingQuickNoteTime(note.reminderTime || ''); }}
                             className="p-1 text-gray-400 hover:text-blue-600 rounded"
                           >
                             <Edit3 className="w-3.5 h-3.5" />
                           </button>
                           <button
                             onClick={() => deleteQuickNote(note.id)}
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

             <form onSubmit={addQuickNote} className="flex flex-col gap-2 mt-auto">
               <input
                 type="text"
                 value={newQuickNote}
                 onChange={(e) => setNewQuickNote(e.target.value)}
                 placeholder="Type a new note..."
                 className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:bg-white focus:border-green-500 transition-colors"
               />
               <div className="flex gap-2">
                 <input
                   type="datetime-local"
                   value={newQuickNoteTime}
                   onChange={(e) => setNewQuickNoteTime(e.target.value)}
                   className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:bg-white focus:border-green-500 text-gray-500"
                 />
                 <button
                   type="submit"
                   className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors flex items-center justify-center font-semibold"
                   disabled={!newQuickNote.trim()}
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
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-lg truncate max-w-[80%]">{activeFile.title}</h3>
              <button 
                onClick={() => setActiveFile(null)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
              >
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
                />
              ) : activeFile.type?.includes('image') ? (
                <img 
                  src={activeFile.url} 
                  alt={activeFile.title} 
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-sm"
                />
              ) : (
                <iframe 
                  src={activeFile.url} 
                  title={activeFile.title}
                  className="w-full h-[70vh] rounded-lg shadow-sm bg-white"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload File Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="font-semibold text-lg">Add New {activeTab === 'lectures' ? 'Lecture Video' : 'Document'}</h3>
              <button onClick={() => setShowUploadModal(false)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleModalSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title / Name</label>
                <input 
                  type="text" 
                  value={uploadData.title}
                  onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Introduction to React"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">File</label>
                <input 
                  type="file" 
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  accept="video/*,audio/*,image/*,application/pdf,application/msword,.docx,text/*"
                />
              </div>
              {activeTab === 'lectures' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Duration (Optional)</label>
                  <input 
                    type="text" 
                    value={uploadData.duration}
                    onChange={(e) => setUploadData({...uploadData, duration: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 45 mins"
                  />
                </div>
              )}
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowUploadModal(false)} className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 text-white bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="font-semibold text-lg">Create New Assignment</h3>
              <button onClick={() => { setShowAssignmentModal(false); setAssignmentError(''); }} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAssignmentSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Assignment Title</label>
                <input 
                  type="text" 
                  value={assignmentData.title}
                  onChange={(e) => setAssignmentData({...assignmentData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. Final Project"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                <select
                  value={assignmentData.type}
                  onChange={(e) => setAssignmentData({...assignmentData, type: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Project">Project</option>
                  <option value="Homework">Homework</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Assignment">Assignment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Submission Format</label>
                <input 
                  type="text" 
                  value={assignmentData.format}
                  onChange={(e) => setAssignmentData({...assignmentData, format: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. PDF Upload, GitHub Repo..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Deadline</label>
                <input 
                  type="datetime-local" 
                  value={assignmentData.deadline}
                  min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setAssignmentData({...assignmentData, deadline: newDate});
                    if (newDate && new Date(newDate) < new Date()) {
                      setAssignmentError('Error: Deadline cannot be in the past.');
                    } else {
                      setAssignmentError('');
                    }
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${assignmentError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'}`}
                  required
                />
                {assignmentError && <p className="text-red-500 text-xs font-semibold mt-1">{assignmentError}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Assignment Document (Optional)</label>
                <input 
                  type="file" 
                  onChange={(e) => setAssignmentData({...assignmentData, file: e.target.files[0]})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                  accept="application/pdf,application/msword,.docx,text/*"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => { setShowAssignmentModal(false); setAssignmentError(''); }} className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={!!assignmentError} className={`flex-1 px-4 py-2.5 text-white rounded-lg font-semibold transition-colors shadow-sm ${assignmentError ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}>
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSubmissionsModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Submissions</h3>
                <p className="text-sm text-gray-500 font-medium">{selectedAssignment.title}</p>
              </div>
              <button onClick={() => setShowSubmissionsModal(false)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-0 max-h-[60vh] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider">
                    <th className="p-4 font-semibold border-b">Student</th>
                    <th className="p-4 font-semibold border-b">Status</th>
                    <th className="p-4 font-semibold border-b">File</th>
                    <th className="p-4 font-semibold border-b">Grade</th>
                    <th className="p-4 font-semibold border-b text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mockSubmissions.map(sub => (
                    <tr key={sub.id} className="border-b hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <p className="font-semibold text-sm text-gray-900">{sub.name}</p>
                        <p className="text-xs font-medium text-gray-500">{sub.rollNo}</p>
                      </td>
                      <td className="p-4">
                        {sub.status === 'Submitted' ? (
                          <span className="px-2 py-1 rounded-md text-[10px] font-semibold bg-green-50 text-green-700 border border-green-100">Submitted</span>
                        ) : (
                          <span className="px-2 py-1 rounded-md text-[10px] font-semibold bg-yellow-50 text-yellow-700 border border-yellow-100">Pending</span>
                        )}
                        {sub.time !== '-' && <p className="text-[10px] font-semibold text-gray-400 mt-1">{sub.time}</p>}
                      </td>
                      <td className="p-4">
                        {sub.file ? (
                          <button className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                            <FileText className="w-4 h-4" /> {sub.file}
                          </button>
                        ) : <span className="text-gray-400 font-semibold text-xs">-</span>}
                      </td>
                      <td className="p-4 font-semibold text-sm text-gray-700">{sub.grade}</td>
                      <td className="p-4 text-right">
                        {sub.status === 'Submitted' && (
                          <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                            Grade
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Course Analytics Modal */}
      {showCourseAnalytics && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">Course Analytics</h3>
                  <p className="text-sm text-gray-500 font-medium">{course.title}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCourseAnalytics(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm">
                  <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Enrolled</p>
                  <p className="text-2xl font-bold text-gray-900">124 Students</p>
                </div>
                <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm">
                  <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Avg Completion</p>
                  <p className="text-2xl font-bold text-blue-600">68%</p>
                </div>
                <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm">
                  <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Avg Score</p>
                  <p className="text-2xl font-bold text-green-600">82%</p>
                </div>
              </div>
              
              <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100 bg-white">
                  <h4 className="font-semibold text-gray-800">Student Progress</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                      <tr>
                        <th className="px-5 py-3">Student Name</th>
                        <th className="px-5 py-3">Roll No</th>
                        <th className="px-5 py-3 text-center">Lectures Watched</th>
                        <th className="px-5 py-3 text-center">Assignments</th>
                        <th className="px-5 py-3 text-center">Avg Score</th>
                        <th className="px-5 py-3 text-right">Progress</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { name: 'Aditi Singh', roll: '2023CSE1042', lec: '6/6', asgn: '2/2', score: '92%', prog: 100 },
                        { name: 'Ambar', roll: '2023CSE1043', lec: '4/6', asgn: '1/2', score: '88%', prog: 66 },
                        { name: 'Rahul Sharma', roll: '2023CSE1045', lec: '5/6', asgn: '2/2', score: '76%', prog: 85 },
                        { name: 'Sneha Gupta', roll: '2023CSE1046', lec: '2/6', asgn: '0/2', score: '-', prog: 25 },
                        { name: 'Vikram Patel', roll: '2023CSE1050', lec: '6/6', asgn: '2/2', score: '95%', prog: 100 },
                      ].map((s, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3 font-medium text-gray-900">{s.name}</td>
                          <td className="px-5 py-3 text-gray-500">{s.roll}</td>
                          <td className="px-5 py-3 text-center text-gray-700">{s.lec}</td>
                          <td className="px-5 py-3 text-center text-gray-700">{s.asgn}</td>
                          <td className="px-5 py-3 text-center font-medium text-gray-900">{s.score}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center justify-end gap-3">
                              <span className="font-semibold text-gray-700 w-8 text-right">{s.prog}%</span>
                              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${s.prog > 80 ? 'bg-green-500' : s.prog > 50 ? 'bg-blue-500' : 'bg-orange-500'}`} style={{ width: `${s.prog}%` }}></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
