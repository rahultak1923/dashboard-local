import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { T, bodyFont, displayFont, cardStyle, inputStyle, primaryBtn } from '../theme';

export default function LoginPage({ onLoginSuccess, onGoRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    // Frontend validation demo
    if (username.trim() && password.trim()) {
      const mockUser = { username: username };
      localStorage.setItem('token', 'mock_token_12345');
      localStorage.setItem('user', JSON.stringify(mockUser));
      onLoginSuccess(mockUser);
    } else {
      setError('Kripya valid username aur password bharein!');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', background: `radial-gradient(1200px 600px at 100% -10%, #E1EEFF 0%, ${T.bg} 45%)`, fontFamily: bodyFont }}>
      <div style={{ ...cardStyle({ padding: 32 }), width: '100%', maxWidth: 420, boxShadow: T.shadowLg }}>
        <h2 style={{ fontFamily: displayFont, fontSize: 24, fontWeight: 600, color: T.text, marginBottom: 8 }}>Admin Login</h2>
        <p style={{ fontSize: 13, color: T.textSoft, marginBottom: 20 }}>Apne local CRM dashboard ko access karne ke liye login karein.</p>
        
        {error && <p style={{ color: T.bad, fontSize: 13, marginBottom: 12, fontWeight: 600 }}>{error}</p>}
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: T.textSoft, display: 'block', marginBottom: 6 }}>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              style={inputStyle} 
              placeholder="admin_username"
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: T.textSoft, display: 'block', marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPw ? 'text' : 'password'} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                style={{ ...inputStyle, paddingRight: 40 }} 
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowPw(!showPw)} 
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.textFaint }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" style={{ ...primaryBtn, width: '100%', justifyContent: 'center', padding: '12px', marginTop: 6 }}>
            Sign In
          </button>
        </form>

        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: T.textSoft }}>
          Don't have an account? <span onClick={onGoRegister} style={{ color: T.primary, fontWeight: 700, cursor: 'pointer' }}>Register</span>
        </p>
      </div>
    </div>
  );
}