import React from 'react';

const Login = ({ username, setUsername, password, setPassword, handleLogin, t, setLang, lang }) => {
  const onKey = (e) => { if (e.key === 'Enter') handleLogin(); };

  return (
    <div className="login-container">
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position:'absolute', width:300, height:300, borderRadius:'50%', background:'rgba(46,139,87,0.06)', top:-80, right:-60 }} />
        <div style={{ position:'absolute', width:200, height:200, borderRadius:'50%', background:'rgba(46,139,87,0.04)', bottom:-40, left:-40 }} />
        <div style={{ position:'absolute', width:160, height:160, borderRadius:'50%', border:'1.5px solid rgba(46,139,87,0.1)', top:'30%', left:'5%' }} />
      </div>

      <div className="login-box" style={{ position: 'relative', zIndex: 1 }}>
        
        {/* Lang toggle */}
        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom: 24 }}>
          {[{v:'en',l:'EN'},{v:'hi',l:'हि'}].map(({v,l}) => (
            <button key={v} onClick={() => setLang(v)} style={{
              padding: '4px 13px', borderRadius: 100,
              background: lang === v ? 'var(--green-light)' : 'transparent',
              border: lang === v ? '1.5px solid rgba(46,139,87,0.3)' : '1.5px solid var(--border)',
              color: lang === v ? 'var(--green)' : 'var(--text-3)',
              fontSize: 11, fontWeight: 700, cursor: 'pointer', minHeight: 28,
              marginLeft: 6, transition: 'all 0.15s',
            }}>{l}</button>
          ))}
        </div>

        {/* Brand */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            width: 72, height: 72, margin: '0 auto 16px',
            borderRadius: 20,
            background: 'linear-gradient(145deg, #2E8B57, #1B6B3A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 34,
            boxShadow: '0 10px 28px rgba(27,107,58,0.35)',
          }}>🥛</div>
          <h1 style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700, fontSize: 26, color: 'var(--text)',
            margin: '0 0 6px', letterSpacing: '-0.3px',
          }}>{t.appTitle || 'Dairy Manager'}</h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0, fontWeight: 500 }}>
            {t.distributorDash || 'Distributor Dashboard'}
          </p>
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          {[
            { type:'text',     val: username, set: setUsername, ph: t.username || 'Username', icon: '👤' },
            { type:'password', val: password, set: setPassword, ph: t.password || 'Password', icon: '🔒' },
          ].map(({ type, val, set, ph, icon }) => (
            <div key={type} style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>{icon}</span>
              <input
                type={type}
                placeholder={ph}
                value={val}
                onChange={e => set(e.target.value)}
                onKeyDown={onKey}
                style={{
                  width: '100%',
                  padding: '13px 16px 13px 44px',
                  border: '1.5px solid var(--border)',
                  borderRadius: 10,
                  background: 'var(--surface-2)',
                  color: 'var(--text)',
                  fontSize: 14,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = '#2E8B57'; e.target.style.boxShadow = '0 0 0 3px rgba(46,139,87,0.12)'; e.target.style.background = 'var(--surface)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'var(--surface-2)'; }}
              />
            </div>
          ))}
        </div>

        {/* CTA */}
        <button onClick={handleLogin} style={{
          width: '100%', padding: '14px',
          background: 'linear-gradient(145deg, #2E8B57, #1B6B3A)',
          color: 'white', border: 'none', borderRadius: 10,
          fontSize: 15, fontWeight: 700,
          fontFamily: "'Poppins', sans-serif",
          cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(27,107,58,0.35)',
          letterSpacing: '0.2px',
          transition: 'all 0.18s',
        }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
        >
          {t.loginBtn || 'Login'} →
        </button>

        <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 20, fontWeight: 500, letterSpacing: '0.3px' }}>
          {t.securedMsg || '🔒 Secured · ☁️ Firebase Synced'}
        </p>
      </div>
    </div>
  );
};

export default Login;