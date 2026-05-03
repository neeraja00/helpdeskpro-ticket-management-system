import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Filter, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  UserCheck, 
  MessageSquare,
  ChevronRight,
  RefreshCcw,
  Search,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AgentPortal = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ by_status: {}, by_priority: {} });
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      const [ticketsRes, statsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/tickets/', config),
        axios.get('http://localhost:5000/api/dashboard/agent-stats', config)
      ]);
      setTickets(ticketsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      toast.error("Failed to sync queue");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.patch(`http://localhost:5000/api/tickets/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchData();
      toast.success(`Ticket status updated to ${status}`);
    } catch (err) {
      toast.error("Status update failed");
    }
  };



  const filteredTickets = tickets.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.id.toString().includes(search)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            Service Queue <Activity className="h-6 w-6 text-indigo-500 animate-pulse" />
          </h2>
          <p className="text-slate-500">Monitor and resolve high-priority customer requests</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
             <input 
              type="text" 
              placeholder="Search queue..."
              className="glass-input pl-10 py-2.5 w-full text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button onClick={fetchData} className="btn-secondary py-2.5 px-4">
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Assigned', value: tickets.length, icon: Clock, color: 'amber' },
          { label: 'In Progress', value: stats.by_status['In Progress'] || 0, icon: MessageSquare, color: 'indigo' },
          { label: 'High Priority', value: stats.by_priority['High'] || 0, icon: AlertTriangle, color: 'rose' },
          { label: 'Resolved Today', value: stats.by_status['Resolved'] || 0, icon: CheckCircle, color: 'emerald' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
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

      {/* Queue Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                <th className="px-8 py-5">Ticket Info</th>
                <th className="px-8 py-5">Lifecycle</th>
                <th className="px-8 py-5">Assigned To</th>
                <th className="px-8 py-5">SLA Deadline</th>
                <th className="px-8 py-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence>
                {loading && tickets.length === 0 ? (
                  <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-600">Scanning incoming requests...</td></tr>
                ) : filteredTickets.length === 0 ? (
                  <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-600">No tickets matching your filter.</td></tr>
                ) : filteredTickets.map((ticket, i) => (
                  <motion.tr 
                    key={ticket.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/5 transition-all group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0">
                          #{ticket.id}
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-indigo-400 transition-colors">{ticket.title}</div>
                          <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                            {ticket.category} • {ticket.customer_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <select 
                        className="bg-slate-800/50 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={ticket.status}
                        onChange={(e) => handleUpdateStatus(ticket.id, e.target.value)}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2">
                        {ticket.agent_name !== 'Unassigned' ? (
                          <>
                            <div className="h-6 w-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] text-indigo-400 font-bold">
                              {ticket.agent_name[0]}
                            </div>
                            <span className="text-sm text-slate-300">{ticket.agent_name}</span>
                          </>
                        ) : (
                          <span className="text-xs text-slate-600 italic">No agent</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md w-fit mb-1 ${
                          ticket.sla_status === 'Breached' ? 'bg-rose-500/20 text-rose-400' :
                          ticket.sla_status === 'Hit' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-indigo-500/20 text-indigo-400'
                        }`}>
                          {ticket.sla_status || 'Pending'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Due: {new Date(ticket.due_time).toLocaleDateString()} {new Date(ticket.due_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">

                        <button 
                          onClick={() => navigate(`/ticket/${ticket.id}`)}
                          className="p-2 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgentPortal;
