import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PatientLookup from '../components/PatientLookup';
import PrescriptionForm from '../components/PrescriptionForm';
import ViewPrescription from '../components/ViewPrescription';
import PatientsList from '../components/PatientsList';
import PrescriptionsList from '../components/PrescriptionsList';
import '../styles/Doctor.css';

const Doctor = () => {
  const { user, logout } = useAuth();
  const [currentPatient, setCurrentPatient] = useState(null);
  const [currentPrescription, setCurrentPrescription] = useState(null);
  const [viewingPatient, setViewingPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('patients');

  const handlePatientFound = (patient) => {
    setCurrentPatient(patient);
    checkExistingPrescription(patient.slip_number);
  };

  const checkExistingPrescription = async (slipNumber) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://localhost:5000/api/prescriptions/slip/${slipNumber}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const prescription = await response.json();
        setCurrentPrescription(prescription);
        setActiveTab('view');
      } else {
        setCurrentPrescription(null);
        setActiveTab('prescription');
      }
    } catch (err) {
      setCurrentPrescription(null);
      setActiveTab('prescription');
    }
  };

  const handlePrescriptionSaved = () => {
    checkExistingPrescription(currentPatient.slip_number);
    setActiveTab('view');
  };

  const handleViewPatient = (patient) => {
    setViewingPatient(patient);
    setActiveTab('patient-details');
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
      setCurrentPrescription(prescription);
      setCurrentPatient(patient);
      setActiveTab('view');
    })
    .catch(err => {
      console.error('Error fetching patient details:', err);
    });
  };

  const navItems = [
    { id: 'patients', label: 'Patient Records', icon: 'patients' },
    { id: 'prescriptions', label: 'Prescriptions', icon: 'prescriptions' },
    { id: 'lookup', label: 'Find Patient', icon: 'search' },
    { id: 'prescription', label: 'Write Prescription', icon: 'prescribe', disabled: !currentPatient },
    { id: 'view', label: 'View Prescription', icon: 'view', disabled: !currentPrescription }
  ];

  const getIcon = (iconName) => {
    const icons = {
      patients: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
        </svg>
      ),
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
      prescribe: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        </svg>
      ),
      view: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
        </svg>
      )
    };
    return icons[iconName] || icons.patients;
  };

  return (
    <div className="doctor-container">
      <header className="doctor-header">
        <div className="header-content">
          <div className="header-info">
            <h1 className="clinic-title">Doctor Portal</h1>
            <p className="welcome-text">Welcome back, <span className="doctor-name">Dr. {user?.name}</span></p>
          </div>
          <div className="header-actions">
            <div className="user-profile">
              <div className="profile-avatar">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="profile-info">
                <span className="profile-name">Dr. {user?.name}</span>
                <span className="profile-role">Medical Officer</span>
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

      <nav className="doctor-navigation">
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

      <main className="doctor-main">
        <div className="main-content">
          {activeTab === 'patients' && (
            <div className="content-section">
              <div className="section-header">
                <h2>Patient Records</h2>
                <p>Manage and review all patient information</p>
              </div>
              <PatientsList 
                onViewPatient={handleViewPatient}
                onViewPrescriptions={handleViewPatient}
                onDeletePatient={() => {/* Optional: handle deletion */}}
              />
            </div>
          )}
          
          {activeTab === 'prescriptions' && (
            <div className="content-section">
              <div className="section-header">
                <h2>Medical Prescriptions</h2>
                <p>View and manage all prescription records</p>
              </div>
              <PrescriptionsList 
                onViewPrescription={handleViewPrescription}
                onDeletePrescription={() => {/* Optional: handle deletion */}}
              />
            </div>
          )}
          
          {activeTab === 'lookup' && (
            <div className="content-section">
              <div className="section-header">
                <h2>Patient Lookup</h2>
                <p>Find patient records for consultation</p>
              </div>
              <PatientLookup onPatientFound={handlePatientFound} />
            </div>
          )}
          
          {activeTab === 'prescription' && currentPatient && (
            <div className="content-section">
              <div className="section-header">
                <h2>Create Prescription</h2>
                <p>Write medical prescription for patient consultation</p>
              </div>
              <PrescriptionForm 
                patient={currentPatient}
                onPrescriptionSaved={handlePrescriptionSaved}
                onCancel={() => setActiveTab('lookup')}
              />
            </div>
          )}
          
          {activeTab === 'view' && currentPrescription && currentPatient && (
            <div className="content-section">
              <div className="section-header">
                <div className="section-title">
                  <h2>Prescription Details</h2>
                  <p>Review and manage prescription information</p>
                </div>
                <div className="section-actions">
                  <button onClick={() => setActiveTab('prescription')} className="action-button edit-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                    Edit Prescription
                  </button>
                  <button onClick={() => setActiveTab('lookup')} className="action-button back-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                    </svg>
                    Back to Search
                  </button>
                </div>
              </div>
              <ViewPrescription 
                prescription={currentPrescription}
                patient={currentPatient}
                onClose={() => setActiveTab('lookup')}
              />
            </div>
          )}
          
          {activeTab === 'patient-details' && viewingPatient && (
            <div className="content-section">
              <div className="section-header">
                <div className="section-title">
                  <h2>Patient Information</h2>
                  <p>Detailed patient records and medical history</p>
                </div>
                <button onClick={() => setActiveTab('patients')} className="action-button back-button">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                  </svg>
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

export default Doctor;