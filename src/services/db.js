import { db } from "../firebase";
import { 
  collection, doc, setDoc, deleteDoc, updateDoc, // <--- ADDED updateDoc
  onSnapshot, query, orderBy 
} from "firebase/firestore";

// --- CUSTOMERS ---
export const listenToCustomers = (callback) => {
  const q = query(collection(db, "customers"), orderBy("id"));
  return onSnapshot(q, (snapshot) => {
    const customers = snapshot.docs.map(doc => ({ ...doc.data() }));
    callback(customers);
  });
};

export const addCustomerToDb = async (customer) => {
  await setDoc(doc(db, "customers", customer.id), customer);
};

// --- NEW FUNCTION TO FIX EDITING ---
export const updateCustomer = async (customerId, updatedData) => {
  const customerRef = doc(db, "customers", String(customerId));
  await updateDoc(customerRef, updatedData);
};

export const deleteCustomerFromDb = async (customerId) => {
  await deleteDoc(doc(db, "customers", customerId));
};

// --- LOGS (MILK ENTRIES) ---
export const listenToLogs = (callback) => {
  return onSnapshot(collection(db, "logs"), (snapshot) => {
    const logsObj = {};
    snapshot.docs.forEach(doc => {
      logsObj[doc.id] = doc.data();
    });
    callback(logsObj);
  });
};

export const updateLogEntry = async (date, customerId, data) => {
  const key = `${date}-${customerId}`;
  await setDoc(doc(db, "logs", key), data, { merge: true });
};

export const deleteLogEntry = async (date, customerId) => {
  const key = `${date}-${customerId}`;
  await deleteDoc(doc(db, "logs", key));
};

// --- PAYMENTS ---
export const listenToPayments = (callback) => {
  const q = query(collection(db, "payments"));
  return onSnapshot(q, (snapshot) => {
    const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    payments.sort((a,b) => new Date(a.date) - new Date(b.date));
    callback(payments);
  });
};

export const addPaymentToDb = async (payment) => {
  const id = String(Date.now());
  await setDoc(doc(db, "payments", id), { ...payment, id });
};

export const deletePaymentFromDb = async (paymentId) => {
  await deleteDoc(doc(db, "payments", String(paymentId)));
};