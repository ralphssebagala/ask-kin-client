import { useState, useEffect, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

export default function TeamChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const lastCountRef = useRef(0);

  const getToken = () => {
    const path = window.location.pathname.toLowerCase();
    const isDelegatePage = path.includes('/delegate');
    const isAdminPage = path.includes('/admin');

    // On delegate page, prefer delegate token first. On admin page, prefer owner token first.
    // This fixes the shared localhost localStorage bug.
    if (isDelegatePage) {
      return localStorage.getItem('delegateToken') ||
             localStorage.getItem('token') ||
             localStorage.getItem('ownerToken') ||
             localStorage.getItem('authToken') || '';
    }
    if (isAdminPage) {
      return localStorage.getItem('ownerToken') ||
             localStorage.getItem('token') ||
             localStorage.getItem('delegateToken') ||
             localStorage.getItem('authToken') || '';
    }
    // Fallback: try delegate first then owner (most recent login usually wins)
    return localStorage.getItem('delegateToken') ||
           localStorage.getItem('ownerToken') ||
           localStorage.getItem('token') ||
           localStorage.getItem('authToken') || '';
  };

  const fetchMessages = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await fetch(`${API_BASE}/team/messages?limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.messages) {
        if (!open && data.messages.length > lastCountRef.current) {
          setUnread(prev => prev + (data.messages.length - lastCountRef.current));
        }
        lastCountRef.current = data.messages.length;
        setMessages(data.messages);
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setUnread(0);
    }
  }, [messages, open]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const msg = input.trim();
    setInput('');
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/team/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: msg })
      });
      if (res.ok) fetchMessages();
      else {
        const err = await res.json().catch(() => ({}));
        console.error('Team chat send failed', res.status, err);
      }
    } catch (err) {
      console.error('Team chat send error', err);
    }
  };

  const isOwner = (role) => (role || '').toLowerCase() === 'owner';

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999,
          width: '56px', height: '56px', borderRadius: '28px',
          background: '#0f172a', color: 'white', border: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)', cursor: 'pointer',
          fontSize: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        💬
        {unread > 0 && !open && (
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px',
            background: '#ef4444', color: 'white', fontSize: '11px',
            minWidth: '20px', height: '20px', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 5px', fontWeight: '700'
          }}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'fixed', bottom: '90px', right: '20px', zIndex: 9998,
          width: '360px', maxWidth: 'calc(100vw - 40px)', height: '440px',
          background: 'white', borderRadius: '16px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            padding: '14px 16px', background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>Team Chat</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Owner + Delegates • Live</div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b'
            }}>✕</button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', marginTop: '60px' }}>
                No messages yet.<br/>Say hi to your team 👋
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>{m.name}</span>
                  <span style={{
                    fontSize: '9px', padding: '2px 6px', borderRadius: '8px',
                    background: isOwner(m.role) ? '#0f172a' : '#e0f2fe',
                    color: isOwner(m.role) ? 'white' : '#0284c7', fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>{m.role || 'delegate'}</span>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                    {m.time ? new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <div style={{
                  background: isOwner(m.role) ? '#f1f5f9' : '#f0f9ff',
                  padding: '8px 12px', borderRadius: '12px', borderTopLeftRadius: '4px',
                  fontSize: '13px', color: '#1e293b', maxWidth: '85%', lineHeight: '1.4',
                  wordBreak: 'break-word', border: '1px solid #e2e8f0'
                }}>{m.message}</div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={sendMessage} style={{
            padding: '10px', borderTop: '1px solid #e2e8f0',
            display: 'flex', gap: '8px', background: 'white'
          }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message team..."
              maxLength={1000}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: '20px',
                border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none'
              }}
            />
            <button type="submit" disabled={!input.trim()} style={{
              width: '36px', height: '36px', borderRadius: '18px',
              background: input.trim() ? '#0f172a' : '#e2e8f0',
              color: input.trim() ? 'white' : '#94a3b8',
              border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed',
              fontSize: '16px'
            }}>↑</button>
          </form>
        </div>
      )}
    </>
  );
}

