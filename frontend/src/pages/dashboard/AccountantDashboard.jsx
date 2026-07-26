import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSchool } from '../../contexts/SchoolContext';
import { feeService } from '../../services/feeService';
import { academicService } from '../../services/academicService';
import { 
  Receipt, 
  DollarSign, 
  ArrowUpRight, 
  Layers, 
  Calendar,
  ArrowDownCircle,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AccountantDashboard = () => {
  const { user } = useAuth();
  const { school } = useSchool();
  const [payments, setPayments] = useState([]);
  const [dues, setDues] = useState([]);
  const [structures, setStructures] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [paymentsRes, duesRes, structuresRes, sessionsRes] = await Promise.all([
          feeService.getPayments(),
          feeService.getDues(),
          feeService.getStructures(),
          academicService.getSessions()
        ]);

        setPayments(paymentsRes.results || paymentsRes);
        setDues(duesRes.results || duesRes);
        setStructures(structuresRes.results || structuresRes);
        
        const sessionsList = sessionsRes.results || sessionsRes;
        const active = sessionsList.find(s => s.is_current);
        setCurrentSession(active || null);
      } catch (err) {
        console.error("Failed to load Accountant dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const totalCollectedVal = payments.reduce((acc, curr) => acc + parseFloat(curr.amount_paid || 0), 0);
  const totalDuesVal = dues.reduce((acc, curr) => acc + parseFloat(curr.balance_due || 0), 0);
  
  const formattedTotalCollected = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(totalCollectedVal);

  const formattedTotalDues = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(totalDuesVal);

  return (
    <div className="space-y-8 font-['Plus_Jakarta_Sans'] text-[#1A1918]">
      
      {/* Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E0D8] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-['Newsreader'] font-bold text-[#1A1918]">
              Financial Control Board 👋
            </h1>
            <span className="px-3 py-1 rounded-md bg-[#5C1D24]/10 text-[#5C1D24] border border-[#5C1D24]/20 text-xs font-semibold uppercase tracking-wider">
              Accountant Workspace
            </span>
          </div>
          <p className="text-[#64748B] text-xs sm:text-sm">
            Log invoice collections, provision digital transaction receipts, and audit overdue student balances.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/dashboard/fees/collection"
            className="flex-1 sm:flex-none bg-[#1B2A4A] hover:bg-[#5C1D24] text-white px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Collect Student Fee
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-[#64748B] font-semibold">
          Recalculating real-time ledger indexes...
        </div>
      ) : (
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Total Collected', value: formattedTotalCollected, desc: 'Current billing session', icon: DollarSign },
              { title: 'Outstanding Dues', value: formattedTotalDues, desc: 'Active student deficits', icon: ArrowDownCircle },
              { title: 'Receipts Issued', value: payments.length, desc: 'Unique billing records', icon: Receipt },
              { title: 'Fee Structures', value: `${structures.length} Active`, desc: 'Configured categories', icon: Layers },
            ].map((m, idx) => {
              const Icon = m.icon;
              return (
                <div key={idx} className="bg-white p-6 rounded-xl border border-[#E5E0D8] shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B] block">{m.title}</span>
                    <strong className="text-2xl font-['Newsreader'] font-bold text-[#1A1918] block mt-1">{m.value}</strong>
                    <span className="text-[11px] text-[#64748B] block">{m.desc}</span>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-[#F7F5F0] border border-[#E5E0D8] flex items-center justify-center text-[#1B2A4A]">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Split Grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Side recent ledger table */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-[#E5E0D8] shadow-sm space-y-4">
                <h3 className="text-base font-['Newsreader'] font-bold text-[#1A1918] flex items-center gap-2">
                  <Receipt className="w-4.5 h-4.5 text-[#1B2A4A]" /> Recent Receipts Issued
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-semibold">
                    <thead>
                      <tr className="text-[#64748B] border-b border-[#E5E0D8]">
                        <th className="pb-3 font-bold uppercase tracking-wider">Receipt No.</th>
                        <th className="pb-3 font-bold uppercase tracking-wider">Student Name</th>
                        <th className="pb-3 font-bold uppercase tracking-wider">Structure Category</th>
                        <th className="pb-3 font-bold uppercase tracking-wider">Amount Paid</th>
                        <th className="pb-3 font-bold uppercase tracking-wider">Payment Mode</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F7F5F0] text-[#64748B]">
                      {payments.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-xs text-[#64748B] font-semibold">
                            No receipts issued yet.
                          </td>
                        </tr>
                      ) : (
                        payments.slice(0, 5).map((row, i) => (
                          <tr key={i} className="hover:bg-[#F7F5F0]/50">
                            <td className="py-3.5 font-bold font-mono text-emerald-600">{row.receipt_number}</td>
                            <td className="py-3.5 text-[#1A1918] font-bold">
                              {row.student?.user?.first_name} {row.student?.user?.last_name}
                            </td>
                            <td className="py-3.5">{row.fee_structure_name || row.fee_structure?.name}</td>
                            <td className="py-3.5 font-mono font-bold text-[#1A1918]">
                              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(row.amount_paid)}
                            </td>
                            <td className="py-3.5">
                              <span className="px-2 py-0.5 rounded bg-[#F7F5F0] border border-[#E5E0D8] text-[#64748B] font-mono text-[9px]">
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Side Quick Operations */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-[#E5E0D8] shadow-sm space-y-4">
                <h3 className="text-base font-['Newsreader'] font-bold text-[#1A1918] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#5C1D24]" /> Fast Action Portal
                </h3>

                <div className="grid grid-cols-1 gap-3">
                  <Link 
                    to="/dashboard/fees/collection"
                    className="p-3 bg-[#F7F5F0] hover:bg-[#E5E0D8]/40 border border-[#E5E0D8] rounded-xl flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Receipt className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-[#1A1918]">Collect Student Fee</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#64748B] group-hover:text-[#1B2A4A] transition-colors" />
                  </Link>

                  <Link 
                    to="/dashboard/fees/structures"
                    className="p-3 bg-[#F7F5F0] hover:bg-[#E5E0D8]/40 border border-[#E5E0D8] rounded-xl flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Layers className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-bold text-[#1A1918]">Fee Structure Editor</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#64748B] group-hover:text-[#1B2A4A] transition-colors" />
                  </Link>

                  <Link 
                    to="/dashboard/fees/dues"
                    className="p-3 bg-[#F7F5F0] hover:bg-[#E5E0D8]/40 border border-[#E5E0D8] rounded-xl flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <ArrowDownCircle className="w-4 h-4 text-rose-600" />
                      <span className="text-xs font-bold text-[#1A1918]">Due Outstanding Audits</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#64748B] group-hover:text-[#1B2A4A] transition-colors" />
                  </Link>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-[#E5E0D8] shadow-sm space-y-4">
                <h3 className="text-base font-['Newsreader'] font-bold text-[#1A1918] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#1B2A4A]" /> Academic Billing Session
                </h3>
                
                <div className="p-3.5 bg-[#F7F5F0] border border-[#E5E0D8] rounded-xl text-xs space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-[#64748B] uppercase font-bold tracking-wider">
                    <span>Active Session</span>
                    <span className="px-2 py-0.5 bg-[#1B2A4A]/10 text-[#1B2A4A] rounded text-[9px] font-bold">Current</span>
                  </div>
                  <p className="text-[#1A1918] font-bold text-sm">
                    {currentSession ? currentSession.name : 'No Active Session'}
                  </p>
                  <div className="text-[10px] text-[#64748B] leading-relaxed">
                    {currentSession ? (
                      `Term period spans from ${new Date(currentSession.start_date).toLocaleDateString()} to ${new Date(currentSession.end_date).toLocaleDateString()}.`
                    ) : (
                      'Please configure an active session in the admin panel.'
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default AccountantDashboard;
