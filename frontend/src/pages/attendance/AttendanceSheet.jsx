import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { academicService } from '../../services/academicService';
import { studentService } from '../../services/studentService';
import { attendanceService } from '../../services/attendanceService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { CalendarCheck, Save, CheckCircle2, Calendar, Users, UserCheck, UserX, Clock, Sparkles, FileSpreadsheet, Download, Eye, Lock } from 'lucide-react';

const AttendanceSheet = () => {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'monthly'
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [currentSession, setCurrentSession] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Monthly Report states
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((now.getMonth() + 1).toString());
  const [monthlyRecords, setMonthlyRecords] = useState([]);
  const [loadingMonthly, setLoadingMonthly] = useState(false);

  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [hasExistingRecords, setHasExistingRecords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const ALL_MONTHS = [
    { num: 1, name: 'January' },
    { num: 2, name: 'February' },
    { num: 3, name: 'March' },
    { num: 4, name: 'April' },
    { num: 5, name: 'May' },
    { num: 6, name: 'June' },
    { num: 7, name: 'July' },
    { num: 8, name: 'August' },
    { num: 9, name: 'September' },
    { num: 10, name: 'October' },
    { num: 11, name: 'November' },
    { num: 12, name: 'December' },
  ];

  const cleanSecDisplay = (sec) => {
    if (!sec) return 'N/A';
    const cName = sec.class_name || sec.class_level_name || 'Class';
    const sName = (sec.name || sec.section_name || '').replace(/^section\s*/i, '').trim();
    return `${cName} — Section ${sName}`;
  };

  // Permission Logic for Selected Section
  const isSchoolAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'SCHOOL_ADMIN';
  const isClassTeacherOfSelected = user?.role === 'TEACHER' && 
    user.class_teacher_sections?.some(sec => sec.id?.toString() === selectedSection.toString());

  // Admins can mark & edit any section at any time.
  // Class Teachers can mark attendance ONLY for their assigned section AND if not submitted yet today.
  const canMarkCurrentSection = isSchoolAdmin || (isClassTeacherOfSelected && !hasExistingRecords);

  useEffect(() => {
    const fetchSessionAndSections = async () => {
      try {
        const sessData = await academicService.getSessions();
        const sessList = sessData.results || sessData;
        const activeSess = sessList.find((s) => s.is_current) || sessList[0];
        if (activeSess) {
          setCurrentSession(activeSess);
          const currentY = new Date().getFullYear().toString();
          const currentM = (new Date().getMonth() + 1).toString();
          setSelectedYear(currentY);
          setSelectedMonth(currentM);
        }

        const data = await academicService.getSections();
        const list = data.results || data;
        setSections(list);

        if (list.length > 0) {
          const teacherSec = user?.class_teacher_sections?.[0]?.id?.toString();
          if (teacherSec && list.some(s => s.id.toString() === teacherSec)) {
            setSelectedSection(teacherSec);
          } else {
            setSelectedSection(list[0].id.toString());
          }
        }
      } catch (err) {
        console.error("Failed to fetch session/sections data:", err);
      }
    };
    fetchSessionAndSections();
  }, [user]);

  // Session Bounds Computation
  const startYear = currentSession?.start_date ? new Date(currentSession.start_date).getFullYear() : 2026;
  const startMonthNum = currentSession?.start_date ? new Date(currentSession.start_date).getMonth() + 1 : 4; // April
  const endYear = currentSession?.end_date ? new Date(currentSession.end_date).getFullYear() : 2027;
  const endMonthNum = currentSession?.end_date ? new Date(currentSession.end_date).getMonth() + 1 : 3; // March

  // Dynamic Years for Active Session
  const yearOptions = [];
  for (let y = startYear; y <= endYear; y++) {
    yearOptions.push(y.toString());
  }

  // Dynamic Months for Selected Year within Active Session
  const selectedY = parseInt(selectedYear) || startYear;
  const availableMonths = ALL_MONTHS.filter((m) => {
    if (selectedY === startYear && selectedY === endYear) {
      return m.num >= startMonthNum && m.num <= endMonthNum;
    }
    if (selectedY === startYear) {
      return m.num >= startMonthNum;
    }
    if (selectedY === endYear) {
      return m.num <= endMonthNum;
    }
    return true;
  });

  const sortStudentsAscending = (studsList) => {
    return (studsList || []).slice().sort((a, b) => {
      const rA = parseInt(a.roll_number) || 999999;
      const rB = parseInt(b.roll_number) || 999999;
      return rA - rB;
    });
  };

  // Ensure selected month is within availableMonths range
  useEffect(() => {
    if (availableMonths.length > 0) {
      const isSelectedMonthValid = availableMonths.some(m => m.num.toString() === selectedMonth);
      if (!isSelectedMonthValid) {
        setSelectedMonth(availableMonths[0].num.toString());
      }
    }
  }, [selectedYear, currentSession]);

  const loadSheet = async () => {
    if (!selectedSection || !selectedDate) return;
    setLoading(true);
    setMessage('');
    try {
      const studsData = await studentService.getStudents({ section: selectedSection });
      const studsList = sortStudentsAscending(studsData.results || studsData);
      setStudents(studsList);

      const attData = await attendanceService.getAttendance({ section: selectedSection, date: selectedDate });
      const attList = attData.results || attData;
      setHasExistingRecords(attList.length > 0);

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

  const loadMonthlyReport = async () => {
    if (!selectedSection || !selectedYear || !selectedMonth) return;
    setLoadingMonthly(true);
    try {
      const studsData = await studentService.getStudents({ section: selectedSection });
      const studsList = sortStudentsAscending(studsData.results || studsData);
      setStudents(studsList);

      const attData = await attendanceService.getAttendance({
        section: selectedSection,
        year: selectedYear,
        month: selectedMonth,
      });
      setMonthlyRecords(attData.results || attData);
    } catch (err) {
      console.error("Failed to load monthly attendance:", err);
    } finally {
      setLoadingMonthly(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'daily') {
      loadSheet();
    } else {
      loadMonthlyReport();
    }
  }, [selectedSection, selectedDate, selectedYear, selectedMonth, activeTab]);

  const handleStatusChange = (studentId, status) => {
    if (!canMarkCurrentSection) return;
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAllStatus = (status) => {
    if (!canMarkCurrentSection) return;
    const updated = {};
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendanceMap(updated);
  };

  const handleSave = async () => {
    if (!canMarkCurrentSection) {
      setMessage('Read-only mode: Only the assigned Class Teacher or School Admin can save attendance for this section.');
      return;
    }
    if (!selectedSection || !selectedDate || students.length === 0) return;
    setSaving(true);
    setMessage('');
    try {
      const records = Object.keys(attendanceMap).map((sid) => ({
        student_id: parseInt(sid),
        status: attendanceMap[sid],
      }));
      const res = await attendanceService.bulkMarkAttendance({
        section_id: parseInt(selectedSection),
        date: selectedDate,
        records: records,
      });
      setMessage(res.message || 'Daily attendance register saved successfully!');
      setHasExistingRecords(true);
    } catch (err) {
      console.error("Failed to save attendance:", err);
      if (err.response && err.response.status === 401) {
        setMessage('Your login session token has expired. Please re-login to save attendance.');
      } else if (err.response && err.response.data && err.response.data.detail) {
        setMessage(`Save failed: ${err.response.data.detail}`);
      } else {
        setMessage('Failed to save attendance. Please verify your connection.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Stats Calculations for Daily Sheet
  const totalCount = students.length;
  const presentCount = Object.values(attendanceMap).filter((s) => s === 'PRESENT').length;
  const absentCount = Object.values(attendanceMap).filter((s) => s === 'ABSENT').length;
  const presentPercent = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  // Monthly Matrix Helpers
  const daysInMonth = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getStudentStatusForDay = (studentId, day) => {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const monthStr = parseInt(selectedMonth) < 10 ? `0${parseInt(selectedMonth)}` : `${selectedMonth}`;
    const targetDate = `${selectedYear}-${monthStr}-${dayStr}`;
    const rec = monthlyRecords.find((r) => r.student === studentId && r.date === targetDate);
    return rec ? rec.status : null;
  };

  const handleExportMonthlyCSV = () => {
    let csv = `Student Name,Roll No.,Admission No.`;
    daysArray.forEach((d) => { csv += `,Day ${d}`; });
    csv += `,Present %,Total Present,Total Absent\n`;

    students.forEach((st) => {
      let line = `"${st.user?.first_name} ${st.user?.last_name}",${st.roll_number || ''},${st.admission_number || ''}`;
      let pCount = 0;
      let aCount = 0;
      let totalMarked = 0;

      daysArray.forEach((d) => {
        const stCode = getStudentStatusForDay(st.id, d);
        if (stCode === 'PRESENT') { line += `,P`; pCount++; totalMarked++; }
        else if (stCode === 'ABSENT') { line += `,A`; aCount++; totalMarked++; }
        else { line += `,-`; }
      });

      const rate = totalMarked > 0 ? Math.round((pCount / totalMarked) * 100) : 0;
      line += `,${rate}%,${pCount},${aCount}\n`;
      csv += line;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Attendance_Report_Section_${selectedSection}_${selectedYear}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-['Inter'] text-slate-900">
      
      {/* Category Pill Indicator */}
      <div className="flex items-center gap-2 select-none">
        <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60 text-[10px] font-bold uppercase tracking-wider">
          Academic ERP
        </span>
        <span className="text-slate-400 text-xs font-semibold">/</span>
        <span className="text-xs font-semibold text-slate-600">
          Attendance Register {currentSession ? `(${currentSession.name})` : ''}
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-['Outfit'] text-slate-900 tracking-tight">Attendance Register</h1>
          <p className="text-sm text-slate-500 mt-1">
            Record daily presence and view monthly class attendance reports for session {currentSession?.name || '2026-2027'}.
          </p>
        </div>
        
        {activeTab === 'monthly' && students.length > 0 && (
          <Button variant="secondary" size="sm" onClick={handleExportMonthlyCSV} className="gap-2 shadow-xs">
            <Download className="w-4 h-4" /> Export Report (CSV)
          </Button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('daily')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'daily'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CalendarCheck className="w-4 h-4" /> Daily Register
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'monthly'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" /> Monthly Matrix & Analytics
        </button>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-['Outfit']">
            Select Class Section
          </label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
          >
            {sections.length === 0 && <option value="">Loading class sections...</option>}
            {sections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {cleanSecDisplay(sec)} {sec.id.toString() === user?.class_teacher_sections?.[0]?.id?.toString() ? ' ★ (My Class)' : ''}
              </option>
            ))}
          </select>
        </div>

        {activeTab === 'daily' ? (
          <div className="sm:col-span-2">
            <Input
              label="Attendance Date (Today)"
              type="date"
              value={todayStr}
              readOnly={true}
              disabled={true}
              icon={Calendar}
            />
          </div>
        ) : (
          <div className="sm:col-span-2 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-['Outfit']">
                Select Month ({availableMonths.length} Months)
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                {availableMonths.map((m) => (
                  <option key={m.num} value={m.num.toString()}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-['Outfit']">
                Select Year (Session {currentSession?.name || ''})
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* TAB 1: DAILY ATTENDANCE REGISTER */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          
          {/* Live Summary Cards & Shortcuts */}
          {students.length > 0 && (
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="grid grid-cols-3 gap-3 flex-1">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block font-['Outfit']">Total Enrolled</span>
                  <span className="text-lg font-bold text-slate-900 font-['Outfit']">{totalCount}</span>
                </div>
                <div className="bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200 text-center">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block font-['Outfit']">Present</span>
                  <span className="text-lg font-bold text-emerald-700 font-['Outfit']">{presentCount} <span className="text-[10px] font-semibold">({presentPercent}%)</span></span>
                </div>
                <div className="bg-rose-50/80 p-2.5 rounded-lg border border-rose-200 text-center">
                  <span className="text-[10px] font-bold text-rose-600 uppercase block font-['Outfit']">Absent</span>
                  <span className="text-lg font-bold text-rose-600 font-['Outfit']">{absentCount}</span>
                </div>
              </div>

              {canMarkCurrentSection ? (
                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
                  <button
                    type="button"
                    onClick={() => markAllStatus('PRESENT')}
                    className="px-3.5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4" /> Mark All Present
                  </button>
                  <button
                    type="button"
                    onClick={() => markAllStatus('ABSENT')}
                    className="px-3.5 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <UserX className="w-4 h-4" /> Mark All Absent
                  </button>
                </div>
              ) : (
                <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-1.5 shadow-xs select-none">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <span>
                    {hasExistingRecords 
                      ? 'Attendance Submitted & Locked for Today' 
                      : 'Read-Only View (Class Teacher Only)'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Daily Table */}
          <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs font-medium text-slate-800">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 select-none font-['Outfit']">
                <tr>
                  <th className="px-5 py-3.5">Roll No.</th>
                  <th className="px-5 py-3.5">Student Name</th>
                  <th className="px-5 py-3.5">Admission No.</th>
                  <th className="px-5 py-3.5 text-right">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {students.length > 0 ? (
                  students.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs font-semibold bg-slate-100 px-2.5 py-1 rounded-md text-slate-800 border border-slate-200">
                          {st.roll_number || 'N/A'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900">
                        {st.user?.first_name} {st.user?.last_name}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-700 font-medium">
                        {st.admission_number || 'N/A'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-2">
                          {[
                            { key: 'PRESENT', label: 'Present', activeClass: 'bg-emerald-600 text-white border-emerald-600' },
                            { key: 'ABSENT', label: 'Absent', activeClass: 'bg-rose-600 text-white border-rose-600' },
                          ].map((btn) => {
                            const isSelected = attendanceMap[st.id] === btn.key;
                            return (
                              <button
                                key={btn.key}
                                type="button"
                                onClick={() => handleStatusChange(st.id, btn.key)}
                                disabled={!canMarkCurrentSection}
                                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all border shadow-xs ${
                                  !canMarkCurrentSection 
                                    ? isSelected
                                      ? `${btn.activeClass} opacity-70 cursor-not-allowed`
                                      : 'bg-white border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                                    : isSelected
                                      ? `${btn.activeClass}`
                                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                      {loading ? 'Loading register data...' : 'No enrolled students found in this section.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Single Dedicated Save Register Footer Bar */}
          {students.length > 0 && canMarkCurrentSection && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-medium text-slate-600">
                Done marking? Click <strong className="text-slate-900 font-semibold">Save Register</strong> to submit attendance and dispatch absentee notices.
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                loading={saving}
                className="gap-2 shadow-xs font-semibold px-6 py-2.5 text-xs shrink-0"
              >
                <Save className="w-4 h-4" /> Save Register
              </Button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MONTHLY MATRIX & ANALYTICS */}
      {activeTab === 'monthly' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">
              Monthly Presence Matrix — {ALL_MONTHS.find(m => m.num.toString() === selectedMonth)?.name || ''} {selectedYear}
            </h3>
            <div className="flex items-center gap-3 text-[10px] font-semibold">
              <span className="flex items-center gap-1 text-emerald-700"><span className="w-2 h-2 rounded-full bg-emerald-600" /> P = Present</span>
              <span className="flex items-center gap-1 text-rose-600"><span className="w-2 h-2 rounded-full bg-rose-600" /> A = Absent</span>
            </div>
          </div>

          <div className="w-full overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs font-medium">
              <thead className="bg-slate-50 text-[9px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 sticky top-0 font-['Outfit']">
                <tr>
                  <th className="px-3 py-2 shrink-0">Student</th>
                  <th className="px-2 py-2 text-center">Roll</th>
                  {daysArray.map((d) => (
                    <th key={d} className="px-1.5 py-2 text-center border-l border-slate-200 min-w-6.5">
                      {d}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-center border-l border-slate-200">Rate %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.length > 0 ? (
                  students.map((st) => {
                    let presentCnt = 0;
                    let totalMarked = 0;

                    const dayCells = daysArray.map((d) => {
                      const stCode = getStudentStatusForDay(st.id, d);
                      if (stCode === 'PRESENT') { presentCnt++; totalMarked++; }
                      else if (stCode === 'ABSENT') { totalMarked++; }

                      let badgeClass = 'text-slate-300 bg-transparent';
                      let letter = '-';
                      if (stCode === 'PRESENT') { badgeClass = 'bg-emerald-100 text-emerald-700 font-bold'; letter = 'P'; }
                      else if (stCode === 'ABSENT') { badgeClass = 'bg-rose-100 text-rose-700 font-bold'; letter = 'A'; }

                      return (
                        <td key={d} className="px-1 py-1.5 text-center border-l border-slate-200 font-mono text-[10px]">
                          <span className={`inline-block w-5 h-5 leading-5 rounded text-center ${badgeClass}`}>
                            {letter}
                          </span>
                        </td>
                      );
                    });

                    const rate = totalMarked > 0 ? Math.round((presentCnt / totalMarked) * 100) : 100;

                    return (
                      <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-3 py-2 font-semibold text-slate-900 whitespace-nowrap">
                          {st.user?.first_name} {st.user?.last_name}
                        </td>
                        <td className="px-2 py-2 text-center font-mono text-xs font-medium text-slate-500">
                          {st.roll_number || '-'}
                        </td>
                        {dayCells}
                        <td className="px-3 py-2 text-center border-l border-slate-200 font-semibold text-xs">
                          <span className={`px-2 py-0.5 rounded-md ${
                            rate >= 85 ? 'bg-emerald-100 text-emerald-700' : rate >= 75 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {rate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={daysInMonth + 3} className="px-6 py-10 text-center text-slate-400 font-medium italic">
                      {loadingMonthly ? 'Generating monthly matrix...' : 'No enrolled students found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AttendanceSheet;
