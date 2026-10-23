import React, { useState, useEffect, useMemo } from 'react';
import CampaignCard from './CampaignCard';

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

export default function HomeFeed({ onSelectCampaign, allCampaigns }) {
  const [campaigns, setCampaigns] = useState(allCampaigns || []);
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
    if (allCampaigns && allCampaigns.length >= 0) setCampaigns(allCampaigns);
    else {
      const API = import.meta.env.VITE_BACKEND_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://api.ask-kin.com');
      fetch(`${API}/api/campaigns`).then(r=> r.ok ? r.json() : []).then(d=> setCampaigns(Array.isArray(d)?d: d.campaigns||d.data||[])).catch(()=>{});
    }
  }, [allCampaigns]);

  const filtered = useMemo(()=>{
    let list=[...campaigns].sort((a,b)=> new Date(b.createdAt||b.CREATED_AT||b.date||0)-new Date(a.createdAt||a.CREATED_AT||a.date||0));
    if(activeCat!=='all') list=list.filter(c=> (c.category||c.CATEGORY||'').toLowerCase().includes(activeCat.toLowerCase()));
    if(search.trim()){ const s=search.toLowerCase(); list=list.filter(c=> (c.title?.toLowerCase().includes(s) || c.TITLE?.toLowerCase().includes(s) || c.townCity?.toLowerCase().includes(s) || c.TOWN_CITY?.toLowerCase().includes(s))); }
    return list;
  },[campaigns, activeCat, search]);

  return (
    <div style={{ background:'#FFFBF5', minHeight:'100vh', position:'relative' }}>
      <div style={{ 
        background:'#040A1F', 
        width:'100%',
        margin:0,
        marginTop:'-1px',
        padding: isMobile? '10px 16px 12px' : '14px 24px 14px', 
        textAlign:'center', 
        position:'relative', 
        zIndex:1,
        boxSizing:'border-box',
        display:'block'
      }}>
        <h1 style={{ fontSize: isMobile? '20px' : '28px', fontWeight:'900', color:'white', margin:'0 0 2px', letterSpacing:'-0.5px', lineHeight:1.1 }}>
          Give Like <span style={{ color:'#0BA469' }}>Kin.</span>
        </h1>
        <p style={{ fontSize: isMobile? '10px' : '11px', color:'#94a3b8', margin:'0 0 8px' }}>
          Rekindling the Gift of Giving.
        </p>
        <div style={{ display:'flex', justifyContent:'center' }}>
          <div style={{ 
            width:'100%', 
            maxWidth:'520px', 
            display:'flex', 
            alignItems:'center', 
            gap:'6px', 
            background:'white', 
            border:'1px solid #e5e7eb', 
            borderRadius:'999px', 
            padding: isMobile? '6px 12px' : '8px 14px', 
            boxShadow:'0 2px 10px rgba(0,0,0,0.12)' 
          }}>
            <span style={{color:'#9ca3af', fontSize:'12px'}}>🔍</span>
            <input 
              value={search} 
              onChange={e=>setSearch(e.target.value)} 
              placeholder="Search by title or town..." 
              style={{flex:1, border:'none', outline:'none', fontSize: isMobile? '12px' : '13px', background:'transparent', color:'#0f172a'}} 
            />
          </div>
        </div>
      </div>

      <div style={{maxWidth:'1120px', margin:'0 auto', padding: isMobile? '12px 12px 80px' : '16px 24px 80px', position:'relative', zIndex:1}}>
        <div style={{ display:'grid', gridTemplateColumns: isMobile? 'repeat(3, 1fr)' : 'repeat(4, 1fr)', gap: isMobile? '10px' : '16px', marginBottom:'16px' }}>
          {CATEGORIES.map(cat=>{
            const active = activeCat===cat.id;
            return (
              <button key={cat.id} onClick={()=>setActiveCat(cat.id)} style={{ 
                background: active? '#0BA469' : '#ffffff', 
                border: active? '1px solid #0BA469' : '1px solid #f1f5f9',
                borderRadius:'16px', 
                padding: isMobile? '12px 6px 10px' : '16px 10px 12px', 
                minHeight: isMobile? '80px' : '96px',
                cursor:'pointer', 
                boxShadow: active? '0 4px 12px rgba(11,164,105,0.24)' : '0 2px 8px rgba(0,0,0,0.04)',
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'4px',
                transition:'all 0.15s'
              }}>
                <span style={{fontSize: isMobile? '20px' : '22px'}}>{cat.dots? <span style={{display:'grid', gridTemplateColumns:'repeat(3, 5px)', gap:'3px'}}>{Array(9).fill(0).map((_,i)=><span key={i} style={{width:'5px', height:'5px', background: active? 'white' : '#0BA469', borderRadius:'50%', display:'block'}}/>)}</span> : cat.icon}</span>
                <span style={{fontSize: isMobile? '10px' : '11px', fontWeight:'800', color: active? 'white' : '#0f172a', textAlign:'center', lineHeight:'1.1'}}>{cat.label}</span>
              </button>
            )
          })}
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
          {filtered.map((c, idx)=>(
            <div key={c.id || c.ID || idx}>
              <CampaignCard campaign={c} onSelect={onSelectCampaign} />
            </div>
          ))}
          {filtered.length===0 && (
            <div style={{textAlign:'center', padding:'40px', background:'white', borderRadius:'16px', color:'#94a3b8', fontSize:'13px'}}>
              {campaigns.length===0 ? 'No campaigns yet' : `No campaigns found for "${search}"`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}