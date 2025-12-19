import React, { useState } from 'react';
// IMPORT FIREBASE FUNCTIONS
import { addPaymentToDb, deletePaymentFromDb, deleteLogEntry, deleteCustomerFromDb } from '../services/db'; 

// --- STYLES (Theme Aware) ---
const styles = {
  card: {
    background: 'var(--card-bg)',
    color: 'var(--text-main)',
    borderRadius: '16px',
    boxShadow: 'var(--card-shadow)',
    padding: '25px',
    border: '1px solid var(--border-color)',
    maxWidth: '1000px',
    margin: '0 auto'
  },
  section: {
    background: 'var(--input-bg)',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px',
    borderLeft: '5px solid #10B981',
    border: '1px solid var(--border-color)'
  },
  input: {
    padding: '12px', borderRadius: '8px', 
    border: '1px solid var(--border-color)', 
    background: 'var(--card-bg)', color: 'var(--text-main)',
    outline: 'none', flex: 1
  },
  btn: {
    padding: '12px 20px', borderRadius: '8px', border: 'none', 
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
  modalOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', 
    backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', 
    alignItems: 'center', zIndex: 1000
  },
  modal: {
    background: 'var(--card-bg)', color: 'var(--text-main)',
    padding: '25px', borderRadius: '16px', width: '90%', maxWidth: '700px', 
    maxHeight: '85vh', overflowY: 'auto', border: '1px solid var(--border-color)',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
  },
  dropdown: {
    position: 'absolute', top: '100%', left: 0, right: 0,
    background: 'var(--card-bg)', border: '1px solid var(--border-color)',
    borderRadius: '8px', zIndex: 10, maxHeight: '200px', overflowY: 'auto',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
  }
};

const Payments = ({ customers, logs, payments, t, performMagic }) => {
  const [paymentSearch, setPaymentSearch] = useState("");
  const [balanceSearch, setBalanceSearch] = useState("");
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  const [newPayment, setNewPayment] = useState({ customerId: "", amount: "", date: new Date().toISOString().split('T')[0], method: "" });
  const [historyModalCustId, setHistoryModalCustId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Search Filters
  const paymentFiltered = customers.filter(c => c.id.toLowerCase().includes(paymentSearch.toLowerCase()) || c.name.toLowerCase().includes(paymentSearch.toLowerCase()));

  // --- 1. CORE FINANCIAL LOGIC (Fixed for Firebase Data) ---
  const getFinancialSummary = () => {
    return customers.map(cust => {
        let totalBill = 0;
        
        // Loop through all logs to find entries for this customer
        Object.keys(logs).forEach(key => {
            if (key.endsWith(`-${cust.id}`)) {
                const entry = logs[key];
                
                // Calculate Milk Volume Correctly
                const mTotal = (parseFloat(entry.morning_liters) || 0) + ((parseFloat(entry.morning_ml) || 0) / 1000);
                const eTotal = (parseFloat(entry.evening_liters) || 0) + ((parseFloat(entry.evening_ml) || 0) / 1000);
                
                const milk = mTotal + eTotal;
                const rate = entry.rate !== undefined ? parseFloat(entry.rate) : cust.rate;
                
                totalBill += (milk * rate);
            }
        });

        const totalPaid = payments
            .filter(p => p.customerId === cust.id)
            .reduce((sum, p) => sum + parseFloat(p.amount), 0);

        return {
            id: cust.id, 
            name: cust.name, 
            totalBill: totalBill, 
            totalPaid: totalPaid, 
            balance: totalBill - totalPaid
        };
    });
  };

  const balanceFiltered = getFinancialSummary().filter(row => 
    row.name.toLowerCase().includes(balanceSearch.toLowerCase()) || 
    row.id.toString().includes(balanceSearch)
  );

  const handlePaymentCustomerSelect = (customer) => {
    setNewPayment({ ...newPayment, customerId: customer.id });
    setPaymentSearch(`${customer.name} (${customer.id})`);
    setShowPaymentDropdown(false);
  };

  // --- 2. FIREBASE ACTIONS ---
  const addPayment = async () => {
    if (!newPayment.customerId || !newPayment.amount) return alert(t.alertPayDetails);
    
    const paymentEntry = {
        customerId: newPayment.customerId,
        amount: parseFloat(newPayment.amount),
        date: newPayment.date,
        method: newPayment.method
    };

    try {
        await addPaymentToDb(paymentEntry); // SAVE TO FIREBASE
        setNewPayment({ ...newPayment, amount: "", method: "" });
        alert("Payment Added Successfully!");
    } catch (error) {
        console.error(error);
        alert("Error saving payment.");
    }
  };

  const deletePayment = async (paymentId) => {
    if(window.confirm(t.confirmPayDelete)) {
        try {
            await deletePaymentFromDb(paymentId); // DELETE FROM FIREBASE
        } catch (error) {
            console.error(error);
            alert("Error deleting payment.");
        }
    }
  };

  const deleteLog = async (date, customerId) => {
    if(!window.confirm(t.confirmLogDelete)) return;
    try {
        await deleteLogEntry(date, customerId); // DELETE FROM FIREBASE
    } catch (error) {
        console.error(error);
        alert("Error deleting log entry.");
    }
  };

  const deleteCustomer = async (id) => {
      if(window.confirm("Are you sure you want to delete this customer?")) {
          await deleteCustomerFromDb(id);
      }
  }

  // --- HISTORY LOGIC ---
  const getExtendedHistory = () => {
    if(!historyModalCustId) return [];
    const custId = historyModalCustId;
    let events = [];

    // Add Milk Events
    Object.keys(logs).forEach(key => {
        if(key.endsWith(`-${custId}`)) {
            const [date] = key.split(`-${custId}`);
            const entry = logs[key];
            
            const mTotal = (parseFloat(entry.morning_liters) || 0) + ((parseFloat(entry.morning_ml) || 0) / 1000);
            const eTotal = (parseFloat(entry.evening_liters) || 0) + ((parseFloat(entry.evening_ml) || 0) / 1000);
            const milk = mTotal + eTotal;
            
            const rate = entry.rate !== undefined ? parseFloat(entry.rate) : (customers.find(c=>c.id===custId)?.rate || 0);
            const cost = milk * rate;
            
            if(cost > 0) events.push({ type: 'MILK', date: date, amount: cost });
        }
    });

    // Add Payment Events
    payments.filter(p => p.customerId === custId).forEach(p => {
        events.push({ type: 'PAYMENT', date: p.date, amount: parseFloat(p.amount), method: p.method, id: p.id });
    });

    // Sort by Date
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate Running Balance
    let runningBalance = 0;
    let paymentHistory = [];

    events.forEach(e => {
        if(e.type === 'MILK') {
            runningBalance += e.amount;
            paymentHistory.push({ ...e, balanceAfter: runningBalance, isMilk: true });
        } else {
            runningBalance -= e.amount;
            paymentHistory.push({ ...e, balanceAfter: runningBalance, isMilk: false });
        }
    });

    return paymentHistory.reverse(); // Show newest first
  };

  const historyData = getExtendedHistory();

  // Search Magic Handlers
  const handlePaymentSearchMagic = async () => {
    setLoading(true);
    const result = await performMagic(paymentSearch);
    setPaymentSearch(result);
    setShowPaymentDropdown(true);
    setLoading(false);
  }

  const handleBalanceSearchMagic = async () => {
    setLoading(true);
    const result = await performMagic(balanceSearch);
    setBalanceSearch(result);
    setLoading(false);
  }

  return (
    <div style={styles.card}>
        <h3 style={{marginTop:0}}>{t.paymentHeader}</h3>
        
        {/* ADD PAYMENT SECTION */}
        <div style={styles.section}>
            <h4 style={{marginTop:0, color: '#10B981'}}>{t.paySectionAdd}</h4>
            
            {/* Customer Search */}
            <div style={{position: 'relative', marginBottom: '15px'}}>
               <div style={{display: 'flex', gap: '10px'}}>
                   <input 
                      style={styles.input} 
                      placeholder={t.searchReportPlaceholder} 
                      value={paymentSearch} 
                      onChange={(e) => { setPaymentSearch(e.target.value); setShowPaymentDropdown(true); setNewPayment({...newPayment, customerId: ""}); }} 
                      onFocus={() => setShowPaymentDropdown(true)} 
                   />
                   <button onClick={handlePaymentSearchMagic} style={{...styles.btn, background: '#8B5CF6'}}>
                       {loading ? '...' : 'A⟷अ'}
                   </button>
               </div>
               
               {showPaymentDropdown && paymentSearch && (
                  <div style={styles.dropdown}>
                      {paymentFiltered.map(c => ( 
                          <div key={c.id} style={{padding: '12px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer'}} onClick={() => handlePaymentCustomerSelect(c)}> 
                             <strong>{c.name}</strong> <span style={{fontSize:'12px', color:'var(--text-secondary)'}}>#{c.id}</span> 
                          </div> 
                      ))}
                  </div>
               )}
            </div>

            {/* Payment Details */}
            <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
                <input type="number" placeholder={t.payAmt} value={newPayment.amount} onChange={e => setNewPayment({...newPayment, amount: e.target.value})} style={styles.input} />
                <input type="date" value={newPayment.date} onChange={e => setNewPayment({...newPayment, date: e.target.value})} style={{...styles.input, flex: 'none', width:'150px'}} />
                <input type="text" placeholder={t.payMethod} value={newPayment.method} onChange={e => setNewPayment({...newPayment, method: e.target.value})} style={styles.input} />
                <button onClick={addPayment} style={{...styles.btn, background: '#10B981'}}>{t.btnAddPayment}</button>
            </div>
        </div>

        {/* OVERVIEW SECTION */}
        <h4 style={{marginBottom: '10px'}}>{t.paySectionOverview}</h4>
        
        <div style={{display:'flex', gap:'10px', marginBottom: '15px'}}>
            <input style={styles.input} type="text" placeholder={t.searchBalancePlaceholder} value={balanceSearch} onChange={(e) => setBalanceSearch(e.target.value)} />
            <button onClick={handleBalanceSearchMagic} style={{...styles.btn, background: '#8B5CF6'}}> {loading ? '...' : 'A⟷अ'} </button>
        </div>

        <div style={{overflowX: 'auto'}}>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>{t.thName}</th>
                        <th style={styles.th}>{t.thTotalBill}</th>
                        <th style={styles.th}>{t.thTotalPaid}</th>
                        <th style={styles.th}>{t.thBalance}</th>
                        <th style={styles.th}>{t.thHistory}</th>
                    </tr>
                </thead>
                <tbody>
                    {balanceFiltered.map(row => (
                        <tr key={row.id}>
                            <td style={styles.td}><strong>#{row.id}</strong></td>
                            <td style={styles.td}>{row.name}</td>
                            <td style={styles.td}>₹{row.totalBill.toFixed(2)}</td>
                            <td style={{...styles.td, color: '#10B981'}}>₹{row.totalPaid.toFixed(2)}</td>
                            <td style={styles.td}>
                                <span style={{
                                    fontWeight: 'bold', 
                                    color: row.balance > 10 ? '#EF4444' : '#10B981', 
                                    background: row.balance > 10 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                                    padding: '4px 8px', borderRadius: '6px'
                                }}>
                                    ₹{row.balance.toFixed(2)}
                                </span>
                            </td>
                            <td style={styles.td}>
                                <div style={{display:'flex', gap:'20px'}}>
                                    <button onClick={() => setHistoryModalCustId(row.id)} style={{...styles.btn, padding:'6px 12px', background:'#3B82F6', fontSize:'15px'}} title="View Details">
                                         {t.btnHistory}
                                    </button>
                                    <button onClick={() => deleteCustomer(row.id)} style={{...styles.btn, padding:'6px 7px', background:'#EF4444', fontSize:'10px'}} title="Delete Customer">
                                        🗑️
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* HISTORY MODAL */}
        {historyModalCustId && (
            <div style={styles.modalOverlay}>
                <div style={styles.modal}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                        <h3 style={{margin:0}}>
                            {t.histHeader} <span style={{color: '#3B82F6'}}>{customers.find(c => c.id === historyModalCustId)?.name}</span>
                        </h3>
                        <button onClick={() => setHistoryModalCustId(null)} style={{background:'transparent', border:'none', fontSize:'24px', cursor:'pointer', color:'var(--text-secondary)'}}>×</button>
                    </div>
                    
                    {historyData.length === 0 ? <p style={{textAlign:'center', color:'var(--text-secondary)'}}>{t.histNoData}</p> : (
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>{t.histDate}</th>
                                    <th style={styles.th}>{t.histAmt}</th>
                                    <th style={styles.th}>{t.histAfter}</th>
                                    <th style={styles.th}>{t.histMethod}</th>
                                    <th style={styles.th}>{t.histAction}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyData.map((p, index) => (
                                    <tr key={index}>
                                        <td style={styles.td}>{p.date}</td>
                                        
                                        {/* Amount Column */}
                                        <td style={styles.td}>
                                            {p.isMilk ? (
                                                <span style={{color: '#EF4444'}}>+ ₹{p.amount.toFixed(2)} (Milk)</span>
                                            ) : (
                                                <span style={{color: '#10B981'}}>- ₹{p.amount.toFixed(2)} (Paid)</span>
                                            )}
                                        </td>
                                        
                                        {/* Balance After */}
                                        <td style={{...styles.td, fontWeight: 'bold'}}>₹{p.balanceAfter.toFixed(2)}</td>
                                        
                                        {/* Method */}
                                        <td style={{...styles.td, fontSize: '0.9em', color: 'var(--text-secondary)'}}>{p.method || '-'}</td>
                                        
                                        {/* Action - MODIFIED EMOJI */}
                                        <td style={styles.td}>
                                            {p.isMilk ? (
                                                <button onClick={() => deleteLog(p.date, historyModalCustId)} title="Delete Milk Entry" style={{background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px'}}>🗑️</button>
                                            ) : (
                                                <button onClick={() => deletePayment(p.id)} title="Delete Payment" style={{background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px'}}>🗑️</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};

export default Payments;