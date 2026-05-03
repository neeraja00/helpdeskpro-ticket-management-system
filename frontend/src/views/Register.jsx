import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserPlus, Shield, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'customer' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      toast.success("Account created successfully! Please login.");
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.msg || "Registration failed");
    }
  };

  return (
    <div className="h-screen overflow-y-auto flex items-center justify-center p-6 auth-bg custom-scrollbar">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[500px]"
      >
        <div className="mb-8">
          <Link to="/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to Login
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Join HelpDesk<span className="gradient-text">Pro</span></h1>
          <p className="text-slate-400">Start managing your support requests professionally</p>
        </div>

        <div className="glass-card p-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input 
                  type="text" required className="glass-input w-full pl-12"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input 
                  type="email" required className="glass-input w-full pl-12"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input 
                  type="password" required className="glass-input w-full pl-12"
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" className="btn-primary w-full py-4">
                <UserPlus className="h-5 w-5" /> Create My Account
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-slate-500 text-sm">
            By registering, you agree to our <a href="#" className="text-indigo-400 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-400 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
