import React, { useRef } from 'react';

// --- STYLES (Matches DailyEntry Theme) ---
const styles = {
  container: {
    display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px'
  },
  welcomeBanner: {
    background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
    borderRadius: '16px',
    padding: '25px',
    color: 'white',
    boxShadow: '0 10px 20px rgba(79, 70, 229, 0.3)',
    marginBottom: '10px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-main)',
    borderBottom: '2px solid var(--border-color)',
    paddingBottom: '10px',
    marginBottom: '15px',
    marginTop: '0'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '15px'
  },
  card: {
    background: 'var(--card-bg)',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: 'var(--card-shadow)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    transition: 'transform 0.2s'
  },
  value: {
    fontSize: '24px',
    fontWeight: '800',
    marginTop: '5px',
    marginBottom: '0',
    color: 'var(--text-main)'
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  btn: {
    padding: '12px 20px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    color: 'white',
    fontSize: '14px',
    display: 'flex', alignItems: 'center', gap: '8px'
  }
};

const Dashboard = ({ customers, logs, t, exportData, importData }) => {
  const fileInputRef = useRef(null);

  const getDashboardStats = () => {
    // 1. Get Local Date string (YYYY-MM-DD) to match DailyEntry format
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const today = new Date(now.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];

    let todayMilk = 0, todayCost = 0;
    let morningMilk = 0, morningCost = 0, morningActive = 0;
    let eveningMilk = 0, eveningCost = 0, eveningActive = 0;
    
    customers.forEach(c => {
        const key = `${today}-${c.id}`;
        const entry = logs[key];

        if (entry) {
            // 2. LOGIC FIX: Parse Liters and ML separately
            const mLit = parseFloat(entry.morning_liters || 0);
            const mMl = parseFloat(entry.morning_ml || 0);
            const eLit = parseFloat(entry.evening_liters || 0);
            const eMl = parseFloat(entry.evening_ml || 0);

            // Calculate Totals for this customer
            const mTotal = mLit + (mMl / 1000);
            const eTotal = eLit + (eMl / 1000);
            
            // Get Rate (Use entry rate if saved, else current customer rate)
            const rate = entry.rate ? parseFloat(entry.rate) : c.rate;

            const totalLiters = mTotal + eTotal;

            // Global Accumulators
            todayMilk += totalLiters;
            todayCost += (totalLiters * rate);

            if (mTotal > 0) { 
                morningMilk += mTotal; 
                morningCost += (mTotal * rate); 
                morningActive++; 
            }

            if (eTotal > 0) { 
                eveningMilk += eTotal; 
                eveningCost += (eTotal * rate); 
                eveningActive++; 
            }
        }
    });

    return {
        total: { milk: todayMilk.toFixed(2), count: customers.length, cost: todayCost.toFixed(0) }, // cost rounded
        morning: { milk: morningMilk.toFixed(2), count: morningActive, cost: morningCost.toFixed(0) },
        evening: { milk: eveningMilk.toFixed(2), count: eveningActive, cost: eveningCost.toFixed(0) }
    };
  };

  const stats = getDashboardStats();

  return (
    <div style={styles.container}>
        
        {/* Banner */}
        <div style={styles.welcomeBanner}>
            <h2 style={{margin:'0 0 5px 0', fontSize:'24px'}}>{t.dashWelcome}</h2>
            <p style={{margin:0, opacity:0.9, fontSize:'14px'}}>{t.dashSubtitle}</p>
        </div>

        {/* Daily Total Section */}
        <div>
           <h3 style={{...styles.sectionTitle, color: '#10B981', borderColor: '#10B981'}}>
               {t.lblDailyHeader}
           </h3>
           <div style={styles.grid}>
              <div style={styles.card}>
                  <span style={styles.label}>{t.cardMilk}</span>
                  <p style={{...styles.value, color: '#10B981'}}>{stats.total.milk} L</p>
              </div>
              <div style={styles.card}>
                  <span style={styles.label}>{t.cardCustomers}</span>
                  <p style={styles.value}>{stats.total.count}</p>
              </div>
              <div style={styles.card}>
                  <span style={styles.label}>{t.cardEarnings}</span>
                  <p style={{...styles.value, color: '#10B981'}}>₹{stats.total.cost}</p>
              </div>
           </div>
        </div>

        {/* Morning Section */}
        <div>
           <h3 style={{...styles.sectionTitle, color: '#F59E0B', borderColor: '#F59E0B'}}>
               {t.lblMorningHeader}
           </h3>
           <div style={styles.grid}>
              <div style={styles.card}>
                  <span style={styles.label}>{t.cardMorningMilk}</span>
                  <p style={styles.value}>{stats.morning.milk} L</p>
              </div>
              <div style={styles.card}>
                  <span style={styles.label}>Active</span>
                  <p style={styles.value}>{stats.morning.count}</p>
              </div>
              <div style={styles.card}>
                  <span style={styles.label}>Revenue</span>
                  <p style={{...styles.value, color: '#F59E0B'}}>₹{stats.morning.cost}</p>
              </div>
           </div>
        </div>

        {/* Evening Section */}
        <div>
           <h3 style={{...styles.sectionTitle, color: '#6366F1', borderColor: '#6366F1'}}>
               {t.lblEveningHeader}
           </h3>
           <div style={styles.grid}>
              <div style={styles.card}>
                  <span style={styles.label}>{t.cardEveningMilk}</span>
                  <p style={styles.value}>{stats.evening.milk} L</p>
              </div>
              <div style={styles.card}>
                  <span style={styles.label}>Active</span>
                  <p style={styles.value}>{stats.evening.count}</p>
              </div>
              <div style={styles.card}>
                  <span style={styles.label}>Revenue</span>
                  <p style={{...styles.value, color: '#6366F1'}}>₹{stats.evening.cost}</p>
              </div>
           </div>
        </div>

        {/* Data Management (Import/Export) */}
        <div>
           <h3 style={{...styles.sectionTitle, color: 'var(--text-secondary)'}}>
               {t.lblDataHeader}
           </h3>
           <div style={{
               background:'var(--card-bg)', padding:'20px', borderRadius:'12px', 
               boxShadow:'var(--card-shadow)', border:'1px solid var(--border-color)',
               display:'flex', gap:'15px', justifyContent:'center', flexWrap:'wrap'
           }}>
                <button onClick={exportData} style={{...styles.btn, background:'#6366F1'}}>
                     {t.btnExport} JSON
                </button>
                
                <input type="file" accept=".json" ref={fileInputRef} style={{display: 'none'}} onChange={importData} />
                <button onClick={() => fileInputRef.current.click()} style={{...styles.btn, background:'#10B981'}}>
                     {t.btnImport} JSON
                </button>
           </div>
        </div>

    </div>
  );
};

export default Dashboard;