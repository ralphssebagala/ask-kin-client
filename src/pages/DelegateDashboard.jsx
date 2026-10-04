import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TeamChat from './TeamChat.jsx';
import SupportInbox from '../components/SupportInbox.jsx';

const API = import.meta.env.VITE_BACKEND_URL || 'https://api.ask-kin.com';

export default function DelegateDashboard(){
  const [light, setLight] = useState(null);
  const [cards, setCards] = useState([]);
  const [kyc, setKyc] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('kyc');
  const navigate = useNavigate();
  
  const token = localStorage.getItem('token');
  const delegate = JSON.parse(localStorage.getItem('delegate') || 'null');

  const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : null;

  useEffect(()=>{
    if(!token){
      navigate('/delegate-login');
      return;
    }
    loadAll();
    const iv = setInterval(()=>{ loadHealth(); loadCards(); }, 15000);
    return ()=>clearInterval(iv);
  },[]);

  async function loadAll(){
    await Promise.all([loadHealth(), loadCards(), loadKyc()]);
  }

  async function loadHealth(){
    try{
      const r = await fetch(`${API}/api/admin/health/delegate`, {headers});
      if(r.status===401){ navigate('/delegate-login'); return; }
      const j = await r.json();
      setLight(j);
    }catch{}
  }
  async function loadCards(){
    try{
      const r = await fetch(`${API}/api/delegate/cards`, {headers});
      if(r.status===401){ navigate('/delegate-login'); return; }
      const j = await r.json();
      if(j.cards && j.cards.length>0) setCards(j.cards);
      else {
        setCards([
          { id: 'donations_today', title: 'Donations Today', value: j.donationsToday ?? '0', sub: 'Today', icon: '💰', color: 'green' },
          { id: 'donations_week', title: 'This Week', value: `${j.donationsWeek ?? '0'} donations`, sub: 'Last 7 days', icon: '📈', color: 'blue' },
          { id: 'kyc_pending', title: 'KYC Pending', value: `${j.kycPending ?? '0'}`, sub: 'Needs review', icon: '🪪', color: (j.kycPending>0)?'yellow':'green' },
          { id: 'campaigns', title: 'Active Campaigns', value: `${j.campaigns?.length || 0}`, sub: 'Live now', icon: '🎯', color: 'purple' },
        ]);
      }
    }catch{}
  }
  async function loadKyc(){
    try{
      const r = await fetch(`${API}/api/delegate/kyc/pending`, {headers});
      if(r.status===401){ navigate('/delegate-login'); return; }
      const j = await r.json();
      if(j.pending) setKyc(j.pending);
      setLoading(false);
    }catch{ setLoading(false); }
  }

  async function act(url){
    if(!confirm('Confirm this action? It will be logged.')) return;
    const r = await fetch(url, {method:'POST', headers});
    if(r.status===401){ navigate('/delegate-login'); return; }
    const j = await r.json();
    alert(j.message || 'Done ✅');
    loadKyc(); loadCards(); loadHealth();
  }

  function logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('delegate');
    navigate('/delegate-login');
  }

  const cardStyle = (color) => {
    const map = {
      green: { bg:'#f0fdf4', border:'#bbf7d0', dot:'#16a34a' },
      blue: { bg:'#eff6ff', border:'#bfdbfe', dot:'#2563eb' },
      yellow: { bg:'#fefce8', border:'#fde68a', dot:'#ca8a04' },
      purple: { bg:'#faf5ff', border:'#e9d5ff', dot:'#9333ea' },
      red: { bg:'#fef2f2', border:'#fecaca', dot:'#dc2626' },
    };
    return map[color] || map.green;
  };

  return (
    <div style={{minHeight:'100vh', background:'#fbfaf7', fontFamily:'Inter, system-ui, sans-serif'}}>
      <div style={{background:'white', borderBottom:'1px solid #f1f5f9', padding:'14px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:10}}>
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          <img src="/logo.png" alt="Ask Kin" style={{width:'36px', height:'36px', borderRadius:'10px', objectFit:'contain'}} />
          <div>
            <p style={{fontSize:'14px', fontWeight:'800', color:'#0f4d3a', lineHeight:'1'}}>Ask Kin</p>
            <p style={{fontSize:'11px', color:'#6b7280'}}>Delegate Dashboard</p>
          </div>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          <button onClick={logout} style={{fontSize:'12px', padding:'8px 14px', borderRadius:'999px', border:'1px solid #e5e7eb', background:'white', fontWeight:'600', cursor:'pointer'}}>Logout</button>
        </div>
      </div>

      <div style={{maxWidth:'900px', margin:'0 auto', padding:'20px 16px 40px'}}>
        <div style={{display:'flex', justifyContent:'center', marginBottom:'16px'}}>
          <div style={{background:'black', color:'white', padding:'8px 16px', borderRadius:'999px', fontSize:'12px', fontWeight:'600', display:'flex', alignItems:'center', gap:'8px'}}>
            <span style={{width:'8px', height:'8px', background:'#22c55e', borderRadius:'999px', display:'inline-block'}}></span>
            Welcome {delegate?.name || 'Evelyn Amony'} • Permanent access
          </div>
        </div>

        <div style={{
          background: light?.light==='green' ? '#16a34a' : light?.light==='yellow' ? '#facc15' : light?.light==='red' ? '#dc2626' : '#16a34a',
          color: light?.light==='yellow' ? 'black' : 'white',
          borderRadius:'24px',
          padding:'20px 24px',
          marginBottom:'20px',
          boxShadow:'0 12px 32px rgba(22,163,74,0.25)',
          display:'flex',
          justifyContent:'space-between',
          alignItems:'center'
        }}>
          <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
            <div style={{width:'36px', height:'36px', background:'rgba(255,255,255,0.2)', borderRadius:'999px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px'}}>
              {light?.emoji || '🟢'}
            </div>
            <div>
              <p style={{fontSize:'16px', fontWeight:'800', letterSpacing:'0.5px'}}>{(light?.light || 'GREEN').toUpperCase()}</p>
              <p style={{fontSize:'13px', opacity:0.9, marginTop:'2px'}}>{light?.message || 'All systems operational - Ready for Monday payout'}</p>
            </div>
          </div>
          <button onClick={loadHealth} style={{background:'rgba(255,255,255,0.2)', border:'none', padding:'8px 14px', borderRadius:'999px', color:'white', fontWeight:'700', fontSize:'11px', cursor:'pointer'}}>Refresh</button>
        </div>

        <div style={{display:'flex', gap:'8px', marginBottom:'16px'}}>
          <button onClick={()=>setTab('kyc')} style={{padding:'10px 18px', borderRadius:'999px', border:'none', background: tab==='kyc' ? 'black' : 'white', color: tab==='kyc' ? 'white' : '#111827', fontWeight:'700', fontSize:'13px', cursor:'pointer', borderWidth:'1px', borderStyle:'solid', borderColor:'#e5e7eb'}}>🪪 KYC</button>
          <button onClick={()=>setTab('support')} style={{padding:'10px 18px', borderRadius:'999px', border:'none', background: tab==='support' ? 'black' : 'white', color: tab==='support' ? 'white' : '#111827', fontWeight:'700', fontSize:'13px', cursor:'pointer', borderWidth:'1px', borderStyle:'solid', borderColor:'#e5e7eb'}}>💬 Support</button>
        </div>

        {tab==='kyc' && (
          <>
            <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'12px', marginBottom:'20px'}}>
              {cards.map(c=>{
                const st = cardStyle(c.color);
                return (
                  <div key={c.id} style={{background:'white', borderRadius:'20px', padding:'18px', border:`1px solid ${st.border}`, boxShadow:'0 4px 20px rgba(0,0,0,0.03)'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px'}}>
                      <div style={{width:'40px', height:'40px', borderRadius:'12px', background:st.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px'}}>{c.icon}</div>
                      <div style={{width:'8px', height:'8px', borderRadius:'999px', background:st.dot}}></div>
                    </div>
                    <p style={{fontSize:'11px', color:'#6b7280', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.5px'}}>{c.title}</p>
                    <p style={{fontSize:'22px', fontWeight:'800', marginTop:'4px', color:'#111827'}}>{c.value}</p>
                    {c.sub && <p style={{fontSize:'11px', color:'#9ca3af', marginTop:'4px'}}>{c.sub}</p>}
                  </div>
                );
              })}
            </div>

            <div style={{background:'white', borderRadius:'24px', padding:'22px', border:'1px solid #f0f0f0', boxShadow:'0 8px 30px rgba(0,0,0,0.04)'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
                <h2 style={{fontWeight:'800', fontSize:'16px', display:'flex', alignItems:'center', gap:'8px'}}>
                  <span style={{background:'#fef3c7', width:'28px', height:'28px', borderRadius:'999px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px'}}>🪪</span>
                  {kyc.length} KYC Pending
                </h2>
                <button onClick={loadKyc} style={{fontSize:'11px', background:'black', color:'white', padding:'8px 14px', borderRadius:'999px', border:'none', fontWeight:'700', cursor:'pointer'}}>Refresh</button>
              </div>

              {loading ? (
                <p style={{fontSize:'13px', color:'#9ca3af', textAlign:'center', padding:'24px'}}>Loading KYC...</p>
              ) : kyc.length===0 ? (
                <div style={{textAlign:'center', padding:'28px 20px', background:'#f0fdf4', borderRadius:'16px', border:'1px dashed #bbf7d0'}}>
                  <p style={{fontSize:'32px'}}>✅</p>
                  <p style={{fontSize:'14px', fontWeight:'700', color:'#16a34a', marginTop:'8px'}}>All clear! No pending KYC</p>
                  <p style={{fontSize:'11px', color:'#6b7280', marginTop:'4px'}}>You're up to date - check back later</p>
                </div>
              ) : (
                <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                  {kyc.map(person=>(
                    <div key={person.ID || person.id} style={{border:'1px solid #f3f4f6', borderRadius:'16px', padding:'14px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fbfaf7'}}>
                      <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                        <div style={{width:'36px', height:'36px', borderRadius:'999px', background:'#fef3c7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:'800', color:'#92400e'}}>
                          {(person.EMAIL||person.email||'?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{fontWeight:'700', fontSize:'13px', color:'#111827'}}>{person.EMAIL || person.email}</p>
                          <p style={{fontSize:'11px', color:'#9ca3af'}}>{person.ID_TYPE || 'NATIONAL_ID'} • {new Date(person.CREATED_AT || person.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div style={{display:'flex', gap:'8px'}}>
                        <button onClick={()=>act(`${API}/api/delegate/kyc/${person.ID || person.id}/approve`)} style={{background:'#16a34a', color:'white', padding:'10px 16px', borderRadius:'999px', fontSize:'12px', fontWeight:'800', border:'none', cursor:'pointer'}}>✓ Approve</button>
                        <button onClick={()=>act(`${API}/api/delegate/kyc/${person.ID || person.id}/reject`)} style={{background:'#fef2f2', color:'#dc2626', padding:'10px 14px', borderRadius:'999px', fontSize:'12px', fontWeight:'700', border:'1px solid #fecaca', cursor:'pointer'}}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p style={{fontSize:'10px', color:'#9ca3af', marginTop:'16px', textAlign:'center'}}>You CANNOT delete donations, change fees, or add delegates. All actions logged. Permanent until owner revokes.</p>
            </div>

            <div style={{marginTop:'16px', background:'#111827', borderRadius:'20px', padding:'18px', display:'flex', gap:'16px'}}>
              <div style={{flex:1}}>
                <p style={{fontSize:'11px', fontWeight:'800', color:'#22c55e', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'8px'}}>✅ You Can</p>
                <p style={{fontSize:'12px', color:'white', lineHeight:'1.6'}}>See donations today/week<br/>Approve KYC • Pause suspicious<br/>Reply to donors</p>
              </div>
              <div style={{width:'1px', background:'#1f2937'}}></div>
              <div style={{flex:1}}>
                <p style={{fontSize:'11px', fontWeight:'800', color:'#f87171', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'8px'}}>❌ You Cannot</p>
                <p style={{fontSize:'12px', color:'#9ca3af', lineHeight:'1.6'}}>Delete/edit donations<br/>Change fees/bank<br/>Add/remove delegates<br/>Export full ledger</p>
              </div>
            </div>
          </>
        )}

        {tab==='support' && (
          <div>
            <div style={{marginBottom:'12px'}}>
              <h2 style={{fontWeight:'800', fontSize:'16px'}}>💬 Human Support Inbox</h2>
              <p style={{fontSize:'11px', color:'#888', marginTop:'4px'}}>Live chats from FAQ — reply as human (distinct from AI Assistant)</p>
            </div>
            <SupportInbox />
          </div>
        )}

        <p style={{textAlign:'center', fontSize:'11px', color:'#9ca3af', marginTop:'20px'}}>© 2026 Ask Kin • Delegate • Permanent until owner revokes</p>
      </div>
      <TeamChat />
    </div>
  );
}

