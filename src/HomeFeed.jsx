import React, { useState, useEffect, useMemo } from 'react';

const CATEGORIES = [
  { id:'all', label:'All', dots:true },
  { id:'medical', label:'Medical', icon:'🩺' },
  { id:'happy', label:'Happy Moments', icon:'🎉' },
  { id:'burials', label:'Burials & Funerals', icon:'🕊️' },
  { id:'religion', label:'Religion & Faith', icon:'⛪' },
  { id:'education', label:'Education', icon:'🎓' },
  { id:'family', label:'Family Support', icon:'👨‍👩‍👧' },
  { id:'disaster', label:'Disaster Relief', icon:'🚨' },
  { id:'business', label:'Business & Work', icon:'💼' },
  { id:'ngo', label:'NGO / Ongoing', icon:'🏠' },
  { id:'wishes', label:'Wishes', icon:'✨' },
  { id:'others', label:'Others', icon:'⋯' },
];

export default function HomeFeed({ onSelectCampaign }) {
  const [campaigns, setCampaigns] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    fetch('http://localhost:5000/api/campaigns')
     .then(r=>r.json())
     .then(d=> setCampaigns(Array.isArray(d)?d: d.campaigns||d.data||[]))
     .catch(()=>{});
  }, []);

  const filtered = useMemo(()=>{
    let list=[...campaigns].sort((a,b)=> new Date(b.createdAt||b.date||0)-new Date(a.createdAt||a.date||0));
    if(activeCat!=='all') list=list.filter(c=> (c.category||'').toLowerCase().includes(activeCat));
    if(search.trim()){ const s=search.toLowerCase(); list=list.filter(c=>c.title?.toLowerCase().includes(s)); }
    return list;
  },[campaigns, activeCat, search]);

  const getImg = (c)=> c.image||c.coverImage||c.imageUrl||`https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600`;
  const fmt = (n)=> new Intl.NumberFormat('en-UG').format(Number(n||0));

  return (
    <div style={{ background:'#f6f7f8', minHeight:'100vh' }}>
      <div style={{ background:'#040A1F', padding: isMobile ? '22px 16px 18px' : '36px 24px 28px', textAlign:'center' }}>
        <h1 style={{ fontSize: isMobile ? '26px' : '38px', fontWeight:'900', color:'white', margin:'0 0 6px', letterSpacing:'-0.5px' }}>Give Like <span style={{ color:'#0BA469' }}>Kin.</span></h1>
        <p style={{ fontSize: isMobile ? '12.5px' : '14px', color:'#94a3b8', margin:0 }}>Rekindling the Gift of Giving.</p>
      </div>

      <div style={{ position:'sticky', top:'56px', zIndex:15, background:'rgba(246,247,248,0.92)', backdropFilter:'blur(10px)', padding:'8px 12px', borderBottom:'1px solid #eef2f7', display:'flex', justifyContent:'center' }}>
        <div style={{ width:'100%', maxWidth:'420px', display:'flex', alignItems:'center', gap:'8px', background:'white', border:'1px solid #e5e7eb', borderRadius:'999px', padding:'9px 14px' }}>
          <span style={{color:'#9ca3af', fontSize:'14px'}}>&#128269;</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search campaigns..." style={{flex:1, border:'none', outline:'none', fontSize:'13px', background:'transparent'}} />
        </div>
      </div>

      <div style={{maxWidth:'1120px', margin:'0 auto', padding: isMobile ? '10px 10px 80px' : '18px 24px 80px'}}>

        <div style={{ display:'grid', gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : 'repeat(6, 1fr)', gap: isMobile ? '7px' : '12px', marginBottom:'14px' }}>
          {CATEGORIES.map(cat=>{
            const active = activeCat===cat.id;
            return (
              <button key={cat.id} onClick={()=>setActiveCat(cat.id)} style={{ background: active? '#0BA469' : '#ffffff', border:'none', borderRadius:'12px', padding:'8px 3px 6px', minHeight:'62px', cursor:'pointer', boxShadow: active? '0 6px 14px rgba(11,164,105,0.25)' : '0 3px 10px rgba(0,0,0,0.05)' }}>
                {cat.dots ? <div style={{display:'grid', gridTemplateColumns:'repeat(3, 5px)', gap:'3px', justifyContent:'center', marginBottom:'5px'}}>{Array.from({length:9}).map((_,i)=><div key={i} style={{width:'5px', height:'5px', borderRadius:'50%', background: active? 'white' : '#111827'}}/>)}</div> : <div style={{fontSize:'16px', marginBottom:'3px'}}>{cat.icon}</div>}
                <div style={{fontSize:'8px', fontWeight:'700', color: active? 'white' : 'black', lineHeight:'1.1'}}>{cat.label}</div>
              </button>
            )
          })}
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
          {filtered.map((c, idx)=>{
            const raised=c.raised||c.raisedAmount||4750000;
            const goal=c.goal||c.goalAmount||5000000;
            const pct=Math.min(100,Math.round((raised/goal)*100));
            return (
              <div key={idx} onClick={()=>onSelectCampaign&&onSelectCampaign(c)} style={{ background:'white', borderRadius:'16px', overflow:'hidden', boxShadow:'0 8px 24px rgba(0,0,0,0.06)', border:'1px solid #f1f5f9', cursor:'pointer', display:'flex', flexDirection: isMobile ? 'column' : 'row' }}>
                
                <div style={{ width: isMobile ? '100%' : '42%', height: isMobile ? '138px' : '240px', position:'relative', background:'#f3f4f6', flexShrink:0 }}>
                  <img src={getImg(c)} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="" />
                  <div style={{ position:'absolute', top:'8px', left:'8px', background:'rgba(255,255,255,0.95)', borderRadius:'999px', padding:'3px 8px', fontSize:'10px', fontWeight:'700', color:'#166534' }}>{c.category||'Medical Aid'}</div>
                </div>

                <div style={{flex:1, padding: isMobile ? '10px 12px 10px' : '16px 18px', display:'flex', flexDirection:'column'}}>
                  
                  <div style={{display:'flex', alignItems:'center', gap:'6px', marginBottom:'4px'}}>
                    <span style={{fontWeight:'800', fontSize:'11px', color:'#0f172a'}}>Ask Kin</span>
                    <span style={{display:'inline-flex', alignItems:'center', gap:'3px', background:'#f0fdf4', border:'1px solid #bbf7d0', color:'#15803d', fontSize:'8.5px', fontWeight:'700', padding:'2px 7px', borderRadius:'999px'}}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="#15803d"><path d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 2 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"/></svg>
                      Verified • Fundraiser
                    </span>
                  </div>

                  <div style={{ fontSize: isMobile ? '15px' : '20px', fontWeight:'900', lineHeight:'1.2', color:'#0f172a', marginBottom:'4px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.title || 'Wheelchair for Okello'}</div>
                  <div style={{ fontSize:'12px', color:'#64748b', lineHeight:'1.3', marginBottom:'8px', display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{c.description || 'Help Okello get a durable wheelchair for greater mobility in Kampala'}</div>
                  
                  <div style={{marginBottom:'6px'}}><span style={{fontSize:'14px', fontWeight:'900', color:'#0f172a'}}>UGX {fmt(raised)}</span><span style={{fontSize:'11px', color:'#94a3af', marginLeft:'5px'}}>raised of UGX {fmt(goal)}</span></div>
                  
                  <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px'}}>
                    <div style={{flex:1, height:'6px', background:'#f1f5f9', borderRadius:'999px', overflow:'hidden'}}><div style={{width:`${pct}%`, height:'100%', background:'#0BA469'}}/></div>
                    <span style={{fontWeight:'800', color:'#0BA469', fontSize:'11px'}}>{pct}%</span>
                  </div>

                  <div style={{display:'flex', alignItems:'center', gap:'12px', fontSize:'10.5px', color:'#64748b', marginBottom:'10px'}}>
                    <span style={{display:'flex', alignItems:'center', gap:'4px'}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      12 donors
                    </span>
                    <span style={{display:'flex', alignItems:'center', gap:'4px'}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      2 days left
                    </span>
                    <span style={{display:'flex', alignItems:'center', gap:'4px'}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      Kampala, Uganda
                    </span>
                  </div>

                  <div style={{display:'flex', gap:'8px', marginTop:'auto'}}>
                    <button style={{ flex:1, background:'#0BA469', color:'white', border:'none', borderRadius:'10px', padding:'9px', fontWeight:'800', fontSize:'12px', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>Support now <span>&rarr;</span></button>
                    <button style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'10px', padding:'9px 12px', fontWeight:'600', fontSize:'12px', display:'flex', alignItems:'center', gap:'5px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                      Share
                    </button>
                  </div>
                </div>

              </div>
            )
          })}
        </div>

        <div style={{textAlign:'center', marginTop:'14px', fontSize:'10px', color:'#64748b', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px'}}>
          100% of funds go to Okello • Secure payments via Ask Kin 
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
      </div>
    </div>
  );
}