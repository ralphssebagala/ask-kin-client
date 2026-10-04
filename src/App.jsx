import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, Link, useLocation } from 'react-router-dom';
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

  useEffect(() => {
    // Use production API fallback, not localhost
    const API = import.meta.env.VITE_BACKEND_URL || 'https://api.ask-kin.com';
    fetch(`${API}/api/campaigns`)
    .then(r => r.json())
    .then(d => setUserCampaigns(Array.isArray(d)? d : d.campaigns || d.data || []))
    .catch(() => {
      fetch('https://api.ask-kin.com/api/campaigns').then(r=>r.json()).then(d=>setUserCampaigns(Array.isArray(d)? d : d.campaigns || d.data || [])).catch(()=>{});
    });
    const savedEmail = localStorage.getItem('userEmail');
    const savedName = localStorage.getItem('userName');
    const savedRole = localStorage.getItem('userRole');
    if (savedEmail && savedName) setCurrentUser({ email: savedEmail, fullName: savedName, role: savedRole });
    const token = localStorage.getItem('token') || localStorage.getItem('ownerToken') || localStorage.getItem('authToken');
    try {
      const del = JSON.parse(localStorage.getItem('delegate') || 'null');
      setStaffInfo({ hasOwnerToken: !!token, delegate: del });
    } catch {
      setStaffInfo({ hasOwnerToken: !!token, delegate: null });
    }
  }, [location.pathname, isMenuOpen]);

  const active = (p) => location.pathname === p;
  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthOpen(false);
    if (user.email) localStorage.setItem('userEmail', user.email);
    if (user.fullName) localStorage.setItem('userName', user.fullName);
    if (user.role) localStorage.setItem('userRole', user.role);
    navigate('/dashboard');
  };
  const handleLogout = () => {
    localStorage.clear();
    setCurrentUser(null);
    setStaffInfo({ hasOwnerToken: false, delegate: null });
    navigate('/');
  };

  const handleDashboardClick = () => {
    if (currentUser) navigate('/dashboard');
    else setIsAuthOpen(true);
  };

  const roleLower = (currentUser?.role || '').toLowerCase();
  const isAdminRole = roleLower.includes('admin') || staffInfo.hasOwnerToken;
  const isDelegateRole = roleLower.includes('delegate') || !!staffInfo.delegate || isAdminRole;

  return (
    <div style={{ minHeight: '100vh', background: 'white', display: 'flex', flexDirection: 'column' }}>
      <style>{`
      .ak-header{position:sticky;top:0;z-index:40;background:#fff;border-bottom:1px solid #e5e7eb;box-shadow:0 1px 2px rgba(0,0,0,0.04)}
      .ak-header-inner{max-width:1280px;margin:0 auto;padding:0 12px;height:60px;display:flex;align-items:center;justify-content:space-between}
      .ak-logo{display:flex;align-items:center;gap:12px;cursor:pointer;flex-shrink:0}
      .ak-logo img{width:54px;height:54px;border-radius:11px;object-fit:contain;display:block}
      .ak-logo span{font-size:20px;font-weight:900;color:#0f4d3a;letter-spacing:-0.3px;white-space:nowrap}
      .ak-nav,.ak-right{display:none}
      .ak-hamburger{background:none;border:none;font-size:22px;cursor:pointer;padding:6px}
        @media(min-width:768px){
        .ak-header-inner{height:76px;padding:0 24px}
        .ak-logo img{width:66px;height:66px;border-radius:14px}
        .ak-logo span{font-size:22px}
        .ak-nav{display:flex;gap:18px;align-items:center}
        .ak-right{display:flex;gap:12px;align-items:center}
        .ak-hamburger{display:none}
        }
      `}</style>

      <header className="ak-header">
        <div className="ak-header-inner">
          <div className="ak-logo" onClick={() => navigate('/')}>
            <img src="/logo.png" alt="logo" />
            <span>Ask Kin</span>
          </div>

          <nav className="ak-nav">
            <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: active('/')? 800 : 600, fontSize:'13px', letterSpacing:'-0.2px', color: active('/')? '#0f4d3a' : '#111827' }}>Explore Our Fundraisers</button>
            <button onClick={() => navigate('/assistant')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: active('/assistant')? 800 : 600, fontSize:'13px', letterSpacing:'-0.2px', color: active('/assistant')? '#0f4d3a' : '#111827' }}>Ask Kin Assistant</button>
            <button onClick={handleDashboardClick} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: active('/dashboard')? 800 : 600, fontSize:'13px', letterSpacing:'-0.2px', color: active('/dashboard')? '#0f4d3a' : '#111827' }}>Dashboard</button>
            {isAdminRole && <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: active('/admin')? 800 : 600, fontSize:'13px', color: active('/admin')? '#0f4d3a' : '#b91c1c' }}>Admin</button>}
            {isDelegateRole && <button onClick={() => navigate('/delegate')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: active('/delegate')? 800 : 600, fontSize:'13px', color: active('/delegate')? '#0f4d3a' : '#065f46' }}>Delegate</button>}
            <button onClick={() => navigate('/faq')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: active('/faq')? 800 : 600, fontSize:'13px', letterSpacing:'-0.2px', color: active('/faq')? '#0f4d3a' : '#111827' }}>FAQ</button>
          </nav>

          <div className="ak-right">
            {currentUser? (
              <>
                <span style={{ fontSize: '12px', fontWeight: 700 }}>Hi, {currentUser.fullName?.split(' ')[0]}</span>
                <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize:'12px', fontWeight:600 }}>Logout</button>
              </>
            ) : (
              <button onClick={() => setIsAuthOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize:'13px' }}>Sign In</button>
            )}
            <button onClick={() => currentUser? navigate('/create-campaign') : setIsAuthOpen(true)} style={{ background: '#0f4d3a', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '999px', fontWeight: 800, cursor: 'pointer', fontSize:'13px' }}>Start a Fundraiser</button>
          </div>

          <button className="ak-hamburger" onClick={() => setIsMenuOpen(v =>!v)}>☰</button>
        </div>

        {isMenuOpen && (
          <div style={{ position: 'fixed', left: 0, right: 0, top: 60, bottom: 0, background: 'rgba(0,0,0,0.35)', zIndex: 50 }} onClick={() => setIsMenuOpen(false)}>
            <div style={{ background: 'white', width: '84%', maxWidth: 340, height: '100%', padding: 20, overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img src="/logo.png" alt="" style={{ width: 28, height: 28, borderRadius: 7 }} />
                  <b style={{ color: '#0f4d3a' }}>Ask Kin</b>
                </div>
                <button onClick={() => setIsMenuOpen(false)} style={{ background: '#f1f5f9', border: 'none', width: 32, height: 32, borderRadius: 999, cursor: 'pointer' }}>×</button>
              </div>

              <button onClick={() => { navigate('/'); setIsMenuOpen(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '14px 0', border: 'none', background: 'none', fontWeight: 700, fontSize:'15px' }}>Explore Our Fundraisers</button>
              <button onClick={() => { navigate('/assistant'); setIsMenuOpen(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '14px 0', border: 'none', background: 'none', fontWeight: 700, fontSize:'15px' }}>Ask Kin Assistant</button>
              <button onClick={() => { if (currentUser) navigate('/dashboard'); else setIsAuthOpen(true); setIsMenuOpen(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '14px 0', border: 'none', background: 'none', fontWeight: 700, fontSize:'15px' }}>Dashboard</button>
              <button onClick={() => { navigate('/faq'); setIsMenuOpen(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '14px 0', border: 'none', background: 'none', fontWeight: 700, fontSize:'15px' }}>FAQ</button>

              <div style={{ marginTop: 24, borderTop: '1px solid #f1f5f9', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {!currentUser && <button onClick={() => { setIsAuthOpen(true); setIsMenuOpen(false); }} style={{ textAlign: 'left', background: 'none', border: 'none', fontWeight: 700, padding: '8px 0', fontSize:'15px' }}>Sign In (User)</button>}
                {currentUser && <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} style={{ textAlign: 'left', background: 'none', border: 'none', fontWeight: 700, padding: '8px 0', fontSize:'15px' }}>Logout User ({currentUser.fullName?.split(' ')[0]})</button>}
                <button onClick={() => { if (currentUser) navigate('/create-campaign'); else setIsAuthOpen(true); setIsMenuOpen(false); }} style={{ width: '100%', background: '#0f4d3a', color: 'white', border: 'none', borderRadius: 12, padding: '14px', fontWeight: 800 }}>Start a Fundraiser</button>
              </div>

              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                <div style={{ fontSize:'11px', fontWeight:800, color:'#9ca3af', letterSpacing:'0.8px', marginBottom:'10px' }}>STAFF ACCESS</div>
                <button onClick={() => { navigate('/admin'); setIsMenuOpen(false); }} style={{ display: 'flex', alignItems:'center', justifyContent:'space-between', width: '100%', textAlign: 'left', padding: '12px 12px', border: staffInfo.hasOwnerToken ? '1px solid #fca5a5' : '1px solid #e5e7eb', background: staffInfo.hasOwnerToken ? '#fef2f2' : 'white', borderRadius:'12px', fontWeight: 700, fontSize:'14px', color: staffInfo.hasOwnerToken ? '#991b1b' : '#111827', marginBottom:'8px' }}>
                  <span>🛡️ Admin Dashboard</span>
                  {staffInfo.hasOwnerToken && <span style={{fontSize:'10px', background:'#dc2626', color:'white', padding:'2px 8px', borderRadius:'999px'}}>LOGGED IN</span>}
                </button>
                <button onClick={() => { navigate('/delegate'); setIsMenuOpen(false); }} style={{ display: 'flex', alignItems:'center', justifyContent:'space-between', width: '100%', textAlign: 'left', padding: '12px 12px', border: staffInfo.delegate ? '1px solid #86efac' : '1px solid #e5e7eb', background: staffInfo.delegate ? '#f0fdf4' : 'white', borderRadius:'12px', fontWeight: 700, fontSize:'14px', color: staffInfo.delegate ? '#065f46' : '#111827', marginBottom:'8px' }}>
                  <span>🤝 Delegate Dashboard</span>
                  {staffInfo.delegate && <span style={{fontSize:'10px', background:'#16a34a', color:'white', padding:'2px 8px', borderRadius:'999px'}}>{staffInfo.delegate.name?.split(' ')[0] || 'IN'}</span>}
                </button>
              </div>

              <div style={{ marginTop: 20, display: 'flex', gap: 16, justifyContent: 'center', fontSize: '12px' }}>
                <Link to="/privacy-policy" onClick={() => setIsMenuOpen(false)} style={{ color: '#065f46', fontWeight: 700 }}>Privacy</Link>
                <Link to="/terms" onClick={() => setIsMenuOpen(false)} style={{ color: '#065f46', fontWeight: 700 }}>Terms</Link>
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
        <div style={{marginTop:'12px', display:'flex', gap:'16px', justifyContent:'center', fontSize:'13px', flexWrap:'wrap'}}>
          <Link to="/faq" style={{ color: '#6b7280' }}>FAQ</Link>
          <Link to="/privacy-policy" style={{ color: '#065f46', fontWeight:700 }}>Privacy Policy</Link>
          <Link to="/terms" style={{ color: '#065f46', fontWeight:700 }}>Terms</Link>
          <a href="mailto:support@ask-kin.com" style={{ color: '#6b7280' }}>support@ask-kin.com</a>
        </div>
        <div style={{marginTop:'8px', fontSize:'11px', color:'#9ca3af'}}>Contact: support@ask-kin.com | https://ask-kin.com</div>
      </footer>

      {isAuthOpen && <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onAuthSuccess={handleAuthSuccess} />}
    </div>
  );
}

