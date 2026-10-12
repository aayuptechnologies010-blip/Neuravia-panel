import React, { useEffect, useState } from 'react';
import API from '../api/client';
import { TableSkeleton } from '../components/SkeletonLoader';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { MdDelete, MdReply, MdSearch, MdMail } from 'react-icons/md';

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await API.get('/enquiries');
      if (res.data.success) {
        setEnquiries(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleReplyStatus = async (enquiry) => {
    const { value: formValues } = await Swal.fire({
      title: `Reply to ${enquiry.name}`,
      html: `
        <div class="text-left space-y-3">
          <p class="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <strong>User Message:</strong> "${enquiry.message}"
          </p>
          <div>
            <label class="text-xs font-bold text-slate-700 block mb-1">Status</label>
            <select id="swal-status" class="swal2-input !m-0 !w-full !text-sm">
              <option value="New" ${enquiry.status === 'New' ? 'selected' : ''}>New</option>
              <option value="In Progress" ${enquiry.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Resolved" ${enquiry.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
              <option value="Closed" ${enquiry.status === 'Closed' ? 'selected' : ''}>Closed</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-bold text-slate-700 block mb-1">Admin Notes / Reply</label>
            <textarea id="swal-reply" class="swal2-textarea !m-0 !w-full !text-sm" placeholder="Add administrative reply or resolution note...">${enquiry.adminReply || ''}</textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Update Enquiry',
      confirmButtonColor: '#083058',
      preConfirm: () => {
        return {
          status: document.getElementById('swal-status').value,
          adminReply: document.getElementById('swal-reply').value
        };
      }
    });

    if (formValues) {
      try {
        await API.put(`/enquiries/${enquiry._id}/status`, formValues);
        toast.success('Enquiry updated');
        fetchEnquiries();
      } catch (err) {
        toast.error('Update failed');
      }
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Delete Enquiry?',
      text: 'This message will be permanently removed.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Yes, Delete'
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await API.delete(`/enquiries/${id}`);
          toast.success('Enquiry deleted');
          setEnquiries(prev => prev.filter(e => e._id !== id));
        } catch (err) {
          toast.error('Failed to delete enquiry');
        }
      }
    });
  };

  const filtered = enquiries.filter(e => 
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase()) ||
    e.subject?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#083058] tracking-tight">Customer Enquiries</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage messages submitted through the website contact forms.</p>
        </div>
      </div>

      <div className="relative">
        <MdSearch className="absolute left-3.5 top-3 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search by sender name, email, or query subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a]"
        />
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Sender Details</th>
                  <th className="py-3.5 px-6">Category &amp; Subject</th>
                  <th className="py-3.5 px-6">Message</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                      No enquiries found
                    </td>
                  </tr>
                ) : (
                  filtered.map((e) => (
                    <tr key={e._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-[#083058]">{e.name}</div>
                        <div className="text-xs text-slate-400">{e.email}</div>
                        {e.phone && <div className="text-xs text-slate-400">{e.phone}</div>}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-[11px] font-bold text-[#00839a] bg-[#00839a]/10 px-2 py-0.5 rounded block w-fit mb-1">
                          {e.category}
                        </span>
                        <div className="font-semibold text-slate-800 text-xs">{e.subject}</div>
                      </td>
                      <td className="py-4 px-6 max-w-xs">
                        <p className="text-xs text-slate-600 line-clamp-2">{e.message}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                          e.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700' :
                          e.status === 'In Progress' ? 'bg-blue-50 text-blue-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleReplyStatus(e)}
                            className="p-1.5 text-slate-600 hover:text-[#083058] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                          >
                            <MdReply size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(e._id)}
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
