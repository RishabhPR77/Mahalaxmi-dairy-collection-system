import React from 'react';

const Layout = ({ children, t, lang, setLang, darkMode, setDarkMode, handleLogout, activeTab, setActiveTab }) => {

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-body)',
      color: 'var(--text-main)',
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* ── HEADER ── */}
      <header style={{
        background: 'var(--bg-header)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 24px',
        height: 58,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 200,
        boxShadow: '0 1px 8px rgba(27,107,58,0.07)',
      }}>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(145deg, #2E8B57, #1B6B3A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, boxShadow: '0 4px 10px rgba(27,107,58,0.3)', flexShrink: 0,
          }}>🥛</div>
          <div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 16, color: 'var(--text-main)', lineHeight: 1.2 }}>
              {t.appTitle || 'Dairy Manager'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 500, letterSpacing: '0.3px' }}>
              {t.distributorPanel || 'DISTRIBUTOR PANEL'}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setLang(p => p === 'en' ? 'hi' : 'en')} style={{
            background: 'var(--btn-bg)', border: '1px solid var(--border-color)',
            color: 'var(--text-2)', padding: '0 12px',
            height: 32, minHeight: 32, borderRadius: 6, fontSize: 12, fontWeight: 700,
          }}>
            {lang === 'en' ? '🇮🇳 हिंदी' : '🇺🇸 English'}
          </button>

          <button onClick={() => setDarkMode(d => !d)} style={{
            background: 'var(--btn-bg)', border: '1px solid var(--border-color)',
            color: 'var(--text-2)', width: 32, height: 32, minHeight: 32,
            borderRadius: 6, padding: 0, fontSize: 16,
          }}>
            {darkMode ? '☀️' : '🌙'}
          </button>

          <button onClick={handleLogout} style={{
            background: 'transparent',
            border: '1px solid rgba(220,38,38,0.3)',
            color: '#DC2626',
            padding: '0 14px', height: 32, minHeight: 32,
            borderRadius: 6, fontSize: 12, fontWeight: 700,
          }}>
            {t.logout || 'Logout'}
          </button>
        </div>
      </header>

      {/* ── NAV (shown only on non-home tabs) ── */}
      {activeTab !== 'home' && (
        <nav style={{
          background: 'var(--bg-header)',
          borderBottom: '1px solid var(--border-color)',
          padding: '0 24px',
          display: 'flex', gap: 2,
          overflowX: 'auto',
          height: 48,
          alignItems: 'center',
        }}>
          {[
            { id: 'home',      label: '← ' + (t.navHome || 'Dashboard') },
            { id: 'entry',     label: '📝 ' + (t.navEntry || 'Daily Entry') },
            { id: 'customers', label: '👥 ' + (t.navCustomers || 'Customers') },
            { id: 'payment',   label: '💰 ' + (t.navPayment || 'Payments') },
            { id: 'master',    label: '📊 ' + (t.navMaster || 'Master Report') },
            { id: 'report',    label: '📄 ' + (t.navReport || 'Individual Bill') },
            { id: 'delete',    label: '🗑️ ' + (t.navDelete || 'Delete') },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            const isDanger = tab.id === 'delete';
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '7px 14px',
                  height: 34, minHeight: 34,
                  borderRadius: 6, border: 'none',
                  fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                  background: isActive
                    ? isDanger ? '#FEF2F2' : 'var(--green-light)'
                    : 'transparent',
                  color: isActive
                    ? isDanger ? '#DC2626' : 'var(--green)'
                    : isDanger ? 'rgba(220,38,38,0.6)' : 'var(--text-2)',
                  borderBottom: isActive ? `2px solid ${isDanger ? '#DC2626' : 'var(--green)'}` : '2px solid transparent',
                  borderRadius: 0,
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      )}

      {/* ── CONTENT ── */}
      <main style={{ padding: '24px 24px', maxWidth: 1200, margin: '0 auto' }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;