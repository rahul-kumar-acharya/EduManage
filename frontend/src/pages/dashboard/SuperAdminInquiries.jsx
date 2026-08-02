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
          <div className="w-9 h-9 rounded-xl bg-[#1B2A4A] text-white flex items-center justify-center font-bold text-xs shrink-0 border border-[#1B2A4A]">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-[#1A1918]">{row.name}</div>
            <div className="text-[10px] text-[#5C1D24] font-mono">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Subject & Inquiry Content',
      accessor: 'subject',
      render: (row) => (
        <div className="space-y-0.5 max-w-md">
          <div className="text-xs font-bold text-[#1A1918] truncate">{row.subject}</div>
          <div className="text-[11px] text-[#64748B] line-clamp-2">{row.message}</div>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'is_read',
      render: (row) => (
        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
          !row.is_read
            ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
            : 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
        }`}>
          {!row.is_read ? <Clock className="w-3 h-3 text-amber-600" /> : <CheckCircle2 className="w-3 h-3 text-emerald-600" />} {!row.is_read ? 'New Inquiry' : 'Reviewed'}
        </span>
      )
    },
    {
      header: 'Received Date',
      accessor: 'created_at',
      render: (row) => (
        <span className="text-xs text-[#64748B] font-mono">{row.created_at}</span>
      )
    }
  ];

  return (
    <div className="space-y-8 font-['Plus_Jakarta_Sans'] text-[#1A1918]">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E0D8] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-['Newsreader'] font-bold text-[#1A1918]">
              Website Contact Inquiries
            </h1>
            <span className="px-3 py-1 rounded-md bg-[#5C1D24]/10 text-[#5C1D24] border border-[#5C1D24]/20 text-xs font-semibold uppercase tracking-wider">
              support.edumanage@gmail.com
            </span>
          </div>
          <p className="text-[#64748B] text-xs sm:text-sm">
            Real contact form messages dispatched from visitors on your website.
          </p>
        </div>

        <button 
          onClick={fetchInquiries}
          disabled={loading}
          className="bg-white hover:bg-[#F7F5F0] text-[#1A1918] border border-[#E5E0D8] px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-[#1B2A4A] ${loading ? 'animate-spin' : ''}`} /> Refresh Messages
        </button>
      </div>

      {/* Inquiries Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-['Newsreader'] font-bold text-[#1A1918]">Inquiries Received ({inquiries.length})</h2>
          
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search inquiry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#E5E0D8] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#1A1918] placeholder-[#64748B] focus:outline-none focus:border-[#1B2A4A]"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E0D8] shadow-sm overflow-hidden">
          <Table columns={columns} data={filteredInquiries} emptyMessage="No contact inquiries received yet. Any messages submitted through the website contact page will appear here live." />
        </div>
      </div>

    </div>
  );
};

export default SuperAdminInquiries;
