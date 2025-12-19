import React, { useState } from 'react';

// --- STYLES (Dark Mode Ready) ---
const styles = {
  card: {
    background: 'var(--card-bg)',
    color: 'var(--text-main)',
    borderRadius: '16px',
    boxShadow: 'var(--card-shadow)',
    padding: '25px',
    border: '1px solid var(--border-color)',
    maxWidth: '900px',
    margin: '0 auto'
  },
  header: {
    marginBottom: '20px',
    textAlign: 'center',
    color: 'var(--text-main)'
  },
  section: {
    background: 'var(--input-bg)',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '15px',
    borderLeftWidth: '5px',
    borderLeftStyle: 'solid',
    borderTop: '1px solid var(--border-color)',
    borderRight: '1px solid var(--border-color)',
    borderBottom: '1px solid var(--border-color)',
  },
  label: {
    display: 'block', marginBottom: '10px', fontWeight: 'bold', color: 'var(--text-secondary)'
  },
  input: {
    padding: '10px', borderRadius: '8px', 
    border: '1px solid var(--border-color)', 
    background: 'var(--card-bg)', color: 'var(--text-main)',
    outline: 'none'
  },
  btn: {
    padding: '10px 20px', borderRadius: '8px', border: 'none', 
    fontWeight: 'bold', cursor: 'pointer', color: 'white'
  },
  table: {
    width: '100%', borderCollapse: 'collapse', marginTop: '10px'
  },
  th: {
    background: '#1F2937', color: 'white', padding: '12px', textAlign: 'left'
  },
  td: {
    padding: '12px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-main)'
  },
  totalRow: {
    background: 'var(--input-bg)', fontWeight: 'bold', borderTop: '2px solid var(--border-color)'
  }
};

const MasterReport = ({ customers, logs, t }) => {
  const [masterMonth, setMasterMonth] = useState(""); 
  const [masterRange, setMasterRange] = useState({ start: "", end: "" }); 
  const [masterData, setMasterData] = useState([]);

  // --- CORE CALCULATION LOGIC (FIXED FOR FIREBASE) ---
  const calculateMasterData = (startDate, endDate) => {
      return customers.map(cust => {
        let custTotalMilk = 0, custTotalCost = 0;
        let iterDate = new Date(startDate); // Clone start date

        while (iterDate <= endDate) {
            const dateStr = iterDate.toISOString().split('T')[0];
            const key = `${dateStr}-${cust.id}`;
            const entry = logs[key];

            if (entry) {
                // 1. FIXED: Handle Liters + ML logic
                const mLit = parseFloat(entry.morning_liters || 0);
                const mMl = parseFloat(entry.morning_ml || 0);
                const eLit = parseFloat(entry.evening_liters || 0);
                const eMl = parseFloat(entry.evening_ml || 0);

                const mTotal = mLit + (mMl / 1000);
                const eTotal = eLit + (eMl / 1000);

                const milk = mTotal + eTotal;
                
                // 2. FIXED: Use stored rate or customer default
                const rate = entry.rate !== undefined ? parseFloat(entry.rate) : cust.rate;

                custTotalMilk += milk;
                custTotalCost += (milk * rate);
            }
            iterDate.setDate(iterDate.getDate() + 1);
        }

        return { 
            id: cust.id, 
            name: cust.name, 
            totalMilk: custTotalMilk, 
            totalCost: custTotalCost, 
            avgRate: custTotalMilk > 0 ? (custTotalCost / custTotalMilk).toFixed(2) : cust.rate 
        };
      });
  };

  const generateMasterMonthly = () => {
      if (!masterMonth) return alert(t.alertSelectMonth);
      const [year, month] = masterMonth.split('-');
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); 
      const data = calculateMasterData(startDate, endDate);
      setMasterData(data);
  };

  const generateMasterRange = () => {
    if (!masterRange.start || !masterRange.end) return alert(t.alertSelectDates);
    const startDate = new Date(masterRange.start);
    const endDate = new Date(masterRange.end);
    const data = calculateMasterData(startDate, endDate);
    setMasterData(data);
  };

  return (
    <div style={styles.card}>
        <h3 style={styles.header}>{t.masterHeader}</h3>
        
        {/* Month Selection */}
        <div style={{...styles.section, borderColor: '#8B5CF6'}}>
            <label style={styles.label}>📅 {t.quickMonth}</label>
            <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                <input type="month" value={masterMonth} onChange={(e) => setMasterMonth(e.target.value)} style={styles.input} />
                <button onClick={generateMasterMonthly} style={{...styles.btn, background: '#8B5CF6'}}>{t.btnLoadMonth}</button>
            </div>
        </div>
        
        {/* Custom Range Selection */}
        <div style={{...styles.section, borderColor: '#10B981'}}>
            <label style={styles.label}>📆 {t.customRange}</label>
            <div style={{display:'flex', gap:'10px', flexWrap:'wrap', alignItems: 'center'}}>
               <div style={{display:'flex', gap:'5px', alignItems:'center'}}>
                   <span style={{color: 'var(--text-secondary)'}}>{t.from}:</span>
                   <input type="date" value={masterRange.start} onChange={(e) => setMasterRange({...masterRange, start: e.target.value})} style={styles.input} />
               </div>
               <div style={{display:'flex', gap:'5px', alignItems:'center'}}>
                   <span style={{color: 'var(--text-secondary)'}}>{t.to}:</span>
                   <input type="date" value={masterRange.end} onChange={(e) => setMasterRange({...masterRange, end: e.target.value})} style={styles.input} />
               </div>
               <button onClick={generateMasterRange} style={{...styles.btn, background: '#10B981'}}>{t.btnLoadRange}</button>
            </div>
        </div>

        {/* Results Table */}
        {masterData.length > 0 && (
            <div style={{overflowX: 'auto', marginTop: '20px'}}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>{t.thName}</th>
                            <th style={styles.th}>{t.thMilk} (L)</th>
                            <th style={styles.th}>{t.thAvgRate}</th>
                            <th style={styles.th}>{t.thBill}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {masterData.map(data => (
                            <tr key={data.id}>
                                <td style={styles.td}><strong>#{data.id}</strong></td>
                                <td style={styles.td}>{data.name}</td>
                                <td style={styles.td}>{data.totalMilk.toFixed(2)}</td>
                                <td style={styles.td}>{data.avgRate}</td>
                                <td style={{...styles.td, color: '#10B981', fontWeight:'bold', fontSize: '1.1em'}}>₹{data.totalCost.toFixed(2)}</td>
                            </tr>
                        ))}
                        
                        {/* Grand Total Row */}
                        <tr style={styles.totalRow}>
                            <td colSpan="2" style={{...styles.td, textAlign:'right'}}>TOTAL:</td>
                            <td style={styles.td}>{masterData.reduce((acc, curr) => acc + curr.totalMilk, 0).toFixed(2)}</td>
                            <td style={styles.td}>-</td>
                            <td style={{...styles.td, color: '#10B981', fontSize: '1.2em'}}>₹{masterData.reduce((acc, curr) => acc + curr.totalCost, 0).toFixed(0)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )}

        {!masterData.length && (
            <p style={{textAlign:'center', color:'var(--text-secondary)', marginTop:'20px', fontStyle: 'italic'}}>
                Select an option above and click Load.
            </p>
        )}
    </div>
  );
};

export default MasterReport;