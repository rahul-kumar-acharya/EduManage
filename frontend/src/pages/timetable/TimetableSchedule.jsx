import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { timetableService } from '../../services/timetableService';
import { academicService } from '../../services/academicService';
import { teacherService } from '../../services/teacherService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { Clock, Plus, Trash2, Calendar, Printer, Save, MapPin, Search, AlertCircle, UserCheck } from 'lucide-react';

const DAYS = [
  { code: 'MON', name: 'Monday' },
  { code: 'TUE', name: 'Tuesday' },
  { code: 'WED', name: 'Wednesday' },
  { code: 'THU', name: 'Thursday' },
  { code: 'FRI', name: 'Friday' },
  { code: 'SAT', name: 'Saturday' },
];

const PERIOD_TEMPLATES = [
  { num: 1, start: '08:00', end: '08:45', label: '08:00 AM - 08:45 AM' },
  { num: 2, start: '08:45', end: '09:30', label: '08:45 AM - 09:30 AM' },
  { num: 3, start: '09:30', end: '10:15', label: '09:30 AM - 10:15 AM' },
  { num: 4, start: '10:15', end: '11:00', label: '10:15 AM - 11:00 AM' },
  { isBreak: true, label: 'LUNCH BREAK', start: '11:00', end: '11:30' },
  { num: 5, start: '11:30', end: '12:15', label: '11:30 AM - 12:15 PM' },
  { num: 6, start: '12:15', end: '13:00', label: '12:15 PM - 01:00 PM' },
  { num: 7, start: '13:00', end: '13:45', label: '01:00 PM - 01:45 PM' },
  { num: 8, start: '13:45', end: '14:30', label: '01:45 PM - 02:30 PM' },
];

const TimetableSchedule = () => {
  const { user } = useAuth();
  const canManageTimetable = user?.permissions?.manage_timetable ?? false;
  const [periods, setPeriods] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [selectedSection, setSelectedSection] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [conflictError, setConflictError] = useState(null);

  // Free Period / Substitute Teacher Finder State
  const [substituteModalOpen, setSubstituteModalOpen] = useState(false);
  const [substituteQuery, setSubstituteQuery] = useState({
    day_of_week: 'MON',
    period_num: 1,
    start_time: '08:00',
    end_time: '08:45'
  });
  const [freeTeachers, setFreeTeachers] = useState([]);
  const [loadingFreeTeachers, setLoadingFreeTeachers] = useState(false);

  // Bulk Day Routine Form Data
  const [bulkFormData, setBulkFormData] = useState({
    day_of_week: 'MON',
    periods: {} // Map period numbers (1-8) to { subject: '', teacher: '', room_number: 'Main Classroom' }
  });


  const fetchDropdowns = async () => {
    try {
      const secRes = await academicService.getSections();
      const secList = secRes.results || secRes;
      setSections(secList);
      
      const [subRes, teachRes] = await Promise.all([
        academicService.getSubjects(),
        teacherService.getTeachers(),
      ]);

      const teacherList = teachRes.results || teachRes;
      setSubjects(subRes.results || subRes);
      setTeachers(teacherList);

      let initialSection = '';
      if (user?.role === 'TEACHER') {
        initialSection = 'MY_SCHEDULE';
      } else if (secList.length > 0) {
        initialSection = secList[0].id.toString();
      }

      setSelectedSection(initialSection);
    } catch (err) {
      console.error("Failed to fetch dropdowns:", err);
    }
  };

  const fetchPeriods = async () => {
    if (!selectedSection) return;
    setLoading(true);
    try {
      let params = {};
      if (selectedSection === 'MY_SCHEDULE') {
        let tId = user?.teacher_profile_id;
        if (!tId) {
          const currentTeacher = teachers.find((t) => t.user?.id === user?.id);
          tId = currentTeacher?.id;
        }
        if (tId) {
          params = { teacher: tId };
        }
      } else {
        params = { section: selectedSection };
      }
      const data = await timetableService.getPeriods(params);
      setPeriods(data.results || data);
    } catch (err) {
      console.error("Failed to fetch periods:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    if (selectedSection) {
      fetchPeriods();
    }
  }, [selectedSection, teachers]);

  // Reload subjects dynamically when selected section changes to ensure class level subjects are shown
  useEffect(() => {
    const loadSubjectsForSection = async () => {
      if (!selectedSection || selectedSection === 'MY_SCHEDULE' || sections.length === 0) return;
      const activeSec = sections.find(s => s.id.toString() === selectedSection);
      if (activeSec) {
        try {
          const subRes = await academicService.getSubjects({ class_level: activeSec.class_level });
          setSubjects(subRes.results || subRes);
        } catch (err) {
          console.error("Failed to fetch subjects for class level:", err);
        }
      }
    };
    loadSubjectsForSection();
  }, [selectedSection, sections]);

  const handleDelete = async (id) => {
    if (window.confirm("Remove this period from timetable?")) {
      try {
        await timetableService.deletePeriod(id);
        fetchPeriods();
      } catch (err) {
        console.error("Failed to delete period:", err);
      }
    }
  };

  // Pre-populate the bulk form for a specific day when modal opens or day changes
  const populateBulkForm = (dayCode, activePeriods = periods) => {
    const dayPeriods = activePeriods.filter((p) => p.day_of_week === dayCode);
    const newPeriodsData = {};

    [1, 2, 3, 4, 5, 6, 7, 8].forEach((num) => {
      const slot = PERIOD_TEMPLATES.find((s) => s.num === num);
      const matched = dayPeriods.find(
        (p) => p.start_time.startsWith(slot.start) && p.end_time.startsWith(slot.end)
      );

      newPeriodsData[num] = {
        subject: matched ? matched.subject?.toString() : '',
        teacher: matched ? matched.teacher?.toString() : '',
        room_number: matched ? (matched.room_number || 'Main Classroom') : 'Main Classroom',
      };
    });

    setConflictError(null);
    setBulkFormData({
      day_of_week: dayCode,
      periods: newPeriodsData,
    });
  };

  // Listen to periods loading to refresh form values dynamically
  useEffect(() => {
    if (periods.length > 0 && modalOpen) {
      populateBulkForm(bulkFormData.day_of_week);
    }
  }, [periods, modalOpen]);

  const openBulkScheduler = (day = 'MON') => {
    populateBulkForm(day);
    setConflictError(null);
    setModalOpen(true);
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setConflictError(null);
    try {
      // 1. Delete all existing periods for that day to avoid conflicts
      const existingPeriods = periods.filter((p) => p.day_of_week === bulkFormData.day_of_week);
      if (existingPeriods.length > 0) {
        await Promise.all(existingPeriods.map((p) => timetableService.deletePeriod(p.id)));
      }

      // 2. Submit new routine periods in parallel
      const promises = Object.keys(bulkFormData.periods).map((periodNumStr) => {
        const periodNum = parseInt(periodNumStr);
        const slot = PERIOD_TEMPLATES.find((s) => s.num === periodNum);
        const data = bulkFormData.periods[periodNumStr];

        if (data.subject) {
          return timetableService.createPeriod({
            section: selectedSection,
            subject: data.subject,
            teacher: data.teacher || null,
            day_of_week: bulkFormData.day_of_week,
            start_time: slot.start,
            end_time: slot.end,
            room_number: data.room_number || 'Main Classroom',
          });
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      setModalOpen(false);
      fetchPeriods();
    } catch (err) {
      console.error("Failed to save day routine:", err);
      const backendError = err.response?.data?.teacher || err.response?.data?.non_field_errors || "Failed to save day routine due to conflict.";
      setConflictError(Array.isArray(backendError) ? backendError.join(' ') : backendError);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchFreeTeachers = async (day, slotNum) => {
    const slot = PERIOD_TEMPLATES.find(s => s.num === slotNum);
    if (!slot) return;
    setLoadingFreeTeachers(true);
    try {
      const data = await timetableService.getFreeTeachers({
        day_of_week: day,
        start_time: slot.start,
        end_time: slot.end
      });
      setFreeTeachers(data.results || data);
    } catch (err) {
      console.error("Failed to fetch available substitute teachers:", err);
    } finally {
      setLoadingFreeTeachers(false);
    }
  };

  const handleOpenSubstituteFinder = () => {
    fetchFreeTeachers(substituteQuery.day_of_week, substituteQuery.period_num);
    setSubstituteModalOpen(true);
  };

  const handleSubstituteQueryChange = (field, value) => {
    const updated = { ...substituteQuery, [field]: value };
    setSubstituteQuery(updated);
    fetchFreeTeachers(updated.day_of_week, updated.period_num);
  };


  const selectedSectionDetails = sections.find((sec) => sec.id.toString() === selectedSection);

  const handlePrint = () => {
    window.print();
  };

  const handleBulkPeriodChange = (periodNum, field, value) => {
    setBulkFormData((prev) => ({
      ...prev,
      periods: {
        ...prev.periods,
        [periodNum]: {
          ...prev.periods[periodNum],
          [field]: value,
        },
      },
    }));
  };

  const isUserAdmin = user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN';
  const isClassTeacherOfSelectedSec = user?.class_teacher_sections?.some(
    (s) => s.id.toString() === selectedSection
  );
  const canManageCurrentSection = isUserAdmin || (user?.role === 'TEACHER' && isClassTeacherOfSelectedSec);

  return (
    <div className="space-y-6 font-['Inter'] text-slate-900 print:p-8 print:bg-white print:text-black">
      
      {/* Category Pill Indicator */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-50 border border-indigo-200/60 text-[10px] font-bold text-indigo-700 uppercase tracking-wider print:hidden">
        <Clock className="w-3.5 h-3.5 text-indigo-600" />
        <span>Academic Timetable Engine</span>
      </div>

      {/* Main Title & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-['Outfit'] text-slate-900 tracking-tight">Class Timetable Schedule</h1>
          <p className="text-sm text-slate-500 mt-1">Manage daily subject routines, faculty assignments, and weekly class periods.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleOpenSubstituteFinder} className="gap-2 shadow-xs">
            <Search className="w-4 h-4 text-slate-600" /> Substitute Finder
          </Button>
          {periods.length > 0 && (
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 shadow-xs">
              <Printer className="w-4 h-4 text-slate-600" /> Print Routine
            </Button>
          )}
          {canManageCurrentSection && (
            <Button variant="primary" size="sm" onClick={() => openBulkScheduler('MON')} className="gap-2 shadow-xs">
              <Plus className="w-4 h-4" /> Schedule Day Routine
            </Button>
          )}
        </div>
      </div>

      {/* Segmented View Switcher & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4 print:hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Tab Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            {user?.role === 'TEACHER' && (
              <button
                type="button"
                onClick={() => setSelectedSection('MY_SCHEDULE')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  selectedSection === 'MY_SCHEDULE'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ⭐ My Teaching Routine
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (selectedSection === 'MY_SCHEDULE' && sections.length > 0) {
                  setSelectedSection(sections[0].id.toString());
                }
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                selectedSection !== 'MY_SCHEDULE'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏫 Class Section Routines
            </button>
          </div>

          {/* Section Selector Dropdown (when inspecting Class Routines) */}
          {selectedSection !== 'MY_SCHEDULE' && (
            <div className="flex items-center gap-3 w-full md:w-auto">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap font-['Outfit']">
                Select Class:
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full md:w-72 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
              >
                {sections.map((sec) => {
                  const isMyHomeroom = user?.class_teacher_sections?.some(s => s.id === sec.id);
                  return (
                    <option key={sec.id} value={sec.id.toString()}>
                      {sec.class_name} - Section {sec.name} {isMyHomeroom ? '⭐ (My Homeroom)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Routine Banner Info Header */}
      {selectedSection === 'MY_SCHEDULE' ? (
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 print:border-none print:shadow-none print:bg-transparent">
          <div>
            <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-['Outfit']">
              Faculty Routine Summary
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">
              Personal Teaching Schedule — {user?.first_name} {user?.last_name}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="primary" className="text-xs font-semibold">
              {periods.length} Total Periods Taught
            </Badge>
          </div>
        </div>
      ) : selectedSectionDetails && (
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 print:border-none print:shadow-none print:bg-transparent">
          <div>
            <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-['Outfit']">
              Weekly Routine Presentation
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">
              {selectedSectionDetails.class_name} — Section {selectedSectionDetails.name}
            </h2>
            <div className="text-xs text-slate-500 mt-0.5">
              Class Teacher: <span className="font-semibold text-slate-800">{selectedSectionDetails.class_teacher_name || 'Not Assigned'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canManageCurrentSection ? (
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                ✓ Homeroom Management Active
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold">
                🔒 Read-Only Overview
              </span>
            )}
          </div>
        </div>
      )}

      {/* Timetable Weekly Matrix Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden print:border-black">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400 font-medium animate-pulse print:hidden">
            Synchronizing class schedules and routine matrix...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-250 table-fixed">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 print:bg-gray-100 print:border-black">
                  <th className="px-4 py-3.5 text-xs font-bold text-slate-800 border-r border-slate-200 w-35 print:text-black print:border-black font-['Outfit']">
                    Day / Time
                  </th>
                  {PERIOD_TEMPLATES.map((slot, index) => {
                    if (slot.isBreak) {
                      return (
                        <th key={index} className="px-4 py-3.5 text-center border-r border-slate-200 w-24 bg-amber-50 print:bg-gray-200 print:border-black">
                          <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider print:text-black font-['Outfit']">
                            LUNCH
                          </div>
                          <div className="text-[9px] text-slate-500 font-mono mt-0.5 print:text-black">
                            11:00-11:30
                          </div>
                        </th>
                      );
                    }
                    return (
                      <th key={index} className="px-4 py-3.5 text-center border-r border-slate-200 last:border-r-0 print:border-black">
                        <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider print:text-black font-['Outfit']">
                          Period {slot.num}
                        </div>
                        <div className="text-[9px] text-slate-500 font-mono mt-0.5 print:text-black">
                          {slot.start} - {slot.end}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day) => {
                  const dayPeriods = periods.filter((p) => p.day_of_week === day.code);
                  return (
                    <tr key={day.code} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors print:border-black">
                      {/* Day Column */}
                      <td className="px-4 py-4 font-bold text-slate-900 bg-slate-50/70 border-r border-slate-200 flex-col justify-center print:bg-gray-50 print:text-black print:border-black">
                        <div className="text-xs font-bold text-slate-900 font-['Outfit']">{day.name}</div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5 font-mono print:text-black">
                          {dayPeriods.length} slots
                        </div>
                        {canManageCurrentSection && (
                          <button
                            onClick={() => openBulkScheduler(day.code)}
                            className="text-[10px] text-indigo-600 hover:text-indigo-700 hover:underline block mt-2 print:hidden font-semibold"
                          >
                            Edit Day Routine
                          </button>
                        )}
                      </td>

                      {/* Period Cells */}
                      {PERIOD_TEMPLATES.map((slot, sIdx) => {
                        if (slot.isBreak) {
                          return (
                            <td
                              key={sIdx}
                              className="p-2 border-r border-slate-200 bg-amber-50/50 text-center font-bold text-[10px] text-amber-800 uppercase tracking-widest select-none font-mono print:border-black print:bg-gray-50"
                            >
                              LUNCH
                            </td>
                          );
                        }

                        const period = dayPeriods.find(
                          (p) => p.start_time.startsWith(slot.start) && p.end_time.startsWith(slot.end)
                        );

                        return (
                          <td
                            key={sIdx}
                            className="p-2 border-r border-slate-200 last:border-r-0 text-center relative group min-h-18 print:border-black"
                          >
                            {period ? (
                              <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-2.5 space-y-1 relative group-hover:bg-indigo-50 hover:shadow-xs transition-all print:bg-transparent print:border-none">
                                <div className="text-xs font-bold text-indigo-950 font-['Outfit'] print:text-black">
                                  {period.subject_details?.name || 'Subject'}
                                </div>
                                {selectedSection === 'MY_SCHEDULE' ? (
                                  <div className="text-[10px] font-semibold text-indigo-700">
                                    {period.section_details?.class_name || 'Class'} - Sec {period.section_details?.name || ''}
                                  </div>
                                ) : (
                                  <div className="text-[10px] text-slate-600 font-medium print:text-black">
                                    {period.teacher_details?.user?.first_name} {period.teacher_details?.user?.last_name?.[0]}.
                                  </div>
                                )}
                                
                                {/* Room Tag Badge */}
                                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[9px] font-semibold text-slate-700 mt-1 print:border-none shadow-2xs">
                                  <MapPin className="w-2.5 h-2.5 text-indigo-600" />
                                  <span>{period.room_number || 'Main Class'}</span>
                                </div>

                                {/* Floating delete button visible on hover */}
                                {canManageCurrentSection && (
                                  <button
                                    onClick={() => handleDelete(period.id)}
                                    className="absolute -top-1.5 -right-1.5 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-xs print:hidden"
                                    title="Remove Slot"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>
                            ) : (
                              canManageCurrentSection ? (
                                <button
                                  onClick={() => openBulkScheduler(day.code)}
                                  className="w-full h-full min-h-12 rounded-lg border border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all group/btn print:hidden"
                                  title={`Schedule Day Routine for ${day.name}`}
                                >
                                  <Plus className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                </button>
                              ) : (
                                <div className="text-[10px] text-slate-300 italic">-</div>
                              )
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bulk Day Routine Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        maxWidth="max-w-5xl"
        title={`Schedule Routine for ${DAYS.find((d) => d.code === bulkFormData.day_of_week)?.name}`}
      >
        <form onSubmit={handleBulkSubmit} className="space-y-4">
          
          {/* Conflict Error Alert */}
          {conflictError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div>{conflictError}</div>
            </div>
          )}

          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-['Outfit']">
                Selecting Target Day:
              </label>
              <select
                value={bulkFormData.day_of_week}
                onChange={(e) => populateBulkForm(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                {DAYS.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-[11px] text-slate-500 font-medium italic">
              Note: Saving will overwrite any existing timetable slots for this day.
            </div>
          </div>

          {/* 2-Column Grid: Morning (1-4) & Afternoon (5-8) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Morning Session Column (Periods 1-4) */}
            <div className="space-y-2.5 bg-slate-50/60 p-3 rounded-xl border border-slate-200">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center justify-between font-['Outfit']">
                <span>Morning Session</span>
                <span className="text-[10px] text-slate-500 font-normal">Periods 1 – 4</span>
              </div>
              {[1, 2, 3, 4].map((num) => {
                const slot = PERIOD_TEMPLATES.find((s) => s.num === num);
                const pData = bulkFormData.periods[num] || { subject: '', teacher: '', room_number: 'Main Classroom' };

                return (
                  <div key={num} className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>Period {num}</span>
                      <span className="text-[10px] text-slate-500 font-mono font-medium">{slot.start} - {slot.end}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={pData.subject}
                        onChange={(e) => handleBulkPeriodChange(num, 'subject', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                      >
                        <option value="">No Class</option>
                        {subjects.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name}
                          </option>
                        ))}
                      </select>

                      <select
                        value={pData.teacher}
                        onChange={(e) => handleBulkPeriodChange(num, 'teacher', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                        disabled={!pData.subject}
                      >
                        <option value="">Assign Teacher</option>
                        {teachers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.user?.first_name} {t.user?.last_name}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        placeholder="Room / Lab"
                        value={pData.room_number || ''}
                        onChange={(e) => handleBulkPeriodChange(num, 'room_number', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                        disabled={!pData.subject}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Afternoon Session Column (Periods 5-8) */}
            <div className="space-y-2.5 bg-slate-50/60 p-3 rounded-xl border border-slate-200">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center justify-between font-['Outfit']">
                <span>Afternoon Session</span>
                <span className="text-[10px] text-slate-500 font-normal">Periods 5 – 8</span>
              </div>
              {[5, 6, 7, 8].map((num) => {
                const slot = PERIOD_TEMPLATES.find((s) => s.num === num);
                const pData = bulkFormData.periods[num] || { subject: '', teacher: '', room_number: 'Main Classroom' };

                return (
                  <div key={num} className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>Period {num}</span>
                      <span className="text-[10px] text-slate-500 font-mono font-medium">{slot.start} - {slot.end}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={pData.subject}
                        onChange={(e) => handleBulkPeriodChange(num, 'subject', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                      >
                        <option value="">No Class</option>
                        {subjects.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name}
                          </option>
                        ))}
                      </select>

                      <select
                        value={pData.teacher}
                        onChange={(e) => handleBulkPeriodChange(num, 'teacher', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                        disabled={!pData.subject}
                      >
                        <option value="">Assign Teacher</option>
                        {teachers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.user?.first_name} {t.user?.last_name}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        placeholder="Room / Lab"
                        value={pData.room_number || ''}
                        onChange={(e) => handleBulkPeriodChange(num, 'room_number', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                        disabled={!pData.subject}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full mt-3 gap-2 shadow-xs" loading={submitting}>
            <Save className="w-4 h-4" /> Save Day Routine
          </Button>
        </form>
      </Modal>

      {/* Free Period / Substitute Teacher Finder Modal */}
      <Modal
        isOpen={substituteModalOpen}
        onClose={() => setSubstituteModalOpen(false)}
        maxWidth="max-w-2xl"
        title="🔍 Free Period & Substitute Teacher Finder"
      >
        <div className="space-y-4 font-['Inter']">
          <p className="text-xs text-slate-500">
            Query unassigned faculty members available for proxy substitution during any target day and period slot.
          </p>

          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1 font-['Outfit']">
                Select Day
              </label>
              <select
                value={substituteQuery.day_of_week}
                onChange={(e) => handleSubstituteQueryChange('day_of_week', e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                {DAYS.map((d) => (
                  <option key={d.code} value={d.code}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1 font-['Outfit']">
                Select Period Slot
              </label>
              <select
                value={substituteQuery.period_num}
                onChange={(e) => handleSubstituteQueryChange('period_num', parseInt(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                  const s = PERIOD_TEMPLATES.find(p => p.num === num);
                  return (
                    <option key={num} value={num}>
                      Period {num} ({s.start} - {s.end})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-800 flex items-center justify-between font-['Outfit']">
              <span>Available Unassigned Faculty ({freeTeachers.length})</span>
              {loadingFreeTeachers && <span className="text-[10px] text-slate-400 animate-pulse">Searching...</span>}
            </div>

            {freeTeachers.length === 0 && !loadingFreeTeachers ? (
              <div className="py-8 text-center text-xs text-slate-400 italic bg-slate-50/50 rounded-xl border border-slate-200">
                No free teachers available during this period slot.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto">
                {freeTeachers.map((t) => (
                  <div key={t.id} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs">
                    <div>
                      <div className="text-xs font-bold text-slate-900 font-['Outfit']">
                        {t.user?.first_name} {t.user?.last_name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Employee ID: {t.employee_id || 'N/A'}
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold">
                      <UserCheck className="w-3 h-3" /> Free
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default TimetableSchedule;
