import React, { useEffect, useState } from 'react';
import API from '../api/client';
import { TableSkeleton } from '../components/SkeletonLoader';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { MdDelete, MdEdit, MdSearch, MdFilterList, MdCheck } from 'react-icons/md';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await API.get('/bookings');
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    const { value: newStatus } = await Swal.fire({
      title: 'Update Session Status',
      input: 'select',
      inputOptions: {
        'Scheduled': 'Scheduled',
        'Confirmed': 'Confirmed',
        'Completed': 'Completed',
        'Cancelled': 'Cancelled'
      },
      inputValue: currentStatus,
      showCancelButton: true,
      confirmButtonColor: '#083058'
    });

    if (newStatus && newStatus !== currentStatus) {
      try {
        await API.put(`/bookings/${id}/status`, { status: newStatus });
        toast.success(`Booking updated to ${newStatus}`);
        fetchBookings();
      } catch (err) {
        toast.error('Failed to update status');
      }
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Delete Booking Record?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Yes, Delete'
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await API.delete(`/bookings/${id}`);
          toast.success('Booking deleted');
          setBookings(prev => prev.filter(b => b._id !== id));
        } catch (err) {
          toast.error('Failed to delete booking');
        }
      }
    });
  };

  const filtered = bookings.filter(b => {
    const matchesSearch = 
      b.client?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      b.client?.email?.toLowerCase().includes(search.toLowerCase()) ||
      b.client?.phone?.includes(search) ||
      b.bookingId?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#083058] tracking-tight">Consultation Bookings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage user scheduled therapy appointments and update statuses.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MdSearch className="absolute left-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by client name, email, phone, or booking ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a] text-slate-700"
        >
          <option value="ALL">All Statuses</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table Data */}
      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">ID &amp; Client</th>
                  <th className="py-3.5 px-6">Slot Time</th>
                  <th className="py-3.5 px-6">Therapist</th>
                  <th className="py-3.5 px-6">Focus / Location</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                      No matching bookings found
                    </td>
                  </tr>
                ) : (
                  filtered.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <span className="text-[11px] font-mono font-bold text-[#00839a] bg-[#00839a]/10 px-2 py-0.5 rounded block w-fit mb-1">
                          {b.bookingId}
                        </span>
                        <div className="font-bold text-[#083058]">{b.client?.fullName}</div>
                        <div className="text-xs text-slate-400">{b.client?.phone} &bull; {b.client?.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-800">{b.date}</div>
                        <div className="text-xs text-slate-500">{b.time}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-[#083058]">{b.therapistChoice}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-xs font-semibold text-slate-700">{b.client?.helpCategory}</div>
                        <div className="text-xs text-slate-400">{b.client?.city} ({b.client?.pincode})</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                          b.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700' :
                          b.status === 'Completed' ? 'bg-blue-50 text-blue-700' :
                          b.status === 'Cancelled' ? 'bg-rose-50 text-rose-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleStatusChange(b._id, b.status)}
                            title="Update Status"
                            className="p-1.5 text-slate-600 hover:text-[#083058] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                          >
                            <MdEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(b._id)}
                            title="Delete"
                            className="p-1.5 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                          >
                            <MdDelete size={16} />
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
      )}
    </div>
  );
}
