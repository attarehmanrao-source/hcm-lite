import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles, Wrench, RefreshCw, HelpCircle, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  toolCalls?: Array<{ name: string; args: any; result: any }>;
  timestamp: string;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Greetings ${user?.fullName || 'Colleague'}! I am your enterprise HCM Lite AI Assistant powered by Gemini 3.8 Flash. I can execute live queries on leave balances, attendance logs, summarize payroll disbursements, and clarify organizational policies. How may I assist you?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Check pending leave applications',
    'Get attendance summary for today',
    'Summarize latest payroll expenditure',
    'What are company announcements?',
  ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.askAIAssistant(text);
      const assistantMsg: Message = {
        id: 'msg-bot-' + Date.now(),
        sender: 'assistant',
        text: res.reply || 'No response generated.',
        toolCalls: res.toolCalls,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: 'msg-err-' + Date.now(),
        sender: 'assistant',
        text: `Error connecting to AI service: ${err.message || 'Please try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#071F17] w-full max-w-lg h-full flex flex-col shadow-2xl border-l border-[#146C43]/30 dark:border-[#D4AF37]/30 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#146C43]/20 dark:border-[#D4AF37]/20 bg-[#F5F8F5] dark:bg-[#0B3D2E]/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#0B3D2E] to-[#146C43] border border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center font-bold text-xs shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-[#0B3D2E] dark:text-white">
                  HCM Lite AI Assistant
                </h3>
                <span className="text-[10px] bg-[#D4AF37]/20 text-[#0B3D2E] dark:text-[#D4AF37] font-mono px-2 py-0.5 rounded-full font-bold">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Autonomous Server-Side Tool Calling</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-[#F5F8F5]/80 dark:bg-[#0B3D2E]/20 overflow-x-auto flex gap-1.5 scrollbar-none">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-[11px] whitespace-nowrap px-3 py-1 rounded-full bg-white dark:bg-[#0B3D2E] border border-[#146C43]/20 dark:border-[#D4AF37]/20 text-slate-700 dark:text-slate-300 hover:border-[#146C43] dark:hover:border-[#D4AF37] transition-all shrink-0 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-[#0B3D2E] text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                {/* Tool calls execution badge */}
                {m.toolCalls && m.toolCalls.length > 0 && (
                  <div className="mb-2 space-y-1">
                    {m.toolCalls.map((tc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 text-[10px] font-mono text-[#0B3D2E] dark:text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded-lg border border-[#D4AF37]/30"
                      >
                        <Wrench className="w-3 h-3 text-[#146C43] dark:text-[#D4AF37]" />
                        <span>Executed: {tc.name}()</span>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className={`p-3.5 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-[#0B3D2E] to-[#146C43] text-white rounded-tr-none shadow-xs'
                      : 'bg-[#F5F8F5] dark:bg-[#0B3D2E]/40 text-[#182B24] dark:text-slate-100 border border-[#146C43]/15 dark:border-[#D4AF37]/20 rounded-tl-none'
                  }`}
                >
                  {m.text}
                </div>
                <div
                  className={`text-[10px] text-slate-400 mt-1 ${
                    m.sender === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-[#146C43] text-white flex items-center justify-center shrink-0 font-bold text-xs">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5 items-center text-slate-400 text-xs">
              <div className="w-8 h-8 rounded-xl bg-[#0B3D2E] text-[#D4AF37] flex items-center justify-center">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <span className="font-mono text-[11px]">Gemini 3.8 is reasoning & executing database tools...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-[#F5F8F5] dark:bg-[#071F17]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about leaves, attendance, or payroll..."
              className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B3D2E]/40 text-[#182B24] dark:text-[#F5F8F5] focus:outline-none focus:ring-1 focus:ring-[#146C43] dark:focus:ring-[#D4AF37]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 text-white bg-gradient-to-r from-[#0B3D2E] to-[#146C43] hover:opacity-95 rounded-xl disabled:opacity-40 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Send className="w-4 h-4 text-[#D4AF37]" />
            </button>
          </form>
          <div className="text-[10px] text-slate-400 text-center mt-2">
            Model: <strong className="font-mono text-[#146C43] dark:text-[#D4AF37]">gemini-3.8-flash</strong> &bull; Direct function execution enabled.
          </div>
        </div>
      </div>
    </div>
  );
};
