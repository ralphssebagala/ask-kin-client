import React, { useState } from 'react';

const PROVIDERS = ["MTN","Airtel","M-Pesa (Safaricom / Vodacom)","Orange Money","Tigo Pesa","Wave","Other"];

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [idFile, setIdFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [form, setForm] = useState({
    fullName: '', email: '', password: '',
    mobileMoneyNumber: '', mobileMoneyName: '',
    provider: 'MTN', providerOther: '',
    idType: 'National ID', idNumber: '',
    nameMatches: false,
    agreed: false, // Play Store compliance
  });

  if (!isOpen) return null;

  const inp = { width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize:'13px', boxSizing:'border-box' };
  const card = { background:'#f9fafb', border:'1px solid #eef2f7', borderRadius:'12px', padding:'12px', marginBottom:'12px' };
  const row = { display:'flex', gap:'8px', marginBottom:'10px' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLogin) {
      if (!form.nameMatches) return alert('Please confirm your full name matches Mobile Money name');
      if (!form.agreed) return alert('Please agree to Terms & Privacy Policy to continue');
      if (!form.mobileMoneyNumber) return alert('Enter Mobile Money Number');
      if (!idFile || !selfieFile) return alert('Please upload ID Document and Selfie holding ID');
    }
    
    setLoading(true);
    try {
      const finalProvider = form.provider === 'Other' ? form.providerOther : form.provider;
      const fd = new FormData();
      fd.append('fullName', form.fullName);
      fd.append('email', form.email);
      fd.append('password', form.password);
      fd.append('provider', finalProvider);
      fd.append('mobileMoneyNumber', form.mobileMoneyNumber);
      fd.append('mobileMoneyName', form.mobileMoneyName);
      fd.append('idType', form.idType);
      fd.append('idNumber', form.idNumber);
      if (idFile) fd.append('idDocument', idFile);
      if (selfieFile) fd.append('selfie', selfieFile);

      const url = isLogin ? 'http://localhost:5000/api/auth/login' : 'http://localhost:5000/api/auth/register';
      const isFormData = !isLogin;
      const res = await fetch(url, {
        method:'POST',
        headers: isFormData ? {} : {'Content-Type':'application/json'},
        body: isFormData ? fd : JSON.stringify({ email: form.email, password: form.password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Failed');
      
      alert(isLogin ? 'Login success!' : 'Account created! Verification pending. You will be notified once approved.');
      onAuthSuccess && onAuthSuccess(data.user || { fullName: form.fullName, email: form.email });
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:60, display:'flex', alignItems:'center', justifyContent:'center', padding:'12px' }}>
      <div style={{ background:'white', width:'100%', maxWidth:'440px', borderRadius:'16px', padding:'18px', maxHeight:'92vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
          <b style={{ fontSize:'16px' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</b>
          <button onClick={onClose} style={{ border:'none', background:'#f1f5f9', width:'28px', height:'28px', borderRadius:'50%', cursor:'pointer' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {!isLogin && <input style={inp} value={form.fullName} onChange={e=>setForm({...form, fullName:e.target.value})} placeholder="Full Name (must match ID & Mobile Money)" required />}
          <input style={inp} type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} placeholder="Email Address" required />
          <input style={inp} type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} placeholder="Password" required />

          {!isLogin && (
            <>
              <div style={card}>
                <div style={{ fontWeight:'bold', marginBottom:'10px', textAlign:'center', fontSize:'14px' }}>Payout Information</div>
                <div style={{ fontSize:'11px', color:'#065f46', background:'#ecfdf5', padding:'6px 8px', borderRadius:'6px', marginBottom:'8px', textAlign:'center' }}>
                  Mobile Money only for quick start. Bank option available in Create Campaign.
                </div>
                <div style={row}>
                  <select style={{...inp, flex:'0 0 140px'}} value={form.provider} onChange={e=>setForm({...form, provider:e.target.value})}>
                    {PROVIDERS.map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                  <input style={{...inp, flex:'1'}} value={form.mobileMoneyNumber} onChange={e=>setForm({...form, mobileMoneyNumber:e.target.value})} placeholder="Mobile Money Number" required />
                </div>
                {form.provider === 'Other' && <input style={{...inp, marginBottom:'10px'}} value={form.providerOther} onChange={e=>setForm({...form, providerOther:e.target.value})} placeholder="Provider e.g. Vodafone Cash, Moov" required />}
                <input style={inp} value={form.mobileMoneyName} onChange={e=>setForm({...form, mobileMoneyName:e.target.value})} placeholder="Mobile Money Registered Name" required />
                <div style={{ fontSize:'10px', color:'#6b7280', marginTop:'6px' }}>M-Pesa = KE/TZ/DRC/MZ • Orange Money = SN/ML/CM/BW • Wave = CI/SN • Tigo = TZ/GH</div>
              </div>

              <div style={card}>
                <div style={{ fontWeight:'bold', marginBottom:'10px', textAlign:'center', fontSize:'14px' }}>KYC Verification</div>
                <div style={row}>
                  <select style={{...inp, flex:'0 0 120px'}} value={form.idType} onChange={e=>setForm({...form, idType:e.target.value})}>
                    <option>National ID</option><option>Passport</option><option>Driving Permit</option>
                  </select>
                  <input style={{...inp, flex:'1'}} value={form.idNumber} onChange={e=>setForm({...form, idNumber:e.target.value})} placeholder="ID Number" required />
                </div>
                <div style={{ display:'flex', gap:'8px', fontSize:'12px' }}>
                  <label style={{ flex:1, border:'1px dashed #065f46', borderRadius:'8px', padding:'10px', textAlign:'center', cursor:'pointer', background: idFile ? '#ecfdf5' : 'white' }}>
                    📁 {idFile ? idFile.name.slice(0,20) : 'Upload ID Document'}
                    <input type="file" accept="image/*" hidden onChange={e=>setIdFile(e.target.files[0])} />
                    <div style={{ fontSize:'10px', color: idFile ? '#065f46' : '#6b7280', marginTop:'4px' }}>{idFile ? '✓ Selected' : 'Front side, clear'}</div>
                  </label>
                  <label style={{ flex:1, border:'1px dashed #065f46', borderRadius:'8px', padding:'10px', textAlign:'center', cursor:'pointer', background: selfieFile ? '#ecfdf5' : 'white' }}>
                    📁 {selfieFile ? selfieFile.name.slice(0,20) : 'Upload Selfie holding ID'}
                    <input type="file" accept="image/*" hidden onChange={e=>setSelfieFile(e.target.files[0])} />
                    <div style={{ fontSize:'10px', color: selfieFile ? '#065f46' : '#6b7280', marginTop:'4px' }}>{selfieFile ? '✓ Selected' : 'Face + ID visible'}</div>
                  </label>
                </div>
              </div>

              <label style={{ display:'flex', gap:'8px', fontSize:'12px', marginBottom:'4px', alignItems:'flex-start' }}>
                <input type="checkbox" checked={form.nameMatches} onChange={e=>setForm({...form, nameMatches:e.target.checked})} required style={{marginTop:'2px'}} />
                <span>My full name matches my <b>Mobile Money name</b> and ID (required for payout)</span>
              </label>

              {/* PLAY STORE COMPLIANCE - Minimal Permissible */}
              <label style={{ display:'flex', gap:'8px', fontSize:'11px', marginBottom:'10px', alignItems:'flex-start', background:'#f0fdf4', border:'1px solid #bbf7d0', padding:'8px', borderRadius:'8px' }}>
                <input type="checkbox" checked={form.agreed} onChange={e=>setForm({...form, agreed:e.target.checked})} required style={{marginTop:'2px', accentColor:'#065f46'}} />
                <span style={{ lineHeight:'15px' }}>
                  I am 18+ and agree to Ask Kin's{' '}
                  <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color:'#065f46', fontWeight:'bold', textDecoration:'underline' }}>Terms & Conditions</a>
                  {' '}and{' '}
                  <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color:'#065f46', fontWeight:'bold', textDecoration:'underline' }}>Privacy Policy</a>
                  . I consent to ID verification and escrow processing by licensed aggregator.
                </span>
              </label>
            </>
          )}

          <button type="submit" disabled={loading || (!isLogin && (!form.nameMatches || !form.agreed))} style={{ width:'100%', background: (!isLogin && (!form.nameMatches || !form.agreed)) ? '#9ca3af' : '#065f46', color:'white', padding:'14px', borderRadius:'10px', border:'none', fontWeight:'bold', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account & Verify'}
          </button>

          <div style={{ textAlign:'center', marginTop:'10px', fontSize:'13px' }}>
            {isLogin ? 'No account?' : 'Already have account?'}
            <button type="button" onClick={()=>setIsLogin(!isLogin)} style={{ border:'1px solid #065f46', padding:'4px 10px', borderRadius:'6px', marginLeft:'6px', cursor:'pointer', background:'white' }}>
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </div>

          {!isLogin && (
            <div style={{ textAlign:'center', marginTop:'8px', fontSize:'10px', color:'#9ca3af' }}>
              By signing up, you agree to our <a href="/terms" target="_blank" style={{textDecoration:'underline'}}>T&C</a> and <a href="/privacy-policy" target="_blank" style={{textDecoration:'underline'}}>Privacy Policy</a>. Monday 11AM payouts, 10% fee, UGX 50k min.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

