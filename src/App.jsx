import { useState, useEffect } from 'react';
import './App.css';

// Utils
import { translations } from './utils/translations';
import { performMagic } from './utils/helpers';

// Services (Firebase Listeners)
import { listenToCustomers, listenToLogs, listenToPayments } from './services/db';

// Components
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import DailyEntry from './components/DailyEntry';
import CustomerManager from './components/CustomerManager';
import Payments from './components/Payments';
import MasterReport from './components/MasterReport';
import IndividualReport from './components/IndividualReport';
import DeleteTab from './components/DeleteTab';

function App() {
  // --- AUTH STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState("home");
  const [lang, setLang] = useState(() => localStorage.getItem("dairy_lang") || "en");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("dairy_theme") === "dark");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentShift, setCurrentShift] = useState("morning");

  const t = translations[lang];

  // --- DATA STATE (Starts empty, fills from Cloud) ---
  const [customers, setCustomers] = useState([]);
  const [logs, setLogs] = useState({});
  const [payments, setPayments] = useState([]);

  // --- FIREBASE LISTENERS ---
  useEffect(() => {
    // 1. Listen to Customers
    const unsubscribeCust = listenToCustomers((data) => setCustomers(data));

    // 2. Listen to Logs
    const unsubscribeLogs = listenToLogs((data) => setLogs(data));

    // 3. Listen to Payments
    const unsubscribePay = listenToPayments((data) => setPayments(data));

    // Cleanup listeners when closing app
    return () => {
      unsubscribeCust();
      unsubscribeLogs();
      unsubscribePay();
    };
  }, []);

  // --- THEME & LANG EFFECTS ---
  useEffect(() => { 
    const u = localStorage.getItem("dairy_user"); 
    if(u) setIsLoggedIn(true); 
  }, []);

  useEffect(() => { 
    localStorage.setItem("dairy_lang", lang); 
  }, [lang]);

  useEffect(() => {
    if (darkMode) { 
        document.body.classList.add('dark-mode'); 
        localStorage.setItem("dairy_theme", "dark"); 
    } else { 
        document.body.classList.remove('dark-mode'); 
        localStorage.setItem("dairy_theme", "light"); 
    }
  }, [darkMode]);

  // --- HANDLERS ---
  const handleLogin = () => {
    // Simple Hardcoded Auth (Replace with Firebase Auth if needed later)
    if (username === "admin" && password === "milk123") {
      setIsLoggedIn(true); 
      localStorage.setItem("dairy_user", username);
    } else { 
      alert(t.loginError); 
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false); 
    localStorage.removeItem("dairy_user");
    setUsername(""); 
    setPassword("");
  };

  // --- RENDER ---
  if (!isLoggedIn) {
    return (
        <Login 
            username={username} 
            setUsername={setUsername} 
            password={password} 
            setPassword={setPassword} 
            handleLogin={handleLogin} 
            t={t} 
            setLang={setLang} 
            lang={lang} 
        />
    );
  }

  return (
    // WRAP EVERYTHING IN LAYOUT SO THEME APPLIES CORRECTLY
    <Layout 
        t={t} 
        lang={lang} 
        setLang={setLang} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        handleLogout={handleLogout} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
    >

      {/* RENDER ACTIVE TAB CONTENT */}
      
      {activeTab === 'home' && (
        <Dashboard 
            customers={customers} 
            logs={logs} 
            t={t} 
            exportData={() => alert("Data is backed up on Cloud automatically!")} 
            importData={() => alert("Data restores automatically on login!")} 
        />
      )}
      
      {activeTab === 'entry' && (
        <DailyEntry 
            customers={customers} 
            logs={logs} 
            t={t} 
            performMagic={performMagic} 
            selectedDate={selectedDate} 
            setSelectedDate={setSelectedDate} 
            currentShift={currentShift} 
            setCurrentShift={setCurrentShift} 
        />
      )}
      
      {activeTab === 'customers' && (
        <CustomerManager 
            customers={customers} 
            t={t} 
            performMagic={performMagic} 
            setActiveTab={setActiveTab} 
        />
      )}
      
      {activeTab === 'payment' && (
        <Payments 
            customers={customers} 
            logs={logs} 
            payments={payments} 
            t={t} 
            performMagic={performMagic} 
            // Note: delete logic is now handled inside Payments.jsx via db.js
        />
      )}
      
      {activeTab === 'master' && (
        <MasterReport 
            customers={customers} 
            logs={logs} 
            t={t} 
        />
      )}
      
      {activeTab === 'report' && (
        <IndividualReport 
            customers={customers} 
            logs={logs} 
            t={t} 
            performMagic={performMagic} 
        />
      )}
      
      {activeTab === 'delete' && (
        <DeleteTab 
            customers={customers} 
            t={t} 
            performMagic={performMagic} 
            // Note: delete logic is now handled inside DeleteTab.jsx via db.js
        />
      )}

    </Layout>
  );
}

export default App;