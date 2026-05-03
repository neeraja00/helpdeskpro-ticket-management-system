import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Book, Search, ChevronRight, FileText, Settings, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const KnowledgeBase = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) setSearchQuery(q);
  }, [location.search]);

  const categories = [
    { id: 1, title: 'Getting Started', icon: Zap, count: 12, color: 'emerald' },
    { id: 2, title: 'Account & Billing', icon: Settings, count: 8, color: 'indigo' },
    { id: 3, title: 'Security & Privacy', icon: Shield, count: 5, color: 'rose' },
    { id: 4, title: 'Troubleshooting', icon: FileText, count: 24, color: 'amber' }
  ];

  const popularArticles = [
    { id: 101, title: 'How to reset your master password', views: '2.4k' },
    { id: 102, title: 'Configuring two-factor authentication (2FA)', views: '1.8k' },
    { id: 103, title: 'Understanding SLA breach notifications', views: '1.2k' },
    { id: 104, title: 'How to export your data to CSV', views: '950' },
    { id: 105, title: 'Integrating with third-party APIs', views: '840' },
    { id: 106, title: 'Upgrading your subscription plan', views: '720' }
  ];

  const filteredArticles = popularArticles.filter(article => 
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col gap-8 custom-scrollbar overflow-y-auto pb-10">
      
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-12 bg-gradient-to-br from-indigo-600/20 via-transparent to-transparent border-b border-white/5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Book className="h-48 w-48 text-indigo-500" />
        </div>
        <div className="max-w-2xl relative z-10">
          <h1 className="text-4xl font-bold text-white mb-4">How can we help you today?</h1>
          <p className="text-slate-400 text-lg mb-8">Search through our comprehensive guides and tutorials to find the answers you need.</p>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search for articles, guides, or keywords..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-2xl pl-14 pr-4 py-4 text-white text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 backdrop-blur-md transition-all"
            />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Categories */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
             Browse by Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category, i) => (
              <motion.div 
                key={category.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 flex items-start gap-4 hover:bg-white/10 cursor-pointer transition-all group"
              >
                <div className={`h-12 w-12 rounded-xl bg-${category.color}-500/20 flex items-center justify-center text-${category.color}-400 group-hover:scale-110 transition-transform`}>
                  <category.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg mb-1 group-hover:text-indigo-400 transition-colors">{category.title}</h3>
                  <p className="text-slate-400 text-sm">{category.count} Articles</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-white transition-colors mt-3" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Popular Articles */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
             {searchQuery ? 'Search Results' : 'Popular Articles'}
          </h2>
          <div className="glass-card p-6 space-y-4">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <div key={article.id} className="group cursor-pointer">
                  <h4 className="text-slate-300 font-medium group-hover:text-indigo-400 transition-colors text-sm flex justify-between items-center">
                    <span>{article.title}</span>
                    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h4>
                  <div className="text-xs text-slate-500 mt-1">{article.views} views</div>
                  <div className="h-px w-full bg-white/5 mt-4 group-last:hidden"></div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                No articles found for "{searchQuery}".
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;
