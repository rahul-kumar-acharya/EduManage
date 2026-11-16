import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { examService } from '../../services/examService';
import { academicService } from '../../services/academicService';
import { studentService } from '../../services/studentService';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Save, CheckCircle2, Award } from 'lucide-react';

const computeGrade = (percentage) => {
  if (percentage >= 90) return { letter: 'A+', variant: 'success' };
  if (percentage >= 80) return { letter: 'A', variant: 'success' };
  if (percentage >= 70) return { letter: 'B', variant: 'purple' };
  if (percentage >= 60) return { letter: 'C', variant: 'info' };
  if (percentage >= 50) return { letter: 'D', variant: 'warning' };
  return { letter: 'F', variant: 'danger' };
};

const MarksEntry = () => {
  const [searchParams] = useSearchParams();
  const queryExam = searchParams.get('exam') || '';

  const [exams, setExams] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedExam, setSelectedExam] = useState(queryExam);
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const [students, setStudents] = useState([]);
  const [scoresMap, setScoresMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [exRes, secRes, subRes] = await Promise.all([
          examService.getExams(),
          academicService.getSections(),
          academicService.getSubjects(),
        ]);
        const exList = exRes.results || exRes;
        const secList = secRes.results || secRes;
        const subList = subRes.results || subRes;

        setExams(exList);
        setSections(secList);
        setSubjects(subList);

        setSelectedExam((prev) => prev || (exList.length > 0 ? exList[0].id.toString() : ''));
        if (secList.length > 0) setSelectedSection(secList[0].id.toString());
        if (subList.length > 0) setSelectedSubject(subList[0].id.toString());
      } catch (err) {
        console.error("Failed to fetch dropdowns:", err);
      }
    };
    fetchDropdowns();
  }, []);

  const loadGradebook = useCallback(async () => {
    if (!selectedExam || !selectedSection || !selectedSubject) return;
    setLoading(true);
    setMessage('');
    try {
      const studsData = await studentService.getStudents({ section: selectedSection });
      const studsList = studsData.results || studsData;
      setStudents(studsList);

      const marksData = await examService.getMarks({
        exam: selectedExam,
        section: selectedSection,
        subject: selectedSubject,
      });
      const marksList = marksData.results || marksData;

      const map = {};
      studsList.forEach((s) => {
        const existing = marksList.find((m) => m.student === s.id);
        map[s.id] = {
          marks_obtained: existing ? existing.marks_obtained : '0',
          max_marks: existing ? existing.max_marks : '100',
        };
      });
      setScoresMap(map);
    } catch (err) {
      console.error("Failed to load gradebook:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedExam, selectedSection, selectedSubject]);

  useEffect(() => {
    loadGradebook();
  }, [loadGradebook]);

  const handleScoreChange = (studentId, field, value) => {
    setScoresMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!selectedExam || !selectedSubject || !selectedSection || students.length === 0) return;
    setSaving(true);
    setMessage('');
    try {
      const records = Object.keys(scoresMap).map((sid) => ({
        student_id: parseInt(sid),
        marks_obtained: parseFloat(scoresMap[sid].marks_obtained || 0),
        max_marks: parseFloat(scoresMap[sid].max_marks || 100),
      }));

      await examService.bulkSaveMarks({
        exam_id: parseInt(selectedExam),
        subject_id: parseInt(selectedSubject),
        section_id: parseInt(selectedSection),
        records: records,
      });
      setMessage('Subject marks saved successfully!');
    } catch (err) {
      console.error("Failed to save marks:", err);
      setMessage('Failed to save marks.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-['Inter'] text-slate-900">
      
      {/* Category Pill Indicator */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-50 border border-indigo-200/60 text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
        <Award className="w-3.5 h-3.5 text-indigo-600" />
        <span>Institutional Gradebook Ledger</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">Subject Gradebook Entry</h1>
          <p className="text-xs text-slate-500 mt-1">Log exam scores for enrolled students with automatic grade scale mapping.</p>
        </div>
        {students.length > 0 && (
          <Button variant="primary" size="sm" onClick={handleSave} loading={saving} className="gap-2 shadow-xs">
            <Save className="w-4 h-4" /> Save Marks
          </Button>
        )}
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Examination Term
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
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Class Section
          </label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
          >
            {sections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.class_name} - {sec.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name} ({sub.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Gradebook Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs font-medium">
        <table className="w-full text-left text-xs text-slate-900">
          <thead className="bg-slate-50 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 select-none">
            <tr>
              <th className="px-6 py-4 whitespace-nowrap">Student</th>
              <th className="px-6 py-4 whitespace-nowrap">Admission No.</th>
              <th className="px-6 py-4 whitespace-nowrap">Marks Obtained</th>
              <th className="px-6 py-4 whitespace-nowrap">Max Marks</th>
              <th className="px-6 py-4 whitespace-nowrap">Percentage</th>
              <th className="px-6 py-4 whitespace-nowrap">Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            {students.length > 0 ? (
              students.map((st) => {
                const rec = scoresMap[st.id] || { marks_obtained: 0, max_marks: 100 };
                const obt = parseFloat(rec.marks_obtained || 0);
                const max = parseFloat(rec.max_marks || 100);
                const pct = max > 0 ? roundPct((obt / max) * 100) : 0;
                const gInfo = computeGrade(pct);

                return (
                  <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {st.user?.first_name} {st.user?.last_name}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-700 font-semibold">{st.admission_number}</td>
                    <td className="px-6 py-4 w-40">
                      <input
                        type="number"
                        min="0"
                        max={rec.max_marks}
                        step="0.5"
                        value={rec.marks_obtained}
                        onChange={(e) => handleScoreChange(st.id, 'marks_obtained', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                      />
                    </td>
                    <td className="px-6 py-4 w-32">
                      <input
                        type="number"
                        min="1"
                        value={rec.max_marks}
                        onChange={(e) => handleScoreChange(st.id, 'max_marks', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                      />
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">{pct}%</td>
                    <td className="px-6 py-4">
                      <Badge variant={gInfo.variant}>{gInfo.letter}</Badge>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-400 font-medium italic">
                  {loading ? 'Loading gradebook...' : 'No enrolled students found in this section.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const roundPct = (num) => Math.round(num * 100) / 100;

export default MarksEntry;
