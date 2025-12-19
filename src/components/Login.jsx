import React from 'react';

// --- STYLES (Dark Mode Ready) ---
const styles = {
  container: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #6366F1 0%, #a855f7 100%)', // Nice gradient background
    padding: '20px'
  },
  card: {
    background: 'var(--card-bg, #ffffff)', // Fallback to white if var not set
    padding: '40px',
    borderRadius: '24px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
    display: 'flex', 
    flexDirection: 'column', 
    gap: '20px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#333',
    marginBottom: '10px'
  },
  input: {
    width: '100%',
    padding: '15px',
    borderRadius: '12px',
    border: '2px solid #E5E7EB',
    background: '#F9FAFB',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box' // Important for padding
  },
  loginBtn: {
    width: '100%',
    padding: '15px',
    borderRadius: '12px',
    border: 'none',
    background: '#6366F1', // Indigo color
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
    boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.4)'
  },
  langToggle: {
    display: 'flex', 
    justifyContent: 'center', 
    gap: '10px', 
    marginBottom: '10px'
  },
  langBtn: (isActive) => ({
    padding: '6px 16px',
    borderRadius: '20px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    background: isActive ? '#E0E7FF' : 'transparent',
    color: isActive ? '#4338CA' : '#6B7280'
  })
};

const Login = ({ username, setUsername, password, setPassword, handleLogin, t, setLang, lang }) => {
  return (
    <div style={styles.container}>
      
      <div style={styles.card}>
        {/* Language Toggle */}
        <div style={styles.langToggle}>
           <button onClick={() => setLang("en")} style={styles.langBtn(lang === 'en')}>English</button>
           <button onClick={() => setLang("hi")} style={styles.langBtn(lang === 'hi')}>हिंदी</button>
        </div>

        {/* Title */}
        <div>
          <h1 style={{margin: 0, fontSize: '32px'}}>🥛</h1>
          <h2 style={styles.title}>{t.loginTitle}</h2>
        </div>

        {/* Form */}
        <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
          <input 
            type="text" 
            placeholder={t.username} 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            style={styles.input}
          />
          <input 
            type="password" 
            placeholder={t.password} 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={styles.input}
          />
        </div>

        <button onClick={handleLogin} style={styles.loginBtn}>
          {t.loginBtn} →
        </button>
      </div>

    </div>
  );
};

export default Login;