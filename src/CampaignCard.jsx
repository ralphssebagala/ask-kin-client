import React from 'react';

function getDaysLeft(createdAt, durationDays) {
  if (!createdAt ||!durationDays) return null;
  const created = new Date(createdAt);
  const end = new Date(created);
  end.setDate(created.getDate() + Number(durationDays));
  const diff = Math.ceil((end - new Date()) / (1000*60*60*24));
  return diff > 0? diff : 0;
}
function formatDate(d) { if (!d) return ''; return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }

function get(c, ...keys){
  for (const k of keys){
    if (c[k] !== undefined && c[k] !== null && c[k] !== '') return c[k];
    const up = k.toUpperCase();
    if (c[up] !== undefined && c[up] !== null && c[up] !== '') return c[up];
  }
  return undefined;
}

export default function CampaignCard({ campaign, onSelect }) {
  const raised = Number(get(campaign, 'raised', 'RAISED', 'PENDING_BALANCE') || 0);
  const goal = Number(get(campaign, 'goal', 'GOAL', 'GOAL_AMOUNT') || 50000);
  const title = get(campaign, 'title', 'TITLE') || 'Untitled';
  const category = get(campaign, 'category', 'CATEGORY') || 'Others';
  const image = get(campaign, 'image', 'IMAGE', 'coverImage') || '/placeholder.jpg';
  const donorCount = Number(get(campaign, 'donorCount', 'DONOR_COUNT', 'TOTAL_DONORS') || 0);
  const pct = goal>0 ? Math.min(100, Math.round((raised/goal)*100)) : 0;
  const fmt = (n) => new Intl.NumberFormat('en-UG').format(Number(n||0));
  const createdAt = get(campaign, 'createdAt', 'CREATED_AT', 'created_at');
  const durationDays = Number(get(campaign, 'durationDays', 'DURATION_DAYS') || 30);
  const daysLeft = getDaysLeft(createdAt, durationDays);
  const city = get(campaign, 'townCity', 'TOWN_CITY', 'CITY') || 'Kampala';
  const country = get(campaign, 'payoutCountry', 'PAYOUT_COUNTRY', 'COUNTRY') || 'Uganda';

  // FIX donor count: hide 0 when raised >0 (inconsistent), or show real count
  const showDonors = !(raised > 0 && donorCount === 0); // hide if raised but donor count missing
  const donorText = donorCount > 0 ? `${donorCount} ${donorCount===1?'donor':'donors'}` : (raised===0 ? 'No donors yet' : '');

  return (
    <div onClick={()=>onSelect&&onSelect(campaign)} style={{display:'flex', gap:'12px', background:'#fff', border:'1px solid #f0f0f0', borderRadius:'20px', padding:'12px', boxShadow:'0 6px 20px rgba(0,0,0,0.06)', cursor:'pointer'}}>
      <div style={{position:'relative', width:'108px', height:'108px', borderRadius:'14px', overflow:'hidden', flexShrink:0, background:'#f3f4f6'}}>
        <img src={image} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="" />
        <div style={{position:'absolute', top:'6px', left:'6px', background:'rgba(255,255,255,0.95)', fontSize:'9px', fontWeight:'800', padding:'3px 7px', borderRadius:'999px', color:'#047857'}}>{category}</div>
        {daysLeft!== null && <div style={{position:'absolute', bottom:'5px', right:'5px', background:'rgba(15,23,42,0.85)', color:'white', fontSize:'8px', fontWeight:'800', padding:'2px 6px', borderRadius:'999px'}}>{daysLeft}d left</div>}
      </div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontSize:'14px', fontWeight:'800', color:'#111827', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{title}</div>
        <div style={{fontSize:'10.5px', color:'#6b7280', margin:'3px 0', display:'flex', gap:'6px', flexWrap:'wrap'}}>
          <span>📍 {city}, {country}</span>
          {showDonors && donorText && <span>👥 {donorText}</span>}
        </div>
        <div style={{fontSize:'12px', marginBottom:'6px'}}><b>UGX {fmt(raised)} raised</b><span style={{color:'#9ca3af', fontSize:'11px'}}> • UGX {fmt(goal)}</span></div>
        <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
          <div style={{flex:1, height:'7px', background:'#f0f4f0', borderRadius:'999px', overflow:'hidden'}}><div style={{width:`${pct}%`, height:'100%', background: raised===0 ? '#e5e7eb' : 'linear-gradient(90deg, #059669, #34d399)'}} /></div>
          <span style={{fontSize:'11px', fontWeight:'800', color: raised===0 ? '#9ca3af' : '#059669'}}>{pct}%</span>
        </div>
      </div>
    </div>
  );
}

