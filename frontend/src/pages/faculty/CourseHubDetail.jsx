import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Video, FileText, Plus, Edit3, Trash2, ChevronLeft, FileCode, Users, X, Save, CheckSquare, PlusCircle, Library, FileCheck, BarChart, Link } from 'lucide-react';
import { getCourses, updateCourse } from '../../api';

export default function CourseHubDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lectures'); // lectures, documentation, assignments
  
  // Modals state
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [editingLectureId, setEditingLectureId] = useState(null);
  const [lectureForm, setLectureForm] = useState({ title: '', duration: '', videoUrl: '', description: '', fileData: '' });
  
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [materialForm, setMaterialForm] = useState({ title: '', size: '', type: 'PDF' });
  
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  const [assignmentForm, setAssignmentForm] = useState({ title: '', dueDate: '', facultyFileUrl: '', facultyFileData: '' });
  const [activeAssignmentSubmissions, setActiveAssignmentSubmissions] = useState(null);

  const [activePdfUrl, setActivePdfUrl] = useState(null);
  const [activePdfName, setActivePdfName] = useState("");

  const [activeVideoUrl, setActiveVideoUrl] = useState(null);
  const [activeVideoName, setActiveVideoName] = useState("");

  // Quick Notes state
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('faculty_notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState('');

  useEffect(() => {
    localStorage.setItem('faculty_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await getCourses();
        const found = res.data.find(c => c._id === id);
        if (found) {
          setCourse(found);
        }
      } catch (error) {
        console.error('Failed to fetch course', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handleAddLecture = async (e) => {
    e.preventDefault();
    if (!lectureForm.title || !lectureForm.duration) return;
    
    let updatedLectures = course.lectures || [];
    if (editingLectureId) {
      updatedLectures = updatedLectures.map(l => 
        l.id === editingLectureId ? { ...l, title: lectureForm.title, duration: lectureForm.duration, videoUrl: lectureForm.videoUrl, description: lectureForm.description, fileData: lectureForm.fileData } : l
      );
    } else {
      updatedLectures = [...updatedLectures, {
        id: Date.now(),
        title: lectureForm.title,
        duration: lectureForm.duration,
        videoUrl: lectureForm.videoUrl,
        description: lectureForm.description,
        fileData: lectureForm.fileData,
        completed: false
      }];
    }
    
    const updatedCourse = { ...course, lectures: updatedLectures };
    
    try {
      await updateCourse(id, updatedCourse);
      setCourse(updatedCourse);
      setShowLectureModal(false);
      setLectureForm({ title: '', duration: '', videoUrl: '', description: '', fileData: '' });
      setEditingLectureId(null);
    } catch (error) {
      console.error('Failed to add lecture', error);
    }
  };

  const deleteLecture = async (lecId) => {
    const updatedCourse = { ...course, lectures: (course.lectures || []).filter(l => l.id !== lecId) };
    try {
      await updateCourse(id, updatedCourse);
      setCourse(updatedCourse);
    } catch (e) { console.error(e); }
  };

  const openEditLecture = (lec) => {
    setEditingLectureId(lec.id);
    setLectureForm({ title: lec.title, duration: lec.duration, videoUrl: lec.videoUrl || '', description: lec.description || '', fileData: lec.fileData || '' });
    setShowLectureModal(true);
  };

  const handleLectureClick = (lec) => {
    const isPdf = lec.videoUrl && lec.videoUrl.toLowerCase().endsWith('.pdf');
    if (isPdf) {
      if (lec.fileData) {
        setActivePdfUrl(lec.fileData);
      } else {
        setActivePdfUrl("mock");
      }
      setActivePdfName(lec.videoUrl);
    } else {
      if (lec.fileData) {
        setActiveVideoUrl(lec.fileData);
      } else {
        setActiveVideoUrl("mock");
      }
      setActiveVideoName(lec.title);
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!materialForm.title || !materialForm.size) return;
    
    let updatedDocs = course.documents || [];
    if (editingMaterialId) {
      updatedDocs = updatedDocs.map(d => 
        d.id === editingMaterialId ? { ...d, title: materialForm.title, size: materialForm.size + (materialForm.size.includes('MB') ? '' : ' MB'), type: materialForm.type } : d
      );
    } else {
      updatedDocs = [...updatedDocs, {
        id: Date.now(),
        title: materialForm.title,
        size: materialForm.size + ' MB',
        type: materialForm.type
      }];
    }
    
    const updatedCourse = { ...course, documents: updatedDocs };
    
    try {
      await updateCourse(id, updatedCourse);
      setCourse(updatedCourse);
      setShowMaterialModal(false);
      setMaterialForm({ title: '', size: '', type: 'PDF' });
      setEditingMaterialId(null);
    } catch (error) {
      console.error('Failed to add material', error);
    }
  };

  const deleteMaterial = async (docId) => {
    const updatedCourse = { ...course, documents: (course.documents || []).filter(d => d.id !== docId) };
    try {
      await updateCourse(id, updatedCourse);
      setCourse(updatedCourse);
    } catch (e) { console.error(e); }
  };

  const openEditMaterial = (doc) => {
    setEditingMaterialId(doc.id);
    setMaterialForm({ title: doc.title, size: doc.size.replace(' MB', ''), type: doc.type });
    setShowMaterialModal(true);
  };

  const handleAddAssignment = async (e) => {
    e.preventDefault();
    if (!assignmentForm.title || !assignmentForm.dueDate) return;
    
    let updatedAssignments = course.assignments || [];
    if (editingAssignmentId) {
      updatedAssignments = updatedAssignments.map(a => 
        a.id === editingAssignmentId ? { 
          ...a, 
          title: assignmentForm.title, 
          dueDate: assignmentForm.dueDate, 
          facultyFileUrl: assignmentForm.facultyFileUrl || a.facultyFileUrl,
          facultyFileData: assignmentForm.facultyFileData || a.facultyFileData 
        } : a
      );
    } else {
      updatedAssignments = [...updatedAssignments, {
        id: Date.now(),
        title: assignmentForm.title,
        dueDate: assignmentForm.dueDate,
        facultyFileUrl: assignmentForm.facultyFileUrl,
        facultyFileData: assignmentForm.facultyFileData,
        status: "Upcoming"
      }];
    }
    
    const updatedCourse = {
      ...course,
      assignments: updatedAssignments
    };
    
    try {
      await updateCourse(id, updatedCourse);
      setCourse(updatedCourse);
      setShowAssignmentModal(false);
      setEditingAssignmentId(null);
      setAssignmentForm({ title: '', dueDate: '', facultyFileUrl: '', facultyFileData: '' });
    } catch (error) {
      console.error('Failed to save assignment', error);
    }
  };

  const deleteAssignment = async (assignmentId) => {
    const updatedCourse = { ...course, assignments: (course.assignments || []).filter(a => a.id !== assignmentId) };
    try {
      await updateCourse(id, updatedCourse);
      setCourse(updatedCourse);
    } catch (e) { console.error(e); }
  };

  const openEditAssignment = (assignment) => {
    setEditingAssignmentId(assignment.id);
    setAssignmentForm({ 
      title: assignment.title, 
      dueDate: assignment.dueDate, 
      facultyFileUrl: assignment.facultyFileUrl || '', 
      facultyFileData: assignment.facultyFileData || '' 
    });
    setShowAssignmentModal(true);
  };

  // Note functions
  const addNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotes([{ id: Date.now(), text: newNote }, ...notes]);
    setNewNote('');
  };
  const deleteNote = (noteId) => setNotes(notes.filter(n => n.id !== noteId));
  const saveEdit = (noteId) => {
    if (!editingNoteText.trim()) return;
    setNotes(notes.map(n => n.id === noteId ? { ...n, text: editingNoteText } : n));
    setEditingNoteId(null);
  };

  if (isLoading) return <div className="p-10 text-center">Loading course details...</div>;
  if (!course) return <div className="p-10 text-center">Course not found.</div>;

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
        
        <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="absolute left-0 bottom-0 w-40 h-40 bg-indigo-900/40 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex gap-2 mb-4">
                 {(course.tags || []).map((tag, i) => (
                   <span key={i} className="text-[10px] font-semibold text-white bg-white/20 px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm backdrop-blur-sm">
                     {tag}
                   </span>
                 ))}
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold mb-2">{course.title}</h1>
              <p className="text-indigo-100 text-sm md:text-base font-medium flex items-center gap-2">
                <Users className="w-4 h-4" /> {course.students || 0} Active Students Enrolled
              </p>
            </div>
            
            <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
               <button onClick={() => setShowLectureModal(true)} className="px-6 py-2.5 bg-white text-indigo-600 text-sm font-semibold rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
                 <Plus className="w-4 h-4" /> Add Module
               </button>
               <button className="px-6 py-2.5 bg-indigo-500/50 hover:bg-indigo-500 text-white border border-indigo-400/50 text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 backdrop-blur-sm">
                 <Edit3 className="w-4 h-4" /> Edit Details
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
              <div className="flex gap-8 border-b border-gray-100 mb-6 overflow-x-auto hide-scrollbar">
                <button 
                  onClick={() => setActiveTab('lectures')}
                  className={`pb-4 text-[15px] font-semibold transition-all relative whitespace-nowrap ${
                    activeTab === 'lectures' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span className="flex items-center gap-2"><Video className="w-4 h-4" /> Modules & Lectures</span>
                  {activeTab === 'lectures' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
                </button>
                <button 
                  onClick={() => setActiveTab('documentation')}
                  className={`pb-4 text-[15px] font-semibold transition-all relative whitespace-nowrap ${
                    activeTab === 'documentation' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Notes & Materials</span>
                  {activeTab === 'documentation' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
                </button>
                <button 
                  onClick={() => setActiveTab('assignments')}
                  className={`pb-4 text-[15px] font-semibold transition-all relative whitespace-nowrap ${
                    activeTab === 'assignments' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Assignments</span>
                  {activeTab === 'assignments' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'lectures' ? (
                <div className="space-y-3">
                  {(course.lectures || []).map((lec) => (
                    <div key={lec.id} onClick={() => handleLectureClick(lec)} className="flex items-center justify-between p-4 rounded-xl border border-[#3b3d46] bg-[#25262b] hover:border-blue-500 transition-all cursor-pointer group">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-lg bg-[#3b3d46] border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                           {lec.videoUrl && lec.videoUrl.toLowerCase().endsWith('.pdf') ? <FileText className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                         </div>
                         <div>
                           <h4 className="text-[14px] font-semibold text-white group-hover:text-blue-400 transition-colors">
                             {lec.title}
                           </h4>
                           <p className="text-[12px] font-medium text-gray-400 mt-0.5">{lec.duration}</p>
                         </div>
                       </div>
                       <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={(e) => { e.stopPropagation(); openEditLecture(lec); }} className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors">
                           <Edit3 className="w-4 h-4" />
                         </button>
                         <button onClick={(e) => { e.stopPropagation(); deleteLecture(lec.id); }} className="p-2 text-gray-400 hover:text-white hover:border-blue-400 hover:bg-[#3b3d46] border border-transparent rounded-lg transition-all">
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                    </div>
                  ))}
                  <button onClick={() => { setEditingLectureId(null); setLectureForm({title:'', duration:'', videoUrl:''}); setShowLectureModal(true); }} className="w-full py-3 mt-4 border-2 border-dashed border-[#3b3d46] rounded-xl text-gray-400 hover:text-white hover:border-gray-500 bg-[#1e1e1e] hover:bg-[#2c2d33] transition-all flex items-center justify-center gap-2 font-semibold text-[14px]">
                    <Plus className="w-4 h-4" /> Add New Lecture
                  </button>
                </div>
              ) : activeTab === 'documentation' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(course.documents || []).map((doc) => (
                    <div key={doc.id} className="flex items-start gap-4 p-5 rounded-xl border border-[#3b3d46] bg-[#25262b] hover:border-orange-500 transition-all group">
                       <div className="w-10 h-10 rounded-lg bg-[#3b3d46] border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0">
                         {doc.type === 'Video' ? <Video className="w-5 h-5" /> : doc.type === 'Link' ? <Link className="w-5 h-5" /> : doc.type === 'Zip' ? <FileCode className="w-5 h-5"/> : <FileText className="w-5 h-5" />}
                       </div>
                       <div className="flex-1">
                         <h4 className="text-[14px] font-semibold text-white group-hover:text-orange-400 transition-colors leading-tight mb-1">
                           {doc.title}
                         </h4>
                         <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{doc.type} • {doc.size}</p>
                       </div>
                       <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => openEditMaterial(doc)} className="p-1 text-gray-400 hover:text-white transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                         <button onClick={() => deleteMaterial(doc.id)} className="p-1 text-gray-400 hover:text-white transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                       </div>
                    </div>
                  ))}
                  <button onClick={() => { setEditingMaterialId(null); setMaterialForm({title:'', size:'', type:'PDF'}); setShowMaterialModal(true); }} className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed border-[#3b3d46] text-gray-400 hover:text-white hover:border-gray-500 bg-[#1e1e1e] hover:bg-[#2c2d33] transition-all font-semibold text-[13px] min-h-[100px]">
                    <Plus className="w-5 h-5" /> Upload Material
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                   {(course.assignments || []).length === 0 ? (
                      <div className="text-center py-12">
                         <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                           <BookOpen className="w-8 h-8" />
                         </div>
                         <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assignments Yet</h3>
                         <p className="text-sm text-gray-500 mb-6">Create assignments to assess your students' progress.</p>
                         <button onClick={() => setShowAssignmentModal(true)} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm inline-flex items-center gap-2">
                           <Plus className="w-4 h-4" /> Give Assignment
                         </button>
                      </div>
                   ) : (
                      <>
                        {(course.assignments || []).map((assignment) => (
                          <div key={assignment.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                             <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                 <BookOpen className="w-5 h-5" />
                               </div>
                               <div>
                                 <h4 className="text-[14px] font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                   {assignment.title}
                                 </h4>
                                 <p className="text-[12px] font-medium text-gray-400 mt-0.5">Due: {assignment.dueDate}</p>
                                 {(assignment.submissions || []).length > 0 && (
                                   <p className="text-[11px] font-semibold text-green-600 mt-1">{(assignment.submissions || []).length} Submission(s)</p>
                                 )}
                               </div>
                             </div>
                              <div className="flex items-center gap-2">
                                {(assignment.submissions || []).length > 0 && (
                                  <button onClick={() => setActiveAssignmentSubmissions(assignment)} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-200 transition-colors">
                                    View Submissions
                                  </button>
                                )}
                                {assignment.facultyFileData && (
                                  <button onClick={() => { setActivePdfUrl(assignment.facultyFileData); setActivePdfName(assignment.facultyFileUrl || 'Assignment.pdf'); }} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-200 transition-colors">
                                    View Question
                                  </button>
                                )}
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                  <button onClick={() => openEditAssignment(assignment)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => deleteAssignment(assignment.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                          </div>
                        ))}
                        <button onClick={() => { setEditingAssignmentId(null); setAssignmentForm({title: '', dueDate: '', facultyFileUrl: '', facultyFileData: ''}); setShowAssignmentModal(true); }} className="w-full py-3 mt-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-semibold text-[14px]">
                          <Plus className="w-4 h-4" /> Give Assignment
                        </button>
                      </>
                   )}
                </div>
              )}

           </div>
        </div>

        {/* Sidebar (Right) */}
        <div className="lg:w-1/3 space-y-6">
           
           {/* Quick Actions */}
           <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
             <h2 className="text-[15px] font-semibold text-gray-800 mb-4">Quick Actions</h2>
             <div className="grid grid-cols-2 gap-3">
               {[
                 { name: 'New Contest', icon: PlusCircle, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', path: '/faculty/create-contest' },
                 { name: 'Question Bank', icon: Library, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', path: '/faculty/question-bank' },
                 { name: 'Submissions', icon: FileCheck, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', path: '/faculty/manage-contests' },
                 { name: 'Analytics', icon: BarChart, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', path: '/faculty/student-records' },
               ].map((action, i) => (
                 <button
                   key={i}
                   onClick={() => navigate(action.path)}
                   className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all gap-2 ${action.bg} ${action.border} hover:shadow-md hover:-translate-y-0.5`}
                 >
                   <action.icon className={`w-5 h-5 ${action.color}`} />
                   <span className={`text-[11px] font-semibold ${action.color}`}>{action.name}</span>
                 </button>
               ))}
             </div>
           </div>

           {/* Linked Contests */}
           <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
             <div className="flex justify-between items-center mb-5">
               <h3 className="text-[16px] font-semibold text-gray-900 flex items-center gap-2">
                 <FileCode className="w-5 h-5 text-purple-600" /> Linked Contests
               </h3>
               <button 
                 onClick={() => navigate('/faculty/create-contest')}
                 className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-1 text-[12px] font-semibold" title="Create Contest"
               >
                 <Plus className="w-3.5 h-3.5" /> Create
               </button>
             </div>
             
             <div className="space-y-4">
               {(!course.tests || course.tests.length === 0) ? (
                 <p className="text-sm text-gray-500 italic text-center py-4">No contests linked to this course.</p>
               ) : (
                 course.tests.map((test) => (
                   <div key={test.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-purple-200 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-semibold tracking-wider uppercase border ${
                          test.type === 'Assessment' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                          test.type === 'Quiz' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {test.type}
                        </span>
                        <span className={`text-[10px] font-semibold tracking-wider uppercase flex items-center gap-1 ${
                          test.status === 'Live' ? 'text-red-600' : 'text-gray-400'
                        }`}>
                          {test.status === 'Live' && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>}
                          {test.status}
                        </span>
                      </div>
                      <h4 className="text-[14px] font-semibold text-gray-900 mb-1 leading-tight">{test.title}</h4>
                      <p className="text-[12px] font-medium text-gray-500 mb-4">{test.format}</p>
                      
                      <button 
                        onClick={() => navigate('/faculty/manage-contests')}
                        className="w-full py-2 rounded-lg text-[12px] font-semibold transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                      >
                        Manage Contest
                      </button>
                   </div>
                 ))
               )}
             </div>
           </div>

           {/* Quick Notes */}
           <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col h-[350px]">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-[15px] font-semibold text-gray-800 flex items-center gap-2"><CheckSquare className="w-4 h-4 text-green-600" /> Quick Notes</h2>
             </div>
             <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 scrollbar-thin scrollbar-thumb-gray-200">
               {notes.length === 0 ? (
                 <p className="text-sm text-gray-400 text-center py-4">No notes added yet.</p>
               ) : (
                 notes.map(note => (
                   <div key={note.id} className="group bg-gray-50 border border-gray-100 rounded-lg p-3 relative hover:border-gray-200 transition-colors">
                     {editingNoteId === note.id ? (
                       <div className="flex gap-2">
                         <input
                           type="text"
                           value={editingNoteText}
                           onChange={(e) => setEditingNoteText(e.target.value)}
                           className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-green-500"
                           autoFocus
                         />
                         <button onClick={() => saveEdit(note.id)} className="text-green-600 hover:text-green-700">
                           <Save className="w-4 h-4" />
                         </button>
                         <button onClick={() => setEditingNoteId(null)} className="text-gray-400 hover:text-gray-600">
                           <X className="w-4 h-4" />
                         </button>
                       </div>
                     ) : (
                       <div className="flex justify-between items-start gap-2">
                         <p className="text-sm text-gray-700 leading-snug break-words flex-1">{note.text}</p>
                         <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
                           <button
                             onClick={() => { setEditingNoteId(note.id); setEditingNoteText(note.text); }}
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
             <form onSubmit={addNote} className="relative mt-auto">
               <input
                 type="text"
                 value={newNote}
                 onChange={(e) => setNewNote(e.target.value)}
                 placeholder="Type a new note..."
                 className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:bg-white focus:border-green-500 transition-colors"
               />
               <button
                 type="submit"
                 className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-md transition-colors"
                 disabled={!newNote.trim()}
               >
                 <Plus className="w-4 h-4" />
               </button>
             </form>
           </div>
           
        </div>
      </div>

      {/* Modals */}
      
      {/* Lecture Modal */}
      {showLectureModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1b1e] border border-[#3b3d46] rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">{editingLectureId ? 'Edit Lecture' : 'Add New Lecture'}</h3>
              <button onClick={() => setShowLectureModal(false)} className="p-2 text-gray-400 hover:text-white hover:bg-[#2c2d33] rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddLecture} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">Lecture Title</label>
                <input 
                  type="text" required
                  value={lectureForm.title} onChange={e => setLectureForm({...lectureForm, title: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#3b3d46] bg-[#25262b] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  placeholder="e.g. Introduction to Variables"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">Description (Optional)</label>
                <textarea 
                  rows="3"
                  value={lectureForm.description} onChange={e => setLectureForm({...lectureForm, description: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#3b3d46] bg-[#25262b] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none resize-none"
                  placeholder="e.g. In this lecture, we will cover the basics of..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">Duration</label>
                <input 
                  type="text" required
                  value={lectureForm.duration} onChange={e => setLectureForm({...lectureForm, duration: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#3b3d46] bg-[#25262b] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  placeholder="e.g. 45 mins"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">Upload Media or PDF</label>
                <div className="relative">
                  <input 
                    type="file"
                    accept="video/*,audio/*,application/pdf"
                    onChange={e => {
                      const file = e.target.files && e.target.files[0];
                      if(file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setLectureForm(prev => ({...prev, videoUrl: file.name, fileData: reader.result}));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full px-4 py-2 rounded-xl border border-[#3b3d46] bg-[#25262b] text-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#3b3d46] file:text-white hover:file:bg-[#4a4d58] cursor-pointer"
                  />
                </div>
                {lectureForm.videoUrl && (
                  <p className="mt-2 text-xs text-blue-400 font-medium">Selected: {lectureForm.videoUrl}</p>
                )}
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm mt-6">
                {editingLectureId ? 'Update Lecture' : 'Add Lecture'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Material Modal */}
      {showMaterialModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1b1e] border border-[#3b3d46] rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">{editingMaterialId ? 'Edit Material' : 'Upload Material'}</h3>
              <button onClick={() => setShowMaterialModal(false)} className="p-2 text-gray-400 hover:text-white hover:bg-[#2c2d33] rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddMaterial} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">Material Name</label>
                <input 
                  type="text" required
                  value={materialForm.title} onChange={e => setMaterialForm({...materialForm, title: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#3b3d46] bg-[#25262b] text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all outline-none"
                  placeholder="e.g. Unit 1 Notes"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">Type</label>
                <select 
                  value={materialForm.type} onChange={e => setMaterialForm({...materialForm, type: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#3b3d46] bg-[#25262b] text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all outline-none appearance-none"
                >
                  <option value="PDF">PDF Document</option>
                  <option value="Video">Video File</option>
                  <option value="Link">External Link</option>
                  <option value="Zip">ZIP Archive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">Estimated Size (MB)</label>
                <input 
                  type="number" required
                  value={materialForm.size} onChange={e => setMaterialForm({...materialForm, size: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#3b3d46] bg-[#25262b] text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all outline-none"
                  placeholder="e.g. 2.5"
                />
              </div>
              <button type="submit" className="w-full py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors shadow-sm mt-6">
                {editingMaterialId ? 'Update Material' : 'Upload Material'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Give Assignment</h3>
              <button onClick={() => setShowAssignmentModal(false)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Assignment Title</label>
                <input 
                  type="text" required
                  value={assignmentForm.title} onChange={e => setAssignmentForm({...assignmentForm, title: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="e.g. Weekly Homework #1"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Due Date</label>
                <input 
                  type="date" required min={new Date().toISOString().split('T')[0]}
                  value={assignmentForm.dueDate} onChange={e => setAssignmentForm({...assignmentForm, dueDate: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Assignment PDF (Optional)</label>
                <input 
                  type="file" accept="application/pdf"
                  onChange={e => {
                    const file = e.target.files && e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setAssignmentForm(prev => ({ ...prev, facultyFileUrl: file.name, facultyFileData: reader.result }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                {editingAssignmentId ? 'Update Assignment' : 'Publish Assignment'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {activePdfUrl && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1e1e24] rounded-2xl shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden border border-[#3b3d46] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-[#3b3d46] bg-[#25262b]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#3b3d46] border border-blue-500/30 text-blue-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                   <h3 className="text-lg font-semibold text-white leading-tight">{activePdfName}</h3>
                   <p className="text-[12px] font-medium text-gray-400">Faculty PDF Preview</p>
                </div>
              </div>
              <button onClick={() => setActivePdfUrl(null)} className="p-2 text-gray-400 hover:text-white hover:bg-[#3b3d46] rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 bg-[#121212] p-4 md:p-8 overflow-y-auto flex justify-center">
              {activePdfUrl === "mock" ? (
                <div className="w-full max-w-3xl bg-white shadow-2xl min-h-[1000px] p-12 border border-gray-300">
                  <div className="flex justify-between items-end border-b-2 border-gray-800 pb-6 mb-8">
                    <div>
                      <h1 className="text-4xl font-serif text-gray-900 mb-2">{activePdfName.replace('.pdf', '').replace(/_/g, ' ')}</h1>
                      <p className="text-gray-500">Student Resume Document</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-400">Page 1 of 1</p>
                  </div>
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-100 rounded w-full"></div>
                      <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-100 rounded w-full"></div>
                    </div>
                    
                    <h2 className="text-xl font-semibold font-serif text-gray-800 mt-12 mb-4 border-b border-gray-200 pb-2">Professional Experience</h2>
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-100 rounded w-full"></div>
                      <div className="h-4 bg-gray-100 rounded w-full"></div>
                      <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-100 rounded w-4/6"></div>
                    </div>

                    <h2 className="text-xl font-semibold font-serif text-gray-800 mt-12 mb-4 border-b border-gray-200 pb-2">Education & Certifications</h2>
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-100 rounded w-full"></div>
                      <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <iframe 
                  src={activePdfUrl} 
                  className="w-full h-full rounded-xl shadow-sm border border-[#3b3d46] bg-white"
                  title="PDF Viewer"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Video Viewer Modal */}
      {activeVideoUrl && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1e1e24] rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col overflow-hidden border border-[#3b3d46] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-[#3b3d46] bg-[#25262b]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#3b3d46] border border-blue-500/30 text-blue-400 flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                   <h3 className="text-lg font-semibold text-white leading-tight">{activeVideoName}</h3>
                   <p className="text-[12px] font-medium text-gray-400">Faculty Video Preview</p>
                </div>
              </div>
              <button onClick={() => setActiveVideoUrl(null)} className="p-2 text-gray-400 hover:text-white hover:bg-[#3b3d46] rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full aspect-video bg-black flex items-center justify-center relative">
              <video 
                src={activeVideoUrl === "mock" ? "https://www.w3schools.com/html/mov_bbb.mp4" : activeVideoUrl} 
                controls
                autoPlay
                className="w-full h-full outline-none"
              >
                Your browser does not support HTML video.
              </video>
            </div>
          </div>
        </div>
      )}

      {/* View Submissions Modal */}
      {activeAssignmentSubmissions && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{activeAssignmentSubmissions.title}</h3>
                <p className="text-sm text-gray-500 font-medium">Student Submissions</p>
              </div>
              <button onClick={() => setActiveAssignmentSubmissions(null)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3 overflow-y-auto">
              {(activeAssignmentSubmissions.submissions || []).length === 0 ? (
                <p className="text-center text-gray-500 py-8 italic">No submissions yet.</p>
              ) : (
                (activeAssignmentSubmissions.submissions || []).map((sub, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-blue-200 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
                        {sub.studentName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="text-[14px] font-semibold text-gray-900">{sub.studentName}</h4>
                        <div className="flex items-center gap-3 mt-0.5 text-[11px] font-semibold text-gray-500">
                          <span>ID: {sub.studentId}</span>
                          <span>•</span>
                          <span className="text-green-600">{sub.submissionDate}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setActivePdfUrl(sub.fileData); setActivePdfName(`${sub.studentName} - ${sub.fileName}`); }} 
                      className="px-4 py-2 bg-white border border-gray-200 text-blue-600 text-[12px] font-semibold rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors shadow-sm"
                    >
                      View PDF
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
