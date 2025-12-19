import React, { useState } from 'react';
import { deleteCustomerFromDb } from '../services/db'; // <--- IMPORT FIREBASE FUNCTION

// --- STYLES (Dark Mode Ready) ---
const styles = {
  card: {
    background: 'var(--card-bg)',
    color: 'var(--text-main)',
    borderRadius: '16px',
    boxShadow: 'var(--card-shadow)',
    padding: '25px',
    border: '1px solid var(--border-color)',
    textAlign: 'center',
    maxWidth: '600px',
    margin: '0 auto',
    transition: 'background 0.3s'
  },
  header: {
    color: '#EF4444', // Red for danger
    marginBottom: '20px',
    fontSize: '22px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
  },
  searchContainer: {
    display: 'flex', gap: '10px', marginBottom: '25px'
  },
  input: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    border: '2px solid #EF4444', // Red border
    background: 'var(--input-bg)',
    color: 'var(--text-main)',
    outline: 'none',
    fontSize: '16px'
  },
  translateBtn: {
    background: '#EF4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '0 20px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  // Item Styles
  itemCard: {
    background: 'var(--input-bg)', // Slightly darker/lighter than card
    padding: '15px',
    borderRadius: '12px',
    marginBottom: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px solid var(--border-color)'
  },
  itemInfo: {
    textAlign: 'left'
  },
  name: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: 'var(--text-main)'
  },
  address: {
    fontSize: '14px',
    color: 'var(--text-secondary)'
  },
  deleteBtn: {
    background: '#DC2626', // Darker red
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(220, 38, 38, 0.3)'
  }
};

const DeleteTab = ({ customers, t, performMagic }) => {
  const [deleteSearch, setDeleteSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Filter customers based on search
  const deleteFiltered = customers.filter(c => 
    deleteSearch && (
      c.id.toLowerCase().includes(deleteSearch.toLowerCase()) || 
      c.name.toLowerCase().includes(deleteSearch.toLowerCase())
    )
  );

  const handleDeleteSearchMagic = async () => {
    setLoading(true);
    const result = await performMagic(deleteSearch);
    setDeleteSearch(result);
    setLoading(false);
  };

  // --- FIREBASE DELETE LOGIC ---
  const handleConfirmDelete = async (customerId, customerName) => {
    // 1. Double confirmation check
    const isConfirmed = window.confirm(
      `⚠️ WARNING ⚠️\n\nAre you sure you want to delete ${customerName} (#${customerId})?\n\nThis will remove them from the database permanently.`
    );

    if (isConfirmed) {
      try {
        await deleteCustomerFromDb(customerId); // Call DB function
        alert("Customer deleted successfully.");
        setDeleteSearch(""); // Clear search
      } catch (error) {
        console.error("Error deleting:", error);
        alert("Failed to delete. Check console.");
      }
    }
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.header}>⚠️ {t.deleteTabHeader}</h3>
      
      {/* Search Bar */}
      <div style={styles.searchContainer}>
        <input 
          type="text" 
          placeholder={t.searchDeletePlaceholder} 
          value={deleteSearch} 
          onChange={(e) => setDeleteSearch(e.target.value)} 
          style={styles.input} 
        />
        <button onClick={handleDeleteSearchMagic} style={styles.translateBtn}>
          {loading ? '...' : 'A⟷अ'}
        </button>
      </div>

      {/* Results List */}
      <div style={{minHeight: '200px'}}>
        {deleteSearch === "" ? (
          <p style={{color: 'var(--text-secondary)', fontStyle: 'italic'}}>
            Type a name or ID to search...
          </p>
        ) : deleteFiltered.length === 0 ? (
          <p style={{fontWeight: 'bold', color: 'var(--text-main)'}}>{t.noDeleteResults}</p>
        ) : (
          deleteFiltered.map(cust => (
            <div key={cust.id} style={styles.itemCard}>
              <div style={styles.itemInfo}>
                <div style={styles.name}>#{cust.id} - {cust.name}</div>
                <div style={styles.address}>{cust.address}</div>
              </div>
              
              <button 
                style={styles.deleteBtn} 
                onClick={() => handleConfirmDelete(cust.id, cust.name)}
              >
                {t.deleteBtn}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DeleteTab;