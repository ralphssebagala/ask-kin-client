import { useState, useEffect, useRef } from 'react';

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Human Support Inbox - for Admin & Delegate dashboards
// Shows threads from FAQ Live Chat (NOT AI Assistant)
// Reuses your TeamChat polling pattern, no extra floating widget

export default function SupportInbox() {
  const [threads, setThreads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [filter, setFilter] = useState('open');
  const bottomRef = useRef(null);

  const getToken = () => localStorage.getItem('token') || localStorage.getItem('ownerToken') || localStorage.getItem('delegateToken') || '';
  const headers = () => ({ Authorization: `Bearer ${getToken()}` });

  const loadThreads = async () => {
    try{
      const res = await fetch(`${API}/api/support/admin/threads?status=${filter}`, { headers: headers() });
      if(!res.ok) return;
      const j = await res.json();
      if(j.threads) setThreads(j.threads);
    }catch{}
  };

  const loadMessages = async (hexId) => {
    if(!hexId) return;
    try{
      const res = await fetch(`${API}/api/support/threads/${hexId}/messages`);
      const j = await res.json();
      if(j.messages) setMessages(j.messages);
    }catch{}
  };

  useEffect(()=>{ loadThreads(); const iv=setInterval(loadThreads, 5000); return ()=>clearInterval(iv); }, [filter]);
  useEffect(()=>{ if(selected) { loadMessages(selected.id); const iv=setInterval(()=>loadMessages(selected.id), 4000); return ()=>clearInterval(iv); } }, [selected]);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:'smooth'}); }, [messages]);

  const sendReply = async (e) => {
    e.preventDefault();
    if(!reply.trim() || !selected) return;
    const msg = reply; setReply('');
    try{
      await fetch(`${API}/api/support/admin/threads/${selected.id}/reply`, {
        method:'POST',
        headers:{'Content-Type':'application/json', ...headers()},
        body: JSON.stringify({message: msg})
      });
      setMessages(prev=>[...prev, {senderType:'admin', message: msg, name:'You'}]);
      loadThreads();
    }catch{}
  };

  const closeThread = async () => {
    if(!selected) return;
    if(!confirm('Close this support thread?')) return;
    await fetch(`${API}/api/support/admin/threads/${selected.id}/close`, {method:'POST', headers: headers()});
    setSelected(null); loadThreads();
  };

  return (
    <div style={{display:'grid', gridTemplateColumns:'320px 1fr', gap:'16px', height:'520px', background:'white', borderRadius:'20px', border:'1px solid #f0f0f0', overflow:'hidden'}}>
      {/* THREAD LIST */}
      <div style={{borderRight:'1px solid #f0f0f0', display:'flex', flexDirection:'column'}}>
        <div style={{padding:'16px', borderBottom:'1px solid #f0f0f0', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>
            <div style={{fontWeight:800, fontSize:'14px'}}>💬 Human Support</div>
            <div style={{fontSize:'11px', color:'#888'}}>FAQ Live Chat • Not AI</div>
          </div>
          <div style={{display:'flex', gap:'4px'}}>
            {['open','closed','all'].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{padding:'4px 10px', borderRadius:'999px', fontSize:'11px', fontWeight:600, border:'none', cursor:'pointer', background: filter===f?'#111827':'#f3f4f6', color: filter===f?'white':'#6b7280', textTransform:'capitalize'}}>{f}</button>
            ))}
          </div>
        </div>
        <div style={{flex:1, overflowY:'auto'}}>
          {threads.length===0 && <div style={{padding:'40px 16px', textAlign:'center', color:'#aaa', fontSize:'13px'}}>No {filter} chats<br/><span style={{fontSize:'11px'}}>FAQ Live Chat will appear here</span></div>}
          {threads.map(t=>(
            <button key={t.id} onClick={()=>setSelected(t)} style={{width:'100%', textAlign:'left', padding:'12px 16px', border:'none', borderBottom:'1px solid #f5f5f5', background: selected?.id===t.id?'#f9fafb':'white', cursor:'pointer', display:'block'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div style={{fontWeight:700, fontSize:'13px', color:'#111827'}}>{t.name||'Visitor'}</div>
                <div style={{fontSize:'10px', color:'#aaa'}}>{t.lastAt ? new Date(t.lastAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}</div>
              </div>
              <div style={{fontSize:'11px', color:'#888', marginTop:'2px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{t.email}</div>
              <div style={{fontSize:'12px', color:'#444', marginTop:'6px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{t.lastMessage||'No messages yet'}</div>
              <div style={{marginTop:'6px', display:'flex', gap:'6px'}}>
                <span style={{fontSize:'10px', padding:'2px 8px', borderRadius:'999px', background: t.status==='open'?'#dcfce7':'#f3f4f6', color: t.status==='open'?'#16a34a':'#6b7280', fontWeight:700, textTransform:'uppercase'}}>{t.status}</span>
                <span style={{fontSize:'10px', color:'#aaa'}}>{t.msgCount} msgs</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* MESSAGE VIEW */}
      <div style={{display:'flex', flexDirection:'column'}}>
        {!selected ? (
          <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#aaa', fontSize:'13px', flexDirection:'column', gap:'8px'}}>
            <div style={{fontSize:'24px'}}>👈</div>
            Select a conversation
            <div style={{fontSize:'11px'}}>Human support from FAQ Live Chat — distinct from Ask Kin AI Assistant at /assistant</div>
          </div>
        ) : (
          <>
            <div style={{padding:'12px 16px', borderBottom:'1px solid #f0f0f0', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#f9fafb'}}>
              <div>
                <div style={{fontWeight:700, fontSize:'14px'}}>{selected.name} • {selected.email}</div>
                <div style={{fontSize:'11px', color:'#888'}}>{selected.phone||''} {selected.campaignId?`• Campaign ${selected.campaignId.substring(0,8)}...`:''}</div>
              </div>
              <button onClick={closeThread} style={{padding:'6px 12px', borderRadius:'999px', background:'white', border:'1px solid #e5e7eb', fontSize:'11px', cursor:'pointer'}}>Close chat</button>
            </div>
            <div style={{flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'10px', background:'#fcfcfb'}}>
              {messages.map((m,i)=>(
                <div key={i} style={{alignSelf: m.senderType==='visitor'?'flex-start':'flex-end', maxWidth:'75%'}}>
                  <div style={{fontSize:'10px', color:'#aaa', marginBottom:'3px', textAlign: m.senderType==='visitor'?'left':'right'}}>{m.name||m.senderType} • {m.time?new Date(m.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}):''}</div>
                  <div style={{background: m.senderType==='visitor'?'white':'#111827', color: m.senderType==='visitor'?'#111827':'white', padding:'10px 14px', borderRadius:'14px', borderBottomLeftRadius: m.senderType==='visitor'?'4px':'14px', borderBottomRightRadius: m.senderType!=='visitor'?'4px':'14px', fontSize:'13px', border: m.senderType==='visitor'?'1px solid #e5e7eb':'none', lineHeight:'1.4'}}>
                    {m.message}
                  </div>
                </div>
              ))}
              <div ref={bottomRef}/>
            </div>
            <form onSubmit={sendReply} style={{padding:'12px', borderTop:'1px solid #f0f0f0', display:'flex', gap:'8px', background:'white'}}>
              <input value={reply} onChange={e=>setReply(e.target.value)} placeholder={`Reply to ${selected.name||'visitor'} as human agent...`} style={{flex:1, padding:'10px 16px', borderRadius:'999px', border:'1px solid #e5e7eb', fontSize:'13px'}}/>
              <button type="submit" disabled={!reply.trim()} style={{padding:'10px 18px', borderRadius:'999px', background: reply.trim()?'#111827':'#e5e7eb', color:'white', border:'none', fontWeight:700, cursor:'pointer', fontSize:'13px'}}>Send</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
