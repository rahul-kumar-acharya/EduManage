import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { studentService } from '../../services/studentService';
import { noticeService } from '../../services/noticeService';
import { homeworkService } from '../../services/homeworkService';
import { timetableService } from '../../services/timetableService';
import { attendanceService } from '../../services/attendanceService';
import { examService } from '../../services/examService';
import { feeService } from '../../services/feeService';
import { 
  BookOpen, 
  CalendarCheck, 
  FileSpreadsheet, 
  Bell, 
  Clock, 
  GraduationCap, 
  DollarSign, 
  Award,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  
  const [students, setStudents] = useState([]);
  const [notices, setNotices] = useState([]);
  const [homeworks, setHomeworks] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks] = useState([]);
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [studentsRes, noticesRes, homeworksRes, periodsRes, attendanceRes, marksRes, duesRes] = await Promise.all([
          studentService.getStudents(),
          noticeService.getNotices(),
          homeworkService.getHomeworks(),
          timetableService.getPeriods(),
          attendanceService.getRecords(),
          examService.getMarks(),
          feeService.getDues()
        ]);

        setStudents(studentsRes.results || studentsRes);
        setNotices(noticesRes.results || noticesRes);
        setHomeworks(homeworksRes.results || homeworksRes);
        setPeriods(periodsRes.results || periodsRes);
        setAttendance(attendanceRes.results || attendanceRes);
        setMarks(marksRes.results || marksRes);
        setDues(duesRes.results || duesRes);
      } catch (err) {
        console.error("Failed to load Student dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Find current student profile
  const currentStudent = students.find(s => s.user?.id === user?.id);
  
  // Roster section
  const sectionName = currentStudent?.section 
    ? `${currentStudent.section.class_name} - ${currentStudent.section.name}` 
    : 'No Assigned Class';

  // Homework for my section
  const myHomeworks = homeworks.filter(h => currentStudent && h.section === currentStudent.section?.id);
  
  // Timetable periods for my section
  const myPeriods = periods.filter(p => currentStudent && p.section?.id === currentStudent.section?.id);
  
  // Day of week conversion
  const dayShortMap = {
    0: 'SUN', 1: 'MON', 2: 'TUE', 3: 'WED', 4: 'THU', 5: 'FRI', 6: 'SAT'
  };
  const todayDayName = dayShortMap[new Date().getDay()];
  const todayLectures = myPeriods.filter(p => p.day_of_week === todayDayName);

  // Attendance rate calculation
  const myAttendance = attendance.filter(r => currentStudent && r.student?.id === currentStudent.id);
  const presentDays = myAttendance.filter(r => r.status === 'PRESENT').length;
  const attendanceRate = myAttendance.length > 0 ? Math.round((presentDays / myAttendance.length) * 100) : 100;

  // Grade averages calculation
  const myMarks = marks.filter(m => currentStudent && m.student?.id === currentStudent.id);
  const avgScore = myMarks.length > 0 
    ? Math.round(myMarks.reduce((acc, curr) => acc + parseFloat(curr.marks_obtained || 0), 0) / myMarks.length) 
    : null;

  let gradeStr = 'N/A';
  if (avgScore !== null) {
    if (avgScore >= 90) gradeStr = 'A+';
    else if (avgScore >= 80) gradeStr = 'A';
    else if (avgScore >= 70) gradeStr = 'B';
    else if (avgScore >= 60) gradeStr = 'C';
    else if (avgScore >= 50) gradeStr = 'D';
    else gradeStr = 'F';
  }

  // Fees billing status
  const myDue = dues.find(d => currentStudent && d.student?.id === currentStudent.id);
  const balanceDue = myDue ? parseFloat(myDue.balance_due || 0) : 0;
  const isPaid = balanceDue <= 0;

  return (
    <div className="space-y-8 font-['Plus_Jakarta_Sans'] text-[#1A1918]">
      
      {/* Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E0D8] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-['Newsreader'] font-bold text-[#1A1918]">
              Hi, {user?.first_name || 'Student'} 👋
            </h1>
            <span className="px-3 py-1 rounded-md bg-[#1B2A4A]/10 text-[#1B2A4A] border border-[#1B2A4A]/20 text-xs font-semibold uppercase tracking-wider animate-pulse">
              {sectionName}
            </span>
          </div>
          <p className="text-[#64748B] text-xs sm:text-sm">
            Keep track of your homework assignments, exam schedules, and attendance reports.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/dashboard/timetable"
            className="flex-1 sm:flex-none bg-white hover:bg-[#F7F5F0] text-[#1A1918] border border-[#E5E0D8] px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm text-center"
          >
            <Clock className="w-4 h-4 text-[#1B2A4A]" /> View Timetable
          </Link>
          <Link
            to="/dashboard/exams"
            className="flex-1 sm:flex-none bg-[#1B2A4A] hover:bg-[#5C1D24] text-white px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm text-center"
          >
            <Award className="w-4 h-4" /> My Report Cards
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-[#64748B] font-semibold animate-pulse">
          Retrieving student profile details and subject marks...
        </div>
      ) : (
        <>
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'My Attendance', value: `${attendanceRate}%`, desc: `${presentDays} / ${myAttendance.length} days present`, icon: CalendarCheck },
              { title: 'Pending Tasks', value: `${myHomeworks.length} Homework`, desc: 'Active class assignments', icon: BookOpen },
              { title: 'Overall Performance', value: avgScore !== null ? `${avgScore}% (Grade ${gradeStr})` : 'No Marks Yet', desc: 'Calculated term scores', icon: GraduationCap },
              { title: 'Billing Status', value: isPaid ? 'Clear' : `Unpaid Dues`, desc: isPaid ? 'No outstanding balances' : `Outstanding balance: ₹${balanceDue}`, icon: DollarSign },
            ].map((m, idx) => {
              const Icon = m.icon;
              return (
                <div key={idx} className="bg-white p-6 rounded-xl border border-[#E5E0D8] shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B] block">{m.title}</span>
                    <strong className="text-2xl font-['Newsreader'] font-bold text-[#1A1918] block mt-1">{m.value}</strong>
                    <span className="text-[11px] text-[#64748B] block">{m.desc}</span>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-[#F7F5F0] border border-[#E5E0D8] flex items-center justify-center text-[#1B2A4A]">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grid: Timetable schedule and active Homework */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Side: Lectures & Assignments */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-[#E5E0D8] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-['Newsreader'] font-bold text-[#1A1918] flex items-center gap-2">
                    <BookOpen className="w-4.5 h-4.5 text-[#5C1D24]" /> Active Homework Assignments
                  </h3>
                </div>

                <div className="space-y-3">
                  {myHomeworks.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#64748B] font-semibold">
                      Excellent! No pending assignments found.
                    </div>
                  ) : (
                    myHomeworks.map((hw, i) => (
                      <div key={i} className="p-4 bg-[#F7F5F0] border border-[#E5E0D8] rounded-xl flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-mono tracking-wider text-[#1B2A4A] block">
                            {hw.subject_name || hw.subject?.name || 'General'}
                          </span>
                          <p className="text-sm font-bold text-[#1A1918] leading-snug">{hw.title}</p>
                          <p className="text-xs text-[#64748B] leading-relaxed">{hw.description}</p>
                          <span className="text-[10px] text-[#64748B] block font-mono">
                            Due Date: {new Date(hw.due_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Side: Schedule & Notices */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-[#E5E0D8] shadow-sm space-y-4">
                <h3 className="text-base font-['Newsreader'] font-bold text-[#1A1918] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#5C1D24]" /> Today's Lecture Schedule
                </h3>
                
                <div className="space-y-3">
                  {todayLectures.length === 0 ? (
                    <div className="py-4 text-center text-xs text-[#64748B] font-semibold">
                      No lectures scheduled for today.
                    </div>
                  ) : (
                    todayLectures.map((sch, i) => (
                      <div key={i} className="p-3 bg-[#F7F5F0] border border-[#E5E0D8] rounded-xl flex justify-between items-center gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-[#64748B] font-mono block">
                            {sch.start_time} - {sch.end_time}
                          </span>
                          <span className="text-xs font-bold text-[#1A1918] block">
                            {sch.subject_name || sch.subject?.name}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded uppercase bg-white text-[#64748B] border border-[#E5E0D8]">
                          Classroom
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-[#E5E0D8] shadow-sm space-y-4">
                <h3 className="text-base font-['Newsreader'] font-bold text-[#1A1918] flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#1B2A4A]" /> School Notice Feed
                </h3>
                
                <div className="space-y-3">
                  {notices.length === 0 ? (
                    <div className="py-4 text-center text-xs text-[#64748B] font-semibold">
                      No notices posted.
                    </div>
                  ) : (
                    notices.slice(0, 3).map((notice, idx) => (
                      <div key={idx} className="p-3.5 bg-[#F7F5F0] border border-[#E5E0D8] rounded-xl space-y-2">
                        <span className="text-[9px] text-[#5C1D24] uppercase font-bold tracking-wider">
                          {new Date(notice.created_at).toLocaleDateString()}
                        </span>
                        <h4 className="text-xs font-bold text-[#1A1918] leading-snug">{notice.title}</h4>
                        <p className="text-[11px] text-[#64748B] leading-relaxed">{notice.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default StudentDashboard;
