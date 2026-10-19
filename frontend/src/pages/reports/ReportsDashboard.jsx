import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import Badge from '../../components/ui/Badge';
import { 
  BarChart3, 
  Users, 
  UserCheck, 
  DollarSign, 
  CalendarCheck, 
  TrendingUp, 
  Award,
  RefreshCw 
} from 'lucide-react';

const ReportsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await reportService.getOverviewReport();
      setData(res);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 gap-2 font-semibold text-xs uppercase tracking-wider font-['Inter']">
        <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
        <span>Aggregating analytics data...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white p-12 text-center text-slate-400 rounded-xl border border-slate-200 shadow-xs font-medium italic font-['Inter']">
        Failed to load report analytics. Please try again.
      </div>
    );
  }

  // Calculate coordinates for SVG Area Chart (Fee Collection Trend)
  const feePoints = data.fee_analytics?.monthly_collections || [];
  const maxFee = Math.max(...feePoints.map((p) => p.amount), 1000);
  const chartWidth = 500;
  const chartHeight = 200;
  const paddingX = 40;
  const paddingY = 20;

  const pointsCoordinates = feePoints.map((p, idx) => {
    const x = paddingX + (idx * (chartWidth - 2 * paddingX)) / (feePoints.length - 1);
    const ratio = p.amount / maxFee;
    const y = chartHeight - paddingY - ratio * (chartHeight - 2 * paddingY);
    return { x, y, val: p.amount, label: p.month };
  });

  const linePath = pointsCoordinates.length > 0 
    ? `M ${pointsCoordinates.map(pt => `${pt.x} ${pt.y}`).join(' L ')}` 
    : '';

  const areaPath = pointsCoordinates.length > 0
    ? `${linePath} L ${pointsCoordinates[pointsCoordinates.length - 1].x} ${chartHeight - paddingY} L ${pointsCoordinates[0].x} ${chartHeight - paddingY} Z`
    : '';

  // Calculate coordinates for SVG Bar Chart (Admissions Growth)
  const admPoints = data.admissions_analytics?.monthly_admissions || [];
  const maxAdm = Math.max(...admPoints.map((p) => p.count), 5);
  const barChartWidth = 500;
  const barChartHeight = 200;
  const barWidth = 32;

  return (
    <div className="space-y-8 font-['Inter'] text-slate-900">
      
      {/* Category Pill Indicator */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-50 border border-indigo-200/60 text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
        <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
        <span>Institutional Intelligence Suite</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-['Outfit'] text-slate-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Review school operations health, registration rates, collections, and average student attendance.</p>
        </div>
        <button 
          onClick={fetchReport} 
          disabled={loading} 
          className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 text-indigo-600 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh Analysis'}
        </button>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Active Students',
            value: data.overview?.total_students,
            desc: 'Enrolled in roster',
            icon: Users,
            colorClass: 'text-indigo-600 bg-indigo-50 border-indigo-200/60'
          },
          {
            title: 'Active Instructors',
            value: data.overview?.total_teachers,
            desc: 'Registered faculty',
            icon: UserCheck,
            colorClass: 'text-violet-600 bg-violet-50 border-violet-200/60'
          },
          {
            title: 'Revenue Generated',
            value: `₹${(data.overview?.total_revenue || 0).toLocaleString('en-IN')}`,
            desc: 'All collected payments',
            icon: DollarSign,
            colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-200/60'
          },
          {
            title: 'Attendance Rate',
            value: `${data.overview?.overall_attendance_rate}%`,
            desc: 'Overall student presence',
            icon: CalendarCheck,
            colorClass: 'text-amber-600 bg-amber-50 border-amber-200/60'
          }
        ].map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-['Outfit']">{m.title}</span>
                <strong className="text-2xl font-['Outfit'] font-bold text-slate-900">{m.value}</strong>
                <span className="text-[11px] text-slate-500 block font-medium">{m.desc}</span>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${m.colorClass}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual SVG Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Fee Collection Area Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold font-['Outfit'] text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-indigo-600" /> Monthly Revenue Trend
            </h3>
            <Badge variant="success">Past 6 Months</Badge>
          </div>

          <div className="relative pt-4">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto">
              <defs>
                <linearGradient id="feeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => {
                const y = paddingY + r * (chartHeight - 2 * paddingY);
                return (
                  <line 
                    key={idx}
                    x1={paddingX} 
                    y1={y} 
                    x2={chartWidth - paddingX} 
                    y2={y} 
                    stroke="#e2e8f0" 
                    strokeDasharray="4 4"
                    strokeWidth="0.5"
                  />
                );
              })}

              {/* Area & Line */}
              {areaPath && <path d={areaPath} fill="url(#feeGrad)" />}
              {linePath && <path d={linePath} fill="none" stroke="#4f46e5" strokeWidth="2.5" />}

              {/* Interaction circles */}
              {pointsCoordinates.map((pt, idx) => (
                <g key={idx}>
                  <circle cx={pt.x} cy={pt.y} r="4.5" fill="#ffffff" stroke="#4f46e5" strokeWidth="2" />
                  <text 
                    x={pt.x} 
                    y={chartHeight - 2} 
                    textAnchor="middle" 
                    fill="#64748b" 
                    fontSize="9" 
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {pt.label}
                  </text>
                  <text 
                    x={pt.x} 
                    y={pt.y - 8} 
                    textAnchor="middle" 
                    fill="#4f46e5" 
                    fontSize="8" 
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    ₹{pt.val.toLocaleString('en-IN')}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Admissions Growth Bar Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold font-['Outfit'] text-slate-900 flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-indigo-600" /> Admissions Registration Growth
            </h3>
            <Badge variant="info">Monthly Count</Badge>
          </div>

          <div className="relative pt-4">
            <svg viewBox={`0 0 ${barChartWidth} ${barChartHeight}`} className="w-full h-auto">
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => {
                const y = paddingY + r * (barChartHeight - 2 * paddingY);
                return (
                  <line 
                    key={idx}
                    x1={paddingX} 
                    y1={y} 
                    x2={barChartWidth - paddingX} 
                    y2={y} 
                    stroke="#e2e8f0" 
                    strokeDasharray="4 4"
                    strokeWidth="0.5"
                  />
                );
              })}

              {/* Vertical Bars */}
              {admPoints.map((pt, idx) => {
                const x = paddingX + (idx * (barChartWidth - 2 * paddingX)) / (admPoints.length - 1) - barWidth / 2;
                const ratio = pt.count / maxAdm;
                const barHeight = ratio * (barChartHeight - 2 * paddingY);
                const y = barChartHeight - paddingY - barHeight;

                return (
                  <g key={idx}>
                    <rect 
                      x={x} 
                      y={y} 
                      width={barWidth} 
                      height={barHeight} 
                      rx="4"
                      fill="#4f46e5" 
                      className="transition-colors hover:fill-indigo-700"
                    />
                    <text 
                      x={x + barWidth / 2} 
                      y={barChartHeight - 2} 
                      textAnchor="middle" 
                      fill="#64748b" 
                      fontSize="9" 
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {pt.month}
                    </text>
                    <text 
                      x={x + barWidth / 2} 
                      y={y - 6} 
                      textAnchor="middle" 
                      fill="#4f46e5" 
                      fontSize="9" 
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {pt.count}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

      </div>

      {/* Grid of Averages and Progress Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Attendance by Section */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold font-['Outfit'] text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <CalendarCheck className="w-4 h-4 text-amber-600" /> Attendance Breakdown by Section
          </h3>

          <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
            {data.attendance_analytics?.section_attendance?.map((sec, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-900">
                  <span>{sec.section_name}</span>
                  <span className="text-amber-600 font-bold">{sec.rate}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${sec.rate}%` }}
                  />
                </div>
              </div>
            ))}

            {(!data.attendance_analytics?.section_attendance || data.attendance_analytics.section_attendance.length === 0) && (
              <div className="text-xs text-slate-400 italic text-center py-6 font-medium">
                No attendance rates logged yet.
              </div>
            )}
          </div>
        </div>

        {/* Academic averages by Subject */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold font-['Outfit'] text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Award className="w-4 h-4 text-indigo-600" /> Academic Subject Performance Averages
          </h3>

          <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
            {data.academic_analytics?.average_scores_by_subject?.map((sub, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-900">
                  <span>{sub.subject_name}</span>
                  <span className="text-indigo-600 font-bold">{sub.average}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${sub.average}%` }}
                  />
                </div>
              </div>
            ))}

            {(!data.academic_analytics?.average_scores_by_subject || data.academic_analytics.average_scores_by_subject.length === 0) && (
              <div className="text-xs text-slate-400 italic text-center py-6 font-medium">
                No examination marks logged yet.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default ReportsDashboard;
