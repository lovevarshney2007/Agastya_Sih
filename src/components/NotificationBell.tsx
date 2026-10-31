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
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg bg-surface border border-line shadow-xl z-50 overflow-hidden text-xs">
          {/* Header */}
          <div className="px-4 py-3 border-b border-line-soft bg-wash flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-ink text-sm">Regulatory Alerts</span>
              {unreadCount > 0 && (
                <span className="tag tag-bad text-[10px] py-0 px-1 font-semibold">{unreadCount} unread</span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                className="text-brand hover:underline font-semibold flex items-center gap-1"
                onClick={handleMarkAllRead}
              >
                <Check size={13} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[340px] overflow-y-auto divide-y divide-line-soft">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-muted space-y-1">
                <Bell size={24} className="mx-auto text-faint opacity-60 mb-2" />
                <div className="font-medium text-ink">All caught up!</div>
                <div className="text-[11px]">No active regulatory notifications for your account.</div>
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
                    className={`p-3 transition-colors cursor-pointer flex items-start gap-2.5 ${
                      !n.is_read ? 'bg-brand-wash/20 hover:bg-brand-wash/30 font-medium' : 'hover:bg-wash text-muted'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isUrgent ? (
                        <AlertTriangle size={15} className="text-bad" />
                      ) : isWarning ? (
                        <AlertCircle size={15} className="text-warn" />
                      ) : isSuccess ? (
                        <CheckCircle2 size={15} className="text-ok" />
                      ) : n.category === 'SECURITY' ? (
                        <ShieldAlert size={15} className="text-brand" />
                      ) : (
                        <Info size={15} className="text-brand" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs truncate block ${!n.is_read ? 'font-bold text-ink' : 'font-semibold text-ink/80'}`}>
                          {n.title}
                        </span>
                        <span className="text-[10px] text-faint shrink-0 tabular-nums">
                          {fmtRelative(n.created_at)}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted line-clamp-2 leading-relaxed m-0">
                        {n.message}
                      </p>
                    </div>

                    {n.action_link && (
                      <ChevronRight size={14} className="text-faint shrink-0 mt-1" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-line-soft bg-wash text-center text-[10px] text-muted mono">
            Synchronized with AICTE Central Ledger
          </div>
        </div>
      )}
    </div>
  );
}
