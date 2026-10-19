import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { examService } from '../../services/examService';
import { studentService } from '../../services/studentService';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Award, Printer, GraduationCap } from 'lucide-react';

const ReportCardView = () => {
  const [searchParams] = useSearchParams();
  const queryExam = searchParams.get('exam') || '';

  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedExam, setSelectedExam] = useState(queryExam);
  const [selectedStudent, setSelectedStudent] = useState('');

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [exRes, stRes] = await Promise.all([
          examService.getExams(),
          studentService.getStudents(),
        ]);
        const exList = exRes.results || exRes;
        const stList = stRes.results || stRes;

        setExams(exList);
        setStudents(stList);

        if (!selectedExam && exList.length > 0) setSelectedExam(exList[0].id.toString());
        if (stList.length > 0) setSelectedStudent(stList[0].id.toString());
      } catch (err) {
        console.error("Failed to fetch report card options:", err);
      }
    };
    fetchOptions();
  }, []);

  const loadReportCard = async () => {
    if (!selectedExam || !selectedStudent) return;
    setLoading(true);
    try {
      const data = await examService.getReportCard(selectedStudent, selectedExam);
      setReportData(data);
    } catch (err) {
      console.error("Failed to load report card:", err);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportCard();
  }, [selectedExam, selectedStudent]);

  return (
    <div className="space-y-6 font-['Inter'] text-slate-900">
      
      {/* Category Pill Indicator */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-50 border border-indigo-200/60 text-[10px] font-bold text-indigo-700 uppercase tracking-wider print:hidden">
        <Award className="w-3.5 h-3.5 text-indigo-600" />
        <span>Academic Performance Report</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-['Outfit'] text-slate-900 tracking-tight">Digital Report Cards</h1>
          <p className="text-sm text-slate-500 mt-1">Generate and print official student report cards with subject score breakdowns.</p>
        </div>
        {reportData && (
          <Button variant="primary" size="sm" onClick={() => window.print()} className="gap-2 shadow-xs">
            <Printer className="w-4 h-4" /> Print Report Card
          </Button>
        )}
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs print:hidden">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 font-['Outfit']">
            Select Examination Term
          </label>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 font-['Outfit']">
            Select Enrolled Student
          </label>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
          >
            {students.map((st) => (
              <option key={st.id} value={st.id}>
                {st.user?.first_name} {st.user?.last_name} ({st.admission_number})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Report Card Document Template */}
      {reportData ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs text-slate-900 space-y-6 max-w-4xl mx-auto print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
          {/* Institution Header */}
          <div className="text-center border-b border-slate-100 pb-6 print:border-black">
            <div className="w-12 h-12 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3 print:hidden">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold font-['Outfit'] text-slate-900 print:text-black uppercase tracking-wide">
              {reportData.school_name}
            </h2>
            <div className="text-[11px] text-indigo-600 font-bold uppercase tracking-wider mt-1 print:text-black font-['Outfit']">
              Official Academic Performance Report
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium print:text-black">
              {reportData.exam?.name} ({reportData.exam?.start_date} to {reportData.exam?.end_date})
            </div>
          </div>

          {/* Student Profile Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs print:bg-gray-100 print:border-black print:text-black font-medium">
            <div>
              <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wider mb-0.5 font-['Outfit']">Student Name</span>
              <strong className="text-sm font-semibold text-slate-900 print:text-black">{reportData.student?.user?.first_name} {reportData.student?.user?.last_name}</strong>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wider mb-0.5 font-['Outfit']">Admission No.</span>
              <strong className="font-mono text-slate-800 font-semibold print:text-black">{reportData.student?.admission_number}</strong>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wider mb-0.5 font-['Outfit']">Class & Section</span>
              <strong className="text-slate-900 font-semibold">
                {reportData.student?.section_details
                  ? `${reportData.student.section_details.class_name} - ${reportData.student.section_details.name}`
                  : 'Unassigned'}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wider mb-0.5 font-['Outfit']">Roll Number</span>
              <strong className="text-slate-900 font-semibold">#{reportData.student?.roll_number || 'N/A'}</strong>
            </div>
          </div>

          {/* Subject Breakdown Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-200 print:border-black">
            <table className="w-full text-left text-xs font-medium">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 print:bg-gray-200 print:text-black print:border-black font-['Outfit']">
                <tr>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Marks Obtained</th>
                  <th className="px-4 py-3">Max Marks</th>
                  <th className="px-4 py-3">Percentage</th>
                  <th className="px-4 py-3">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 print:divide-black">
                {reportData.marks && reportData.marks.length > 0 ? (
                  reportData.marks.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900">{m.subject_details?.name}</td>
                      <td className="px-4 py-3 font-mono text-slate-800">{m.marks_obtained}</td>
                      <td className="px-4 py-3 font-mono text-slate-500 print:text-black">{m.max_marks}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-slate-900">{m.percentage}%</td>
                      <td className="px-4 py-3">
                        <Badge variant={m.grade === 'F' ? 'danger' : 'success'}>{m.grade}</Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400 font-medium italic">
                      No marks recorded for this student in this exam.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Aggregate Results Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-slate-50 rounded-xl border border-slate-200 print:bg-gray-100 print:border-black gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider print:text-black font-['Outfit']">Aggregate Score</div>
              <div className="text-xl font-bold text-slate-900 print:text-black font-['Outfit']">
                {reportData.total_obtained} / {reportData.total_max}
                <span className="text-xs font-semibold text-slate-500 ml-2">({reportData.overall_percentage}%)</span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4 sm:mt-0">
              <div className="text-right">
                <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider font-['Outfit']">Overall Status</div>
                <div className="text-xs font-semibold text-slate-800">
                  {reportData.overall_grade === 'F' ? 'Needs Improvement' : 'Passed Successfully'}
                </div>
              </div>
              <div className="px-4 py-2 bg-indigo-600 rounded-lg text-white font-bold text-lg shadow-xs font-['Outfit']">
                {reportData.overall_grade}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 text-center text-slate-400 rounded-xl border border-slate-200 shadow-xs font-medium italic">
          {loading ? 'Generating digital report card...' : 'Select an exam and student to preview report card.'}
        </div>
      )}
    </div>
  );
};

export default ReportCardView;
