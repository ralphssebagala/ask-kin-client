import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard({ user, userCampaigns = [], allCampaigns = [], userDonations = [], onRequireAuth }) {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const currentUser = useMemo(() => {
    if (user && user.email) return user;
    try {
      const email = localStorage.getItem('userEmail');
      const name = localStorage.getItem('userName');
      const role = localStorage.getItem('userRole');
      const id = localStorage.getItem('userId');
      const phone = localStorage.getItem('userPhone') || localStorage.getItem('phone') || '';
      if (email && name) return { id, email, fullName: name, name, role, phone };
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      return stored.email ? stored : null;
    } catch { return null; }
  }, [user]);

  const firstName = (currentUser?.fullName || currentUser?.name || 'there').split(' ')[0];

  const sorted = useMemo(()=> {
    const normalized = (userCampaigns||[]).map(c=>({
      ...c,
      id: c.id || c.ID,
      _id: c._id || c.id || c.ID,
      title: c.title || c.TITLE || 'Untitled',
      goal: Number(c.goal || c.GOAL || c.GOAL_AMOUNT || 0),
      raised: Number(c.raised || c.RAISED || 0),
      status: (c.status || c.STATUS || '').toLowerCase(),
      isLive: (c.status || c.STATUS || '').toLowerCase() === 'live',
      CREATOR_ID: c.CREATOR_ID || c.creator_id || ''
    }));
    return [...normalized].sort((a,b)=>{
      const da = new Date(a?.createdAt || a?.CREATED_AT || a?.date || 0);
      const db = new Date(b?.createdAt || b?.CREATED_AT || b?.date || 0);
      return db - da;
    });
  }, [userCampaigns]);

  const [campaigns, setCampaigns] = useState(sorted);
  useEffect(()=> setCampaigns(sorted), [sorted]);
  useEffect(()=>{ if(toast){ const t=setTimeout(()=>setToast(null), 4000); return ()=>clearTimeout(t); } },[toast]);

  const handleShare = (camp) => {
    const link = `https://ask-kin.com/campaign/${camp._id || camp.id}`;
    if(navigator.clipboard){ navigator.clipboard.writeText(link).then(()=>setToast(`✅ Link copied`)).catch(()=>setToast(link)); } else { window.prompt('Copy link:', link); }
  };
  const handleDelete = async (camp) => {
    const raised = Number(camp.raised || 0);
    if(raised > 0){ setToast('⚠️ Cannot delete - has donations. Use Close instead.'); return; }
    const id = camp._id || camp.id;
    if(!window.confirm(`Delete "${camp.title}" permanently?`)) return;
    try{ const res = await fetch(`https://api.ask-kin.com/api/campaigns/${id}`, { method:'DELETE' }); if(!res.ok) throw new Error('Delete failed'); setCampaigns(prev => prev.filter(c => (c._id||c.id)!== id)); setToast('🗑️ Campaign deleted'); } catch(e){ setToast('❌ Failed to delete: ' + e.message); }
  };
  const handleClose = async (camp) => {
    const id = camp._id || camp.id;
    if(!window.confirm(`Close "${camp.title}"? It will be archived.`)) return;
    try{ const res = await fetch(`https://api.ask-kin.com/api/campaigns/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ isArchived: true, status: 'closed' }) }); if(!res.ok) throw new Error('Close failed'); setCampaigns(prev => prev.map(c => (c._id||c.id)===id? {...c, isArchived:true, status:'closed'} : c)); setToast('📦 Campaign closed & archived'); } catch(e){ setToast('❌ Failed to close: ' + e.message); }
  };

  const totalRaised = campaigns.reduce((s,c)=> s + Number(c.raised||0), 0);
  const liveCount = campaigns.filter(c=>c.isLive || c.status==='live').length;
  const pendingCount = campaigns.length - liveCount;

  // GUEST - WINNER from Dashboard-WINNER_2.jsx - preserved
  if (!currentUser) {
    return (
      <div style={{background:'#FFFBF5', minHeight:'100vh', position:'relative'}}>
        <div style={{maxWidth:'900px', margin:'0 auto', padding:'20px 16px'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'12px', marginBottom:'20px', flexWrap:'wrap'}}>
            <div>
              <h1 style={{fontSize:'28px', fontWeight:'900', letterSpacing:'-0.5px', margin:0}}>My Dashboard</h1>
              <p style={{color:'#78716c', fontSize:'14px', marginTop:'4px'}}>Welcome, Guest • Please log in to see your dashboard</p>
            </div>
            <button onClick={()=>onRequireAuth && onRequireAuth('register')} style={{background:'#0f4d3a', color:'white', border:'none', borderRadius:'999px', padding:'12px 22px', fontWeight:'900', fontSize:'14px', cursor:'pointer', whiteSpace:'nowrap', boxShadow:'0 4px 12px rgba(15,77,58,0.2)'}}>Create a Fundraiser</button>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'12px', marginBottom:'20px'}}>
            {[
              {label:'ACTIVE FUNDRAISERS', value:'0 Live'},
              {label:'TOTAL RAISED', value:'0 UGX'},
              {label:'PAYOUT READY', value:'0 UGX'}
            ].map((s,i)=>(
              <div key={i} style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'16px', padding:'16px 18px', boxShadow:'0 2px 8px rgba(0,0,0,0.03)'}}>
                <div style={{fontSize:'11px', fontWeight:'700', letterSpacing:'0.06em', color:'#78716c'}}>{s.label}</div>
                <div style={{fontSize:'20px', fontWeight:'900', marginTop:'8px'}}>{s.value}</div>
              </div>
            ))}
          </div>
          <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'20px', padding:'28px 20px', textAlign:'center', boxShadow:'0 4px 20px rgba(0,0,0,0.04)'}}>
            <div style={{width:'56px', height:'56px', borderRadius:'50%', background:'#fef3c7', border:'1px solid #fde68a', display:'grid', placeItems:'center', margin:'0 auto 16px', fontSize:'24px'}}>🔒</div>
            <h2 style={{fontSize:'18px', fontWeight:'900', margin:'0 0 8px'}}>Log in to see your fundraising history</h2>
            <p style={{fontSize:'14px', color:'#57534e', lineHeight:'1.5', maxWidth:'440px', margin:'0 auto 20px'}}>
              Register to start fundraising, or log in if you already have an account. Your history will include campaigns you created and campaigns you donated to.
            </p>
            <div style={{display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap'}}>
              <button onClick={()=>onRequireAuth && onRequireAuth('login')} style={{background:'#0f4d3a', color:'white', border:'none', padding:'13px 28px', borderRadius:'999px', fontWeight:'800', fontSize:'14px', cursor:'pointer', minWidth:'110px'}}>Log in</button>
              <button onClick={()=>onRequireAuth && onRequireAuth('register')} style={{background:'white', color:'#1c1917', border:'1px solid #e7e5e4', padding:'12px 26px', borderRadius:'999px', fontWeight:'700', fontSize:'14px', cursor:'pointer', minWidth:'110px'}}>Register</button>
            </div>
          </div>
          <div style={{marginTop:'20px', textAlign:'center', fontSize:'12px', color:'#a8a29e'}}>
            Your future campaigns and donations will appear here after registration • <a href="/faq" style={{color:'#0f4d3a', fontWeight:700, textDecoration:'none'}}>FAQ →</a>
          </div>
        </div>
      </div>
    );
  }

  // FRESH REGISTRANT LIKE JACKSON - Juma case - SURGICAL WIN
  if (campaigns.length === 0) {
    return (
      <div style={{background:'#FFFBF5', minHeight:'100vh', paddingBottom:'40px'}}>
        <div style={{maxWidth:'900px', margin:'0 auto', padding:'20px 16px'}}>
          <div style={{background:'#0f4d3a', borderRadius:'24px', padding:'28px 24px', color:'white', position:'relative', overflow:'hidden', boxShadow:'0 10px 30px rgba(15,77,58,0.25)'}}>
            <div style={{position:'absolute', top:'-40px', right:'-40px', width:'160px', height:'160px', background:'rgba(255,255,255,0.06)', borderRadius:'50%'}}/>
            <h1 style={{fontSize:'24px', fontWeight:'900', margin:0, lineHeight:1.2}}>Welcome to your Dashboard, {firstName}! 🎉</h1>
            <p style={{margin:'8px 0 0', fontSize:'13px', opacity:0.85, lineHeight:1.4}}>Your account is ready. Here's your personal details — you're all set to start fundraising whenever you're ready.</p>
            <div style={{marginTop:'18px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'16px', padding:'16px 18px'}}>
              <div style={{fontSize:'11px', fontWeight:'700', letterSpacing:'0.08em', opacity:0.7, marginBottom:'10px'}}>PERSONAL DETAILS</div>
              <div style={{display:'grid', gap:'6px', fontSize:'13px'}}>
                <div><span style={{opacity:0.7}}>Name:</span> <b>{currentUser.fullName || currentUser.name}</b></div>
                <div><span style={{opacity:0.7}}>Phone:</span> <b>{currentUser.phone || '+2567...'}</b></div>
                <div><span style={{opacity:0.7}}>Email:</span> <b>{currentUser.email}</b></div>
                <div><span style={{opacity:0.7}}>Account created:</span> <b>Just now</b></div>
              </div>
            </div>
            <div style={{display:'flex', gap:'12px', marginTop:'18px', flexWrap:'wrap'}}>
              <button onClick={()=>navigate('/create-campaign')} style={{background:'#facc15', color:'#1c1917', border:'none', padding:'12px 20px', borderRadius:'999px', fontWeight:'900', fontSize:'13px', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px'}}>✨ Create a New Fundraiser — Start now</button>
              <button onClick={()=>navigate('/explore')} style={{background:'rgba(255,255,255,0.12)', color:'white', border:'1px solid rgba(255,255,255,0.18)', padding:'12px 20px', borderRadius:'999px', fontWeight:'700', fontSize:'13px', cursor:'pointer'}}>Explore fundraisers</button>
            </div>
            <p style={{marginTop:'12px', fontSize:'11px', opacity:0.6}}>You can walk away to plan your fundraiser and return whenever you're ready — your dashboard will be here.</p>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'12px', marginTop:'18px'}}>
            <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'16px', padding:'16px 18px'}}>
              <div style={{fontSize:'11px', fontWeight:'700', color:'#78716c', letterSpacing:'0.04em'}}>ACTIVE FUNDRAISERS</div>
              <div style={{fontSize:'22px', fontWeight:'900', marginTop:'6px'}}>0 Live</div>
            </div>
            <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'16px', padding:'16px 18px'}}>
              <div style={{fontSize:'11px', fontWeight:'700', color:'#78716c'}}>TOTAL RAISED</div>
              <div style={{fontSize:'22px', fontWeight:'900', marginTop:'6px'}}>0 UGX</div>
            </div>
            <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'16px', padding:'16px 18px'}}>
              <div style={{fontSize:'11px', fontWeight:'700', color:'#78716c'}}>PAYOUT READY</div>
              <div style={{fontSize:'22px', fontWeight:'900', marginTop:'6px'}}>0 UGX</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LOGGED IN WITH CAMPAIGNS - Bushanah case - filtered by CREATOR_ID
  return (
    <div style={{background:'#FFFBF5', minHeight:'100vh', position:'relative'}}>
      <div style={{maxWidth:'840px', margin:'0 auto', padding:'24px 20px'}}>
        <h1 style={{fontSize:'26px', fontWeight:'900', textAlign:'center'}}>Welcome back, {currentUser?.name || currentUser?.fullName || 'Creator'}</h1>
        <p style={{textAlign:'center', color:'#78716c', fontSize:'14px', marginTop:'6px'}}>Manage your fundraisers and track contributions.</p>
        <div style={{marginTop:'20px', display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'12px'}}>
          <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'16px', padding:'16px'}}><div style={{fontSize:'11px', fontWeight:'700', color:'#78716c'}}>ACTIVE</div><div style={{fontSize:'20px', fontWeight:'900', marginTop:'4px'}}>{liveCount} Live</div></div>
          <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'16px', padding:'16px'}}><div style={{fontSize:'11px', fontWeight:'700', color:'#78716c'}}>TOTAL RAISED</div><div style={{fontSize:'20px', fontWeight:'900', marginTop:'4px'}}>{totalRaised.toLocaleString()} UGX</div></div>
          <div style={{background:'#0BA46C', border:'1px solid #0f4d3a', borderRadius:'16px', padding:'16px', color:'white'}}><div style={{fontSize:'11px', fontWeight:'700', opacity:0.9}}>PAYOUT READY</div><div style={{fontSize:'20px', fontWeight:'900', marginTop:'4px'}}>{totalRaised.toLocaleString()} UGX</div></div>
        </div>
        <div style={{marginTop:'24px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'white', border:'1px solid #e7e5e4', borderRadius:'16px', padding:'16px 20px'}}>
          <div><div style={{fontWeight:'800'}}>Ready to launch?</div><div style={{fontSize:'13px', color:'#78716c'}}>{campaigns.length===0?'Create your first fundraiser':`${liveCount} live • ${pendingCount} pending`}</div></div>
          <button onClick={()=>navigate('/create-campaign')} style={{background:'#0f4d3a', color:'white', border:'none', padding:'12px 20px', borderRadius:'12px', fontWeight:'800', cursor:'pointer'}}>+ Create New Campaign</button>
        </div>
        <div style={{display:'flex', gap:'24px', borderBottom:'1px solid #e7e5e4', marginTop:'24px', marginBottom:'16px'}}>
          <button onClick={()=>setActiveTab('campaigns')} style={{paddingBottom:'12px', border:'none', background:'none', cursor:'pointer', borderBottom: activeTab==='campaigns'?'2px solid #0f4d3a':'2px solid transparent', fontWeight:'700', color: activeTab==='campaigns'?'#0f4d3a':'#78716c'}}>My Campaigns ({campaigns.length})</button>
          <button onClick={()=>setActiveTab('donations')} style={{paddingBottom:'12px', border:'none', background:'none', cursor:'pointer', borderBottom: activeTab==='donations'?'2px solid #0f4d3a':'2px solid transparent', fontWeight:'700', color: activeTab==='donations'?'#0f4d3a':'#78716c'}}>Donation History ({(userDonations||[]).length})</button>
        </div>
        {activeTab==='campaigns' && campaigns.map(c=>{
          const raised = Number(c.raised||0); const isClosed = c.isArchived || c.status==='closed'; const isLive = c.isLive || c.status==='live';
          return (
          <div key={c._id||c.id} style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'16px', padding:'16px', marginBottom:'12px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px'}}>
            <div style={{minWidth:0, flex:1}}><div style={{fontWeight:'800', fontSize:'15px'}}>{c.title} {isLive ? <span style={{fontSize:'11px', background:'#dcfce7', padding:'2px 8px', borderRadius:'999px', marginLeft:'6px'}}>LIVE • {raised.toLocaleString()} UGX</span> : <span style={{fontSize:'11px', background:'#fef3c7', padding:'2px 8px', borderRadius:'999px', marginLeft:'6px'}}>PENDING</span>}</div><div style={{fontSize:'13px', color:'#78716c', marginTop:'4px'}}>Raised: <b>{raised.toLocaleString()} UGX</b> of {Number(c.goal||0).toLocaleString()} UGX</div></div>
            <div style={{display:'flex', gap:'8px'}}>
              <button onClick={()=>handleShare(c)} style={{fontSize:'13px', padding:'8px 12px', borderRadius:'10px', border:'1px solid #e7e5e4', background:'#fafaf9', cursor:'pointer'}}>Share</button>
              <button onClick={()=>navigate(`/edit-campaign/${c._id||c.id}`)} disabled={isClosed} style={{fontSize:'13px', padding:'8px 12px', borderRadius:'10px', border:'1px solid #a7f3d0', background: isClosed?'#f5f5f4':'#ecfdf5', cursor: isClosed?'not-allowed':'pointer'}}>Edit</button>
              {raised===0 &&!isClosed? (<button onClick={()=>handleDelete(c)} style={{fontSize:'13px', padding:'8px 12px', borderRadius:'10px', border:'1px solid #fecaca', background:'#fef2f2', color:'#991b1b', cursor:'pointer'}}>Delete</button>) :!isClosed && (<button onClick={()=>handleClose(c)} style={{fontSize:'13px', padding:'8px 12px', borderRadius:'10px', border:'1px solid #e7e5e4', background:'#fff', cursor:'pointer'}}>Close</button>)}
            </div>
          </div>
        )})}
        {activeTab==='campaigns' && campaigns.length===0 && <div style={{textAlign:'center', color:'#a8a29e', padding:'40px 0', background:'white', borderRadius:'16px', border:'1px dashed #e7e5e4'}}>No campaigns yet — create your first.</div>}
        {toast && <div style={{position:'fixed', bottom:'24px', right:'24px', background:'#1c1917', color:'#fff', padding:'12px 18px', borderRadius:'12px', fontSize:'13px', zIndex:100}}>{toast}</div>}
      </div>
    </div>
  );
}

