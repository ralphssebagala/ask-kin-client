import React, { useState, useRef } from 'react';

const KNOWLEDGE = [
  { k:["start","create","new"], a:"To start: Click 'Start a Fundraiser' → fill title, category, goal, story, photo → Review → Publish. You get a shareable link instantly." },
  { k:["edit","delete","close","archive"], a:"Dashboard → Edit to change details. Delete only shows if raised = $0. If you have donations, you'll see Close instead, which archives it but keeps donor history." },
  { k:["donate","pay"], a:"Donors open your link and click Donate. You can track everything in Dashboard > Donation History." },
  { k:["duration","days","long"], a:"You can set 15, 30, 60, 90 days. NGO/Ongoing runs forever with no end date." },
];

export default function AskKinAssistant(){
  const [msgs,setMsgs]=useState([{from:'bot',text:'Hello! I am your Ask Kin Assistant. How can I help you set up or manage a fundraiser today?'}]);
  const [input,setInput]=useState('');
  const listRef=useRef(null);

  const answerFor = (t)=>{
    const low=t.toLowerCase();
    for(const item of KNOWLEDGE){ if(item.k.some(w=>low.includes(w))) return item.a; }
    return "I can help with creating, editing, sharing, deleting/closing campaigns, and donations. Try: 'How do I start a fundraiser?'";
  };

  const send = (custom)=>{
    const text = (custom || input).trim();
    if(!text) return;
    setMsgs(m=>[...m, {from:'user', text}]);
    setInput('');
    setTimeout(()=>{
      setMsgs(m=>[...m, {from:'bot', text: answerFor(text)}]);
      listRef.current?.scrollTo(0, listRef.current.scrollHeight);
    }, 400);
  };

  return (
    <div style={{maxWidth:'800px', margin:'0 auto', padding:'16px'}}>
      <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:'20px', display:'flex', flexDirection:'column', height:'75vh'}}>
        <div style={{padding:'16px 20px', borderBottom:'1px solid #f3f4f6', display:'flex', gap:'10px', alignItems:'center'}}>
          <div style={{width:'32px', height:'32px', background:'#0f4d3a', color:'#fff', borderRadius:'8px', display:'grid', placeItems:'center', fontWeight:'800'}}>K</div>
          <b>Ask Kin Assistant</b><span style={{fontSize:'11px', color:'#10b981', marginLeft:'8px'}}>● Online</span>
        </div>
        <div ref={listRef} style={{flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'10px'}}>
          {msgs.map((m,i)=>(
            <div key={i} style={{alignSelf: m.from==='user'?'flex-end':'flex-start', background: m.from==='user'?'#0f4d3a':'#f3f4f6', color: m.from==='user'?'#fff':'#111', padding:'10px 14px', borderRadius:'16px', maxWidth:'80%', fontSize:'14px'}}>{m.text}</div>
          ))}
        </div>
        <div style={{padding:'12px', borderTop:'1px solid #f3f4f6', display:'flex', gap:'8px'}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Ask about campaigns..." style={{flex:1, padding:'12px 16px', borderRadius:'999px', border:'1px solid #e5e7eb', outline:'none'}}/>
          <button onClick={()=>send()} style={{background:'#0f4d3a', color:'#fff', border:'none', borderRadius:'999px', padding:'0 20px', fontWeight:'700', cursor:'pointer'}}>Send</button>
        </div>
      </div>
    </div>
  );
}