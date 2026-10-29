import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { T, bodyFont, displayFont, cardStyle, inputStyle, primaryBtn } from '../theme';

export default function RegisterPage({ onRegisterSuccess, onGoLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');

    if (username.trim() && password.trim()) {
      alert('Admin account successfully created (Frontend mode)! Kripya ab login karein.');
      onGoLogin();
    } else {
      setError('Kripya sabhi fields sahi se bharein.');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', background: `radial-gradient(1200px 600px at 100% -10%, #E1EEFF 0%, ${T.bg} 45%)`, fontFamily: bodyFont }}>
      <div style={{ ...cardStyle({ padding: 32 }), width: '100%', maxWidth: 420, boxShadow: T.shadowLg }}>
        <h2 style={{ fontFamily: displayFont, fontSize: 24, fontWeight: 600, color: T.text, marginBottom: 8 }}>Create Admin Account</h2>
        <p style={{ fontSize: 13, color: T.textSoft, marginBottom: 20 }}>Naya admin account banane ke liye details darj karein.</p>
        
        {error && <p style={{ color: T.bad, fontSize: 13, marginBottom: 12, fontWeight: 600 }}>{error}</p>}
        
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
            Register Admin
          </button>
        </form>

        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: T.textSoft }}>
          Already have an account? <span onClick={onGoLogin} style={{ color: T.primary, fontWeight: 700, cursor: 'pointer' }}>Sign In</span>
        </p>
      </div>
    </div>
  );
}