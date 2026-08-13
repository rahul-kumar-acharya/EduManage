import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { academicService } from '../../services/academicService';
import { teacherService } from '../../services/teacherService';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { GraduationCap, Layers, Plus, Trash2, Check } from 'lucide-react';

const ALLOWED_CLASSES = [
  'Nursery',
  'LKG',
  'UKG',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
];

const ClassesSections = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasActiveSession, setHasActiveSession] = useState(true);
  const [error, setError] = useState('');

  // Multi-select arrays for batch creation
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [selectedClassNames, setSelectedClassNames] = useState([]);

  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedSectionLetters, setSelectedSectionLetters] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'class' | 'section', id: number, name: string }

  const fetchDropdownData = async () => {
    try {
      const data = await teacherService.getTeachers();
      setTeachers(data.results || data);
    } catch (err) {
      console.error("Failed to fetch teachers:", err);
    }
  };

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const data = await academicService.getClasses();
      setClasses(data.results || data);
    } catch (err) {
      console.error("Failed to fetch classes:", err);
    } finally {
      setLoading(false);
    }
  };
  
  const checkActiveSession = async () => {
    try {
      const sessionsData = await academicService.getSessions();
      const sessions = sessionsData.results || sessionsData;
      const active = sessions.some(s => s.is_current);
      setHasActiveSession(active);
    } catch (err) {
      console.error("Failed to check active sessions:", err);
    }
  };

  useEffect(() => {
    fetchDropdownData();
    fetchClasses();
    checkActiveSession();
  }, []);

  const openClassModal = () => {
    setError('');
    setSelectedClassNames([]);
    setClassModalOpen(true);
  };

  const openSectionModal = (classId) => {
    setError('');
    setSelectedClassId(classId);
    setSelectedSectionLetters([]);
    setSelectedTeacherId('');
    setSectionModalOpen(true);
  };

  const toggleClassSelection = (clsName) => {
    setError('');
    if (selectedClassNames.includes(clsName)) {
      setSelectedClassNames(selectedClassNames.filter(name => name !== clsName));
    } else {
      setSelectedClassNames([...selectedClassNames, clsName]);
    }
  };

  const toggleSectionSelection = (letter) => {
    setError('');
    if (selectedSectionLetters.includes(letter)) {
      setSelectedSectionLetters(selectedSectionLetters.filter(l => l !== letter));
    } else {
      setSelectedSectionLetters([...selectedSectionLetters, letter]);
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    if (selectedClassNames.length === 0) {
      setError("Please select at least one class level to add.");
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      // Batch create all selected classes
      await Promise.all(
        selectedClassNames.map(name => academicService.createClass({ name }))
      );
      setSelectedClassNames([]);
      setClassModalOpen(false);
      fetchClasses();
    } catch (err) {
      console.error("Failed to add classes:", err);
      if (err.response && err.response.data && err.response.data.name) {
        const nameErr = Array.isArray(err.response.data.name) ? err.response.data.name.join(' ') : err.response.data.name;
        setError(nameErr);
      } else if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Failed to add selected class levels. Make sure an active session exists.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    if (selectedSectionLetters.length === 0) {
      setError("Please select at least one section division (Section A, B, or C).");
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      // Batch create all selected sections for the target class level
      await Promise.all(
        selectedSectionLetters.map(letter => {
          return academicService.createSection({
            class_level: selectedClassId, 
            name: `Section ${letter}` 
          });
        })
      );
      setSelectedSectionLetters([]);
      setSectionModalOpen(false);
      fetchClasses();
      fetchDropdownData();

    } catch (err) {
      console.error("Failed to add sections:", err);
      if (err.response && err.response.data && err.response.data.name) {
        const nameErr = Array.isArray(err.response.data.name) ? err.response.data.name.join(' ') : err.response.data.name;
        setError(nameErr);
      } else if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Failed to add selected section divisions.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignTeacher = async (sectionId, teacherId) => {
    try {
      await academicService.assignTeacher(sectionId, teacherId ? parseInt(teacherId) : null);
      fetchClasses();
      fetchDropdownData();
    } catch (err) {
      console.error("Failed to assign class teacher:", err);
    }
  };

  const initiateDeleteClass = (id, name) => {
    setDeleteTarget({ type: 'class', id, name });
    setDeleteConfirmOpen(true);
  };

  const initiateDeleteSection = (id, name) => {
    setDeleteTarget({ type: 'section', id, name });
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      if (deleteTarget.type === 'class') {
        await academicService.deleteClass(deleteTarget.id);
      } else {
        await academicService.deleteSection(deleteTarget.id);
      }
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
      fetchClasses();
      fetchDropdownData();
    } catch (err) {
      console.error(`Failed to delete ${deleteTarget.type}:`, err);
    } finally {
      setSubmitting(false);
    }
  };

  const assignedTeacherIds = new Set();
  classes.forEach(cls => {
    cls.sections?.forEach(s => {
      if (s.class_teacher) {
        assignedTeacherIds.add(s.class_teacher);
      }
    });
  });

  const availableUnassignedTeachers = teachers.filter(t => (t.user?.is_active ?? true) && !assignedTeacherIds.has(t.id));

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans'] text-[#1A1918]">
      
      {/* Category Pill Indicator */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5C1D24]/10 border border-[#5C1D24]/20 text-[10px] font-bold text-[#5C1D24] uppercase tracking-wider">
        <GraduationCap className="w-3.5 h-3.5 text-[#5C1D24]" />
        <span>Academic Infrastructure Setup</span>
      </div>

      {!hasActiveSession && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-3 font-semibold shadow-sm">
          <span>⚠️ No active academic session found. You must create and set an active Academic Session in the Sessions tab before managing classes or sections.</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
        <div>
          <h1 className="text-3xl font-['Newsreader'] font-bold text-[#1A1918]">Classes & Sections</h1>
          <p className="text-xs text-[#64748B] mt-1">Manage class levels (Nursery, LKG, UKG, Grade 1 to 10), create sections, and assign class teachers.</p>
        </div>
        <Button variant="primary" size="sm" onClick={openClassModal} className="gap-2 shadow-sm" disabled={!hasActiveSession}>
          <Plus className="w-4 h-4" /> Add Class
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <div key={cls.id} className="bg-white p-6 rounded-xl border border-[#E5E0D8] shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#F7F5F0] border border-[#E5E0D8] text-[#1B2A4A] flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1A1918]">{cls.name}</h3>
                    <div className="text-xs text-[#64748B]">{cls.sections?.length || 0} Sections</div>
                  </div>
                </div>
                <button
                  onClick={() => initiateDeleteClass(cls.id, cls.name)}
                  className="text-[#64748B] hover:text-[#5C1D24] p-1.5 rounded hover:bg-[#5C1D24]/10 transition-colors"
                  title="Delete Class"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 border-t border-[#F7F5F0] pt-3">
                <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Sections</div>
                <div className="grid grid-cols-1 gap-2">
                  {cls.sections && cls.sections.length > 0 ? (
                    cls.sections.map((sec) => {
                      const availableTeachers = teachers.filter(t => (t.user?.is_active ?? true) && (!assignedTeacherIds.has(t.id) || sec.class_teacher === t.id));
                      return (
                        <div
                          key={sec.id}
                          className="flex flex-col gap-2 p-3 bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg text-xs"
                        >
                          <div className="flex items-center justify-between font-bold text-[#1A1918]">
                            <span className="flex items-center gap-2">
                              <Layers className="w-4 h-4 text-[#1B2A4A]" />
                              {sec.name}
                            </span>
                            <button
                              onClick={() => initiateDeleteSection(sec.id, sec.name)}
                              className="text-[#64748B] hover:text-[#5C1D24] font-bold text-sm"
                              title="Delete Section"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          
                          <div className="space-y-1">
                            <label className="block text-[8px] font-extrabold text-[#64748B] uppercase tracking-wider">
                              Class Teacher
                            </label>
                            <select
                              value={sec.class_teacher || ''}
                              onChange={(e) => {
                                if (e.target.value === 'ADD_TEACHER') {
                                  navigate('/dashboard/teachers', { state: { openAddModal: true } });
                                  return;
                                }
                                handleAssignTeacher(sec.id, e.target.value);
                              }}
                              className="w-full bg-white border border-[#E5E0D8] rounded px-2 py-1 text-[10px] font-bold text-[#1A1918] focus:outline-none focus:border-[#1B2A4A] cursor-pointer"
                            >
                              <option value="">Not Assigned</option>
                              {availableTeachers.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.user?.first_name} {t.user?.last_name}
                                </option>
                              ))}
                              {availableTeachers.length === 0 && (
                                <option value="ADD_TEACHER" className="font-bold text-[#5C1D24]">
                                  + Add Teacher
                                </option>
                              )}
                            </select>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-xs text-[#64748B] italic">No sections added yet.</span>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              className="w-full gap-2 mt-4"
              onClick={() => openSectionModal(cls.id)}
              disabled={!hasActiveSession}
            >
              <Plus className="w-3.5 h-3.5 text-[#1B2A4A]" /> Add Section
            </Button>
          </div>
        ))}

        {classes.length === 0 && !loading && (
          <div className="col-span-full bg-white p-12 text-center text-[#64748B] rounded-xl border border-[#E5E0D8] shadow-sm font-medium italic">
            No classes configured yet. Click "Add Class" to start.
          </div>
        )}
      </div>

      {/* Add Class Modal (Multi-Select Supported) */}
      <Modal isOpen={classModalOpen} onClose={() => { setClassModalOpen(false); setError(''); }} title="Add Class Levels">
        <form onSubmit={handleAddClass} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] font-bold text-[#1A1918] uppercase tracking-wider">
                Select Class Levels to Add *
              </label>
              {selectedClassNames.length > 0 && (
                <span className="text-[10px] font-bold text-[#5C1D24] bg-[#5C1D24]/10 px-2 py-0.5 rounded-full">
                  {selectedClassNames.length} Selected
                </span>
              )}
            </div>

            {/* Pre-School / Kindergarten Section */}
            <div className="space-y-1.5 mb-4">
              <div className="text-[10px] font-bold text-[#5C1D24] uppercase tracking-wider">Kindergarten / Pre-School</div>
              <div className="grid grid-cols-3 gap-2">
                {['Nursery', 'LKG', 'UKG'].map((clsName) => {
                  const alreadyExists = classes.some(c => c.name.toLowerCase() === clsName.toLowerCase());
                  const isSelected = selectedClassNames.includes(clsName);
                  return (
                    <button
                      key={clsName}
                      type="button"
                      disabled={alreadyExists}
                      onClick={() => toggleClassSelection(clsName)}
                      className={`px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer whitespace-nowrap ${
                        alreadyExists
                          ? 'bg-[#F7F5F0]/60 border-[#E5E0D8] text-[#94A3B8] cursor-not-allowed select-none'
                          : isSelected
                          ? 'bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-md ring-2 ring-[#1B2A4A]/20 scale-[1.02]'
                          : 'bg-[#F7F5F0] border-[#E5E0D8] text-[#1A1918] hover:border-[#1B2A4A] hover:bg-white shadow-2xs'
                      }`}
                    >
                      <span className="whitespace-nowrap">{clsName}</span>
                      {alreadyExists ? (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded shrink-0">✓ Added</span>
                      ) : isSelected ? (
                        <Check className="w-3.5 h-3.5 text-white shrink-0" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary & Secondary Grades Section */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-[#5C1D24] uppercase tracking-wider">Primary & Secondary Grades</div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'].map((clsName) => {
                  const alreadyExists = classes.some(c => c.name.toLowerCase() === clsName.toLowerCase());
                  const isSelected = selectedClassNames.includes(clsName);
                  return (
                    <button
                      key={clsName}
                      type="button"
                      disabled={alreadyExists}
                      onClick={() => toggleClassSelection(clsName)}
                      className={`px-1.5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 border cursor-pointer whitespace-nowrap ${
                        alreadyExists
                          ? 'bg-[#F7F5F0]/60 border-[#E5E0D8] text-[#94A3B8] cursor-not-allowed select-none'
                          : isSelected
                          ? 'bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-md ring-2 ring-[#1B2A4A]/20 scale-[1.02]'
                          : 'bg-[#F7F5F0] border-[#E5E0D8] text-[#1A1918] hover:border-[#1B2A4A] hover:bg-white shadow-2xs'
                      }`}
                    >
                      <span className="whitespace-nowrap">{clsName}</span>
                      {alreadyExists ? (
                        <span className="text-[10px] text-emerald-700 font-extrabold shrink-0">✓</span>
                      ) : isSelected ? (
                        <Check className="w-3.5 h-3.5 text-white shrink-0" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-[10px] text-[#64748B] mt-3 font-medium font-sans">
              Click multiple class pills to select and batch-create them at once. Configured classes are marked with a green check (✓).
            </p>
          </div>

          <Button type="submit" variant="primary" className="w-full mt-2 shadow-sm" loading={submitting}>
            {submitting 
              ? "Creating Classes..." 
              : selectedClassNames.length > 0 
              ? `Create ${selectedClassNames.length} Class${selectedClassNames.length > 1 ? 'es' : ''}` 
              : "Create Selected Classes"}
          </Button>
        </form>
      </Modal>

      {/* Add Section Modal (Multi-Select Supported) */}
      <Modal isOpen={sectionModalOpen} onClose={() => { setSectionModalOpen(false); setError(''); }} title="Add Section Divisions">
        <form onSubmit={handleAddSection} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] font-bold text-[#1A1918] uppercase tracking-wider">
                Select Section Divisions to Add *
              </label>
              {selectedSectionLetters.length > 0 && (
                <span className="text-[10px] font-bold text-[#5C1D24] bg-[#5C1D24]/10 px-2 py-0.5 rounded-full">
                  {selectedSectionLetters.length} Selected
                </span>
              )}
            </div>
            
            {(() => {
              const targetClass = classes.find(c => c.id === selectedClassId);
              const existingSectionNames = new Set(
                targetClass?.sections?.map(s => s.name.replace(/^section\s*/i, '').trim().toUpperCase()) || []
              );

              return (
                <div className="grid grid-cols-3 gap-3">
                  {['A', 'B', 'C'].map((letter) => {
                    const alreadyExists = existingSectionNames.has(letter);
                    const isSelected = selectedSectionLetters.includes(letter);

                    return (
                      <button
                        key={letter}
                        type="button"
                        disabled={alreadyExists}
                        onClick={() => toggleSectionSelection(letter)}
                        className={`p-3 rounded-lg text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                          alreadyExists
                            ? 'bg-[#F7F5F0]/60 border-[#E5E0D8] text-[#94A3B8] cursor-not-allowed select-none'
                            : isSelected
                            ? 'bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-md ring-2 ring-[#1B2A4A]/20 scale-[1.02]'
                            : 'bg-[#F7F5F0] border-[#E5E0D8] text-[#1A1918] hover:border-[#1B2A4A] hover:bg-white shadow-2xs'
                        }`}
                      >
                        <span>Section {letter}</span>
                        {alreadyExists ? (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">✓ Added</span>
                        ) : isSelected ? (
                          <Check className="w-3.5 h-3.5 text-white" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              );
            })()}

            <p className="text-[10px] text-[#64748B] mt-2 font-medium font-sans">
              Click multiple section pills to batch-add Section A, Section B, or Section C. You can assign class teachers directly on each section card after creation.
            </p>
          </div>

          <Button type="submit" variant="primary" className="w-full mt-2 shadow-sm" loading={submitting}>

            {submitting 
              ? "Creating Sections..." 
              : selectedSectionLetters.length > 0 
              ? `Create ${selectedSectionLetters.length} Section${selectedSectionLetters.length > 1 ? 's' : ''}` 
              : "Create Selected Sections"}
          </Button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={deleteConfirmOpen} 
        onClose={() => setDeleteConfirmOpen(false)} 
        title={`Confirm Delete ${deleteTarget?.type === 'class' ? 'Class Level' : 'Section'}`}
      >
        <div className="space-y-6 text-center py-4">
          <div className="w-12 h-12 rounded-full bg-[#5C1D24]/10 border border-[#5C1D24]/20 text-[#5C1D24] flex items-center justify-center mx-auto mb-2">
            <Trash2 className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#1A1918]">Are you absolutely sure?</h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto leading-relaxed">
              This will permanently delete the {deleteTarget?.type === 'class' ? 'Class' : 'Section'} <strong className="text-[#1A1918]">"{deleteTarget?.name}"</strong> and all associated session registers, timetables, and links. This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              className="flex-1 text-xs" 
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              className="flex-1 text-xs bg-[#5C1D24] text-white hover:bg-[#5C1D24]/90" 
              onClick={handleConfirmDelete}
              loading={submitting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClassesSections;
