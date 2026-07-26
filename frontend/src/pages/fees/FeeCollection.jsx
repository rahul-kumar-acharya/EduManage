import React, { useState, useEffect } from 'react';
import { feeService } from '../../services/feeService';
import { studentService } from '../../services/studentService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { CreditCard, Printer, CheckCircle2, Receipt, GraduationCap } from 'lucide-react';

const FeeCollection = () => {
  const [students, setStudents] = useState([]);
  const [structures, setStructures] = useState([]);
  const [payments, setPayments] = useState([]);

  const [selectedStudent, setSelectedStudent] = useState('');
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
      fetchData();
    } catch (err) {
      console.error("Failed to collect fee:", err);
      setError("Payment collection failed. Please verify amounts.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans'] text-[#1A1918]">
      
      {/* Category Pill Indicator */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5C1D24]/10 border border-[#5C1D24]/20 text-[10px] font-bold text-[#5C1D24] uppercase tracking-wider">
        <CreditCard className="w-3.5 h-3.5 text-[#5C1D24]" />
        <span>Cashier Collection Register</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
        <div>
          <h1 className="text-3xl font-['Newsreader'] font-bold text-[#1A1918]">Fee Collection & Receipts</h1>
          <p className="text-xs text-[#64748B] mt-1">Record fee payments, issue instant digital receipts, and audit transactions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Entry Form */}
        <div className="bg-white p-6 rounded-xl border border-[#E5E0D8] shadow-sm space-y-4 h-fit">
          <h3 className="text-base font-['Newsreader'] font-bold text-[#1A1918] flex items-center gap-2">
            <CreditCard className="w-4.5 h-4.5 text-[#1B2A4A]" /> Collect Payment
          </h3>

          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-lg">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-[#1A1918] uppercase tracking-wider mb-2">
                Select Student
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg px-4 py-2.5 text-xs font-semibold text-[#1A1918] focus:outline-none focus:border-[#1B2A4A] transition-colors"
                required
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.user?.first_name} {st.user?.last_name} ({st.admission_number})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#1A1918] uppercase tracking-wider mb-2">
                Select Fee Category
              </label>
              <select
                value={selectedStructure}
                onChange={(e) => handleStructureChange(e.target.value)}
                className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg px-4 py-2.5 text-xs font-semibold text-[#1A1918] focus:outline-none focus:border-[#1B2A4A] transition-colors"
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

            <Button type="submit" variant="primary" className="w-full mt-2" loading={submitting}>
              Record Fee Payment
            </Button>
          </form>
        </div>

        {/* Transactions Audit Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#E5E0D8] shadow-sm space-y-4">
          <h3 className="text-base font-['Newsreader'] font-bold text-[#1A1918] flex items-center gap-2">
            <Receipt className="w-4.5 h-4.5 text-[#5C1D24]" /> Recent Payment Transactions
          </h3>

          <div className="overflow-x-auto rounded-lg border border-[#E5E0D8]">
            <table className="w-full text-left text-xs font-semibold">
              <thead className="bg-[#F7F5F0] text-[10px] font-bold text-[#64748B] uppercase tracking-wider border-b border-[#E5E0D8] select-none">
                <tr>
                  <th className="px-4 py-3">Receipt No.</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Fee Category</th>
                  <th className="px-4 py-3">Amount Paid</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F5F0] text-[#64748B]">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F7F5F0]/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#1B2A4A] font-bold">{p.receipt_number}</td>
                    <td className="px-4 py-3 font-bold text-[#1A1918]">
                      {p.student_details?.user?.first_name} {p.student_details?.user?.last_name}
                    </td>
                    <td className="px-4 py-3 text-xs">{p.fee_structure_details?.name}</td>
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
                        className="text-xs text-blue-600 hover:underline font-bold"
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}

                {payments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[#64748B] font-medium italic">
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
          <div className="space-y-6 pt-2">
            <div className="text-center border-b border-[#F7F5F0] pb-4">
              <div className="w-10 h-10 rounded-lg bg-[#F7F5F0] border border-[#E5E0D8] text-[#1B2A4A] flex items-center justify-center mx-auto mb-3">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-['Newsreader'] font-bold text-[#1A1918] uppercase tracking-wider">Official Payment Receipt</h3>
              <div className="font-mono text-xs text-[#1B2A4A] font-bold">{activeReceipt.receipt_number}</div>
              <div className="text-[11px] text-[#64748B] mt-1 font-semibold">{new Date(activeReceipt.created_at).toLocaleString()}</div>
            </div>

            <div className="space-y-2 text-xs font-semibold">
              <div className="flex justify-between py-1 border-b border-[#F7F5F0]">
                <span className="text-[#64748B]">Student Name</span>
                <span className="font-bold text-[#1A1918]">
                  {activeReceipt.student_details?.user?.first_name} {activeReceipt.student_details?.user?.last_name}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F7F5F0]">
                <span className="text-[#64748B]">Admission Number</span>
                <span className="font-mono text-[#1B2A4A] font-bold">{activeReceipt.student_details?.admission_number}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F7F5F0]">
                <span className="text-[#64748B]">Fee Category</span>
                <span className="font-bold text-[#1A1918]">{activeReceipt.fee_structure_details?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F7F5F0]">
                <span className="text-[#64748B]">Category Total</span>
                <span className="font-mono text-[#1A1918]">₹{parseFloat(activeReceipt.fee_structure_details?.amount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F7F5F0]">
                <span className="text-[#64748B]">Amount Paid</span>
                <span className="font-mono font-bold text-emerald-600 text-sm">₹{parseFloat(activeReceipt.amount_paid || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 items-center">
                <span className="text-[#64748B]">Payment Status</span>
                <Badge variant={activeReceipt.status === 'PAID' ? 'success' : 'warning'}>{activeReceipt.status}</Badge>
              </div>
            </div>

            <Button variant="primary" className="w-full gap-2" onClick={() => window.print()}>
              <Printer className="w-4 h-4" /> Print Digital Receipt
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FeeCollection;
