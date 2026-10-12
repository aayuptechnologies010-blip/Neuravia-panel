import React, { useEffect, useState } from 'react';
import API from '../api/client';
import { CardSkeleton, TableSkeleton } from '../components/SkeletonLoader';
import { DonutPieChart, AreaTrendChart } from '../components/Charts';
import { 
  MdEventNote, 
  MdPsychology, 
  MdMailOutline, 
  MdAttachMoney,
  MdArrowUpward,
  MdCheckCircle,
  MdBarChart
} from 'react-icons/md';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await API.get('/dashboard/stats');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-72 bg-slate-100 rounded animate-pulse"></div>
        </div>
        <CardSkeleton count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-slate-100 rounded-3xl animate-pulse"></div>
          <div className="h-72 bg-slate-100 rounded-3xl animate-pulse"></div>
        </div>
        <TableSkeleton rows={4} cols={4} />
      </div>
    );
  }

  const stats = data?.stats || {
    totalBookings: 0,
    totalEnquiries: 0,
    totalTherapists: 0,
    totalRevenue: 0
  };

  const statCards = [
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      sub: 'Active & past consultations',
      icon: MdEventNote,
      color: 'text-[#00839a] bg-[#00839a]/10',
      link: '/bookings'
    },
    {
      title: 'Therapists Listed',
      value: stats.totalTherapists,
      sub: 'Verified practitioners',
      icon: MdPsychology,
      color: 'text-[#083058] bg-[#083058]/10',
      link: '/therapists'
    },
    {
      title: 'Enquiries Received',
      value: stats.totalEnquiries,
      sub: 'Support & general queries',
      icon: MdMailOutline,
      color: 'text-amber-600 bg-amber-50',
      link: '/enquiries'
    },
    {
      title: 'Gross Revenue',
      value: `₹${(stats.totalRevenue || 0).toLocaleString()}`,
      sub: 'Total session payments',
      icon: MdAttachMoney,
      color: 'text-emerald-700 bg-emerald-50',
      link: '/bookings'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#083058] tracking-tight">Overview Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Real-time dynamic monitoring across bookings, therapists and customer inquiries.</p>
        </div>
        <Link
          to="/reports"
          className="flex items-center gap-1.5 px-4 py-2 bg-[#083058] hover:bg-[#00839a] text-white text-xs font-bold rounded-xl transition-all shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <MdBarChart size={18} />
          <span>Detailed Analytics &amp; Reports &rarr;</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Link
              key={i}
              to={card.link}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all block group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.title}</span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-[#083058] tracking-tight">{card.value}</div>
              <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
            </Link>
          );
        })}
      </div>

      {/* Dynamic Visual Charts: Trend Graph & Category Donut Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AreaTrendChart 
            data={data?.monthlyTrend || []} 
            title="Revenue &amp; Booking Trajectory (Dynamic)"
          />
        </div>
        <div className="lg:col-span-1">
          <DonutPieChart 
            data={data?.categoryDistribution || []} 
            title="Consultation Categories"
            centerValue={stats.totalBookings || '84'}
            centerLabel="Cases"
          />
        </div>
      </div>

      {/* Recent Bookings & Enquiries Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Recent Bookings */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-[#083058] text-base">Recent Bookings</h2>
            <Link to="/bookings" className="text-xs font-bold text-[#00839a] hover:underline">View All →</Link>
          </div>

          <div className="divide-y divide-slate-100">
            {(data?.recentBookings || []).length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">No bookings yet</p>
            ) : (
              data.recentBookings.map((b) => (
                <div key={b._id} className="py-3.5 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-sm text-[#083058]">{b.client?.fullName}</h3>
                    <p className="text-xs text-slate-500">{b.date} &bull; {b.time} &bull; {b.therapistChoice}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      ₹{b.amount}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{b.status}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Enquiries */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-[#083058] text-base">Recent Enquiries</h2>
            <Link to="/enquiries" className="text-xs font-bold text-[#00839a] hover:underline">View All →</Link>
          </div>

          <div className="divide-y divide-slate-100">
            {(data?.recentEnquiries || []).length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">No enquiries submitted yet</p>
            ) : (
              data.recentEnquiries.map((e) => (
                <div key={e._id} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-[#083058] truncate">{e.name}</h3>
                    <p className="text-xs text-slate-500 truncate">{e.subject} - {e.category}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    e.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {e.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
