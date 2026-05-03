import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { LayoutDashboard, TrendingUp, Users, Activity, Clock, CheckCircle, AlertTriangle, LifeBuoy, Ticket, Plus, Database, Server, Zap, FileText } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Overview = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      
      if (user.role === 'admin') {
        const [statsRes, analyticsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/stats', { headers }),
          axios.get('http://localhost:5000/api/dashboard/admin-analytics', { headers })
        ]);
        setData({ stats: statsRes.data, analytics: analyticsRes.data });
      } else if (user.role === 'agent') {
        const res = await axios.get('http://localhost:5000/api/dashboard/agent-stats', { headers });
        setData(res.data);
      } else if (user.role === 'customer') {
        const res = await axios.get('http://localhost:5000/api/tickets/', { headers });
        setData({ tickets: res.data });
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const renderAdminDashboard = () => {
    if (!data) return null;
    const { stats, analytics } = data;
    const statCards = [
      { label: 'Total Tickets', value: stats.total, icon: Activity, color: 'indigo' },
      { label: 'Resolved Today', value: analytics.resolved_today || 0, icon: CheckCircle, color: 'emerald' },
      { label: 'Open Tickets', value: stats.open, icon: Clock, color: 'amber' },
      { label: 'SLA Compliance', value: `${analytics.sla_compliance_rate || 100}%`, icon: TrendingUp, color: 'fuchsia' },
    ];

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="glass-card p-8 group hover:bg-white/5">
              <div className={`h-12 w-12 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-400 mb-6 group-hover:scale-110 transition-transform`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-bold text-white mt-2">{stat.value}</h3>
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 glass-card p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
               <AlertTriangle className="h-5 w-5 text-rose-400" /> Breached SLA Tickets
            </h3>
            {analytics.breached_tickets && analytics.breached_tickets.length > 0 ? (
              <div className="space-y-3">
                {analytics.breached_tickets.map(t => (
                  <div key={t.id} className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white">#{t.id}</span>
                      <span className="ml-2 text-slate-300">{t.title}</span>
                    </div>
                    <span className="text-xs font-bold text-rose-400 uppercase">Breached</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500">No breached tickets. Great job!</div>
            )}
          </div>
          <div className="glass-card p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
               <Activity className="h-5 w-5 text-indigo-400" /> Ticket Categories
            </h3>
            <div className="space-y-4">
              {stats.categories && stats.categories.map((c, i) => (
                <div key={i} className="flex justify-between items-center p-3 hover:bg-white/5 rounded-xl transition-colors">
                  <span className="text-slate-300 font-medium">{c.category}</span>
                  <span className="px-3 py-1 bg-white/10 rounded-lg text-white font-bold">{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderAgentDashboard = () => {
    if (!data) return null;
    const { by_status, by_priority, unassigned_total } = data;
    
    // Safely parse counts
    const inProgress = by_status['In Progress'] || 0;
    const openAssigned = by_status['Open'] || 0;
    const resolved = by_status['Resolved'] || 0;
    const urgent = by_priority['Urgent'] || 0;

    const statCards = [
      { label: 'Unassigned Open', value: unassigned_total, icon: AlertTriangle, color: 'rose' },
      { label: 'My In Progress', value: inProgress, icon: Activity, color: 'indigo' },
      { label: 'My Open', value: openAssigned, icon: Clock, color: 'amber' },
      { label: 'My Resolved', value: resolved, icon: CheckCircle, color: 'emerald' },
    ];

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="glass-card p-8 group hover:bg-white/5">
              <div className={`h-12 w-12 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-400 mb-6 group-hover:scale-110 transition-transform`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-bold text-white mt-2">{stat.value}</h3>
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
           <div className="glass-card p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
               <TrendingUp className="h-5 w-5 text-indigo-400" /> My Workload by Priority
            </h3>
             <div className="space-y-4">
               {Object.entries(by_priority).map(([priority, count], i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                   <span className="font-bold text-slate-300">{priority}</span>
                   <span className={`px-4 py-1 rounded-lg font-bold ${
                     priority.includes('Urgent') ? 'bg-rose-500/20 text-rose-400' :
                     priority.includes('High') ? 'bg-amber-500/20 text-amber-400' :
                     'bg-indigo-500/20 text-indigo-400'
                   }`}>{count}</span>
                 </div>
               ))}
               {Object.keys(by_priority).length === 0 && (
                 <div className="text-center py-6 text-slate-500">No tickets currently assigned.</div>
               )}
             </div>
           </div>
        </div>
      </>
    );
  };

  const renderCustomerDashboard = () => {
    if (!data) return null;
    const tickets = data.tickets || [];
    const activeCount = tickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed').length;
    const resolvedCount = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

    const statCards = [
      { label: 'Total Requests', value: tickets.length, icon: Ticket, color: 'indigo' },
      { label: 'Active Requests', value: activeCount, icon: Clock, color: 'amber' },
      { label: 'Resolved Requests', value: resolvedCount, icon: CheckCircle, color: 'emerald' },
    ];

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="glass-card p-8 group hover:bg-white/5">
              <div className={`h-12 w-12 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-400 mb-6 group-hover:scale-110 transition-transform`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-bold text-white mt-2">{stat.value}</h3>
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
           <div className="lg:col-span-2 glass-card p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
               <Activity className="h-5 w-5 text-indigo-400" /> Recent Activity
            </h3>
             <div className="space-y-3">
               {tickets.slice(0, 5).map((t, i) => (
                 <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center">
                   <div>
                     <div className="font-bold text-white">{t.title}</div>
                     <div className="text-xs text-slate-500 mt-1">{new Date(t.created_at).toLocaleString()}</div>
                   </div>
                   <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                     t.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400' :
                     t.status === 'In Progress' ? 'bg-indigo-500/10 text-indigo-400' :
                     'bg-amber-500/10 text-amber-400'
                   }`}>{t.status}</span>
                 </div>
               ))}
               {tickets.length === 0 && (
                 <div className="text-center py-10 text-slate-500">You haven't raised any requests yet.</div>
               )}
             </div>
           </div>
           <div className="glass-card p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
               <LifeBuoy className="h-5 w-5 text-indigo-400" /> Need Help?
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              You can track and manage all your support interactions from the "My Support" portal.
            </p>
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <div className="text-indigo-400 font-bold text-sm mb-1">Response Times</div>
              <div className="text-slate-300 text-xs">Urgent: &lt; 4 hours<br/>High: &lt; 8 hours<br/>Normal: 24-48 hours</div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="space-y-10 h-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-12 bg-gradient-to-br from-indigo-600/10 via-transparent to-transparent"
      >
        <div className="max-w-3xl">
          <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
            Welcome back, <span className="gradient-text">{user.name}</span>
          </h2>
          <p className="text-slate-400 text-xl leading-relaxed mb-8">
            You are currently logged in as an <span className="text-indigo-400 font-bold uppercase tracking-widest text-sm ml-1">{user.role}</span>. 
            Here's your customized overview for today.
          </p>
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 text-sm font-bold">
              System Online
            </div>
            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-bold">
              Database Synced
            </div>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          {user.role === 'admin' && renderAdminDashboard()}
          {user.role === 'agent' && renderAgentDashboard()}
          {user.role === 'customer' && renderCustomerDashboard()}
        </>
      )}
    </div>
  );
};

export default Overview;
