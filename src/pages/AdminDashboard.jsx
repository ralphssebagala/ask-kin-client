import { useEffect, useState } from 'react';
import TrafficLight from "../components/TrafficLight.jsx";
import TeamChat from './TeamChat.jsx';
import { GoogleLoginButton } from '../components/GoogleLoginButton.jsx' 
import SupportInbox from '../components/SupportInbox.jsx';

const API = import.meta.env.VITE_BACKEND_URL || 'https://api.ask-kin.com';

export default function AdminDashboard(){
  const [health, setHealth] = useState(null);
  const [delegates, setDelegates] = useState([]);
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('kyc');
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
    try{ const r=await fetch(`${API}/api/admin/delegates`, {headers:h}); if(r.status===401){ setAuthState('guest'); return; } const j=await r.json(); if(j.delegates){ setDelegates(j.delegates); setAuthState('authed'); } }catch{}
  }
  async function loadStats(){ const h=getHeaders(); if(!h) return; try{ const r=await fetch(`${API}/api/admin/stats`, {headers:h}); const j=await r.json(); setStats(j.stats||j);}catch{} }
  async function loadKyc(){
    const h=getHeaders(); if(!h) return; setKycLoading(true);
    try{ const r=await fetch(`${API}/api/admin/kyc/pending`, {headers:h}); const j=await r.json(); setKycList(j.kyc|| (Array.isArray(j)?j:[])); }catch(e){ console.log(e);} finally{ setKycLoading(false); }
  }
  async function handleOwnerLogin(e){
    e.preventDefault(); setLoading(true); setLoginError('');
    try{ const r=await fetch(`${API}/api/auth/login`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(loginForm)}); const j=await r.json(); if(!r.ok) throw new Error(j.error||'Login failed'); localStorage.setItem('token', j.token); setAuthState('authed'); loadDelegates(); loadStats(); loadHealth(); loadKyc(); }catch(err){ setLoginError(err.message);} finally{ setLoading(false); }
  }
  function handleOwnerLogout(){ localStorage.removeItem('token'); localStorage.removeItem('ownerToken'); setAuthState('guest'); setDelegates([]); }
  useEffect(()=>{ loadHealth(); const t=getToken(); if(!t) setAuthState('guest'); else { setAuthState('authed'); loadDelegates(); loadStats(); loadKyc(); } const iv=setInterval(loadHealth,15000); return ()=>clearInterval(iv); },[]);
  useEffect(()=>{ if(tab==='kyc') loadKyc(); },[tab]);
  async function addDelegate(e){ e.preventDefault(); setLoading(true); const h=getHeaders(); if(!h){ alert('Not signed in'); setLoading(false); return;} try{ const r=await fetch(`${API}/api/admin/delegates`, {method:'POST', headers:h, body:JSON.stringify(form)}); const j=await r.json(); if(!r.ok) throw new Error(j.error||'Failed'); alert(`✅ Delegate: ${j.delegate.EMAIL}`); loadDelegates(); }catch(err){ alert(err.message);} finally{ setLoading(false);} }
  async function revoke(id){ if(!confirm('Revoke?')) return; const h=getHeaders(); await fetch(`${API}/api/admin/delegates/${id}`, {method:'DELETE', headers:h}); loadDelegates(); }
  async function kycAction(id, action){ if(!confirm(`${action.toUpperCase()} this KYC?`)) return; const h=getHeaders(); try{ const r=await fetch(`${API}/api/admin/kyc/${id}/${action}`, {method:'POST', headers:h}); const j=await r.json(); if(!r.ok) throw new Error(j.error||j.message||'Failed'); alert(`✅ KYC ${action}ed`); loadKyc(); }catch(err){ alert(err.message);} }

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
            <GoogleLoginButton />
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
          <div style={{padding:'4px 10px', borderRadius:'999px', fontSize:'10px', fontWeight:'800', background: ok?'#dcfce7':'#fef3c7', color: ok?'#16a34a':'#d97706'}}>{ok?'ACTIVE':'ATTENTION'}</div>
        </div>
        <h3 style={{fontWeight:'700', fontSize:'15px'}}>{label}</h3>
        <p style={{fontSize:'12px', color:'#888', marginTop:'4px'}}>{data?.message || (ok?'All good':'Check needed')}</p>
      </div>
    );
  };

  return (
    <div style={{minHeight:'100vh', background:'#fbfaf7', fontFamily:'Inter, system-ui, sans-serif'}}>
      <div style={{background:'white', borderBottom:'1px solid #f1f5f9', padding:'14px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:10}}>
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          <img src="/logo.png" alt="Ask Kin" style={{width:'36px', height:'36px', borderRadius:'10px', objectFit:'contain'}} />
          <div>
            <p style={{fontSize:'14px', fontWeight:'800', color:'#0f4d3a', lineHeight:'1'}}>Ask Kin</p>
            <p style={{fontSize:'11px', color:'#6b7280'}}>Owner Dashboard</p>
          </div>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          <span style={{fontSize:'11px', background:'#dcfce7', padding:'6px 10px', borderRadius:'999px', fontWeight:'700', color:'#16a34a'}}>OWNER</span>
          <button onClick={handleOwnerLogout} style={{fontSize:'12px', padding:'8px 14px', borderRadius:'999px', border:'1px solid #e5e7eb', background:'white', fontWeight:'600', cursor:'pointer'}}>Logout</button>
        </div>
      </div>

      <div style={{maxWidth:'1200px', margin:'0 auto', padding:'20px 16px 40px'}}>
        {health && <TrafficLight health={health} />}

        <div style={{display:'flex', gap:'8px', margin:'20px 0'}}>
          {['kyc','support','health','delegates','overview'].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:'10px 18px', borderRadius:'999px', border:'1px solid #e5e7eb', background: tab===t?'black':'white', color: tab===t?'white':'#111827', fontWeight:'700', fontSize:'12px', textTransform:'uppercase', letterSpacing:'0.5px', cursor:'pointer'}}>{t}</button>
          ))}
        </div>

        {tab==='kyc' && (
          <div style={{background:'white', borderRadius:'24px', padding:'24px', border:'1px solid #f0f0f0'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
              <h2 style={{fontWeight:'800', fontSize:'16px'}}>{kycList.length} KYC Pending</h2>
              <button onClick={loadKyc} style={{fontSize:'11px', background:'black', color:'white', padding:'8px 14px', borderRadius:'999px', border:'none', fontWeight:'700', cursor:'pointer'}}>Refresh</button>
            </div>
            {kycLoading ? <p style={{textAlign:'center', color:'#9ca3af', fontSize:'13px', padding:'20px'}}>Loading...</p> : kycList.length===0 ? (
              <div style={{textAlign:'center', padding:'28px', background:'#f0fdf4', borderRadius:'16px', border:'1px dashed #bbf7d0'}}>
                <p style={{fontSize:'32px'}}>✅</p><p style={{fontWeight:'700', color:'#16a34a', marginTop:'8px'}}>All clear!</p>
              </div>
            ) : (
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'16px'}}>
                {kycList.map(k=>(
                  <div key={k.ID || k.id} style={{border:'1px solid #f0f0f0', borderRadius:'20px', padding:'16px', background:'#fbfaf7'}}>
                    <div style={{width:'48px', height:'48px', borderRadius:'999px', background:'#fef3c7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', fontWeight:'800'}}>👤</div>
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
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'16px'}}>
            <Card icon="💳" label="Pesapal" data={health.pesapal} />
            <Card icon="🗄️" label="Oracle" data={health.oracle} />
            <Card icon="🌐" label="Ngrok" data={health.ngrok} />
            <Card icon="💸" label="Payout" data={{status: health.payout?.status, message: `${health.payout?.queue||0} ready`}} />
          </div>
        )}

        {tab==='delegates' && (
          <div style={{display:'grid', gridTemplateColumns:'360px 1fr', gap:'24px'}}>
            <form onSubmit={addDelegate} style={{background:'white', borderRadius:'20px', padding:'24px', border:'1px solid #f0f0f0', height:'fit-content'}}>
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
            <div style={{background:'white', borderRadius:'20px', padding:'24px', border:'1px solid #f0f0f0'}}>
              <h2 style={{fontWeight:'700', marginBottom:'16px'}}>Active Delegates ({delegates.length})</h2>
              {delegates.map(d=>(
                <div key={d.ID} style={{display:'flex', justifyContent:'space-between', padding:'12px', borderRadius:'12px', background:'#f9f8f5', marginBottom:'8px'}}>
                  <div><p style={{fontWeight:'600', fontSize:'13px'}}>{d.NAME}</p><p style={{fontSize:'11px', color:'#888'}}>{d.EMAIL} • {d.EXPIRES_AT ? new Date(d.EXPIRES_AT).toLocaleDateString() : 'PERMANENT 🟢'}</p></div>
                  <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                    <span style={{fontSize:'11px', background:'#dcfce7', padding:'4px 10px', borderRadius:'999px', fontWeight:'700'}}>ACTIVE</span>
                    <button onClick={()=>revoke(d.ID)} style={{fontSize:'11px', padding:'4px 12px', borderRadius:'999px', background:'#fef2f2', color:'#dc2626', border:'none', cursor:'pointer'}}>Revoke</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='overview' && (
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'16px'}}>
            <div style={{background:'white', borderRadius:'20px', padding:'24px', border:'1px solid #f0f0f0'}}><p style={{fontSize:'11px', color:'#888', fontWeight:'700'}}>Total Delegates</p><p style={{fontSize:'28px', fontWeight:'800', marginTop:'8px'}}>{delegates.length}</p></div>
            <div style={{background:'white', borderRadius:'20px', padding:'24px', border:'1px solid #f0f0f0'}}><p style={{fontSize:'11px', color:'#888', fontWeight:'700'}}>Pending KYC</p><p style={{fontSize:'28px', fontWeight:'800', marginTop:'8px'}}>{kycList.length}</p></div>
            <div style={{background:'white', borderRadius:'20px', padding:'24px', border:'1px solid #f0f0f0'}}><p style={{fontSize:'11px', color:'#888', fontWeight:'700'}}>Campaigns</p><p style={{fontSize:'28px', fontWeight:'800', marginTop:'8px'}}>{stats?.totalCampaigns?? '-'}</p></div>
          </div>
        )}
      </div>
      <TeamChat />
    </div>
  );
}

