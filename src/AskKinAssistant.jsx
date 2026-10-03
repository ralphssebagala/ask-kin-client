
import React, { useState, useRef } from 'react';

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function AskKinAssistant(){
  const [msgs,setMsgs]=useState([{from:'bot',text:'Hello! I am your Ask Kin Assistant. I can answer anything about fees, payouts, verification, donations, creating or managing campaigns. How can I help?'}]);
  const [input,setInput]=useState('');
  const [loading,setLoading]=useState(false);
  const listRef=useRef(null);

  const send = async (custom)=>{
    const text = (custom || input).trim();
    if(!text || loading) return;
    setMsgs(m=>[...m, {from:'user', text}]);
    setInput('');
    setLoading(true);
    try{
      const res = await fetch(`${API_URL}/api/assistant/chat`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      const botText = data.answer || data.fallback || "Sorry, I couldn't answer that. Please try FAQ page.";
      setMsgs(m=>[...m, {from:'bot', text: botText}]);
    } catch(err){
      setMsgs(m=>[...m, {from:'bot', text: "Network issue. Quick help: Fees 10%, Payouts Mon 11AM if >= UGX 50k, MoMo 2hrs/Bank 24-48hrs. Try again."}]);
    } finally{
      setLoading(false);
      setTimeout(()=> listRef.current?.scrollTo({top: listRef.current.scrollHeight, behavior:'smooth'}), 50);
    }
  };

  const quickPrompts = [
    "How do I start a fundraiser?",
    "What are the fees?",
    "When will I receive my money?",
    "Can I donate anonymously?",
    "Why was my campaign rejected?"
  ];

  return (
    <div style={{maxWidth:'860px', margin:'0 auto', padding:'16px'}}>
      <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:'20px', display:'flex', flexDirection:'column', height:'78vh', overflow:'hidden'}}>
        <div style={{padding:'14px 20px', borderBottom:'1px solid #f3f4f6', display:'flex', gap:'12px', alignItems:'center'}}>
          <img src="/logo.png" alt="Ask Kin" style={{width:36, height:36, borderRadius:8, objectFit:'contain'}}/>
          <div style={{display:'flex', flexDirection:'column'}}>
            <b style={{fontSize:15}}>Ask Kin Assistant</b>
            <span style={{fontSize:'11px', color:'#6b7280'}}>Powered by Gemini • Payouts Mon 11AM • 10% fee</span>
          </div>
          <span style={{fontSize:'11px', color:'#10b981', marginLeft:'auto'}}>● Online</span>
        </div>
        <div ref={listRef} style={{flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'10px'}}>
          {msgs.map((m,i)=>(
            <div key={i} style={{alignSelf: m.from==='user'?'flex-end':'flex-start', background: m.from==='user'?'#0f4d3a':'#f3f4f6', color: m.from==='user'?'#fff':'#111', padding:'12px 16px', borderRadius:'18px', maxWidth:'84%', fontSize:'14px', lineHeight:1.6, whiteSpace:'pre-wrap'}}>{m.text}</div>
          ))}
          {loading && <div style={{alignSelf:'flex-start', background:'#f3f4f6', padding:'12px 16px', borderRadius:'18px', fontSize:'13px', color:'#6b7280'}}>Typing...</div>}
        </div>
        <div style={{padding:'8px 12px', display:'flex', gap:'6px', flexWrap:'wrap', borderTop:'1px solid #f9fafb'}}>
          {quickPrompts.map(p=>(
            <button key={p} onClick={()=>send(p)} disabled={loading} style={{fontSize:'11px', padding:'6px 10px', borderRadius:999, border:'1px solid #e5e7eb', background:'#fff', cursor:'pointer'}}>{p}</button>
          ))}
        </div>
        <div style={{padding:'12px', borderTop:'1px solid #f3f4f6', display:'flex', gap:'8px'}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Ask about fees, payouts, verification..." disabled={loading} style={{flex:1, padding:'12px 16px', borderRadius:'999px', border:'1px solid #e5e7eb', outline:'none', fontSize:'14px'}}/>
          <button onClick={()=>send()} disabled={loading} style={{background:'#0f4d3a', color:'#fff', border:'none', borderRadius:'999px', padding:'0 20px', fontWeight:'700', cursor:'pointer', opacity: loading?0.6:1}}>{loading?'...':'Send'}</button>
        </div>
      </div>
    </div>
  );
}

