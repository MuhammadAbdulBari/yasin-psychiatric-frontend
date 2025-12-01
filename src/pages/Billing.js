import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CheckPrescription from '../components/CheckPrescription';
import GenerateBill from '../components/GenerateBill';
import '../styles/Billing.css';

const Billing = () => {
  const { user, logout } = useAuth();
  const [currentPrescription, setCurrentPrescription] = useState(null);
  const [activeTab, setActiveTab] = useState('check');

  const handlePrescriptionFound = (prescription) => {
    setCurrentPrescription(prescription);
    setActiveTab('bill');
  };

  const handleBillGenerated = () => {
    setCurrentPrescription(null);
    setActiveTab('check');
  };

  return (
    <div className="billing-container">
      <header className="billing-header">
        <div className="header-info">
          <h1>Billing Counter</h1>
          <p>Welcome, {user?.name}</p>
        </div>
        <button onClick={logout} className="logout-btn">Logout</button>
      </header>

      <nav className="billing-nav">
        <button 
          className={activeTab === 'check' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('check')}
        >
          Check Prescription
        </button>
        <button 
          className={activeTab === 'bill' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('bill')}
          disabled={!currentPrescription}
        >
          Generate Bill
        </button>
      </nav>

      <main className="billing-main">
        {activeTab === 'check' && (
          <CheckPrescription onPrescriptionFound={handlePrescriptionFound} />
        )}
        
        {activeTab === 'bill' && currentPrescription && (
          <GenerateBill 
            prescription={currentPrescription}
            onBillGenerated={handleBillGenerated}
          />
        )}
      </main>
    </div>
  );
};

export default Billing;