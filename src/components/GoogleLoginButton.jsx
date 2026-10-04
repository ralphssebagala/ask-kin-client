const API_BASE = import.meta.env.VITE_API_BASE || 'https://api.ask-kin.com/api';
export function GoogleProvider({ children }) { return children; }
export function GoogleLoginButton() {
  const handleGoogle = () => { window.location.href = `${API_BASE}/auth/google`; };
  return (
    <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
      <button onClick={handleGoogle} style={{display:'flex',alignItems:'center',gap:'10px',background:'white',border:'1px solid #dadce0',padding:'10px 20px',borderRadius:'999px',fontSize:'14px',fontWeight:'500',cursor:'pointer'}}>
        <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="G" style={{ width: 18, height: 18 }} />
        Continue with Google
      </button>
    </div>
  );
}
export default GoogleLoginButton;
