import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { academicService } from '../../services/academicService';
import { studentService } from '../../services/studentService';
import { attendanceService } from '../../services/attendanceService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { CalendarCheck, Save, CheckCircle2, Calendar } from 'lucide-react';

const AttendanceSheet = () => {
  const { user } = useAuth();
  const canManageAttendance = user?.permissions?.manage_attendance ?? false;
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const data = await academicService.getSections({ class_teacher_only: 'true' });
        const list = data.results || data;
        setSections(list);
        if (list.length > 0) {
          setSelectedSection(list[0].id.toString());
        }
      } catch (err) {
        console.error("Failed to fetch sections:", err);
      }
    };
    fetchSections();
  }, []);

  const loadSheet = async () => {
    if (!selectedSection || !selectedDate) return;
    setLoading(true);
    setMessage('');
    try {
      const studsData = await studentService.getStudents({ section: selectedSection });
      const studsList = studsData.results || studsData;
      setStudents(studsList);

      const attData = await attendanceService.getAttendance({ section: selectedSection, date: selectedDate });
      const attList = attData.results || attData;

      const map = {};
      studsList.forEach((s) => {
        const existing = attList.find((a) => a.student === s.id);
        map[s.id] = existing ? existing.status : 'PRESENT';
      });
      setAttendanceMap(map);
    } catch (err) {
      console.error("Failed to load attendance sheet:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSheet();
  }, [selectedSection, selectedDate]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    if (!selectedSection || !selectedDate || students.length === 0) return;
    setSaving(true);
    setMessage('');
    try {
      const records = Object.keys(attendanceMap).map((sid) => ({
        student_id: parseInt(sid),
        status: attendanceMap[sid],
      }));
      await attendanceService.bulkMarkAttendance({
        section_id: parseInt(selectedSection),
        date: selectedDate,
        records: records,
      });
      setMessage('Attendance saved successfully!');
    } catch (err) {
      console.error("Failed to save attendance:", err);
      setMessage('Failed to save attendance.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans'] text-[#1A1918]">
      
      {/* Category Pill Indicator */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5C1D24]/10 border border-[#5C1D24]/20 text-[10px] font-bold text-[#5C1D24] uppercase tracking-wider">
        <CalendarCheck className="w-3.5 h-3.5 text-[#5C1D24]" />
        <span>Roster Presence Tracker</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
        <div>
          <h1 className="text-3xl font-['Newsreader'] font-bold text-[#1A1918]">Daily Attendance Register</h1>
          <p className="text-xs text-[#64748B] mt-1">Select class section and date to record or update student presence.</p>
        </div>
        {students.length > 0 && canManageAttendance && (
          <Button variant="primary" size="sm" onClick={handleSave} loading={saving} className="gap-2 shadow-sm">
            <Save className="w-4 h-4" /> Save Attendance
          </Button>
        )}
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-[#E5E0D8] shadow-sm">
        <div>
          <label className="block text-[10px] font-bold text-[#1A1918] uppercase tracking-wider mb-2">
            Class Section
          </label>
          {user?.role === 'TEACHER' ? (
            <div className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg px-4 py-2.5 text-xs font-bold text-[#1A1918] flex items-center h-[38px] select-none shadow-sm">
              {sections.length > 0 ? (
                `${sections[0].class_name} - ${sections[0].name}`
              ) : (
                <span className="text-[#5C1D24] italic">Not assigned to any class section</span>
              )}
            </div>
          ) : (
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
          )}
        </div>
        <Input
          label="Attendance Date"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          icon={Calendar}
        />
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {/* Attendance Sheet Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-[#E5E0D8] bg-white shadow-sm">
        <table className="w-full text-left text-xs font-semibold text-[#1A1918]">
          <thead className="bg-[#F7F5F0] text-[10px] font-bold text-[#64748B] uppercase tracking-wider border-b border-[#E5E0D8] select-none">
            <tr>
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Admission No.</th>
              <th className="px-6 py-4">Roll No.</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F7F5F0] text-[#64748B]">
            {students.length > 0 ? (
              students.map((st) => (
                <tr key={st.id} className="hover:bg-[#F7F5F0]/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-[#1A1918]">
                    {st.user?.first_name} {st.user?.last_name}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-[#1B2A4A] font-bold">{st.admission_number}</td>
                  <td className="px-6 py-4 text-xs text-[#64748B]">#{st.roll_number || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {[
                        { key: 'PRESENT', label: 'Present', activeClass: 'bg-emerald-600 text-white' },
                        { key: 'ABSENT', label: 'Absent', activeClass: 'bg-[#5C1D24] text-white' },
                        { key: 'LATE', label: 'Late', activeClass: 'bg-amber-600 text-white' },
                        { key: 'LEAVE', label: 'On Leave', activeClass: 'bg-[#1B2A4A] text-white' },
                      ].map((btn) => {
                        const isSelected = attendanceMap[st.id] === btn.key;
                        return (
                          <button
                            key={btn.key}
                            type="button"
                            onClick={() => handleStatusChange(st.id, btn.key)}
                            disabled={!canManageAttendance}
                            className={`px-3 py-1.5 rounded text-[10px] font-bold transition-colors border shadow-sm ${
                              !canManageAttendance 
                                ? isSelected
                                  ? `${btn.activeClass} border-transparent opacity-70 cursor-not-allowed`
                                  : 'bg-white border-[#E5E0D8] text-[#64748B] opacity-50 cursor-not-allowed'
                                : isSelected
                                  ? `${btn.activeClass} border-transparent`
                                  : 'bg-white border-[#E5E0D8] text-[#64748B] hover:text-[#1A1918] hover:bg-[#F7F5F0]'
                            }`}
                          >
                            {btn.label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-[#64748B] font-medium italic">
                  {loading ? 'Loading student register...' : 'No students found in this section.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceSheet;
