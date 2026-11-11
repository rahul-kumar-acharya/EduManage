import React, { useState, useEffect, useMemo } from 'react';
import { feeService } from '../../services/feeService';
import { studentService } from '../../services/studentService';
import { useToast } from '../../contexts/ToastContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { CreditCard, Printer, Receipt, GraduationCap, Search } from 'lucide-react';

const FeeCollection = () => {
  const [students, setStudents] = useState([]);
  const [structures, setStructures] = useState([]);
  const [payments, setPayments] = useState([]);

  const toast = useToast();
  const [selectedStudent, setSelectedStudent] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStructure, setSelectedStructure] = useState('');
  const [amountPaid, setAmountPaid] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [stRes, structRes, payRes] = await Promise.all([
        studentService.getStudents(),
        feeService.getStructures(),
        feeService.getPayments(),
      ]);
      const stList = stRes.results || stRes;
      const structList = structRes.results || structRes;
      const payList = payRes.results || payRes;

      setStudents(stList);
      setStructures(structList);
      setPayments(payList);

      if (stList.length > 0) setSelectedStudent(stList[0].id.toString());
      if (structList.length > 0) {
        setSelectedStructure(structList[0].id.toString());
        setAmountPaid(structList[0].amount.toString());
      }
    } catch (err) {
      console.error("Failed to fetch fee collection data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStructureChange = (structId) => {
    setSelectedStructure(structId);
    const found = structures.find((s) => s.id.toString() === structId);
    if (found) {
      setAmountPaid(found.amount.toString());
    }
  };

  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return students;
    const q = studentSearch.toLowerCase();
    return students.filter(
      (s) =>
        s.user?.first_name?.toLowerCase().includes(q) ||
        s.user?.last_name?.toLowerCase().includes(q) ||
        s.admission_number?.toLowerCase().includes(q)
    );
  }, [students, studentSearch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const receipt = await feeService.collectFee({
        student_id: parseInt(selectedStudent),
        fee_structure_id: parseInt(selectedStructure),
        amount_paid: parseFloat(amountPaid),
      });
      setActiveReceipt(receipt);
      setReceiptModalOpen(true);
      toast.success(`Fee collected successfully! Receipt #${receipt.receipt_number}`);
      fetchData();
    } catch (err) {
      console.error("Failed to collect fee:", err);
      const errMsg = err?.response?.data?.detail || "Payment collection failed. Please verify amounts.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-['Inter'] text-slate-900">
      
      {/* Category Pill Indicator */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-50 border border-indigo-200/60 text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
        <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
        <span>Cashier Collection Register</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">Fee Collection & Receipts</h1>
          <p className="text-xs text-slate-500 mt-1">Record fee payments, issue instant digital receipts, and audit transactions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Entry Form */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 h-fit">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-4.5 h-4.5 text-indigo-600" /> Collect Payment
          </h3>

          {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-lg">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Select Student ({filteredStudents.length})
                </label>
                {studentSearch && (
                  <button
                    type="button"
                    onClick={() => setStudentSearch('')}
                    className="text-[10px] text-indigo-600 hover:underline font-semibold"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              {/* Student Filter Search */}
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by name or admission no..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 transition-colors"
                />
              </div>

              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors cursor-pointer"
                required
              >
                {filteredStudents.length === 0 ? (
                  <option value="">No matching students found</option>
                ) : (
                  filteredStudents.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.user?.first_name} {st.user?.last_name} (#{st.admission_number || 'N/A'})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Fee Category
              </label>
              <select
                value={selectedStructure}
                onChange={(e) => handleStructureChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                required
              >
                {structures.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} (₹{parseFloat(st.amount).toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Amount Paid (₹)"
              type="number"
              min="0.01"
              step="0.01"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" className="w-full mt-2 shadow-xs" loading={submitting}>
              Record Fee Payment
            </Button>
          </form>
        </div>

        {/* Transactions Audit Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Receipt className="w-4.5 h-4.5 text-indigo-600" /> Recent Payment Transactions
          </h3>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs font-medium">
              <thead className="bg-slate-50 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 select-none">
                <tr>
                  <th className="px-4 py-3">Receipt No.</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Fee Category</th>
                  <th className="px-4 py-3">Amount Paid</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-indigo-600 font-semibold">{p.receipt_number}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {p.student_details?.user?.first_name} {p.student_details?.user?.last_name}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{p.fee_structure_details?.name}</td>
                    <td className="px-4 py-3 font-bold text-emerald-600">₹{parseFloat(p.amount_paid).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <Badge variant={p.status === 'PAID' ? 'success' : 'warning'}>{p.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => {
                          setActiveReceipt(p);
                          setReceiptModalOpen(true);
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline font-semibold"
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}

                {payments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-medium italic">
                      No fee transactions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Digital Receipt Modal */}
      <Modal isOpen={receiptModalOpen} onClose={() => setReceiptModalOpen(false)} title="Official Fee Payment Receipt">
        {activeReceipt && (
          <div className="space-y-6 pt-2 font-['Inter']">
            <div className="text-center border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 uppercase tracking-wider">Official Payment Receipt</h3>
              <div className="font-mono text-xs text-indigo-600 font-semibold">{activeReceipt.receipt_number}</div>
              <div className="text-[11px] text-slate-500 mt-1 font-medium">{new Date(activeReceipt.created_at).toLocaleString()}</div>
            </div>

            <div className="space-y-2 text-xs font-medium">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Student Name</span>
                <span className="font-semibold text-slate-900">
                  {activeReceipt.student_details?.user?.first_name} {activeReceipt.student_details?.user?.last_name}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Admission Number</span>
                <span className="font-mono text-slate-700 font-semibold">{activeReceipt.student_details?.admission_number}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Fee Category</span>
                <span className="font-semibold text-slate-900">{activeReceipt.fee_structure_details?.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Category Total</span>
                <span className="font-mono text-slate-900">₹{parseFloat(activeReceipt.fee_structure_details?.amount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Amount Paid</span>
                <span className="font-mono font-bold text-emerald-600 text-sm">₹{parseFloat(activeReceipt.amount_paid || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1.5 items-center">
                <span className="text-slate-500">Payment Status</span>
                <Badge variant={activeReceipt.status === 'PAID' ? 'success' : 'warning'}>{activeReceipt.status}</Badge>
              </div>
            </div>

            <Button variant="primary" className="w-full gap-2 shadow-xs" onClick={() => window.print()}>
              <Printer className="w-4 h-4" /> Print Digital Receipt
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FeeCollection;
