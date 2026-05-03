import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Clock, CheckCircle, Search, Ticket as TicketIcon, LayoutGrid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CustomerPortal = () => {
  const [tickets, setTickets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTicket, setNewTicket] = useState({ title: '', description: '', category: 'Technical', priority_id: 2 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tickets/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTickets(res.data);
    } catch (err) {
      toast.error("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/tickets/', newTicket, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setShowModal(false);
      setNewTicket({ title: '', description: '', category: 'Technical', priority_id: 2 });
      fetchTickets();
      toast.success("Ticket raised successfully!");
    } catch (err) {
      toast.error("Failed to create ticket");
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden glass-card p-10 bg-gradient-to-br from-indigo-600/20 to-transparent border-indigo-500/10"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Need assistance? We're <span className="gradient-text">here to help.</span>
            </h2>
            <p className="text-slate-400 text-lg">
              Track your ongoing requests or open a new support ticket. Our team usually responds within a few hours.
            </p>
            <button 
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              <Plus className="h-5 w-5" /> Open New Request
            </button>
          </div>
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full"></div>
              <TicketIcon className="h-48 w-48 text-indigo-500/40 animate-float" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Requests', value: tickets.length, icon: LayoutGrid, color: 'indigo' },
          { label: 'Active Support', value: tickets.filter(t => t.status !== 'Resolved').length, icon: Clock, color: 'amber' },
          { label: 'Resolved', value: tickets.filter(t => t.status === 'Resolved').length, icon: CheckCircle, color: 'emerald' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 flex items-center justify-between group"
          >
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-bold text-white mt-2 group-hover:gradient-text transition-all">{stat.value}</h3>
            </div>
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center bg-${stat.color}-500/10 text-${stat.color}-400 group-hover:scale-110 transition-transform`}>
              <stat.icon className="h-7 w-7" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tickets Interface */}
      <div className="glass-card overflow-hidden">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/2">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <List className="h-5 w-5 text-indigo-400" /> Recent Activities
          </h3>
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Filter by subject or category..."
              className="glass-input pl-11 py-3 w-full text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/2 text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Issue Details</th>
                <th className="px-8 py-5">Current Status</th>
                <th className="px-8 py-5">Priority</th>
                <th className="px-8 py-5">Raised On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence>
                {loading ? (
                   <tr><td colSpan="4" className="px-8 py-20 text-center text-slate-600">Initializing your portal...</td></tr>
                ) : filteredTickets.length === 0 ? (
                  <tr><td colSpan="4" className="px-8 py-20 text-center text-slate-600">No matching requests found.</td></tr>
                ) : filteredTickets.map((ticket, i) => (
                  <motion.tr 
                    key={ticket.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => navigate(`/ticket/${ticket.id}`)}
                    className="hover:bg-white/5 transition-all cursor-pointer group"
                  >
                    <td className="px-8 py-6">
                      <div className="font-bold text-white group-hover:text-indigo-400 transition-colors">#{ticket.id} {ticket.title}</div>
                      <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-white/5 rounded-md">{ticket.category}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`status-badge ${
                        ticket.status === 'Resolved' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                        ticket.status === 'In Progress' ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' :
                        'text-amber-400 bg-amber-500/10 border-amber-500/20'
                      }`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${ticket.status === 'In Progress' ? 'bg-indigo-400 animate-pulse' : 'bg-current'}`}></div>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-medium text-slate-300">{ticket.priority}</div>
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-500">
                      {new Date(ticket.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* New Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card w-full max-w-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">Create New Request</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors">
                <Plus className="h-8 w-8 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Department / Category</label>
                  <select 
                    className="glass-input w-full"
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                  >
                    <option value="Technical">Technical Issue</option>
                    <option value="Billing">Billing & Account</option>
                    <option value="Feature">Feature Request</option>
                    <option value="General">General Inquiry</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Urgency Level</label>
                  <select 
                    className="glass-input w-full"
                    value={newTicket.priority_id}
                    onChange={(e) => setNewTicket({...newTicket, priority_id: parseInt(e.target.value)})}
                  >
                    <option value="1">Low - General Question</option>
                    <option value="2">Medium - Minor Bug</option>
                    <option value="3">High - Production Issue</option>
                    <option value="4">Urgent - System Critical</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Subject</label>
                <input 
                  type="text" 
                  required
                  className="glass-input w-full"
                  placeholder="Summarize the issue in a few words"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Full Description</label>
                <textarea 
                  rows="4"
                  required
                  className="glass-input w-full resize-none"
                  placeholder="Please provide as much detail as possible..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                ></textarea>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Submit Request</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CustomerPortal;
