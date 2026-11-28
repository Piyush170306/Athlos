'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Bell,
  X,
  CheckCheck,
  Flame,
  Award,
  Calendar,
  ExternalLink,
  Volume2,
  ShieldAlert,
} from 'lucide-react';

interface NotificationItem {
  id: string;
  type: 'POLL_NEW' | 'POLL_UPDATED' | 'POLL_CLOSING' | 'HIGHLIGHT_NEW' | 'HIGHLIGHT_UPDATED' | 'SCHEDULE_CHANGE';
  title: string;
  message: string;
  link: string;
  entityId: string;
  entityType: 'poll' | 'highlight' | 'match';
  dedupKey: string;
  createdAt: string;
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [pushStatusMsg, setPushStatusMsg] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Initialize read IDs and check push support
  useEffect(() => {
    try {
      const stored = localStorage.getItem('athlos_read_notification_ids');
      if (stored) {
        setReadIds(new Set(JSON.parse(stored)));
      }
    } catch {}

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushSupported(true);
      setPushPermission(Notification.permission);
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/public/notifications');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // 1 min poll
    return () => clearInterval(interval);
  }, []);

  // Close panel on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  const markAllAsRead = () => {
    const allIds = new Set(notifications.map((n) => n.id));
    setReadIds(allIds);
    try {
      localStorage.setItem('athlos_read_notification_ids', JSON.stringify(Array.from(allIds)));
    } catch {}
  };

  const markAsRead = (id: string) => {
    const updated = new Set(readIds);
    updated.add(id);
    setReadIds(updated);
    try {
      localStorage.setItem('athlos_read_notification_ids', JSON.stringify(Array.from(updated)));
    } catch {}
  };

  const handleRequestPush = async () => {
    if (!('Notification' in window)) return;
    try {
      const perm = await Notification.requestPermission();
      setPushPermission(perm);
      if (perm === 'granted') {
        setPushStatusMsg('Browser push notifications enabled!');
        new Notification('ATHLOS Tournament Alerts', {
          body: 'You will receive real-time match predictions and highlight alerts.',
          icon: '/assets/branding/athlos_ipm_sports_club_crest.png',
        });
        setTimeout(() => setPushStatusMsg(null), 4000);
      } else if (perm === 'denied') {
        setPushStatusMsg('Notifications blocked in browser settings. In-app alerts remain active.');
        setTimeout(() => setPushStatusMsg(null), 5000);
      }
    } catch {
      setPushStatusMsg('Could not request notification permission.');
      setTimeout(() => setPushStatusMsg(null), 4000);
    }
  };

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'POLL_NEW':
      case 'POLL_UPDATED':
      case 'POLL_CLOSING':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'HIGHLIGHT_NEW':
      case 'HIGHLIGHT_UPDATED':
        return <Award className="w-4 h-4 text-athlos-gold" />;
      case 'SCHEDULE_CHANGE':
        return <Calendar className="w-4 h-4 text-sky-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return '';
    }
  };

  return (
    <div className="relative inline-block" ref={panelRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-[#0B1727] text-slate-300 hover:text-white border border-[#1D5E91]/60 hover:border-[#79C9F2] transition shadow-[0_0_12px_rgba(121,201,242,0.15)] flex items-center justify-center"
        aria-label="Tournament Notifications"
        title="Tournament Notifications"
      >
        <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#79C9F2]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-amber-500 text-black text-[10px] font-black rounded-full flex items-center justify-center animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#080E1C] border border-[#1D5E91] rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in duration-200">
          {/* Panel Header */}
          <div className="p-3.5 bg-[#0C152A] border-b border-[#1D5E91]/80 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-athlos-gold" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                Tournament Alerts
              </h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  {unreadCount} NEW
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[10px] font-bold text-slate-400 hover:text-athlos-gold flex items-center space-x-1 transition"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span>Mark read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Browser Push Permission CTA (Optional, non-intrusive) */}
          {pushSupported && pushPermission !== 'granted' && (
            <div className="px-3.5 py-2.5 bg-amber-950/30 border-b border-amber-900/40 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-amber-200/90 text-[11px] leading-tight pr-2">
                <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Get browser alerts for new predictions & highlights</span>
              </div>
              <button
                onClick={handleRequestPush}
                className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider shrink-0 transition"
              >
                Enable
              </button>
            </div>
          )}

          {pushStatusMsg && (
            <div className="px-3.5 py-1.5 bg-[#0D1B36] border-b border-[#1D5E91] text-[11px] text-sky-300 flex items-center space-x-1.5 font-medium">
              <span>{pushStatusMsg}</span>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#13233F]">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs px-4">
                <ShieldAlert className="w-6 h-6 mx-auto mb-2 text-slate-500 opacity-60" />
                <span>No tournament alerts yet. Match prediction notices and new highlights will appear here in real time.</span>
              </div>
            ) : (
              notifications.map((item) => {
                const isRead = readIds.has(item.id);
                return (
                  <Link
                    key={item.id}
                    href={item.link}
                    onClick={() => {
                      markAsRead(item.id);
                      setIsOpen(false);
                    }}
                    className={`block p-3 hover:bg-[#0E1A33] transition relative group ${
                      !isRead ? 'bg-[#0A1326]' : 'opacity-85'
                    }`}
                  >
                    <div className="flex items-start space-x-2.5">
                      <div className="mt-0.5 p-1 rounded-lg bg-[#0F1D38] border border-[#1E3A6B] shrink-0">
                        {getNotificationIcon(item.type)}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white truncate pr-2 group-hover:text-athlos-gold transition">
                            {item.title}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-mono shrink-0">
                            {formatRelativeTime(item.createdAt)}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                          {item.message}
                        </p>

                        <div className="flex items-center space-x-1 text-[10px] font-semibold text-[#79C9F2]">
                          <span>View {item.entityType}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </div>
                      </div>

                      {!isRead && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-1 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                      )}
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Panel Footer */}
          <div className="p-2.5 bg-[#0A1326] border-t border-[#1D5E91]/60 text-center text-[10px] text-slate-500 font-medium">
            ATHLOS War of Batches 2026–27 Live Synchronization
          </div>
        </div>
      )}
    </div>
  );
}
