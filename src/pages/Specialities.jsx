import React, { useState, useEffect } from 'react';
import api from '../api/client';
import toast from 'react-hot-toast';
import { MdAdd, MdDelete, MdCategory } from 'react-icons/md';

export default function Specialities() {
  const [specialities, setSpecialities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🧠');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchSpecialities = async () => {
    try {
      setLoading(true);
      const res = await api.get('/specialities');
      if (res.data?.success) {
        setSpecialities(res.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load specialities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialities();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter speciality name');
      return;
    }
    try {
      setSubmitting(true);
      const res = await api.post('/specialities', {
        name: name.trim(),
        icon: icon.trim() || '🧠',
        description: description.trim()
      });
      if (res.data?.success) {
        toast.success('Speciality added!');
        setName('');
        setDescription('');
        fetchSpecialities();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add speciality');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/specialities/${id}`);
      toast.success('Speciality deleted');
      fetchSpecialities();
    } catch (err) {
      toast.error('Failed to delete speciality');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <MdCategory className="text-teal-600" />
          Therapy Specialities
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Add specialities here first. Therapists cannot be added without selecting at least one speciality.
        </p>
      </div>

      {/* Add Speciality Form */}
      <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-base font-semibold text-slate-800 mb-4">Add New Speciality</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Icon (Emoji)</label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              placeholder="Enter icon"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-slate-600 mb-1">Speciality Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              placeholder="Enter speciality name"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              placeholder="Enter description"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#083058] text-white rounded-lg text-sm font-medium hover:bg-[#0c4a6e] disabled:opacity-50"
          >
            <MdAdd size={18} />
            {submitting ? 'Adding...' : 'Add Speciality'}
          </button>
        </div>
      </form>

      {/* Specialities List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-semibold text-slate-700 text-sm">
          All Specialities ({specialities.length})
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading specialities...</div>
        ) : specialities.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No specialities added yet. Add one above!</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {specialities.map((item) => (
              <div key={item._id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon || '🧠'}</span>
                  <div>
                    <div className="font-semibold text-slate-800 text-sm">{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-slate-500">{item.description}</div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  title="Delete"
                >
                  <MdDelete size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
