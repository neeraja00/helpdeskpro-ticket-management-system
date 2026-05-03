import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Shield, ArrowRight, User, Users, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('customer'); // customer, agent, admin
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Optional: Pre-fill demo emails for easy testing based on tab
    if (tab === 'admin') setEmail('admin@helpdeskpro.com');
    else if (tab === 'agent') setEmail('agent@helpdeskpro.com');
    else setEmail('');
    setPassword(''); // clear password for security
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password, role: activeTab });
      login(res.data.access_token);
      toast.success("Login successful!");
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.msg || "Login failed");
    }
  };

  const tabs = [
    { id: 'customer', label: 'Customer', icon: User },
    { id: 'agent', label: 'Agent', icon: Users },
    { id: 'admin', label: 'Admin', icon: ShieldCheck }
  ];

  return (
    <div className="h-screen overflow-y-auto flex items-center justify-center p-6 auth-bg custom-scrollbar">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[450px]"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-indigo-600/20 mb-6 border border-indigo-500/20"
          >
            <Shield className="h-10 w-10 text-indigo-500" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-3">HelpDesk<span className="gradient-text">Pro</span></h1>
          <p className="text-slate-400">Enterprise Ticket Management System</p>
        </div>

        <div className="glass-card p-10">
          {/* Role Selection Tabs */}
          <div className="flex p-1 bg-white/5 rounded-2xl mb-8 relative">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 relative z-10 flex items-center justify-center gap-2 py-2.5 text-sm font-bold transition-colors rounded-xl ${
                  activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="loginTab"
                    className="absolute inset-0 bg-indigo-500 rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <tab.icon className="h-4 w-4" /> {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input 
                  type="email" 
                  required 
                  className="glass-input w-full pl-12"
                  placeholder={`${activeTab}@company.com`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input 
                  type="password" 
                  required 
                  className="glass-input w-full pl-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-4 mt-4">
              <LogIn className="h-5 w-5" /> Sign In as {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-slate-500 text-sm">
              Don't have an account? {' '}
              <Link to="/register" className="text-indigo-400 font-bold hover:text-indigo-300 inline-flex items-center gap-1 transition-all">
                Create one now <ArrowRight className="h-3 w-3" />
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-6 opacity-30 grayscale">
           <span className="text-xs font-bold tracking-widest text-white">SECURE</span>
           <span className="text-xs font-bold tracking-widest text-white">ENCRYPTED</span>
           <span className="text-xs font-bold tracking-widest text-white">24/7 SUPPORT</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
