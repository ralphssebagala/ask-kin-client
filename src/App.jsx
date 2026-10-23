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
import OpeningScreen from './pages/OpeningScreen.jsx';

function CampaignDetailWrapper({ campaigns, onBack, onDonate }) {
  const { id } = useParams();
  const found = campaigns.find(c => (c._id || c.id || c.ID || c.ID?.toString())?.toString() === id) || null;
  return <CampaignDetail campaign={found} campaignId={id} onBack={onBack} onDonate={onDonate} />;
}
function DonateWrapper({ campaigns }) {
  const { id } = useParams();
  const found = campaigns.find(c => (c._id || c.id || c.ID)?.toString() === id) || null;
  return <DonatePage campaign={found} />;
}
function EditCampaignWrapper({ campaigns, onCampaignCreated, onCancel }) {
  const { id } = useParams();
  const found = campaigns.find(c => (c._id || c.id || c.ID)?.toString() === id) || null;
  return <CreateCampaign existingCampaign={found} editId={id} isEdit={true} onCampaignCreated={onCampaignCreated} onCancel={onCancel} />;
}
function normalizeCampaign(c){
  if (!c) return c;
  return { ...c, id: c.id || c.ID, _id: c._id || c.id || c.ID, ID: c.ID || c.id, title: c.title || c.TITLE, category: c.category || c.CATEGORY, goal: Number(c.goal || c.GOAL || c.GOAL_AMOUNT || 0), raised: Number(c.raised || c.RAISED || 0), townCity: c.townCity || c.TOWN_CITY, image: c.image || c.IMAGE, status: (c.status || c.STATUS || 'live').toLowerCase(), donorCount: Number(c.donorCount || c.DONOR_COUNT || 0), CREATOR_ID: c.CREATOR_ID || c.creator_id || '', creator_id: c.CREATOR_ID || c.creator_id || '' }
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('register');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [myCampaigns, setMyCampaigns] = useState([]);
  const [userDonations, setUserDonations] = useState([]);
  const [staffInfo, setStaffInfo] = useState({ hasOwnerToken: false, delegate: null });
  const [showOpening, setShowOpening] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 900 && location.pathname === '/';
  });

  const API = import.meta.env.VITE_BACKEND_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://api.ask-kin.com');

  useEffect(() => {
    if (location.pathname !== '/' || window.innerWidth >= 900) {
      setShowOpening(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/campaigns`).then(r=> r.ok ? r.json() : []).catch(()=>[]),
      fetch(`${API}/api/campaigns/pending`).then(r=> r.ok ? r.json() : []).catch(()=>[])
    ]).then(([live, pending])=>{
      const liveArr = Array.isArray(live) ? live : (live.campaigns || live.data || []);
      const pendingArr = Array.isArray(pending) ? pending : (pending.campaigns || pending.data || []);
      const all = [...liveArr, ...pendingArr].map(normalizeCampaign);
      const dedup = Array.from(new Map(all.map(c=>[c.id, c])).values());
      setAllCampaigns(dedup);
    });
    const savedEmail = localStorage.getItem('userEmail');
    const savedName = localStorage.getItem('userName');
    const savedRole = localStorage.getItem('userRole');
    const savedId = localStorage.getItem('userId');
    const savedPhone = localStorage.getItem('userPhone') || localStorage.getItem('phone') || '';
    if (savedEmail && savedName) {
      setCurrentUser({ id: savedId, email: savedEmail, fullName: savedName, name: savedName, phone: savedPhone, role: savedRole, email: savedEmail });
    } else {
      try { const stored = JSON.parse(localStorage.getItem('user') || '{}'); if (stored.email) setCurrentUser(stored); } catch {}
    }
    const token = localStorage.getItem('token') || localStorage.getItem('ownerToken') || localStorage.getItem('authToken');
    try { const del = JSON.parse(localStorage.getItem('delegate')||'null'); setStaffInfo({ hasOwnerToken: !!token, delegate: del }); } catch { setStaffInfo({ hasOwnerToken: !!token, delegate: null }); }
  }, [location.pathname, isMenuOpen, API]);

  useEffect(() => {
    const uid = currentUser?.id || localStorage.getItem('userId');
    const email = currentUser?.email || localStorage.getItem('userEmail');
    if (!uid && !email) { setMyCampaigns([]); return; }
    const url = uid ? `${API}/api/campaigns?creator_id=${encodeURIComponent(uid)}` : `${API}/api/campaigns?email=${encodeURIComponent(email)}`;
    fetch(url).then(r=> r.ok ? r.json() : []).then(data=>{
      const arr = Array.isArray(data) ? data : (data.campaigns || data.data || []);
      const normalized = arr.map(normalizeCampaign);
      const filtered = uid ? normalized.filter(c => (c.CREATOR_ID||'').toString() === uid.toString()) : normalized;
      setMyCampaigns(filtered);
    }).catch(()=> setMyCampaigns([]));
  }, [currentUser, API, location.pathname]);

  const handleAuthSuccess = (user) => { 
    const u = { id: user.id || user.ID, email: user.email || user.EMAIL, fullName: user.fullName || user.name || user.FULL_NAME, name: user.fullName || user.name, phone: user.phone || user.PHONE || '', role: user.role };
    setCurrentUser(u); setIsAuthOpen(false);
    if(u.email) localStorage.setItem('userEmail', u.email);
    if(u.fullName) localStorage.setItem('userName', u.fullName);
    if(u.phone) localStorage.setItem('userPhone', u.phone);
    if(u.id) localStorage.setItem('userId', u.id.toString());
    if(u.role) localStorage.setItem('userRole', u.role);
  };
  const handleLogout = () => { localStorage.clear(); setCurrentUser(null); setMyCampaigns([]); navigate('/'); };
  const handleRequireAuth = (mode='login') => { setAuthMode(mode); setIsAuthOpen(true); };
  const handleStartFundraiser = () => { if (!currentUser) { handleRequireAuth('register'); return; } navigate('/create-campaign'); };

  const isOpeningView = showOpening && location.pathname === '/';

  return (
    <div style={{ minHeight: '100vh', background: '#fefcf6' }}>
      <style>{`
        .ak-m-only{display:flex !important}
        .ak-pc-only{display:none !important}
        @media(min-width:900px){
          .ak-m-only{display:none !important}
          .ak-pc-only{display:block !important}
        }
        .ak-spacer{height:64px}
        @media(min-width:900px){.ak-spacer{height:118px !important}}
        .ak-main.no-gap{margin-top:-1px}
      `}</style>

      {/* MOBILE HEADER - hidden when opening screen is showing */}
      {!isOpeningView && (
        <div className="ak-m-only" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40, background: '#fff', borderBottom: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', minWidth: 0, flexShrink: 0 }} onClick={() => { setShowOpening(false); navigate('/'); }}>
            <div style={{ width: 48, height: 48, minWidth: 48, borderRadius: 10, background: '#0a1931', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src="/logo.png" alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e)=>e.currentTarget.src='/vite.svg'} />
            </div>
            <div style={{ lineHeight: 1, minWidth: 0 }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#0f3d2e', fontFamily: 'ui-serif, Georgia, serif', whiteSpace: 'nowrap' }}>Ask Kin</div>
              <div style={{ fontSize: 7, fontWeight: 800, color: '#374151', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap', transform: 'scaleX(0.92)', transformOrigin: 'left', marginTop: 3 }}>REKINDLING THE GIFT OF GIVING</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            <button onClick={handleStartFundraiser} style={{ background: '#0f4d3a', color: '#fff', border: 'none', borderRadius: 999, padding: '6px 10px', fontSize: 11, fontWeight: 900, cursor: 'pointer', whiteSpace: 'nowrap' }}>Start a Fundraiser</button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ background: 'none', border: 'none', width: 26, height: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, cursor: 'pointer' }}>
              <span style={{ height: 3, background: '#000', borderRadius: 2, display: 'block' }}></span>
              <span style={{ height: 3, background: '#000', borderRadius: 2, display: 'block' }}></span>
              <span style={{ height: 3, background: '#000', borderRadius: 2, display: 'block' }}></span>
            </button>
          </div>
        </div>
      )}

      {/* PC - floating card - hidden when opening (PC never shows opening anyway) */}
      {!isOpeningView && (
        <div className="ak-pc-only" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40, padding: '12px 20px 0 20px' }}>
          <div style={{ background: '#fff', borderRadius: 20, maxWidth: 1440, margin: '0 auto', padding: '12px 24px 10px 24px', boxShadow: '0 12px 32px rgba(0,0,0,0.10)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: '#0a1931', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img src="/logo.png" alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e)=>e.currentTarget.src='/vite.svg'} />
                </div>
                <div><div style={{ fontSize: 36, fontWeight: 900, color: '#0f3d2e', fontFamily: 'ui-serif, Georgia, serif' }}>Ask Kin</div><div style={{ fontSize: 11, color: '#5f7168', letterSpacing: '0.14em', textTransform: 'uppercase' }}>REKINDLING THE GIFT OF GIVING</div></div>
              </div>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                {!currentUser ? <button onClick={() => handleRequireAuth('login')} style={{ background: 'none', border: 'none', fontWeight: 800, fontSize: 14, color: '#0f3d2e', cursor: 'pointer' }}>Sign In</button> : <button onClick={handleLogout} style={{ background: 'none', border: 'none', fontWeight: 800, fontSize: 14, color: '#0f3d2e', cursor: 'pointer' }}>Logout</button>}
                <button onClick={handleStartFundraiser} style={{ background: '#0f4d3a', color: '#fff', border: 'none', borderRadius: 999, padding: '10px 18px', fontWeight: 900, fontSize: 13, cursor: 'pointer' }}>Start a Fundraiser</button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
              <button onClick={() => { setShowOpening(false); navigate('/'); }} style={{ background: 'none', border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', color: location.pathname==='/' ? '#0f3d2e' : '#555' }}>Explore Our Fundraisers</button>
              <button onClick={() => navigate('/assistant')} style={{ background: 'none', border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', color: location.pathname==='/assistant' ? '#0f3d2e' : '#555' }}>Ask Kin Assistant</button>
              <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', color: location.pathname==='/dashboard' ? '#0f3d2e' : '#555' }}>Dashboard</button>
              <button onClick={() => navigate('/faq')} style={{ background: 'none', border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', color: location.pathname==='/faq' ? '#0f3d2e' : '#555' }}>FAQ</button>
            </div>
          </div>
        </div>
      )}

      {isMenuOpen && (
        <>
          <div onClick={() => setIsMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 80 }} />
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 300, maxWidth: '82vw', background: '#fff', zIndex: 81, borderRadius: '20px 0 0 20px', boxShadow: '-10px 0 30px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #eee', alignItems: 'center' }}>
              <span style={{ fontWeight: 900, fontSize: 18 }}>Menu</span>
              <button onClick={() => setIsMenuOpen(false)} style={{ border: 'none', background: '#f3f4f6', width: 28, height: 28, borderRadius: 14, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 16px 0' }}>
              <button onClick={() => { setShowOpening(false); navigate('/'); setIsMenuOpen(false); window.scrollTo(0,0); }} style={{ width: '100%', display: 'flex', gap: 12, padding: '11px 16px', border: 'none', borderLeft: '5px solid #0f4d3a', background: '#ecfdf5', textAlign: 'left', cursor: 'pointer', fontWeight: 700, fontSize: 14, color: '#0f4d3a' }}>🏠 Home</button>
              <button onClick={() => { setShowOpening(false); navigate('/'); setIsMenuOpen(false); }} style={{ width: '100%', display: 'flex', gap: 12, padding: '11px 16px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', fontSize: 14 }}>🔍 Explore Our Fundraisers</button>
              <button onClick={() => { navigate('/assistant'); setIsMenuOpen(false); }} style={{ width: '100%', display: 'flex', gap: 12, padding: '11px 16px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', fontSize: 14 }}>💬 Ask Kin Assistant</button>
              <button onClick={() => { navigate('/dashboard'); setIsMenuOpen(false); }} style={{ width: '100%', display: 'flex', gap: 12, padding: '11px 16px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', fontSize: 14 }}>📊 Dashboard</button>
              <button onClick={() => { navigate('/faq'); setIsMenuOpen(false); }} style={{ width: '100%', display: 'flex', gap: 12, padding: '11px 16px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', fontSize: 14 }}>❓ FAQ</button>
              <button onClick={() => { navigate('/contact-support'); setIsMenuOpen(false); }} style={{ width: '100%', display: 'flex', gap: 12, padding: '11px 16px', border: 'none', borderLeft: '5px solid #dc2626', background: 'transparent', textAlign: 'left', cursor: 'pointer', fontSize: 14, color: '#991b1b', fontWeight: 600 }}>🎧 Contact Support</button>
              <div style={{ height: 1, background: '#eee', margin: '12px 16px' }} />
              <button onClick={() => { setAuthMode('login'); setIsAuthOpen(true); setIsMenuOpen(false); }} style={{ width: '100%', display: 'flex', gap: 12, padding: '9px 16px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', fontSize: 14 }}>👤 Sign In (User)</button>
              <button onClick={() => { setAuthMode('register'); setIsAuthOpen(true); setIsMenuOpen(false); }} style={{ width: '100%', display: 'flex', gap: 12, padding: '9px 16px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', fontSize: 14 }}>📝 Register</button>
              <div style={{ padding: '12px 16px' }}>
                <button onClick={() => { setIsMenuOpen(false); handleStartFundraiser(); }} style={{ width: '100%', background: '#15803d', color: 'white', border: 'none', borderRadius: 999, padding: '12px', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>Start a Fundraiser</button>
              </div>
              <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#a8a29e', letterSpacing: '0.05em', marginBottom: 4 }}>STAFF ACCESS</div>
                <button onClick={() => { navigate('/admin'); setIsMenuOpen(false); }} style={{ width: '100%', textAlign: 'left', background: 'white', border: '1px solid #e7e5e4', fontWeight: 700, padding: '10px 12px', fontSize: 13, borderRadius: 8, cursor: 'pointer' }}>🛡️ Admin Dashboard</button>
                <button onClick={() => { navigate('/delegate'); setIsMenuOpen(false); }} style={{ width: '100%', textAlign: 'left', background: '#ecfdf5', border: '1px solid #a7f3d0', fontWeight: 700, padding: '10px 12px', fontSize: 13, borderRadius: 8, color: '#065f46', cursor: 'pointer' }}>📋 Delegate Dashboard</button>
              </div>
            </div>
            <div style={{ textAlign: 'center', fontSize: 10, color: '#94a3b8', padding: '12px', borderTop: '1px solid #f1f5f9' }}>v2.4.1 • Verified • ask-kin.com</div>
          </div>
        </>
      )}

      {!isOpeningView && <div className="ak-spacer" />}

      <main className={isOpeningView ? '' : 'ak-main no-gap'}>
        <Routes>
          <Route path="/" element={
            isOpeningView ? (
              <OpeningScreen 
                onMenuOpen={() => setIsMenuOpen(true)} 
                onStartFundraiser={() => { setShowOpening(false); handleStartFundraiser(); }} 
              />
            ) : (
              <HomeFeed allCampaigns={allCampaigns} onSelectCampaign={(c) => navigate(`/campaign/${c._id || c.id}`)} />
            )
          } />
          <Route path="/campaign/:id" element={<CampaignDetailWrapper campaigns={allCampaigns} onBack={() => navigate('/')} onDonate={(c) => navigate(`/donate/${c._id || c.id}`)} />} />
          <Route path="/donate/:id" element={<DonateWrapper campaigns={allCampaigns} />} />
          <Route path="/payment-callback" element={<PaymentCallback />} />
          <Route path="/dashboard" element={<Dashboard user={currentUser} userCampaigns={myCampaigns} allCampaigns={allCampaigns} userDonations={userDonations} onRequireAuth={handleRequireAuth} />} />
          <Route path="/assistant" element={<AskKinAssistant />} />
          <Route path="/create-campaign" element={<CreateCampaign onCampaignCreated={(nc) => { const n = normalizeCampaign(nc); setAllCampaigns(p => [n,...p]); setMyCampaigns(p => [n,...p]); }} onCancel={() => navigate('/dashboard')} />} />
          <Route path="/edit-campaign/:id" element={<EditCampaignWrapper campaigns={allCampaigns} onCampaignCreated={(nc) => { const n = normalizeCampaign(nc); setAllCampaigns(p => [n,...p]); setMyCampaigns(p => [n,...p]); }} onCancel={() => navigate('/dashboard')} />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact-support" element={<ContactSupport />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/delegate-login" element={<DelegateLogin />} />
          <Route path="/delegate" element={<DelegateDashboard />} />
        </Routes>
      </main>
      {!isOpeningView && (
        <footer style={{ padding: '24px', textAlign: 'center', borderTop:'1px solid #f1f5f9', marginTop:20 }}>
          <div>© {new Date().getFullYear()} Ask Kin - ask-kin.com</div>
        </footer>
      )}
      {isAuthOpen && <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onAuthSuccess={handleAuthSuccess} initialMode={authMode} />}
    </div>
  );
}