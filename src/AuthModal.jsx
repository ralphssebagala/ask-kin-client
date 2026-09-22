import { useState } from 'react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', mobileMoneyName: '',
    mobileMoneyNumber: '', provider: 'MTN', payoutMethod: 'Mobile Money',
    bankName: '', accountName: '', accountNumber: '',
    idType: 'National ID', idNumber: '', nameMatches: false
  });

  if (!isOpen) return null;

  const inp = { width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '10px', border: '1px solid #ccc', marginBottom: '10px', fontSize: '14px', minWidth: 0 };
  const card = { background: '#f7f7f7', padding: '14px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '14px', boxSizing: 'border-box' };
  const row = { display: 'flex', gap: '8px', flexWrap: 'wrap', boxSizing: 'border-box' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLogin && !form.nameMatches) return alert('Please confirm your full name matches Mobile Money name');
    try {
      const r = await fetch(`http://localhost:5000/api/auth/${isLogin ? 'login' : 'register'}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      });
      const d = await r.json(); if (!r.ok) throw new Error(d.error);
      onAuthSuccess(d); onClose();
    } catch (err) { alert(err.message); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '12px', overflowY: 'auto', overflowX: 'hidden' }}>
      <div style={{ background: 'white', width: '100%', maxWidth: '480px', margin: '20px auto', borderRadius: '18px', boxSizing: 'border-box', overflowX: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', borderTopLeftRadius: '18px', borderTopRightRadius: '18px', boxSizing: 'border-box' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</div>
            <div style={{ fontSize: '11px', color: '#666' }}>© 2026 Ask Kin - Empowering community support</div>
          </div>
          <button onClick={onClose} style={{ border: '1px solid #ddd', minWidth: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', background: 'white' }}>X</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '16px', boxSizing: 'border-box', overflowX: 'hidden' }}>
          {!isLogin && <input style={inp} value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="Full Name (as on ID)" required />}
          <input style={inp} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" placeholder="bushanahpeters@gmail.com" required />

          <div style={{ position: 'relative', marginBottom: '10px', boxSizing: 'border-box' }}>
            <input style={{ ...inp, marginBottom: 0, paddingRight: '44px' }} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} type={showPassword ? 'text' : 'password'} placeholder="Password" required />
            <span onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '11px', cursor: 'pointer' }}>👁️</span>
          </div>

          {!isLogin && <>
            <div style={card}>
              <div style={{ fontWeight: 'bold', marginBottom: '10px', textAlign: 'center', fontSize: '15px' }}>Payout Information</div>
              <select style={inp} value={form.payoutMethod} onChange={e => setForm({ ...form, payoutMethod: e.target.value })}><option>Mobile Money</option><option>Bank Account</option></select>
              {form.payoutMethod === 'Mobile Money' ? (
                <>
                  <div style={row}>
                    <select style={{ ...inp, flex: '0 0 90px' }} value={form.provider} onChange={e => setForm({ ...form, provider: e.target.value })}><option>MTN</option><option>Airtel</option></select>
                    <input style={{ ...inp, flex: '1 1 150px' }} value={form.mobileMoneyNumber} onChange={e => setForm({ ...form, mobileMoneyNumber: e.target.value })} placeholder="Mobile Money Number" required />
                  </div>
                  <input style={{ ...inp, marginBottom: 0 }} value={form.mobileMoneyName} onChange={e => setForm({ ...form, mobileMoneyName: e.target.value })} placeholder="Mobile Money Registered Name" required />
                </>
              ) : (
                <>
                  <input style={inp} value={form.bankName} onChange={e => setForm({ ...form, bankName: e.target.value })} placeholder="Bank Name" />
                  <input style={inp} value={form.accountName} onChange={e => setForm({ ...form, accountName: e.target.value })} placeholder="Account Name" />
                  <input style={{ ...inp, marginBottom: 0 }} value={form.accountNumber} onChange={e => setForm({ ...form, accountNumber: e.target.value })} placeholder="Account Number" />
                </>
              )}
            </div>

            <div style={card}>
              <div style={{ fontWeight: 'bold', marginBottom: '10px', textAlign: 'center', fontSize: '15px' }}>KYC Verification</div>
              <div style={row}>
                <select style={{ ...inp, flex: '0 0 120px' }} value={form.idType} onChange={e => setForm({ ...form, idType: e.target.value })}><option>National ID</option><option>Passport</option><option>Driving Permit</option></select>
                <input style={{ ...inp, flex: '1 1 150px' }} value={form.idNumber} onChange={e => setForm({ ...form, idNumber: e.target.value })} placeholder="ID Number" required />
              </div>
              <div style={{ ...row, fontSize: '12px' }}>
                <label style={{ flex: '1 1 180px', minWidth: 0, border: '1px dashed #999', borderRadius: '8px', padding: '10px', textAlign: 'center', cursor: 'pointer', boxSizing: 'border-box', overflow: 'hidden' }}>
                  ⬆️ Upload ID Document<br /><input type="file" style={{ width: '100%', marginTop: '6px', fontSize: '11px' }} />
                </label>
                <label style={{ flex: '1 1 180px', minWidth: 0, border: '1px dashed #999', borderRadius: '8px', padding: '10px', textAlign: 'center', cursor: 'pointer', boxSizing: 'border-box', overflow: 'hidden' }}>
                  ⬆️ Upload Selfie holding ID<br /><input type="file" style={{ width: '100%', marginTop: '6px', fontSize: '11px' }} />
                </label>
              </div>
            </div>

            <label style={{ display: 'flex', gap: '8px', fontSize: '12px', marginBottom: '14px', alignItems: 'flex-start', lineHeight: '1.3' }}>
              <input type="checkbox" checked={form.nameMatches} onChange={e => setForm({ ...form, nameMatches: e.target.checked })} required style={{ marginTop: '2px' }} />
              <span>My full name matches my <b>Mobile Money name</b> and ID</span>
            </label>
          </>}

          <button type="submit" style={{ width: '100%', background: '#065f46', color: 'white', padding: '14px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer', boxSizing: 'border-box' }}>
            {isLogin ? 'Login' : 'Create Account & Verify'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '13px' }}>
            {isLogin ? 'No account?' : 'Already have account?'}
            <button type="button" onClick={() => setIsLogin(!isLogin)} style={{ border: '1px solid #065f46', padding: '4px 10px', borderRadius: '6px', marginLeft: '6px', cursor: 'pointer', background: 'white' }}>
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}