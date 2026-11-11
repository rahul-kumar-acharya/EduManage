import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { feeService } from '../../services/feeService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { Receipt, Plus, Calendar, Trash2, CreditCard } from 'lucide-react';

const FeeStructures = () => {
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    due_date: '',
  });

  const fetchStructures = async () => {
    setLoading(true);
    try {
      const data = await feeService.getStructures();
      setStructures(data.results || data);
    } catch (err) {
      console.error("Failed to fetch fee structures:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStructures();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this fee structure configuration?")) {
      try {
        await feeService.deleteStructure(id);
        fetchStructures();
      } catch (err) {
        console.error("Failed to delete fee structure:", err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await feeService.createStructure(formData);
      setModalOpen(false);
      setFormData({ name: '', amount: '', due_date: '' });
      fetchStructures();
    } catch (err) {
      console.error("Failed to create fee structure:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-['Inter'] text-slate-900">
      
      {/* Category Pill Indicator */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-50 border border-indigo-200/60 text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
        <Receipt className="w-3.5 h-3.5 text-indigo-600" />
        <span>Financial Structure Setup</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">Fee Structures & Billing Setup</h1>
          <p className="text-xs text-slate-500 mt-1">Configure tuition fees, exam fees, activity charges, and set payment due dates.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link to="/dashboard/fees/collection" className="flex-1 sm:flex-none">
            <Button variant="secondary" size="sm" className="w-full gap-2 py-2 shadow-xs">
              <CreditCard className="w-4 h-4 text-slate-600" /> Collect Fee
            </Button>
          </Link>
          <Button variant="primary" size="sm" onClick={() => setModalOpen(true)} className="flex-1 sm:flex-none gap-2 shadow-xs">
            <Plus className="w-4 h-4" /> Add Fee Structure
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {structures.map((st) => (
          <div key={st.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Receipt className="w-4.5 h-4.5" />
                </div>
                <Badge variant="warning">Active Fee</Badge>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900">{st.name}</h3>
                <div className="text-xl font-semibold font-mono text-emerald-600 mt-1">₹{parseFloat(st.amount || 0).toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Due: {st.due_date}
              </span>
              <button
                onClick={() => handleDelete(st.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                title="Delete Structure"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {structures.length === 0 && !loading && (
          <div className="col-span-full bg-white p-12 text-center text-slate-400 rounded-xl border border-slate-200 shadow-xs font-medium italic">
            No fee structures configured yet. Click "Add Fee Structure" to start.
          </div>
        )}
      </div>

      {/* Add Fee Structure Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Configure Fee Structure">
        <form onSubmit={handleSubmit} className="space-y-4 font-['Inter']">
          <Input
            label="Fee Category Name"
            placeholder="e.g. Term 1 Tuition Fee"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Amount (₹)"
              type="number"
              min="0"
              step="0.01"
              placeholder="500.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
            <Input
              label="Payment Due Date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              required
            />
          </div>
          <Button type="submit" variant="primary" className="w-full mt-2 shadow-xs" loading={submitting}>
            Create Fee Structure
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default FeeStructures;
