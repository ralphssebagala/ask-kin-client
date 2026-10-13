
import { useEffect, useState } from 'react';
import TrafficLight from "../components/TrafficLight.jsx";
import TeamChat from './TeamChat.jsx';
import SupportInbox from '../components/SupportInbox.jsx';

const API = import.meta.env.VITE_BACKEND_URL || 'https://api.ask-kin.com';

export default function AdminDashboard(){
  const [health, setHealth] = useState(null);
  const [delegates, setDelegates] = useState([]);
  const [stats, setStats] = useState(null);
  const [donationStats, setDonationStats] = useState({today:0, todayCount:0, week:0, weekCount:0, todayUGX:0, weekUGX:0});
  const [tab, setTab] = useState('overview');
  const [form, setForm] = useState({name:'Evelyn Amony', email:'amongieeve@gmail.com', phone:'+256782597149', role:'delegate', password:'Evelyn@2026'});
  const [loading, setLoading] = useState(false);
  const [authState, setAuthState] = useState('checking');
  const [loginForm, setLoginForm] = useState({email:'askkin.client@gmail.com', password:'Owner@2026'});
  const [loginError, setLoginError] = useState('');
  const [kycList, setKycList] = useState([]);
  const [kycLoading, setKycLoading] = useState(false);

  function getToken(){ return localStorage.getItem('token') || localStorage.getItem('ownerToken') || localStorage.getItem('authToken'); }
  function getHeaders(){ const t=getToken(); if(!t) return null; return {'Content-Type':'application/json', Authorization:`Bearer ${t}`}; }

  async function loadHealth(){ try{ const r=await fetch(`${API}/api/admin/health`); const j=await r.json(); if(j.health) setHealth(j.health);}catch{} }
  async function loadDelegates(){
    const h=getHeaders(); if(!h){ setAuthState('guest'); return; }
    try{ const r=await fetch(`${API}/api/admin/delegates`, {headers:h}); if(r.status===401 || r.status===403){ setAuthState('guest'); localStorage.removeItem('token'); return; } const j=await r.json(); if(j.delegates){ setDelegates(j.delegates); setAuthState('authed'); } else { setAuthState('guest'); } }catch{ setAuthState('guest'); }
  }
  async function loadStats(){
    const h=getHeaders(); if(!h) return;
    try{
      const r=await fetch(`${API}/api/admin/stats`, {headers:h});
      const j=await r.json();
      const s=j.stats||j;
      setStats(s);
      setDonationStats({
        today: s.donationsTodayAmount ?? s.todayAmount ?? 0,
        todayCount: s.donationsToday ?? s.todayCount ?? s.donationsTodayCount ?? 0,
        week: s.donationsWeekAmount ?? s.weekAmount ?? 0,
        weekCount: s.donationsWeek ?? s.weekCount ?? s.donationsWeekCount ?? 0,
        todayUGX: s.donationsTodayAmount ?? s.todayAmount ?? 0,
        weekUGX: s.donationsWeekAmount ?? s.weekAmount ?? 0
      });
    }catch(e){ console.log('stats', e.message); }
    try{
      const r2=await fetch(`${API}/api/admin/donations/summary`, {headers:getHeaders()});
      if(r2.ok){
        const j2=await r2.json();
        setDonationStats(prev=>({
          today: j2.todayAmount ?? prev.today,
          todayCount: j2.todayCount ?? prev.todayCount,
          week: j2.weekAmount ?? prev.week,
          weekCount: j2.weekCount ?? prev.weekCount,
          todayUGX: j2.todayAmount ?? prev.todayUGX,
          weekUGX: j2.weekAmount ?? prev.weekUGX
        }));
      }
    }catch{}
  }
  async function loadKyc(){
    const h=getHeaders(); if(!h) return; setKycLoading(true);
    try{ const r=await fetch(`${API}/api/admin/kyc/pending`, {headers:h}); const j=await r.json(); setKycList(j.kyc|| (Array.isArray(j)?j:[])); }catch(e){} finally{ setKycLoading(false); }
  }
  async function handleOwnerLogin(e){
    e.preventDefault(); setLoading(true); setLoginError('');
    try{ const r=await fetch(`${API}/api/auth/owner/login`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(loginForm)}); const j=await r.json(); if(!r.ok) throw new Error(j.error||'Login failed'); localStorage.setItem('token', j.token); setAuthState('authed'); loadDelegates(); loadStats(); loadHealth(); loadKyc(); }catch(err){ setLoginError(err.message);} finally{ setLoading(false); }
  }
  function handleOwnerLogout(){ localStorage.removeItem('token'); localStorage.removeItem('ownerToken'); setAuthState('guest'); setDelegates([]); }
  useEffect(()=>{ loadHealth(); const t=getToken(); if(!t) setAuthState('guest'); else { loadDelegates(); } const iv=setInterval(loadHealth,15000); return ()=>clearInterval(iv); },[]);
  useEffect(()=>{ if(authState==='authed'){ loadStats(); loadKyc(); } },[authState]);
  useEffect(()=>{ if(tab==='kyc') loadKyc(); },[tab]);
  async function addDelegate(e){ e.preventDefault(); setLoading(true); const h=getHeaders(); if(!h){ alert('Not signed in'); setLoading(false); return;} try{ const r=await fetch(`${API}/api/admin/delegates`, {method:'POST', headers:h, body:JSON.stringify(form)}); const j=await r.json(); if(!r.ok) throw new Error(j.error||'Failed'); alert(`✅ Delegate: ${j.delegate.EMAIL}`); loadDelegates(); }catch(err){ alert(err.message);} finally{ setLoading(false);} }
  async function revoke(id){ if(!confirm('Revoke?')) return; const h=getHeaders(); await fetch(`${API}/api/admin/delegates/${id}`, {method:'DELETE', headers:h}); loadDelegates(); }
  async function kycAction(id, action){ if(!confirm(`${action.toUpperCase()} this KYC?`)) return; const h=getHeaders(); try{ const r=await fetch(`${API}/api/admin/kyc/${id}/${action}`, {method:'POST', headers:h}); const j=await r.json(); if(!r.ok) throw new Error(j.error||j.message||'Failed'); alert(`✅ KYC ${action}ed`); loadKyc(); }catch(err){ alert(err.message);} }

  if(authState==='checking') return <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>Loading...</div>;

  if(authState==='guest'){
    return (
      <div style={{minHeight:'100vh', background:'#fbfaf7', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}>
        <form onSubmit={handleOwnerLogin} style={{background:'white', borderRadius:'24px', padding:'32px', width:'100%', maxWidth:'400px', border:'1px solid #f0f0f0', boxShadow:'0 20px 40px rgba(0,0,0,0.06)'}}>
          <div style={{textAlign:'center', marginBottom:'20px'}}><h1 style={{fontSize:'24px', fontWeight:'800'}}>Ask Kin — Owner Login</h1><p style={{fontSize:'13px', color:'#888', marginTop:'6px'}}>Sign in to manage delegates & KYC</p></div>
          {loginError && <div style={{background:'#fef2f2', color:'#dc2626', padding:'12px', borderRadius:'12px', fontSize:'13px', marginBottom:'16px'}}>{loginError}</div>}
          <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
            <input style={{background:'#f9f8f5', border:'1px solid #eee', borderRadius:'999px', padding:'14px 18px', fontSize:'14px'}} placeholder="Owner Email" type="email" value={loginForm.email} onChange={e=>setLoginForm({...loginForm, email:e.target.value})} required/>
            <input style={{background:'#fffbeb', border:'1px solid #fde68a', borderRadius:'999px', padding:'14px 18px', fontSize:'14px'}} placeholder="Owner Password" type="password" value={loginForm.password} onChange={e=>setLoginForm({...loginForm, password:e.target.value})} required/>
            <button disabled={loading} style={{background:'black', color:'white', padding:'14px', borderRadius:'999px', fontSize:'14px', fontWeight:'800', border:'none', cursor:'pointer'}}>{loading?'Signing in...':'Sign In as Owner →'}</button>
          </div>
        </form>
      </div>
    );
  }

  const Card = ({label, data, icon})=>{
    const ok = data?.status==='ok';
    return (
      <div style={{background:'white', borderRadius:'20px', padding:'20px', border:'1px solid #f0f0f0'}}>
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'12px'}}>
          <div style={{width:'40px', height:'40px', borderRadius:'999px', background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center'}}>{icon}</div>
          <span style={{fontSize:'10px', padding:'4px 10px', borderRadius:'999px', background: ok?'#dcfce7':'#fef3c7', color: ok?'#16a34a':'#d97706', fontWeight:'700'}}>{ok?'OK':'ISSUE'}</span>
        </div>
        <p style={{fontSize:'13px', fontWeight:'700'}}>{label}</p>
        <p style={{fontSize:'12px', color:'#666', marginTop:'4px'}}>{data?.message||''}</p>
      </div>
    );
  };

  return (
    <div style={{minHeight:'100vh', background:'#fbfaf7', padding:'16px'}}>
      <style>{`
        .ak-tabs{display:flex;flex-wrap:wrap;gap:8px;padding-bottom:8px}
        .ak-tab{flex:0 0 auto;background:white;border:1px solid #e5e7eb;border-radius:999px;padding:10px 16px;font-size:13px;font-weight:800;cursor:pointer}
        .ak-tab.active{background:black;color:white;border-color:black}
        .ak-overview-grid{grid-template-columns:repeat(auto-fit, minmax(220px, 1fr))}
        @media(max-width:768px){
          .ak-overview-grid{grid-template-columns:1fr 1fr}
          .ak-delegates-grid{grid-template-columns:1fr !important}
          .ak-health-grid{grid-template-columns:1fr 1fr !important}
        }
        @media(max-width:480px){
          .ak-overview-grid{grid-template-columns:1fr !important}
          .ak-health-grid{grid-template-columns:1fr !important}
        }
      `}</style>
      <div style={{maxWidth:'1200px', margin:'0 auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
            <h1 style={{fontSize:'18px', fontWeight:'800'}}>Owner Dashboard</h1>
            <span style={{fontSize:'10px', background:'#dcfce7', color:'#16a34a', padding:'4px 10px', borderRadius:'999px', fontWeight:'800'}}>OWNER</span>
          </div>
          <button onClick={handleOwnerLogout} style={{background:'white', border:'1px solid #e5e7eb', borderRadius:'999px', padding:'8px 16px', fontSize:'13px', fontWeight:'700', cursor:'pointer'}}>Logout</button>
        </div>

        <div className="ak-tabs" style={{marginBottom:'20px'}}>
          <button onClick={()=>setTab('kyc')} className={`ak-tab ${tab==='kyc'?'active':''}`}>KYC PENDING ({kycList.length})</button>
          <button onClick={()=>setTab('support')} className={`ak-tab ${tab==='support'?'active':''}`}>SUPPORT</button>
          <button onClick={()=>setTab('health')} className={`ak-tab ${tab==='health'?'active':''}`}>HEALTH</button>
          <button onClick={()=>setTab('delegates')} className={`ak-tab ${tab==='delegates'?'active':''}`}>DELEGATES ({delegates.length})</button>
          <button onClick={()=>setTab('overview')} className={`ak-tab ${tab==='overview'?'active':''}`}>OVERVIEW</button>
        </div>

        {tab==='kyc' && (
          <div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
              <h2 style={{fontWeight:'800', fontSize:'18px'}}>Pending KYC ({kycList.length})</h2>
              <button onClick={loadKyc} style={{background:'white', border:'1px solid #e5e7eb', borderRadius:'999px', padding:'8px 14px', fontSize:'12px', fontWeight:'700', cursor:'pointer'}}>Refresh</button>
            </div>
            {kycLoading && <p style={{fontSize:'13px', color:'#888'}}>Loading KYC...</p>}
            {!kycLoading && kycList.length===0 && <p style={{fontSize:'13px', color:'#888'}}>No pending KYC - all clear 🟢</p>}
            {!kycLoading && kycList.length>0 && (
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'16px'}}>
                {kycList.map(k=>(
                  <div key={k.ID || k.id} style={{background:'white', borderRadius:'20px', padding:'20px', border:'1px solid #f0f0f0'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                      <span style={{fontSize:'10px', background:'#fef9c3', padding:'4px 10px', borderRadius:'999px', fontWeight:'700'}}>PENDING</span>
                      <TrafficLight status={k.KYC_STATUS || k.STATUS} />
                    </div>
                    <div style={{marginTop:'12px'}}>
                      <p style={{fontWeight:'700', fontSize:'14px'}}>{k.FULL_NAME || k.fullName || k.NAME}</p>
                      <p style={{fontSize:'12px', color:'#666', marginTop:'4px'}}>{k.EMAIL || k.email}</p>
                      <div style={{marginTop:'10px', fontSize:'12px', lineHeight:'1.6'}}>
                        <div><b>MM:</b> {k.PROVIDER || k.provider} - {k.MOBILE_MONEY_NUMBER || k.mobileMoneyNumber}</div>
                        <div><b>MM Name:</b> {k.MOBILE_MONEY_NAME || k.mobileMoneyName}</div>
                        <div><b>ID:</b> {k.ID_TYPE || k.idType} - {k.ID_NUMBER || k.idNumber}</div>
                      </div>
                    </div>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginTop:'12px'}}>
                      <button onClick={()=>kycAction(k.ID || k.id, 'approve')} style={{background:'#16a34a', color:'white', border:'none', padding:'12px', borderRadius:'999px', fontWeight:'800', fontSize:'13px', cursor:'pointer'}}>✅ Approve</button>
                      <button onClick={()=>kycAction(k.ID || k.id, 'reject')} style={{background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', padding:'12px', borderRadius:'999px', fontWeight:'800', fontSize:'13px', cursor:'pointer'}}>❌ Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab==='support' && (
          <div>
            <div style={{marginBottom:'16px'}}>
              <h2 style={{fontWeight:'800', fontSize:'18px'}}>💬 Human Support Inbox</h2>
              <p style={{fontSize:'12px', color:'#888', marginTop:'4px'}}>Live chats from FAQ → distinct from AI Assistant at /assistant. Reply as real human.</p>
            </div>
            <SupportInbox />
          </div>
        )}

        {tab==='health' && health && (
          <div className="ak-health-grid" style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'16px'}}>
            <Card icon="💳" label="Pesapal" data={health.pesapal} />
            <Card icon="🗄️" label="Oracle" data={health.oracle} />
            <Card icon="🌐" label="Ngrok" data={health.ngrok} />
            <Card icon="💸" label="Payout" data={{status: health.payout?.status, message: `${health.payout?.queue||0} ready`}} />
          </div>
        )}

        {tab==='delegates' && (
          <div className="ak-delegates-grid" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
            <form onSubmit={addDelegate} style={{background:'white', borderRadius:'20px', padding:'20px', border:'1px solid #f0f0f0', height:'fit-content'}}>
              <h2 style={{fontWeight:'700', fontSize:'16px', marginBottom:'4px'}}>Add Permanent Delegate</h2>
              <p style={{fontSize:'12px', color:'#16a34a', marginBottom:'16px', fontWeight:'600'}}>✅ Permanent until you revoke</p>
              <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                <input style={{background:'#f9f8f5', border:'1px solid #eee', borderRadius:'999px', padding:'12px 16px', fontSize:'13px'}} placeholder="Full Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required/>
                <input style={{background:'#f9f8f5', border:'1px solid #eee', borderRadius:'999px', padding:'12px 16px', fontSize:'13px'}} placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required/>
                <input style={{background:'#f9f8f5', border:'1px solid #eee', borderRadius:'999px', padding:'12px 16px', fontSize:'13px'}} placeholder="Phone" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})}/>
                <input style={{background:'#fffbeb', border:'2px solid #fde68a', borderRadius:'999px', padding:'12px 16px', fontSize:'13px', fontWeight:'600'}} placeholder="Password for delegate" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required/>
                <button type="submit" disabled={loading} style={{background:'black', color:'white', padding:'14px', borderRadius:'999px', fontSize:'14px', fontWeight:'800', border:'none', cursor:'pointer'}}>{loading?'Creating...':'✅ Add Permanent Delegate'}</button>
              </div>
            </form>
            <div style={{background:'white', borderRadius:'20px', padding:'20px', border:'1px solid #f0f0f0'}}>
              <h2 style={{fontWeight:'700', marginBottom:'16px'}}>Active Delegates ({delegates.length})</h2>
              {delegates.map(d=>(
                <div key={d.ID} style={{display:'flex', justifyContent:'space-between', padding:'12px', borderRadius:'12px', background:'#f9f8f5', marginBottom:'8px', gap:'8px'}}>
                  <div style={{minWidth:0}}><p style={{fontWeight:'600', fontSize:'13px', wordBreak:'break-all'}}>{d.NAME}</p><p style={{fontSize:'11px', color:'#888', wordBreak:'break-all'}}>{d.EMAIL} • {d.EXPIRES_AT ? new Date(d.EXPIRES_AT).toLocaleDateString() : 'PERMANENT 🟢'}</p></div>
                  <div style={{display:'flex', gap:'8px', alignItems:'center', flexShrink:0}}>
                    <span style={{fontSize:'11px', background:'#dcfce7', padding:'4px 10px', borderRadius:'999px', fontWeight:'700'}}>ACTIVE</span>
                    <button onClick={()=>revoke(d.ID)} style={{fontSize:'11px', padding:'4px 12px', borderRadius:'999px', background:'#fef2f2', color:'#dc2626', border:'none', cursor:'pointer'}}>Revoke</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='overview' && (
          <div>
            <div className="ak-overview-grid" style={{display:'grid', gap:'16px', marginBottom:'16px'}}>
              <div style={{background:'white', borderRadius:'20px', padding:'20px', border:'1px solid #f0f0f0', position:'relative'}}>
                <div style={{width:'36px', height:'36px', borderRadius:'999px', background:'#fef9c3', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'12px'}}>💰</div>
                <p style={{fontSize:'11px', color:'#888', fontWeight:'700', letterSpacing:'0.5px'}}>DONATIONS TODAY</p>
                <p style={{fontSize:'28px', fontWeight:'900', marginTop:'6px'}}>{donationStats.todayCount||0}</p>
                <p style={{fontSize:'12px', color:'#666', marginTop:'4px'}}>UGX {(donationStats.todayUGX||donationStats.today||0).toLocaleString()}</p>
                <div style={{position:'absolute', top:'16px', right:'16px', width:'8px', height:'8px', borderRadius:'999px', background:'#16a34a'}}></div>
              </div>
              <div style={{background:'white', borderRadius:'20px', padding:'20px', border:'1px solid #f0f0f0', position:'relative'}}>
                <div style={{width:'36px', height:'36px', borderRadius:'999px', background:'#f0f9ff', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'12px'}}>📈</div>
                <p style={{fontSize:'11px', color:'#888', fontWeight:'700', letterSpacing:'0.5px'}}>THIS WEEK</p>
                <p style={{fontSize:'22px', fontWeight:'900', marginTop:'6px'}}>{donationStats.weekCount||0} donations</p>
                <p style={{fontSize:'12px', color:'#666', marginTop:'4px'}}>UGX {(donationStats.weekUGX||donationStats.week||0).toLocaleString()} • Last 7 days</p>
                <div style={{position:'absolute', top:'16px', right:'16px', width:'8px', height:'8px', borderRadius:'999px', background:'#3b82f6'}}></div>
              </div>
              <div style={{background:'white', borderRadius:'20px', padding:'20px', border:'1px solid #f0f0f0'}}>
                <p style={{fontSize:'11px', color:'#888', fontWeight:'700'}}>KYC PENDING</p>
                <p style={{fontSize:'28px', fontWeight:'800', marginTop:'8px'}}>{kycList.length}</p>
              </div>
              <div style={{background:'white', borderRadius:'20px', padding:'20px', border:'1px solid #f0f0f0'}}>
                <p style={{fontSize:'11px', color:'#888', fontWeight:'700'}}>ACTIVE CAMPAIGNS</p>
                <p style={{fontSize:'28px', fontWeight:'800', marginTop:'8px'}}>{stats?.totalCampaigns?? stats?.activeCampaigns?? 0}</p>
              </div>
              <div style={{background:'white', borderRadius:'20px', padding:'20px', border:'1px solid #f0f0f0'}}>
                <p style={{fontSize:'11px', color:'#888', fontWeight:'700'}}>Total Delegates</p>
                <p style={{fontSize:'28px', fontWeight:'800', marginTop:'8px'}}>{delegates.length}</p>
              </div>
              <div style={{background:'white', borderRadius:'20px', padding:'20px', border:'1px solid #f0f0f0'}}>
                <p style={{fontSize:'11px', color:'#888', fontWeight:'700'}}>Campaigns</p>
                <p style={{fontSize:'28px', fontWeight:'800', marginTop:'8px'}}>{stats?.totalCampaigns?? '-'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <TeamChat />
    </div>
  );
}

