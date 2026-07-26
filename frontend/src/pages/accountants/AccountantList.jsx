import React, { useState, useEffect } from 'react';
import { accountantService } from '../../services/accountantService';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { UserCheck, Plus, Trash2, Mail, Phone, Edit2, ShieldAlert } from 'lucide-react';

const AccountantList = () => {
  const [accountants, setAccountants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editAccountant, setEditAccountant] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    employee_id: '',
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id: number, name: string }

  const fetchAccountants = async () => {
    setLoading(true);
    try {
      const data = await accountantService.getAccountants();
      setAccountants(data.results || data);
    } catch (err) {
      console.error("Failed to fetch accountants:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountants();
  }, []);

  const initiateDelete = (id, name) => {
    setDeleteTarget({ id, name });
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await accountantService.deleteAccountant(deleteTarget.id);
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
      fetchAccountants();
    } catch (err) {
      console.error("Failed to delete accountant:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (accountant) => {
    setEditAccountant(accountant);
    setFormData({
      first_name: accountant.user?.first_name || '',
      last_name: accountant.user?.last_name || '',
      email: accountant.user?.email || '',
      password: '',
      phone: accountant.user?.phone || '',
      employee_id: accountant.employee_id || '',
      is_active: accountant.user?.is_active ?? true,
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditAccountant(null);
    setError('');
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      phone: '',
      employee_id: '',
      is_active: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (editAccountant) {
        const payload = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          employee_id: formData.employee_id,
          is_active: formData.is_active,
        };
        await accountantService.updateAccountant(editAccountant.id, payload);
      } else {
        await accountantService.createAccountant(formData);
      }
      handleCloseModal();
      fetchAccountants();
    } catch (err) {
      console.error("Failed to submit accountant form:", err);
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          const targetErrors = errorData.errors || errorData;
          if (typeof targetErrors === 'object') {
            const messages = Object.entries(targetErrors)
              .map(([key, val]) => {
                const cleanVal = Array.isArray(val)
                  ? val.join(' ')
                  : (typeof val === 'object' && val !== null ? JSON.stringify(val) : val);
                return `${key.replace('_', ' ').toUpperCase()}: ${cleanVal}`;
              })
              .join(' | ');
            setError(messages);
          } else {
            setError(JSON.stringify(errorData));
          }
        } else {
          setError(JSON.stringify(errorData));
        }
      } else {
        setError(editAccountant ? "Failed to save changes." : "Failed to create accountant account.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Accountant Name',
      accessor: 'user',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#5C1D24] text-white font-bold flex items-center justify-center text-xs">
            {row.user?.first_name?.charAt(0)}{row.user?.last_name?.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-[#1A1918]">{row.user?.first_name} {row.user?.last_name}</div>
            <div className="text-xs text-[#64748B]">{row.user?.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Employee ID',
      accessor: 'employee_id',
      render: (row) => <span className="font-mono text-xs text-[#1B2A4A] font-bold">{row.employee_id}</span>
    },
    {
      header: 'Phone Number',
      accessor: 'user.phone',
      render: (row) => <span className="text-xs text-[#64748B] font-medium">{row.user?.phone || 'N/A'}</span>
    },
    {
      header: 'Status',
      accessor: 'user.is_active',
      render: (row) => (
        <Badge variant={row.user?.is_active ? 'success' : 'danger'}>
          {row.user?.is_active ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleStartEdit(row)}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1B2A4A] hover:bg-[#1B2A4A]/10 transition-colors"
            title="Edit Accountant"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => initiateDelete(row.id, `${row.user?.first_name} ${row.user?.last_name}`)}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#5C1D24] hover:bg-[#5C1D24]/10 transition-colors"
            title="Remove Accountant"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans'] text-[#1A1918]">
      
      {/* Category Pill Indicator */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5C1D24]/10 border border-[#5C1D24]/20 text-[10px] font-bold text-[#5C1D24] uppercase tracking-wider">
        <UserCheck className="w-3.5 h-3.5 text-[#5C1D24]" />
        <span>Finance & Billing Staff Directory</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
        <div>
          <h1 className="text-3xl font-['Newsreader'] font-bold text-[#1A1918]">School Accountants</h1>
          <p className="text-xs text-[#64748B] mt-1">Manage accountant profiles, logins, and system billing access levels.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)} className="gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Add Accountant
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E0D8] shadow-sm">
        <Table columns={columns} data={accountants} emptyMessage="No accountants registered in database." />
      </div>

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editAccountant ? "Edit Accountant Details" : "Register School Accountant"}>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-lg mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              placeholder="Alex"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              placeholder="Johnson"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className={editAccountant ? "col-span-2" : ""}>
              <Input
                label="Official Email"
                type="email"
                placeholder="alex.j@school.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={!!editAccountant}
              />
            </div>
            {!editAccountant && (
              <Input
                label="Portal Password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Employee ID"
              placeholder="ACT-101"
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              required
            />
            <Input
              label="Phone Number"
              placeholder="+1234567890"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          {editAccountant && (
            <div>
              <label className="block text-[10px] font-bold text-[#1A1918] uppercase tracking-wider mb-2">
                Account Status
              </label>
              <select
                value={formData.is_active ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg px-4 py-2.5 text-xs font-semibold text-[#1A1918] focus:outline-none focus:border-[#1B2A4A] transition-colors"
              >
                <option value="active">Active (Can log in & manage billing)</option>
                <option value="inactive">Inactive (Access suspended)</option>
              </select>
            </div>
          )}
          <Button type="submit" variant="primary" className="w-full mt-2" loading={submitting}>
            {editAccountant ? "Save Changes" : "Register Accountant"}
          </Button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={deleteConfirmOpen} 
        onClose={() => setDeleteConfirmOpen(false)} 
        title="Confirm Remove Accountant"
      >
        <div className="space-y-6 text-center py-4">
          <div className="w-12 h-12 rounded-full bg-[#5C1D24]/10 border border-[#5C1D24]/20 text-[#5C1D24] flex items-center justify-center mx-auto mb-2">
            <Trash2 className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#1A1918]">Are you absolutely sure?</h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto leading-relaxed">
              This will permanently revoke the accountant profile of <strong className="text-[#1A1918]">"{deleteTarget?.name}"</strong>. They will no longer be able to log in or manage school cash flows. This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              className="flex-1 text-xs" 
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              className="flex-1 text-xs bg-[#5C1D24] text-white hover:bg-[#5C1D24]/90" 
              onClick={handleConfirmDelete}
              loading={submitting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AccountantList;
