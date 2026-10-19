import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { studentService } from '../../services/studentService';
import { noticeService } from '../../services/noticeService';
import { homeworkService } from '../../services/homeworkService';
import { attendanceService } from '../../services/attendanceService';
import { examService } from '../../services/examService';
import { feeService } from '../../services/feeService';
import { 
  Users, 
  Receipt, 
  CalendarCheck, 
  BookOpen, 
  Award, 
  Bell,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ParentDashboard = () => {
  const { user } = useAuth();
  
  const [students, setStudents] = useState([]);
  const [notices, setNotices] = useState([]);
  const [homeworks, setHomeworks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks] = useState([]);
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [studentsRes, noticesRes, homeworksRes, attendanceRes, marksRes, duesRes] = await Promise.all([
          studentService.getStudents(),
          noticeService.getNotices(),
          homeworkService.getHomeworks(),
          attendanceService.getRecords(),
          examService.getMarks(),
          feeService.getDues()
        ]);

        setStudents(studentsRes.results || studentsRes);
        setNotices(noticesRes.results || noticesRes);
        setHomeworks(homeworksRes.results || homeworksRes);
        setAttendance(attendanceRes.results || attendanceRes);
        setMarks(marksRes.results || marksRes);
        setDues(duesRes.results || duesRes);
      } catch (err) {
        console.error("Failed to load Parent dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Try to find a ward matching guardian name or phone, or default to the first student in the school
  const myWard = students.find(s => 
    s.guardian_phone === user?.phone || 
    (s.guardian_name && user?.last_name && s.guardian_name.toLowerCase().includes(user.last_name.toLowerCase()))
  ) || students[0];

  // Ward section
  const sectionName = myWard?.section 
    ? `${myWard.section.class_name} - ${myWard.section.name}` 
    : 'No Assigned Class';

  // Homework for my ward's section
  const wardHomeworks = homeworks.filter(h => myWard && h.section === myWard.section?.id);
  
  // Attendance rate calculation for my ward
  const wardAttendance = attendance.filter(r => myWard && r.student?.id === myWard.id);
  const presentDays = wardAttendance.filter(r => r.status === 'PRESENT').length;
  const attendanceRate = wardAttendance.length > 0 ? Math.round((presentDays / wardAttendance.length) * 100) : 100;

  // Grade averages calculation for my ward
  const wardMarks = marks.filter(m => myWard && m.student?.id === myWard.id);
  const avgScore = wardMarks.length > 0 
    ? Math.round(wardMarks.reduce((acc, curr) => acc + parseFloat(curr.marks_obtained || 0), 0) / wardMarks.length) 
    : null;

  let gradeStr = 'N/A';
  if (avgScore !== null) {
    if (avgScore >= 90) gradeStr = 'Grade A+';
    else if (avgScore >= 80) gradeStr = 'Grade A';
    else if (avgScore >= 70) gradeStr = 'Grade B';
    else if (avgScore >= 60) gradeStr = 'Grade C';
    else if (avgScore >= 50) gradeStr = 'Grade D';
    else gradeStr = 'Grade F';
  }

  // Fees billing status for my ward
  const wardDue = dues.find(d => myWard && d.student?.id === myWard.id);
  const balanceDue = wardDue ? parseFloat(wardDue.balance_due || 0) : 0;
  const isPaid = balanceDue <= 0;

  return (
    <div className="space-y-8 font-['Inter'] text-slate-800">
      
      {/* Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-['Outfit'] font-bold text-slate-900">
              Hello, {user?.first_name || 'Parent'} 👋
            </h1>
            <span className="px-3 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-xs font-semibold tracking-wide">
              Parent Workspace
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm">
            Monitor your linked child's attendance summaries, homework records, and due invoices.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400 font-semibold animate-pulse">
          Synchronizing ward records and school feeds...
        </div>
      ) : (
        <>
          {/* Linked Child Profile Switcher */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-['Outfit'] font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-indigo-600" /> Linked Student Ward
            </h3>
            
            {myWard ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-indigo-600 font-bold flex items-center justify-center text-base shadow-2xs">
                    {myWard.user?.first_name?.charAt(0)}{myWard.user?.last_name?.charAt(0)}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-slate-900">{myWard.user?.first_name} {myWard.user?.last_name}</h4>
                    <p className="text-xs text-slate-500 font-medium">{sectionName} • Roll No. {myWard.roll_number || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full text-xs font-semibold">
                    {attendanceRate}% Attendance
                  </span>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200/80 rounded-full text-xs font-semibold font-mono">
                    {myWard.admission_number}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-400 font-medium">
                No linked ward found. Please contact the administrator.
              </div>
            )}
          </div>

          {/* Ward Status Indicators Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Side Child Indicators */}
            <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-white border border-slate-200 shadow-2xs hover:border-indigo-200 hover:shadow-md transition-all rounded-2xl space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Attendance Log</span>
                    <span className="text-xl font-['Outfit'] font-bold text-slate-900 block mt-1">{attendanceRate}% Rate</span>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                      {presentDays} Present / {wardAttendance.length - presentDays} Absent records.
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-white border border-slate-200 shadow-2xs hover:border-indigo-200 hover:shadow-md transition-all rounded-2xl space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Homework Due</span>
                    <span className="text-xl font-['Outfit'] font-bold text-slate-900 block mt-1">
                      {wardHomeworks.length} Pending
                    </span>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1">Assigned school tasks.</p>
                  </div>
                </div>

                <div className="p-5 bg-white border border-slate-200 shadow-2xs hover:border-indigo-200 hover:shadow-md transition-all rounded-2xl space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Exam Performance</span>
                    <span className="text-xl font-['Outfit'] font-bold text-slate-900 block mt-1">
                      {gradeStr}
                    </span>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                      {avgScore !== null ? `Academic average: ${avgScore}%` : 'No grading records.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Core Ward Homeworks list */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-['Outfit'] font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" /> Ward Pending Assignments
                  </h3>
                </div>

                <div className="space-y-3">
                  {wardHomeworks.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 font-medium">
                      No pending assignments for your ward.
                    </div>
                  ) : (
                    wardHomeworks.map((hw, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center gap-4 text-xs font-semibold">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-indigo-600 uppercase font-mono font-semibold">
                            {hw.subject_name || hw.subject?.name || 'General'}
                          </span>
                          <h5 className="text-slate-900 font-bold block">{hw.title}</h5>
                          <p className="text-xs text-slate-500 leading-relaxed font-normal">{hw.description}</p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
                          Pending
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Side Billing Alerts */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-base font-['Outfit'] font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-600" /> Outstanding Invoice Balances
                </h3>

                <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 text-center">
                  <div className="text-xs text-slate-500 font-bold">Academic Dues Outstanding</div>
                  <strong className="text-3xl font-['Outfit'] font-bold text-emerald-600 block mt-1">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(balanceDue)}
                  </strong>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {isPaid ? 'No outstanding due payments for this session.' : 'Please pay outstanding balance at the school desk.'}
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-base font-['Outfit'] font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-600" /> Direct Admin Alerts
                </h3>
                
                <div className="space-y-3">
                  {notices.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400 font-medium">
                      No notices from administration.
                    </div>
                  ) : (
                    notices.slice(0, 2).map((notice, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                        <span className="text-[10px] text-indigo-600 uppercase font-bold tracking-wider font-mono">
                          {new Date(notice.created_at).toLocaleDateString()}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">{notice.title}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">{notice.content}</p>
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

export default ParentDashboard;
