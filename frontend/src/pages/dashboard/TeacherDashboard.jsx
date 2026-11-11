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
  
  const getStudentSecId = (st) => {
    if (!st) return null;
    if (typeof st.section === 'object' && st.section?.id) return st.section.id;
    if (st.section) return st.section;
    if (st.section_details?.id) return st.section_details.id;
    return null;
  };

  // Find all sections where the current teacher is assigned as class teacher
  const mySections = [];
  classes.forEach(cls => {
    if (cls.sections) {
      cls.sections.forEach(sec => {
        const isMySection = (currentTeacher && sec.class_teacher === currentTeacher.id) ||
          user?.class_teacher_sections?.some(cts => cts.id === sec.id);
        if (isMySection) {
          mySections.push({
            ...sec,
            class_name: cls.name
          });
        }
      });
    }
  });

  // Calculate stats
  const totalMyStudentsCount = students.filter(s => {
    const sSecId = getStudentSecId(s);
    return sSecId && mySections.some(sec => sec.id.toString() === sSecId.toString());
  }).length;
  
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
    <div className="space-y-8 font-['Inter'] text-slate-800">
      
      {/* Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
              Welcome back, {user?.first_name || 'Teacher'} 👋
            </h1>
            <span className="px-3 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-xs font-semibold tracking-wide">
              Teacher Workspace
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm">
            Manage your daily class operations, mark student rosters, and log subject grades.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/dashboard/attendance"
            className="flex-1 sm:flex-none bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-2xs text-center"
          >
            <CalendarCheck className="w-4 h-4 text-indigo-600" /> Take Attendance
          </Link>
          <Link
            to="/dashboard/homework"
            className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm shadow-indigo-600/25 flex items-center justify-center gap-2 text-center active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" /> Assign Homework
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400 font-semibold">
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
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-200 hover:shadow-md transition-all flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 block">{m.title}</span>
                    <strong className="text-2xl font-semibold font-mono text-slate-900 block mt-1">{m.value}</strong>
                    <span className="text-[11px] text-slate-500 block">{m.desc}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
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
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <ClipboardList className="w-4.5 h-4.5 text-indigo-600" /> Primary Tasks
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Link 
                    to="/dashboard/attendance"
                    className="p-5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl flex flex-col justify-between space-y-3 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
                      <CalendarCheck className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">Mark Attendance</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Log daily attendance rosters for all sections.</p>
                    </div>
                  </Link>

                  <Link 
                    to="/dashboard/homework"
                    className="p-5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl flex flex-col justify-between space-y-3 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
                      <BookOpen className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">Post Assignments</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Assign due tasks, grading structures, and references.</p>
                    </div>
                  </Link>

                  <Link 
                    to="/dashboard/exams"
                    className="p-5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl flex flex-col justify-between space-y-3 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
                      <FileSpreadsheet className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">Enter Test Marks</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Record academic marks to generate digital cards.</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Active Assigned Sections list */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" /> Assigned Class Divisions
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-semibold">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-200">
                        <th className="pb-3 font-semibold uppercase tracking-wider text-[11px]">Class & Section</th>
                        <th className="pb-3 font-semibold uppercase tracking-wider text-[11px]">Role</th>
                        <th className="pb-3 font-semibold uppercase tracking-wider text-[11px]">Class Strength</th>
                        <th className="pb-3 font-semibold uppercase tracking-wider text-[11px]">Section ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {mySections.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="py-8 text-center text-xs text-slate-400 font-medium">
                            You are not currently assigned as a Class Teacher to any section.
                          </td>
                        </tr>
                      ) : (
                        mySections.map((row, idx) => {
                          const sectionStudentsCount = students.filter(s => {
                            const sSecId = getStudentSecId(s);
                            return sSecId && sSecId.toString() === row.id.toString();
                          }).length;
                          return (
                            <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-3.5 font-semibold text-slate-900">{row.class_name} - {row.name}</td>
                              <td className="py-3.5">
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                                  Class Teacher
                                </span>
                              </td>
                              <td className="py-3.5 font-mono">{sectionStudentsCount} Students</td>
                              <td className="py-3.5 text-xs text-slate-400 font-mono">SEC-00{row.id}</td>
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
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" /> Today's Lecture Schedule
                </h3>
                
                <div className="space-y-3">
                  {todayLectures.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400 font-medium">
                      No lectures scheduled for today.
                    </div>
                  ) : (
                    todayLectures.map((sch, i) => (
                      <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-500 font-mono block">
                            {sch.start_time} - {sch.end_time}
                          </span>
                          <span className="text-xs font-semibold text-slate-900 block">
                            {sch.subject_name || sch.subject?.name} - {sch.section_name || sch.section?.name}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 text-[9px] font-semibold rounded-md uppercase bg-white text-slate-600 border border-slate-200">
                          Scheduled
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-600" /> School Notice Feed
                </h3>
                
                <div className="space-y-3">
                  {notices.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400 font-medium">
                      No school notices posted yet.
                    </div>
                  ) : (
                    notices.slice(0, 3).map((notice, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                        <span className="text-[10px] text-indigo-600 uppercase font-bold tracking-wider">
                          {new Date(notice.created_at).toLocaleDateString()}
                        </span>
                        <h4 className="text-xs font-semibold text-slate-900 leading-snug">{notice.title}</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{notice.content}</p>
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
