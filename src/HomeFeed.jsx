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
    fetch('http://localhost:5000/api/campaigns')
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

  const getImg = (c)=> c.image||c.coverImage||c.imageUrl||`https://picsum.photos/seed/${c.id||c.ID}/600/400`;
  const fmt = (n)=> new Intl.NumberFormat('en-UG').format(Number(n||0));

  return (
    <div style={{ background:'#f6f7f8', minHeight:'100vh' }}>
      <div style={{ background:'#040A1F', padding: isMobile? '22px 16px 18px' : '36px 24px 28px', textAlign:'center' }}>
        <h1 style={{ fontSize: isMobile? '26px' : '38px', fontWeight:'900', color:'white', margin:'0 0 6px', letterSpacing:'-0.5px' }}>Give Like <span style={{ color:'#0BA469' }}>Kin.</span></h1>
        <p style={{ fontSize: isMobile? '12.5px' : '14px', color:'#94a3b8', margin:0 }}>Rekindling the Gift of Giving.</p>
      </div>

      <div style={{ position:'sticky', top:'0', zIndex:15, background:'rgba(246,247,248,0.92)', backdropFilter:'blur(10px)', padding:'8px 12px', borderBottom:'1px solid #eef2f7', display:'flex', justifyContent:'center' }}>
        <div style={{ width:'100%', maxWidth:'420px', display:'flex', alignItems:'center', gap:'8px', background:'white', border:'1px solid #e5e7eb', borderRadius:'999px', padding:'9px 14px' }}>
          <span style={{color:'#9ca3af', fontSize:'14px'}}>&#128269;</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by title or town..." style={{flex:1, border:'none', outline:'none', fontSize:'13px', background:'transparent'}} />
        </div>
      </div>

      <div style={{maxWidth:'1120px', margin:'0 auto', padding: isMobile? '10px 10px 80px' : '18px 24px 80px'}}>

        <div style={{ display:'grid', gridTemplateColumns: isMobile? 'repeat(4, 1fr)' : 'repeat(6, 1fr)', gap: isMobile? '7px' : '12px', marginBottom:'14px' }}>
          {CATEGORIES.map(cat=>{
            const active = activeCat===cat.id;
            return (
              <button key={cat.id} onClick={()=>setActiveCat(cat.id)} style={{ background: active? '#0BA469' : '#ffffff', border:'none', borderRadius:'12px', padding:'8px 3px 6px', minHeight:'62px', cursor:'pointer', boxShadow: active? '0 6px 14px rgba(11,164,105,0.25)' : '0 3px 10px rgba(0,0,0,0.05)' }}>
                {cat.dots? <div style={{display:'grid', gridTemplateColumns:'repeat(3, 5px)', gap:'3px', justifyContent:'center', marginBottom:'5px'}}>{Array.from({length:9}).map((_,i)=><div key={i} style={{width:'5px', height:'5px', borderRadius:'50%', background: active? 'white' : '#111827'}}/>)}</div> : <div style={{fontSize:'16px', marginBottom:'3px'}}>{cat.icon}</div>}
                <div style={{fontSize:'8px', fontWeight:'700', color: active? 'white' : 'black', lineHeight:'1.1'}}>{cat.label}</div>
              </button>
            )
          })}
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
          {filtered.map((c, idx)=>{
            const raised=c.raised||c.raisedAmount||0;
            const goal=c.goal||c.goalAmount||5000000;
            const pct=Math.min(100,Math.max(4,Math.round((raised/goal)*100)));
            const daysLeft = getDaysLeft(c.createdAt, c.durationDays||30);
            const donorCount = c.donorCount || c.DONOR_COUNT || c.totalDonors || c.donationsCount || 0;

            const city = c.townCity || c.TOWN_CITY || c.location || c.LOCATION || c.TOWN || 'Kampala';
            const rawCountry = c.payoutCountry || c.PAYOUT_COUNTRY || c.country || c.COUNTRY || c.countryName || 'Uganda';
            const country = normalizeCountry(rawCountry);
            const locationStr = `${city}, ${country}`;

            const currency = c.campaignCurrency || 'UGX';
            const isBank = (c.payoutMethod||'').toLowerCase().includes('bank');

            return (
              <div key={c.id || idx} onClick={()=>onSelectCampaign&&onSelectCampaign(c)} style={{ background:'white', borderRadius:'16px', overflow:'hidden', boxShadow:'0 8px 24px rgba(0,0,0,0.06)', border:'1px solid #f1f5f9', cursor:'pointer', display:'flex', flexDirection: isMobile? 'column' : 'row' }}>

                <div style={{ width: isMobile? '100%' : '42%', height: isMobile? '160px' : '240px', position:'relative', background:'#f3f4f6', flexShrink:0 }}>
                  <img src={getImg(c)} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="" />
                  <div style={{ position:'absolute', top:'8px', left:'8px', background:'rgba(255,255,255,0.95)', borderRadius:'999px', padding:'3px 8px', fontSize:'10px', fontWeight:'700', color:'#166534', display:'flex', gap:'5px' }}>
                    <span>{c.category||'Medical'}</span>
                    {c.youtubeUrl && <span style={{color:'#dc2626'}}>▶️</span>}
                    {c.tiktokUrl && <span>🎵</span>}
                  </div>
                  {daysLeft!== null && daysLeft > 0 && (
                    <div style={{position:'absolute', top:'8px', right:'8px', background:'#040A1F', color:'white', fontSize:'10px', fontWeight:'800', padding:'4px 8px', borderRadius:'999px'}}>
                      {daysLeft} days left
                    </div>
                  )}
                </div>

                <div style={{flex:1, padding: isMobile? '12px' : '16px 18px', display:'flex', flexDirection:'column'}}>

                  <div style={{display:'flex', alignItems:'center', gap:'6px', marginBottom:'4px', flexWrap:'wrap'}}>
                    <span style={{fontWeight:'800', fontSize:'11px', color:'#0f172a'}}>Ask Kin</span>
                    <span style={{display:'inline-flex', alignItems:'center', gap:'3px', background:'#f0fdf4', border:'1px solid #bbf7d0', color:'#15803d', fontSize:'8.5px', fontWeight:'700', padding:'2px 7px', borderRadius:'999px'}}>
                      Verified • Fundraiser
                    </span>
                    <span style={{fontSize:'10px', background:isBank?'#f0fdf4':'#eff6ff', border:`1px solid ${isBank?'#bbf7d0':'#bfdbfe'}`, color:isBank?'#166534':'#1e40af', padding:'2px 7px', borderRadius:'999px', fontWeight:'700'}}>
                      {isBank? `🏦 ${c.bankName||'Bank'}` : `📱 ${c.payoutProvider||'MoMo'}`}
                    </span>
                  </div>

                  <div style={{ fontSize: isMobile? '15px' : '18px', fontWeight:'900', lineHeight:'1.2', color:'#0f172a', marginBottom:'4px', display:'-webkit-box', WebkitLineClamp:1, WebKitBoxOrient:'vertical', overflow:'hidden' }}>{c.title}</div>
                  <div style={{ fontSize:'12px', color:'#64748b', lineHeight:'1.3', marginBottom:'8px', display:'-webkit-box', WebkitLineClamp:1, WebKitBoxOrient:'vertical', overflow:'hidden' }}>{c.description || c.story || 'Support this campaign'}</div>

                  <div style={{marginBottom:'6px'}}><span style={{fontSize:'14px', fontWeight:'900', color:'#0f172a'}}>{currency} {fmt(raised)}</span><span style={{fontSize:'11px', color:'#94a3af', marginLeft:'5px'}}>raised of {currency} {fmt(goal)}</span></div>

                  <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px'}}>
                    <div style={{flex:1, height:'6px', background:'#f1f5f9', borderRadius:'999px', overflow:'hidden'}}><div style={{width:`${pct}%`, height:'100%', background:'#0BA469'}}/></div>
                    <span style={{fontWeight:'800', color:'#0BA469', fontSize:'11px'}}>{pct}%</span>
                  </div>

                  <div style={{display:'flex', alignItems:'center', gap:'10px', fontSize:'10.5px', color:'#64748b', marginBottom:'8px', flexWrap:'wrap'}}>
                    <span style={{display:'flex', alignItems:'center', gap:'4px'}}>📍 {locationStr}</span>
                    <span style={{display:'flex', alignItems:'center', gap:'4px'}}>📅 {c.createdAt? new Date(c.createdAt).toLocaleDateString('en-GB',{day:'2-digit', month:'short'}) : ''}</span>
                    <span style={{display:'flex', alignItems:'center', gap:'4px'}}>👥 {donorCount} {donorCount===1?'donor':'donors'}</span>
                    <span style={{display:'flex', alignItems:'center', gap:'4px'}}>⏳ {daysLeft}d left</span>
                  </div>

                  {/* FINAL: Buttons combined width = Wakiso line, same on PC & Mobile */}
                  <div style={{marginTop:'6px', width:'100%', maxWidth: isMobile? '100%' : '380px'}}>
                    <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                      <button style={{
                        flex: 1,
                        background:'#0BA469',
                        color:'white',
                        border:'none',
                        borderRadius:'10px',
                        padding:'11px 18px',
                        fontWeight:'800',
                        fontSize:'13px',
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center',
                        gap:'6px',
                        cursor:'pointer'
                      }}>
                        Support now <span>→</span>
                      </button>
                      <button onClick={(e)=>{e.stopPropagation(); if(navigator.share){navigator.share({title:c.title, text:c.description, url: window.location.href})}}}
                        style={{
                          background:'#f8fafc',
                          border:'1px solid #e2e8f0',
                          borderRadius:'10px',
                          padding:'11px 16px',
                          fontWeight:'700',
                          fontSize:'12px',
                          whiteSpace:'nowrap',
                          cursor:'pointer',
                          flexShrink:0
                        }}>
                        Share
                      </button>
                    </div>
                    <div style={{fontSize:'9.5px', color:'#94a3b8', fontWeight:'500', textAlign:'right', marginTop:'5px', letterSpacing:'0.1px', paddingRight:'2px'}}>
                      Share to Spread the Word
                    </div>
                  </div>

                </div>
              </div>
            )
          })}
          {filtered.length===0 && (
            <div style={{textAlign:'center', padding:'40px', background:'white', borderRadius:'16px', color:'#94a3b8'}}>
              No campaigns found for "{search}" in {activeCat}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}