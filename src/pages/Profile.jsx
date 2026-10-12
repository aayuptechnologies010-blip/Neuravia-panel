import React, { useState, useEffect, useRef } from 'react';
import API from '../api/client';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { 
  MdPerson, 
  MdMail, 
  MdPhone, 
  MdWork, 
  MdDescription, 
  MdCameraAlt, 
  MdSave, 
  MdLock, 
  MdVisibility, 
  MdVisibilityOff, 
  MdCheckCircle,
  MdZoomIn,
  MdZoomOut,
  MdRefresh,
  MdCrop,
  MdShield,
  MdImage
} from 'react-icons/md';

export default function Profile() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Profile Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Photo adjustment tool modal state
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState('');
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [rotation, setRotation] = useState(0);

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const resolveImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('/uploads/')) {
      const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
      return `${apiBase}${url}`;
    }
    return url;
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get('/auth/profile');
      if (res.data?.success && res.data.admin) {
        const u = res.data.admin;
        setName(u.name || '');
        setEmail(u.email || '');
        setPhone(u.phone || '+91 98765 43210');
        setTitle(u.title || 'Lead Administrator & Care Director');
        setBio(u.bio || 'Dedicated to clinical excellence, confidential counselling operations, and seamless care journeys across Neuravia.');
        setAvatar(u.avatar || '');
        
        // update local storage
        localStorage.setItem('neuravia_admin_user', JSON.stringify(u));
      }
    } catch (err) {
      // Fallback from localStorage
      const cached = JSON.parse(localStorage.getItem('neuravia_admin_user') || '{}');
      if (cached.name) {
        setName(cached.name);
        setEmail(cached.email || '');
        setPhone(cached.phone || '+91 98765 43210');
        setTitle(cached.title || 'Lead Administrator');
        setBio(cached.bio || '');
        setAvatar(cached.avatar || '');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload from computer
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setRawImageSrc(event.target.result);
      setZoom(1);
      setOffsetX(0);
      setOffsetY(0);
      setRotation(0);
      setAdjustModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  // Prompt user for image URL as an option
  const handleUrlPrompt = () => {
    Swal.fire({
      title: 'Enter Image URL',
      input: 'url',
      inputPlaceholder: 'https://example.com/avatar.jpg',
      showCancelButton: true,
      confirmButtonText: 'Load Photo',
      confirmButtonColor: '#083058'
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        setRawImageSrc(result.value);
        setZoom(1);
        setOffsetX(0);
        setOffsetY(0);
        setRotation(0);
        setAdjustModalOpen(true);
      }
    });
  };

  // Render & crop adjusted image to canvas
  const handleApplyAdjustment = () => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = rawImageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 300; // standard profile avatar size
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      // Fill circular mask or square
      ctx.clearRect(0, 0, size, size);
      ctx.save();

      // Translate to center for rotation and scaling
      ctx.translate(size / 2, size / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      // Draw image adjusted by offset
      const aspect = image.width / image.height;
      let drawW, drawH;
      if (aspect >= 1) {
        drawH = size;
        drawW = size * aspect;
      } else {
        drawW = size;
        drawH = size / aspect;
      }

      ctx.drawImage(
        image, 
        -drawW / 2 + (offsetX * (size / 100)), 
        -drawH / 2 + (offsetY * (size / 100)), 
        drawW, 
        drawH
      );
      ctx.restore();

      const adjustedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
      
      // Upload to server category folder: uploads/admin/
      API.post('/upload/base64', {
        image: adjustedDataUrl,
        category: 'admin'
      }).then((res) => {
        if (res.data?.success && res.data.data?.fileUrl) {
          setAvatar(res.data.data.fileUrl);
          toast.success(`Photo saved to uploads/${res.data.data.category}/ folder!`);
        } else {
          setAvatar(adjustedDataUrl);
          toast.success('Photo adjusted! Click "Save Changes" to apply.');
        }
      }).catch(() => {
        setAvatar(adjustedDataUrl);
        toast.success('Photo adjusted locally! Click "Save Changes" to apply.');
      });

      setAdjustModalOpen(false);
    };
    image.onerror = () => {
      // Fallback
      setAvatar(rawImageSrc);
      setAdjustModalOpen(false);
      toast.success('Photo applied! Click "Save Changes" to persist.');
    };
  };

  // Save profile changes
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Full Name is required');
      return;
    }
    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      toast.error('Password should be at least 6 characters');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        email,
        phone,
        title,
        bio,
        avatar
      };

      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await API.put('/auth/profile', payload);
      if (res.data.success) {
        toast.success('Profile updated successfully!');
        if (res.data.admin) {
          localStorage.setItem('neuravia_admin_user', JSON.stringify(res.data.admin));
        }
        if (res.data.token) {
          localStorage.setItem('neuravia_admin_token', res.data.token);
        }
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Dispatch custom event to notify Layout header/sidebar to re-render
        window.dispatchEvent(new Event('admin_profile_updated'));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#083058] tracking-tight">Admin Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Customize your administrator credentials, upload and adjust profile avatar, and manage security settings.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        
        {/* Banner with brand palette */}
        <div className="h-36 sm:h-44 bg-gradient-to-r from-[#083058] via-[#0c4a6e] to-[#00839a] relative p-6 flex items-end">
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white text-xs font-semibold">
            <MdShield size={16} className="text-emerald-300" />
            <span>Neuravia Verified Administrator</span>
          </div>
        </div>

        {/* Avatar Bar & Quick Meta */}
        <div className="px-6 sm:px-10 pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16 sm:-mt-20 mb-6">
            
            {/* Interactive Avatar Frame */}
            <div className="relative group shrink-0">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white shadow-xl bg-slate-100 overflow-hidden relative flex items-center justify-center">
                {avatar ? (
                  <img 
                    src={resolveImageUrl(avatar)} 
                    alt={name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-[#00839a]/15 text-[#00839a] flex items-center justify-center font-bold text-3xl sm:text-4xl">
                    {name ? name.charAt(0).toUpperCase() : 'A'}
                  </div>
                )}

                {/* Hover overlay to trigger photo upload/adjust */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-semibold gap-1 cursor-pointer"
                  title="Upload & Adjust Picture"
                >
                  <MdCameraAlt size={24} />
                  <span>Change Photo</span>
                </button>
              </div>

              {/* Quick Action Button for Camera */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 p-2 bg-[#00839a] hover:bg-[#006e82] text-white rounded-full shadow-lg border-2 border-white transition-transform hover:scale-110 cursor-pointer"
                title="Upload Photo"
              >
                <MdCameraAlt size={16} />
              </button>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            {/* Quick Actions for Photo */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <MdCameraAlt size={16} />
                <span>Upload From Device</span>
              </button>
              <button
                type="button"
                onClick={handleUrlPrompt}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#00839a] bg-[#00839a]/10 hover:bg-[#00839a]/20 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <MdImage size={16} />
                <span>Use Image URL</span>
              </button>
              {avatar && (
                <button
                  type="button"
                  onClick={() => {
                    setRawImageSrc(avatar);
                    setZoom(1);
                    setOffsetX(0);
                    setOffsetY(0);
                    setRotation(0);
                    setAdjustModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#083058] bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <MdCrop size={16} />
                  <span>Adjust Position</span>
                </button>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: General Info */}
            <div>
              <div className="border-b border-slate-100 pb-3 mb-5">
                <h2 className="text-base font-bold text-[#083058] flex items-center gap-2">
                  <MdPerson className="text-[#00839a]" size={20} />
                  <span>Personal & Role Information</span>
                </h2>
                <p className="text-xs text-slate-400">Basic details visible across system activity logs.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MdPerson className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Dr. Priya Sharma"
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MdMail className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@neuravia.in"
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Contact Phone Number
                  </label>
                  <div className="relative">
                    <MdPhone className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Professional Title / Designation
                  </label>
                  <div className="relative">
                    <MdWork className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Lead Administrator & Care Director"
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    About / Professional Bio
                  </label>
                  <div className="relative">
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Brief note about clinical governance and role at Neuravia..."
                      className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a] focus:bg-white transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Security & Password */}
            <div>
              <div className="border-b border-slate-100 pb-3 mb-5">
                <h2 className="text-base font-bold text-[#083058] flex items-center gap-2">
                  <MdLock className="text-[#00839a]" size={20} />
                  <span>Security & Password (Optional)</span>
                </h2>
                <p className="text-xs text-slate-400">Leave blank if you do not wish to change your password.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a] focus:bg-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showCurrentPass ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a] focus:bg-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNewPass ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full pl-3.5 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a] focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={fetchProfile}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-[#083058] hover:bg-[#0c4a6e] shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                <MdSave size={18} />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* PHOTO ADJUSTMENT MODAL */}
      {adjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#083058]">Adjust Profile Photo</h3>
                <p className="text-xs text-slate-400">Scale, move and position your profile image</p>
              </div>
              <button
                onClick={() => setAdjustModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Viewport Frame */}
            <div className="flex justify-center py-2">
              <div className="w-56 h-56 rounded-full overflow-hidden border-4 border-[#00839a] shadow-inner bg-slate-950 relative flex items-center justify-center">
                <img
                  src={rawImageSrc}
                  alt="Crop preview"
                  style={{
                    transform: `translate(${offsetX * 2}px, ${offsetY * 2}px) scale(${zoom}) rotate(${rotation}deg)`,
                    transition: 'transform 0.05s ease-out',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    pointerEvents: 'none'
                  }}
                />
                {/* Circular guideline grid */}
                <div className="absolute inset-0 border border-white/20 rounded-full pointer-events-none" />
              </div>
            </div>

            {/* Adjustment Sliders */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 text-xs">
              
              {/* Zoom Slider */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold text-slate-600">
                  <span className="flex items-center gap-1"><MdZoomIn size={14} /> Zoom / Scale</span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="2.5"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full accent-[#00839a] cursor-pointer"
                />
              </div>

              {/* Offset X Slider */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold text-slate-600">
                  <span>Horizontal Pan (X)</span>
                  <span>{offsetX}px</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="1"
                  value={offsetX}
                  onChange={(e) => setOffsetX(parseInt(e.target.value, 10))}
                  className="w-full accent-[#00839a] cursor-pointer"
                />
              </div>

              {/* Offset Y Slider */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold text-slate-600">
                  <span>Vertical Pan (Y)</span>
                  <span>{offsetY}px</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="1"
                  value={offsetY}
                  onChange={(e) => setOffsetY(parseInt(e.target.value, 10))}
                  className="w-full accent-[#00839a] cursor-pointer"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => { setZoom(1); setOffsetX(0); setOffsetY(0); setRotation(0); }}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <MdRefresh size={14} /> Reset Frame
                </button>
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="text-[11px] font-bold text-[#00839a] hover:text-[#006e82] cursor-pointer"
                >
                  Rotate 90°
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAdjustModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyAdjustment}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#083058] hover:bg-[#0c4a6e] transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <MdCheckCircle size={16} />
                <span>Apply &amp; Set Picture</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
