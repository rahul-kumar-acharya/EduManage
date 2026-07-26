import api from './api';

export const examService = {
  getExams: async () => {
    const res = await api.get('/exams/exams/');
    return res.data;
  },
  createExam: async (data) => {
    const res = await api.post('/exams/exams/', data);
    return res.data;
  },
  deleteExam: async (id) => {
    const res = await api.delete(`/exams/exams/${id}/`);
    return res.data;
  },
  updateExam: async (id, data) => {
    const res = await api.put(`/exams/exams/${id}/`, data);
    return res.data;
  },
  getMarks: async (params = {}) => {
    const res = await api.get('/exams/marks/', { params });
    return res.data;
  },
  bulkSaveMarks: async (data) => {
    const res = await api.post('/exams/marks/bulk-entry/', data);
    return res.data;
  },
  getReportCard: async (studentId, examId) => {
    const res = await api.get(`/exams/marks/report-card/?student_id=${studentId}&exam_id=${examId}`);
    return res.data;
  },
};
