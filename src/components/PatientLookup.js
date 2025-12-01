import React, { useState } from 'react';
import '../styles/PatientLookup.css';

const PatientLookup = ({ onPatientFound }) => {
  const [slipNumber, setSlipNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://72.60.193.192:5000/api/patients/slip/${slipNumber}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        onPatientFound(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch patient details');
    }
    setLoading(false);
  };

  return (
    <div className="patient-lookup-container">
      <div className="lookup-card">
        <div className="card-header">
          <div className="header-accent"></div>
          <div className="title-section">
            <h2 className="card-title">Patient Lookup</h2>
            <p className="card-subtitle">Find patient records using slip number</p>
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
        
        <form onSubmit={handleSubmit} className="lookup-form">
          <div className="form-group">
            <label className="form-label">
              <span className="label-text">Slip Number</span>
              <span className="required-indicator">*</span>
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                value={slipNumber}
                onChange={(e) => setSlipNumber(e.target.value.toUpperCase())}
                required
                placeholder="Enter slip number (e.g., SL123456789)"
                className="modern-input"
                disabled={loading}
              />
              <div className="input-focus-indicator"></div>
            </div>
            <div className="input-hint">Enter the unique slip identifier provided during registration</div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            className={`search-button ${loading ? 'loading-state' : ''}`}
          >
            <span className="button-content">
              <span className="button-text">
                {loading ? 'Searching Patient Records' : 'Search Patient'}
              </span>
              {loading && (
                <div className="loading-indicator">
                  <div className="loading-spinner"></div>
                </div>
              )}
            </span>
          </button>
        </form>
        
        <div className="process-guide">
          <h4 className="guide-title">Lookup Process</h4>
          <div className="guide-steps">
            <div className="guide-step">
              <div className="step-indicator">
                <div className="step-number">1</div>
                <div className="step-connector"></div>
              </div>
              <div className="step-content">
                <h5 className="step-title">Enter Slip Number</h5>
                <p className="step-description">Input the unique slip identifier provided to the patient</p>
              </div>
            </div>
            <div className="guide-step">
              <div className="step-indicator">
                <div className="step-number">2</div>
                <div className="step-connector"></div>
              </div>
              <div className="step-content">
                <h5 className="step-title">Verify Patient Details</h5>
                <p className="step-description">System retrieves patient information and visit history</p>
              </div>
            </div>
            <div className="guide-step">
              <div className="step-indicator">
                <div className="step-number">3</div>
              </div>
              <div className="step-content">
                <h5 className="step-title">Proceed to Consultation</h5>
                <p className="step-description">Begin medical examination and prescription process</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientLookup;
