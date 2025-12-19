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
    display: 'flex', gap: '8px' // Keeps input + translate button together
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
  customerItem: {
    padding: '15px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  activeItem: {
    background: 'rgba(16, 185, 129, 0.1)', // Light green highlight
    borderLeft: '4px solid #10B981'
  },
  listContainer: {
    maxHeight: '400px', overflowY: 'auto', 
    border: '1px solid var(--border-color)', borderRadius: '12px',
    marginTop: '20px'
  }
};

const CustomerManager = ({ customers, t, performMagic }) => {
  const [newCustomer, setNewCustomer] = useState({ id: "", name: "", address: "", mobile: "", rate: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleMagicToggle = async (field) => {
    setLoading(true);
    const result = await performMagic(newCustomer[field]);
    setNewCustomer(prev => ({ ...prev, [field]: result }));
    setLoading(false);
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
        rate: Number(newCustomer.rate) 
    };

    try {
        await addCustomerToDb(customerData); 
        setNewCustomer({ id: "", name: "", address: "", mobile: "", rate: "" }); 
        setEditingId(null);
        alert("Success! Customer Saved."); 
    } catch (e) {
        console.error(e);
        alert("Error saving data");
    }
  };

  const startEditing = (customer) => {
    setNewCustomer(customer);
    setEditingId(customer.id);
    // Scroll to top on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewCustomer({ id: "", name: "", address: "", mobile: "", rate: "" });
  };

  return (
    <div style={{...styles.card, border: editingId ? '2px solid #10B981' : styles.card.border}}>
      <h3 style={styles.header}>{editingId ? t.editCustomerHeader : t.addCustomerHeader}</h3>
      
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

        {/* Mobile & Rate (Side by side on large screens, stacked on small) */}
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
      
      {/* Customer List */}
      <div style={styles.listContainer}>
          <div style={{padding:'10px', background:'var(--input-bg)', borderBottom:'1px solid var(--border-color)', fontWeight:'bold', textAlign:'center', color:'var(--text-secondary)'}}>
              Existing Customers (Tap to Edit)
          </div>
          {customers.map(c => (
              <div 
                key={c.id} 
                onClick={() => startEditing(c)} 
                style={{
                    ...styles.customerItem,
                    ...(editingId === c.id ? styles.activeItem : {})
                }}
              >
                  <div>
                      <div style={{fontWeight:'bold'}}>#{c.id} {c.name}</div>
                      <div style={{fontSize:'12px', color:'var(--text-secondary)'}}>{c.address || 'No Address'}</div>
                  </div>
                  <div style={{fontWeight:'bold', color:'#10B981'}}>₹{c.rate}</div>
              </div>
          ))}
      </div>
    </div>
  );
};

export default CustomerManager;