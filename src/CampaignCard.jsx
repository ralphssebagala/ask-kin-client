import React from 'react';

export default function CampaignCard({ campaign, onSelect }) {
  const raised = campaign.raised || campaign.raisedAmount || 0;
  const goal = campaign.goal || campaign.goalAmount || 5000000;
  const pct = Math.min(100, Math.max(4, Math.round((raised/goal)*100)));
  const img = campaign.image || campaign.coverImage || `https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400`;
  const fmt = (n) => new Intl.NumberFormat('en-UG').format(Number(n||0));
  const dateStr = campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString('en-GB',{day:'2-digit', month:'short', year:'numeric'}) : '18 Sept 2026';

  return (
    <div onClick={()=>onSelect&&onSelect(campaign)} 
      style={{display:'flex', gap:'12px', background:'#fff', border:'1px solid #f0f0f0', borderRadius:'20px', padding:'12px', boxShadow:'0 6px 20px rgba(0,0,0,0.06)', cursor:'pointer'}}>
      <div style={{position:'relative', width:'102px', height:'102px', borderRadius:'14px', overflow:'hidden', flexShrink:0}}>
        <img src={img} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="" />
        <div style={{position:'absolute', top:'6px', left:'6px', background:'rgba(255,255,255,0.95)', fontSize:'9px', fontWeight:'800', padding:'3px 7px', borderRadius:'999px', color:'#047857'}}>{campaign.category||'Medical'}</div>
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:'14.5px', fontWeight:'800', color:'#111827', marginBottom:'4px'}}>{campaign.title}</div>
        <div style={{fontSize:'11px', color:'#6b7280', marginBottom:'2px'}}>● Verified • Kampala, UG • {dateStr}</div>
        <div style={{fontSize:'12.5px', marginBottom:'7px'}}><b>UGX {fmt(raised)} raised</b><span style={{color:'#9ca3af'}}> • UGX {fmt(goal)} goal</span></div>
        <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
          <div style={{flex:1, height:'7px', background:'#f0f4f0', borderRadius:'999px', overflow:'hidden'}}><div style={{width:`${pct}%`, height:'100%', background:'linear-gradient(90deg, #059669, #34d399)'}} /></div>
          <span style={{fontSize:'11px', fontWeight:'800', color:'#059669'}}>{pct}%</span>
        </div>
      </div>
    </div>
  );
}