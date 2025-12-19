import React, { useState } from 'react';
// --- 1. FIXED IMPORTS FOR PDF GENERATION ---
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDate } from '../utils/helpers';

// --- STYLES (Dark Mode Ready) ---
const styles = {
  container: {
    maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px'
  },
  card: {
    background: 'var(--card-bg)',
    color: 'var(--text-main)',
    borderRadius: '16px',
    boxShadow: 'var(--card-shadow)',
    padding: '25px',
    border: '1px solid var(--border-color)',
  },
  header: {
    textAlign: 'center', marginBottom: '20px', color: 'var(--text-main)'
  },
  inputGroup: {
    background: 'var(--input-bg)',
    padding: '15px',
    borderRadius: '12px',
    marginBottom: '15px',
    border: '1px solid var(--border-color)',
    display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap'
  },
  label: {
    fontWeight: 'bold', color: 'var(--text-secondary)', fontSize: '14px'
  },
  input: {
    padding: '10px', borderRadius: '8px', 
    border: '1px solid var(--border-color)', 
    background: 'var(--card-bg)', color: 'var(--text-main)',
    outline: 'none'
  },
  btn: {
    padding: '12px', borderRadius: '8px', border: 'none', 
    fontWeight: 'bold', cursor: 'pointer', color: 'white', flex: 1
  },
  summaryCard: {
    background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
    color: 'white', borderRadius: '12px', padding: '20px',
    textAlign: 'center', marginBottom: '20px',
    boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)'
  },
  table: {
    width: '100%', borderCollapse: 'collapse', marginTop: '10px'
  },
  th: {
    background: 'var(--input-bg)', color: 'var(--text-secondary)', 
    padding: '12px', textAlign: 'left', fontSize: '13px', textTransform: 'uppercase'
  },
  td: {
    padding: '12px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-main)'
  },
  dropdown: {
    position: 'absolute', top: '100%', left: 0, right: 0,
    background: 'var(--card-bg)', border: '1px solid var(--border-color)',
    borderRadius: '8px', zIndex: 10, maxHeight: '200px', overflowY: 'auto',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
  }
};

const IndividualReport = ({ customers, logs, t, performMagic }) => {
  const [reportRange, setReportRange] = useState({ start: "", end: "", customerId: "" });
  const [reportResult, setReportResult] = useState(null);
  const [reportSearchQuery, setReportSearchQuery] = useState("");
  const [showReportDropdown, setShowReportDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const reportFiltered = customers.filter(c => c.id.toLowerCase().includes(reportSearchQuery.toLowerCase()) || c.name.toLowerCase().includes(reportSearchQuery.toLowerCase()));

  const handleReportSearchMagic = async () => {
    setLoading(true);
    const result = await performMagic(reportSearchQuery);
    setReportSearchQuery(result);
    setShowReportDropdown(true);
    setLoading(false);
  };

  const handleMonthSelect = (e) => {
    const val = e.target.value; 
    if (!val) return;
    const [year, month] = val.split('-');
    const startDate = `${val}-01`;
    const lastDayInt = new Date(year, month, 0).getDate();
    const endDate = `${val}-${lastDayInt}`;
    setReportRange(prev => ({ ...prev, start: startDate, end: endDate }));
  };

  const handleReportCustomerSelect = (customer) => {
    setReportRange(prev => ({ ...prev, customerId: customer.id }));
    setReportSearchQuery(`${customer.name} (${customer.id})`);
    setShowReportDropdown(false);
  };

  const generateReport = () => {
    if (!reportRange.start || !reportRange.end || !reportRange.customerId) return alert(t.alertSelect);
    
    let totalLitres = 0, totalCost = 0, reportDetails = [];
    let currentDate = new Date(reportRange.start);
    const endDate = new Date(reportRange.end);
    const custId = reportRange.customerId;
    const customer = customers.find(c => c.id == custId); 
    
    if (!customer) return alert(t.alertNotFound);

    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      const key = `${dateString}-${custId}`;
      const entry = logs[key];

      if (entry) {
        // --- FIXED LOGIC FOR FIREBASE ---
        const mLit = parseFloat(entry.morning_liters || 0);
        const mMl = parseFloat(entry.morning_ml || 0);
        const eLit = parseFloat(entry.evening_liters || 0);
        const eMl = parseFloat(entry.evening_ml || 0);

        const mornTotal = mLit + (mMl / 1000);
        const eveTotal = eLit + (eMl / 1000);
        
        const dayLitres = mornTotal + eveTotal;
        const dayRate = entry.rate !== undefined ? parseFloat(entry.rate) : customer.rate;
        const dailyCost = dayLitres * dayRate;

        totalLitres += dayLitres;
        totalCost += dailyCost;

        if (dayLitres > 0) {
            reportDetails.push({ 
                date: dateString, 
                morn: mornTotal, 
                eve: eveTotal, 
                rate: dayRate, 
                total: dayLitres, 
                cost: dailyCost 
            });
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setReportResult({ 
        customer: customer, 
        litres: totalLitres, 
        cost: totalCost, 
        days: Math.ceil((endDate - new Date(reportRange.start)) / (1000 * 60 * 60 * 24)) + 1, 
        details: reportDetails 
    });
  };

  // --- 2. FIXED PDF DOWNLOAD FUNCTION ---
  const handleDownloadPDF = () => {
    if (!reportResult) return;
    
    // Create new PDF instance
    const doc = new jsPDF();
    const custName = reportResult.customer.name;
    
    // Add Header Text
    doc.setFontSize(18); 
    doc.text(`Milk Bill: ${custName}`, 14, 22);
    
    doc.setFontSize(12); 
    doc.text(`From: ${reportRange.start}   To: ${reportRange.end}`, 14, 32);
    doc.text(`Total Liters: ${reportResult.litres.toFixed(2)} L`, 14, 40);
    doc.text(`Total Amount: Rs ${reportResult.cost.toFixed(2)}`, 14, 48);
    
    // Define Table Data
    const tableColumn = ["Date", "Morning", "Evening", "Rate", "Total (Rs)"];
    const tableRows = reportResult.details.map(row => {
        return [ row.date, row.morn.toFixed(2), row.eve.toFixed(2), row.rate, row.cost.toFixed(2) ];
    });
    
    // Use autoTable correctly
    autoTable(doc, {
        startY: 55,
        head: [tableColumn],
        body: tableRows,
    });
    
    // Save the PDF
    doc.save(`Bill_${custName}_${reportRange.start}.pdf`);
  };

  const handleWhatsAppShare = () => {
    if (!reportResult) return;
    const cust = reportResult.customer;
    if (!cust.mobile) return alert("Please add a Mobile Number for this customer.");
    
    const totalAmt = reportResult.cost.toFixed(0);
    const totalL = reportResult.litres.toFixed(1);
    const message = `Hello ${cust.name}, your milk bill from ${reportRange.start} to ${reportRange.end} is ₹${totalAmt}. Total Milk: ${totalL} Liters.`;
    
    let phone = cust.mobile.replace(/[^0-9]/g, '');
    if (phone.length === 10) phone = '91' + phone;
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div style={styles.container}>
      
      {/* Search & Date Selection Card */}
      <div style={styles.card}>
        <h3 style={styles.header}>{t.reportHeader}</h3>
        
        {/* Quick Month Select */}
        <div style={styles.inputGroup}>
            <label style={styles.label}>{t.quickMonth}:</label>
            <input type="month" onChange={handleMonthSelect} style={styles.input} />
        </div>

        {/* Customer Search */}
        <div style={{position: 'relative', marginBottom: '15px'}}>
           <div style={{display: 'flex', gap: '10px'}}>
               <input 
                  style={{...styles.input, flex: 1}} 
                  placeholder={t.searchReportPlaceholder} 
                  value={reportSearchQuery} 
                  onChange={(e) => { setReportSearchQuery(e.target.value); setShowReportDropdown(true); setReportRange(prev => ({...prev, customerId: ""})); }} 
                  onFocus={() => setShowReportDropdown(true)} 
               />
               <button onClick={handleReportSearchMagic} style={{...styles.btn, flex: '0 0 auto', background: '#8B5CF6'}}>
                   {loading ? '...' : 'A⟷अ'}
               </button>
           </div>
           
           {/* Dropdown */}
           {showReportDropdown && reportSearchQuery && (
              <div style={styles.dropdown}>
                  {reportFiltered.map(c => ( 
                      <div 
                        key={c.id} 
                        style={{padding: '12px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', color: 'var(--text-main)'}}
                        onClick={() => handleReportCustomerSelect(c)}
                      > 
                        <strong>{c.name}</strong> <span style={{fontSize:'12px', color:'var(--text-secondary)'}}>#{c.id}</span> 
                      </div> 
                  ))}
              </div>
           )}
        </div>

        {/* Date Range Inputs */}
        <div style={{display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'15px'}}>
            <div style={{flex: 1, display:'flex', flexDirection:'column'}}>
                <label style={{...styles.label, marginBottom:'5px'}}>{t.from}</label>
                <input type="date" value={reportRange.start} onChange={(e) => setReportRange({...reportRange, start: e.target.value})} style={styles.input}/>
            </div>
            <div style={{flex: 1, display:'flex', flexDirection:'column'}}>
                <label style={{...styles.label, marginBottom:'5px'}}>{t.to}</label>
                <input type="date" value={reportRange.end} onChange={(e) => setReportRange({...reportRange, end: e.target.value})} style={styles.input}/>
            </div>
        </div>

        <button onClick={generateReport} style={{...styles.btn, background: '#10B981', width:'100%'}}>
            {t.calculateBtn}
        </button>
      </div>

      {/* Result Section */}
      {reportResult && (
        <div style={styles.card}>
            
            {/* Blue Summary Card */}
            <div style={styles.summaryCard}>
                <h2 style={{margin: '0 0 10px 0', fontSize:'22px'}}>{t.billSummary}</h2>
                <div style={{fontSize:'36px', fontWeight:'bold'}}>₹{reportResult.cost.toFixed(2)}</div>
                <div style={{opacity: 0.9, marginTop: '5px'}}>
                    {t.totalMilk}: <strong>{reportResult.litres.toFixed(2)} L</strong>  •  {reportResult.days} Days
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
                <button onClick={handleDownloadPDF} style={{...styles.btn, background: '#EF4444'}}>
                     {t.btnPdf}
                </button>
                <button onClick={handleWhatsAppShare} style={{...styles.btn, background: '#10B981'}}>
                    {t.btnWhatsapp}
                </button>
            </div>

            {/* Detailed Table */}
            <h4 style={{borderBottom: '2px solid var(--border-color)', paddingBottom: '10px', color: 'var(--text-main)'}}>
                {t.detailHeader}
            </h4>
            <div style={{overflowX: 'auto'}}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>{t.colDate}</th>
                            <th style={styles.th}>{t.tableMorning}</th>
                            <th style={styles.th}>{t.tableEvening}</th>
                            <th style={styles.th}>{t.tableRate}</th>
                            <th style={styles.th}>{t.colAmount}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportResult.details.map((row, index) => (
                            <tr key={index}>
                                <td style={styles.td}>{formatDate(row.date)}</td>
                                <td style={styles.td}>{row.morn > 0 ? row.morn.toFixed(2) : '-'}</td>
                                <td style={styles.td}>{row.eve > 0 ? row.eve.toFixed(2) : '-'}</td>
                                <td style={styles.td}>{row.rate}</td>
                                <td style={{...styles.td, fontWeight:'bold', color: '#10B981'}}>₹{row.cost.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};

export default IndividualReport;