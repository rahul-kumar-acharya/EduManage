import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { teacherService } from '../../services/teacherService';
import { academicService } from '../../services/academicService';
import { studentService } from '../../services/studentService';
import { noticeService } from '../../services/noticeService';
import { timetableService } from '../../services/timetableService';
import { 
  BookOpen, 
  CalendarCheck, 
  FileSpreadsheet, 
  Users, 
  ClipboardList, 
  Bell, 
  Clock, 
  Award,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

const TeacherDashboard = () => {
  const { user } = useAuth();
  
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [notices, setNotices] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [teachersRes, classesRes, studentsRes, noticesRes, periodsRes] = await Promise.all([
          teacherService.getTeachers(),
          academicService.getClasses(),
          studentService.getStudents(),
          noticeService.getNotices(),
          timetableService.getPeriods()
        ]);

        setTeachers(teachersRes.results || teachersRes);
        setClasses(classesRes.results || classesRes);
        setStudents(studentsRes.results || studentsRes);
        setNotices(noticesRes.results || noticesRes);
        setPeriods(periodsRes.results || periodsRes);
      } catch (err) {
        console.error("Failed to load Teacher dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Find the current logged in teacher profile
  const currentTeacher = teachers.find(t => t.user?.id === user?.id);
  
  // Find all sections where the current teacher is assigned as class teacher
  const mySections = [];
  classes.forEach(cls => {
    if (cls.sections) {
      cls.sections.forEach(sec => {
        if (currentTeacher && sec.class_teacher === currentTeacher.id) {
          mySections.push({
            ...sec,
            class_name: cls.name
          });
        }
      });
    }
  });

  // Calculate stats
  const totalMyStudentsCount = students.filter(s => mySections.some(sec => sec.id === s.section?.id)).length;
  
  // Find periods taught by this teacher
  const myPeriods = periods.filter(p => currentTeacher && p.teacher?.id === currentTeacher.id);
  
  // Day of week conversion map for timetable matching
  const dayShortMap = {
    0: 'SUN', 1: 'MON', 2: 'TUE', 3: 'WED', 4: 'THU', 5: 'FRI', 6: 'SAT'
  };
  const todayDayName = dayShortMap[new Date().getDay()];

  // Today's lectures
  const todayLectures = myPeriods.filter(p => p.day_of_week === todayDayName);

  return (
    <div className="space-y-8 font-['Plus_Jakarta_Sans'] text-[#1A1918]">
      
      {/* Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E0D8] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-['Newsreader'] font-bold text-[#1A1918]">
              Welcome back, {user?.first_name || 'Teacher'} 👋
            </h1>
            <span className="px-3 py-1 rounded-md bg-[#5C1D24]/10 text-[#5C1D24] border border-[#5C1D24]/20 text-xs font-semibold uppercase tracking-wider">
              Teacher Workspace
            </span>
          </div>
          <p className="text-[#64748B] text-xs sm:text-sm">
            Manage your daily class operations, mark student rosters, and log subject grades.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/dashboard/attendance"
            className="flex-1 sm:flex-none bg-white hover:bg-[#F7F5F0] text-[#1A1918] border border-[#E5E0D8] px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm text-center"
          >
            <CalendarCheck className="w-4 h-4 text-[#1B2A4A]" /> Take Attendance
          </Link>
          <Link
            to="/dashboard/homework"
            className="flex-1 sm:flex-none bg-[#1B2A4A] hover:bg-[#5C1D24] text-white px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm text-center"
          >
            <Plus className="w-4 h-4" /> Assign Homework
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-[#64748B] font-semibold">
          Synchronizing class rosters and lecture schedules...
        </div>
      ) : (
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'My Divisions', value: mySections.length, desc: 'Assigned sections', icon: ClipboardList },
              { title: 'My Students', value: totalMyStudentsCount, desc: 'Assigned rosters', icon: Users },
              { title: 'Total Lectures', value: myPeriods.length, desc: 'Weekly schedule', icon: Clock },
              { title: 'Total School Students', value: students.length, desc: 'Global directory strength', icon: Award },
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

          {/* Main Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Hand: Core quick features */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-[#E5E0D8] shadow-sm space-y-4">
                <h3 className="text-base font-['Newsreader'] font-bold text-[#1A1918] flex items-center gap-2">
                  <ClipboardList className="w-4.5 h-4.5 text-[#5C1D24]" /> Primary Tasks Dashboard
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Link 
                    to="/dashboard/attendance"
                    className="p-5 bg-[#F7F5F0] hover:bg-[#E5E0D8]/40 border border-[#E5E0D8] rounded-xl flex flex-col justify-between space-y-3 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-white border border-[#E5E0D8] text-[#1B2A4A] flex items-center justify-center shrink-0">
                      <CalendarCheck className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1A1918] group-hover:text-[#1B2A4A] transition-colors">Mark Attendance</h4>
                      <p className="text-[11px] text-[#64748B] mt-1 leading-relaxed">Log daily attendance rosters for all sections.</p>
                    </div>
                  </Link>

                  <Link 
                    to="/dashboard/homework"
                    className="p-5 bg-[#F7F5F0] hover:bg-[#E5E0D8]/40 border border-[#E5E0D8] rounded-xl flex flex-col justify-between space-y-3 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-white border border-[#E5E0D8] text-[#1B2A4A] flex items-center justify-center shrink-0">
                      <BookOpen className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1A1918] group-hover:text-[#1B2A4A] transition-colors">Post Assignments</h4>
                      <p className="text-[11px] text-[#64748B] mt-1 leading-relaxed">Assign due tasks, grading structures, and references.</p>
                    </div>
                  </Link>

                  <Link 
                    to="/dashboard/exams"
                    className="p-5 bg-[#F7F5F0] hover:bg-[#E5E0D8]/40 border border-[#E5E0D8] rounded-xl flex flex-col justify-between space-y-3 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-white border border-[#E5E0D8] text-[#1B2A4A] flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1A1918] group-hover:text-[#1B2A4A] transition-colors">Enter Test Marks</h4>
                      <p className="text-[11px] text-[#64748B] mt-1 leading-relaxed">Record academic marks to generate digital cards.</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Active Assigned Sections list */}
              <div className="bg-white p-6 rounded-xl border border-[#E5E0D8] shadow-sm space-y-4">
                <h3 className="text-base font-['Newsreader'] font-bold text-[#1A1918] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#1B2A4A]" /> Assigned Class Divisions
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-semibold">
                    <thead>
                      <tr className="text-[#64748B] border-b border-[#E5E0D8]">
                        <th className="pb-3 font-bold uppercase tracking-wider">Class & Section</th>
                        <th className="pb-3 font-bold uppercase tracking-wider">Role</th>
                        <th className="pb-3 font-bold uppercase tracking-wider">Class Strength</th>
                        <th className="pb-3 font-bold uppercase tracking-wider">Section ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F7F5F0] text-[#64748B]">
                      {mySections.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="py-8 text-center text-xs text-[#64748B] font-semibold">
                            You are not currently assigned as a Class Teacher to any section.
                          </td>
                        </tr>
                      ) : (
                        mySections.map((row, idx) => {
                          const sectionStudentsCount = students.filter(s => s.section?.id === row.id).length;
                          return (
                            <tr key={idx} className="hover:bg-[#F7F5F0]/50">
                              <td className="py-3.5 font-bold text-[#1A1918]">{row.class_name} - {row.name}</td>
                              <td className="py-3.5">
                                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">
                                  Class Teacher
                                </span>
                              </td>
                              <td className="py-3.5 font-mono">{sectionStudentsCount} Students</td>
                              <td className="py-3.5 text-xs text-[#64748B] font-mono">SEC-00{row.id}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Hand: Schedule & Notifications */}
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
                            {sch.subject_name || sch.subject?.name} - {sch.section_name || sch.section?.name}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded uppercase bg-white text-[#64748B] border border-[#E5E0D8]">
                          Scheduled
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
                      No school notices posted yet.
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

export default TeacherDashboard;
