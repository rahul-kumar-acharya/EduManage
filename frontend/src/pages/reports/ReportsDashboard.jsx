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
      <div className="flex items-center justify-center min-h-[400px] text-[#64748B] gap-2 font-semibold text-xs uppercase tracking-wider">
        <RefreshCw className="w-5 h-5 animate-spin text-[#1B2A4A]" />
        <span>Aggregating analytics data...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white p-12 text-center text-[#64748B] rounded-xl border border-[#E5E0D8] shadow-sm font-medium italic">
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
    <div className="space-y-8 font-['Plus_Jakarta_Sans'] text-[#1A1918]">
      
      {/* Category Pill Indicator */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5C1D24]/10 border border-[#5C1D24]/20 text-[10px] font-bold text-[#5C1D24] uppercase tracking-wider">
        <BarChart3 className="w-3.5 h-3.5 text-[#5C1D24]" />
        <span>Institutional Intelligence Suite</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
        <div>
          <h1 className="text-3xl font-['Newsreader'] font-bold text-[#1A1918]">Reports & Analytics</h1>
          <p className="text-xs text-[#64748B] mt-1">Review school operations health, registration rates, collections, and average student attendance.</p>
        </div>
        <button 
          onClick={fetchReport} 
          disabled={loading} 
          className="bg-white hover:bg-[#F7F5F0] text-[#1A1918] border border-[#E5E0D8] px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 text-[#1B2A4A] ${loading ? 'animate-spin' : ''}`} />
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
            colorClass: 'text-[#1B2A4A] bg-[#1B2A4A]/10 border-[#1B2A4A]/20'
          },
          {
            title: 'Active Instructors',
            value: data.overview?.total_teachers,
            desc: 'Registered faculty',
            icon: UserCheck,
            colorClass: 'text-[#5C1D24] bg-[#5C1D24]/10 border-[#5C1D24]/20'
          },
          {
            title: 'Revenue Generated',
            value: `₹${(data.overview?.total_revenue || 0).toLocaleString('en-IN')}`,
            desc: 'All collected payments',
            icon: DollarSign,
            colorClass: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20'
          },
          {
            title: 'Attendance Rate',
            value: `${data.overview?.overall_attendance_rate}%`,
            desc: 'Overall student presence',
            icon: CalendarCheck,
            colorClass: 'text-amber-600 bg-amber-500/10 border-amber-500/20'
          }
        ].map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-xl border border-[#E5E0D8] shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">{m.title}</span>
                <strong className="text-2xl font-['Newsreader'] font-bold text-[#1A1918]">{m.value}</strong>
                <span className="text-[11px] text-[#64748B] block">{m.desc}</span>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${m.colorClass}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual SVG Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Fee Collection Area Chart */}
        <div className="bg-white p-6 rounded-xl border border-[#E5E0D8] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#F7F5F0] pb-3">
            <h3 className="text-sm font-bold text-[#1A1918] flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-emerald-600" /> Monthly Revenue Trend
            </h3>
            <Badge variant="success">Past 6 Months</Badge>
          </div>

          <div className="relative pt-4">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto">
              <defs>
                <linearGradient id="feeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
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
                    stroke="#E5E0D8" 
                    strokeDasharray="4 4"
                    strokeWidth="0.5"
                  />
                );
              })}

              {/* Area & Line */}
              {areaPath && <path d={areaPath} fill="url(#feeGrad)" />}
              {linePath && <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2.5" />}

              {/* Interaction circles */}
              {pointsCoordinates.map((pt, idx) => (
                <g key={idx}>
                  <circle cx={pt.x} cy={pt.y} r="4.5" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
                  <text 
                    x={pt.x} 
                    y={chartHeight - 2} 
                    textAnchor="middle" 
                    fill="#64748B" 
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
                    fill="#10b981" 
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
        <div className="bg-white p-6 rounded-xl border border-[#E5E0D8] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#F7F5F0] pb-3">
            <h3 className="text-sm font-bold text-[#1A1918] flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-[#1B2A4A]" /> Admissions Registration Growth
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
                    stroke="#E5E0D8" 
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
                      rx="3"
                      fill="#1B2A4A" 
                      className="transition-colors hover:fill-[#5C1D24]"
                    />
                    <text 
                      x={x + barWidth / 2} 
                      y={barChartHeight - 2} 
                      textAnchor="middle" 
                      fill="#64748B" 
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
                      fill="#1B2A4A" 
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
        <div className="bg-white p-6 rounded-xl border border-[#E5E0D8] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#1A1918] flex items-center gap-2 border-b border-[#F7F5F0] pb-3">
            <CalendarCheck className="w-4 h-4 text-amber-600" /> Attendance Breakdown by Section
          </h3>

          <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
            {data.attendance_analytics?.section_attendance?.map((sec, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-[#1A1918]">
                  <span>{sec.section_name}</span>
                  <span className="text-amber-600">{sec.rate}%</span>
                </div>
                <div className="w-full bg-[#F7F5F0] h-2.5 rounded-full overflow-hidden border border-[#E5E0D8]">
                  <div 
                    className="bg-amber-600 h-full rounded-full" 
                    style={{ width: `${sec.rate}%` }}
                  />
                </div>
              </div>
            ))}

            {(!data.attendance_analytics?.section_attendance || data.attendance_analytics.section_attendance.length === 0) && (
              <div className="text-xs text-[#64748B] italic text-center py-6">
                No attendance rates logged yet.
              </div>
            )}
          </div>
        </div>

        {/* Academic averages by Subject */}
        <div className="bg-white p-6 rounded-xl border border-[#E5E0D8] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#1A1918] flex items-center gap-2 border-b border-[#F7F5F0] pb-3">
            <Award className="w-4 h-4 text-purple-600" /> Academic Subject Performance Averages
          </h3>

          <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
            {data.academic_analytics?.average_scores_by_subject?.map((sub, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-[#1A1918]">
                  <span>{sub.subject_name}</span>
                  <span className="text-purple-600">{sub.average}%</span>
                </div>
                <div className="w-full bg-[#F7F5F0] h-2.5 rounded-full overflow-hidden border border-[#E5E0D8]">
                  <div 
                    className="bg-purple-600 h-full rounded-full" 
                    style={{ width: `${sub.average}%` }}
                  />
                </div>
              </div>
            ))}

            {(!data.academic_analytics?.average_scores_by_subject || data.academic_analytics.average_scores_by_subject.length === 0) && (
              <div className="text-xs text-[#64748B] italic text-center py-6">
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
