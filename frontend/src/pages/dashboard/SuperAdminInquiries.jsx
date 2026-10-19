import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Table from '../../components/ui/Table';
import { Mail, MessageSquare, CheckCircle2, Clock, Search, RefreshCw } from 'lucide-react';

const SuperAdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/schools/inquiries/');
      setInquiries(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to fetch contact inquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const filteredInquiries = inquiries.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Sender Contact',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs shadow-indigo-600/20 font-['Outfit']">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900 font-['Outfit']">{row.name}</div>
            <div className="text-[11px] text-indigo-600 font-mono font-medium">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Subject & Inquiry Content',
      accessor: 'subject',
      render: (row) => (
        <div className="space-y-0.5 max-w-md">
          <div className="text-xs font-semibold text-slate-900 truncate font-['Outfit']">{row.subject}</div>
          <div className="text-[11px] text-slate-500 line-clamp-2">{row.message}</div>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'is_read',
      render: (row) => (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
          !row.is_read
            ? 'bg-amber-50 text-amber-700 border border-amber-200'
            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        }`}>
          {!row.is_read ? <Clock className="w-3 h-3 text-amber-600" /> : <CheckCircle2 className="w-3 h-3 text-emerald-600" />} {!row.is_read ? 'New Inquiry' : 'Reviewed'}
        </span>
      )
    },
    {
      header: 'Received Date',
      accessor: 'created_at',
      render: (row) => (
        <span className="text-xs text-slate-500 font-mono">{row.created_at}</span>
      )
    }
  ];

  return (
    <div className="space-y-8 font-['Inter'] text-slate-900">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-['Outfit'] font-bold text-slate-900 tracking-tight">
              Website Contact Inquiries
            </h1>
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-xs font-semibold uppercase tracking-wider">
              support.acharyacampus@gmail.com
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm">
            Real contact form messages dispatched from visitors on your website.
          </p>
        </div>

        <button 
          onClick={fetchInquiries}
          disabled={loading}
          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-indigo-600 ${loading ? 'animate-spin' : ''}`} /> Refresh Messages
        </button>
      </div>

      {/* Inquiries Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-lg font-['Outfit'] font-bold text-slate-900">Inquiries Received ({inquiries.length})</h2>
          
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search inquiry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition-colors"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <Table columns={columns} data={filteredInquiries} emptyMessage="No contact inquiries received yet. Any messages submitted through the website contact page will appear here live." />
        </div>
      </div>

    </div>
  );
};

export default SuperAdminInquiries;
