import { useState } from 'react';

export default function SupportContact({ campaignId, donorEmail }) {
  const [busy, setBusy] = useState(null);

  const contact = async (channel) => {
    setBusy(channel);
    try {
      const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API}/api/support/contact-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, campaignId, donorEmail })
      });
      const data = await res.json();
      if (channel === 'call') {
        window.location.href = data.call; // tel:+256780792170 — from backend only
      } else {
        window.open(data.whatsapp, '_blank');
      }
    } catch {
      alert('Could not open support. Try again.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div style={{display:'flex', gap:'8px', marginTop:'12px'}}>
      <button onClick={() => contact('call')} style={{flex:1, background:'#111827', color:'#fff', borderRadius:'10px', padding:'10px', fontSize:'13px', fontWeight:'700', border:'none', cursor:'pointer'}}>
        {busy==='call'? 'Connecting...' : '📞 Call Support'} <span style={{fontSize:'10px', opacity:0.6, marginLeft:'4px'}}>Costs apply</span>
      </button>
      <button onClick={() => contact('whatsapp')} style={{flex:1, background:'#0BA469', color:'#fff', borderRadius:'10px', padding:'10px', fontSize:'13px', fontWeight:'700', border:'none', cursor:'pointer'}}>
        {busy==='whatsapp'? 'Opening...' : '💬 WhatsApp'}
      </button>
    </div>
  );
}