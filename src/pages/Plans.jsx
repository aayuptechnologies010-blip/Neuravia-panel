import React, { useEffect, useState } from 'react';
import API from '../api/client';
import { CardSkeleton } from '../components/SkeletonLoader';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { MdAdd, MdEdit, MdDelete, MdCheck } from 'react-icons/md';

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await API.get('/plans/admin/all');
      if (res.data.success) {
        setPlans(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEdit = async (plan = null) => {
    const isEdit = !!plan;

    const { value: formValues } = await Swal.fire({
      title: isEdit ? 'Edit Pricing Plan' : 'Create Pricing Plan',
      html: `
        <div class="text-left space-y-3">
          <div>
            <label class="text-xs font-bold text-slate-700 block mb-1">Plan Name</label>
            <input id="swal-name" class="swal2-input !m-0 !w-full !text-sm" placeholder="e.g. 6 Session Plan" value="${plan?.name || ''}">
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-xs font-bold text-slate-700 block mb-1">Price (₹)</label>
              <input id="swal-price" type="number" class="swal2-input !m-0 !w-full !text-sm" placeholder="2500" value="${plan?.price || ''}">
            </div>
            <div>
              <label class="text-xs font-bold text-slate-700 block mb-1">Sessions Count</label>
              <input id="swal-count" type="number" class="swal2-input !m-0 !w-full !text-sm" placeholder="6" value="${plan?.sessionsCount || ''}">
            </div>
          </div>
          <div>
            <label class="text-xs font-bold text-slate-700 block mb-1">Effective Price Display</label>
            <input id="swal-eff" class="swal2-input !m-0 !w-full !text-sm" placeholder="e.g. ₹417 / session" value="${plan?.effectivePrice || ''}">
          </div>
          <div>
            <label class="text-xs font-bold text-slate-700 block mb-1">Badge (Optional)</label>
            <input id="swal-badge" class="swal2-input !m-0 !w-full !text-sm" placeholder="e.g. POPULAR or BEST VALUE" value="${plan?.badge || ''}">
          </div>
          <div>
            <label class="text-xs font-bold text-slate-700 block mb-1">Subtitle</label>
            <input id="swal-sub" class="swal2-input !m-0 !w-full !text-sm" placeholder="e.g. Support for ongoing challenges." value="${plan?.subtitle || ''}">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: isEdit ? 'Save Changes' : 'Create Plan',
      confirmButtonColor: '#083058',
      preConfirm: () => {
        const name = document.getElementById('swal-name').value;
        const price = Number(document.getElementById('swal-price').value);
        const sessionsCount = Number(document.getElementById('swal-count').value);
        const effectivePrice = document.getElementById('swal-eff').value;
        const badge = document.getElementById('swal-badge').value || null;
        const subtitle = document.getElementById('swal-sub').value;

        if (!name || !price || !sessionsCount) {
          Swal.showValidationMessage('Please fill all mandatory fields');
          return false;
        }

        return {
          name,
          price,
          sessionsCount,
          effectivePrice: effectivePrice || `₹${Math.round(price / sessionsCount)} / session`,
          badge,
          subtitle,
          isBestValue: badge === 'BEST VALUE',
          features: [
            "Up to 50 minutes each",
            "Online sessions",
            "Confidential & private",
            "Flexible scheduling"
          ]
        };
      }
    });

    if (formValues) {
      try {
        if (isEdit) {
          await API.put(`/plans/${plan._id}`, formValues);
          toast.success('Plan updated');
        } else {
          await API.post('/plans', formValues);
          toast.success('Plan created');
        }
        fetchPlans();
      } catch (err) {
        toast.error('Operation failed');
      }
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Delete Plan?',
      text: 'Are you sure you want to delete this pricing package?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Yes, Delete'
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await API.delete(`/plans/${id}`);
          toast.success('Plan deleted');
          setPlans(prev => prev.filter(p => p._id !== id));
        } catch (err) {
          toast.error('Failed to delete plan');
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#083058] tracking-tight">Plans &amp; Pricing Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Control dynamic pricing packages displayed on the website.</p>
        </div>
        <button
          onClick={() => handleAddEdit()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-[#083058] hover:bg-[#0c4a6e] shadow-sm transition-all"
        >
          <MdAdd size={20} />
          <span>Add New Plan</span>
        </button>
      </div>

      {loading ? (
        <CardSkeleton count={4} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((p) => (
            <div
              key={p._id}
              className={`bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                p.badge === 'BEST VALUE' ? 'border-[#00839a] ring-2 ring-[#00839a]/10' : 'border-slate-200'
              }`}
            >
              <div>
                {p.badge && (
                  <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#00839a] text-white mb-3">
                    {p.badge}
                  </span>
                )}
                <h3 className="font-bold text-lg text-[#083058]">{p.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{p.subtitle}</p>

                <div className="mt-4 pb-4 border-b border-slate-100">
                  <div className="text-3xl font-extrabold text-[#083058]">₹{p.price}</div>
                  <div className="text-xs text-[#00839a] font-semibold mt-1">{p.effectivePrice}</div>
                </div>

                <div className="py-4 space-y-2">
                  {(p.features || []).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                      <MdCheck size={14} className="text-[#00839a] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleAddEdit(p)}
                  className="text-xs font-bold text-slate-700 hover:text-[#083058] bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1 transition-colors"
                >
                  <MdEdit size={14} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(p._id)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <MdDelete size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
