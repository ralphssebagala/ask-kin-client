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
import Login from './pages/Login.jsx';
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
  const [currentUser, setCurrentUser] = useState(null);
  const [userCampaigns, setUserCampaigns] = useState([]);
  const [userDonations, setUserDonations] = useState([]);

  useEffect(() => {
    fetch('https://api.ask-kin.com/api/campaigns')
   .then(r => r.json())
   .then(d => setUserCampaigns(Array.isArray(d)? d : d.campaigns || d.data || []))
   .catch(() => {});
    const savedEmail = localStorage.getItem('userEmail');
    const savedName = localStorage.getItem('userName');
    const savedRole = localStorage.getItem('userRole');
    if (savedEmail && savedName) setCurrentUser({ email: savedEmail, fullName: savedName, role: savedRole });
  }, []);

  const active = (p) => location.pathname === p;
  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthOpen(false);
    if (user.email) localStorage.setItem('userEmail', user.email);
    if (user.fullName) localStorage.setItem('userName', user.fullName);
  };
  const handleLogout = () => {
    localStorage.clear();
    setCurrentUser(null);
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'white', display: 'flex', flexDirection: 'column' }}>
      <header style={{position:'sticky',top:0,zIndex:40,background:'#fff',borderBottom:'1px solid #f1f5f9'}}>
        <div style={{maxWidth:1280,margin:'0 auto',padding:'0 24px',height:76,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:12,cursor:'pointer'}} onClick={() => navigate('/')}>
            <img src="/logo.png" alt="logo" style={{width:66,height:66,borderRadius:14}} />
            <span style={{fontSize:22,fontWeight:900,color:'#0f4d3a'}}>Ask Kin</span>
          </div>
          <nav style={{display:'flex',gap:28,alignItems:'center'}}>
            <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: active('/')? 700 : 500 }}>Explore</button>
            <button onClick={() => navigate('/assistant')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: active('/assistant')? 700 : 500 }}>Assistant</button>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: active('/dashboard')? 700 : 500 }}>Dashboard</button>
            <button onClick={() => navigate('/faq')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: active('/faq')? 700 : 500 }}>FAQ</button>
          </nav>
          <div style={{display:'flex',gap:12,alignItems:'center'}}>
            {currentUser? <><span style={{fontSize:13,fontWeight:600}}>Hi, {currentUser.fullName?.split(' ')[0]}</span><button onClick={handleLogout}>Logout</button></> : <button onClick={() => navigate('/login')}>Sign In</button>}
            <button onClick={() => currentUser? navigate('/create-campaign') : navigate('/login')} style={{ background: '#0f4d3a', color: 'white', border: 'none', padding: '10px 18px', borderRadius: 999, fontWeight: 700, cursor: 'pointer' }}>Start a Fundraiser</button>
          </div>
        </div>
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
          <Route path="/login" element={<Login />} />
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
      </footer>
      {isAuthOpen && <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onAuthSuccess={handleAuthSuccess} />}
    </div>
  );
}
