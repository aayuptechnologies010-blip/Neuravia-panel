import React, { useState, useEffect } from 'react';
import api from '../api/client';
import toast from 'react-hot-toast';
import { MdCampaign, MdSend, MdNotificationsActive } from 'react-icons/md';

export default function Announcements() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('offer');
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customer/notifications');
      if (res.data?.success) {
        setHistory(res.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error('Title and message are required');
      return;
    }
    try {
      setSending(true);
      const res = await api.post('/customer/notifications/broadcast', {
        title: title.trim(),
        body: body.trim(),
        type
      });
      if (res.data?.success) {
        toast.success('Announcement sent to all app users!');
        setTitle('');
        setBody('');
        fetchAnnouncements();
      }
    } catch (err) {
      toast.error('Failed to send announcement');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#083058] flex items-center gap-2">
          <MdCampaign className="text-teal-600" />
          Announcements &amp; Push Broadcast
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Send instant offers, updates, or announcements to all Neuravia mobile app users via Firebase Push &amp; In-App Notifications.
        </p>
      </div>

      {/* Broadcast Form */}
      <form onSubmit={handleSend} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-800">Send New Announcement</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Announcement Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter announcement title"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Target Page</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a] bg-white"
            >
              <option value="offer">Offer / Plans Page</option>
              <option value="plan">Plans Page</option>
              <option value="therapist">Therapists Page</option>
              <option value="wallet">Wallet Page</option>
              <option value="history">Booking History</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Message Body *</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={3}
            placeholder="Enter announcement message"
            className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a]"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={sending}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#083058] text-white rounded-xl text-sm font-bold hover:bg-[#0c4a6e] disabled:opacity-50"
          >
            <MdSend size={16} />
            {sending ? 'Sending...' : 'Send Broadcast'}
          </button>
        </div>
      </form>

      {/* Sent Notifications History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-slate-800 text-sm flex items-center gap-2">
          <MdNotificationsActive className="text-teal-600" />
          Recent Notifications Sent ({history.length})
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
        ) : history.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No announcements sent yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {history.map((item) => (
              <div key={item._id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50">
                <div>
                  <div className="font-semibold text-slate-800 text-sm">{item.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{item.body}</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>
                <span className="px-2.5 py-0.5 text-[11px] font-bold bg-teal-50 text-teal-700 rounded-full uppercase">
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
