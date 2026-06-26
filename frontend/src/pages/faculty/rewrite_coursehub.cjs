const fs = require('fs');
const path = '/Users/anshgupta/Library/CloudStorage/OneDrive-Personal/yourCONTEST/frontend/src/pages/faculty/CourseHubDetail.jsx';

let code = fs.readFileSync(path, 'utf8');

// Add states
code = code.replace(
  `const [lectureForm, setLectureForm] = useState({ title: '', duration: '' });`,
  `const [editingLectureId, setEditingLectureId] = useState(null);\n  const [lectureForm, setLectureForm] = useState({ title: '', duration: '', videoUrl: '' });`
);

code = code.replace(
  `const [materialForm, setMaterialForm] = useState({ title: '', size: '' });`,
  `const [editingMaterialId, setEditingMaterialId] = useState(null);\n  const [materialForm, setMaterialForm] = useState({ title: '', size: '', type: 'PDF' });`
);

code = code.replace(
  `import { BookOpen, Video, FileText, Plus, Edit3, Trash2, ChevronLeft, FileCode, Users, X, Save, CheckSquare, PlusCircle, Library, FileCheck, BarChart } from 'lucide-react';`,
  `import { BookOpen, Video, FileText, Plus, Edit3, Trash2, ChevronLeft, FileCode, Users, X, Save, CheckSquare, PlusCircle, Library, FileCheck, BarChart, Link } from 'lucide-react';`
);

// handleAddLecture update
const oldHandleAddLecture = `  const handleAddLecture = async (e) => {
    e.preventDefault();
    if (!lectureForm.title || !lectureForm.duration) return;
    
    const newLecture = {
      id: Date.now(),
      title: lectureForm.title,
      duration: lectureForm.duration,
      completed: false
    };
    
    const updatedCourse = {
      ...course,
      lectures: [...(course.lectures || []), newLecture]
    };
    
    try {
      await updateCourse(id, updatedCourse);
      setCourse(updatedCourse);
      setShowLectureModal(false);
      setLectureForm({ title: '', duration: '' });
    } catch (error) {
      console.error('Failed to add lecture', error);
    }
  };`;

const newHandleAddLecture = `  const handleAddLecture = async (e) => {
    e.preventDefault();
    if (!lectureForm.title || !lectureForm.duration) return;
    
    let updatedLectures = course.lectures || [];
    if (editingLectureId) {
      updatedLectures = updatedLectures.map(l => 
        l.id === editingLectureId ? { ...l, title: lectureForm.title, duration: lectureForm.duration, videoUrl: lectureForm.videoUrl } : l
      );
    } else {
      updatedLectures = [...updatedLectures, {
        id: Date.now(),
        title: lectureForm.title,
        duration: lectureForm.duration,
        videoUrl: lectureForm.videoUrl,
        completed: false
      }];
    }
    
    const updatedCourse = { ...course, lectures: updatedLectures };
    
    try {
      await updateCourse(id, updatedCourse);
      setCourse(updatedCourse);
      setShowLectureModal(false);
      setLectureForm({ title: '', duration: '', videoUrl: '' });
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
    setLectureForm({ title: lec.title, duration: lec.duration, videoUrl: lec.videoUrl || '' });
    setShowLectureModal(true);
  };`;

code = code.replace(oldHandleAddLecture, newHandleAddLecture);

// handleAddMaterial update
const oldHandleAddMaterial = `  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!materialForm.title || !materialForm.size) return;
    
    const newMaterial = {
      id: Date.now(),
      title: materialForm.title,
      size: materialForm.size + ' MB',
      type: 'PDF'
    };
    
    const updatedCourse = {
      ...course,
      documents: [...(course.documents || []), newMaterial]
    };
    
    try {
      await updateCourse(id, updatedCourse);
      setCourse(updatedCourse);
      setShowMaterialModal(false);
      setMaterialForm({ title: '', size: '' });
    } catch (error) {
      console.error('Failed to add material', error);
    }
  };`;

const newHandleAddMaterial = `  const handleAddMaterial = async (e) => {
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
  };`;

code = code.replace(oldHandleAddMaterial, newHandleAddMaterial);

// Update activeTab = lectures
const oldLecturesBlock = `              {activeTab === 'lectures' ? (
                <div className="space-y-3">
                  {(course.lectures || []).map((lec, idx) => (
                    <div key={lec.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                           <Video className="w-5 h-5" />
                         </div>
                         <div>
                           <h4 className="text-[14px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                             {lec.title}
                           </h4>
                           <p className="text-[12px] font-medium text-gray-400 mt-0.5">{lec.duration}</p>
                         </div>
                       </div>
                       <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                           <Edit3 className="w-4 h-4" />
                         </button>
                         <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                    </div>
                  ))}
                  <button onClick={() => setShowLectureModal(true)} className="w-full py-3 mt-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-bold text-[14px]">
                    <Plus className="w-4 h-4" /> Add New Lecture
                  </button>
                </div>`;

const newLecturesBlock = `              {activeTab === 'lectures' ? (
                <div className="space-y-3">
                  {(course.lectures || []).map((lec, idx) => (
                    <div key={lec.id} className="flex items-center justify-between p-4 rounded-xl border border-[#3b3d46] bg-[#25262b] hover:border-blue-500 transition-all group">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-lg bg-[#3b3d46] border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                           <Video className="w-5 h-5" />
                         </div>
                         <div>
                           <h4 className="text-[14px] font-bold text-white group-hover:text-blue-400 transition-colors">
                             {lec.title}
                           </h4>
                           <p className="text-[12px] font-medium text-gray-400 mt-0.5">{lec.duration}</p>
                         </div>
                       </div>
                       <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => openEditLecture(lec)} className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors">
                           <Edit3 className="w-4 h-4" />
                         </button>
                         <button onClick={() => deleteLecture(lec.id)} className="p-2 text-gray-400 hover:text-white hover:border-blue-400 hover:bg-[#3b3d46] border border-transparent rounded-lg transition-all">
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                    </div>
                  ))}
                  <button onClick={() => { setEditingLectureId(null); setLectureForm({title:'', duration:'', videoUrl:''}); setShowLectureModal(true); }} className="w-full py-3 mt-4 border-2 border-dashed border-[#3b3d46] rounded-xl text-gray-400 hover:text-white hover:border-gray-500 bg-[#1e1e1e] hover:bg-[#2c2d33] transition-all flex items-center justify-center gap-2 font-bold text-[14px]">
                    <Plus className="w-4 h-4" /> Add New Lecture
                  </button>
                </div>`;

code = code.replace(oldLecturesBlock, newLecturesBlock);

// Update activeTab = documentation
const oldDocsBlock = `              ) : activeTab === 'documentation' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(course.documents || []).map((doc) => (
                    <div key={doc.id} className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all group">
                       <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                         <FileText className="w-5 h-5" />
                       </div>
                       <div className="flex-1">
                         <h4 className="text-[14px] font-bold text-gray-900 group-hover:text-orange-600 transition-colors leading-tight mb-1">
                           {doc.title}
                         </h4>
                         <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{doc.type} • {doc.size}</p>
                       </div>
                       <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                         <button className="p-1 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                       </div>
                    </div>
                  ))}
                  <button onClick={() => setShowMaterialModal(true)} className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:text-orange-600 hover:border-orange-300 hover:bg-orange-50 transition-all font-bold text-[13px] min-h-[100px]">
                    <Plus className="w-5 h-5" /> Upload Material
                  </button>
                </div>`;

const newDocsBlock = `              ) : activeTab === 'documentation' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(course.documents || []).map((doc) => (
                    <div key={doc.id} className="flex items-start gap-4 p-5 rounded-xl border border-[#3b3d46] bg-[#25262b] hover:border-orange-500 transition-all group">
                       <div className="w-10 h-10 rounded-lg bg-[#3b3d46] border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0">
                         {doc.type === 'Video' ? <Video className="w-5 h-5" /> : doc.type === 'Link' ? <Link className="w-5 h-5" /> : doc.type === 'Zip' ? <FileCode className="w-5 h-5"/> : <FileText className="w-5 h-5" />}
                       </div>
                       <div className="flex-1">
                         <h4 className="text-[14px] font-bold text-white group-hover:text-orange-400 transition-colors leading-tight mb-1">
                           {doc.title}
                         </h4>
                         <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{doc.type} • {doc.size}</p>
                       </div>
                       <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => openEditMaterial(doc)} className="p-1 text-gray-400 hover:text-white transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                         <button onClick={() => deleteMaterial(doc.id)} className="p-1 text-gray-400 hover:text-white transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                       </div>
                    </div>
                  ))}
                  <button onClick={() => { setEditingMaterialId(null); setMaterialForm({title:'', size:'', type:'PDF'}); setShowMaterialModal(true); }} className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed border-[#3b3d46] text-gray-400 hover:text-white hover:border-gray-500 bg-[#1e1e1e] hover:bg-[#2c2d33] transition-all font-bold text-[13px] min-h-[100px]">
                    <Plus className="w-5 h-5" /> Upload Material
                  </button>
                </div>`;

code = code.replace(oldDocsBlock, newDocsBlock);


// Update Lecture Modal
const oldLectureModal = `      {showLectureModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900">Add New Lecture</h3>
              <button onClick={() => setShowLectureModal(false)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddLecture} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Lecture Title</label>
                <input 
                  type="text" required
                  value={lectureForm.title} onChange={e => setLectureForm({...lectureForm, title: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="e.g. Introduction to Variables"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Duration</label>
                <input 
                  type="text" required
                  value={lectureForm.duration} onChange={e => setLectureForm({...lectureForm, duration: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="e.g. 45 mins"
                />
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                Add Lecture
              </button>
            </form>
          </div>
        </div>
      )}`;

const newLectureModal = `      {showLectureModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1b1e] border border-[#3b3d46] rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-white">{editingLectureId ? 'Edit Lecture' : 'Add New Lecture'}</h3>
              <button onClick={() => setShowLectureModal(false)} className="p-2 text-gray-400 hover:text-white hover:bg-[#2c2d33] rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddLecture} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">Lecture Title</label>
                <input 
                  type="text" required
                  value={lectureForm.title} onChange={e => setLectureForm({...lectureForm, title: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#3b3d46] bg-[#25262b] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  placeholder="e.g. Introduction to Variables"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">Duration</label>
                <input 
                  type="text" required
                  value={lectureForm.duration} onChange={e => setLectureForm({...lectureForm, duration: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#3b3d46] bg-[#25262b] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  placeholder="e.g. 45 mins"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">Video Link (Optional)</label>
                <input 
                  type="url"
                  value={lectureForm.videoUrl || ''} onChange={e => setLectureForm({...lectureForm, videoUrl: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#3b3d46] bg-[#25262b] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  placeholder="e.g. https://youtube.com/..."
                />
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm mt-6">
                {editingLectureId ? 'Update Lecture' : 'Add Lecture'}
              </button>
            </form>
          </div>
        </div>
      )}`;

code = code.replace(oldLectureModal, newLectureModal);


// Update Material Modal
const oldMaterialModal = `      {showMaterialModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900">Upload Material</h3>
              <button onClick={() => setShowMaterialModal(false)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddMaterial} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Material Name</label>
                <input 
                  type="text" required
                  value={materialForm.title} onChange={e => setMaterialForm({...materialForm, title: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                  placeholder="e.g. Unit 1 Notes.pdf"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Estimated Size (MB)</label>
                <input 
                  type="number" required
                  value={materialForm.size} onChange={e => setMaterialForm({...materialForm, size: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                  placeholder="e.g. 2.5"
                />
              </div>
              <button type="submit" className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors shadow-sm">
                Upload Material
              </button>
            </form>
          </div>
        </div>
      )}`;

const newMaterialModal = `      {showMaterialModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1b1e] border border-[#3b3d46] rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-white">{editingMaterialId ? 'Edit Material' : 'Upload Material'}</h3>
              <button onClick={() => setShowMaterialModal(false)} className="p-2 text-gray-400 hover:text-white hover:bg-[#2c2d33] rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddMaterial} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">Material Name</label>
                <input 
                  type="text" required
                  value={materialForm.title} onChange={e => setMaterialForm({...materialForm, title: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#3b3d46] bg-[#25262b] text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all outline-none"
                  placeholder="e.g. Unit 1 Notes"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">Type</label>
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
                <label className="block text-sm font-bold text-gray-300 mb-1">Estimated Size (MB)</label>
                <input 
                  type="number" required
                  value={materialForm.size} onChange={e => setMaterialForm({...materialForm, size: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#3b3d46] bg-[#25262b] text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all outline-none"
                  placeholder="e.g. 2.5"
                />
              </div>
              <button type="submit" className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors shadow-sm mt-6">
                {editingMaterialId ? 'Update Material' : 'Upload Material'}
              </button>
            </form>
          </div>
        </div>
      )}`;

code = code.replace(oldMaterialModal, newMaterialModal);


fs.writeFileSync(path, code);
