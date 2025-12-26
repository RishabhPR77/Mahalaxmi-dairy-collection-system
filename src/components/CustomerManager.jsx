import React, { useState } from 'react';
import { addCustomerToDb } from '../services/db';

// --- STYLES (Mobile First & Dark Mode Ready) ---
const styles = {
  card: {
    background: 'var(--card-bg)',
    color: 'var(--text-main)',
    borderRadius: '16px',
    boxShadow: 'var(--card-shadow)',
    padding: '20px',
    border: '1px solid var(--border-color)',
    marginBottom: '20px',
    maxWidth: '800px',
    margin: '0 auto 20px auto'
  },
  header: {
    textAlign: 'center', marginBottom: '20px', color: 'var(--text-main)', marginTop: 0
  },
  formStack: {
    display: 'flex', flexDirection: 'column', gap: '15px'
  },
  inputGroup: {
    display: 'flex', flexDirection: 'column', gap: '5px'
  },
  label: {
    fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginLeft: '4px'
  },
  inputRow: {
    display: 'flex', gap: '8px' 
  },
  input: {
    width: '100%', padding: '12px', borderRadius: '10px', 
    border: '1px solid var(--border-color)', 
    background: 'var(--input-bg)', color: 'var(--text-main)',
    outline: 'none', fontSize: '16px'
  },
  btn: {
    padding: '12px', borderRadius: '10px', border: 'none', 
    fontWeight: 'bold', cursor: 'pointer', color: 'white', 
    fontSize: '15px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  // Shift Toggle Buttons
  shiftContainer: {
    display: 'flex', gap: '5px', background: 'var(--input-bg)', 
    padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)'
  },
  shiftBtn: (isActive, color) => ({
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    background: isActive ? 'var(--card-bg)' : 'transparent',
    color: isActive ? color : 'var(--text-secondary)',
    boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
    transition: 'all 0.2s',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px'
  }),
  customerItem: {
    padding: '15px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  activeItem: {
    background: 'rgba(16, 185, 129, 0.1)', 
    borderLeft: '4px solid #10B981'
  },
  listContainer: {
    maxHeight: '500px', overflowY: 'auto', 
    border: '1px solid var(--border-color)', borderRadius: '12px',
    marginTop: '20px',
    position: 'relative' // Needed for sticky header
  },
  stickyHeader: {
    position: 'sticky', 
    top: 0, 
    background: 'var(--card-bg)', 
    zIndex: 10, 
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '10px'
  }
};

const CustomerManager = ({ customers, t, performMagic }) => {
  const [newCustomer, setNewCustomer] = useState({ id: "", name: "", address: "", mobile: "", rate: "", shift: "both" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // --- NEW SEARCH STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  // Form Magic
  const handleMagicToggle = async (field) => {
    setLoading(true);
    const result = await performMagic(newCustomer[field]);
    setNewCustomer(prev => ({ ...prev, [field]: result }));
    setLoading(false);
  };

  // Search Magic
  const handleSearchMagic = async () => {
    setSearchLoading(true);
    const result = await performMagic(searchQuery);
    setSearchQuery(result);
    setSearchLoading(false);
  };

  const handleSaveCustomer = async () => {
    if (!newCustomer.id || !newCustomer.name || !newCustomer.rate) return alert(t.alertAllFields);
    
    if (!editingId) {
      const exists = customers.some(c => c.id === newCustomer.id.trim());
      if (exists) return alert(t.alertIdExists);
    }

    const customerData = { 
        ...newCustomer, 
        id: editingId ? editingId : newCustomer.id.trim(), 
        rate: Number(newCustomer.rate),
        shift: newCustomer.shift || 'both' 
    };

    try {
        await addCustomerToDb(customerData); 
        setNewCustomer({ id: "", name: "", address: "", mobile: "", rate: "", shift: "both" }); 
        setEditingId(null);
        alert("Success! Customer Saved."); 
    } catch (e) {
        console.error(e);
        alert("Error saving data");
    }
  };

  const startEditing = (customer) => {
    setNewCustomer({ ...customer, shift: customer.shift || 'both' }); 
    setEditingId(customer.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewCustomer({ id: "", name: "", address: "", mobile: "", rate: "", shift: "both" });
  };

  const getShiftIcon = (shift) => {
      if (shift === 'morning') return '☀️';
      if (shift === 'evening') return '🌙';
      return '🌗';
  };

  // --- FILTER CUSTOMERS BASED ON SEARCH ---
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.id.toString().includes(searchQuery)
  );

  return (
    <div style={{...styles.card, border: editingId ? '2px solid #10B981' : styles.card.border}}>
      <h3 style={styles.header}>{editingId ? t.editCustomerHeader : t.addCustomerHeader}</h3>
      
      {/* FORM SECTION */}
      <div style={styles.formStack}>
        {/* ID */}
        <div style={styles.inputGroup}>
            <label style={styles.label}>Customer ID</label>
            <input 
                placeholder={t.idPlaceholder} 
                value={newCustomer.id} 
                onChange={e => setNewCustomer({...newCustomer, id: e.target.value})} 
                disabled={editingId !== null} 
                style={{...styles.input, opacity: editingId ? 0.6 : 1}}
            />
        </div>

        {/* Name */}
        <div style={styles.inputGroup}>
            <label style={styles.label}>Name</label>
            <div style={styles.inputRow}>
                <input style={styles.input} placeholder={t.namePlaceholder} value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
                <button onClick={() => handleMagicToggle('name')} style={{...styles.btn, background:'#8B5CF6', flex:'none', width:'50px'}}>
                    {loading ? '...' : 'अ'}
                </button>
            </div>
        </div>

        {/* Address */}
        <div style={styles.inputGroup}>
            <label style={styles.label}>Address</label>
            <div style={styles.inputRow}>
                <input style={styles.input} placeholder={t.addressPlaceholder} value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} />
                <button onClick={() => handleMagicToggle('address')} style={{...styles.btn, background:'#8B5CF6', flex:'none', width:'50px'}}>
                    {loading ? '...' : 'अ'}
                </button>
            </div>
        </div>

        {/* Shift Selection */}
        <div style={styles.inputGroup}>
            <label style={styles.label}>Preferred Shift (शिफ्ट चुनें)</label>
            <div style={styles.shiftContainer}>
                <button onClick={() => setNewCustomer({...newCustomer, shift: 'both'})} style={styles.shiftBtn(newCustomer.shift === 'both', '#6366F1')}>
                    <span style={{fontSize:'16px'}}>🌗</span><span>Both (दोनों)</span>
                </button>
                <button onClick={() => setNewCustomer({...newCustomer, shift: 'morning'})} style={styles.shiftBtn(newCustomer.shift === 'morning', '#F59E0B')}>
                    <span style={{fontSize:'16px'}}>☀️</span><span>Morning (सुबह)</span>
                </button>
                <button onClick={() => setNewCustomer({...newCustomer, shift: 'evening'})} style={styles.shiftBtn(newCustomer.shift === 'evening', '#4F46E5')}>
                    <span style={{fontSize:'16px'}}>🌙</span><span>Evening (शाम)</span>
                </button>
            </div>
        </div>

        {/* Mobile & Rate */}
        <div style={{display:'flex', gap:'15px', flexWrap:'wrap'}}>
            <div style={{...styles.inputGroup, flex: 1, minWidth: '140px'}}>
                <label style={styles.label}>Mobile Number</label>
                <input type="number" style={styles.input} placeholder={t.mobilePlaceholder} value={newCustomer.mobile} onChange={e => setNewCustomer({...newCustomer, mobile: e.target.value})} />
            </div>
            <div style={{...styles.inputGroup, flex: 1, minWidth: '140px'}}>
                <label style={styles.label}>Rate (₹)</label>
                <input type="number" style={styles.input} placeholder={t.ratePlaceholder} value={newCustomer.rate} onChange={e => setNewCustomer({...newCustomer, rate: e.target.value})} />
            </div>
        </div>

        {/* Buttons */}
        <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
            <button onClick={handleSaveCustomer} style={{...styles.btn, background: '#10B981'}}>
                {editingId ? t.updateBtn : t.addBtn}
            </button>
            {editingId && (
                <button onClick={cancelEdit} style={{...styles.btn, background: '#EF4444'}}>
                    {t.cancelBtn}
                </button>
            )}
        </div>
      </div>
      
      {/* CUSTOMER LIST WITH SEARCH */}
      <div style={styles.listContainer}>
          
          {/* Sticky Header with Search */}
          <div style={styles.stickyHeader}>
              <div style={{padding:'10px', fontWeight:'bold', textAlign:'center', color:'var(--text-secondary)'}}>
                  Existing Customers (Tap to Edit)
              </div>
              <div style={{padding: '0 15px', display: 'flex', gap: '8px'}}>
                  <input 
                      style={{...styles.input, padding: '10px', fontSize: '14px', background: 'var(--input-bg)'}} 
                      placeholder="Search ID or Name..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button 
                      onClick={handleSearchMagic} 
                      style={{...styles.btn, background:'#8B5CF6', flex:'none', width:'50px', padding: 0}}
                  >
                      {searchLoading ? '...' : 'अ'}
                  </button>
              </div>
          </div>

          {/* List Items */}
          {filteredCustomers.length === 0 ? (
             <div style={{padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic'}}>
                 No customers found.
             </div>
          ) : (
             filteredCustomers.map(c => (
              <div 
                key={c.id} 
                onClick={() => startEditing(c)} 
                style={{
                    ...styles.customerItem,
                    ...(editingId === c.id ? styles.activeItem : {})
                }}
              >
                  <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                      <div style={{
                          background:'var(--input-bg)', width:'30px', height:'30px', borderRadius:'50%', 
                          display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px',
                          border: '1px solid var(--border-color)'
                      }}>
                          {getShiftIcon(c.shift || 'both')}
                      </div>
                      <div>
                          <div style={{fontWeight:'bold'}}>#{c.id} {c.name}</div>
                          <div style={{fontSize:'12px', color:'var(--text-secondary)'}}>{c.address || 'No Address'}</div>
                      </div>
                  </div>
                  <div style={{fontWeight:'bold', color:'#10B981'}}>₹{c.rate}</div>
              </div>
             ))
          )}
      </div>
    </div>
  );
};

export default CustomerManager;