import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

const GOOGLE_CLIENT_ID = '712171613624-fk3gotmff326fjdlpvcisb9k5hs5fo4b.apps.googleusercontent.com';
const API_BASE = 'https://api.ask-kin.com/api';

export function GoogleProvider({ children }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
}

export function GoogleLoginButton() {
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('ownerToken', data.token);
        localStorage.setItem('delegateToken', data.token);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('userRole', data.user.role);
        
        if (data.user.role === 'owner') navigate('/admin');
        else if (data.user.role === 'delegate') navigate('/delegate');
        else navigate('/dashboard');
      } else {
        alert('Google login failed: ' + data.message);
      }
    } catch (e) {
      alert('Backend not reachable: ' + e.message);
    }
  };

  return (
    <div style={{ marginTop: '12px' }}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => alert('Google login failed')}
        theme="outline"
        size="large"
        width="320"
        shape="pill"
        text="continue_with"
      />
    </div>
  );
}
export default GoogleLoginButton;

