import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard({ user, userCampaigns = [], userDonations = [] }) {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const sorted = useMemo(()=> [...(userCampaigns||[])].sort((a,b)=>{
    const da = new Date(a?.createdAt || a?.date || 0);
    const db = new Date(b?.createdAt || b?.date || 0);
    return db - da;
  }), [userCampaigns]);

  const [campaigns, setCampaigns] = useState(sorted);
  useEffect(()=> setCampaigns(sorted), [sorted]);

  useEffect(()=>{
    if(toast){ const t=setTimeout(()=>setToast(null), 4000); return ()=>clearTimeout(t); }
  },[toast]);

  const handleShare = (camp) => {
    const link = `${window.location.origin}/campaign/${camp._id || camp.id}`;
    if(navigator.clipboard){
      navigator.clipboard.writeText(link).then(()=>setToast(`✅ Link copied`)).catch(()=>setToast(link));
    } else {
      window.prompt('Copy link:', link);
    }
  };

  const handleDelete = async (camp) => {
    const raised = Number(camp.raised || 0);
    if(raised > 0){
      setToast('⚠️ Cannot delete - this campaign has donations. Use Close instead to archive it.');
      return;
    }
    const id = camp._id || camp.id;
    if(!window.confirm(`Delete "${camp.title}" permanently? This cannot be undone.`)) return;
    try{
      const res = await fetch(`http://localhost:5000/api/campaigns/${id}`, { method:'DELETE' });
      if(!res.ok) throw new Error('Delete failed');
      setCampaigns(prev => prev.filter(c => (c._id||c.id)!== id));
      setToast('🗑️ Campaign deleted');
    } catch(e){
      setToast('❌ Failed to delete: ' + e.message);
    }
  };

  const handleClose = async (camp) => {
    const id = camp._id || camp.id;
    if(!window.confirm(`Close "${camp.title}"? It will be archived and hidden from public, but donation history will remain.`)) return;
    try{
      const res = await fetch(`http://localhost:5000/api/campaigns/${id}`, {
        method:'PUT',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ isArchived: true, status: 'closed' })
      });
      if(!res.ok) throw new Error('Close failed');
      setCampaigns(prev => prev.map(c => (c._id||c.id)===id? {...c, isArchived:true, status:'closed'} : c));
      setToast('📦 Campaign closed & archived');
    } catch(e){
      setToast('❌ Failed to close: ' + e.message);
    }
  };

  return (
    <>
    <style>{`
      @media (max-width: 640px) {
       .dash-ready { flex-direction: column!important; align-items: flex-start!important; gap:12px!important; }
       .dash-card { flex-direction: column!important; align-items: flex-start!important; gap:12px!important; }
       .dash-card-actions { width:100%; justify-content:flex-end; flex-wrap:wrap; }
      }
    `}</style>

    <div style={{maxWidth:'840px', margin:'0 auto', padding:'24px 20px'}}>
      <div style={{textAlign:'center', marginBottom:'24px'}}>
        <h1 style={{fontSize:'32px', fontWeight:'800'}}>Welcome back, {user?.name || 'Creator'}</h1>
        <p style={{color:'#6b7280', fontSize:'15px', marginTop:'6px'}}>Manage your fundraisers and track contributions.</p>
      </div>

      <div className="dash-ready" style={{padding:'20px 24px', background:'#ecfdf5', border:'1px solid #a7f3d0', borderRadius:'20px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div><div style={{fontWeight:'700', color:'#064e3b'}}>Ready to launch?</div><div style={{fontSize:'14px', color:'#047857'}}>Start a new campaign.</div></div>
        <button onClick={()=>navigate('/create-campaign')} style={{background:'#0f4d3a', color:'#fff', fontWeight:'700', padding:'12px 20px', borderRadius:'12px', border:'none', cursor:'pointer'}}>+ Create New Campaign</button>
      </div>

      <div style={{display:'flex', gap:'24px', borderBottom:'1px solid #e5e7eb', marginTop:'32px', marginBottom:'20px'}}>
        <button onClick={()=>setActiveTab('campaigns')} style={{paddingBottom:'12px', border:'none', background:'none', cursor:'pointer', borderBottom: activeTab==='campaigns'?'2px solid #0f4d3a':'2px solid transparent', fontWeight:'600', color: activeTab==='campaigns'?'#0f4d3a':'#6b7280'}}>My Campaigns ({campaigns.length})</button>
        <button onClick={()=>setActiveTab('donations')} style={{paddingBottom:'12px', border:'none', background:'none', cursor:'pointer', borderBottom: activeTab==='donations'?'2px solid #0f4d3a':'2px solid transparent', fontWeight:'600', color: activeTab==='donations'?'#0f4d3a':'#6b7280'}}>Donation History ({(userDonations||[]).length})</button>
      </div>

      {activeTab==='campaigns' && campaigns.map(c=>{
        const raised = Number(c.raised||0);
        const isClosed = c.isArchived || c.status==='closed';
        return (
        <div key={c._id||c.id} className="dash-card" style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:'16px', padding:'20px', marginBottom:'12px', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 1px 2px rgba(0,0,0,0.04)', opacity: isClosed?0.7:1}}>
          <div style={{minWidth:0, flex:1}}>
            <div style={{fontWeight:'700', fontSize:'15px'}}>{c.title} {isClosed && <span style={{fontSize:'11px', background:'#f3f4f6', border:'1px solid #e5e7eb', padding:'2px 8px', borderRadius:'999px', marginLeft:'8px'}}>CLOSED</span>}</div>
            <div style={{fontSize:'13px', color:'#6b7280', marginTop:'6px'}}>Raised: <b style={{color:'#0f4d3a'}}>${raised}</b> of ${c.goal||0}</div>
          </div>
          <div className="dash-card-actions" style={{display:'flex', gap:'8px', flexShrink:0}}>
            <button onClick={()=>handleShare(c)} style={{fontSize:'13px', padding:'8px 14px', borderRadius:'10px', border:'1px solid #e5e7eb', background:'#f9fafb', cursor:'pointer'}}>Share Link</button>
            <button onClick={()=>navigate(`/edit-campaign/${c._id||c.id}`)} disabled={isClosed} style={{fontSize:'13px', padding:'8px 14px', borderRadius:'10px', border:'1px solid #a7f3d0', background: isClosed?'#f3f4f6':'#ecfdf5', color: isClosed?'#9ca3af':'#0f4d3a', cursor: isClosed?'not-allowed':'pointer', fontWeight:'600'}}>Edit</button>
            {raised===0 &&!isClosed? (
              <button onClick={()=>handleDelete(c)} style={{fontSize:'13px', padding:'8px 14px', borderRadius:'10px', border:'1px solid #fecaca', background:'#fef2f2', color:'#991b1b', cursor:'pointer', fontWeight:'600'}}>Delete</button>
            ) :!isClosed && (
              <button onClick={()=>handleClose(c)} style={{fontSize:'13px', padding:'8px 14px', borderRadius:'10px', border:'1px solid #e5e7eb', background:'#fff', color:'#6b7280', cursor:'pointer'}}>Close</button>
            )}
          </div>
        </div>
      )})}

      {activeTab==='campaigns' && campaigns.length===0 && <div style={{textAlign:'center', color:'#9ca3af', padding:'40px 0'}}>No campaigns yet</div>}

      {toast && <div style={{position:'fixed', bottom:'24px', right:'24px', left:'24px', maxWidth:'380px', marginLeft:'auto', background:'#111827', color:'#fff', padding:'12px 18px', borderRadius:'12px', fontSize:'13px', zIndex:100}}>{toast}</div>}
    </div>
    </>
  );
}