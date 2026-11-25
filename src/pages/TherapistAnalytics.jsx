import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { MdArrowBack, MdEventAvailable, MdTimer, MdPeople, MdCurrencyRupee, MdPhoneInTalk } from 'react-icons/md';

export default function TherapistAnalytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get(`/customer/therapist-analytics/${id}`);
        if (res.data?.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [id]);

  const formatDuration = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading therapist analytics...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-red-500">Therapist analytics not found.</div>;
  }

  const { therapist, stats, bookings, callLogs } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/therapists')}
          className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50"
        >
          <MdArrowBack size={20} className="text-slate-700" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#083058]">{therapist.name} — Analytics</h1>
          <p className="text-xs text-slate-500">{therapist.title} • {therapist.specialization}</p>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Sessions Completed</span>
            <MdEventAvailable size={20} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-[#083058] mt-2">
            {stats.completedSessions} <span className="text-xs font-medium text-slate-400">/ {stats.totalBookings} Total</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Total Talk Time</span>
            <MdTimer size={20} className="text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-[#083058] mt-2">
            {formatDuration(stats.totalTalkSeconds)}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Unique Customers</span>
            <MdPeople size={20} className="text-sky-600" />
          </div>
          <div className="text-2xl font-extrabold text-[#083058] mt-2">
            {stats.uniqueCustomersCount}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Revenue Generated</span>
            <MdCurrencyRupee size={20} className="text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-[#083058] mt-2">
            ₹{stats.totalRevenue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Bookings & Session Tracking Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-slate-800 text-sm">
          Booked Sessions &amp; Remaining Time ({bookings.length})
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Booking ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Booked / Remaining</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">No bookings yet.</td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">{b.bookingId}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{b.client?.fullName || 'Customer'}</td>
                    <td className="py-3 px-4 text-slate-600">{b.client?.phone || '-'}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-teal-700">{b.remainingMinutes ?? b.bookedMinutes ?? 50}</span>
                      <span className="text-slate-400"> / {b.bookedMinutes ?? 50} mins</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#083058]">₹{b.amount || 0}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        b.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Call Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-slate-800 text-sm flex items-center gap-2">
          <MdPhoneInTalk className="text-teal-600" />
          Call Logs ({callLogs.length})
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Minutes Deducted</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {callLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">No calls recorded yet.</td>
                </tr>
              ) : (
                callLogs.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-xs text-slate-600">{new Date(l.createdAt).toLocaleString()}</td>
                    <td className="py-3 px-4 font-semibold">{formatDuration(l.durationSeconds || 0)}</td>
                    <td className="py-3 px-4">{l.minutesDeducted || 0} mins</td>
                    <td className="py-3 px-4">{l.rating ? `★ ${l.rating}` : '-'}</td>
                    <td className="py-3 px-4 text-slate-600">{l.feedback || '-'}</td>
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
