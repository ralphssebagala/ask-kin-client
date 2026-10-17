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

function getDaysLeft(createdAt, durationDays = 30) {
  if (!createdAt) return 30;
  const created = new Date(createdAt);
  const end = new Date(created);
  end.setDate(created.getDate() + Number(durationDays));
  const diff = Math.ceil((end - new Date()) / (1000*60*60*24));
  return diff > 0? diff : 0;
}

const COUNTRY_MAP = {
  UG: 'Uganda', UGANDA: 'Uganda',
  RW: 'Rwanda', RWANDA: 'Rwanda',
  KE: 'Kenya', KENYA: 'Kenya',
  TZ: 'Tanzania', TANZANIA: 'Tanzania',
  BI: 'Burundi', BURUNDI: 'Burundi',
  SS: 'South Sudan', 'SOUTH SUDAN': 'South Sudan',
  CD: 'DR Congo', DRC: 'DR Congo', CONGO: 'DR Congo'
};

function normalizeCountry(raw) {
  if (!raw) return 'Uganda';
  const s = raw.toString().trim();
  const upper = s.toUpperCase();
  if (COUNTRY_MAP[upper]) return COUNTRY_MAP[upper];
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

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
    fetch('https://api.ask-kin.com/api/campaigns')
 .then(r=>r.json())
 .then(d=> setCampaigns(Array.isArray(d)?d: d.campaigns||d.data||[]))
 .catch(()=>{});
  }, []);

  const filtered = useMemo(()=>{
    let list=[...campaigns].sort((a,b)=> new Date(b.createdAt||b.date||0)-new Date(a.createdAt||a.date||0));
    if(activeCat!=='all') list=list.filter(c=> (c.category||'').toLowerCase().includes(activeCat.toLowerCase()));
    if(search.trim()){ const s=search.toLowerCase(); list=list.filter(c=> (c.title?.toLowerCase().includes(s) || c.townCity?.toLowerCase().includes(s) || c.location?.toLowerCase().includes(s))); }
    return list;
  },[campaigns, activeCat, search]);

  const getImg = (c)=> {
    const raw = c.image||c.coverImage||c.imageUrl||c.poster||'';
    if(!raw) return '/placeholder.jpg';
    if(raw.includes('.txt') || raw.includes('placeholder.jpg1')) return '/placeholder.jpg';
    if(raw.startsWith('/campaign/')) return `https://api.ask-kin.com${raw}`;
    return raw;
  };
  const fmt = (n)=> new Intl.NumberFormat('en-UG').format(Number(n||0));

  return (
    <div style={{ background:'#FFFBF5', minHeight:'100vh', position:'relative' }}>
      {/* SURGICAL: Band fills entire screen horizontally - no left/right gaps - matches Screenshot 1058 request */}
      <div style={{ 
        background:'#040A1F', 
        /* Full bleed - edge to edge */
        width:'100vw',
        marginLeft:'calc(-50vw + 50%)',
        marginRight:'calc(-50vw + 50%)',
        boxSizing:'border-box',
        /* Clear fixed header (72px mobile / 88px desktop) + safe-area, so title not cut - fixes Screenshot 1056 cut */
        paddingTop: isMobile? 'calc(72px + env(safe-area-inset-top, 0px) + 28px)' : 'calc(88px + env(safe-area-inset-top, 0px) + 44px)',
        paddingBottom: isMobile? '22px' : '32px',
        paddingLeft:'16px',
        paddingRight:'16px',
        textAlign:'center', 
        position:'relative', 
        zIndex:1,
        marginTop:0,
        borderRadius:0,
      }}>
        <h1 style={{ fontSize: isMobile? '28px' : '42px', fontWeight:'900', color:'white', margin:'0 0 8px', letterSpacing:'-0.5px', lineHeight:1.1 }}>
          Give Like <span style={{ color:'#0BA469' }}>Kin.</span>
        </h1>
        <p style={{ fontSize: isMobile? '12.5px' : '14px', color:'#94a3b8', margin:'0 0 20px' }}>
          Rekindling the Gift of Giving.
        </p>
        
        <div style={{ display:'flex', justifyContent:'center' }}>
          <div style={{ 
            width:'100%', 
            maxWidth:'560px', 
            display:'flex', 
            alignItems:'center', 
            gap:'8px', 
            background:'white', 
            border:'1px solid #e5e7eb', 
            borderRadius:'999px', 
            padding:'12px 18px', 
            boxShadow:'0 4px 20px rgba(0,0,0,0.20)' 
          }}>
            <span style={{color:'#9ca3af', fontSize:'14px'}}>🔍</span>
            <input 
              value={search} 
              onChange={e=>setSearch(e.target.value)} 
              placeholder="Search by title or town..." 
              style={{flex:1, border:'none', outline:'none', fontSize:'13.5px', background:'transparent', color:'#0f172a'}} 
            />
          </div>
        </div>
      </div>

      <div style={{maxWidth:'1120px', margin:'0 auto', padding: isMobile? '16px 12px 80px' : '24px 24px 80px', position:'relative', zIndex:1}}>
        <div style={{ display:'grid', gridTemplateColumns: isMobile? 'repeat(3, 1fr)' : 'repeat(4, 1fr)', gap: isMobile? '10px' : '16px', marginBottom:'18px' }}>
          {CATEGORIES.map(cat=>{
            const active = activeCat===cat.id;
            return (
              <button key={cat.id} onClick={()=>setActiveCat(cat.id)} style={{ 
                background: active? '#0BA469' : '#ffffff', 
                border: active? '1px solid #0BA469' : '1px solid #eef2f7',
                borderRadius: isMobile? '14px' : '18px', 
                padding: isMobile? '14px 6px 12px' : '20px 10px 16px', 
                minHeight: isMobile? '96px' : '126px',
                cursor:'pointer', 
                boxShadow: active? '0 6px 18px rgba(11,164,105,0.28)' : '0 3px 12px rgba(0,0,0,0.05)',
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'6px',
              }}>
                <span style={{fontSize: isMobile? '22px' : '28px'}}>{cat.dots? <span style={{display:'grid', gridTemplateColumns:'repeat(3, 6px)', gap:'3px'}}>{Array(9).fill(0).map((_,i)=><span key={i} style={{width:'6px', height:'6px', background: active? 'white' : '#0BA469', borderRadius:'50%', display:'block'}}/>)}</span> : cat.icon}</span>
                <span style={{fontSize: isMobile? '11px' : '13px', fontWeight:'800', color: active? 'white' : '#0f172a', textAlign:'center'}}>{cat.label}</span>
              </button>
            )
          })}
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:'14px'}}>
          {filtered.map((c, idx)=>{
            const goal = c.goal||c.target||500000;
            const raised = c.raised||c.collected||0;
            const pct = Math.min(100, Math.round((raised/goal)*100));
            const country = normalizeCountry(c.country||c.payoutCountry);
            const locationStr = `${c.townCity||''}${c.townCity&&country?', ':''}${country}`;
            const donorCount = c.donorCount||0;
            const currency = c.currency||'UGX';
            const daysLeft = getDaysLeft(c.createdAt, c.durationDays||30);
            return (
              <div key={c.id || idx} onClick={()=>onSelectCampaign&&onSelectCampaign(c)} style={{ background:'white', borderRadius:'16px', overflow:'hidden', boxShadow:'0 8px 24px rgba(0,0,0,0.06)', border:'1px solid #f1f5f9', cursor:'pointer', display:'flex', flexDirection: isMobile? 'column' : 'row' }}>
                <div style={{ width: isMobile? '100%' : '42%', height: isMobile? '160px' : '240px', position:'relative', background:'#f3f4f6' }}>
                  <img src={getImg(c)} onError={(e)=>{ e.currentTarget.src='/placeholder.jpg'; }} style={{width:'100%', height:'100%', objectFit:'cover'}} alt={c.title||''} />
                  <div style={{ position:'absolute', top:'8px', left:'8px', background:'rgba(255,255,255,0.95)', borderRadius:'999px', padding:'3px 8px', fontSize:'10px', fontWeight:'700' }}><span>{c.category||'Medical'}</span></div>
                  <div style={{position:'absolute', top:'8px', right:'8px', background:'#040A1F', color:'white', fontSize:'10px', fontWeight:'800', padding:'4px 8px', borderRadius:'999px'}}>{daysLeft} days left</div>
                </div>
                <div style={{flex:1, padding: isMobile? '12px' : '16px 18px', display:'flex', flexDirection:'column'}}>
                  <div style={{ fontSize: isMobile? '15px' : '18px', fontWeight:'900', lineHeight:'1.2', color:'#0f172a' }}>{c.title}</div>
                  <div style={{ fontSize:'12px', color:'#64748b', marginBottom:'8px' }}>{c.description || 'Support this campaign'}</div>
                  <div><span style={{fontSize:'14px', fontWeight:'900'}}>{currency} {fmt(raised)}</span><span style={{fontSize:'11px', color:'#94a3af', marginLeft:'5px'}}>raised of {currency} {fmt(goal)}</span></div>
                  <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px'}}><div style={{flex:1, height:'6px', background:'#f1f5f9', borderRadius:'999px', overflow:'hidden'}}><div style={{width:`${pct}%`, height:'100%', background:'#0BA469'}}/></div><span style={{fontWeight:'800', color:'#0BA469', fontSize:'11px'}}>{pct}%</span></div>
                  <div style={{display:'flex', gap:'10px', fontSize:'10.5px', color:'#64748b'}}><span>📍 {locationStr}</span><span>👥 {donorCount} donors</span></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}

