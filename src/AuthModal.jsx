import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_BACKEND_URL || 'https://api.ask-kin.com';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode='register' }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    city: '',
    country: 'Uganda',
    password: '',
    usernameType: 'email',
    agreed: false,
  });

  // SURGICAL: sync Sign In vs Register buttons
  useEffect(() => {
    if (isOpen) {
      setIsLogin(initialMode === 'login');
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  // FIXED: PC readable — larger fonts
  const inp = { width:'100%', padding:'14px 16px', borderRadius:'12px', border:'1px solid #d6d3d1', fontSize:'15px', boxSizing:'border-box', outline:'none', background:'white' };
  const label = { fontSize:'13px', fontWeight:'700', color:'#44403c', marginBottom:'6px', display:'block' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLogin && !form.agreed) return alert('Please agree to Terms & Privacy Policy');
    if (!isLogin && !form.fullName.trim()) return alert('Full name required');
    if (!form.email && !form.phone) return alert('Enter email or phone');
    if (!form.password) return alert('Password required');
    
    setLoading(true);
    try {
      if (isLogin) {
        const loginId = form.usernameType === 'phone' ? form.phone : form.email;
        const res = await fetch(`${API}/api/auth/login`, {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ email: loginId, phone: loginId, password: form.password, username: loginId })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || data.error || 'Login failed');
        const user = data.user || { fullName: data.fullName || form.fullName, email: data.email || form.email, phone: form.phone };
        localStorage.setItem('userEmail', user.email || form.email || '');
        localStorage.setItem('userName', user.fullName || user.name || form.fullName || '');
        localStorage.setItem('userRole', user.role || 'user');
        if (data.token) localStorage.setItem('token', data.token);
        onAuthSuccess && onAuthSuccess(user);
      } else {
        const payload = {
          fullName: form.fullName,
          name: form.fullName,
          phone: form.phone,
          email: form.email,
          city: form.city,
          country: form.country,
          location: `${form.city}, ${form.country}`,
          password: form.password,
          username: form.usernameType === 'phone' ? form.phone : form.email,
          usernameType: form.usernameType,
        };
        const res = await fetch(`${API}/api/auth/register`, {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || data.error || 'Registration failed');
        const user = data.user || { fullName: form.fullName, email: form.email, phone: form.phone };
        localStorage.setItem('userEmail', user.email || form.email || '');
        localStorage.setItem('userName', user.fullName || form.fullName || '');
        localStorage.setItem('userRole', user.role || 'user');
        localStorage.setItem('userPhone', form.phone || '');
        if (data.token) localStorage.setItem('token', data.token);
        onAuthSuccess && onAuthSuccess(user);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:60, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
      <div style={{ background:'white', width:'100%', maxWidth:'460px', borderRadius:'20px', padding:'24px', maxHeight:'92vh', overflowY:'auto', boxShadow:'0 20px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px' }}>
          <div>
            <b style={{ fontSize:'19px', fontWeight:'900', color:'#1c1917' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</b>
            <div style={{fontSize:'13px', color:'#78716c', marginTop:'4px'}}>{isLogin ? 'Sign in to continue to your dashboard' : 'Get started with Ask Kin'}</div>
          </div>
          <button onClick={onClose} style={{ border:'none', background:'#f5f5f4', width:'36px', height:'36px', borderRadius:'50%', cursor:'pointer', fontSize:'20px' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          {!isLogin && (
            <>
              <div><span style={label}>Full Name *</span><input style={inp} value={form.fullName} onChange={e=>setForm({...form, fullName:e.target.value})} placeholder="e.g., John Okello" required /></div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                <div><span style={label}>Phone</span><input style={inp} type="tel" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} placeholder="0772 123456" /></div>
                <div><span style={label}>Email</span><input style={inp} type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} placeholder="you@example.com" /></div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                <div><span style={label}>City / Town</span><input style={inp} value={form.city} onChange={e=>setForm({...form, city:e.target.value})} placeholder="Gulu, Kampala" /></div>
                <div><span style={label}>Country</span>
                  <select style={inp} value={form.country} onChange={e=>setForm({...form, country:e.target.value})}>
                    <option>Uganda</option><option>Kenya</option><option>Tanzania</option><option>Rwanda</option><option>Burundi</option><option>DR Congo</option><option>South Sudan</option><option>Other</option>
                  </select>
                </div>
              </div>
              <div style={{background:'#fafaf9', border:'1px solid #e7e5e4', borderRadius:'12px', padding:'12px'}}>
                <span style={label}>Login method</span>
                <div style={{display:'flex', gap:'10px', marginTop:'8px'}}>
                  <label style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'14px', fontWeight:'600', cursor:'pointer', background: form.usernameType==='email'?'#ecfdf5':'white', border:`1px solid ${form.usernameType==='email'?'#a7f3d0':'#e7e5e4'}`, padding:'10px 14px', borderRadius:'10px', flex:1}}><input type="radio" name="utype" checked={form.usernameType==='email'} onChange={()=>setForm({...form, usernameType:'email'})} /> Email</label>
                  <label style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'14px', fontWeight:'600', cursor:'pointer', background: form.usernameType==='phone'?'#ecfdf5':'white', border:`1px solid ${form.usernameType==='phone'?'#a7f3d0':'#e7e5e4'}`, padding:'10px 14px', borderRadius:'10px', flex:1}}><input type="radio" name="utype" checked={form.usernameType==='phone'} onChange={()=>setForm({...form, usernameType:'phone'})} /> Phone</label>
                </div>
              </div>
            </>
          )}

          {isLogin && (
            <>
              <div style={{background:'#fafaf9', border:'1px solid #e7e5e4', borderRadius:'12px', padding:'12px'}}>
                <span style={label}>Login with</span>
                <div style={{display:'flex', gap:'10px', marginTop:'8px'}}>
                  <label style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'14px', fontWeight:'600', cursor:'pointer', background: form.usernameType==='email'?'#ecfdf5':'white', border:`1px solid ${form.usernameType==='email'?'#a7f3d0':'#e7e5e4'}`, padding:'10px 14px', borderRadius:'10px', flex:1}}><input type="radio" checked={form.usernameType==='email'} onChange={()=>setForm({...form, usernameType:'email'})} /> Email</label>
                  <label style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'14px', fontWeight:'600', cursor:'pointer', background: form.usernameType==='phone'?'#ecfdf5':'white', border:`1px solid ${form.usernameType==='phone'?'#a7f3d0':'#e7e5e4'}`, padding:'10px 14px', borderRadius:'10px', flex:1}}><input type="radio" checked={form.usernameType==='phone'} onChange={()=>setForm({...form, usernameType:'phone'})} /> Phone</label>
                </div>
              </div>
              {form.usernameType==='email' ? <div><span style={label}>Email</span><input style={inp} type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} placeholder="you@example.com" required /></div> : <div><span style={label}>Phone</span><input style={inp} type="tel" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} placeholder="0772..." required /></div>}
            </>
          )}

          <div><span style={label}>Password *</span><input style={inp} type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} placeholder={isLogin?'Your password':'Create password (min 6 chars)'} required /></div>

          {!isLogin && (
            <label style={{ display:'flex', gap:'10px', fontSize:'13px', background:'#f5f5f4', border:'1px solid #e7e5e4', padding:'12px', borderRadius:'10px', alignItems:'flex-start', lineHeight:'1.4' }}>
              <input type="checkbox" checked={form.agreed} onChange={e=>setForm({...form, agreed:e.target.checked})} required style={{marginTop:'3px'}} />
              <span>I agree to <a href="/terms" target="_blank" style={{color:'#0f4d3a', fontWeight:'700', textDecoration:'underline'}}>Terms</a> & <a href="/privacy-policy" target="_blank" style={{color:'#0f4d3a', fontWeight:'700', textDecoration:'underline'}}>Privacy Policy</a>. Data retained per policy for verification & payouts only.</span>
            </label>
          )}

          <button type="submit" disabled={loading} style={{ width:'100%', background: loading ? '#a8a29e' : '#0f4d3a', color:'white', padding:'16px', borderRadius:'12px', border:'none', fontWeight:'900', cursor: loading ? 'wait' : 'pointer', fontSize:'15px', marginTop:'4px' }}>
            {loading ? 'Please wait...' : isLogin ? 'Sign In → Dashboard' : 'Create Account → Dashboard'}
          </button>

          <div style={{ textAlign:'center', fontSize:'14px', color:'#57534e', marginTop:'4px' }}>
            {isLogin ? 'No account?' : 'Already have account?'}
            <button type="button" onClick={()=>setIsLogin(!isLogin)} style={{ border:'1px solid #0f4d3a', padding:'7px 16px', borderRadius:'999px', marginLeft:'10px', cursor:'pointer', background:'white', fontWeight:'700', color:'#0f4d3a' }}>
              {isLogin ? 'Create Account' : 'Sign In'}
            </button>
          </div>

          <div style={{textAlign:'center', fontSize:'12px', color:'#a8a29e', marginTop:'2px', lineHeight:'1.4'}}>
            Data retained securely per our Privacy Policy — used only for payouts & verification.
          </div>
        </form>
      </div>
    </div>
  );
}

