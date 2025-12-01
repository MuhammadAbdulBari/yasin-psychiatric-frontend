import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PatientForm from '../components/PatientForm';
import SlipPrint from '../components/SlipPrint';
import ViewPrescription from '../components/ViewPrescription';
import PatientsList from '../components/PatientsList';
import '../styles/Reception.css';

const Reception = () => {
  const { user, logout } = useAuth();
  const [currentSlip, setCurrentSlip] = useState(null);
  const [currentPrescription, setCurrentPrescription] = useState(null);
  const [viewingPatient, setViewingPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchSlipNumber, setSearchSlipNumber] = useState('');
  const [activeTab, setActiveTab] = useState('registration');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'prescriptions') {
      fetchPrescriptions();
    }
  }, [activeTab]);

  const fetchPrescriptions = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    
    try {
      const response = await fetch('http://72.60.193.192:5000/api/prescriptions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPrescriptions(data);
      }
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
    }
    setLoading(false);
  };

  const handlePatientRegistered = (slipData) => {
    setCurrentSlip(slipData);
    setActiveTab('slip');
  };

  const handleNewRegistration = () => {
    setCurrentSlip(null);
    setCurrentPrescription(null);
    setActiveTab('registration');
  };

  const handleViewPrescription = async (slipNumber) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://72.60.193.192:5000/api/prescriptions/slip/${slipNumber}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const prescription = await response.json();
        
        const patientResponse = await fetch(`http://72.60.193.192:5000/api/patients/slip/${slipNumber}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (patientResponse.ok) {
          const patient = await patientResponse.json();
          setCurrentPrescription({ prescription, patient });
          setActiveTab('view-prescription');
        }
      } else {
        alert('No prescription found for this slip number.');
      }
    } catch (err) {
      alert('Error fetching prescription details.');
    }
  };

  const handleSearchBySlip = () => {
    if (searchSlipNumber.trim()) {
      handleViewPrescription(searchSlipNumber.trim());
    } else {
      alert('Please enter a slip number');
    }
  };

  const handleViewPatient = (patient) => {
    setViewingPatient(patient);
    setActiveTab('patient-details');
  };

  const handleViewPrescriptionFromList = (prescription) => {
    const token = localStorage.getItem('token');
    
    fetch(`http://72.60.193.192:5000/api/patients/slip/${prescription.slip_number}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.json())
    .then(patient => {
      setCurrentPrescription({ prescription, patient });
      setActiveTab('view-prescription');
    })
    .catch(err => {
      console.error('Error fetching patient details:', err);
    });
  };

  const navItems = [
    { id: 'registration', label: 'New Registration', icon: '📝' },
    { id: 'patients', label: 'All Patients', icon: '👥' },
    { id: 'prescriptions', label: 'All Prescriptions', icon: '💊' },
    { id: 'search-prescription', label: 'Find Prescription', icon: '🔍' },
    { id: 'slip', label: 'Print Slip', icon: '🖨️', disabled: !currentSlip },
    { id: 'view-prescription', label: 'View Prescription', icon: '📄', disabled: !currentPrescription }
  ];

  return (
    <div className="reception-container">
      <header className="reception-header">
        <div className="header-content">
          <div className="header-info">
            <h1 className="clinic-title">Receptionist Portal</h1>
            <p className="welcome-text">Welcome back, <span className="user-name">{user?.name}</span></p>
          </div>
          <div className="header-actions">
            <div className="user-badge">
              <div className="user-avatar">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="user-role">Reception</span>
            </div>
            <button onClick={logout} className="logout-btn">
              <span className="logout-icon">↩</span>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <nav className="reception-nav">
        <div className="nav-container">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'nav-item-active' : ''} ${item.disabled ? 'nav-item-disabled' : ''}`}
              onClick={() => !item.disabled && setActiveTab(item.id)}
              disabled={item.disabled}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {activeTab === item.id && <div className="nav-indicator"></div>}
            </button>
          ))}
        </div>
      </nav>

      <main className="reception-main">
        <div className="main-content">
          {activeTab === 'registration' && (
            <div className="content-section">
              <div className="section-header">
                <h2>Patient Registration</h2>
                <p>Register new patients and generate consultation slips</p>
              </div>
              <PatientForm onPatientRegistered={handlePatientRegistered} />
            </div>
          )}
          
          {activeTab === 'patients' && (
            <div className="content-section">
              <div className="section-header">
                <h2>Patient Records</h2>
                <p>View and manage all patient information</p>
              </div>
              <PatientsList 
                onViewPatient={handleViewPatient}
                onViewPrescriptions={handleViewPatient}
              />
            </div>
          )}
          
          {activeTab === 'prescriptions' && (
            <div className="content-section">
              <div className="section-header">
                <div className="section-title">
                  <h2>Medical Prescriptions</h2>
                  <p>All doctor prescriptions and medication records</p>
                </div>
                <button onClick={fetchPrescriptions} className="refresh-button">
                  <span className="refresh-icon">🔄</span>
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading prescriptions...</p>
                </div>
              ) : (
                <div className="prescriptions-grid">
                  {prescriptions.map(prescription => (
                    <div key={prescription.id} className="prescription-card">
                      <div className="card-header">
                        <div className="patient-info">
                          <h4 className="patient-name">{prescription.patient_name}</h4>
                          <div className="patient-meta">
                            <span className="contact-info">{prescription.patient_contact}</span>
                            <span className="slip-number">Slip: {prescription.slip_number}</span>
                          </div>
                        </div>
                        <div className="doctor-info">
                          <span className="doctor-name">Dr. {prescription.doctor_name}</span>
                        </div>
                      </div>

                      <div className="card-content">
                        <div className="medicine-count">
                          <span className="count-badge">{prescription.medicine_list?.length || 0}</span>
                          <span>Medications</span>
                        </div>
                        {prescription.notes && (
                          <div className="prescription-notes">
                            <p>{prescription.notes.substring(0, 60)}...</p>
                          </div>
                        )}
                      </div>

                      <div className="card-footer">
                        <span className="visit-date">
                          {new Date(prescription.visit_date).toLocaleString()}
                        </span>
                        <button 
                          onClick={() => handleViewPrescriptionFromList(prescription)}
                          className="view-prescription-btn"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}

                  {prescriptions.length === 0 && (
                    <div className="empty-state">
                      <div className="empty-icon">📋</div>
                      <h3>No Prescriptions Found</h3>
                      <p>There are no prescriptions in the system yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'search-prescription' && (
            <div className="content-section">
              <div className="section-header">
                <h2>Prescription Search</h2>
                <p>Find prescriptions using slip numbers</p>
              </div>
              <div className="search-container">
                <div className="search-card">
                  <h3>Search by Slip Number</h3>
                  <div className="search-form">
                    <div className="input-group">
                      <input
                        type="text"
                        value={searchSlipNumber}
                        onChange={(e) => setSearchSlipNumber(e.target.value.toUpperCase())}
                        placeholder="Enter slip number (e.g., SL123456789)"
                        className="search-input"
                      />
                      <button onClick={handleSearchBySlip} className="search-button">
                        Search Records
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'slip' && currentSlip && (
            <div className="content-section">
              <div className="section-header">
                <h2>Consultation Slip</h2>
                <p>Print patient consultation slip</p>
              </div>
              <SlipPrint 
                slipData={currentSlip} 
                onNewRegistration={handleNewRegistration}
                onViewPrescription={() => handleViewPrescription(currentSlip.slipNumber)}
              />
            </div>
          )}
          
          {activeTab === 'view-prescription' && currentPrescription && (
            <div className="content-section">
              <div className="section-header">
                <h2>Prescription Details</h2>
                <p>View and manage prescription information</p>
              </div>
              <ViewPrescription 
                prescription={currentPrescription.prescription}
                patient={currentPrescription.patient}
                onPrint={() => console.log('Prescription printed by receptionist')}
                onClose={handleNewRegistration}
              />
            </div>
          )}
          
          {activeTab === 'patient-details' && viewingPatient && (
            <div className="content-section">
              <div className="section-header">
                <div className="section-title">
                  <h2>Patient Information</h2>
                  <p>Detailed patient records and history</p>
                </div>
                <button onClick={() => setActiveTab('patients')} className="back-button">
                  Back to Patients
                </button>
              </div>
              <div className="patient-details-container">
                <div className="patient-profile-card">
                  <div className="profile-header">
                    <div className="patient-avatar">
                      {viewingPatient.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="patient-title">
                      <h3>{viewingPatient.name}</h3>
                      <p>Patient ID: #{viewingPatient.id}</p>
                    </div>
                  </div>
                  <div className="patient-details-grid">
                    <div className="detail-item">
                      <label>Contact Information</label>
                      <span>{viewingPatient.contact}</span>
                    </div>
                    <div className="detail-item">
                      <label>Gender</label>
                      <span>{viewingPatient.gender}</span>
                    </div>
                    <div className="detail-item">
                      <label>Date of Birth</label>
                      <span>{new Date(viewingPatient.dob).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-item">
                      <label>Total Visits</label>
                      <span className="visit-count">{viewingPatient.total_visits || 0}</span>
                    </div>
                    <div className="detail-item">
                      <label>Last Visit</label>
                      <span>{viewingPatient.last_visit ? new Date(viewingPatient.last_visit).toLocaleDateString() : 'Never visited'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Registration Date</label>
                      <span>{new Date(viewingPatient.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Reception;
