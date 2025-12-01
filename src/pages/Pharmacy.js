import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ViewPrescription from '../components/ViewPrescription';
import '../styles/Pharmacy.css';

const Pharmacy = () => {
  const { user, logout } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchSlipNumber, setSearchSlipNumber] = useState('');
  const [currentPrescription, setCurrentPrescription] = useState(null);
  const [activeTab, setActiveTab] = useState('prescriptions');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://72.60.193.192:5000/api/prescriptions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        let data = await response.json();

        // Parse each prescription's medicine_list
        data = data.map(p => {
          if (typeof p.medicine_list === "string") {
            try {
              p.medicine_list = JSON.parse(p.medicine_list);
            } catch (e) {
              console.error("Parse error:", e);
              p.medicine_list = [];
            }
          }
          return p;
        });

        setPrescriptions(data);
      } else {
        console.error('Failed to fetch prescriptions:', response.status);
      }
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
    }

    setLoading(false);
  };

  const handleSearchPrescription = async (e) => {
    e.preventDefault();
    if (!searchSlipNumber.trim()) {
      setError('Please enter a slip number');
      return;
    }

    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://72.60.193.192:5000/api/prescriptions/slip/${searchSlipNumber.trim()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const prescription = await response.json();
        
        // Parse medicine_list if it's a string
        if (prescription.medicine_list && typeof prescription.medicine_list === 'string') {
          try {
            prescription.medicine_list = JSON.parse(prescription.medicine_list);
          } catch (parseError) {
            console.error('Error parsing medicine list:', parseError);
            prescription.medicine_list = [];
          }
        }
        
        const patientResponse = await fetch(`http://72.60.193.192:5000/api/patients/slip/${searchSlipNumber.trim()}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (patientResponse.ok) {
          const patient = await patientResponse.json();
          setCurrentPrescription({ prescription, patient });
          setActiveTab('view');
        } else {
          setError('Patient not found for this slip');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Prescription not found');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to connect to server');
    }
    setLoading(false);
  };

  const updatePrescriptionStatus = async (prescriptionId, status) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://localhost:5000/api/pharmacy/prescriptions/${prescriptionId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        await fetchPrescriptions();
        alert(`Prescription status updated to ${status}`);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (err) {
      alert('Failed to update prescription status');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'status-pending', label: 'Pending' },
      preparing: { class: 'status-preparing', label: 'Preparing' },
      ready: { class: 'status-ready', label: 'Ready for Pickup' },
      dispensed: { class: 'status-dispensed', label: 'Dispensed' }
    };
    
    const config = statusConfig[status] || { class: 'status-pending', label: status };
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  const getActionButtons = (prescription) => {
    switch (prescription.pharmacy_status) {
      case 'pending':
        return (
          <button 
            onClick={() => updatePrescriptionStatus(prescription.id, 'preparing')}
            className="action-button start-button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            Start Preparing
          </button>
        );
      case 'preparing':
        return (
          <button 
            onClick={() => updatePrescriptionStatus(prescription.id, 'ready')}
            className="action-button ready-button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            Mark Ready
          </button>
        );
      case 'ready':
        return (
          <button 
            onClick={() => updatePrescriptionStatus(prescription.id, 'dispensed')}
            className="action-button dispense-button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            Mark Dispensed
          </button>
        );
      case 'dispensed':
        return <span className="completed-text">Medicine Dispensed</span>;
      default:
        return null;
    }
  };

  const handleClosePrescription = () => {
    setCurrentPrescription(null);
    setSearchSlipNumber('');
    setActiveTab('prescriptions');
  };

  const handleViewPrescription = (prescription) => {
    const token = localStorage.getItem('token');
    
    fetch(`http://localhost:5000/api/patients/slip/${prescription.slip_number}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.json())
    .then(patient => {
      // Parse medicine_list if needed
      if (prescription.medicine_list && typeof prescription.medicine_list === 'string') {
        try {
          prescription.medicine_list = JSON.parse(prescription.medicine_list);
        } catch (e) {
          console.error('Error parsing medicine list:', e);
          prescription.medicine_list = [];
        }
      }
      setCurrentPrescription({ prescription, patient });
      setActiveTab('view');
    })
    .catch(err => {
      console.error('Error fetching patient details:', err);
      alert('Error loading patient details');
    });
  };

  const navItems = [
    { id: 'prescriptions', label: 'Prescriptions', icon: 'prescriptions' },
    { id: 'search', label: 'Search Prescription', icon: 'search' },
    { id: 'view', label: 'View Prescription', icon: 'view', disabled: !currentPrescription }
  ];

  const getIcon = (iconName) => {
    const icons = {
      prescriptions: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
        </svg>
      ),
      search: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
      ),
      view: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
        </svg>
      )
    };
    return icons[iconName] || icons.prescriptions;
  };

  // Helper function to render medicine list safely
  const renderMedicineList = (medicineList) => {
    if (!medicineList) return [];
    
    if (typeof medicineList === 'string') {
      try {
        return JSON.parse(medicineList);
      } catch (e) {
        console.error('Error parsing medicine list:', e);
        return [];
      }
    }
    
    return medicineList || [];
  };

  if (loading && activeTab !== 'view') {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading pharmacy portal...</p>
      </div>
    );
  }

  return (
    <div className="pharmacy-container">
      <header className="pharmacy-header">
        <div className="header-content">
          <div className="header-info">
            <h1 className="clinic-title">Pharmacy Management System</h1>
            <p className="welcome-text">Welcome, <span className="user-name">{user?.name}</span></p>
          </div>
          <div className="header-actions">
            <div className="user-profile">
              <div className="profile-avatar">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="profile-info">
                <span className="profile-name">{user?.name}</span>
                <span className="profile-role">Pharmacist</span>
              </div>
            </div>
            <button onClick={logout} className="logout-button">
              <svg className="logout-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <nav className="pharmacy-navigation">
        <div className="nav-container">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'nav-item-active' : ''} ${item.disabled ? 'nav-item-disabled' : ''}`}
              onClick={() => !item.disabled && setActiveTab(item.id)}
              disabled={item.disabled}
            >
              <span className="nav-icon">{getIcon(item.icon)}</span>
              <span className="nav-label">{item.label}</span>
              {activeTab === item.id && <div className="nav-indicator"></div>}
            </button>
          ))}
        </div>
      </nav>

      <main className="pharmacy-main">
        <div className="main-content">
          {activeTab === 'search' && (
            <div className="content-section">
              <div className="section-header">
                <h2>Search Prescription</h2>
                <p>Find prescriptions using slip number</p>
              </div>
              
              <div className="search-container">
                <div className="search-card">
                  {error && <div className="error-message">{error}</div>}
                  
                  <form onSubmit={handleSearchPrescription} className="search-form">
                    <div className="form-group">
                      <label className="form-label">Slip Number</label>
                      <input
                        type="text"
                        value={searchSlipNumber}
                        onChange={(e) => setSearchSlipNumber(e.target.value.toUpperCase())}
                        required
                        placeholder="Enter slip number (e.g., SL123456789)"
                        className="form-input"
                      />
                      <div className="input-helper">Enter the patient's unique slip number</div>
                    </div>
                    
                    <button type="submit" disabled={loading} className="search-button">
                      <span className="button-text">{loading ? 'Searching...' : 'Find Prescription'}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                      </svg>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="content-section">
              <div className="section-header">
                <div className="section-title">
                  <h2>Prescription Management</h2>
                  <p>Total prescriptions: {prescriptions.length}</p>
                </div>
                <button onClick={fetchPrescriptions} className="action-button refresh-button">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                  </svg>
                  Refresh
                </button>
              </div>

              <div className="prescriptions-grid">
                {prescriptions.map(prescription => {
                  const medicineList = renderMedicineList(prescription.medicine_list);
                  
                  return (
                    <div key={prescription.id} className="prescription-card">
                      <div className="card-header">
                        <div className="patient-info">
                          <h4 className="patient-name" title={prescription.patient_name}>
                            {prescription.patient_name}
                          </h4>
                          <div className="patient-details">
                            <span className="detail-item">{prescription.patient_contact}</span>
                            <span className="detail-separator">•</span>
                            <span className="detail-item">{prescription.patient_gender}</span>
                            <span className="detail-separator">•</span>
                            <span className="detail-item">
                              {new Date(prescription.patient_dob).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="slip-number" title={prescription.slip_number}>
                            Slip: {prescription.slip_number}
                          </div>
                        </div>
                        <div className="status-section">
                          {getStatusBadge(prescription.pharmacy_status || 'pending')}
                          <div className="doctor-info" title={`Dr. ${prescription.doctor_name}`}>
                            Dr. {prescription.doctor_name}
                          </div>
                        </div>
                      </div>

                      <div className="medicines-section">
                        <h5 className="section-title">
                          Medications <span className="count-badge">{medicineList.length}</span>
                        </h5>
                        <div className="medicines-list">
                          {medicineList.length > 0 ? (
                            medicineList.map((medicine, index) => (
                              <div key={index} className="medicine-item">
                                <div className="medicine-info">
                                  <span className="medicine-name" title={medicine.name}>
                                    {medicine.name}
                                  </span>
                                  <span className="medicine-specs">
                                    {medicine.dosage && <span>{medicine.dosage}</span>}
                                    {medicine.frequency && <span> • {medicine.frequency}</span>}
                                    {medicine.duration && <span> • {medicine.duration}</span>}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="no-medicines">No medications listed</div>
                          )}
                        </div>
                      </div>

                      {prescription.notes && (
                        <div className="notes-section">
                          <h5 className="section-title">Clinical Notes</h5>
                          <p className="notes-text" title={prescription.notes}>
                            {prescription.notes}
                          </p>
                        </div>
                      )}

                      <div className="card-footer">
                        <div className="prescription-meta">
                          <span className="timestamp" title={new Date(prescription.visit_date).toLocaleString()}>
                            {new Date(prescription.visit_date).toLocaleString()}
                          </span>
                        </div>
                        <div className="action-group">
                          <button 
                            onClick={() => handleViewPrescription(prescription)}
                            className="action-button view-button"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                            </svg>
                            View Details
                          </button>
                          {getActionButtons(prescription)}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {prescriptions.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                      </svg>
                    </div>
                    <h3>No Prescriptions Found</h3>
                    <p>There are no prescriptions to display at the moment.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'view' && currentPrescription && (
            <div className="content-section">
              <div className="section-header">
                <div className="section-title">
                  <h2>Prescription Details</h2>
                  <p>Review and manage prescription information</p>
                </div>
                <div className="section-actions">
                  <button onClick={handleClosePrescription} className="action-button back-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                    </svg>
                    Back to Prescriptions
                  </button>
                </div>
              </div>
              <ViewPrescription 
                prescription={currentPrescription.prescription}
                patient={currentPrescription.patient}
                onPrint={() => console.log('Prescription printed by pharmacist')}
                onClose={handleClosePrescription}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Pharmacy;
