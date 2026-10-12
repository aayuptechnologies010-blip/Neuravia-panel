import React, { useEffect, useState, useRef } from 'react';
import API from '../api/client';
import { TableSkeleton } from '../components/SkeletonLoader';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdVerified, 
  MdSearch, 
  MdStar, 
  MdAccessTime, 
  MdLanguage, 
  MdSchool, 
  MdWork, 
  MdPayment, 
  MdPsychology, 
  MdVisibility, 
  MdClose, 
  MdSave,
  MdCameraAlt,
  MdEventAvailable,
  MdGroup,
  MdFilterList
} from 'react-icons/md';

const initialTherapistState = {
  profilePhoto: 'https://images.unsplash.com/photo-1594824813637-8e6f14ddbd66?auto=format&fit=crop&w=600&q=80',
  name: 'Dr. Priya Sharma',
  title: 'Clinical Psychologist / Therapist',
  specialization: 'Anxiety, Stress & Relationship Therapy',
  experience: '6+ Years',
  qualification: 'M.A. Psychology, M.Phil Clinical Psychology',
  languages: 'Hindi, English',
  sessionMode: 'Online / In-Person / Both',
  about: 'Dedicated clinical psychologist with over 6 years of experience helping individuals and couples navigate emotional distress, anxiety cycles, and life transitions with compassionate evidence-based care.',
  treats: 'Anxiety, Stress, Depression, Relationship Issues',
  ageGroups: 'Teenagers, Adults, Couples',
  therapyMethods: 'CBT, Mindfulness, Counseling',
  sessionDuration: '45–60 Minutes',
  availability: 'Mon–Sat, 10 AM–8 PM',
  startingPrice: '₹499/session',
  rating: 4.8,
  totalSessions: '500+ Sessions Completed',
  isVerified: true,
  verifiedBadge: 'Neuravia Verified',
  isActive: true
};

export default function Therapists() {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState('all');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [editingTherapist, setEditingTherapist] = useState(null);
  const [formData, setFormData] = useState(initialTherapistState);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const fileInputRef = useRef(null);

  const resolveImageUrl = (url, fallback = '') => {
    if (!url) return fallback;
    if (url.startsWith('/uploads/')) {
      const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
      return `${apiBase}${url}`;
    }
    return url;
  };

  useEffect(() => {
    fetchTherapists();
  }, []);

  const fetchTherapists = async () => {
    try {
      setLoading(true);
      const res = await API.get('/therapists/admin/all');
      if (res.data.success) {
        setTherapists(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load therapists');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingTherapist(null);
    setFormData({
      ...initialTherapistState,
      name: '',
      title: 'Clinical Psychologist / Therapist',
      profilePhoto: 'https://images.unsplash.com/photo-1594824813637-8e6f14ddbd66?auto=format&fit=crop&w=600&q=80',
      about: ''
    });
    setActiveTab('basic');
    setModalOpen(true);
  };

  const openEditModal = (t) => {
    setEditingTherapist(t);
    setFormData({
      profilePhoto: t.profilePhoto || '',
      name: t.name || '',
      title: t.title || '',
      specialization: t.specialization || (t.specialties ? t.specialties.join(', ') : 'Anxiety, Stress & Relationship Therapy'),
      experience: t.experience || '6+ Years',
      qualification: t.qualification || 'M.A. Psychology, M.Phil Clinical Psychology',
      languages: Array.isArray(t.languages) ? t.languages.join(', ') : (t.languages || 'Hindi, English'),
      sessionMode: t.sessionMode || 'Online / In-Person / Both',
      about: t.about || t.bio || '',
      treats: Array.isArray(t.treats) ? t.treats.join(', ') : (t.treats || (t.specialties ? t.specialties.join(', ') : 'Anxiety, Stress, Depression')),
      ageGroups: Array.isArray(t.ageGroups) ? t.ageGroups.join(', ') : (t.ageGroups || 'Teenagers, Adults, Couples'),
      therapyMethods: Array.isArray(t.therapyMethods) ? t.therapyMethods.join(', ') : (t.therapyMethods || 'CBT, Mindfulness, Counseling'),
      sessionDuration: t.sessionDuration || '45–60 Minutes',
      availability: t.availability || 'Mon–Sat, 10 AM–8 PM',
      startingPrice: t.startingPrice || (t.pricePerSession ? `₹${t.pricePerSession}/session` : '₹499/session'),
      rating: t.rating || 4.8,
      totalSessions: t.totalSessions || '500+ Sessions Completed',
      isVerified: t.isVerified !== undefined ? t.isVerified : true,
      verifiedBadge: t.verifiedBadge || 'Neuravia Verified',
      isActive: t.isActive !== undefined ? t.isActive : true
    });
    setActiveTab('basic');
    setModalOpen(true);
  };

  const openPreviewModal = (t) => {
    setEditingTherapist(t);
    setPreviewModalOpen(true);
  };

  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Handle Photo File Upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WEBP)');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('image', file);

    setUploadingPhoto(true);
    const toastId = toast.loading('Uploading to uploads/therapists/ folder...');
    try {
      const res = await API.post('/upload?category=therapists', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.success && res.data.data?.fileUrl) {
        setFormData(prev => ({ ...prev, profilePhoto: res.data.data.fileUrl }));
        toast.success(`Photo saved to uploads/${res.data.data.category}/ folder!`, { id: toastId });
      } else {
        toast.error('Upload succeeded without file url', { id: toastId });
      }
    } catch (err) {
      // Fallback to local base64 preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, profilePhoto: event.target.result }));
      };
      reader.readAsDataURL(file);
      toast.error(err.response?.data?.message || 'Server upload failed, loaded local preview', { id: toastId });
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Submit Add or Edit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Full Name is required');
      setActiveTab('basic');
      return;
    }
    if (!formData.title.trim()) {
      toast.error('Professional Title is required');
      setActiveTab('basic');
      return;
    }

    setSaving(true);
    try {
      let finalData = { ...formData };
      if (finalData.profilePhoto && finalData.profilePhoto.startsWith('data:image')) {
        try {
          const upRes = await API.post('/upload/base64', {
            image: finalData.profilePhoto,
            category: 'therapists'
          });
          if (upRes.data?.success && upRes.data.data?.fileUrl) {
            finalData.profilePhoto = upRes.data.data.fileUrl;
          }
        } catch (e) {
          // continue with local data
        }
      }

      if (editingTherapist) {
        await API.put(`/therapists/${editingTherapist._id}`, finalData);
        toast.success('Therapist profile updated!');
      } else {
        await API.post('/therapists', finalData);
        toast.success('New therapist created successfully!');
      }
      setModalOpen(false);
      fetchTherapists();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  // Delete confirmation
  const handleDelete = (id, name) => {
    Swal.fire({
      title: 'Remove Therapist?',
      text: `Are you sure you want to delete ${name}? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Remove Therapist'
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await API.delete(`/therapists/${id}`);
          toast.success('Therapist removed successfully');
          setTherapists(prev => prev.filter(t => t._id !== id));
        } catch (err) {
          toast.error('Failed to remove therapist');
        }
      }
    });
  };

  // Filter list
  const filteredTherapists = therapists.filter(t => {
    const matchesSearch = 
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.specialization?.toLowerCase().includes(search.toLowerCase()) ||
      (t.languages && JSON.stringify(t.languages).toLowerCase().includes(search.toLowerCase()));

    const matchesMode = filterMode === 'all' 
      ? true 
      : (t.sessionMode || '').toLowerCase().includes(filterMode.toLowerCase());

    return matchesSearch && matchesMode;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Main Call to Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#083058] tracking-tight">Therapist Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage comprehensive practitioner profiles, clinical qualifications, session logistics, and verification badges.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-[#083058] hover:bg-[#0c4a6e] shadow-sm transition-all shrink-0 cursor-pointer"
        >
          <MdAdd size={20} />
          <span>Add New Therapist</span>
        </button>
      </div>

      {/* Quick Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <p className="text-xs text-slate-400 font-semibold uppercase">Total Listed</p>
          <p className="text-2xl font-bold text-[#083058] mt-1">{therapists.length}</p>
        </div>
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <p className="text-xs text-slate-400 font-semibold uppercase">Verified Specialists</p>
          <p className="text-2xl font-bold text-[#00839a] mt-1">
            {therapists.filter(t => t.isVerified !== false).length}
          </p>
        </div>
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <p className="text-xs text-slate-400 font-semibold uppercase">Avg Patient Rating</p>
          <div className="flex items-center gap-1 mt-1 text-2xl font-bold text-amber-500">
            <MdStar size={22} className="fill-amber-400" />
            <span>4.9</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <p className="text-xs text-slate-400 font-semibold uppercase">Base Session Rate</p>
          <p className="text-2xl font-bold text-[#083058] mt-1">₹499</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <MdSearch className="absolute left-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by therapist name, title, specialization, or language..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a] focus:bg-white transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600">
            <MdFilterList size={16} />
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">All Session Modes</option>
              <option value="online">Online Mode</option>
              <option value="in-person">In-Person Mode</option>
              <option value="both">Both (Online &amp; In-Person)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : filteredTherapists.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <MdPsychology size={48} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-[#083058]">No therapists found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or add a new therapist.</p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#083058] hover:bg-[#0c4a6e] transition-colors cursor-pointer"
          >
            Add First Therapist
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-5">Therapist &amp; Verified Badge</th>
                  <th className="py-3.5 px-5">Specialization &amp; Qualification</th>
                  <th className="py-3.5 px-5">Experience &amp; Mode</th>
                  <th className="py-3.5 px-5">Languages &amp; Availability</th>
                  <th className="py-3.5 px-5">Rating &amp; Sessions</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTherapists.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* Column 1: Photo, Name, Verified Badge */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3.5">
                        <div className="relative shrink-0">
                          <img 
                            src={resolveImageUrl(t.profilePhoto, 'https://images.unsplash.com/photo-1594824813637-8e6f14ddbd66?auto=format&fit=crop&w=200&q=80')} 
                            alt={t.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 shadow-xs" 
                          />
                          {t.isVerified !== false && (
                            <span 
                              className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs text-[#00839a]" 
                              title="Neuravia Verified"
                            >
                              <MdVerified size={16} />
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-[#083058] text-base leading-tight flex items-center gap-1.5">
                            <span>{t.name}</span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">{t.title}</p>
                          <span className="inline-block mt-1 text-[10px] font-bold text-[#00839a] bg-[#00839a]/10 px-2 py-0.5 rounded-md">
                            {t.verifiedBadge || 'Neuravia Verified'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Specialization & Qualification */}
                    <td className="py-4 px-5">
                      <div className="font-semibold text-slate-800 text-xs line-clamp-1">
                        {t.specialization || (t.specialties ? t.specialties.join(', ') : 'Anxiety, Stress')}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                        <MdSchool size={13} className="text-[#00839a] shrink-0" />
                        <span className="truncate max-w-[200px]">{t.qualification || 'M.A. Psychology'}</span>
                      </div>
                    </td>

                    {/* Column 3: Experience & Session Mode */}
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-800 text-xs">
                        {t.experience || '6+ Years'}
                      </div>
                      <span className="inline-block mt-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {t.sessionMode || 'Online / Both'}
                      </span>
                    </td>

                    {/* Column 4: Languages & Availability */}
                    <td className="py-4 px-5">
                      <div className="text-xs text-slate-700 flex items-center gap-1">
                        <MdLanguage size={13} className="text-slate-400 shrink-0" />
                        <span>{Array.isArray(t.languages) ? t.languages.join(', ') : (t.languages || 'Hindi, English')}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <MdAccessTime size={13} className="shrink-0" />
                        <span>{t.availability || 'Mon–Sat, 10 AM–8 PM'}</span>
                      </div>
                    </td>

                    {/* Column 5: Rating, Price, Sessions */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                        <MdStar size={14} className="fill-amber-400" />
                        <span>{t.rating || 4.8}</span>
                        <span className="text-slate-400 font-normal ml-1 text-[11px]">
                          ({t.totalSessions || '500+ Sessions'})
                        </span>
                      </div>
                      <div className="text-xs font-bold text-[#083058] mt-1">
                        {t.startingPrice || (t.pricePerSession ? `₹${t.pricePerSession}/session` : '₹499/session')}
                      </div>
                    </td>

                    {/* Column 6: Actions */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openPreviewModal(t)}
                          className="p-2 text-slate-600 hover:text-[#00839a] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                          title="View Full Profile Details"
                        >
                          <MdVisibility size={16} />
                        </button>
                        <button
                          onClick={() => openEditModal(t)}
                          className="p-2 text-slate-600 hover:text-[#083058] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                          title="Edit Therapist"
                        >
                          <MdEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(t._id, t.name)}
                          className="p-2 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                          title="Delete Therapist"
                        >
                          <MdDelete size={16} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FULL MODAL FOR ADD / EDIT THERAPIST (WITH ALL 18 FIELDS) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full my-8 shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-6 bg-[#083058] text-white flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight">
                  {editingTherapist ? `Edit Therapist: ${editingTherapist.name}` : 'Add New Therapist'}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Configure complete therapist credentials, session rates, clinical background, and verification badge.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <MdClose size={24} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`py-3 px-4 border-b-2 cursor-pointer transition-colors ${
                  activeTab === 'basic' 
                    ? 'border-[#00839a] text-[#00839a] bg-white rounded-t-xl' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                1. Profile &amp; Photo
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('clinical')}
                className={`py-3 px-4 border-b-2 cursor-pointer transition-colors ${
                  activeTab === 'clinical' 
                    ? 'border-[#00839a] text-[#00839a] bg-white rounded-t-xl' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                2. Clinical &amp; Qualifications
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('logistics')}
                className={`py-3 px-4 border-b-2 cursor-pointer transition-colors ${
                  activeTab === 'logistics' 
                    ? 'border-[#00839a] text-[#00839a] bg-white rounded-t-xl' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                3. Logistics, Rates &amp; Bio
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleFormSubmit} className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
              
              {/* TAB 1: BASIC INFO & PHOTO */}
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  {/* Photo Preview & Upload */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <div className="relative shrink-0">
                      <img
                        src={resolveImageUrl(formData.profilePhoto, 'https://images.unsplash.com/photo-1594824813637-8e6f14ddbd66?auto=format&fit=crop&w=400&q=80')}
                        alt="Preview"
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md bg-slate-200"
                      />
                      {formData.isVerified && (
                        <span className="absolute bottom-0 right-0 bg-[#00839a] text-white p-1 rounded-full shadow-md" title="Neuravia Verified">
                          <MdVerified size={18} />
                        </span>
                      )}
                    </div>

                    <div className="flex-1 space-y-3 w-full">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        1. Profile Photo (URL or File Upload)
                      </label>
                      <input
                        type="text"
                        value={formData.profilePhoto}
                        onChange={(e) => setFormData({ ...formData, profilePhoto: e.target.value })}
                        placeholder="https://images.unsplash.com/... or paste image URL"
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a]"
                      />
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <MdCameraAlt size={15} />
                          <span>Upload From Device</span>
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handlePhotoUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <span className="text-[11px] text-slate-400">JPG, PNG, WebP supported</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        2. Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Dr. Priya Sharma"
                        required
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        3. Professional Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. Clinical Psychologist / Therapist"
                        required
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        4. Specialization
                      </label>
                      <input
                        type="text"
                        value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        placeholder="e.g. Anxiety, Stress & Relationship Therapy"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        5. Experience
                      </label>
                      <input
                        type="text"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        placeholder="e.g. 6+ Years"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a] focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Verification Badge Toggle */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#083058] flex items-center gap-1.5">
                        <MdVerified size={18} className="text-[#00839a]" />
                        <span>18. Verified Badge (Neuravia Verified)</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Show official trust seal on the patient booking portal</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isVerified}
                        onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00839a]" />
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: CLINICAL & QUALIFICATIONS */}
              {activeTab === 'clinical' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      6. Qualification
                    </label>
                    <input
                      type="text"
                      value={formData.qualification}
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                      placeholder="e.g. M.A. Psychology, M.Phil Clinical Psychology"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      7. Languages (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.languages}
                      onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                      placeholder="e.g. Hindi, English"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      10. Expertise / Treats (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.treats}
                      onChange={(e) => setFormData({ ...formData, treats: e.target.value })}
                      placeholder="e.g. Anxiety, Stress, Depression, Relationship Issues"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a] focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        11. Age Groups
                      </label>
                      <input
                        type="text"
                        value={formData.ageGroups}
                        onChange={(e) => setFormData({ ...formData, ageGroups: e.target.value })}
                        placeholder="e.g. Teenagers, Adults, Couples"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        12. Therapy Methods
                      </label>
                      <input
                        type="text"
                        value={formData.therapyMethods}
                        onChange={(e) => setFormData({ ...formData, therapyMethods: e.target.value })}
                        placeholder="e.g. CBT, Mindfulness, Counseling"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a] focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: LOGISTICS, RATES & BIO */}
              {activeTab === 'logistics' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        8. Session Mode
                      </label>
                      <select
                        value={formData.sessionMode}
                        onChange={(e) => setFormData({ ...formData, sessionMode: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a] focus:bg-white cursor-pointer"
                      >
                        <option value="Online / In-Person / Both">Online / In-Person / Both</option>
                        <option value="Online Only">Online Only</option>
                        <option value="In-Person Only">In-Person Only</option>
                        <option value="Online / Both">Online / Both</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        13. Session Duration
                      </label>
                      <input
                        type="text"
                        value={formData.sessionDuration}
                        onChange={(e) => setFormData({ ...formData, sessionDuration: e.target.value })}
                        placeholder="e.g. 45–60 Minutes"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        14. Availability Schedule
                      </label>
                      <input
                        type="text"
                        value={formData.availability}
                        onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                        placeholder="e.g. Mon–Sat, 10 AM–8 PM"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        15. Starting Price
                      </label>
                      <input
                        type="text"
                        value={formData.startingPrice}
                        onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                        placeholder="e.g. ₹499/session"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        16. Rating (e.g. 4.8)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 4.8 })}
                        placeholder="4.8"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        17. Total Sessions
                      </label>
                      <input
                        type="text"
                        value={formData.totalSessions}
                        onChange={(e) => setFormData({ ...formData, totalSessions: e.target.value })}
                        placeholder="e.g. 500+ Sessions Completed"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      9. About Therapist (3–5 lines introduction)
                    </label>
                    <textarea
                      rows={4}
                      value={formData.about}
                      onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                      placeholder="Dedicated clinical psychologist with expertise in anxiety, stress and relationship therapy..."
                      className="w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a] focus:bg-white resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Form Navigation & Submit Button */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex gap-2">
                  {activeTab !== 'basic' && (
                    <button
                      type="button"
                      onClick={() => setActiveTab(activeTab === 'logistics' ? 'clinical' : 'basic')}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      &larr; Previous Step
                    </button>
                  )}
                  {activeTab !== 'logistics' && (
                    <button
                      type="button"
                      onClick={() => setActiveTab(activeTab === 'basic' ? 'clinical' : 'logistics')}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-[#00839a] bg-[#00839a]/10 hover:bg-[#00839a]/20 transition-colors cursor-pointer"
                    >
                      Next Step &rarr;
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-[#083058] hover:bg-[#0c4a6e] shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <MdSave size={16} />
                    <span>{saving ? 'Saving...' : editingTherapist ? 'Save Changes' : 'Create Therapist'}</span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* FULL PATIENT-FACING PREVIEW CARD MODAL */}
      {previewModalOpen && editingTherapist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setPreviewModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <MdClose size={22} />
            </button>

            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <img
                  src={resolveImageUrl(editingTherapist.profilePhoto, 'https://images.unsplash.com/photo-1594824813637-8e6f14ddbd66?auto=format&fit=crop&w=400&q=80')}
                  alt={editingTherapist.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-[#00839a]/30 shadow-sm"
                />
                {editingTherapist.isVerified !== false && (
                  <span className="absolute bottom-0 right-0 bg-[#00839a] text-white p-1 rounded-full text-xs shadow-sm">
                    <MdVerified size={16} />
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#083058]">{editingTherapist.name}</h3>
                <p className="text-xs text-[#00839a] font-semibold">{editingTherapist.title}</p>
                <div className="flex items-center gap-2 mt-1 text-xs">
                  <span className="flex items-center text-amber-500 font-bold">
                    <MdStar size={15} className="fill-amber-400" />
                    <span className="ml-0.5">{editingTherapist.rating || 4.8}</span>
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 font-medium">{editingTherapist.experience || '6+ Years'}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 font-medium">{editingTherapist.totalSessions || '500+ Sessions'}</span>
                </div>
              </div>
            </div>

            {/* Verification & Rate Bar */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-[#00839a] font-bold">
                <MdVerified size={16} />
                <span>{editingTherapist.verifiedBadge || 'Neuravia Verified'}</span>
              </div>
              <div className="font-bold text-[#083058] text-sm">
                {editingTherapist.startingPrice || (editingTherapist.pricePerSession ? `₹${editingTherapist.pricePerSession}/session` : '₹499/session')}
              </div>
            </div>

            {/* About */}
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">About Therapist</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {editingTherapist.about || editingTherapist.bio || 'Compassionate and evidence-based mental health guidance tailored to your schedule and goals.'}
              </p>
            </div>

            {/* Detailed Table Grid */}
            <div className="space-y-2.5 text-xs border-t border-slate-100 pt-4">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Qualification</span>
                <span className="font-semibold text-slate-800 text-right">{editingTherapist.qualification || 'M.A. Psychology'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Specialization</span>
                <span className="font-semibold text-slate-800 text-right">{editingTherapist.specialization || 'Anxiety, Stress & Relationship Therapy'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Languages</span>
                <span className="font-semibold text-slate-800 text-right">
                  {Array.isArray(editingTherapist.languages) ? editingTherapist.languages.join(', ') : (editingTherapist.languages || 'Hindi, English')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Session Mode</span>
                <span className="font-semibold text-[#00839a] text-right">{editingTherapist.sessionMode || 'Online / In-Person / Both'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Session Duration</span>
                <span className="font-semibold text-slate-800 text-right">{editingTherapist.sessionDuration || '45–60 Minutes'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Availability</span>
                <span className="font-semibold text-slate-800 text-right">{editingTherapist.availability || 'Mon–Sat, 10 AM–8 PM'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Expertise / Treats</span>
                <span className="font-semibold text-slate-800 text-right">
                  {Array.isArray(editingTherapist.treats) ? editingTherapist.treats.join(', ') : (editingTherapist.treats || 'Anxiety, Stress, Depression')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Age Groups</span>
                <span className="font-semibold text-slate-800 text-right">
                  {Array.isArray(editingTherapist.ageGroups) ? editingTherapist.ageGroups.join(', ') : (editingTherapist.ageGroups || 'Teenagers, Adults, Couples')}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Therapy Methods</span>
                <span className="font-semibold text-slate-800 text-right">
                  {Array.isArray(editingTherapist.therapyMethods) ? editingTherapist.therapyMethods.join(', ') : (editingTherapist.therapyMethods || 'CBT, Mindfulness, Counseling')}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-[#083058] hover:bg-[#0c4a6e] transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
