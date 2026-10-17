import React, { useState, useEffect } from 'react';
import { Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';
import HomeFeed from './HomeFeed';
import CampaignDetail from './CampaignDetail';
import AuthModal from './AuthModal';
import Dashboard from './Dashboard';
import CreateCampaign from './CreateCampaign';
import AskKinAssistant from './AskKinAssistant';
import FAQ from "./pages/FAQ.jsx";
import PaymentCallback from "./pages/PaymentCallbackPage.jsx";
import DonatePage from "./pages/DonatePage.jsx";
import AdminDashboard from './pages/AdminDashboard';
import DelegateDashboard from './pages/DelegateDashboard';
import DelegateLogin from './pages/DelegateLogin';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import Terms from './pages/Terms.jsx';
import ContactSupport from './pages/ContactSupport.jsx';

function CampaignDetailWrapper({ campaigns, onBack, onDonate }) {
  const { id } = useParams();
  const found = campaigns.find(c => (c._id || c.id) === id) || null;
  return <CampaignDetail campaign={found} campaignId={id} onBack={onBack} onDonate={onDonate} />;
}
function DonateWrapper({ campaigns }) {
  const { id } = useParams();
  const found = campaigns.find(c => (c._id || c.id) === id) || null;
  return <DonatePage campaign={found} />;
}
function EditCampaignWrapper({ campaigns, onCampaignCreated, onCancel }) {
  const { id } = useParams();
  const found = campaigns.find(c => (c._id || c.id) === id) || null;
  return <CreateCampaign existingCampaign={found} editId={id} isEdit={true} onCampaignCreated={onCampaignCreated} onCancel={onCancel} />;
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userCampaigns, setUserCampaigns] = useState([]);
  const [userDonations, setUserDonations] = useState([]);
  const [staffInfo, setStaffInfo] = useState({ hasOwnerToken: false, delegate: null });
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, {passive:true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const isExplore = location.pathname === '/' || location.pathname.includes('/explore');
  const glowIntensity = Math.min(scrollY / 200, 1);
  const showGlow = !isExplore;

  useEffect(() => {
    const API = import.meta.env.VITE_BACKEND_URL || 'https://api.ask-kin.com';
    fetch(`${API}/api/campaigns`).then(r=>r.json()).then(d=>setUserCampaigns(Array.isArray(d)?d:d.campaigns||d.data||[])).catch(()=>{});
    const savedEmail = localStorage.getItem('userEmail');
    const savedName = localStorage.getItem('userName');
    const savedRole = localStorage.getItem('userRole');
    if (savedEmail && savedName) setCurrentUser({ email: savedEmail, fullName: savedName, role: savedRole });
    const token = localStorage.getItem('token') || localStorage.getItem('ownerToken') || localStorage.getItem('authToken');
    try { const del = JSON.parse(localStorage.getItem('delegate')||'null'); setStaffInfo({ hasOwnerToken: !!token, delegate: del }); } catch { setStaffInfo({ hasOwnerToken: !!token, delegate: null }); }
  }, [location.pathname, isMenuOpen]);

  const active = (p) => location.pathname === p;
  const handleAuthSuccess = (user) => { setCurrentUser(user); setIsAuthOpen(false); if(user.email) localStorage.setItem('userEmail', user.email); if(user.fullName) localStorage.setItem('userName', user.fullName); if(user.role) localStorage.setItem('userRole', user.role); navigate('/dashboard'); };
  const handleLogout = () => { localStorage.clear(); setCurrentUser(null); setStaffInfo({ hasOwnerToken: false, delegate: null }); navigate('/'); };
  const handleDashboardClick = () => { if (currentUser) navigate('/dashboard'); else setIsAuthOpen(true); };

  return (
    <div style={{ minHeight: '100vh', background: '#FFFBF5', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes greenPulse { 0%,100%{opacity:0.8;transform:scaleX(1)} 50%{opacity:1;transform:scaleX(1.05)} }
        .ak-header{position:fixed;top:0;left:0;right:0;z-index:40;background:rgba(255,255,255,0.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid rgba(11,164,108,0.08);transition:all 0.3s;padding-top:env(safe-area-inset-top, 0px);transform:translateZ(0);-webkit-transform:translateZ(0);will-change:transform;backface-visibility:hidden}
        .ak-header.glow{box-shadow:0 1px 0 rgba(0,0,0,0.05), 0 8px 24px rgba(11,164,108,0.18), 0 0 0 1px rgba(11,164,108,0.08)}
        .ak-header.no-glow{box-shadow:0 6px 18px rgba(0,0,0,0.06);border-bottom:3px solid #0f4d3a}
        .ak-header-inner{max-width:1440px;margin:0 auto;padding:0 16px;height:72px;display:flex;align-items:center;justify-content:space-between;gap:0;position:relative}
        .ak-logo{display:flex;align-items:center;gap:12px;cursor:pointer;flex-shrink:0;width:220px}
        .ak-logo img{width:56px;height:56px;border-radius:12px;object-fit:contain;flex-shrink:0}
        .ak-logo-text{display:flex;flex-direction:column;line-height:1}
        .ak-logo-text .name{font-size:22px;font-weight:900;color:#0f4d3a;letter-spacing:-0.5px}
        .ak-logo-text .tagline{font-size:9px;font-weight:700;color:#0f4d3a;letter-spacing:0.12em;text-transform:uppercase;opacity:0.7;margin-top:2px;white-space:nowrap}
        .ak-center{flex:1;display:none;align-items:center;justify-content:center;gap:0}
        .ak-center-spacer{flex:1;min-width:40px;max-width:120px}
        .ak-nav-group{display:flex;align-items:center;gap:12px}
        .ak-nav-btn{background:none;border:none;cursor:pointer;font-weight:800;font-size:13px;letter-spacing:0.2px;color:#111827;line-height:1.1;text-align:center;white-space:normal;max-width:110px;min-width:70px;padding:6px 8px;border-radius:10px}
        .ak-nav-btn.active{background:#f0fdf4;color:#0f4d3a;font-weight:900}
        .ak-right{display:none;align-items:center;gap:12px;flex-shrink:0;width:auto;justify-content:flex-end;min-width:240px}
        .ak-hamburger{background:none;border:none;font-size:26px;cursor:pointer;font-weight:900;padding:6px}
        @media(min-width:800px){
          .ak-header-inner{height:88px;padding:0 16px}
          .ak-logo{width:220px}
          .ak-logo img{width:60px;height:60px}
          .ak-logo-text .name{font-size:20px}
          .ak-logo-text .tagline{font-size:8px}
          .ak-center{display:flex !important}
          .ak-right{display:flex !important}
          .ak-hamburger{display:none !important}
          .ak-nav-btn{font-size:11px;max-width:90px;padding:5px 6px}
          .ak-center-spacer{max-width:20px}
          .ak-right{gap:8px;min-width:180px}
        }
        @media(min-width:1000px){
          .ak-header-inner{padding:0 20px}
          .ak-logo{width:240px}
          .ak-logo img{width:64px;height:64px}
          .ak-logo-text .name{font-size:22px}
          .ak-logo-text .tagline{font-size:9px}
          .ak-nav-btn{font-size:12px;max-width:100px}
          .ak-center-spacer{max-width:60px}
        }
        @media(min-width:1100px){
          .ak-header-inner{padding:0 28px}
          .ak-logo{width:260px}
          .ak-logo img{width:68px;height:68px}
          .ak-logo-text .name{font-size:24px}
          .ak-logo-text .tagline{font-size:10px}
          .ak-nav-btn{font-size:13.5px;max-width:120px}
          .ak-center-spacer{max-width:180px}
        }
        @media(max-width:799px){
          .ak-center{display:none !important}
          .ak-right{display:none !important}
          .ak-hamburger{display:block !important}
        }
        .ak-main{flex-grow:1;padding-top:72px}
        .ak-main.no-gap{padding-top:0px}
        @media(min-width:800px){
          .ak-main{padding-top:88px}
          .ak-main.no-gap{padding-top:0px}
        }
      `}</style>

      <header className={`ak-header ${showGlow ? 'glow' : 'no-glow'}`}>
        {showGlow && (
          <div style={{ position:'absolute', bottom:-48, left:0, right:0, height:64, pointerEvents:'none', background:`linear-gradient(180deg, rgba(11,164,108,${0.15 + glowIntensity*0.35}) 0%, rgba(11,164,108,${(0.15 + glowIntensity*0.35)*0.6}) 25%, transparent 100%)`, filter:`blur(${4 + glowIntensity*6}px)`, animation:'greenPulse 3s ease-in-out infinite'}}/>
        )}
        <div className="ak-header-inner">
          <div className="ak-logo" onClick={() => navigate('/')}>
            <img src="/logo.png" alt="Ask Kin logo" />
            <div className="ak-logo-text"><span className="name">Ask Kin</span><span className="tagline">Rekindling the Gift of Giving</span></div>
          </div>
          <div className="ak-center">
            <div className="ak-center-spacer" />
            <div className="ak-nav-group">
              <button onClick={() => navigate('/')} className={`ak-nav-btn ${active('/')?'active':''}`}>Explore Our<br/>Fundraisers</button>
              <button onClick={() => navigate('/assistant')} className={`ak-nav-btn ${active('/assistant')?'active':''}`}>Ask Kin<br/>Assistant</button>
              <button onClick={handleDashboardClick} className={`ak-nav-btn ${active('/dashboard')?'active':''}`}>Dashboard</button>
              <button onClick={() => navigate('/faq')} className={`ak-nav-btn ${active('/faq')?'active':''}`}>FAQ</button>
            </div>
            <div className="ak-center-spacer" />
          </div>
          <div className="ak-right">
            {!currentUser && <button onClick={() => setIsAuthOpen(true)} style={{ background:'none', border:'none', cursor:'pointer', fontWeight:800, fontSize:'14px' }}>Sign In</button>}
            {currentUser && <button onClick={handleLogout} style={{ background:'none', border:'none', cursor:'pointer', fontWeight:800, fontSize:'12px' }}>Logout ({currentUser.fullName?.split(' ')[0]})</button>}
            <button onClick={() => { if (currentUser) navigate('/create-campaign'); else setIsAuthOpen(true); }} style={{ background:'#0f4d3a', color:'white', border:'none', borderRadius:'999px', padding:'12px 20px', fontWeight:900, fontSize:'13px', cursor:'pointer', whiteSpace:'nowrap' }}>Start a Fundraiser</button>
          </div>
          <button className="ak-hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
        </div>

        {isMenuOpen && (
          <div style={{ position:'fixed', inset:0, zIndex:50, background:'rgba(0,0,0,0.4)', paddingTop:'env(safe-area-inset-top, 0px)' }} onClick={() => setIsMenuOpen(false)}>
            <div style={{ position:'absolute', right:0, top:0, bottom:0, width:'85%', maxWidth:'380px', background:'rgba(255,255,255,0.98)', backdropFilter:'blur(16px)', padding:'20px', paddingTop:'calc(20px + env(safe-area-inset-top, 0px))', overflowY:'auto', borderLeft:'1px solid rgba(11,164,108,0.1)', height:'100dvh' }} onClick={e=>e.stopPropagation()}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                <span style={{fontWeight:900, fontSize:'16px', display:'flex', alignItems:'center', gap:8}}><span style={{width:8, height:8, background:'#0BA46C', borderRadius:'50%', display:'inline-block', animation:'greenPulse 2s infinite'}}/>Menu</span>
                <button onClick={() => setIsMenuOpen(false)} style={{background:'#f1f5f9', border:'none', width:32, height:32, borderRadius:16, fontSize:'16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>✕</button>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                <button onClick={() => { navigate('/'); setIsMenuOpen(false); }} style={{ display:'flex', alignItems:'center', gap:10, width:'100%', textAlign:'left', padding:'10px 12px', border:'none', background:'#f8fafc', fontWeight:700, fontSize:'13px', borderRadius:8 }}>🏠 Explore Our Fundraisers</button>
                <button onClick={() => { navigate('/assistant'); setIsMenuOpen(false); }} style={{ display:'flex', alignItems:'center', gap:10, width:'100%', textAlign:'left', padding:'10px 12px', border:'none', background:'#f8fafc', fontWeight:700, fontSize:'13px', borderRadius:8 }}>💬 Ask Kin Assistant</button>
                <button onClick={() => { if (currentUser) navigate('/dashboard'); else setIsAuthOpen(true); setIsMenuOpen(false); }} style={{ display:'flex', alignItems:'center', gap:10, width:'100%', textAlign:'left', padding:'10px 12px', border:'none', background:'#f8fafc', fontWeight:700, fontSize:'13px', borderRadius:8 }}>📊 Dashboard</button>
                <button onClick={() => { navigate('/faq'); setIsMenuOpen(false); }} style={{ display:'flex', alignItems:'center', gap:10, width:'100%', textAlign:'left', padding:'10px 12px', border:'none', background:'#f8fafc', fontWeight:700, fontSize:'13px', borderRadius:8 }}>❓ FAQ</button>
                <button onClick={() => { navigate('/contact-support'); setIsMenuOpen(false); }} style={{ display:'flex', alignItems:'center', gap:10, width:'100%', textAlign:'left', padding:'10px 12px', border:'none', background:'#fef2f2', fontWeight:700, fontSize:'13px', borderRadius:8, color:'#991b1b', borderLeft:'3px solid #dc2626' }}>📞 Contact Support</button>
              </div>

              <div style={{ marginTop:'auto', borderTop:'1px solid #e2e8f0', paddingTop:12, display:'flex', flexDirection:'column', gap:8, paddingBottom:'calc(70px + env(safe-area-inset-bottom, 0px))' }}>
                {!currentUser && <button onClick={() => { setIsAuthOpen(true); setIsMenuOpen(false); }} style={{ textAlign:'left', background:'none', border:'none', fontWeight:800, padding:'6px 12px', fontSize:'13px' }}>👤 Sign In (User)</button>}
                {currentUser && <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} style={{ textAlign:'left', background:'none', border:'none', fontWeight:800, padding:'6px 12px', fontSize:'13px' }}>🚪 Logout ({currentUser.fullName?.split(' ')[0]})</button>}
                <button onClick={() => { if (currentUser) navigate('/create-campaign'); else setIsAuthOpen(true); setIsMenuOpen(false); }} style={{ width:'100%', background:'#0f4d3a', color:'white', border:'none', borderRadius:10, padding:'12px', fontWeight:900, fontSize:'13px', boxShadow:'0 4px 12px rgba(15,77,58,0.25)' }}>Start a Fundraiser</button>

                <div style={{ height:1, background:'linear-gradient(to right, transparent, #e2e8f0, transparent)', margin:'4px 0' }}/>

                {staffInfo.hasOwnerToken && (
                  <button onClick={() => { navigate('/admin'); setIsMenuOpen(false); }} style={{ display:'flex', alignItems:'center', gap:8, width:'100%', textAlign:'left', padding:'8px 12px', border:'1px solid #e2e8f0', background:'white', fontWeight:700, fontSize:'12px', borderRadius:8, color:'#334155' }}>🛡️ Admin Dashboard</button>
                )}
                {staffInfo.delegate ? (
                  <button onClick={() => { navigate('/delegate'); setIsMenuOpen(false); }} style={{ display:'flex', alignItems:'center', gap:8, width:'100%', textAlign:'left', padding:'8px 12px', border:'1px solid #e2e8f0', background:'white', fontWeight:700, fontSize:'12px', borderRadius:8, color:'#334155' }}>🤝 Delegate Dashboard</button>
                ) : (
                  <button onClick={() => { navigate('/delegate-login'); setIsMenuOpen(false); }} style={{ display:'flex', alignItems:'center', gap:8, width:'100%', textAlign:'left', padding:'8px 12px', border:'1px solid #e2e8f0', background:'white', fontWeight:700, fontSize:'12px', borderRadius:8, color:'#334155' }}>🤝 Delegate Login</button>
                )}

                <div style={{ display:'flex', gap:6, marginTop:2 }}>
                  <button onClick={() => { navigate('/terms'); setIsMenuOpen(false); }} style={{ flex:1, padding:'8px', border:'1px solid #e2e8f0', background:'#f8fafc', fontWeight:600, fontSize:'11px', borderRadius:8, color:'#64748b' }}>T&Cs</button>
                  <button onClick={() => { navigate('/privacy-policy'); setIsMenuOpen(false); }} style={{ flex:1, padding:'8px', border:'1px solid #e2e8f0', background:'#f8fafc', fontWeight:600, fontSize:'11px', borderRadius:8, color:'#64748b' }}>Privacy Policy</button>
                </div>

                <div style={{ textAlign:'center', fontSize:'10px', color:'#94a3b8', marginTop:4 }}>v2.4.1 • Verified</div>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className={`ak-main ${isExplore ? 'no-gap' : ''}`}>
        <Routes>
          <Route path="/" element={<HomeFeed onSelectCampaign={(c) => navigate(`/campaign/${c._id || c.id}`)} />} />
          <Route path="/campaign/:id" element={<CampaignDetailWrapper campaigns={userCampaigns} onBack={() => navigate('/')} onDonate={(c) => navigate(`/donate/${c._id || c.id}`)} />} />
          <Route path="/donate/:id" element={<DonateWrapper campaigns={userCampaigns} />} />
          <Route path="/payment-callback" element={<PaymentCallback />} />
          <Route path="/dashboard" element={<Dashboard user={currentUser} userCampaigns={userCampaigns} userDonations={userDonations} />} />
          <Route path="/assistant" element={<AskKinAssistant />} />
          <Route path="/create-campaign" element={<CreateCampaign onCampaignCreated={(nc) => setUserCampaigns(p => [nc,...p])} onCancel={() => navigate('/dashboard')} />} />
          <Route path="/edit-campaign/:id" element={<EditCampaignWrapper campaigns={userCampaigns} onCampaignCreated={(nc) => setUserCampaigns(p => [nc,...p])} onCancel={() => navigate('/dashboard')} />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact-support" element={<ContactSupport />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/delegate-login" element={<DelegateLogin />} />
          <Route path="/delegate" element={<DelegateDashboard />} />
        </Routes>
      </main>
      <footer style={{ padding: '24px', textAlign: 'center', borderTop:'1px solid #f1f5f9', marginTop:20 }}>
        <div>© {new Date().getFullYear()} Ask Kin - ask-kin.com</div>
      </footer>
      {isAuthOpen && <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onAuthSuccess={handleAuthSuccess} />}
    </div>
  );
}

