import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { academicService } from '../../services/academicService';
import { teacherService } from '../../services/teacherService';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { GraduationCap, Layers, Plus, Trash2 } from 'lucide-react';

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

  const [classModalOpen, setClassModalOpen] = useState(false);
  const [selectedClassName, setSelectedClassName] = useState('');

  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [sectionLetter, setSectionLetter] = useState('');
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
    setSelectedClassName('');
    setClassModalOpen(true);
  };

  const openSectionModal = (classId) => {
    setError('');
    setSelectedClassId(classId);
    setSectionLetter('');
    setSelectedTeacherId('');
    setSectionModalOpen(true);
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (!selectedClassName) {
        setError("Please select a valid class level (Nursery, LKG, UKG, or Grade 1 to 10).");
        setSubmitting(false);
        return;
      }
      await academicService.createClass({ name: selectedClassName });
      setSelectedClassName('');
      setClassModalOpen(false);
      fetchClasses();
    } catch (err) {
      console.error("Failed to add class:", err);
      if (err.response && err.response.data && err.response.data.name) {
        const nameErr = Array.isArray(err.response.data.name) ? err.response.data.name.join(' ') : err.response.data.name;
        setError(nameErr);
      } else if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Failed to add class level. Make sure an active session exists.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const cleanSec = sectionLetter.replace(/[^a-zA-Z0-9]/g, '').trim().toUpperCase();
      if (!cleanSec) {
        setError("Section division must be valid letters (e.g. A, B, C).");
        setSubmitting(false);
        return;
      }
      const finalSectionName = `Section ${cleanSec}`;
      const payload = { 
        class_level: selectedClassId, 
        name: finalSectionName 
      };
      if (selectedTeacherId && selectedTeacherId !== 'ADD_TEACHER') {
        payload.class_teacher = parseInt(selectedTeacherId);
      }
      await academicService.createSection(payload);
      setSectionLetter('');
      setSelectedTeacherId('');
      setSectionModalOpen(false);
      fetchClasses();
      fetchDropdownData();
    } catch (err) {
      console.error("Failed to add section:", err);
      if (err.response && err.response.data && err.response.data.name) {
        const nameErr = Array.isArray(err.response.data.name) ? err.response.data.name.join(' ') : err.response.data.name;
        setError(nameErr);
      } else if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Failed to add section. Make sure a valid section letter is entered.");
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

      {/* Add Class Modal */}
      <Modal isOpen={classModalOpen} onClose={() => { setClassModalOpen(false); setError(''); }} title="Add Class Level">
        <form onSubmit={handleAddClass} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}
          <div>
            <label className="block text-[10px] font-bold text-[#1A1918] uppercase tracking-wider mb-2">
              Select Class Level *
            </label>
            <select
              value={selectedClassName}
              onChange={(e) => setSelectedClassName(e.target.value)}
              className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg px-4 py-2.5 text-xs font-bold text-[#1A1918] focus:outline-none focus:border-[#1B2A4A] cursor-pointer"
              required
            >
              <option value="">-- Select Class (Nursery, LKG, UKG, Grade 1 to 10) --</option>
              {ALLOWED_CLASSES.map((clsName) => {
                const alreadyExists = classes.some(c => c.name.toLowerCase() === clsName.toLowerCase());
                return (
                  <option key={clsName} value={clsName} disabled={alreadyExists}>
                    {clsName} {alreadyExists ? '(Already Added)' : ''}
                  </option>
                );
              })}
            </select>
            <p className="text-[10px] text-[#64748B] mt-1 font-medium font-sans">
              Class levels are restricted to Nursery, LKG, UKG, and Grade 1 through Grade 10.
            </p>
          </div>

          <Button type="submit" variant="primary" className="w-full mt-2" loading={submitting}>
            Create Class
          </Button>
        </form>
      </Modal>

      {/* Add Section Modal */}
      <Modal isOpen={sectionModalOpen} onClose={() => { setSectionModalOpen(false); setError(''); }} title="Add Section Division">
        <form onSubmit={handleAddSection} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-[#1A1918] uppercase tracking-wider mb-2">
              Section Division *
            </label>
            <div className="flex items-center">
              <span className="bg-[#E5E0D8] text-[#1B2A4A] text-xs font-bold px-3.5 py-2.5 rounded-l-lg border border-r-0 border-[#E5E0D8] select-none shrink-0">
                Section
              </span>
              <input
                type="text"
                required
                placeholder="A (or B, C - auto capitalized)"
                value={sectionLetter}
                onChange={(e) => setSectionLetter(e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase())}
                className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-r-lg px-3.5 py-2.5 text-xs text-[#1A1918] font-bold uppercase focus:outline-none focus:border-[#1B2A4A]"
              />
            </div>
            <p className="text-[10px] text-[#64748B] mt-1 font-medium font-sans">"Section" prefix is permanently locked. Type letters only (e.g. A, B). Automatically converted to uppercase.</p>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#1A1918] uppercase tracking-wider mb-2">
              Assign Class Teacher
            </label>
            
            <select
              value={selectedTeacherId}
              onChange={(e) => {
                if (e.target.value === 'ADD_TEACHER') {
                  setSectionModalOpen(false);
                  navigate('/dashboard/teachers', { state: { openAddModal: true } });
                  return;
                }
                setSelectedTeacherId(e.target.value);
              }}
              className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg px-4 py-2.5 text-xs font-semibold text-[#1A1918] focus:outline-none focus:border-[#1B2A4A] transition-colors cursor-pointer"
            >
              <option value="">No Class Teacher Assigned</option>
              {availableUnassignedTeachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.user?.first_name} {t.user?.last_name} ({t.employee_id})
                </option>
              ))}
              {availableUnassignedTeachers.length === 0 && (
                <option value="ADD_TEACHER" className="font-bold text-[#5C1D24]">
                  + Add Teacher
                </option>
              )}
            </select>
          </div>

          <Button type="submit" variant="primary" className="w-full mt-2" loading={submitting}>
            Create Section
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
