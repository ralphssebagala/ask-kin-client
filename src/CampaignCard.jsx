import React from 'react';

const COUNTRY_MAP = {
  UG: 'Uganda', UGANDA: 'Uganda',
  RW: 'Rwanda', RWANDA: 'Rwanda',
  KE: 'Kenya', KENYA: 'Kenya',
  TZ: 'Tanzania', TANZANIA: 'Tanzania',
  BI: 'Burundi', BURUNDI: 'Burundi',
  SS: 'South Sudan', 'SOUTH SUDAN': 'South Sudan',
  CD: 'DR Congo', DRC: 'DR Congo'
};

function normalizeCountry(raw) {
  if (!raw) return 'Uganda';
  const s = raw.toString().trim();
  const upper = s.toUpperCase();
  if (COUNTRY_MAP[upper]) return COUNTRY_MAP[upper];
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export default function CampaignCard({ campaign, onSelect }) {
  const raised = campaign.raised || campaign.raisedAmount || 0;
  const goal = campaign.goal || campaign.goalAmount || 50000;
  const pct = Math.min(100, Math.max(4, Math.round((raised/goal)*100)));
  const img = campaign.image || campaign.coverImage || campaign.imageUrl || `https://picsum.photos/seed/${campaign.id||Date.now()}/600/400`;
  const fmt = (n) => new Intl.NumberFormat('en-UG').format(Number(n||0));

  const createdAt = campaign.createdAt;
  const durationDays = campaign.durationDays || 30;

  const daysLeft = (() => {
    if (!createdAt) return null;
    const created = new Date(createdAt);
    const end = new Date(created);
    end.setDate(created.getDate() + Number(durationDays));
    const diff = Math.ceil((end - new Date()) / (1000*60*60*24));
    return diff > 0? diff : 0;
  })();

  const dateStr = createdAt? new Date(createdAt).toLocaleDateString('en-GB',{day:'2-digit', month:'short', year:'numeric'}) : '';
  const donorCount = campaign.donorCount || campaign.totalDonors || campaign.donationsCount || 0;

  const city = campaign.townCity || campaign.TOWN_CITY || campaign.location || campaign.LOCATION || campaign.TOWN || 'Kampala';
  const rawCountry = campaign.payoutCountry || campaign.PAYOUT_COUNTRY || campaign.country || campaign.COUNTRY || campaign.countryName || 'Uganda';
  const country = normalizeCountry(rawCountry);
  const locationStr = `${city}, ${country}`;

  const isBank = (campaign.payoutMethod||'').toLowerCase().includes('bank');

  return (
    <div onClick={()=>onSelect&&onSelect(campaign)}
      style={{display:'flex', gap:'12px', background:'#fff', border:'1px solid #f0f0f0', borderRadius:'20px', padding:'12px', boxShadow:'0 6px 20px rgba(0,0,0,0.06)', cursor:'pointer'}}>

      <div style={{position:'relative', width:'108px', height:'108px', borderRadius:'14px', overflow:'hidden', flexShrink:0, background:'#f3f4f6'}}>
        <img src={img} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="" />
        <div style={{position:'absolute', top:'6px', left:'6px', background:'rgba(255,255,255,0.95)', fontSize:'9px', fontWeight:'800', padding:'3px 7px', borderRadius:'999px', color:'#047857', display:'flex', alignItems:'center', gap:'3px'}}>
          {campaign.category||'Others'}
          {(campaign.youtubeUrl || campaign.tiktokUrl) && <span style={{marginLeft:'3px'}}>{campaign.youtubeUrl? '▶️' : ''}{campaign.tiktokUrl? '🎵' : ''}</span>}
        </div>
        {daysLeft!== null && (
          <div style={{position:'absolute', bottom:'5px', right:'5px', background:'rgba(15,23,42,0.85)', color:'white', fontSize:'8px', fontWeight:'800', padding:'2px 6px', borderRadius:'999px'}}>
            {daysLeft}d left
          </div>
        )}
      </div>

      <div style={{flex:1, minWidth:0}}>
        <div style={{fontSize:'14px', fontWeight:'800', color:'#111827', marginBottom:'3px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', lineHeight:'1.2'}}>{campaign.title}</div>

        <div style={{fontSize:'10.5px', color:'#6b7280', marginBottom:'3px', display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap'}}>
          <span>● Verified • {locationStr} • {dateStr} • 👥 {donorCount} {donorCount===1?'donor':'donors'}</span>
        </div>

        <div style={{fontSize:'10px', marginBottom:'5px', display:'flex', gap:'5px', flexWrap:'wrap'}}>
          <span style={{background:'#f0fdf4', border:'1px solid #bbf7d0', color:'#166534', padding:'2px 6px', borderRadius:'999px', fontWeight:'700'}}>
            {isBank? `🏦 ${campaign.bankName||'Bank'}` : `📱 ${campaign.payoutProvider||'MoMo'}`}
          </span>
          {campaign.youtubeUrl && <span style={{background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', padding:'2px 6px', borderRadius:'999px', fontWeight:'700'}}>▶️ YT</span>}
          {campaign.tiktokUrl && <span style={{background:'#000', color:'white', padding:'2px 6px', borderRadius:'999px', fontWeight:'700', fontSize:'9px'}}>🎵 TikTok</span>}
        </div>

        <div style={{fontSize:'12px', marginBottom:'6px'}}><b>UGX {fmt(raised)} raised</b><span style={{color:'#9ca3af', fontSize:'11px'}}> • UGX {fmt(goal)}</span></div>

        <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
          <div style={{flex:1, height:'7px', background:'#f0f4f0', borderRadius:'999px', overflow:'hidden'}}><div style={{width:`${pct}%`, height:'100%', background:'linear-gradient(90deg, #059669, #34d399)'}} /></div>
          <span style={{fontSize:'11px', fontWeight:'800', color:'#059669'}}>{pct}%</span>
        </div>
      </div>
    </div>
  );
}