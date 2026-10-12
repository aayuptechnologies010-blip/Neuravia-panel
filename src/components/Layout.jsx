import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { 
  MdDashboard, 
  MdEventNote, 
  MdPsychology, 
  MdMailOutline, 
  MdLocalOffer, 
  MdLogout, 
  MdMenu, 
  MdClose,
  MdShield,
  MdAccountCircle,
  MdBarChart
} from 'react-icons/md';
import Swal from 'sweetalert2';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(() => {
    return JSON.parse(localStorage.getItem('neuravia_admin_user') || '{"name":"Admin"}');
  });
  const navigate = useNavigate();

  const resolveImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('/uploads/')) {
      const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
      return `${apiBase}${url}`;
    }
    return url;
  };

  useEffect(() => {
    const handleProfileSync = () => {
      const updated = JSON.parse(localStorage.getItem('neuravia_admin_user') || '{"name":"Admin"}');
      setAdminUser(updated);
    };

    window.addEventListener('admin_profile_updated', handleProfileSync);
    window.addEventListener('storage', handleProfileSync);

    return () => {
      window.removeEventListener('admin_profile_updated', handleProfileSync);
      window.removeEventListener('storage', handleProfileSync);
    };
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: 'Sign out?',
      text: 'Are you sure you want to exit the management panel?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#083058',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Sign Out'
    }).then((res) => {
      if (res.isConfirmed) {
        localStorage.removeItem('neuravia_admin_token');
        localStorage.removeItem('neuravia_admin_user');
        navigate('/login');
      }
    });
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: MdDashboard },
    { label: 'Reports & Analytics', path: '/reports', icon: MdBarChart },
    { label: 'Bookings', path: '/bookings', icon: MdEventNote },
    { label: 'Therapists', path: '/therapists', icon: MdPsychology },
    { label: 'Enquiries', path: '/enquiries', icon: MdMailOutline },
    { label: 'Plans & Pricing', path: '/plans', icon: MdLocalOffer },
    { label: 'Admin Profile', path: '/profile', icon: MdAccountCircle }
  ];

  return (
    <div className="min-h-screen bg-[#fbfdfc] flex font-sans text-slate-800">
      
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed lg:sticky top-0 h-screen w-64 bg-white border-r border-slate-200 z-50 flex flex-col transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Brand Logo & Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Neuravia" 
              className="h-10 w-auto object-contain" 
            />
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="lg:hidden text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <MdClose size={22} />
          </button>
        </div>

        {/* Links Navigation */}
        <nav className="p-4 flex-1 space-y-1.5 overflow-y-auto">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Main Management
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-[#083058] text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#083058]'
                }`}
              >
                <Icon size={20} className="shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Admin User Footer Box */}
        <div className="p-4 border-t border-slate-100 bg-[#fbfdfc]">
          <Link 
            to="/profile" 
            className="flex items-center justify-between mb-3 px-1 py-1 rounded-xl hover:bg-slate-100/70 transition-colors group"
            title="Edit Profile"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {adminUser.avatar ? (
                <img 
                  src={resolveImageUrl(adminUser.avatar)} 
                  alt={adminUser.name} 
                  className="w-9 h-9 rounded-full object-cover border border-[#00839a]/30 shrink-0" 
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#00839a]/10 text-[#00839a] flex items-center justify-center font-bold text-xs shrink-0">
                  <MdShield size={18} />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#083058] group-hover:text-[#00839a] truncate transition-colors">
                  {adminUser.name || 'Admin'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{adminUser.email || 'care@neuravia.in'}</p>
              </div>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <MdLogout size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 z-30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <MdMenu size={24} />
            </button>
            <span className="text-xs font-bold text-[#00839a] bg-[#00839a]/10 px-3 py-1 rounded-full uppercase tracking-wider">
              Control Center
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href="https://www.theneuravia.com"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex text-xs font-semibold text-[#083058] hover:text-[#00839a] bg-slate-50 hover:bg-slate-100 px-3.5 py-1.5 rounded-lg border border-slate-200 transition-colors"
            >
              View Live Website &rarr;
            </a>

            <Link
              to="/profile"
              className="flex items-center gap-2 p-1 pl-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-colors cursor-pointer"
              title="Admin Profile"
            >
              <span className="text-xs font-bold text-[#083058] pr-1 hidden md:inline">
                {adminUser.name || 'Admin'}
              </span>
              {adminUser.avatar ? (
                <img 
                  src={resolveImageUrl(adminUser.avatar)} 
                  alt={adminUser.name} 
                  className="w-7 h-7 rounded-full object-cover border border-[#00839a]/40" 
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#083058] text-white flex items-center justify-center font-bold text-xs">
                  {adminUser.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
                </div>
              )}
            </Link>
          </div>
        </header>

        {/* Dynamic Page Views */}
        <main className="p-6 sm:p-8 flex-1 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
