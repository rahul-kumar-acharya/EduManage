import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Table from '../../components/ui/Table';
import { Users, Shield, Plus, Mail, CheckCircle2, UserCheck, ShieldAlert, KeyRound, Search, Lock, RefreshCw, X, AlertCircle } from 'lucide-react';

const SuperAdminUsers = () => {
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);

  // Modal State for Provisioning Super Admin
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  });

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await api.get('/accounts/super-admins/');
      setAdminUsers(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to fetch super admins:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setModalError('');
    setIsSubmitting(true);

    try {
      const res = await api.post('/accounts/create-super-admin/', formData);
      setNotification({
        type: 'success',
        message: res.data.message || `Super Admin '${formData.first_name}' provisioned successfully!`
      });
      setShowModal(false);
      setFormData({ first_name: '', last_name: '', email: '', password: '' });
      fetchAdmins();
    } catch (err) {
      console.error("Failed to create super admin:", err);
      const resData = err.response?.data;
      if (resData?.error) {
        setModalError(resData.error);
      } else {
        setModalError("Failed to provision administrator. Please check your inputs.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAdmins = adminUsers.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Administrator Name',
      accessor: 'first_name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1B2A4A] text-white flex items-center justify-center font-bold text-xs shrink-0 border border-[#1B2A4A]">
            {row.first_name ? row.first_name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div>
            <div className="font-bold text-[#1A1918]">{row.first_name} {row.last_name}</div>
            <div className="text-[10px] text-[#64748B] font-mono">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'System Privileges',
      accessor: 'role',
      render: () => (
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-[#5C1D24]" />
          <span className="text-xs font-semibold text-[#1A1918]">Root Infrastructure Administrator</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'is_active',
      render: (row) => (
        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
          row.is_active !== false 
            ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' 
            : 'bg-rose-500/10 text-rose-700 border border-rose-500/20'
        }`}>
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {row.is_active !== false ? 'Active' : 'Suspended'}
        </span>
      )
    },
    {
      header: 'Registration Date',
      accessor: 'date_joined',
      render: (row) => (
        <span className="text-xs text-[#64748B] font-mono">
          {new Date(row.date_joined).toLocaleDateString()}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-8 font-['Plus_Jakarta_Sans'] text-[#1A1918]">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
          notification.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-current opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E0D8] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-['Newsreader'] font-bold text-[#1A1918]">
              Global Platform Users & Roles
            </h1>
            <span className="px-3 py-1 rounded-md bg-[#5C1D24]/10 text-[#5C1D24] border border-[#5C1D24]/20 text-xs font-semibold uppercase tracking-wider">
              Root Access Control
            </span>
          </div>
          <p className="text-[#64748B] text-xs sm:text-sm">
            Provision platform super administrative personnel, security permissions, and audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setShowModal(true)}
            className="flex-1 sm:flex-none bg-[#1B2A4A] hover:bg-[#5C1D24] text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Provision Admin User
          </button>
          <button 
            onClick={fetchAdmins} 
            disabled={loading}
            className="bg-white hover:bg-[#F7F5F0] text-[#1A1918] border border-[#E5E0D8] px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-[#1B2A4A] ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Users List Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-['Newsreader'] font-bold text-[#1A1918]">Active Platform Administrators ({adminUsers.length})</h2>
          
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search admin user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#E5E0D8] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#1A1918] placeholder-[#64748B] focus:outline-none focus:border-[#1B2A4A]"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E0D8] shadow-sm overflow-hidden">
          <Table columns={columns} data={filteredAdmins} emptyMessage="No administrative users found." />
        </div>
      </div>

      {/* Modal for Provisioning Super Admin */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl border border-[#E5E0D8] shadow-2xl p-6 space-y-6">
            
            <div className="flex items-center justify-between border-b border-[#F7F5F0] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1B2A4A] text-white flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-['Newsreader'] font-bold text-[#1A1918]">Provision Super Admin</h3>
                  <p className="text-xs text-[#64748B]">Grants root administrative privileges to platform staff.</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-[#64748B] hover:text-[#1A1918] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1918] mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="First Name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg px-3.5 py-2.5 text-xs text-[#1A1918] focus:outline-none focus:border-[#1B2A4A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1A1918] mb-1">Last Name</label>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg px-3.5 py-2.5 text-xs text-[#1A1918] focus:outline-none focus:border-[#1B2A4A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1918] mb-1">Platform Email *</label>
                <input
                  type="email"
                  required
                  placeholder="admin.personnel@edumanage.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg px-3.5 py-2.5 text-xs text-[#1A1918] focus:outline-none focus:border-[#1B2A4A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1918] mb-1">Master Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg px-3.5 py-2.5 text-xs text-[#1A1918] focus:outline-none focus:border-[#1B2A4A]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#64748B] hover:text-[#1A1918] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#1B2A4A] hover:bg-[#5C1D24] text-white px-5 py-2.5 rounded-lg text-xs font-semibold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Provisioning...' : 'Provision Super Admin'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default SuperAdminUsers;
