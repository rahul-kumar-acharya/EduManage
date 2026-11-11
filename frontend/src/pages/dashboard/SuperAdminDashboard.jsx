import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { getTenantUrl } from '../../utils/subdomain';
import Table from '../../components/ui/Table';
import { 
  Building2, 
  Plus, 
  ExternalLink, 
  RefreshCw,
  Users,
  CreditCard,
  DollarSign,
  Power,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [notification, setNotification] = useState(null);

  // Modal State for Onboarding New School
  const [showModal, setShowModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [modalError, setModalError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    email: '',
    admin_name: '',
    admin_email: '',
    admin_phone: '',
    admin_password: ''
  });

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const res = await api.get('/schools/all/');
      setSchools(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to fetch all schools:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleToggleStatus = async (school) => {
    setActionLoadingId(school.id);
    try {
      const res = await api.patch(`/schools/${school.id}/toggle-status/`);
      setNotification({
        type: 'success',
        message: res.data.message || `School '${school.name}' status updated.`
      });
      fetchSchools();
    } catch (err) {
      console.error("Failed to toggle school status:", err);
      setNotification({
        type: 'error',
        message: err.response?.data?.error || "Failed to update tenant status."
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setIsRegistering(true);

    try {
      await api.post('/schools/register/', formData);
      setNotification({
        type: 'success',
        message: `School '${formData.name}' onboarded successfully! Welcome credentials emailed to ${formData.admin_email}.`
      });
      setShowModal(false);
      setFormData({
        name: '',
        subdomain: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        email: '',
        admin_name: '',
        admin_email: '',
        admin_phone: '',
        admin_password: ''
      });
      fetchSchools();
    } catch (err) {
      console.error("Onboarding failed:", err);
      const resData = err.response?.data;
      if (resData) {
        if (typeof resData === 'string') {
          setModalError(resData);
        } else if (resData.error) {
          setModalError(resData.error);
        } else {
          const firstKey = Object.keys(resData)[0];
          const val = resData[firstKey];
          setModalError(`${firstKey}: ${Array.isArray(val) ? val.join(' ') : val}`);
        }
      } else {
        setModalError("Failed to onboard school. Please check all fields.");
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const columns = [
    {
      header: 'School Name & Contact',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-semibold text-xs shrink-0 shadow-xs shadow-indigo-600/20">
            {row.name.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-slate-900">{row.name}</div>
            <div className="text-[11px] text-slate-500">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Location',
      accessor: 'city',
      render: (row) => (
        <div className="text-xs text-slate-600 font-medium">
          {row.city && row.state ? `${row.city}, ${row.state}` : 'Not Specified'}
        </div>
      )
    },
    {
      header: 'Subdomain URL',
      accessor: 'subdomain',
      render: (row) => (
        <a
          href={getTenantUrl(row.subdomain)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-mono text-xs text-indigo-600 hover:text-indigo-700 hover:underline font-semibold"
        >
          {row.subdomain}.campus.acharyarahul.in <ExternalLink className="w-3 h-3 text-indigo-500" />
        </a>
      )
    },
    {
      header: 'Status',
      accessor: 'is_active',
      render: (row) => (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          row.is_active 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
            : 'bg-rose-50 text-rose-700 border border-rose-200'
        }`}>
          {row.is_active ? 'Active' : 'Suspended'}
        </span>
      )
    },
    {
      header: 'Actions / Access Control',
      accessor: 'actions',
      render: (row) => (
        <button
          onClick={() => handleToggleStatus(row)}
          disabled={actionLoadingId === row.id}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
            row.is_active
              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          {actionLoadingId === row.id
            ? 'Updating...'
            : row.is_active
            ? 'Suspend Tenant'
            : 'Reactivate Tenant'}
        </button>
      )
    }
  ];

  return (
    <div className="space-y-8 font-['Inter'] text-slate-900">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
          notification.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-current opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SuperAdmin Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
              SuperAdmin Control Board
            </h1>
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-xs font-semibold uppercase tracking-wider">
              Global SaaS Manager
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm">
            Oversee tenant subdomains, provision new school clients, and control tenant active status.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setShowModal(true)}
            className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-xs shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Onboard New School
          </button>
          <button 
            onClick={fetchSchools} 
            disabled={loading}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-indigo-600 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Subdomains', value: `${schools.length} Schools`, desc: 'Registered tenants', icon: Building2 },
          { title: 'Active Tenants', value: `${schools.filter(s => s.is_active).length}`, desc: 'Active sandboxes', icon: Users },
          { title: 'Monthly Projected MRR', value: `₹${(schools.length * 4000).toLocaleString('en-IN')}`, desc: 'Projected cashflow', icon: DollarSign },
          { title: 'System SLA Uptime', value: '99.99%', desc: 'Platform response rate', icon: CreditCard },
        ].map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] uppercase font-semibold tracking-wider text-slate-500 block">{m.title}</span>
                <strong className="text-2xl font-semibold font-mono text-slate-900 block mt-1">{m.value}</strong>
                <span className="text-xs text-slate-500 block">{m.desc}</span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Tenant table lists */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-slate-900">Registered Institutional Tenants ({schools.length})</h2>
        <Table 
          columns={columns} 
          data={schools} 
          isLoading={loading}
          pageSize={25}
          emptyMessage="No subdomains registered in database." 
        />
      </div>

      {/* Onboard New School Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs shadow-indigo-600/20">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Onboard New School Client</h3>
                  <p className="text-xs text-slate-500">Provisions a new tenant subdomain and dispatches admin credentials.</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {modalError}
              </div>
            )}

            <form onSubmit={handleOnboardSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">School Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex International School"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subdomain Alias *</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      required
                      placeholder="apexschool"
                      value={formData.subdomain}
                      onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-l-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                    />
                    <span className="bg-slate-100 text-slate-500 text-[11px] font-mono px-3 py-2.5 rounded-r-xl border border-l-0 border-slate-200">.campus</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">School Official Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="info@apexschool.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City & State</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">School Admin Credentials (Emailed Automatically)</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Principal Rajesh Sharma"
                      value={formData.admin_name}
                      onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Personal Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="admin@apexschool.com"
                      value={formData.admin_email}
                      onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Phone</label>
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={formData.admin_phone}
                      onChange={(e) => setFormData({ ...formData, admin_phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={formData.admin_password}
                      onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRegistering}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-xs shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                >
                  {isRegistering ? 'Provisioning School...' : 'Provision School & Send Credentials'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default SuperAdminDashboard;
