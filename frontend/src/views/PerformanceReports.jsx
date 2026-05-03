import React, { useState, useEffect } from 'react';
import { FileText, Download, TrendingUp, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const PerformanceReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch performance stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const slaData = [
    { name: 'SLA Hit', value: data.sla.hit, color: '#10b981' }, // Emerald
    { name: 'SLA Breached', value: data.sla.breached, color: '#f43f5e' } // Rose
  ];

  const handleExport = () => {
    // Mock export functionality
    alert("Exporting report as PDF...");
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-2xl p-6 glass-card">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="h-10 w-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <FileText className="h-5 w-5 text-emerald-400" />
            </div>
            Performance Reports
          </h2>
          <p className="text-slate-400 text-sm mt-1">Analyze system metrics, SLA compliance, and agent performance.</p>
        </div>
        <button 
          onClick={handleExport}
          className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
        >
          <Download className="h-5 w-5" /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* SLA Compliance Pie Chart */}
        <div className="glass-card p-6 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-400" /> SLA Compliance Overview
          </h3>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slaData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {slaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#94a3b8' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tickets by Category Bar Chart */}
        <div className="glass-card p-6 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-400" /> Tickets by Category
          </h3>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.categories}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="category" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceReports;
