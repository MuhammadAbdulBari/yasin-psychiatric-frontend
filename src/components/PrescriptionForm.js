import React, { useState } from 'react';
import '../styles/PrescriptionForm.css';

const PrescriptionForm = ({ patient, onPrescriptionSaved }) => {
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', frequency: '', duration: '' }]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const updateMedicine = (index, field, value) => {
    const updatedMedicines = medicines.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    );
    setMedicines(updatedMedicines);
  };

  const removeMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    const prescriptionData = {
      slip_id: patient.slip_id,
      medicine_list: medicines.filter(med => med.name.trim() !== ''),
      notes
    };

    try {
      const response = await fetch('http://72.60.193.192:5000/api/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(prescriptionData)
      });

      const data = await response.json();

      if (response.ok) {
        onPrescriptionSaved();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to save prescription');
    }
    setLoading(false);
  };

  return (
    <div className="prescription-form-container">
      <div className="prescription-card">
        <div className="card-header">
          <div className="header-accent"></div>
          <div className="title-section">
            <h2 className="card-title">Medical Prescription</h2>
            <p className="card-subtitle">Create prescription for patient consultation</p>
          </div>
        </div>
        
        <div className="patient-info-section">
          <div className="section-header">
            <h3 className="section-title">Patient Information</h3>
          </div>
          <div className="patient-details-grid">
            <div className="detail-item">
              <span className="detail-label">Full Name</span>
              <span className="detail-value">{patient.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Contact Number</span>
              <span className="detail-value">{patient.contact}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Gender</span>
              <span className="detail-value">{patient.gender}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Date of Birth</span>
              <span className="detail-value">{new Date(patient.dob).toLocaleDateString()}</span>
            </div>
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
        
        <form onSubmit={handleSubmit} className="prescription-form">
          <div className="medicines-section">
            <div className="section-header">
              <h3 className="section-title">Medication Details</h3>
              <button type="button" onClick={addMedicine} className="add-medicine-button">
                <svg className="add-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Add Medication
              </button>
            </div>
            
            <div className="medicines-grid">
              {medicines.map((medicine, index) => (
                <div key={index} className="medicine-card">
                  <div className="medicine-header">
                    <span className="medicine-number">Medication {index + 1}</span>
                    {medicines.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeMedicine(index)}
                        className="remove-medicine-button"
                        title="Remove medication"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="medicine-fields">
                    <div className="form-field">
                      <label className="field-label">Medicine Name</label>
                      <input
                        type="text"
                        placeholder="Enter medicine name"
                        value={medicine.name}
                        onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                        className="field-input"
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label className="field-label">Dosage</label>
                      <input
                        type="text"
                        placeholder="e.g., 500mg"
                        value={medicine.dosage}
                        onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                        className="field-input"
                      />
                    </div>
                    <div className="form-field">
                      <label className="field-label">Frequency</label>
                      <input
                        type="text"
                        placeholder="e.g., 2 times daily"
                        value={medicine.frequency}
                        onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                        className="field-input"
                      />
                    </div>
                    <div className="form-field">
                      <label className="field-label">Duration</label>
                      <input
                        type="text"
                        placeholder="e.g., 7 days"
                        value={medicine.duration}
                        onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                        className="field-input"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="notes-section">
            <div className="section-header">
              <h3 className="section-title">Clinical Notes</h3>
            </div>
            <div className="form-field">
              <label className="field-label">Diagnosis & Instructions</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter diagnosis, treatment instructions, follow-up recommendations..."
                rows="5"
                className="notes-textarea"
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              disabled={loading} 
              className={`submit-button ${loading ? 'loading-state' : ''}`}
            >
              <span className="button-content">
                <span className="button-text">
                  {loading ? 'Saving Prescription' : 'Save Prescription'}
                </span>
                {loading && (
                  <div className="loading-indicator">
                    <div className="loading-spinner"></div>
                  </div>
                )}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrescriptionForm;
