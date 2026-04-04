import React, { useRef } from 'react';

/* ── STAT CARD ────────────────────────────────────────── */
const Stat = ({ label, value, accent, icon }) => (
  <div
    className="stat-card"
    style={{ '--accent': accent }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
  >
    {icon && <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>}
    <h3>{label}</h3>
    <div className="value" style={{ color: accent }}>{value}</div>
  </div>
);

/* ── MAIN ─────────────────────────────────────────────── */
const Dashboard = ({ customers, logs, t, exportData, importData, setActiveTab }) => {
  const fileInputRef = useRef(null);
  const isDark = document.body.classList.contains('dark-mode');

  /* ── NAV CARDS MOVED INSIDE TO ACCESS `t` ── */
  const NAV_CARDS = [
    {
      id: 'entry',
      icon: '📝',
      title: t.navEntry || 'Daily Entry',
      subtitle: t.subEntry || 'Record morning & evening milk',
      color: '#2E8B57',
      bg: 'linear-gradient(135deg, #E8F5EE, #D1EEDB)',
      darkBg: 'linear-gradient(135deg, rgba(46,139,87,0.15), rgba(46,139,87,0.08))',
      border: 'rgba(46,139,87,0.25)',
    },
    {
      id: 'customers',
      icon: '👥',
      title: t.navCustomers || 'Customers',
      subtitle: t.subCustomers || 'Add, edit & manage customers',
      color: '#7C3AED',
      bg: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)',
      darkBg: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(124,58,237,0.08))',
      border: 'rgba(124,58,237,0.25)',
    },
    {
      id: 'payment',
      icon: '💰',
      title: t.navPayment || 'Payments',
      subtitle: t.subPayment || 'Track dues & payments',
      color: '#D97706',
      bg: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
      darkBg: 'linear-gradient(135deg, rgba(217,119,6,0.15), rgba(217,119,6,0.08))',
      border: 'rgba(217,119,6,0.25)',
    },
    {
      id: 'master',
      icon: '📊',
      title: t.navMaster || 'Master Report',
      subtitle: t.subMaster || 'Monthly summary for all customers',
      color: '#0369A1',
      bg: 'linear-gradient(135deg, #E0F2FE, #BAE6FD)',
      darkBg: 'linear-gradient(135deg, rgba(3,105,161,0.15), rgba(3,105,161,0.08))',
      border: 'rgba(3,105,161,0.25)',
    },
    {
      id: 'report',
      icon: '📄',
      title: t.navReport || 'Individual Bill',
      subtitle: t.subReport || 'Generate & share PDF bills',
      color: '#0F766E',
      bg: 'linear-gradient(135deg, #CCFBF1, #99F6E4)',
      darkBg: 'linear-gradient(135deg, rgba(15,118,110,0.15), rgba(15,118,110,0.08))',
      border: 'rgba(15,118,110,0.25)',
    },
    {
      id: 'delete',
      icon: '🗑️',
      title: t.navDelete || 'Delete Records',
      subtitle: t.subDelete || 'Remove customers & logs',
      color: '#DC2626',
      bg: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)',
      darkBg: 'linear-gradient(135deg, rgba(220,38,38,0.12), rgba(220,38,38,0.06))',
      border: 'rgba(220,38,38,0.25)',
    },
  ];

  const getStats = () => {
    const now = new Date();
    const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    let totalMilk = 0, totalRev = 0, morningMilk = 0, morningRev = 0, eveningMilk = 0, eveningRev = 0, mActive = 0, eActive = 0;
    customers.forEach(c => {
      const e = logs[`${today}-${c.id}`];
      if (!e) return;
      const mL = parseFloat(e.morning_liters || 0) + parseFloat(e.morning_ml || 0) / 1000;
      const eL = parseFloat(e.evening_liters || 0) + parseFloat(e.evening_ml || 0) / 1000;
      const r  = e.rate ? parseFloat(e.rate) : (c.rate || 0);
      morningMilk += mL; morningRev += mL * r;
      eveningMilk += eL; eveningRev += eL * r;
      totalMilk += mL + eL; totalRev += (mL + eL) * r;
      if (mL > 0) mActive++;
      if (eL > 0) eActive++;
    });
    return { totalMilk, totalRev, morningMilk, morningRev, eveningMilk, eveningRev, mActive, eActive };
  };

  const s = getStats();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── WELCOME ── */}
      <div className="welcome-banner">
        <h2>{t.dashWelcome || 'Welcome back, Distributor!'}</h2>
        <p>{t.dashSubtitle || "Here's today's complete summary."}</p>
      </div>

      {/* ── TODAY'S STATS ── */}
      <section>
        <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 14, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>
          📊 {t.todayOverview || "Today's Overview"}
        </h3>
        <div className="dashboard-grid">
          <Stat label={t.totalMilk || "Total Milk"}    value={`${s.totalMilk.toFixed(2)} L`}  accent="#2E8B57" icon="🥛" />
          <Stat label={t.revenue || "Revenue"}       value={`₹${s.totalRev.toFixed(0)}`}    accent="#D97706" icon="💰" />
          <Stat label={t.customersTitle || "Customers"}     value={customers.length}               accent="#0369A1" icon="👥" />
        </div>
      </section>

      {/* ── SHIFT BREAKDOWN ── */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Morning */}
        <div style={{
          background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
          border: '1.5px solid rgba(217,119,6,0.2)',
          borderRadius: 16, padding: '18px 20px',
          boxShadow: '0 2px 10px rgba(217,119,6,0.08)',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#92400E', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            ☀️ {t.morningShift || 'Morning Shift'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              { l: t.milk || 'Milk', v: `${s.morningMilk.toFixed(2)}L` },
              { l: t.active || 'Active', v: s.mActive },
              { l: t.revenue || 'Revenue', v: `₹${s.morningRev.toFixed(0)}` },
            ].map(({ l, v }) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#B45309', marginBottom: 3 }}>{l}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#78350F', fontFamily: "'Poppins', sans-serif" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Evening */}
        <div style={{
          background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)',
          border: '1.5px solid rgba(79,70,229,0.2)',
          borderRadius: 16, padding: '18px 20px',
          boxShadow: '0 2px 10px rgba(79,70,229,0.08)',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#3730A3', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            🌙 {t.eveningShift || 'Evening Shift'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              { l: t.milk || 'Milk', v: `${s.eveningMilk.toFixed(2)}L` },
              { l: t.active || 'Active', v: s.eActive },
              { l: t.revenue || 'Revenue', v: `₹${s.eveningRev.toFixed(0)}` },
            ].map(({ l, v }) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#4338CA', marginBottom: 3 }}>{l}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#312E81', fontFamily: "'Poppins', sans-serif" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUICK NAVIGATION CARDS ── */}
      <section>
        <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 14, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>
          🚀 {t.quickNav || 'Quick Navigation'}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {NAV_CARDS.map(card => (
            <button
              key={card.id}
              onClick={() => setActiveTab(card.id)}
              style={{
                background: isDark ? card.darkBg : card.bg,
                border: `1.5px solid ${card.border}`,
                borderRadius: 14,
                padding: '18px 20px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                minHeight: 'auto',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 0,
                display: 'flex',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}
            >
              <div style={{ fontSize: 26, marginBottom: 10 }}>{card.icon}</div>
              <div style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700, fontSize: 15,
                color: card.color, marginBottom: 4,
              }}>
                {card.title}
              </div>
              <div style={{
                fontSize: 12, fontWeight: 500,
                color: card.color, opacity: 0.7,
                lineHeight: 1.4,
              }}>
                {card.subtitle}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── DATA MANAGEMENT ── */}
      <section>
        <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 14, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>
          ⚙️ {t.dataMgmt || 'Data Management'}
        </h3>
        <div style={{
          background: 'var(--surface)', border: '1.5px solid var(--border)',
          borderRadius: 14, padding: '18px 22px',
          display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
        }}>
          <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0, flex: 1, minWidth: 200 }}>
            {t.dataBackupMsg || 'Your data is automatically backed up to Firebase cloud.'}
          </p>
          <button onClick={exportData} style={{
            background: 'var(--green-light)', color: 'var(--green)',
            border: '1.5px solid rgba(46,139,87,0.25)',
            padding: '10px 20px', borderRadius: 8,
            fontSize: 13, fontWeight: 700, cursor: 'pointer', minHeight: 40,
          }}>
            📥 {t.downloadBackup || 'Download Backup'}
          </button>
          <input type="file" accept=".json" ref={fileInputRef} style={{ display: 'none' }} onChange={importData} />
          <button onClick={() => fileInputRef.current.click()} style={{
            background: 'var(--gold-light)', color: 'var(--gold)',
            border: '1.5px solid var(--gold-border)',
            padding: '10px 20px', borderRadius: 8,
            fontSize: 13, fontWeight: 700, cursor: 'pointer', minHeight: 40,
          }}>
            📤 {t.restoreBackup || 'Restore Backup'}
          </button>
        </div>
      </section>

    </div>
  );
};

export default Dashboard;