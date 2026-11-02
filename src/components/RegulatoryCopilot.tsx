import React, { useState, useEffect, useRef } from 'react';
import {
  X, Send, Volume2, VolumeX, Shield, Scale,
  BookOpen, ExternalLink, RefreshCw
} from 'lucide-react';
import { api } from '../api/client';
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
      text: 'Welcome to the **AICTE Statutory Advisory Desk**.\n\nAuthoritative guidance on compliance under the **AICTE Approval Process Handbook (APH 2024–27)**, **UGC Simultaneous Dual-Degree Norms (2022)**, and the **Digital Personal Data Protection (DPDP) Act 2023**.',
      title: 'AICTE Statutory Compliance Reference Desk',
      category: 'REGULATORY_REFERENCE',
      legalStatus: 'STATUTORY_ADVISORY',
      clauses: ['AICTE Act 1987', 'UGC Dual-Degree Norms 2022', 'DPDP Act 2023'],
      speechSummary: 'Welcome to the AICTE Statutory Advisory Desk, providing guidance on AICTE approval regulations, UGC dual-degree norms, and DPDP Act compliance.',
      actions: [
        { label: 'Regulatory Overview', route: '/aicte/overview' },
        { label: 'Dual-Key Sanctions Desk', route: '/aicte/dual-approvals' }
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confidence: 1.0
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch presets on mount
  useEffect(() => {
    api.copilot.presets()
      .then(data => {
        if (data?.presets) {
          setPresets(data.presets);
        }
      })
      .catch(() => {
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
      const data = await api.copilot.query(text, userRole);

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
    } catch {
      const errorMsg: CopilotMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'The regulatory reference engine is temporarily offline. Please ensure the backend server is reachable at port 8000.',
        title: 'Advisory Engine Unreachable',
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

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'STATUTORY_CAP':
      case 'PROHIBITED':
        return 'tag tag-bad';
      case 'PERMITTED_WITH_RESTRICTIONS':
      case 'MANDATORY_LEGAL_FRAMEWORK':
        return 'tag tag-warn';
      default:
        return 'tag tag-ok';
    }
  };

  return (
    <>
      {/* Institutional Floating Launcher */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 left-6 z-40 flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-navy hover:bg-navy-dark text-white border-2 border-saffron shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 group no-print cursor-pointer"
        aria-label="Open AICTE Statutory Advisory Desk"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 beacon-pulse text-emerald-400" />
        <Scale className="w-4 h-4 text-saffron shrink-0" />
        <span className="text-xs font-bold tracking-tight">Statutory Guidance</span>
        <span className="text-[10px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/15 text-[#f6c48f]">
          APH 2026–27
        </span>
      </button>

      {/* Advisory Desk Drawer */}
      {isOpen && (
        <div className="fixed bottom-16 left-6 z-50 w-[440px] max-w-[calc(100vw-2rem)] h-[620px] max-h-[calc(100vh-6rem)] bg-white border border-line rounded-xl shadow-2xl flex flex-col overflow-hidden text-ink animate-fade-up no-print">
          
          {/* Official Indian Sovereign Header */}
          <div className="bg-navy text-white px-4 py-3 border-b border-navy-dark">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-white/10 text-saffron">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-saffron">AICTE Statutory Desk</h3>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      LIVE
                    </span>
                  </div>
                  <div className="text-[11px] text-[#c9d4e5]">Approval Process Handbook & DPDP 2023</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Language Selector for Bhashini Voice */}
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value as SupportedLanguage)}
                  className="bg-navy-dark border border-line/30 text-white text-[11px] rounded px-2 py-0.5 focus:outline-none cursor-pointer"
                  title="Select Audio Language"
                >
                  {BHASHINI_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeName}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="tricolour h-0.5 mt-2 -mx-4 opacity-80" aria-hidden="true" />
          </div>

          {/* Quick Statutory Topics */}
          <div className="px-3 py-2 bg-wash border-b border-line-soft overflow-x-auto flex gap-1.5 scrollbar-thin">
            {presets.map(p => (
              <button
                key={p.id}
                onClick={() => handleSend(p.question)}
                disabled={loading}
                className="whitespace-nowrap px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white hover:bg-brand-wash text-ink border border-line hover:border-brand transition-colors flex items-center gap-1 cursor-pointer"
              >
                <BookOpen className="w-3 h-3 text-brand shrink-0" />
                <span>{p.category}</span>
              </button>
            ))}
          </div>

          {/* Message History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-[#f8f9fb]">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[92%] rounded-lg p-3.5 ${
                    msg.sender === 'user'
                      ? 'bg-navy text-white rounded-br-none shadow-xs'
                      : 'bg-white border border-line text-ink rounded-bl-none shadow-xs'
                  }`}
                >
                  {/* Assistant Header Metadata */}
                  {msg.sender === 'assistant' && (
                    <div className="mb-2 space-y-1">
                      {msg.title && (
                        <div className="font-bold text-navy flex items-center gap-1.5 text-xs">
                          <Shield className="w-3.5 h-3.5 text-brand" />
                          <span>{msg.title}</span>
                        </div>
                      )}
                      {msg.legalStatus && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={getStatusBadge(msg.legalStatus)}>
                            {msg.legalStatus}
                          </span>
                          {msg.confidence && (
                            <span className="text-[10px] text-muted font-mono">
                              Statutory Match: {Math.round(msg.confidence * 100)}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Body Text */}
                  <div className="whitespace-pre-line leading-relaxed text-[12.5px]">
                    {msg.text}
                  </div>

                  {/* Legal Clauses List */}
                  {msg.clauses && msg.clauses.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-line-soft">
                      <div className="text-[10px] uppercase font-bold text-muted flex items-center gap-1 mb-1 tracking-wider">
                        <BookOpen className="w-3 h-3 text-saffron" />
                        <span>Statutory Citations & Handbook Clauses</span>
                      </div>
                      <div className="space-y-1">
                        {msg.clauses.map((clause, idx) => (
                          <div key={idx} className="text-[11px] font-mono bg-wash px-2 py-0.5 rounded border border-line-soft text-ink">
                            § {clause}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Direct Action Chips */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-line-soft flex flex-wrap gap-1.5">
                      {msg.actions.map((act, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (onNavigate) {
                              onNavigate(act.route);
                              setIsOpen(false);
                            }
                          }}
                          className="btn btn-secondary btn-sm !text-xs !py-1 !px-2 flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{act.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Voice Readout Controls */}
                  {msg.sender === 'assistant' && (
                    <div className="mt-2.5 pt-1.5 flex items-center justify-between text-[10px] text-muted border-t border-line-soft">
                      <span className="font-mono">{msg.timestamp}</span>
                      <button
                        onClick={() => handleVoicePlay(msg)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors cursor-pointer ${
                          activeSpeechId === msg.id
                            ? 'bg-amber-100 text-amber-800 font-semibold'
                            : 'hover:bg-wash text-brand'
                        }`}
                        title="Audio Readout (Bhashini Speech Engine)"
                      >
                        {activeSpeechId === msg.id ? (
                          <>
                            <VolumeX className="w-3 h-3 text-amber-800" />
                            <span>Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3 text-brand" />
                            <span>Audio Readout</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 p-3 bg-white border border-line rounded-lg w-fit text-muted text-xs shadow-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand" />
                <span>Searching AICTE Approval Handbook & DPDP Statutes...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Institutional Query Input Bar */}
          <div className="p-3 bg-white border-t border-line">
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
                placeholder="Query AICTE intake rules, UGC dual-degree, DPDP..."
                disabled={loading}
                className="input flex-1 !text-xs !py-1.5 !min-h-[2.2rem]"
              />
              <button
                type="submit"
                disabled={!query.trim() || loading}
                className="btn btn-primary btn-sm !min-h-[2.2rem] !px-3"
                title="Submit query"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted px-0.5">
              <span>Press Enter to inquire</span>
              <span className="mono">AICTE Statutory Corpus 2026</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

