import React, { useState } from 'react';
import { Send, Phone, Video, MoreVertical, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const Messages = () => {
  const [activeChat, setActiveChat] = useState(1);
  const [messageText, setMessageText] = useState('');
  
  const [conversations, setConversations] = useState([
    { id: 1, name: 'Alice Smith', role: 'Customer', unread: 2, lastMessage: 'Thanks for the help!', time: '10:42 AM', online: true },
    { id: 2, name: 'Bob Johnson', role: 'Agent', unread: 0, lastMessage: 'I will check the server logs.', time: 'Yesterday', online: false },
    { id: 3, name: 'Charlie Davis', role: 'Customer', unread: 0, lastMessage: 'When is the next billing cycle?', time: 'Tuesday', online: true },
  ]);

  const [messages, setMessages] = useState([
    { id: 1, sender: 'Alice Smith', text: 'Hi, I need help with my account.', time: '10:30 AM', isMe: false },
    { id: 2, sender: 'Me', text: 'Hello Alice! I would be happy to help. What seems to be the issue?', time: '10:32 AM', isMe: true },
    { id: 3, sender: 'Alice Smith', text: 'I cannot access the new billing dashboard.', time: '10:35 AM', isMe: false },
    { id: 4, sender: 'Me', text: 'Let me look into that for you. Give me one moment.', time: '10:36 AM', isMe: true },
    { id: 5, sender: 'Alice Smith', text: 'Thanks for the help!', time: '10:42 AM', isMe: false },
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    const newMsg = {
      id: messages.length + 1,
      sender: 'Me',
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    
    setMessages([...messages, newMsg]);
    setMessageText('');
  };

  const activeUser = conversations.find(c => c.id === activeChat);

  return (
    <div className="h-full flex gap-6">
      {/* Conversations List */}
      <div className="w-80 flex flex-col gap-4">
        <div className="glass-card p-4 flex items-center relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search messages..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
        
        <div className="glass-card flex-1 overflow-y-auto custom-scrollbar p-2">
          {conversations.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all ${
                activeChat === chat.id ? 'bg-indigo-500/20 border border-indigo-500/30' : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="relative">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white">
                  {chat.name.charAt(0)}
                </div>
                {chat.online && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#1e293b]"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-bold text-white text-sm truncate">{chat.name}</h4>
                  <span className="text-[10px] text-slate-500">{chat.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-400 truncate pr-2">{chat.lastMessage}</p>
                  {chat.unread > 0 && (
                    <span className="h-4 w-4 rounded-full bg-indigo-500 flex items-center justify-center text-[9px] font-bold text-white">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 glass-card flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white">
              {activeUser?.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-white">{activeUser?.name}</h3>
              <p className="text-xs text-indigo-400">{activeUser?.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"><Phone className="h-5 w-5" /></button>
            <button className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"><Video className="h-5 w-5" /></button>
            <button className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"><MoreVertical className="h-5 w-5" /></button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar flex flex-col gap-4">
          {messages.map((msg) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id} 
              className={`flex flex-col max-w-[70%] ${msg.isMe ? 'self-end items-end' : 'self-start items-start'}`}
            >
              <div className={`p-4 rounded-2xl ${
                msg.isMe 
                  ? 'bg-indigo-600 text-white rounded-tr-sm' 
                  : 'bg-white/10 border border-white/5 text-slate-200 rounded-tl-sm'
              }`}>
                {msg.text}
              </div>
              <span className="text-[10px] text-slate-500 mt-1">{msg.time}</span>
            </motion.div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/5 bg-white/5">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input 
              type="text" 
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message..." 
              className="w-full bg-white/5 border border-white/10 rounded-full pl-6 pr-14 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <button 
              type="submit"
              disabled={!messageText.trim()}
              className="absolute right-2 h-9 w-9 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white transition-colors"
            >
              <Send className="h-4 w-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Messages;
