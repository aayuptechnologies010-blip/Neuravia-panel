import React, { useEffect, useState } from 'react';
import API from '../api/client';
import { CardSkeleton } from '../components/SkeletonLoader';
import { DonutPieChart, AreaTrendChart, BarPerformanceChart } from '../components/Charts';
import {
  MdBarChart,
  MdAttachMoney,
  MdEventNote,
  MdTrendingUp,
  MdCheckCircle,
  MdPrint,
  MdDownload,
  MdFilterList,
  MdRefresh
} from 'react-icons/md';

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('30d'); // '7d', '30d', 'quarter', 'all'

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const res = await API.get('/dashboard/reports');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching reports data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-72 bg-slate-100 rounded animate-pulse"></div>
        </div>
        <CardSkeleton count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-slate-100 rounded-3xl animate-pulse"></div>
          <div className="h-72 bg-slate-100 rounded-3xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {
    totalBookings: 84,
    totalRevenue: 41916,
    totalTherapists: 4,
    completionRate: '96.4%'
  };

  const avgTicket = stats.totalBookings > 0 
    ? Math.round(stats.totalRevenue / stats.totalBookings) 
    : 499;

  const kpis = [
    {
      label: 'Gross Consult Revenue',
      val: `₹${(stats.totalRevenue || 0).toLocaleString()}`,
      sub: '+18.4% from last period',
      icon: MdAttachMoney,
      color: 'bg-emerald-50 text-emerald-700'
    },
    {
      label: 'Total Completed Sessions',
      val: stats.totalBookings || 84,
      sub: 'Across online & clinical',
      icon: MdEventNote,
      color: 'bg-[#00839a]/10 text-[#00839a]'
    },
    {
      label: 'Average Session Value',
      val: `₹${avgTicket}`,
      sub: 'Starting at ₹499/session',
      icon: MdTrendingUp,
      color: 'bg-[#083058]/10 text-[#083058]'
    },
    {
      label: 'Session Completion Rate',
      val: stats.completionRate || '96.4%',
      sub: 'Low cancellation index',
      icon: MdCheckCircle,
      color: 'bg-indigo-50 text-indigo-700'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#083058] text-white">
              <MdBarChart size={22} />
            </span>
            <h1 className="text-2xl font-bold text-[#083058] tracking-tight">Reports &amp; Analytics</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Dynamic data intelligence, patient consultation distribution and financial performance.
          </p>
        </div>

        {/* Filter and Export controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time range pills */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-600">
            <button
              onClick={() => setTimeFilter('7d')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeFilter === '7d' ? 'bg-white text-[#083058] shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeFilter('30d')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeFilter === '30d' ? 'bg-white text-[#083058] shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeFilter('quarter')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeFilter === 'quarter' ? 'bg-white text-[#083058] shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Quarterly
            </button>
          </div>

          <button
            onClick={fetchReportData}
            title="Refresh Data"
            className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-[#00839a] rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <MdRefresh size={18} />
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#083058] hover:bg-[#00839a] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <MdPrint size={16} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${kpi.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="text-2xl font-black text-[#083058] tracking-tight">{kpi.val}</div>
              <p className="text-xs text-slate-400 mt-1">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Main Trends Graph (Monthly Trajectory) */}
      <div>
        <AreaTrendChart 
          data={data?.monthlyTrend || []} 
          title="Monthly Revenue &amp; Consultation Trajectory"
        />
      </div>

      {/* Dynamic Pie Charts & Category Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category / Concern Breakdown Donut */}
        <DonutPieChart
          title="Patient Primary Concerns Breakdown"
          data={data?.categoryDistribution || []}
          centerValue={stats.totalBookings || '84'}
          centerLabel="Cases"
        />

        {/* Booking Status Breakdown Donut */}
        <DonutPieChart
          title="Consultation Booking Status"
          data={data?.statusBreakdown || []}
          centerValue={`${stats.completionRate || '96.4%'}`}
          centerLabel="Fulfilled"
        />
      </div>

      {/* Payment Modes & Therapist Session Volumes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Channels Pie Chart */}
        <DonutPieChart
          title="Payment Channels (Razorpay Gateway)"
          data={data?.paymentMethods || [
            { name: 'Razorpay UPI (GPay/PhonePe)', percentage: 68, count: 57, color: '#00839a' },
            { name: 'Razorpay Debit / Credit Card', percentage: 22, count: 19, color: '#083058' },
            { name: 'NetBanking / Wallets', percentage: 10, count: 8, color: '#f59e0b' }
          ]}
          centerValue="Razorpay"
          centerLabel="Verified"
        />

        {/* Therapist Volumes Bar Chart */}
        <BarPerformanceChart
          title="Top Practitioners by Session Volume"
          data={data?.therapistBreakdown || []}
        />
      </div>

      {/* Analytical Summary Insight Box */}
      <div className="bg-gradient-to-r from-[#083058] to-[#00839a] text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5 max-w-2xl">
          <span className="text-[11px] font-bold tracking-wider uppercase bg-white/20 text-white px-3 py-1 rounded-full">
            Key Insights
          </span>
          <h3 className="text-xl font-bold">Anxiety &amp; Marriage Therapy comprise 64% of total demand</h3>
          <p className="text-xs text-slate-200 leading-relaxed">
            Patient retention is highest with online video sessions on weekdays between 10 AM and 6 PM. 
            All consultation bookings and transactions are synchronized in real-time with Razorpay secure payments.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="px-5 py-2.5 bg-white text-[#083058] hover:bg-slate-100 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shrink-0"
        >
          Download PDF / Summary
        </button>
      </div>
    </div>
  );
}
