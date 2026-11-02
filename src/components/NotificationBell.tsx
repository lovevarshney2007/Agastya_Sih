import { useEffect, useRef, useState } from 'react';
import { AlertCircle, AlertTriangle, Bell, Check, CheckCircle2, ChevronRight, Info, ShieldAlert } from 'lucide-react';
import { api } from '../api/client';
import { fmtRelative } from '../lib/format';
import { useRouter } from '../lib/router';
import { useSession } from '../lib/session';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'URGENT' | 'SUCCESS';
  category: string;
  action_link?: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const { user } = useSession();
  const { navigate } = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.notifications.list();
      setNotifications(res.notifications || []);
      setUnreadCount(res.unread_count || 0);
    } catch {
      // ignore in offline / disconnected modes
    }
  };

  useEffect(() => {
    void fetchNotifications();
    const interval = setInterval(() => { void fetchNotifications(); }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const handleMarkRead = async (id: string, actionLink?: string) => {
    try {
      await api.notifications.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (actionLink) {
        setOpen(false);
        navigate(actionLink);
      }
    } catch {
      if (actionLink) {
        setOpen(false);
        navigate(actionLink);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  if (!user) return null;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        type="button"
        className="relative p-2 rounded-md hover:bg-wash text-ink transition-colors cursor-pointer flex items-center justify-center focus:outline-none"
        onClick={() => setOpen(!open)}
        title="Regulatory Alerts & Notifications"
        aria-label="Open notifications"
      >
        <Bell size={18} className={unreadCount > 0 ? 'text-brand' : 'text-muted'} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-bad text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center shadow-xs animate-pop">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white border border-gray-200 shadow-2xl z-50 overflow-hidden text-xs ring-1 ring-black/10 animate-fade-in">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 text-sm">Regulatory Alerts</span>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-700 text-[10px] py-0.5 px-2 rounded-full font-bold">{unreadCount} unread</span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                className="text-brand hover:text-brand-dark hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer"
                onClick={handleMarkAllRead}
              >
                <Check size={13} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[340px] overflow-y-auto divide-y divide-gray-100 bg-white">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 space-y-1">
                <Bell size={24} className="mx-auto text-gray-400 opacity-60 mb-2" />
                <div className="font-semibold text-gray-800">All caught up!</div>
                <div className="text-[11px] text-gray-500">No active regulatory notifications for your account.</div>
              </div>
            ) : (
              notifications.map((n) => {
                const isUrgent = n.severity === 'URGENT';
                const isWarning = n.severity === 'WARNING';
                const isSuccess = n.severity === 'SUCCESS';

                return (
                  <div
                    key={n.id}
                    onClick={() => void handleMarkRead(n.id, n.action_link)}
                    className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 border-l-4 ${
                      !n.is_read
                        ? 'bg-blue-50/90 hover:bg-blue-100/80 border-l-brand'
                        : 'bg-white hover:bg-gray-50 border-l-transparent'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isUrgent ? (
                        <AlertTriangle size={16} className="text-bad" />
                      ) : isWarning ? (
                        <AlertCircle size={16} className="text-amber-600" />
                      ) : isSuccess ? (
                        <CheckCircle2 size={16} className="text-ok" />
                      ) : n.category === 'SECURITY' ? (
                        <ShieldAlert size={16} className="text-brand" />
                      ) : (
                        <Info size={16} className="text-brand" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[13px] truncate block ${!n.is_read ? 'font-bold text-gray-950' : 'font-semibold text-gray-800'}`}>
                          {n.title}
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium shrink-0 tabular-nums">
                          {fmtRelative(n.created_at)}
                        </span>
                      </div>
                      <p className={`text-xs line-clamp-2 leading-relaxed m-0 mt-0.5 ${!n.is_read ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                        {n.message}
                      </p>
                    </div>

                    {n.action_link && (
                      <ChevronRight size={14} className="text-gray-400 shrink-0 mt-1" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="py-2.5 px-3 border-t border-gray-200 bg-gray-50 text-center text-[11px] text-gray-600 font-mono font-medium">
            Synchronized with AICTE Central Ledger
          </div>
        </div>
      )}
    </div>
  );
}
