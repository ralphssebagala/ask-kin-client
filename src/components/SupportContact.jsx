import { useState } from 'react';

const API = import.meta.env.VITE_BACKEND_URL || 'https://api.ask-kin.com';

// PUBLIC Support - distinct from AI Assistant
// FAQ page uses this - no login needed, no clutter (modal only on click)

export default function SupportContact({ campaignId }) {
  const [openModal, setOpenModal] = useState(null); // 'chat' | null
  const [form, setForm] = useState({ name:'', email:'', message:'' });
  const [sending, setSending] = useState(false);
  const [threadId, setThreadId] = useState(localStorage.getItem('support_thread_id') || null);
  const [reply, setReply] = useState('');
  const [messages, setMessages] = useState([]);

  const whatsappNumber = '256780792170';
  const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(campaignId ? `Hi Ask Kin, I need help with campaign ${campaignId}` : `Hi Ask Kin, I need help`)}`;

  const startChat = async (e) => {
    e.preventDefault();
    if(!form.message.trim()) return;
    setSending(true);
    try{
      const res = await fetch(`${API}/api/support/threads`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({...form, campaignId})
      });
      const j = await res.json();
      if(!res.ok) throw new Error(j.error||'Failed');
      localStorage.setItem('support_thread_id', j.threadId);
      setThreadId(j.threadId);
      setMessages([{senderType:'visitor', message: form.message, name: form.name}]);
      setForm({...form, message:''});
    }catch(err){ alert(err.message); }
    finally{ setSending(false); }
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if(!reply.trim() || !threadId) return;
    const msg = reply; setReply('');
    try{
      await fetch(`${API}/api/support/threads/${threadId}/messages`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({message: msg, name: form.name, email: form.email})
      });
      setMessages(prev => [...prev, {senderType:'visitor', message: msg}]);
    }catch{}
  };

  return (
    <>
      <div style={{display:'flex', gap:'8px', marginTop:'12px', flexWrap:'wrap'}}>
        {/* HUMAN WEB CHAT - distinct from AI Assistant */}
        <button 
          onClick={() => setOpenModal('chat')}
          style={{flex:1, minWidth:'110px', background:'#111827', color:'#fff', borderRadius:'12px', padding:'12px 10px', fontSize:'13px', fontWeight:'700', border:'none', cursor:'pointer', textAlign:'center'}}
        >
          💬 Live Chat
          <span style={{display:'block', fontSize:'10px', opacity:0.6, fontWeight:400, marginTop:'2px'}}>Human support</span>
        </button>

        <a href={waLink} target="_blank" rel="noopener noreferrer"
          style={{flex:1, minWidth:'110px', background:'#0BA469', color:'#fff', borderRadius:'12px', padding:'12px 10px', fontSize:'13px', fontWeight:'700', textDecoration:'none', textAlign:'center', display:'block'}}>
          <span>📱 WhatsApp</span>
          <span style={{display:'block', fontSize:'10px', opacity:0.8, fontWeight:400, marginTop:'2px'}}>Fast reply</span>
        </a>

        <a href={`tel:+${whatsappNumber}`}
          style={{flex:1, minWidth:'110px', background:'#fff', color:'#111827', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'12px 10px', fontSize:'13px', fontWeight:'700', textDecoration:'none', textAlign:'center', display:'block'}}>
          📞 Call
        </a>
      </div>

      {/* MODAL - only appears on click, no clutter on FAQ */}
      {openModal==='chat' && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px'}} onClick={()=>setOpenModal(null)}>
          <div onClick={e=>e.stopPropagation()} style={{background:'white', width:'100%', maxWidth:'420px', borderRadius:'20px', overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.2)', maxHeight:'85vh', display:'flex', flexDirection:'column'}}>
            {/* Header - clearly HUMAN not AI */}
            <div style={{padding:'16px 20px', background:'#111827', color:'white', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <div style={{fontWeight:800, fontSize:'15px'}}>💬 Live Human Support</div>
                <div style={{fontSize:'11px', opacity:0.7, marginTop:'2px'}}>Real person • Not AI Assistant</div>
              </div>
              <button onClick={()=>setOpenModal(null)} style={{background:'rgba(255,255,255,0.15)', border:'none', width:'32px', height:'32px', borderRadius:'999px', color:'white', cursor:'pointer'}}>✕</button>
            </div>

            {!threadId ? (
              // START FORM
              <form onSubmit={startChat} style={{padding:'20px', display:'flex', flexDirection:'column', gap:'12px', overflowY:'auto'}}>
                <div style={{background:'#f9fafb', padding:'12px', borderRadius:'12px', fontSize:'12px', color:'#6b7280'}}>
                  Ask Kin AI Assistant is at <a href="/assistant" style={{color:'#0f4d3a', fontWeight:700}}> /assistant </a> for AI help.<br/>
                  This chat connects you to a <b>real human</b> for verification, payouts, campaign issues.
                </div>
                <input required placeholder="Your name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}
                  style={{padding:'12px 16px', borderRadius:'999px', border:'1px solid #e5e7eb', fontSize:'13px'}}/>
                <input required type="email" placeholder="Your email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}
                  style={{padding:'12px 16px', borderRadius:'999px', border:'1px solid #e5e7eb', fontSize:'13px'}}/>
                <textarea required placeholder="How can we help you?" value={form.message} onChange={e=>setForm({...form, message:e.target.value})} rows={4}
                  style={{padding:'12px 16px', borderRadius:'16px', border:'1px solid #e5e7eb', fontSize:'13px', resize:'none'}}/>
                <button disabled={sending} type="submit" style={{background:'#111827', color:'white', padding:'12px', borderRadius:'999px', fontWeight:700, border:'none', cursor:'pointer'}}>
                  {sending?'Sending...':'Start chat with human →'}
                </button>
                <div style={{textAlign:'center', fontSize:'11px', color:'#9ca3af'}}>Or <a href={waLink} target="_blank" style={{color:'#0BA469', fontWeight:700}}>WhatsApp us</a> for faster reply</div>
              </form>
            ) : (
              // ACTIVE CHAT
              <div style={{display:'flex', flexDirection:'column', flex:1, minHeight:'300px'}}>
                <div style={{flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'10px', background:'#f9fafb'}}>
                  {messages.map((m,i)=>(
                    <div key={i} style={{alignSelf: m.senderType==='visitor'?'flex-end':'flex-start', maxWidth:'80%'}}>
                      <div style={{background: m.senderType==='visitor'?'#111827':'white', color: m.senderType==='visitor'?'white':'#111827', padding:'10px 14px', borderRadius:'16px', borderBottomRightRadius: m.senderType==='visitor'?'4px':'16px', borderBottomLeftRadius: m.senderType!=='visitor'?'4px':'16px', fontSize:'13px', border: m.senderType!=='visitor'?'1px solid #e5e7eb':'none'}}>
                        {m.message}
                      </div>
                    </div>
                  ))}
                  <div style={{textAlign:'center', fontSize:'11px', color:'#9ca3af', marginTop:'8px'}}>Agent will reply here. Keep this window open.</div>
                </div>
                <form onSubmit={sendReply} style={{padding:'12px', borderTop:'1px solid #e5e7eb', display:'flex', gap:'8px', background:'white'}}>
                  <input value={reply} onChange={e=>setReply(e.target.value)} placeholder="Type a message..." style={{flex:1, padding:'10px 16px', borderRadius:'999px', border:'1px solid #e5e7eb', fontSize:'13px'}}/>
                  <button type="submit" disabled={!reply.trim()} style={{width:'36px', height:'36px', borderRadius:'999px', background: reply.trim()?'#111827':'#e5e7eb', color:'white', border:'none', cursor:'pointer'}}>↑</button>
                </form>
                <div style={{padding:'8px', textAlign:'center'}}>
                  <button onClick={()=>{localStorage.removeItem('support_thread_id'); setThreadId(null); setMessages([]);}} style={{fontSize:'11px', color:'#9ca3af', background:'none', border:'none', cursor:'pointer', textDecoration:'underline'}}>Start new chat</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
