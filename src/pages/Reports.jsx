import React, { useState, useEffect } from 'react';
import api from '../api/client';
import toast from 'react-hot-toast';
import { MdBarChart, MdCurrencyRupee, MdEventAvailable, MdPeople, MdPhoneInTalk, MdRefresh } from 'react-icons/md';

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customer/admin/reports');
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load live reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading live reports from database...</div>;
  }

  const summary = data?.summary || {};
  const breakdown = data?.therapistBreakdown || [];
  const transactions = data?.recentTransactions || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#083058] flex items-center gap-2">
            <MdBarChart className="text-teal-600" />
            Reports &amp; Live Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
             
          </p>
        </div>
        <button
          onClick={fetchReports}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <MdRefresh size={18} /> Refresh
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Total Revenue</span>
            <MdCurrencyRupee size={20} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-[#083058] mt-2">
            ₹{(summary.totalRevenue || 0).toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Total Bookings</span>
            <MdEventAvailable size={20} className="text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-[#083058] mt-2">
            {summary.totalBookings || 0}{' '}
            <span className="text-xs font-medium text-slate-400">({summary.completedBookings || 0} Completed)</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Customers &amp; Therapists</span>
            <MdPeople size={20} className="text-sky-600" />
          </div>
          <div className="text-2xl font-extrabold text-[#083058] mt-2">
            {summary.totalCustomers || 0}{' '}
            <span className="text-xs font-medium text-slate-400">/ {summary.activeTherapists || 0} Therapists</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Total Call Duration</span>
            <MdPhoneInTalk size={20} className="text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-[#083058] mt-2">
            {summary.totalCallMinutes || 0} mins{' '}
            <span className="text-xs font-medium text-slate-400">({summary.totalCalls || 0} Calls)</span>
          </div>
        </div>
      </div>

      {/* Interactive Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Therapist-wise Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-[#083058] uppercase tracking-wider mb-4">
            Revenue by Therapist (Bar Graph)
          </h2>
          {breakdown.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-xs">No revenue data yet.</div>
          ) : (
            <div className="space-y-3">
              {(() => {
                const maxRev = Math.max(...breakdown.map((b) => b.revenue || 0), 1);
                return breakdown.slice(0, 6).map((item, i) => {
                  const pct = Math.round(((item.revenue || 0) / maxRev) * 100);
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700 truncate">{item.name}</span>
                        <span className="text-[#083058]">₹{(item.revenue || 0).toLocaleString()} ({item.bookings} sessions)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#083058] to-[#00839a] rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>

        {/* Donut / Completion Breakdown Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h2 className="text-sm font-bold text-[#083058] uppercase tracking-wider mb-4">
            Session Completion &amp; Activity Graph
          </h2>
          <div className="flex items-center justify-around py-4">
            {(() => {
              const total = summary.totalBookings || 0;
              const completed = summary.completedBookings || 0;
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
              const circumference = 2 * Math.PI * 45;
              const offset = circumference - (pct / 100) * circumference;
              return (
                <>
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-32 h-32 -rotate-90" viewBox="0 0 110 110">
                      <circle cx="55" cy="55" r="45" stroke="#e2e8f0" strokeWidth="12" fill="none" />
                      <circle
                        cx="55"
                        cy="55"
                        r="45"
                        stroke="#00839a"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <div className="text-xl font-extrabold text-[#083058]">{pct}%</div>
                      <div className="text-[10px] text-slate-400 font-semibold">Completed</div>
                    </div>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#00839a]" />
                      <span className="text-slate-600">Completed: <strong>{completed}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-slate-200" />
                      <span className="text-slate-600">Active / Pending: <strong>{Math.max(0, total - completed)}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#083058]" />
                      <span className="text-slate-600">Total Calls: <strong>{summary.totalCalls || 0}</strong></span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Therapist-wise Revenue Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-slate-800 text-sm">
          Therapist-wise Revenue &amp; Bookings
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Therapist Name</th>
                <th className="py-3 px-4">Total Bookings</th>
                <th className="py-3 px-4">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {breakdown.length === 0 ? (
                <tr><td colSpan={3} className="py-6 text-center text-slate-400">No bookings yet.</td></tr>
              ) : (
                breakdown.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-800">{row.name}</td>
                    <td className="py-3 px-4">{row.bookings}</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">₹{row.revenue.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-slate-800 text-sm">
          Recent Wallet &amp; Booking Transactions ({transactions.length})
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr><td colSpan={4} className="py-6 text-center text-slate-400">No transactions yet.</td></tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-xs text-slate-500">{new Date(tx.createdAt).toLocaleString()}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{tx.title}</td>
                    <td className="py-3 px-4 uppercase text-xs font-bold">{tx.type}</td>
                    <td className={`py-3 px-4 font-bold ${tx.type === 'credit' ? 'text-emerald-600' : 'text-[#083058]'}`}>
                      ₹{tx.amount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
