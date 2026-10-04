import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLoginButton } from '../components/GoogleLoginButton.jsx'

const API = import.meta.env.VITE_BACKEND_URL || 'https://api.ask-kin.com';

export default function DelegateLogin(){
  const [email, setEmail] = useState('amongieeve@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleLogin(e){
    e.preventDefault();
    setLoading(true);
    setError('');
    try{
      const r = await fetch(`${API}/api/auth/delegate/login`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({email, password})
      });
      const j = await r.json();
      if(!r.ok) throw new Error(j.error || 'Login failed');
      
      localStorage.setItem('token', j.token);
      localStorage.setItem('delegate', JSON.stringify(j.delegate));
      
      alert(`Welcome ${j.delegate.name} - Permanent access until owner revokes`);
      navigate('/delegate');
    }catch(err){
      setError(err.message);
    }finally{
      setLoading(false);
    }
  }

  return (
    <div style={{minHeight:'100vh', background:'#f6f6f3', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}>
      <form onSubmit={handleLogin} style={{background:'white', borderRadius:'24px', padding:'32px', width:'100%', maxWidth:'380px', border:'1px solid #f0f0f0', boxShadow:'0 20px 40px rgba(0,0,0,0.06)'}}>
        <div style={{textAlign:'center', marginBottom:'24px'}}>
          <p style={{fontSize:'40px'}}>🔐</p>
          <h1 style={{fontSize:'22px', fontWeight:'800', marginTop:'8px'}}>Delegate Login</h1>
          <p style={{fontSize:'13px', color:'#888', marginTop:'4px'}}>Permanent access • Until owner revokes</p>
        </div>

        {error && <div style={{background:'#fef2f2', color:'#dc2626', padding:'12px', borderRadius:'12px', fontSize:'13px', marginBottom:'16px'}}>{error}</div>}

        <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
          <input 
            style={{background:'#f9f8f5', border:'1px solid #f0ede8', borderRadius:'999px', padding:'14px 18px', fontSize:'14px'}}
            placeholder="Email" 
            type="email"
            value={email} 
            onChange={e=>setEmail(e.target.value)} 
            required
          />
          <input 
            style={{background:'#fffbeb', border:'1px solid #fde68a', borderRadius:'999px', padding:'14px 18px', fontSize:'14px'}}
            placeholder="Password given by owner" 
            type="password"
            value={password} 
            onChange={e=>setPassword(e.target.value)} 
            required
          />
          <button disabled={loading} style={{background:'black', color:'white', padding:'14px', borderRadius:'999px', fontSize:'14px', fontWeight:'700', border:'none', cursor:'pointer', opacity: loading?0.6:1}}>
            {loading ? 'Signing in...' : 'Enter Dashboard →'}
          </button>
          <GoogleLoginButton />

        </div>

        <p style={{fontSize:'11px', color:'#aaa', textAlign:'center', marginTop:'20px'}}>
          You can approve KYC, pause suspicious campaigns, reply to donors.<br/>
          You cannot delete donations, change fees, or add delegates.<br/>
          All actions are logged.
        </p>

        <div style={{textAlign:'center', marginTop:'16px'}}>
          <a href="/" style={{fontSize:'12px', color:'#888', textDecoration:'underline'}}>← Back to Ask Kin</a>
        </div>
      </form>
    </div>
  );
}

