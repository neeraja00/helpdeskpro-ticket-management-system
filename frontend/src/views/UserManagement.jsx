import React, { useState, useEffect } from 'react';
import { Users, Trash2, Plus, Mail, Shield, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user: currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(res.data);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (userId === currentUser.id) return toast.error("Cannot delete your own account");
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/users', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success("User created successfully!");
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'customer' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to create user");
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-2xl p-6 glass-card">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="h-10 w-10 bg-violet-500/20 rounded-xl flex items-center justify-center">
              <Users className="h-5 w-5 text-violet-400" />
            </div>
            User Management
          </h2>
          <p className="text-slate-400 text-sm mt-1">Manage system users, agents, and administrators.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" /> Add New User
        </button>
      </div>

      <div className="glass-card flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-sm uppercase tracking-widest text-slate-400">
                <th className="p-4 font-bold">User</th>
                <th className="p-4 font-bold">Email</th>
                <th className="p-4 font-bold">Role</th>
                <th className="p-4 font-bold">Joined</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">Loading users...</td>
                </tr>
              ) : users.map(u => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-bold text-white">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-300">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      u.role === 'admin' ? 'bg-rose-500/20 text-rose-400' :
                      u.role === 'agent' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-indigo-500/20 text-indigo-400'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 text-sm">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(u.id)}
                      disabled={u.id === currentUser.id}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1e293b] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-slate-500 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
              
              <h3 className="text-2xl font-bold text-white mb-6">Create New User</h3>
              
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="user@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Temporary Password</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input 
                      type="password" 
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">System Role</label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                  >
                    <option value="customer" className="bg-[#1e293b]">Customer</option>
                    <option value="agent" className="bg-[#1e293b]">Agent</option>
                    <option value="admin" className="bg-[#1e293b]">Administrator</option>
                  </select>
                </div>

                <button type="submit" className="btn-primary w-full py-4 mt-4">
                  Create User Account
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;
