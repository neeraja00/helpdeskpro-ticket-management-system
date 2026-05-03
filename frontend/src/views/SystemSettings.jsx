import React, { useState, useEffect } from 'react';
import { User, Shield, Clock, Save, Activity, CheckCircle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const SystemSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('sla');
  const [loading, setLoading] = useState(false);
  
  // SLA State
  const [slaConfig, setSlaConfig] = useState([]);

  useEffect(() => {
    fetchSLAConfig();
  }, []);

  const fetchSLAConfig = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/sla-config', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSlaConfig(res.data);
    } catch (err) {
      console.error("Failed to fetch SLA config");
    }
  };



  const handleSLAUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updates = slaConfig.map(c => ({ id: c.id, sla_hours: c.sla_hours }));
      await axios.put('http://localhost:5000/api/admin/sla-config', { updates }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success("SLA settings updated successfully!");
    } catch (err) {
      toast.error("Failed to update SLA settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full">
      {/* Left Sidebar Menu */}
      <div className="glass-card p-6 flex flex-col gap-2 h-fit">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 px-4">Settings Menu</h3>
        

        
        {user.role === 'admin' && (
          <button 
            onClick={() => setActiveTab('sla')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${
              activeTab === 'sla' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            <Clock className="h-5 w-5" /> SLA Configuration
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-3 glass-card p-8">


        {activeTab === 'sla' && user.role === 'admin' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
               <Clock className="h-6 w-6 text-indigo-400" /> SLA Configuration
            </h2>
            <p className="text-slate-400 mb-8 max-w-2xl">
              Configure the Service Level Agreement (SLA) target resolution times in hours for different ticket priorities. 
              Agents will see warnings when these times are approaching.
            </p>
            <form onSubmit={handleSLAUpdate} className="space-y-4 max-w-2xl">
              {slaConfig.map((config, index) => (
                <div key={config.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold keep-white ${
                      config.priority_name === 'Urgent' ? 'bg-rose-500' :
                      config.priority_name === 'High' ? 'bg-amber-500' :
                      config.priority_name === 'Normal' ? 'bg-emerald-500' : 'bg-slate-500'
                    }`}>
                      {config.priority_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{config.priority_name} Priority</h4>
                      <p className="text-xs text-slate-400">Target Resolution Time</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" 
                      min="1"
                      value={config.sla_hours}
                      onChange={(e) => {
                        const newConfig = [...slaConfig];
                        newConfig[index].sla_hours = e.target.value;
                        setSlaConfig(newConfig);
                      }}
                      className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    <span className="text-sm font-bold text-slate-400">Hours</span>
                  </div>
                </div>
              ))}
              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  <Save className="h-5 w-5" /> Save Configuration
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SystemSettings;

