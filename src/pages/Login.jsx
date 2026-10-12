import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/client';
import toast from 'react-hot-toast';
import { MdLock, MdMail, MdArrowForward, MdVisibility, MdVisibilityOff } from 'react-icons/md';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('neuravia_admin_token', res.data.token);
        localStorage.setItem('neuravia_admin_user', JSON.stringify(res.data.admin));
        toast.success(`Welcome back, ${res.data.admin.name}!`);
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfdfc] flex items-center justify-center p-4 text-slate-800">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
        
        {/* Soft Background Accents */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#00839a]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#083058]/5 rounded-full blur-2xl pointer-events-none" />

        {/* Brand Icon */}
        <div className="text-center mb-8">
          <img 
            src="/logo.png" 
            alt="Neuravia" 
            className="h-12 w-auto mx-auto object-contain mb-4" 
          />
          <h1 className="text-xl font-bold text-[#083058] tracking-tight">Management Portal</h1>
          <p className="text-xs text-slate-500 mt-1">Sign in with your administrator credentials</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Admin Email
            </label>
            <div className="relative">
              <MdMail className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@neuravia.in"
                required
                className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <MdLock className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-11 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00839a] focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors p-0.5 focus:outline-none"
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-[#083058] hover:bg-[#0c4a6e] transition-all shadow-md disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Panel'}</span>
              <MdArrowForward size={18} />
            </button>
          </div>
        </form>

      

      </div>
    </div>
  );
}
