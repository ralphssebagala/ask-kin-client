import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard({ user, userCampaigns = [], userDonations = [] }) {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const currentUser = useMemo(() => {
    if (user && user.email) return user;
    try {
      const email = localStorage.getItem('userEmail');
      const name = localStorage.getItem('userName');
      const role = localStorage.getItem('userRole');
      if (email && name) return { email, fullName: name, name, role };
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      return stored.email ? stored : null;
    } catch { return null; }
  }, [user]);

  const kycStatus = (currentUser?.kycStatus || currentUser?.KYC_STATUS || '').toLowerCase();
  const isApproved = kycStatus === 'approved' || kycStatus === 'verified';
  const isPending = kycStatus === 'pending' || !kycStatus;
  const isRejected = kycStatus === 'rejected';

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
    const link = `https://ask-kin.com/campaign/${camp._id || camp.id}`;
    if(navigator.clipboard){
      navigator.clipboard.writeText(link).then(()=>setToast(`✅ Link copied`)).catch(()=>setToast(link));
    } else {
      window.prompt('Copy link:', link);
    }
  };

  const handleDelete = async (camp) => {
    const raised = Number(camp.raised || 0);
    if(raised > 0){
      setToast('⚠️ Cannot delete - has donations. Use Close instead.');
      return;
    }
    const id = camp._id || camp.id;
    if(!window.confirm(`Delete "${camp.title}" permanently?`)) return;
    try{
      const res = await fetch(`https://api.ask-kin.com/api/campaigns/${id}`, { method:'DELETE' });
      if(!res.ok) throw new Error('Delete failed');
      setCampaigns(prev => prev.filter(c => (c._id||c.id)!== id));
      setToast('🗑️ Campaign deleted');
    } catch(e){
      setToast('❌ Failed to delete: ' + e.message);
    }
  };

  const handleClose = async (camp) => {
    const id = camp._id || camp.id;
    if(!window.confirm(`Close "${camp.title}"? It will be archived.`)) return;
    try{
      const res = await fetch(`https://api.ask-kin.com/api/campaigns/${id}`, {
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

  const handleCreateClick = () => {
    if (!isApproved) {
      setToast(isRejected ? '❌ Verification rejected. Contact support via FAQ.' : '⏳ Verification pending. You will be notified once approved.');
      return;
    }
    navigate('/create-campaign');
  };

  if (!currentUser) {
    return (
      <div style={{background:'#FFFBF5', minHeight:'100vh', display:'grid', placeItems:'center', padding:'60px 20px', position:'relative', overflow:'hidden'}}>
        <div style={{position:'absolute', inset:0, opacity:0.05, backgroundImage:'radial-gradient(#0BA46C 1.5px, transparent 1.5px)', backgroundSize:'26px 26px', pointerEvents:'none'}}/>
        <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'20px', padding:'32px', textAlign:'center', position:'relative', zIndex:1, boxShadow:'0 8px 24px rgba(0,0,0,0.04)'}}>
          <div style={{fontSize:'40px', marginBottom:'12px'}}>🔒</div>
          <h2 style={{fontSize:'20px', fontWeight:'800', marginBottom:'8px'}}>Dashboard requires login</h2>
          <p style={{color:'#6b7280', fontSize:'14px', marginBottom:'20px'}}>Sign in to see your campaigns, donations, and payouts.</p>
          <button onClick={()=>navigate('/')} style={{background:'#0f4d3a', color:'white', border:'none', padding:'12px 22px', borderRadius:'999px', fontWeight:'700', cursor:'pointer'}}>Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{background:'#FFFBF5', minHeight:'100vh', position:'relative', overflow:'hidden'}}>
      {/* SURGICAL BACKGROUND - warm + dot grid + bottom glow */}
      <div style={{position:'absolute', inset:0, pointerEvents:'none'}}>
        <div style={{position:'absolute', inset:0, opacity:0.05, backgroundImage:'radial-gradient(#0BA46C 1.5px, transparent 1.5px)', backgroundSize:'26px 26px'}}/>
        <div style={{position:'absolute', left:0, right:0, bottom:'-30%', height:'60%', background:'linear-gradient(to top, rgba(11,164,108,0.18), rgba(11,164,108,0.05), transparent)', filter:'blur(40px)'}}/>
        <div style={{position:'absolute', left:'50%', transform:'translateX(-50%)', bottom:'-15%', width:'70%', height:'40%', background:'rgba(11,164,108,0.10)', borderRadius:'50%', filter:'blur(70px)'}}/>
      </div>

      <div style={{maxWidth:'840px', margin:'0 auto', padding:'24px 20px', position:'relative', zIndex:1}}>
        <div style={{textAlign:'center', marginBottom:'24px'}}>
          <h1 style={{fontSize:'30px', fontWeight:'900', letterSpacing:'-0.3px'}}>Welcome back, {currentUser?.name || currentUser?.fullName || 'Creator'}</h1>
          <p style={{color:'#78716c', fontSize:'14px', marginTop:'6px'}}>Manage your fundraisers and track contributions.</p>
        </div>

        {isPending && (
          <div style={{padding:'14px 18px', background:'#fef3c7', border:'1px solid #fcd34d', borderRadius:'14px', marginBottom:'16px', display:'flex', gap:'12px', alignItems:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
            <div style={{fontSize:'20px'}}>⏳</div>
            <div>
              <div style={{fontWeight:'700', fontSize:'14px', color:'#92400e'}}>Verification pending</div>
              <div style={{fontSize:'13px', color:'#78350f', marginTop:'2px'}}>Your account is under review. You'll be notified once approved.</div>
            </div>
          </div>
        )}
        {isRejected && (
          <div style={{padding:'14px 18px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'14px', marginBottom:'16px'}}>
            <div style={{fontWeight:'700', fontSize:'14px', color:'#991b1b'}}>Verification rejected</div>
            <div style={{fontSize:'13px', color:'#7f1d1d', marginTop:'2px'}}>Please contact support via <a href="/faq" style={{textDecoration:'underline'}}>FAQ page</a>.</div>
          </div>
        )}
        {isApproved && (
          <div style={{padding:'10px 18px', background:'#ecfdf5', border:'1px solid #a7f3d0', borderRadius:'14px', marginBottom:'16px', fontSize:'13px', color:'#065f46', display:'flex', alignItems:'center', gap:'8px'}}>
            <span style={{width:'8px', height:'8px', background:'#0BA46C', borderRadius:'50%', display:'inline-block'}}/> Verified - You can create campaigns
          </div>
        )}

        <div style={{padding:'20px 24px', background: isApproved ? '#ecfdf5' : '#ffffff', border:`1px solid ${isApproved ? '#a7f3d0' : '#e7e5e4'}`, borderRadius:'20px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px', boxShadow:'0 4px 16px rgba(0,0,0,0.04)'}}>
          <div><div style={{fontWeight:'800', color: isApproved ? '#064e3b' : '#57534e', fontSize:'14px'}}>Ready to launch?</div><div style={{fontSize:'13px', color: isApproved ? '#047857' : '#a8a29e', marginTop:'2px'}}>{isApproved ? 'Start a new campaign.' : 'Verification required before creating.'}</div></div>
          <button onClick={handleCreateClick} disabled={!isApproved} style={{background: isApproved ? '#0f4d3a' : '#a8a29e', color:'#fff', fontWeight:'800', padding:'12px 20px', borderRadius:'12px', border:'none', cursor: isApproved ? 'pointer' : 'not-allowed', opacity: isApproved ? 1 : 0.7, boxShadow: isApproved ? '0 4px 12px rgba(15,77,58,0.2)' : 'none'}}>+ Create New Campaign</button>
        </div>

        <div style={{display:'flex', gap:'24px', borderBottom:'1px solid #e7e5e4', marginTop:'32px', marginBottom:'20px'}}>
          <button onClick={()=>setActiveTab('campaigns')} style={{paddingBottom:'12px', border:'none', background:'none', cursor:'pointer', borderBottom: activeTab==='campaigns'?'2px solid #0f4d3a':'2px solid transparent', fontWeight:'700', color: activeTab==='campaigns'?'#0f4d3a':'#78716c', fontSize:'14px'}}>My Campaigns ({campaigns.length})</button>
          <button onClick={()=>setActiveTab('donations')} style={{paddingBottom:'12px', border:'none', background:'none', cursor:'pointer', borderBottom: activeTab==='donations'?'2px solid #0f4d3a':'2px solid transparent', fontWeight:'700', color: activeTab==='donations'?'#0f4d3a':'#78716c', fontSize:'14px'}}>Donation History ({(userDonations||[]).length})</button>
        </div>

        {activeTab==='campaigns' && campaigns.map(c=>{
          const raised = Number(c.raised||0);
          const isClosed = c.isArchived || c.status==='closed';
          return (
          <div key={c._id||c.id} style={{background:'#fff', border:'1px solid #e7e5e4', borderRadius:'16px', padding:'20px', marginBottom:'12px', display:'flex', justifyContent:'space-between', alignItems:'center', opacity: isClosed?0.7:1, boxShadow:'0 2px 10px rgba(0,0,0,0.03)'}}>
            <div style={{minWidth:0, flex:1}}>
              <div style={{fontWeight:'800', fontSize:'15px'}}>{c.title} {isClosed && <span style={{fontSize:'11px', background:'#f5f5f4', border:'1px solid #e7e5e4', padding:'2px 8px', borderRadius:'999px', marginLeft:'8px'}}>CLOSED</span>}</div>
              <div style={{fontSize:'13px', color:'#78716c', marginTop:'6px'}}>Raised: <b style={{color:'#0f4d3a'}}>${raised}</b> of ${c.goal||0}</div>
            </div>
            <div style={{display:'flex', gap:'8px', flexShrink:0, flexWrap:'wrap'}}>
              <button onClick={()=>handleShare(c)} style={{fontSize:'13px', padding:'8px 14px', borderRadius:'10px', border:'1px solid #e7e5e4', background:'#fafaf9', cursor:'pointer', fontWeight:'600'}}>Share Link</button>
              <button onClick={()=>navigate(`/edit-campaign/${c._id||c.id}`)} disabled={isClosed} style={{fontSize:'13px', padding:'8px 14px', borderRadius:'10px', border:'1px solid #a7f3d0', background: isClosed?'#f5f5f4':'#ecfdf5', color: isClosed?'#a8a29e':'#0f4d3a', cursor: isClosed?'not-allowed':'pointer', fontWeight:'700'}}>Edit</button>
              {raised===0 &&!isClosed? (<button onClick={()=>handleDelete(c)} style={{fontSize:'13px', padding:'8px 14px', borderRadius:'10px', border:'1px solid #fecaca', background:'#fef2f2', color:'#991b1b', cursor:'pointer', fontWeight:'700'}}>Delete</button>) :!isClosed && (<button onClick={()=>handleClose(c)} style={{fontSize:'13px', padding:'8px 14px', borderRadius:'10px', border:'1px solid #e7e5e4', background:'#fff', color:'#78716c', cursor:'pointer', fontWeight:'600'}}>Close</button>)}
            </div>
          </div>
        )})}

        {activeTab==='campaigns' && campaigns.length===0 && <div style={{textAlign:'center', color:'#a8a29e', padding:'40px 0', background:'white', borderRadius:'16px', border:'1px dashed #e7e5e4'}}>No campaigns yet — create your first to get started.</div>}

        <div style={{marginTop:'40px', textAlign:'center', padding:'16px', background:'white', border:'1px dashed #e7e5e4', borderRadius:'12px', boxShadow:'0 2px 8px rgba(0,0,0,0.02)'}}>
          <div style={{fontSize:'13px', color:'#78716c'}}>Need help? <a href="/faq" style={{color:'#0f4d3a', fontWeight:700, textDecoration:'none'}}>Contact support on FAQ page →</a></div>
        </div>

        {toast && <div style={{position:'fixed', bottom:'24px', right:'24px', left:'24px', maxWidth:'380px', marginLeft:'auto', background:'#1c1917', color:'#fff', padding:'12px 18px', borderRadius:'12px', fontSize:'13px', zIndex:100, boxShadow:'0 8px 24px rgba(0,0,0,0.2)'}}>{toast}</div>}
      </div>
    </div>
  );
}

