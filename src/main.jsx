// main.jsx final:
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleProvider } from './components/GoogleLoginButton.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <GoogleProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </GoogleProvider>
)