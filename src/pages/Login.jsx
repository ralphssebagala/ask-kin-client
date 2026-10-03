import { GoogleLoginButton } from '../components/GoogleLoginButton.jsx'

export default function Login() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '20px' }}>
      <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: '100%', maxWidth: '400px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
        <div style={{ width: 56, height: 56, background: '#0f4d3a', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>💚</div>
        <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '6px', color: '#0f172a' }}>Welcome to Ask Kin</h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '28px', lineHeight: '1.5' }}>Sign in with Google - works without VPN in Uganda</p>
        
        <GoogleLoginButton />
        
        <div style={{ marginTop: '24px', padding: '12px', background: '#f8fafc', borderRadius: '10px', textAlign: 'left' }}>
          <p style={{ fontSize: '11px', color: '#64748b', margin: 0, lineHeight: '1.6' }}>
            <b style={{ color: '#0f4d3a' }}>askkin.client@gmail.com</b> → Owner / Admin<br/>
            <b>amongieeve@gmail.com</b> → Delegate Dashboard<br/>
            Any other Gmail → Donor Dashboard
          </p>
        </div>
      </div>
    </div>
  )
}