import React, { useState, useEffect } from 'react';
import api from '../api/client';
import toast from 'react-hot-toast';
import { MdPeople, MdSearch, MdVisibility, MdSend, MdClose, MdAccountBalanceWallet, MdEventAvailable, MdPhoneInTalk } from 'react-icons/md';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Targeted Notification Modal
  const [notifTarget, setNotifTarget] = useState(null);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [sendingNotif, setSendingNotif] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customer/admin/customers');
      if (res.data?.success) {
        setCustomers(res.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openCustomerDetails = async (c) => {
    try {
      setDetailLoading(true);
      setSelectedCustomer({ customer: c, bookings: [], callLogs: [], transactions: [] });
      const res = await api.get(`/customer/admin/customers/${c._id}`);
      if (res.data?.success) {
        setSelectedCustomer(res.data);
      }
    } catch (err) {
      toast.error('Failed to load customer details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSendNotif = async (e) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifBody.trim()) return;
    try {
      setSendingNotif(true);
      const res = await api.post('/customer/notifications/send-to-customer', {
        customerId: notifTarget._id,
        title: notifTitle.trim(),
        body: notifBody.trim(),
        type: 'offer'
      });
      if (res.data?.success) {
        toast.success(`Notification sent to ${notifTarget.name || notifTarget.phone}!`);
        setNotifTarget(null);
        setNotifTitle('');
        setNotifBody('');
      }
    } catch (err) {
      toast.error('Failed to send notification');
    } finally {
      setSendingNotif(false);
    }
  };

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#083058] flex items-center gap-2">
            <MdPeople className="text-teal-600" />
            Customers &amp; Activity ({customers.length})
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track customer plans, wallet balance, booked therapists, sessions attended, and send targeted notifications.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, email..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a]"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Phone / Email</th>
                <th className="py-3.5 px-4">Wallet</th>
                <th className="py-3.5 px-4">Plan Sessions</th>
                <th className="py-3.5 px-4">Talk Time</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate-400">Loading customers...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate-400">No customers found.</td></tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-800">{c.name || 'Unnamed User'}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <div>{c.phone || '-'}</div>
                      <div className="text-slate-400">{c.email || ''}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">₹{c.walletBalance || 0}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#083058]">{c.remainingPlanSessions || 0} Left</td>
                    <td className="py-3.5 px-4 text-slate-700">{c.talkTimeMinutes || 0} mins</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setNotifTarget(c)}
                          className="px-2.5 py-1.5 text-xs font-semibold bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 flex items-center gap-1"
                          title="Send Notification"
                        >
                          <MdSend size={14} /> Notify
                        </button>
                        <button
                          onClick={() => openCustomerDetails(c)}
                          className="p-2 text-slate-600 hover:text-[#083058] hover:bg-slate-100 rounded-lg"
                          title="View Full Details"
                        >
                          <MdVisibility size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-xl font-bold text-[#083058]">{selectedCustomer.customer.name || 'Customer'}</h2>
                <p className="text-xs text-slate-500">
                  {selectedCustomer.customer.phone} • {selectedCustomer.customer.email || 'No email'} • Joined {new Date(selectedCustomer.customer.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                <MdClose size={20} />
              </button>
            </div>

            {detailLoading ? (
              <div className="py-10 text-center text-slate-400">Loading customer activity...</div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-xs text-slate-500 flex items-center gap-1"><MdAccountBalanceWallet /> Wallet</div>
                    <div className="text-lg font-bold text-emerald-700">₹{selectedCustomer.customer.walletBalance || 0}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-xs text-slate-500 flex items-center gap-1"><MdEventAvailable /> Plan Sessions</div>
                    <div className="text-lg font-bold text-[#083058]">{selectedCustomer.customer.remainingPlanSessions || 0} Left</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-xs text-slate-500 flex items-center gap-1"><MdPhoneInTalk /> Calls Attended</div>
                    <div className="text-lg font-bold text-teal-700">{selectedCustomer.callLogs.length} Calls</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-2">Booked Therapists ({selectedCustomer.bookings.length})</h3>
                  {selectedCustomer.bookings.length === 0 ? (
                    <p className="text-xs text-slate-400">No bookings yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedCustomer.bookings.map((b) => (
                        <div key={b._id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-slate-800">{b.therapistChoice}</span>
                            <span className="text-slate-500 ml-2">({b.remainingMinutes ?? b.bookedMinutes ?? 50}/{b.bookedMinutes ?? 50} mins left)</span>
                          </div>
                          <span className="font-bold text-[#083058]">₹{b.amount} • {b.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Send Targeted Notification Modal */}
      {notifTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={handleSendNotif} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#083058]">Notify {notifTarget.name || notifTarget.phone}</h3>
              <button type="button" onClick={() => setNotifTarget(null)}><MdClose size={20} /></button>
            </div>
            <input
              type="text"
              value={notifTitle}
              onChange={(e) => setNotifTitle(e.target.value)}
              required
              placeholder="Notification title"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
            />
            <textarea
              value={notifBody}
              onChange={(e) => setNotifBody(e.target.value)}
              required
              rows={3}
              placeholder="Notification message"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
            />
            <button
              type="submit"
              disabled={sendingNotif}
              className="w-full py-2.5 bg-[#083058] text-white rounded-xl text-sm font-bold hover:bg-[#0c4a6e]"
            >
              {sendingNotif ? 'Sending...' : 'Send Notification'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
