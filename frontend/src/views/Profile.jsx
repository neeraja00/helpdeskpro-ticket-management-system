import React, { useState } from 'react';
import { User, Shield, Save, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  
  // Profile State
  const [profileData, setProfileData] = useState({ name: user.name, email: '' });
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put('http://localhost:5000/api/auth/profile', profileData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (passwordData.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    
    setLoading(true);
    try {
      await axios.put('http://localhost:5000/api/auth/profile', { password: passwordData.newPassword }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success("Password updated successfully!");
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full">
      {/* Left Sidebar Menu */}
      <div className="glass-card p-6 flex flex-col gap-2 h-fit">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 px-4">Account</h3>
        
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${
            activeTab === 'profile' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
          }`}
        >
          <User className="h-5 w-5" /> General Profile
        </button>
        
        <button 
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${
            activeTab === 'security' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
          }`}
        >
          <Lock className="h-5 w-5" /> Security
        </button>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-3 glass-card p-8">
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
               <User className="h-6 w-6 text-indigo-400" /> General Profile
            </h2>
            <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-lg">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Display Name</label>
                <input 
                  type="text" 
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  className="glass-input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Email Address (Optional Update)</label>
                <input 
                  type="email" 
                  value={profileData.email}
                  placeholder="Enter new email to update"
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  className="glass-input w-full"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-fit"
              >
                <Save className="h-5 w-5" /> Save Profile
              </button>
            </form>
          </motion.div>
        )}

        {activeTab === 'security' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
               <Lock className="h-6 w-6 text-indigo-400" /> Security Settings
            </h2>
            <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-lg">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">New Password</label>
                <input 
                  type="password" 
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="glass-input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Confirm New Password</label>
                <input 
                  type="password" 
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="glass-input w-full"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-fit"
              >
                <Shield className="h-5 w-5" /> Update Password
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Profile;
