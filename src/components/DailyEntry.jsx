import React, { useState, useEffect } from 'react';
import { updateLogEntry, updateCustomer } from '../services/db';

// --- STYLES USING CSS VARIABLES (Adapts to Dark Mode) ---
const styles = {
  card: {
    background: 'var(--card-bg)',
    color: 'var(--text-main)',
    borderRadius: '16px',
    boxShadow: 'var(--card-shadow)',
    padding: '16px 20px',
    marginBottom: '15px',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    transition: 'background 0.3s, border 0.3s, color 0.3s'
  },
  headerCard: {
    background: 'var(--header-bg)',
    borderRadius: '16px',
    padding: '20px', 
    marginBottom: '25px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)'
  },
  inputGroup: {
    display: 'flex',
    alignItems: 'center',
    background: 'var(--input-bg)',
    borderRadius: '8px',
    padding: '4px 8px',
    border: '1px solid var(--input-border)',
  },
  input: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-main)',
    width: '100%'
  },
  label: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    marginLeft: '4px'
  },
  labelTop: {
    fontSize: '12px', 
    fontWeight:'600', 
    color: 'var(--text-secondary)', 
    marginBottom:'4px'
  },
  iconBtn: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  },
  idBadge: {
    background: 'var(--badge-bg)',
    color: 'var(--badge-text)',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '14px',
    marginRight: '12px',
    flexShrink: 0
  }
};

/* =========================================
   1. EDIT MODAL
   ========================================= */
const EditCustomerModal = ({ customer, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: customer.name || '',
    address: customer.address || '',
    rate: customer.rate || 60,
    mobile: customer.mobile || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', 
      backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', 
      zIndex: 1000, padding: '20px'
    }}>
      <div style={{
        background: 'var(--card-bg)', 
        color: 'var(--text-main)',
        padding: '30px', borderRadius: '20px', 
        width: '100%', maxWidth: '420px', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '25px'}}>
          <h2 style={{margin: 0, fontSize: '20px'}}>Edit Details</h2>
          <button onClick={onClose} style={{border:'none', background:'transparent', fontSize:'24px', cursor:'pointer', color:'var(--text-secondary)'}}>×</button>
        </div>
        
        <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
          {['Name', 'Address', 'Mobile'].map((field) => (
            <div key={field}>
              <label style={{display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform:'uppercase'}}>
                {field}
              </label>
              <input 
                type="text" 
                name={field.toLowerCase()} 
                value={formData[field.toLowerCase()]} 
                onChange={handleChange} 
                style={{
                  width: '100%', padding: '12px', borderRadius: '8px', 
                  border: '1px solid var(--input-border)', 
                  background: 'var(--input-bg)',
                  color: 'var(--text-main)',
                  outline: 'none', fontSize: '15px'
                }} 
              />
            </div>
          ))}

          <div>
            <label style={{display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform:'uppercase'}}>Rate (₹)</label>
            <input 
              type="number" 
              name="rate" 
              value={formData.rate} 
              onChange={handleChange} 
              style={{
                width: '100%', padding: '12px', borderRadius: '8px', 
                border: '1px solid var(--input-border)', 
                background: 'var(--input-bg)',
                color: 'var(--text-main)',
                outline: 'none', fontSize: '15px'
              }} 
            />
          </div>
        </div>

        <div style={{display: 'flex', gap: '12px', marginTop: '25px'}}>
          <button onClick={onClose} style={{
            flex: 1, padding: '12px', background: 'transparent', color: 'var(--text-secondary)', 
            border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
          }}>
            Cancel
          </button>
          <button onClick={() => onSave(customer.id, formData)} style={{
            flex: 1, padding: '12px', background: '#10B981', color: 'white', 
            border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
            boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)'
          }}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================
   2. CUSTOMER ROW
   ========================================= */
const CustomerRow = ({ customer, selectedDate, currentShift, existingLog, onSaveEntry, onEditProfile }) => {
  const getInitialLit = () => currentShift === 'morning' ? (existingLog?.morning_liters || "") : (existingLog?.evening_liters || "");
  const getInitialMl = () => currentShift === 'morning' ? (existingLog?.morning_ml || "") : (existingLog?.evening_ml || "");
  
  // FIXED: Default to TRUE (Edit Mode) so input is always shown first
  const [isEditing, setIsEditing] = useState(true);
  const [liters, setLiters] = useState(getInitialLit());
  const [ml, setMl] = useState(getInitialMl());
  const [rate, setRate] = useState(customer.rate || 60);

  useEffect(() => {
    setLiters(getInitialLit());
    setMl(getInitialMl());
    
    // 1. Rate Logic (Historical)
    if (existingLog && existingLog.rate !== undefined && existingLog.rate !== null && existingLog.rate !== "") {
        setRate(existingLog.rate);
    } else {
        setRate(customer.rate || 60);
    }
    
    // 2. Logic: Should we show Pencil (View) or Save (Edit)?
    let hasDataForShift = false;
    
    if (existingLog) {
        if (currentShift === 'morning') {
            const l = existingLog.morning_liters;
            const m = existingLog.morning_ml;
            // Check if valid data exists (not null, not undefined, not "0", not empty string)
            if ((l && l !== "0" && l !== "") || (m && m !== "0" && m !== "")) {
                hasDataForShift = true;
            }
        } else {
            const l = existingLog.evening_liters;
            const m = existingLog.evening_ml;
            if ((l && l !== "0" && l !== "") || (m && m !== "0" && m !== "")) {
                hasDataForShift = true;
            }
        }
    }

    // If data exists -> View Mode (false). If NO data -> Edit Mode (true).
    setIsEditing(!hasDataForShift);

  }, [selectedDate, currentShift, existingLog, customer.rate]);

  const handleSaveClick = () => {
    onSaveEntry(customer.id, liters, ml, rate);
    // After save, we manually set editing to false to show the pencil immediately
    setIsEditing(false); 
  };

  return (
    <div style={{
      ...styles.card,
      flexDirection: 'row', 
      alignItems: 'center',
      justifyContent: 'space-between',
      borderLeft: `4px solid ${isEditing ? 'var(--border-color)' : '#10B981'}`
    }}>
      
      {/* LEFT: ID & Info */}
      <div style={{flex: 1, display: 'flex', alignItems: 'center', minWidth: '140px'}}>
        <div style={styles.idBadge}>{customer.id}</div>
        <div>
          <div style={{fontWeight: '700', fontSize: '17px', marginBottom:'2px'}}>
            {customer.name}
          </div>
          <div style={{fontSize: '13px', color: 'var(--text-secondary)'}}>
            📍 {customer.address || "No Address"}
          </div>
          {customer.mobile && (
            <div style={{fontSize: '13px', color: '#3B82F6', marginTop:'2px'}}>
              📞 {customer.mobile}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Controls */}
      <div style={{display: 'flex', alignItems: 'center', flexWrap:'nowrap'}}>
        
        {/* 1. Volume Inputs */}
        <div style={{display:'flex', gap:'8px'}}>
          <div style={{...styles.inputGroup, width: '150px', opacity: isEditing ? 1 : 0.6}}>
            <input type="number" value={liters} onChange={(e) => setLiters(e.target.value)} disabled={!isEditing} placeholder="0" style={styles.input} />
            <span style={styles.label}>L</span>
          </div>
          <div style={{...styles.inputGroup, width: '150px', opacity: isEditing ? 1 : 0.6}}>
            <input type="number" value={ml} onChange={(e) => setMl(e.target.value)} disabled={!isEditing} placeholder="0" style={styles.input} />
            <span style={styles.label}>ml</span>
          </div>
        </div>

        {/* 2. SAVE BUTTON (Middle) */}
        <div style={{margin: '0 20px'}}>
          {isEditing ? (
             <button onClick={handleSaveClick} style={{
               ...styles.iconBtn, background: '#10B981', color: 'white', width:'40px', height:'40px', boxShadow:'0 2px 5px rgba(16, 185, 129, 0.3)'
             }} title="Save">
                <span style={{ fontSize: "20px" }}>💾</span>
             </button>
          ) : (
             <button onClick={() => setIsEditing(true)} style={{
               ...styles.iconBtn, background: 'var(--btn-bg)', color: '#3B82F6', width:'40px', height:'40px'
             }} title="Edit Entry">
               <span style={{ fontSize: "20px" }}>✏️</span>
             </button>
          )}
        </div>

        {/* 3. Rate Input */}
        <div style={{display: 'flex', flexDirection:'column', alignItems: 'center'}}>
          <span style={{fontSize: '10px', color: 'var(--text-secondary)', marginBottom:'2px', fontWeight:'700', letterSpacing:'0.5px'}}>RATE</span>
          <input 
            type="number" 
            value={rate} 
            onChange={(e) => setRate(e.target.value)} 
            disabled={!isEditing} 
            className="no-arrow-input"
            style={{
              width: '60px', textAlign: 'center', border: 'none', 
              borderBottom: '2px solid var(--border-color)', 
              color: '#3B82F6', fontWeight:'700', fontSize:'16px', 
              outline:'none', background:'transparent', paddingBottom:'2px'
            }} 
          />
        </div>

        {/* 4. Settings */}
        <div style={{marginLeft: '10px'}}>
          <button onClick={() => onEditProfile(customer)} style={{
             ...styles.iconBtn, background: '#793bf6ff', color: 'var(--text-secondary)', width:'40px', height:'40px'
          }} title="Edit Customer">
            <span style={{ fontSize: "20px" }}>⚙️</span>
          </button>
        </div>

      </div>
    </div>
  );
};

/* =========================================
   3. MAIN COMPONENT
   ========================================= */
const DailyEntry = ({ customers, logs, performMagic, selectedDate, setSelectedDate, currentShift, setCurrentShift }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [localCustomers, setLocalCustomers] = useState(customers);

  useEffect(() => { setLocalCustomers(customers); }, [customers]);

  const handleSaveEntry = async (customerId, liters, ml, rate) => {
    const key = `${selectedDate}-${customerId}`;
    const existingData = logs[key] || {};
    const finalData = {
      morning_liters: existingData.morning_liters || "0",
      morning_ml: existingData.morning_ml || "0",
      evening_liters: existingData.evening_liters || "0",
      evening_ml: existingData.evening_ml || "0",
      rate: rate, 
      [currentShift === 'morning' ? 'morning_liters' : 'evening_liters']: liters,
      [currentShift === 'morning' ? 'morning_ml' : 'evening_ml']: ml,
    };

    try {
      await updateLogEntry(selectedDate, customerId, finalData);
    } catch (error) {
      console.error(error);
      alert("Error saving entry!");
    }
  };

  const handleSaveCustomerProfile = async (id, updatedData) => {
    try {
      await updateCustomer(id, updatedData);
      setLocalCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
      setEditingCustomer(null);
    } catch (error) {
      console.error(error);
      alert("Failed to update profile.");
    }
  };

  // --- FILTER LOGIC FIXED ---
  const filteredCustomers = localCustomers.filter(c => {
    // 1. Search Filter
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.id.toString().includes(searchTerm);
    
    // 2. Shift Filter Logic
    // If customer has no preference, default to 'both'
    const custShift = c.shift || 'both';
    
    // Logic: 
    // - If customer is 'both', show in both shifts.
    // - If customer is 'morning', show ONLY in morning.
    // - If customer is 'evening', show ONLY in evening.
    const matchesShift = custShift === 'both' || custShift === currentShift;

    return matchesSearch && matchesShift;
  });

  return (
    <div style={{maxWidth: '900px', margin: '0 auto', padding: '15px', fontFamily: "'Inter', sans-serif"}}>
      
      {/* --- CSS VARIABLES & GLOBAL STYLES --- */}
      <style>{`
        /* LIGHT MODE (Default) */
        :root {
          --card-bg: #ffffff;
          --header-bg: #ffffff;
          --text-main: #333333;
          --text-secondary: #6B7280;
          --border-color: #E5E7EB;
          --input-bg: #F9FAFB;
          --input-border: #E5E7EB;
          --card-shadow: 0 2px 8px rgba(0,0,0,0.05);
          --badge-bg: #E0E7FF;
          --badge-text: #4338CA;
          --btn-bg: #F3F4F6;
        }

        /* DARK MODE */
        body.dark, body.dark-mode, [data-theme='dark'] {
          --card-bg: #1F2937;
          --header-bg: #1F2937;
          --text-main: #F9FAFB;
          --text-secondary: #9CA3AF;
          --border-color: #374151;
          --input-bg: #111827;
          --input-border: #374151;
          --card-shadow: 0 4px 6px rgba(0,0,0,0.2);
          --badge-bg: #3730A3;
          --badge-text: #E0E7FF;
          --btn-bg: #374151;
        }

        /* Utility */
        .no-arrow-input::-webkit-outer-spin-button,
        .no-arrow-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .no-arrow-input { -moz-appearance: textfield; }
      `}</style>

      {/* --- HEADER --- */}
      <div style={styles.headerCard}>
        
        {/* Row 1: Date & Search */}
        <div style={{display: 'flex', flexDirection: 'row', gap: '15px', flexWrap: 'wrap', alignItems:'center'}}>
          <div style={{display:'flex', flexDirection:'column'}}>
            <label style={styles.labelTop}>DATE</label>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={e => setSelectedDate(e.target.value)} 
              style={{
                padding: '10px', borderRadius: '8px', 
                border: '1px solid var(--input-border)', 
                background: 'var(--input-bg)',
                color: 'var(--text-main)', 
                fontWeight: '600', outline:'none', cursor:'pointer'
              }} 
            />
          </div>
          
          <div style={{flex: 1, minWidth: '220px', position: 'relative', display:'flex', flexDirection:'column'}}>
            <label style={styles.labelTop}>SEARCH</label>
            <div style={{position:'relative'}}>
              <span style={{position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)'}}>🔍</span>
              <input 
                type="text" 
                placeholder="Search Customer..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                style={{
                  width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px', 
                  border: '1px solid var(--input-border)', 
                  background: 'var(--input-bg)',
                  color: 'var(--text-main)',
                  fontSize: '15px', outline:'none'
                }} 
              />
            </div>
          </div>
        </div>

        {/* Row 2: Shift Toggle */}
        <div style={{marginTop: '20px', display: 'flex', justifyContent:'center'}}>
          <div style={{background: 'var(--input-bg)', padding: '4px', borderRadius: '12px', display: 'inline-flex', gap:'4px', border: '1px solid var(--border-color)'}}>
              <button onClick={() => setCurrentShift('morning')} style={{
                  padding: '8px 24px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
                  background: currentShift === 'morning' ? 'var(--card-bg)' : 'transparent', 
                  color: currentShift === 'morning' ? '#F59E0B' : 'var(--text-secondary)',
                  boxShadow: currentShift === 'morning' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  fontSize: '14px'
              }}>
                ☀️ Morning (सुबह)
              </button>
              
              <button onClick={() => setCurrentShift('evening')} style={{
                  padding: '8px 24px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
                  background: currentShift === 'evening' ? 'var(--card-bg)' : 'transparent', 
                  color: currentShift === 'evening' ? '#4F46E5' : 'var(--text-secondary)',
                  boxShadow: currentShift === 'evening' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  fontSize: '14px'
              }}>
                🌙 Evening (शाम)
              </button>
          </div>
        </div>
      </div>

      {/* --- LIST --- */}
      <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
        {filteredCustomers.map(customer => (
           <CustomerRow 
             key={customer.id}
             customer={customer}
             selectedDate={selectedDate}
             currentShift={currentShift}
             existingLog={logs[`${selectedDate}-${customer.id}`]}
             onSaveEntry={handleSaveEntry}
             onEditProfile={() => setEditingCustomer(customer)}
           />
        ))}
      </div>

      {/* --- MODAL --- */}
      {editingCustomer && (
        <EditCustomerModal 
          customer={editingCustomer} 
          onClose={() => setEditingCustomer(null)} 
          onSave={handleSaveCustomerProfile}
        />
      )}
    </div>
  );
};

export default DailyEntry;