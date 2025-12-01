import React, { useState, useEffect } from 'react';
import '../styles/PatientsList.css';

const PatientsList = ({ onViewPatient, onViewPrescriptions, onDeletePatient }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('http://72.60.193.192:5000/api/patients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      } else {
        setError('Failed to fetch patients');
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
    setLoading(false);
  };

  const handleDeletePatient = async (patientId, patientName) => {
    if (window.confirm(`Are you sure you want to delete patient "${patientName}"? This will also delete all their prescriptions and visit records.`)) {
      const token = localStorage.getItem('token');
      
      try {
        const response = await fetch(`http://72.60.193.192:5000/api/patients/${patientId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setPatients(patients.filter(p => p.id !== patientId));
          if (onDeletePatient) {
            onDeletePatient(patientId);
          }
        } else {
          const data = await response.json();
          alert(`Failed to delete patient: ${data.error}`);
        }
      } catch (err) {
        alert('Failed to delete patient');
      }
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.contact.includes(searchTerm) ||
    patient.id.toString().includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading patient records...</p>
      </div>
    );
  }

  return (
    <div className="patients-list-container">
      <div className="patients-header">
        <div className="header-content">
          <h2>Patient Records</h2>
          <p>Manage and view all registered patients</p>
        </div>
        <div className="patients-actions">
          <div className="search-container">
            <div className="search-input-wrapper">
              <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input
                type="text"
                placeholder="Search patients by name, contact, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          <button onClick={fetchPatients} className="refresh-button">
            <svg className="refresh-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            Refresh Data
          </button>
        </div>
      </div>

      {error && (
        <div className="error-state">
          <div className="error-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="error-message">{error}</span>
        </div>
      )}

      <div className="table-container">
        <div className="table-header">
          <div className="table-stats">
            <span className="total-count">Total Patients: {patients.length}</span>
            {searchTerm && (
              <span className="filtered-count">Filtered: {filteredPatients.length}</span>
            )}
          </div>
        </div>
        
        <div className="table-wrapper">
          <table className="patients-table">
            <thead>
              <tr>
                <th className="column-id">ID</th>
                <th className="column-name">Patient Name</th>
                <th className="column-contact">Contact</th>
                <th className="column-gender">Gender</th>
                <th className="column-dob">Date of Birth</th>
                <th className="column-visits">Visits</th>
                <th className="column-last-visit">Last Visit</th>
                <th className="column-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">
                    <div className="empty-state">
                      <svg className="empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                      </svg>
                      <h3>No Patients Found</h3>
                      <p>{searchTerm ? 'No patients match your search criteria' : 'No patients have been registered yet'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPatients.map(patient => (
                  <tr key={patient.id} className="patient-row">
                    <td className="patient-id">
                      <span className="id-badge">#{patient.id}</span>
                    </td>
                    <td className="patient-name">
                      <div className="name-wrapper">
                        <span className="name-text">{patient.name}</span>
                      </div>
                    </td>
                    <td className="patient-contact">
                      <span className="contact-text">{patient.contact}</span>
                    </td>
                    <td className="patient-gender">
                      <span className={`gender-badge gender-${patient.gender}`}>
                        {patient.gender}
                      </span>
                    </td>
                    <td className="patient-dob">
                      {new Date(patient.dob).toLocaleDateString()}
                    </td>
                    <td className="patient-visits">
                      <div className="visits-count">
                        <span className="count-number">{patient.total_visits || 0}</span>
                        <span className="count-label">visits</span>
                      </div>
                    </td>
                    <td className="patient-last-visit">
                      <span className="last-visit-date">
                        {patient.last_visit ? new Date(patient.last_visit).toLocaleDateString() : 'Never visited'}
                      </span>
                    </td>
                    <td className="patient-actions">
                      <div className="action-buttons">
                        <button 
                          onClick={() => onViewPatient(patient)}
                          className="action-btn view-btn"
                          title="View patient details"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                          </svg>
                          Details
                        </button>
                        <button 
                          onClick={() => onViewPrescriptions(patient)}
                          className="action-btn prescriptions-btn"
                          title="View prescriptions"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                          </svg>
                          Prescriptions
                        </button>
                        <button 
                          onClick={() => handleDeletePatient(patient.id, patient.name)}
                          className="action-btn delete-btn"
                          title="Delete patient"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PatientsList;
