import React, { useState, useEffect, useRef } from 'react';
import {
  Bot, X, Send, Sparkles, Volume2, VolumeX, Shield, Scale,
  BookOpen, ExternalLink, RefreshCw
} from 'lucide-react';
import { bhashiniVoice, BHASHINI_LANGUAGES, SupportedLanguage } from '../utils/bhashiniVoice';

interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  title?: string;
  category?: string;
  legalStatus?: string;
  clauses?: string[];
  speechSummary?: string;
  actions?: Array<{ label: string; route: string }>;
  timestamp: string;
  confidence?: number;
}

interface PresetPrompt {
  id: string;
  question: string;
  category: string;
}

interface RegulatoryCopilotProps {
  onNavigate?: (route: string) => void;
  userRole?: string;
}

export const RegulatoryCopilot: React.FC<RegulatoryCopilotProps> = ({ onNavigate, userRole = 'ALL' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('en-IN');
  const [presets, setPresets] = useState<PresetPrompt[]>([]);
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Namaste! I am the **Agastya Regulatory AI Copilot**.\n\nI provide authoritative legal guidance on **AICTE Approval Process Handbook (APH 2024–27)**, **UGC Dual-Degree Regulations (2022)**, and **DPDP Act 2023** compliance. How can I assist your regulatory review today?',
      title: 'AICTE Statutory Guidance & Legal Intelligence',
      category: 'REGULATORY_ASSISTANT',
      legalStatus: 'STATUTORY_AI_ASSISTANT',
      clauses: ['AICTE Act 1987', 'UGC Dual-Degree Norms 2022', 'DPDP Act 2023'],
      speechSummary: 'Namaste! I am the Agastya Regulatory AI Copilot, providing statutory guidance on AICTE regulations, UGC dual-degree norms, and DPDP Act 2023 compliance.',
      actions: [
        { label: 'AICTE Regulatory Overview', route: '/aicte/overview' },
        { label: 'Dual-Key Sanctions Desk', route: '/aicte/dual-approvals' }
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confidence: 1.0
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch presets on mount
  useEffect(() => {
    fetch('/api/v1/ai/copilot/presets')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.presets) {
          setPresets(data.presets);
        }
      })
      .catch(() => {
        // Fallback default presets if offline
        setPresets([
          { id: 'p1', question: 'Can a student pursue two full-time degrees simultaneously?', category: 'UGC Norms' },
          { id: 'p2', question: 'What is the penalty for exceeding AICTE approved intake?', category: 'Intake Caps' },
          { id: 'p3', question: 'How does DPDP Section 6 purpose-bound consent protect student data?', category: 'DPDP Privacy' },
          { id: 'p4', question: 'Explain the 4-Eyes Maker-Checker dual key sanction protocol.', category: 'Governance' },
        ]);
      });
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || query).trim();
    if (!text || loading) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/ai/copilot/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text, user_role: userRole })
      });

      if (!res.ok) throw new Error('Failed to query copilot');
      const data = await res.json();

      const aiMsg: CopilotMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.answer,
        title: data.title,
        category: data.category,
        legalStatus: data.legal_status,
        clauses: data.clauses,
        speechSummary: data.speech_summary,
        actions: data.actions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: data.confidence
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: CopilotMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, unable to contact the regulatory knowledge engine. Please check your backend connection.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoicePlay = (msg: CopilotMessage) => {
    if (activeSpeechId === msg.id) {
      bhashiniVoice.stop();
      setActiveSpeechId(null);
      return;
    }

    const textToSpeak = msg.speechSummary || msg.text;
    setActiveSpeechId(msg.id);

    bhashiniVoice.speak(textToSpeak, selectedLang, {
      onEnd: () => setActiveSpeechId(null),
      onError: () => setActiveSpeechId(null)
    });
  };

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'STATUTORY_CAP':
      case 'PROHIBITED':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'PERMITTED_WITH_RESTRICTIONS':
      case 'MANDATORY_LEGAL_FRAMEWORK':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-6 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-medium shadow-2xl shadow-indigo-500/40 border border-white/20 transition-all hover:scale-105 active:scale-95 group no-print"
        aria-label="Open Regulatory AI Copilot"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
        </span>
        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
        <span className="text-sm font-bold tracking-wide">AI Copilot</span>
        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/20 text-white">
          APH 2026
        </span>
      </button>

      {/* Copilot Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-16 left-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] h-[620px] max-h-[calc(100vh-6rem)] bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-200 no-print">
          
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-wide">Agastya Regulatory Copilot</h3>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ONLINE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">AICTE Approval Handbook & DPDP 2023</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Selector for Bhashini Voice */}
              <div className="relative">
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value as SupportedLanguage)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  title="Select Bhashini Voice Language"
                >
                  {BHASHINI_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeName}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Preset Chips */}
          <div className="px-3 py-2 bg-slate-950/60 border-b border-slate-800/80 overflow-x-auto flex gap-1.5 scrollbar-thin">
            {presets.map(p => (
              <button
                key={p.id}
                onClick={() => handleSend(p.question)}
                disabled={loading}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800/80 hover:bg-indigo-600/30 hover:border-indigo-500/50 text-slate-300 hover:text-white border border-slate-700/60 transition-colors flex items-center gap-1"
              >
                <Scale className="w-3 h-3 text-indigo-400 shrink-0" />
                <span>{p.category}</span>
              </button>
            ))}
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[92%] rounded-2xl p-3.5 ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                      : 'bg-slate-800/90 border border-slate-700/80 text-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  {/* Assistant Header Metadata */}
                  {msg.sender === 'assistant' && (
                    <div className="mb-2 space-y-1.5">
                      {msg.title && (
                        <div className="font-semibold text-slate-100 flex items-center gap-1.5 text-[12px]">
                          <Shield className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{msg.title}</span>
                        </div>
                      )}
                      {msg.legalStatus && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] px-2 py-0.5 rounded border font-mono font-semibold ${getStatusBadgeClass(msg.legalStatus)}`}>
                            {msg.legalStatus}
                          </span>
                          {msg.confidence && (
                            <span className="text-[10px] text-slate-400">
                              Confidence: {Math.round(msg.confidence * 100)}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Body Text */}
                  <div className="whitespace-pre-line leading-relaxed text-slate-200">
                    {msg.text}
                  </div>

                  {/* Legal Clauses List */}
                  {msg.clauses && msg.clauses.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-700/60">
                      <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 mb-1">
                        <BookOpen className="w-3 h-3 text-amber-400" />
                        <span>Statutory Citations</span>
                      </div>
                      <div className="space-y-1">
                        {msg.clauses.map((clause, idx) => (
                          <div key={idx} className="text-[10.5px] text-slate-300 font-mono bg-slate-900/50 px-2 py-0.5 rounded border border-slate-700/40">
                            § {clause}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Direct Action Chips */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-700/60 flex flex-wrap gap-1.5">
                      {msg.actions.map((act, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (onNavigate) {
                              onNavigate(act.route);
                              setIsOpen(false);
                            }
                          }}
                          className="px-2 py-1 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 hover:border-indigo-400 text-[10.5px] font-medium flex items-center gap-1 transition-all"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{act.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Voice Readout Controls */}
                  {msg.sender === 'assistant' && (
                    <div className="mt-2.5 pt-1.5 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-700/40">
                      <span className="font-mono">{msg.timestamp}</span>
                      <button
                        onClick={() => handleVoicePlay(msg)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
                          activeSpeechId === msg.id
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                            : 'hover:text-white hover:bg-slate-700/50'
                        }`}
                        title="Listen via Bhashini Speech Engine"
                      >
                        {activeSpeechId === msg.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-amber-300" />
                            <span>Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-indigo-300" />
                            <span>Bhashini Voice</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 p-3 bg-slate-800/60 border border-slate-700 rounded-2xl w-fit text-slate-400 text-xs">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Consulting AICTE Handbook & DPDP Statutes...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Bar */}
          <div className="p-3 bg-slate-950/80 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about AICTE intake caps, UGC dual-degree, DPDP..."
                disabled={loading}
                className="flex-1 bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!query.trim() || loading}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                title="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 px-1">
              <span>Press Enter to ask</span>
              <span>Regulatory Engine v2026.4</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
