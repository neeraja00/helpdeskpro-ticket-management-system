import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  LogOut, 
  LayoutDashboard, 
  Ticket, 
  BarChart3, 
  User,
  Bell,
  Search,
  Shield,
  LifeBuoy,
  Check,
  Book,
  Users,
  FileText,
  Settings,
  Palette,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  
  const themes = ['indigo', 'emerald', 'rose', 'amber'];
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('app-theme') || 'indigo');
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeRef = useRef(null);

  const [themeMode, setThemeMode] = useState(localStorage.getItem('app-theme-mode') || 'dark');
  
  useEffect(() => {
    document.body.setAttribute('data-theme', currentTheme);
    localStorage.setItem('app-theme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    document.body.setAttribute('data-mode', themeMode);
    localStorage.setItem('app-theme-mode', themeMode);
  }, [themeMode]);

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (themeRef.current && !themeRef.current.contains(event.target)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationRef, themeRef]);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/knowledge?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/notifications/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(`http://localhost:5000/api/notifications/read_all`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all as read");
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Overview', icon: LayoutDashboard, path: '/', roles: ['customer', 'agent', 'admin'] },
    { name: 'Knowledge Base', icon: Book, path: '/knowledge', roles: ['customer', 'agent', 'admin'] },
    { name: 'My Profile', icon: User, path: '/profile', roles: ['customer', 'agent', 'admin'] },
    { name: 'My Support', icon: LifeBuoy, path: '/customer', roles: ['customer'] },
    { name: 'Ticket Queue', icon: Ticket, path: '/agent', roles: ['agent'] },
    { name: 'System Analytics', icon: BarChart3, path: '/admin', roles: ['admin'] },
    { name: 'User Management', icon: Users, path: '/admin/users', roles: ['admin'] },
    { name: 'Performance Reports', icon: FileText, path: '/admin/reports', roles: ['admin'] },
    { name: 'System Settings', icon: Settings, path: '/admin/settings', roles: ['admin'] },
  ];

  const isActive = (path) => location.pathname === path;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="h-screen overflow-hidden bg-[#0b0f1a] text-slate-200 flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 flex flex-col glass z-20">
        <div className="p-8 flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Shield className="text-white h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">HelpDesk<span className="text-indigo-400">Pro</span></span>
        </div>

        <nav className="flex-1 px-6 space-y-2 mt-6">
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-4 ml-4">Main Menu</div>
          <div className="space-y-1 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
          {navItems.filter(item => item.roles.includes(user.role)).map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group relative ${
                isActive(item.path) 
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
                : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {isActive(item.path) && (
                <motion.div 
                  layoutId="activeNav"
                  className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full"
                />
              )}
              <item.icon className={`h-5 w-5 ${isActive(item.path) ? 'text-indigo-400' : 'group-hover:text-indigo-400 transition-colors'}`} />
              <span className="font-semibold text-sm">{item.name}</span>
            </button>
          ))}
          </div>
        </nav>

        <div className="p-6 mt-auto">
          <div className="glass-card p-4 mb-6 bg-gradient-to-br from-indigo-600/10 to-transparent">
            <p className="text-xs text-slate-500 mb-2">Need help with Pro?</p>
            <button onClick={() => navigate('/knowledge')} className="text-xs font-bold text-indigo-400 hover:text-indigo-300">View Documentation →</button>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 group"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-semibold text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[100px] animate-blob"></div>
          <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-violet-500/10 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-[10%] left-[20%] w-[45%] h-[45%] bg-fuchsia-500/10 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
        </div>

        {/* Topbar */}
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-10 bg-white/5 backdrop-blur-xl relative z-20">
          <div className="flex items-center gap-4">
            <div className="relative group hidden sm:block">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
               <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                placeholder="Global search..." 
                className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-2.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:w-80 transition-all"
               />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
              className="text-slate-400 hover:text-indigo-400 transition-colors relative flex items-center justify-center h-10 w-10 rounded-full hover:bg-white/5"
              title="Toggle Light/Dark Mode"
            >
              {themeMode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <div className="relative" ref={themeRef}>
              <button 
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="text-slate-400 hover:text-white transition-colors relative flex items-center justify-center h-10 w-10 rounded-full hover:bg-white/5"
              >
                <Palette className="h-5 w-5" />
              </button>
              
              <AnimatePresence>
                {showThemeMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-4 w-40 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-2"
                  >
                    <div className="px-3 py-2 mb-1 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">
                      Theme Color
                    </div>
                    {themes.map(t => (
                      <button 
                        key={t}
                        onClick={() => { setCurrentTheme(t); setShowThemeMenu(false); }}
                        className={`w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-xl text-sm font-semibold capitalize transition-colors ${currentTheme === t ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
                      >
                        <div className={`h-3 w-3 rounded-full bg-${t}-500 shadow-sm shadow-${t}-500/50`}></div>
                        {t}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications && unreadCount > 0) {
                    markAllAsRead();
                  }
                }}
                className="text-slate-400 hover:text-white transition-colors relative"
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-500 border-2 border-[#0b0f1a] rounded-full flex items-center justify-center text-[8px] text-white font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-4 w-80 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                      <h3 className="text-sm font-bold text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-full font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm">
                          You're all caught up!
                        </div>
                      ) : (
                        <div className="divide-y divide-white/5">
                          {notifications.map(notification => (
                            <div 
                              key={notification.id} 
                              className={`p-4 hover:bg-white/5 transition-colors cursor-pointer flex gap-4 ${!notification.is_read ? 'bg-indigo-500/5' : ''}`}
                              onClick={() => {
                                if (!notification.is_read) markAsRead(notification.id);
                                // For now, just navigate to home, or to a specific ticket if we parsed the ID
                              }}
                            >
                              <div className="mt-1">
                                {!notification.is_read ? (
                                  <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                                ) : (
                                  <Check className="h-3 w-3 text-slate-500" />
                                )}
                              </div>
                              <div>
                                <h4 className={`text-sm ${!notification.is_read ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>
                                  {notification.title}
                                </h4>
                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                  {notification.message}
                                </p>
                                <span className="text-[10px] text-slate-500 mt-2 block font-bold tracking-wider">
                                  {new Date(notification.created_at).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={() => navigate('/profile')} className="flex items-center gap-4 border-l border-white/10 pl-6 hover:opacity-80 transition-opacity text-left cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white">{user.name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{user.role}</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-violet-700 rounded-2xl flex items-center justify-center font-bold shadow-lg shadow-indigo-600/20" style={{ color: '#ffffff' }}>
                {user.name.charAt(0)}
              </div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <section className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-600/5 to-transparent pointer-events-none"></div>
          {children}
        </section>
      </main>
    </div>
  );
};

export default DashboardLayout;
