import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  Clock, 
  User, 
  Calendar, 
  Tag, 
  Shield, 
  CheckCircle,
  AlertCircle,
  History,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  const fetchTicketDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/tickets/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTicket(res.data);
    } catch (err) {
      toast.error("Failed to load ticket details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await axios.post(`http://localhost:5000/api/tickets/${id}/comments`, 
        { message: newComment },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      setNewComment('');
      fetchTicketDetails();
      toast.success("Comment added");
    } catch (err) {
      toast.error("Failed to add comment");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'In Progress': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Open': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Loading details...</div>;
  if (!ticket) return <div className="p-10 text-center text-slate-500">Ticket not found</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8 pb-20"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" /> Back to Portal
        </button>
        <div className="flex items-center gap-4">
           <span className={`status-badge ${getStatusColor(ticket.status)}`}>
            {ticket.status === 'Resolved' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
            {ticket.status}
          </span>
          <span className="text-slate-500 text-sm">Ticket ID: #{ticket.id}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-8">
            <h1 className="text-3xl font-bold text-white mb-4">{ticket.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-8 border-b border-white/5 pb-6">
              <div className="flex items-center gap-2"><User className="h-4 w-4" /> {ticket.customer}</div>
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {new Date(ticket.created_at).toLocaleString()}</div>
              <div className="flex items-center gap-2"><Tag className="h-4 w-4" /> {ticket.category}</div>
              <div className="flex items-center gap-2"><Shield className="h-4 w-4" /> {ticket.priority} Priority</div>
            </div>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>

          {/* Comments Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-400" /> Discussion
            </h3>
            
            <form onSubmit={handleAddComment} className="glass-card p-6 flex flex-col gap-4">
              <textarea 
                className="bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-600 resize-none w-full min-h-[100px]"
                placeholder="Type your reply here..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <div className="flex justify-end">
                <button type="submit" className="btn-primary py-2 px-6 text-sm">
                  <Send className="h-4 w-4" /> Reply
                </button>
              </div>
            </form>

            <div className="space-y-4">
              <AnimatePresence>
                {ticket.comments.map((comment, i) => (
                  <motion.div 
                    key={comment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`glass-card p-6 ${comment.role === 'customer' ? 'border-l-4 border-indigo-500/50' : 'border-l-4 border-violet-500/50'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{comment.user_name}</span>
                        <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 bg-white/5 rounded text-slate-500 font-bold">{comment.role}</span>
                      </div>
                      <span className="text-xs text-slate-500">{new Date(comment.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{comment.message}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          {/* SLA Tracking */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-400" /> SLA Monitor
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Due By</span>
                <span className="text-white font-medium">{new Date(ticket.due_time).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Current Status</span>
                <span className={`font-bold ${ticket.sla_status === 'Breached' ? 'text-red-400' : 'text-green-400'}`}>
                  {ticket.sla_status}
                </span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${ticket.sla_status === 'Breached' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'}`}
                  style={{ width: ticket.sla_status === 'Breached' ? '100%' : '40%' }}
                />
              </div>
            </div>
          </div>

          {/* Assigned Agent */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-400" /> Assignment
            </h3>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold">
                {ticket.agent ? ticket.agent[0] : '?'}
              </div>
              <div>
                <div className="text-white font-medium">{ticket.agent || 'Unassigned'}</div>
                <div className="text-xs text-slate-500">Support Representative</div>
              </div>
            </div>
          </div>

          {/* History Log */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <History className="h-5 w-5 text-indigo-400" /> Audit Log
            </h3>
            <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/5">
              {ticket.history.map((log, i) => (
                <div key={i} className="pl-6 relative">
                  <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  </div>
                  <div className="text-sm text-white font-medium">{log.action}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">By {log.user} • {new Date(log.time).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TicketDetails;
