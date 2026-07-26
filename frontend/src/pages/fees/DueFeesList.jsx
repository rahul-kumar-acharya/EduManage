import React, { useState, useEffect } from 'react';
import { feeService } from '../../services/feeService';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { AlertCircle, CheckCircle2, RefreshCw, Send } from 'lucide-react';

const DueFeesList = () => {
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDues = async () => {
    setLoading(true);
    try {
      const data = await feeService.getDues();
      setDues(data);
    } catch (err) {
      console.error("Failed to fetch due balances:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDues();
  }, []);

  const columns = [
    {
      header: 'Student Name',
      accessor: 'student',
      render: (row) => (
        <div>
          <div className="font-bold text-[#1A1918]">{row.student?.user?.first_name} {row.student?.user?.last_name}</div>
          <div className="text-xs text-[#64748B]">{row.student?.user?.email}</div>
        </div>
      )
    },
    {
      header: 'Admission No.',
      accessor: 'admission_number',
      render: (row) => <span className="font-mono text-xs text-[#1B2A4A] font-bold">{row.student?.admission_number}</span>
    },
    {
      header: 'Assessed Total',
      accessor: 'total_assessed',
      render: (row) => <span className="font-mono text-xs text-[#1A1918] font-bold">₹{parseFloat(row.total_assessed || 0).toLocaleString('en-IN')}</span>
    },
    {
      header: 'Amount Paid',
      accessor: 'total_paid',
      render: (row) => <span className="font-mono text-xs text-emerald-600 font-bold">₹{parseFloat(row.total_paid || 0).toLocaleString('en-IN')}</span>
    },
    {
      header: 'Balance Due',
      accessor: 'balance_due',
      render: (row) => (
        <span className={`font-mono text-xs font-bold ${row.balance_due > 0 ? 'text-[#5C1D24]' : 'text-[#64748B]'}`}>
          ₹{parseFloat(row.balance_due || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <Badge variant={row.balance_due > 0 ? 'danger' : 'success'}>
          {row.balance_due > 0 ? 'OVERDUE' : 'CLEAR'}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        row.balance_due > 0 ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert(`Fee payment reminder notification sent to guardian of ${row.student?.user?.first_name}!`)}
            className="gap-1.5 py-1 text-xs font-bold"
          >
            <Send className="w-3 h-3" /> Send Reminder
          </Button>
        ) : (
          <span className="text-xs text-[#64748B] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Paid
          </span>
        )
      )
    }
  ];

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans'] text-[#1A1918]">
      
      {/* Category Pill Indicator */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5C1D24]/10 border border-[#5C1D24]/20 text-[10px] font-bold text-[#5C1D24] uppercase tracking-wider">
        <AlertCircle className="w-3.5 h-3.5 text-[#5C1D24]" />
        <span>Outstanding Deficit Ledger</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
        <div>
          <h1 className="text-3xl font-['Newsreader'] font-bold text-[#1A1918]">Student Due Balances Audit</h1>
          <p className="text-xs text-[#64748B] mt-1">Audit outstanding fee balances, pending dues, and issue payment reminders.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchDues} loading={loading} className="gap-2 shadow-sm">
          <RefreshCw className="w-4 h-4 text-[#1B2A4A]" /> Refresh Audit
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E0D8] shadow-sm">
        <Table columns={columns} data={dues} emptyMessage="No outstanding fee dues found." />
      </div>
    </div>
  );
};

export default DueFeesList;
