import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { timetableService } from '../../services/timetableService';
import { academicService } from '../../services/academicService';
import { teacherService } from '../../services/teacherService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { Clock, Plus, Trash2, Calendar, Printer, Save } from 'lucide-react';

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

  // Bulk Day Routine Form Data
  const [bulkFormData, setBulkFormData] = useState({
    day_of_week: 'MON',
    periods: {} // Map period numbers (1-8) to { subject: '', teacher: '' }
  });

  const fetchDropdowns = async () => {
    try {
      const secParams = user?.role === 'TEACHER' ? { class_teacher_only: 'true' } : {};
      const secRes = await academicService.getSections(secParams);
      const secList = secRes.results || secRes;
      setSections(secList);
      
      let initialSection = '';
      if (secList.length > 0) {
        initialSection = secList[0].id.toString();
        setSelectedSection(initialSection);
      }

      const firstSec = secList[0];
      const subParams = firstSec ? { class_level: firstSec.class_level } : {};
      
      const [subRes, teachRes] = await Promise.all([
        academicService.getSubjects(subParams),
        teacherService.getTeachers(),
      ]);

      setSubjects(subRes.results || subRes);
      setTeachers(teachRes.results || teachRes);
    } catch (err) {
      console.error("Failed to fetch dropdowns:", err);
    }
  };

  const fetchPeriods = async () => {
    if (!selectedSection) return;
    setLoading(true);
    try {
      const data = await timetableService.getPeriods({ section: selectedSection });
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
    fetchPeriods();
  }, [selectedSection]);

  // Reload subjects dynamically when selected section changes to ensure class level subjects are shown
  useEffect(() => {
    const loadSubjectsForSection = async () => {
      if (!selectedSection || sections.length === 0) return;
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
      };
    });

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
    setModalOpen(true);
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
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
          });
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      setModalOpen(false);
      fetchPeriods();
    } catch (err) {
      console.error("Failed to save day routine:", err);
    } finally {
      setSubmitting(false);
    }
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

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans'] text-[#1A1918] print:p-8 print:bg-white print:text-black">
      
      {/* Category Pill Indicator */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5C1D24]/10 border border-[#5C1D24]/20 text-[10px] font-bold text-[#5C1D24] uppercase tracking-wider print:hidden">
        <Clock className="w-3.5 h-3.5 text-[#5C1D24]" />
        <span>Timetable Scheduler Calendar</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4 print:hidden">
        <div>
          <h1 className="text-3xl font-['Newsreader'] font-bold text-[#1A1918]">Class Timetable Schedule</h1>
          <p className="text-xs text-[#64748B] mt-1">Schedule daily subject periods and assigned faculty for each class section.</p>
        </div>
        <div className="flex items-center gap-3">
          {periods.length > 0 && (
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 shadow-sm">
              <Printer className="w-4 h-4" /> Print Routine
            </Button>
          )}
          {canManageTimetable && (
            <Button variant="primary" size="sm" onClick={() => openBulkScheduler('MON')} className="gap-2 shadow-sm">
              <Plus className="w-4 h-4" /> Schedule Day Routine
            </Button>
          )}
        </div>
      </div>

      {/* Selectors Bar */}
      {user?.role !== 'TEACHER' && (
        <div className="bg-white p-4 rounded-xl border border-[#E5E0D8] shadow-sm max-w-sm print:hidden">
          <label className="block text-[10px] font-bold text-[#1A1918] uppercase tracking-wider mb-2">
            Select Section Timetable
          </label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg px-4 py-2.5 text-xs font-semibold text-[#1A1918] focus:outline-none focus:border-[#1B2A4A] transition-colors"
          >
            {sections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.class_name} - {sec.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Routine Presentation Header - Don Bosco Routine Style */}
      {selectedSectionDetails && (
        <div className="bg-[#F7F5F0] p-6 rounded-xl border border-[#E5E0D8] space-y-2 text-center max-w-4xl mx-auto shadow-sm print:border-none print:shadow-none print:bg-transparent">
          <h2 className="text-xl font-bold uppercase tracking-wider text-[#1B2A4A] font-['Newsreader'] print:text-black">
            {user?.school?.name || "School Timetable"}
          </h2>
          <div className="text-xs font-bold text-[#5C1D24] uppercase tracking-widest print:text-black">
            Weekly Class Routine / Timetable
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-[#E5E0D8] mt-3 text-xs font-semibold text-[#64748B] print:text-black print:border-black">
            <div>
              CLASS SECTION: <span className="font-bold text-[#1A1918] print:text-black">{selectedSectionDetails.class_name} - {selectedSectionDetails.name}</span>
            </div>
            <div>
              CLASS TEACHER: <span className="font-bold text-[#1A1918] print:text-black">
                {selectedSectionDetails.class_teacher_name || "Not Assigned"}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              ACADEMIC SESSION: <span className="font-bold text-[#1A1918] print:text-black">2026 - 2027</span>
            </div>
          </div>
        </div>
      )}

      {/* Timetable Weekly Matrix Grid */}
      <div className="bg-white rounded-xl border border-[#E5E0D8] shadow-sm overflow-hidden print:border-black">
        {loading ? (
          <div className="py-20 text-center text-xs text-[#64748B] font-semibold animate-pulse print:hidden">
            Loading scheduled periods and mapping layout matrix...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-[1000px] table-fixed">
              <thead>
                <tr className="bg-[#F7F5F0] border-b border-[#E5E0D8] print:bg-gray-100 print:border-black">
                  <th className="px-4 py-3.5 text-xs font-bold text-[#1B2A4A] border-r border-[#E5E0D8] w-[140px] print:text-black print:border-black">
                    Day / Time
                  </th>
                  {PERIOD_TEMPLATES.map((slot, index) => {
                    if (slot.isBreak) {
                      return (
                        <th key={index} className="px-4 py-3.5 text-center border-r border-[#E5E0D8] w-[90px] bg-amber-50/50 print:bg-gray-200 print:border-black">
                          <div className="text-[10px] font-bold text-[#5C1D24] uppercase tracking-wider print:text-black">
                            LUNCH
                          </div>
                          <div className="text-[9px] text-[#64748B] font-mono mt-0.5 print:text-black">
                            11:00-11:30
                          </div>
                        </th>
                      );
                    }
                    return (
                      <th key={index} className="px-4 py-3.5 text-center border-r border-[#E5E0D8] last:border-r-0 print:border-black">
                        <div className="text-[10px] font-bold text-[#5C1D24] uppercase tracking-wider print:text-black">
                          Period {slot.num}
                        </div>
                        <div className="text-[9px] text-[#64748B] font-mono mt-0.5 print:text-black">
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
                    <tr key={day.code} className="border-b border-[#E5E0D8] last:border-b-0 hover:bg-[#F7F5F0]/20 transition-colors print:border-black">
                      {/* Day Column */}
                      <td className="px-4 py-4 font-bold text-[#1A1918] bg-[#F7F5F0]/50 border-r border-[#E5E0D8] flex-col justify-center print:bg-gray-50 print:text-black print:border-black">
                        <div className="text-xs">{day.name}</div>
                        <div className="text-[9px] text-[#64748B] font-normal mt-0.5 font-mono print:text-black">
                          {dayPeriods.length} active slots
                        </div>
                        {canManageTimetable && (
                          <button
                            onClick={() => openBulkScheduler(day.code)}
                            className="text-[9px] text-[#5C1D24] hover:underline block mt-2 print:hidden font-bold"
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
                              className="p-2 border-r border-[#E5E0D8] bg-amber-50/20 text-center font-bold text-[10px] text-[#5C1D24] uppercase tracking-widest select-none font-mono print:border-black print:bg-gray-50"
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
                            className="p-2 border-r border-[#E5E0D8] last:border-r-0 text-center relative group min-h-[75px] print:border-black"
                          >
                            {period ? (
                              <div className="bg-[#1B2A4A]/5 border border-[#1B2A4A]/10 rounded-lg p-2 space-y-1 relative group-hover:bg-[#1B2A4A]/10 transition-colors print:bg-transparent print:border-none">
                                <div className="text-xs font-bold text-[#1B2A4A] print:text-black">
                                  {period.subject_details?.name || 'Subject'}
                                </div>
                                <div className="text-[9px] text-[#64748B] font-medium print:text-black">
                                  {period.teacher_details?.user?.first_name} {period.teacher_details?.user?.last_name?.[0]}.
                                </div>

                                {/* Floating delete button visible on hover */}
                                {canManageTimetable && (
                                  <button
                                    onClick={() => handleDelete(period.id)}
                                    className="absolute -top-1.5 -right-1.5 bg-[#5C1D24] text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm print:hidden"
                                    title="Remove Slot"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>
                            ) : (
                              canManageTimetable ? (
                                <button
                                  onClick={() => openBulkScheduler(day.code)}
                                  className="w-full h-full min-h-[48px] rounded-lg border border-dashed border-[#E5E0D8] hover:border-[#1B2A4A]/40 flex items-center justify-center text-[#64748B] hover:text-[#1B2A4A] hover:bg-[#1B2A4A]/5 transition-all group/btn print:hidden"
                                  title={`Schedule Day Routine for ${day.name}`}
                                >
                                  <Plus className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                </button>
                              ) : (
                                <div className="text-[10px] text-gray-300 italic">-</div>
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
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Schedule Routine for ${DAYS.find((d) => d.code === bulkFormData.day_of_week)?.name}`}>
        <form onSubmit={handleBulkSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto px-1">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8]">
            <div>
              <label className="block text-[10px] font-bold text-[#1A1918] uppercase tracking-wider mb-2">
                Selecting Target Day
              </label>
              <select
                value={bulkFormData.day_of_week}
                onChange={(e) => populateBulkForm(e.target.value)}
                className="bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg px-4 py-2 text-xs font-bold text-[#1B2A4A] focus:outline-none"
              >
                {DAYS.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-[10px] text-[#64748B] font-semibold italic text-right max-w-[200px]">
              Note: Saving will overwrite any existing timetable slots for this day.
            </div>
          </div>

          <div className="space-y-3.5 divide-y divide-[#F7F5F0]">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
              const slot = PERIOD_TEMPLATES.find((s) => s.num === num);
              const pData = bulkFormData.periods[num] || { subject: '', teacher: '' };

              return (
                <div key={num} className="pt-3.5 first:pt-0 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-3">
                    <div className="text-xs font-bold text-[#1B2A4A]">Period {num}</div>
                    <div className="text-[10px] text-[#64748B] font-mono mt-0.5">{slot.start} - {slot.end}</div>
                  </div>
                  
                  <div className="sm:col-span-5">
                    <select
                      value={pData.subject}
                      onChange={(e) => handleBulkPeriodChange(num, 'subject', e.target.value)}
                      className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg px-3 py-2 text-xs font-semibold text-[#1A1918] focus:outline-none focus:border-[#1B2A4A]"
                    >
                      <option value="">No Class Scheduled</option>
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-4">
                    <select
                      value={pData.teacher}
                      onChange={(e) => handleBulkPeriodChange(num, 'teacher', e.target.value)}
                      className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg px-3 py-2 text-xs font-semibold text-[#1A1918] focus:outline-none focus:border-[#1B2A4A]"
                      disabled={!pData.subject}
                    >
                      <option value="">Assign Teacher</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.user?.first_name} {t.user?.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>

          <Button type="submit" variant="primary" className="w-full mt-4 gap-2" loading={submitting}>
            <Save className="w-4 h-4" /> Save day Routine
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default TimetableSchedule;
