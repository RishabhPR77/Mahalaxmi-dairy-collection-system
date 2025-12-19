import React from 'react';

// --- STYLES ---
const styles = {
  layoutContainer: {
    minHeight: '100vh',
    background: 'var(--bg-body)',
    color: 'var(--text-main)',
    fontFamily: "'Inter', sans-serif",
    transition: 'background 0.3s'
  },
  header: {
    background: 'var(--header-bg)',
    padding: '15px 25px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--border-color)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'blur(10px)'
  },
  logo: {
    margin: 0,
    fontSize: '22px',
    background: 'linear-gradient(135deg, #6366F1 0%, #a855f7 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: '800'
  },
  controls: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  iconBtn: {
    background: 'var(--btn-bg)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    padding: '8px 15px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.2s',
    minWidth: '40px', // Ensure buttons are clickable
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoutBtn: {
    background: '#EF4444',
    color: 'white',
    border: 'none',
    padding: '8px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  navContainer: {
    background: 'var(--header-bg)',
    padding: '10px 20px',
    borderBottom: '1px solid var(--border-color)',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    display: 'flex',
    gap: '10px'
  },
  tab: (isActive, color) => ({
    padding: '10px 20px',
    borderRadius: '8px', // Slightly squarer for text-only look
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s',
    background: isActive ? (color || '#6366F1') : 'transparent',
    color: isActive ? 'white' : 'var(--text-secondary)',
    boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
  }),
  content: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  }
};

const Layout = ({ children, t, lang, setLang, darkMode, setDarkMode, handleLogout, activeTab, setActiveTab }) => {
  
  // Tabs Configuration (REMOVED ICONS)
  const tabs = [
    { id: 'home', label: t.tabHome, color: '#6366F1' },
    { id: 'entry', label: t.tabEntry, color: '#3B82F6' },
    { id: 'customers', label: t.tabCustomers, color: '#8B5CF6' },
    { id: 'payment', label: t.tabPayment, color: '#10B981' },
    { id: 'master', label: t.tabMaster, color: '#F59E0B' },
    { id: 'report', label: t.tabReport, color: '#EC4899' },
    { id: 'delete', label: t.tabDelete, color: '#EF4444' },
  ];

  return (
    <div style={styles.layoutContainer} className={darkMode ? 'dark-mode' : ''}>
      
      {/* THEME VARIABLES */}
      <style>{`
        :root {
          --bg-body: #F3F4F6;
          --header-bg: #ffffff;
          --card-bg: #ffffff;
          --text-main: #1F2937;
          --text-secondary: #6B7280;
          --border-color: #E5E7EB;
          --btn-bg: #F9FAFB;
          --input-bg: #F9FAFB;
          --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          --badge-bg: #E0E7FF;
          --badge-text: #4338CA;
        }

        .dark-mode {
          --bg-body: #111827;
          --header-bg: #1F2937;
          --card-bg: #1F2937;
          --text-main: #F9FAFB;
          --text-secondary: #9CA3AF;
          --border-color: #374151;
          --btn-bg: #374151;
          --input-bg: #111827;
          --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
          --badge-bg: #312E81;
          --badge-text: #E0E7FF;
        }
        
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #ccc; borderRadius: 4px; }
      `}</style>

      {/* HEADER */}
      <div style={styles.header}>
        {/* Removed Milk Emoji */}
        <h1 style={styles.logo}>{t.appTitle}</h1>
        
        <div style={styles.controls}>
          {/* Removed Flag Emojis */}
          <button onClick={() => setLang(prev => prev === "en" ? "hi" : "en")} style={styles.iconBtn}>
             {lang === 'en' ? 'Hindi' : 'English'}
          </button>
          
          {/* Kept Sun/Moon as they are standard functional icons, but removed emoji chars if you prefer text */}
          <button onClick={() => setDarkMode(!darkMode)} style={styles.iconBtn}>
            {darkMode ? 'Light' : 'Dark'}
          </button>
          
          <button onClick={handleLogout} style={styles.logoutBtn}>
            {t.logoutBtn}
          </button>
        </div>
      </div>

      {/* TABS (CLEAN TEXT ONLY) */}
      <div style={styles.navContainer}>
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={styles.tab(activeTab === tab.id, tab.color)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* PAGE CONTENT */}
      <div style={styles.content}>
        {children} 
      </div>

    </div>
  );
};

export default Layout;