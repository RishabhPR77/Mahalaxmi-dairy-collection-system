import React, { useState } from 'react';
import { deleteCustomerFromDb, deleteLogEntry, deletePaymentFromDb } from '../services/db';

const styles = {
  container: {
    maxWidth: '600px', margin: '20px auto', padding: '20px',
    background: 'var(--card-bg)', borderRadius: '16px',
    boxShadow: 'var(--card-shadow)', border: '1px solid #EF4444',
    color: 'var(--text-main)', textAlign: 'center'
  },
  header: { color: '#EF4444', marginBottom: '10px' },
  warning: { background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px' },
  input: {
    width: '100%', padding: '12px', borderRadius: '8px',
    border: '1px solid var(--border-color)',
    background: 'var(--input-bg)', color: 'var(--text-main)',
    marginBottom: '10px', fontSize: '16px'
  },
  btn: {
    width: '100%', padding: '15px', borderRadius: '8px', border: 'none',
    fontWeight: 'bold', cursor: 'pointer', color: 'white',
    background: '#EF4444', fontSize: '16px', marginTop: '10px'
  },
  list: {
    textAlign: 'left', maxHeight: '300px', overflowY: 'auto',
    border: '1px solid var(--border-color)', borderRadius: '8px',
    marginTop: '10px'
  },
  item: {
    padding: '10px', borderBottom: '1px solid var(--border-color)',
    cursor: 'pointer', display: 'flex', justifyContent: 'space-between'
  }
};

const DeleteTab = ({ customers, logs, payments, t, performMagic }) => {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filter customers
  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toString().includes(search)
  );

  const handleHardDelete = async () => {
    if (!selectedId) return;
    const customer = customers.find(c => c.id === selectedId);
    const confirmMsg = `🚨 NUCLEAR DELETE WARNING 🚨\n\nThis will PERMANENTLY DELETE:\n1. Customer Profile: ${customer.name}\n2. ALL Daily Milk Logs\n3. ALL Payment History\n\nThere is no undo. Are you sure?`;

    if (!window.confirm(confirmMsg)) return;

    setLoading(true);
    try {
      // 1. Find and Delete ALL Logs for this ID
      const logKeysToDelete = Object.keys(logs).filter(key => key.endsWith(`-${selectedId}`));
      let logCount = 0;
      for (const key of logKeysToDelete) {
        const [date] = key.split(`-${selectedId}`);
        await deleteLogEntry(date, selectedId);
        logCount++;
      }

      // 2. Find and Delete ALL Payments for this ID
      const paymentsToDelete = payments.filter(p => p.customerId === selectedId);
      let payCount = 0;
      for (const p of paymentsToDelete) {
        await deletePaymentFromDb(p.id);
        payCount++;
      }

      // 3. Delete the Profile
      await deleteCustomerFromDb(selectedId);

      alert(`Success! Deleted:\n- Profile\n- ${logCount} Daily Logs\n- ${payCount} Payment Records\n\nID "${selectedId}" is now completely clean.`);
      setSearch("");
      setSelectedId(null);
    } catch (error) {
      console.error(error);
      alert("Error during deletion. Check console.");
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>🗑️ Permanent Delete</h2>
      <div style={styles.warning}>
        ⚠️ <b>Warning:</b> This action cleans the database completely for the selected customer. If you reuse this ID later, it will start with 0 data.
      </div>

      <input
        style={styles.input}
        placeholder="Search Customer to Delete..."
        value={search}
        onChange={e => { setSearch(e.target.value); setSelectedId(null); }}
      />

      {/* List of Customers */}
      {search && !selectedId && (
        <div style={styles.list}>
          {filtered.map(c => (
            <div key={c.id} style={styles.item} onClick={() => { setSearch(c.name); setSelectedId(c.id); }}>
              <span>{c.name}</span>
              <span style={{ fontWeight: 'bold' }}>#{c.id}</span>
            </div>
          ))}
        </div>
      )}

      {/* Selected Confirmation */}
      {selectedId && (
        <div style={{ marginTop: '20px', border: '2px dashed #EF4444', padding: '15px', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>Selected: {customers.find(c => c.id === selectedId)?.name}</h3>
          <p>ID: {selectedId}</p>
          <button onClick={handleHardDelete} style={styles.btn} disabled={loading}>
            {loading ? "DELETING EVERYTHING..." : "🔥 DELETE EVERYTHING"}
          </button>
          <button onClick={() => { setSelectedId(null); setSearch(""); }} style={{ ...styles.btn, background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)', marginTop: '10px' }}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default DeleteTab;