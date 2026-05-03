import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  Ticket as TicketIcon, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Plus,
  Trash2,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'agent' });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      const [statsRes, usersRes, ticketsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/stats', config),
        axios.get('http://localhost:5000/api/admin/users', config),
        axios.get('http://localhost:5000/api/tickets/', config)
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setTickets(ticketsRes.data);
    } catch (err) {
      toast.error("Failed to load administrative data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/users', newUser, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setShowAddUser(false);
      setNewUser({ name: '', email: '', password: '', role: 'agent' });
      fetchAdminData();
      toast.success("User created successfully");
    } catch (err) {
      toast.error("Failed to create user");
    }
  };

  const handleAssignTicket = async (ticketId, agentId) => {
    if (!agentId) return;
    try {
      await axios.patch(`http://localhost:5000/api/tickets/${ticketId}/assign`, { agent_id: agentId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchAdminData();
      toast.success("Ticket assigned successfully");
    } catch (err) {
      toast.error("Failed to assign ticket");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchAdminData();
      toast.success("User deleted successfully");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to delete user");
    }
  };

  if (loading && !stats) return <div className="p-10 text-center text-slate-500">Accessing Admin Control Panel...</div>;

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Admin Command Center</h2>
          <p className="text-slate-500">System-wide monitoring and resource management</p>
        </div>
        <button 
          onClick={() => setShowAddUser(true)}
          className="btn-primary"
        >
          <UserPlus className="h-5 w-5" /> Provision User
        </button>
      </div>

      {/* High Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {[
          { label: 'Total Tickets', value: stats?.total, icon: TicketIcon, color: 'indigo' },
          { label: 'Staff Members', value: users.filter(u => u.role !== 'customer').length, icon: ShieldCheck, color: 'violet' },
          { label: 'Customers', value: users.filter(u => u.role === 'customer').length, icon: Users, color: 'sky' },
          { label: 'SLA Performance', value: stats ? `${((stats.sla.hit / (stats.sla.hit + stats.sla.breached || 1)) * 100).toFixed(1)}%` : '0.0%', icon: TrendingUp, color: 'emerald' },
          { label: 'Active Issues', value: stats?.open, icon: AlertCircle, color: 'amber' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6"
          >
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center bg-${stat.color}-500/10 text-${stat.color}-400 mb-4`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Chart */}
        <div className="glass-card p-8">
          <h3 className="text-xl font-bold text-white mb-6">Distribution by Category</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.categories}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SLA Pie Chart */}
        <div className="glass-card p-8">
          <h3 className="text-xl font-bold text-white mb-6">SLA Fulfillment</h3>
          <div className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Hit', value: stats?.sla.hit },
                    { name: 'Breached', value: stats?.sla.breached }
                  ]}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#f43f5e" />
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
               <span className="text-2xl font-bold text-white">{stats?.sla.hit + stats?.sla.breached}</span>
               <span className="text-[10px] text-slate-500 uppercase tracking-widest">Audited</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/2">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-400" /> Identity Management
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                <th className="px-8 py-5">Identity</th>
                <th className="px-8 py-5">Email Address</th>
                <th className="px-8 py-5">Access Role</th>
                <th className="px-8 py-5">Joined On</th>
                <th className="px-8 py-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 font-bold text-xs">
                        {u.name[0]}
                      </div>
                      <div className="text-white font-medium">{u.name}</div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-400">{u.email}</td>
                  <td className="px-8 py-6">
                    <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded border ${
                      u.role === 'admin' ? 'text-violet-400 border-violet-500/20 bg-violet-500/10' :
                      u.role === 'agent' ? 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10' :
                      'text-slate-400 border-slate-500/20 bg-slate-500/10'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-500">{new Date(u.created_at).toLocaleString()}</td>
                  <td className="px-8 py-6">
                     <button 
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete User"
                     >
                        <Trash2 className="h-4 w-4" />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Assignment Queue Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/2">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <TicketIcon className="h-5 w-5 text-indigo-400" /> Ticket Assignment Queue
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                <th className="px-8 py-5">Ticket Info</th>
                <th className="px-8 py-5">Customer</th>
                <th className="px-8 py-5">Priority</th>
                <th className="px-8 py-5">Assigned Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {tickets.map((t) => {
                const currentAgent = users.find(u => u.name === t.agent_name);
                return (
                  <tr key={t.id} className="hover:bg-white/5 transition-all group">
                    <td className="px-8 py-6">
                      <div className="font-bold text-white">#{t.id} - {t.title}</div>
                      <div className="text-xs text-slate-500 mt-1">{t.category}</div>
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-400">{t.customer_name}</td>
                    <td className="px-8 py-6">
                      <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded border ${
                        t.priority === 'High' ? 'text-rose-400 border-rose-500/20 bg-rose-500/10' :
                        t.priority === 'Medium' ? 'text-amber-400 border-amber-500/20 bg-amber-500/10' :
                        'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <select 
                        className="bg-slate-800/50 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={currentAgent ? currentAgent.id : ''}
                        onChange={(e) => handleAssignTicket(t.id, e.target.value)}
                      >
                        <option value="">-- Unassigned --</option>
                        {users.filter(u => u.role === 'agent').map(agent => (
                          <option key={agent.id} value={agent.id}>{agent.name}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card w-full max-w-md overflow-hidden"
          >
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">Provision Account</h3>
              <button onClick={() => setShowAddUser(false)} className="text-slate-500 hover:text-white">
                <Plus className="h-8 w-8 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-8 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Full Name</label>
                <input 
                  type="text" required className="glass-input w-full py-3"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Email Address</label>
                <input 
                  type="email" required className="glass-input w-full py-3"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Temporary Password</label>
                <input 
                  type="password" required className="glass-input w-full py-3"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Access Level</label>
                <select 
                  className="glass-input w-full py-3"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="agent">Support Agent</option>
                  <option value="admin">System Admin</option>
                  <option value="customer">Customer</option>
                </select>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowAddUser(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Create User</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
