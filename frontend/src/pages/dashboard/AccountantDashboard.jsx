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
    <div className="space-y-8 font-['Inter'] text-slate-800">
      
      {/* Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-['Outfit'] font-bold text-slate-900">
              Financial Control Board 👋
            </h1>
            <span className="px-3 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-xs font-semibold tracking-wide">
              Accountant Workspace
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm">
            Log invoice collections, provision digital transaction receipts, and audit overdue student balances.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/dashboard/fees/collection"
            className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm shadow-indigo-600/25 flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" /> Collect Student Fee
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400 font-semibold">
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
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-200 hover:shadow-md transition-all flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">{m.title}</span>
                    <strong className="text-2xl font-['Outfit'] font-bold text-slate-900 block mt-1">{m.value}</strong>
                    <span className="text-[11px] text-slate-500 block">{m.desc}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
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
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-base font-['Outfit'] font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4.5 h-4.5 text-indigo-600" /> Recent Receipts Issued
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-semibold">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-200">
                        <th className="pb-3 font-semibold uppercase tracking-wider text-[11px]">Receipt No.</th>
                        <th className="pb-3 font-semibold uppercase tracking-wider text-[11px]">Student Name</th>
                        <th className="pb-3 font-semibold uppercase tracking-wider text-[11px]">Structure Category</th>
                        <th className="pb-3 font-semibold uppercase tracking-wider text-[11px]">Amount Paid</th>
                        <th className="pb-3 font-semibold uppercase tracking-wider text-[11px]">Payment Mode</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {payments.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-xs text-slate-400 font-medium">
                            No receipts issued yet.
                          </td>
                        </tr>
                      ) : (
                        payments.slice(0, 5).map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3.5 font-bold font-mono text-emerald-600">{row.receipt_number}</td>
                            <td className="py-3.5 text-slate-900 font-bold">
                              {row.student?.user?.first_name} {row.student?.user?.last_name}
                            </td>
                            <td className="py-3.5">{row.fee_structure_name || row.fee_structure?.name}</td>
                            <td className="py-3.5 font-mono font-bold text-slate-900">
                              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(row.amount_paid)}
                            </td>
                            <td className="py-3.5">
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[10px]">
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
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-base font-['Outfit'] font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" /> Fast Action Portal
                </h3>

                <div className="grid grid-cols-1 gap-2.5">
                  <Link 
                    to="/dashboard/fees/collection"
                    className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Receipt className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-900">Collect Student Fee</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </Link>

                  <Link 
                    to="/dashboard/fees/structures"
                    className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-900">Fee Structure Editor</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </Link>

                  <Link 
                    to="/dashboard/fees/dues"
                    className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <ArrowDownCircle className="w-4 h-4 text-rose-600" />
                      <span className="text-xs font-bold text-slate-900">Due Outstanding Audits</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </Link>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-base font-['Outfit'] font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" /> Academic Billing Session
                </h3>
                
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    <span>Active Session</span>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 text-[9px] font-semibold">Current</span>
                  </div>
                  <p className="text-slate-900 font-bold text-sm font-['Outfit']">
                    {currentSession ? currentSession.name : 'No Active Session'}
                  </p>
                  <div className="text-[10px] text-slate-500 leading-relaxed">
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
