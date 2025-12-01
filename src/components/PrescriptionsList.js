import React, { useState, useEffect } from 'react';
import '../styles/PrescriptionsList.css';

const PrescriptionsList = ({ onViewPrescription, onDeletePrescription }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('http://72.60.193.192:5000/api/prescriptions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched prescriptions from API:', data); // Debug
        setPrescriptions(data);
      } else {
        const errorData = await response.json();
        setError(`Failed to fetch prescriptions: ${errorData.error}`);
      }
    } catch (err) {
      setError('Failed to connect to server: ' + err.message);
    }
    setLoading(false);
  };

  const handleDeletePrescription = async (prescriptionId, patientName) => {
    if (window.confirm(`Are you sure you want to delete prescription for "${patientName}"?`)) {
      const token = localStorage.getItem('token');
      
      try {
        const response = await fetch(`http://72.60.193.192:5000/api/prescriptions/${prescriptionId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setPrescriptions(prescriptions.filter(p => p.id !== prescriptionId));
          if (onDeletePrescription) {
            onDeletePrescription(prescriptionId);
          }
          alert('Prescription deleted successfully!');
        } else {
          const data = await response.json();
          alert(`Failed to delete prescription: ${data.error}`);
        }
      } catch (err) {
        alert('Failed to delete prescription: ' + err.message);
      }
    }
  };

  // Helper function to safely get medicine count
  const getMedicineCount = (prescription) => {
    if (!prescription.medicine_list) {
      console.log('No medicine_list for prescription:', prescription.id);
      return 0;
    }
    
    if (Array.isArray(prescription.medicine_list)) {
      const count = prescription.medicine_list.length;
      console.log(`Prescription ${prescription.id} has ${count} medicines:`, prescription.medicine_list);
      return count;
    }
    
    console.log('medicine_list is not an array for prescription:', prescription.id, 'Type:', typeof prescription.medicine_list);
    return 0;
  };

  // Helper function to get medicine names for display
  const getMedicineNames = (prescription) => {
    if (!prescription.medicine_list || !Array.isArray(prescription.medicine_list)) {
      return 'No medicines prescribed';
    }
    
    if (prescription.medicine_list.length === 0) {
      return 'No medicines prescribed';
    }
    
    // Get first 2 medicine names
    const firstMedicines = prescription.medicine_list.slice(0, 2).map(med => med.name || 'Unknown').join(', ');
    
    if (prescription.medicine_list.length > 2) {
      return `${firstMedicines} +${prescription.medicine_list.length - 2} more`;
    }
    
    return firstMedicines;
  };

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.slip_number?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading prescription records...</p>
      </div>
    );
  }

  return (
    <div className="prescriptions-list-container">
      <div className="prescriptions-header">
        <div className="header-content">
          <h2>Medical Prescriptions</h2>
          <p>View and manage all prescription records</p>
        </div>
        <div className="prescriptions-actions">
          <div className="search-container">
            <div className="search-input-wrapper">
              <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input
                type="text"
                placeholder="Search by patient name, doctor, or slip number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          <button onClick={fetchPrescriptions} className="refresh-button">
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
            <span className="total-count">Total Prescriptions: {prescriptions.length}</span>
            <span className="medicines-count">
              Total Medicines: {prescriptions.reduce((total, prescription) => total + getMedicineCount(prescription), 0)}
            </span>
            {searchTerm && (
              <span className="filtered-count">Filtered Results: {filteredPrescriptions.length}</span>
            )}
          </div>
        </div>
        
        <div className="table-wrapper">
          <table className="prescriptions-table">
            <thead>
              <tr>
                <th className="column-slip">Slip Number</th>
                <th className="column-patient">Patient Details</th>
                <th className="column-doctor">Medical Officer</th>
                <th className="column-medicines">Prescribed Medications</th>
                <th className="column-count">Medication Count</th>
                <th className="column-date">Consultation Date</th>
                <th className="column-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrescriptions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    <div className="empty-state">
                      <svg className="empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                      </svg>
                      <h3>No Prescriptions Found</h3>
                      <p>{searchTerm ? 'No prescriptions match your search criteria' : 'No prescriptions have been created yet'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPrescriptions.map(prescription => {
                  const medicineCount = getMedicineCount(prescription);
                  const medicineNames = getMedicineNames(prescription);
                  
                  return (
                    <tr key={prescription.id} className="prescription-row">
                      <td className="slip-number">
                        <span className="slip-badge">{prescription.slip_number}</span>
                      </td>
                      <td className="patient-info">
                        <div className="patient-details">
                          <span className="patient-name">{prescription.patient_name}</span>
                          <span className="patient-contact">{prescription.patient_contact}</span>
                        </div>
                      </td>
                      <td className="doctor-info">
                        <div className="doctor-details">
                          <span className="doctor-name">Dr. {prescription.doctor_name}</span>
                        </div>
                      </td>
                      <td className="medicines-info">
                        <span className="medicines-text" title={medicineNames}>
                          {medicineNames}
                        </span>
                      </td>
                      <td className="medicines-count">
                        <div className="count-display">
                          <span className={`count-number ${medicineCount === 0 ? 'count-empty' : ''}`}>
                            {medicineCount}
                          </span>
                          <span className="count-label">medications</span>
                        </div>
                      </td>
                      <td className="visit-date">
                        <span className="date-text">
                          {new Date(prescription.visit_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="prescription-actions">
                        <div className="action-buttons">
                          <button 
                            onClick={() => onViewPrescription(prescription)}
                            className="action-btn view-btn"
                            title="View prescription details"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                            </svg>
                            View
                          </button>
                          <button 
                            onClick={() => handleDeletePrescription(prescription.id, prescription.patient_name)}
                            className="action-btn delete-btn"
                            title="Delete prescription"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionsList;
