import { useEffect, useState } from 'react';
const API = import.meta.env.VITE_BACKEND_URL || 'https://api.ask-kin.com';

export default function TrafficLight() {
  const [light, setLight] = useState(null);

  useEffect(() => {
    async function check() {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const r = await fetch(`${API}/api/admin/health`, { signal: controller.signal });
        clearTimeout(timeout);

        if (!r.ok) {
          setLight({ light: 'red', emoji: '🔴', message: `Health endpoint error ${r.status} - Backend route /api/admin/health missing or failed` });
          return;
        }
        const j = await r.json();

        // FIX: Only check real systems, ignore serverTime/uptime
        const systems = ['pesapal', 'oracle', 'ngrok', 'payout'];
        const issues = systems.filter(k => j.health?.[k]?.status!== 'ok');

        if (issues.length === 0) {
          setLight({ light: 'green', emoji: '🟢', message: 'All systems operational - Pesapal, Oracle, Ngrok, Payout queue OK' });
        } else {
          setLight({ light: 'yellow', emoji: '🟡', message: `Warning: ${issues.join(', ')} not OK - ${issues.map(k=>j.health[k]?.message).join(' | ')}` });
        }
      } catch (e) {
        setLight({ light: 'red', emoji: '🔴', message: `Backend unreachable at ${API} - ${e.message} - Call owner immediately` });
      }
    }
    check();
    const iv = setInterval(check, 15000);
    return () => clearInterval(iv);
  }, []);

  if (!light) return <div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 12 }}>Loading traffic light...</div>;

  const bg = light.light === 'green'? '#16a34a' : light.light === 'yellow'? '#eab308' : '#dc2626';
  const color = light.light === 'yellow'? '#000' : '#fff';

  return (
    <div style={{ background: bg, color, padding: 20, borderRadius: 20, marginBottom: 24 }}>
      <div style={{ fontSize: 22, fontWeight: 800 }}>{light.emoji} {light.light.toUpperCase()}</div>
      <div style={{ fontSize: 13, marginTop: 4 }}>{light.message}</div>
      {light.light === 'red' && <a href="tel:+256..." style={{ display: 'inline-block', marginTop: 10, background: '#fff', color: '#dc2626', padding: '8px 16px', borderRadius: 999, fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>📞 Call Owner</a>}
    </div>
  );
}