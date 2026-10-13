import React, { useState, useEffect } from 'react';
import { Routes, Route, useParams, useNavigate, Link, useLocation } from 'react-router-dom';
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
  // SURGICAL ADD: scroll + explore detection
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, {passive:true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const isExplore = location.pathname === '/' || location.pathname.includes('/explore');
  const glowIntensity = Math.min(scrollY / 200, 1);
  const showGlow = !isExplore; // <-- AGREED: spare explore the glow

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
        @keyframes greenFlow { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        .ak-header{position:sticky;top:0;z-index:40;background:rgba(255,255,255,0.9);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid rgba(11,164,108,0.08);transition:all 0.5s}
        .ak-header.glow{box-shadow:0 1px 0 rgba(0,0,0,0.05), 0 8px 24px rgba(11,164,108,0.18), 0 0 0 1px rgba(11,164,108,0.08)}
        .ak-header.no-glow{box-shadow:0 6px 18px rgba(0,0,0,0.06);border-bottom:3px solid #0f4d3a}
        .ak-header-inner{max-width:1440px;margin:0 auto;padding:0 16px;height:72px;display:flex;align-items:center;justify-content:space-between;gap:0;position:relative}
        .ak-logo{display:flex;align-items:center;gap:12px;cursor:pointer;flex-shrink:0;width:160px}
        .ak-logo img{width:56px;height:56px;border-radius:12px;object-fit:contain}
        .ak-logo span{font-size:22px;font-weight:900;color:#0f4d3a}
        .ak-center{flex:1;display:none;align-items:center;justify-content:center;gap:0}
        .ak-center-spacer{flex:1;min-width:40px;max-width:120px}
        .ak-nav-group{display:flex;align-items:center;gap:12px}
        .ak-nav-btn{background:none;border:none;cursor:pointer;font-weight:800;font-size:13px;letter-spacing:0.2px;color:#111827;line-height:1.1;text-align:center;white-space:normal;max-width:110px;min-width:70px;padding:6px 8px;border-radius:10px}
        .ak-nav-btn.active{background:#f0fdf4;color:#0f4d3a;font-weight:900}
        .ak-right{display:none;align-items:center;gap:12px;flex-shrink:0;width:auto;justify-content:flex-end;min-width:240px}
        .ak-hamburger{background:none;border:none;font-size:26px;cursor:pointer;font-weight:900;padding:6px}
        @media(min-width:1100px){
          .ak-header-inner{height:88px;padding:0 28px}
          .ak-logo{width:180px}
          .ak-logo img{width:68px;height:68px}
          .ak-logo span{font-size:24px}
          .ak-center{display:flex}
          .ak-right{display:flex}
          .ak-hamburger{display:none}
          .ak-nav-btn{font-size:13.5px;max-width:120px}
          .ak-center-spacer{max-width:180px}
        }
        @media(min-width:768px) and (max-width:1099px){
          .ak-center{display:flex;gap:0}
          .ak-nav-group{gap:8px}
          .ak-nav-btn{font-size:12px;max-width:90px}
          .ak-center-spacer{min-width:20px;max-width:60px}
          .ak-right{display:flex}
          .ak-hamburger{display:none}
        }
      `}</style>

      <header className={`ak-header ${showGlow ? 'glow' : 'no-glow'}`} style={showGlow ? {
        boxShadow: `0 1px 0 rgba(0,0,0,0.05), 0 ${8 + glowIntensity*12}px ${24 + glowIntensity*32}px rgba(11,164,108,${0.12 + glowIntensity*0.25}), 0 0 0 1px rgba(11,164,108,${0.06 + glowIntensity*0.12})`,
        borderBottom: `1px solid rgba(11,164,108,${0.08 + glowIntensity*0.15})`
      } : {}}>
        {/* GREEN GLOW ELEMENTS - ONLY WHEN NOT EXPLORE (agreed) */}
        {showGlow && (
          <>
            <div style={{
              position:'absolute', left:0, right:0, bottom:-48, height:64, pointerEvents:'none',
              background:`linear-gradient(180deg, rgba(11,164,108,${0.15 + glowIntensity*0.35}) 0%, rgba(11,164,108,${(0.15 + glowIntensity*0.35)*0.6}) 25%, rgba(11,164,108,${(0.15 + glowIntensity*0.35)*0.25}) 50%, transparent 100%)`,
              filter:`blur(${4 + glowIntensity*6}px)`,
              animation:'greenPulse 3s ease-in-out infinite',
              transformOrigin:'top'
            }}/>
            <div style={{
              position:'absolute', left:0, right:0, bottom:-80, height:96, pointerEvents:'none', opacity:0.6,
              background:`linear-gradient(90deg, transparent, rgba(11,164,108,${0.08 + glowIntensity*0.12}), transparent, rgba(52,211,153,${0.06 + glowIntensity*0.08}), transparent)`,
              backgroundSize:'200% 100%',
              animation:'greenFlow 4s ease-in-out infinite',
              filter:'blur(8px)'
            }}/>
          </>
        )}

        <div className="ak-header-inner">
          <div className="ak-logo" onClick={() => navigate('/')}>
            <img src="/logo.png" alt="Ask Kin" />
            <span>Ask Kin</span>
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
          <div style={{ position:'fixed', inset:0, zIndex:50, background:'rgba(0,0,0,0.4)' }} onClick={() => setIsMenuOpen(false)}>
            <div style={{ position:'absolute', right:0, top:0, bottom:0, width:'85%', maxWidth:'380px', background:'rgba(255,255,255,0.95)', backdropFilter:'blur(16px)', padding:'20px', overflowY:'auto', borderLeft:'1px solid rgba(11,164,108,0.1)' }} onClick={e=>e.stopPropagation()}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                <span style={{fontWeight:900, fontSize:'18px', display:'flex', alignItems:'center', gap:8}}><span style={{width:8, height:8, background:'#0BA46C', borderRadius:'50%', display:'inline-block'}}/>Menu</span>
                <button onClick={() => setIsMenuOpen(false)} style={{background:'none', border:'none', fontSize:'22px', cursor:'pointer'}}>✕</button>
              </div>
              <button onClick={() => { navigate('/'); setIsMenuOpen(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '14px 0', border: 'none', background: 'none', fontWeight: 800, fontSize:'15px' }}>Explore Our Fundraisers</button>
              <button onClick={() => { navigate('/assistant'); setIsMenuOpen(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '14px 0', border: 'none', background: 'none', fontWeight: 800, fontSize:'15px' }}>Ask Kin Assistant</button>
              <button onClick={() => { if (currentUser) navigate('/dashboard'); else setIsAuthOpen(true); setIsMenuOpen(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '14px 0', border: 'none', background: 'none', fontWeight: 800, fontSize:'15px' }}>Dashboard</button>
              <button onClick={() => { navigate('/faq'); setIsMenuOpen(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '14px 0', border: 'none', background: 'none', fontWeight: 800, fontSize:'15px' }}>FAQ</button>
              <div style={{ marginTop: 24, borderTop: '1px solid #f1f5f9', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {!currentUser && <button onClick={() => { setIsAuthOpen(true); setIsMenuOpen(false); }} style={{ textAlign: 'left', background: 'none', border: 'none', fontWeight: 800, padding: '8px 0', fontSize:'15px' }}>Sign In (User)</button>}
                {currentUser && <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} style={{ textAlign: 'left', background: 'none', border: 'none', fontWeight: 800, padding: '8px 0', fontSize:'15px' }}>Logout User ({currentUser.fullName?.split(' ')[0]})</button>}
                <button onClick={() => { if (currentUser) navigate('/create-campaign'); else setIsAuthOpen(true); setIsMenuOpen(false); }} style={{ width: '100%', background: '#0f4d3a', color: 'white', border: 'none', borderRadius: 12, padding: '14px', fontWeight: 900 }}>Start a Fundraiser</button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main style={{ flexGrow: 1 }}>
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

