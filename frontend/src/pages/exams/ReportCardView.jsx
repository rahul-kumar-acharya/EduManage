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
    <div className="space-y-6 font-['Plus_Jakarta_Sans'] text-[#1A1918]">
      
      {/* Category Pill Indicator */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5C1D24]/10 border border-[#5C1D24]/20 text-[10px] font-bold text-[#5C1D24] uppercase tracking-wider print:hidden">
        <Award className="w-3.5 h-3.5 text-[#5C1D24]" />
        <span>Academic Performance Report</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4 print:hidden">
        <div>
          <h1 className="text-3xl font-['Newsreader'] font-bold text-[#1A1918]">Digital Report Cards</h1>
          <p className="text-xs text-[#64748B] mt-1">Generate and print official student report cards with subject score breakdowns.</p>
        </div>
        {reportData && (
          <Button variant="primary" size="sm" onClick={() => window.print()} className="gap-2 shadow-sm">
            <Printer className="w-4 h-4" /> Print Report Card
          </Button>
        )}
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-[#E5E0D8] shadow-sm print:hidden">
        <div>
          <label className="block text-[10px] font-bold text-[#1A1918] uppercase tracking-wider mb-2">
            Select Examination Term
          </label>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg px-4 py-2.5 text-xs font-semibold text-[#1A1918] focus:outline-none focus:border-[#1B2A4A] transition-colors"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-[#1A1918] uppercase tracking-wider mb-2">
            Select Enrolled Student
          </label>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg px-4 py-2.5 text-xs font-semibold text-[#1A1918] focus:outline-none focus:border-[#1B2A4A] transition-colors"
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
        <div className="bg-white p-8 rounded-xl border border-[#E5E0D8] shadow-sm text-[#1A1918] space-y-6 max-w-4xl mx-auto print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
          {/* Institution Header */}
          <div className="text-center border-b border-[#F7F5F0] pb-6 print:border-black">
            <div className="w-12 h-12 rounded-lg bg-[#F7F5F0] border border-[#E5E0D8] text-[#1B2A4A] flex items-center justify-center mx-auto mb-3 print:hidden">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-['Newsreader'] font-bold text-[#1A1918] print:text-black uppercase tracking-wide">
              {reportData.school_name}
            </h2>
            <div className="text-[10px] text-[#5C1D24] font-bold uppercase tracking-wider mt-1 print:text-black">
              Official Academic Performance Report
            </div>
            <div className="text-xs text-[#64748B] mt-1 font-semibold print:text-black">
              {reportData.exam?.name} ({reportData.exam?.start_date} to {reportData.exam?.end_date})
            </div>
          </div>

          {/* Student Profile Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#F7F5F0] rounded-xl border border-[#E5E0D8] text-xs print:bg-gray-100 print:border-black print:text-black font-semibold">
            <div>
              <span className="text-[#64748B] block uppercase font-bold text-[9px] tracking-wider mb-0.5">Student Name</span>
              <strong className="text-sm text-[#1A1918] print:text-black">{reportData.student?.user?.first_name} {reportData.student?.user?.last_name}</strong>
            </div>
            <div>
              <span className="text-[#64748B] block uppercase font-bold text-[9px] tracking-wider mb-0.5">Admission No.</span>
              <strong className="font-mono text-[#1B2A4A] print:text-black">{reportData.student?.admission_number}</strong>
            </div>
            <div>
              <span className="text-[#64748B] block uppercase font-bold text-[9px] tracking-wider mb-0.5">Class & Section</span>
              <strong>
                {reportData.student?.section_details
                  ? `${reportData.student.section_details.class_name} - ${reportData.student.section_details.name}`
                  : 'Unassigned'}
              </strong>
            </div>
            <div>
              <span className="text-[#64748B] block uppercase font-bold text-[9px] tracking-wider mb-0.5">Roll Number</span>
              <strong>#{reportData.student?.roll_number || 'N/A'}</strong>
            </div>
          </div>

          {/* Subject Breakdown Table */}
          <div className="overflow-x-auto rounded-lg border border-[#E5E0D8] print:border-black">
            <table className="w-full text-left text-xs font-semibold">
              <thead className="bg-[#F7F5F0] text-[10px] font-bold text-[#64748B] uppercase tracking-wider border-b border-[#E5E0D8] print:bg-gray-200 print:text-black print:border-black">
                <tr>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Marks Obtained</th>
                  <th className="px-4 py-3">Max Marks</th>
                  <th className="px-4 py-3">Percentage</th>
                  <th className="px-4 py-3">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F5F0] text-[#64748B] print:divide-black">
                {reportData.marks && reportData.marks.length > 0 ? (
                  reportData.marks.map((m) => (
                    <tr key={m.id} className="hover:bg-[#F7F5F0]/50">
                      <td className="px-4 py-3 font-bold text-[#1A1918]">{m.subject_details?.name}</td>
                      <td className="px-4 py-3 font-mono">{m.marks_obtained}</td>
                      <td className="px-4 py-3 font-mono text-[#64748B] print:text-black">{m.max_marks}</td>
                      <td className="px-4 py-3 font-mono text-[#1A1918]">{m.percentage}%</td>
                      <td className="px-4 py-3">
                        <Badge variant={m.grade === 'F' ? 'danger' : 'success'}>{m.grade}</Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[#64748B] font-medium italic">
                      No marks recorded for this student in this exam.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Aggregate Results Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-[#F7F5F0] rounded-xl border border-[#E5E0D8] print:bg-gray-100 print:border-black gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider print:text-black">Aggregate Score</div>
              <div className="text-xl font-bold text-[#1A1918] print:text-black">
                {reportData.total_obtained} / {reportData.total_max}
                <span className="text-xs font-semibold text-[#64748B] ml-2">({reportData.overall_percentage}%)</span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4 sm:mt-0">
              <div className="text-right">
                <div className="text-[9px] text-[#64748B] uppercase font-bold tracking-wider">Overall Status</div>
                <div className="text-xs font-bold text-[#1A1918]">
                  {reportData.overall_grade === 'F' ? 'Needs Improvement' : 'Passed Successfully'}
                </div>
              </div>
              <div className="px-4 py-2 bg-[#1B2A4A] rounded text-white font-bold text-lg shadow-sm">
                {reportData.overall_grade}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 text-center text-[#64748B] rounded-xl border border-[#E5E0D8] shadow-sm font-medium italic">
          {loading ? 'Generating digital report card...' : 'Select an exam and student to preview report card.'}
        </div>
      )}
    </div>
  );
};

export default ReportCardView;
