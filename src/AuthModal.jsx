import React, { useState } from 'react';

const PROVIDERS = [
  "MTN", 
  "Airtel", 
  "M-Pesa (Safaricom / Vodacom)", 
  "Orange Money", 
  "Tigo Pesa", 
  "Wave", 
  "Other"
];

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    mobileMoneyNumber: '',
    mobileMoneyName: '',
    provider: 'MTN',
    providerOther: '',
    payoutMethod: 'Mobile Money',
    bankName: '',
    accountName: '',
    accountNumber: '',
    idType: 'National ID',
    idNumber: '',
    nameMatches: false,
  });

  if (!isOpen) return null;

  const inp = { width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize:'13px', boxSizing:'border-box' };
  const card = { background:'#f9fafb', border:'1px solid #eef2f7', borderRadius:'12px', padding:'12px', marginBottom:'12px' };
  const row = { display:'flex', gap:'8px', marginBottom:'10px' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLogin && !form.nameMatches) return alert('Please confirm your full name matches Mobile Money name');
    if (!isLogin && !form.mobileMoneyNumber) return alert('Please enter Mobile Money Number');
    
    setLoading(true);
    try {
      // normalize provider if Other
      const finalProvider = form.provider === 'Other' ? form.providerOther : form.provider;
      
      const payload = {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        payoutMethod: 'Mobile Money',
        provider: finalProvider,
        mobileMoneyNumber: form.mobileMoneyNumber,
        mobileMoneyName: form.mobileMoneyName,
        idType: form.idType,
        idNumber: form.idNumber,
      };

      const url = isLogin ? 'http://localhost:5000/api/auth/login' : 'http://localhost:5000/api/auth/register';
      const res = await fetch(url, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      
      onAuthSuccess && onAuthSuccess(data.user || { fullName: form.fullName, email: form.email });
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:60, display:'flex', alignItems:'center', justifyContent:'center', padding:'12px' }}>
      <div style={{ background:'white', width:'100%', maxWidth:'420px', borderRadius:'16px', padding:'18px', maxHeight:'92vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
          <b style={{ fontSize:'16px' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</b>
          <button onClick={onClose} style={{ border:'none', background:'#f1f5f9', width:'28px', height:'28px', borderRadius:'50%', cursor:'pointer' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {!isLogin && (
            <input style={inp} value={form.fullName} onChange={e=>setForm({...form, fullName:e.target.value})} placeholder="Full Name" required />
          )}
          <input style={inp} type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} placeholder="Email Address" required />
          <input style={inp} type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} placeholder="Password" required />

          {!isLogin && (
            <>
              <div style={card}>
                <div style={{ fontWeight:'bold', marginBottom:'10px', textAlign:'center', fontSize:'15px' }}>Payout Information</div>
                <div style={{ fontSize:'11px', color:'#065f46', background:'#ecfdf5', padding:'6px 8px', borderRadius:'6px', marginBottom:'8px', textAlign:'center' }}>
                  Mobile Money only for quick start. Bank option available in Create Campaign.
                </div>
                <div style={row}>
                  <select style={{...inp, flex:'0 0 150px'}} value={form.provider} onChange={e=>setForm({...form, provider:e.target.value})}>
                    {PROVIDERS.map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                  <input style={{...inp, flex:'1 1 150px'}} value={form.mobileMoneyNumber} onChange={e=>setForm({...form, mobileMoneyNumber:e.target.value})} placeholder="Mobile Money Number" required />
                </div>

                {form.provider === 'Other' && (
                  <input style={{...inp, marginBottom:'10px'}} value={form.providerOther} onChange={e=>setForm({...form, providerOther:e.target.value})} placeholder="Enter provider name e.g. Vodafone Cash, Moov" required />
                )}

                <input style={{...inp, marginBottom:0}} value={form.mobileMoneyName} onChange={e=>setForm({...form, mobileMoneyName:e.target.value})} placeholder="Mobile Money Registered Name" required />
                <div style={{ fontSize:'10px', color:'#6b7280', marginTop:'6px' }}>
                  M-Pesa = KE/TZ/DRC/MZ • Orange Money = SN/ML/CM/BW • Wave = CI/SN • Tigo = TZ/GH
                </div>
              </div>

              <div style={card}>
                <div style={{ fontWeight:'bold', marginBottom:'10px', textAlign:'center', fontSize:'15px' }}>KYC Verification</div>
                <div style={row}>
                  <select style={{...inp, flex:'0 0 120px'}} value={form.idType} onChange={e=>setForm({...form, idType:e.target.value})}>
                    <option>National ID</option><option>Passport</option><option>Driving Permit</option>
                  </select>
                  <input style={{...inp, flex:'1 1 150px'}} value={form.idNumber} onChange={e=>setForm({...form, idNumber:e.target.value})} placeholder="ID Number" required />
                </div>
                <div style={{...row, fontSize:'12px'}}>
                  <label style={{ flex:'1 1 180px', minWidth:0, border:'1px dashed #999', borderRadius:'8px', padding:'10px', textAlign:'center', cursor:'pointer', boxSizing:'border-box', overflow:'hidden' }}>
                    📁 Upload ID Document<br/><input type="file" style={{width:'100%', marginTop:'6px', fontSize:'11px'}} />
                  </label>
                  <label style={{ flex:'1 1 180px', minWidth:0, border:'1px dashed #999', borderRadius:'8px', padding:'10px', textAlign:'center', cursor:'pointer', boxSizing:'border-box', overflow:'hidden' }}>
                    📁 Upload Selfie holding ID<br/><input type="file" style={{width:'100%', marginTop:'6px', fontSize:'11px'}} />
                  </label>
                </div>
              </div>

              <label style={{ display:'flex', gap:'8px', fontSize:'12px', marginBottom:'14px', alignItems:'flex-start', lineHeight:'1.3' }}>
                <input type="checkbox" checked={form.nameMatches} onChange={e=>setForm({...form, nameMatches:e.target.checked})} required style={{marginTop:'2px'}} />
                <span>My full name matches my <b>Mobile Money name</b> and ID</span>
              </label>
            </>
          )}

          <button type="submit" disabled={loading} style={{ width:'100%', background:'#065f46', color:'white', padding:'14px', borderRadius:'10px', border:'none', fontWeight:'bold', cursor:'pointer', boxSizing:'border-box' }}>
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account & Verify'}
          </button>

          <div style={{ textAlign:'center', marginTop:'12px', fontSize:'13px' }}>
            {isLogin ? 'No account?' : 'Already have account?'}
            <button type="button" onClick={()=>setIsLogin(!isLogin)} style={{ border:'1px solid #065f46', padding:'4px 10px', borderRadius:'6px', marginLeft:'6px', cursor:'pointer', background:'white' }}>
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}