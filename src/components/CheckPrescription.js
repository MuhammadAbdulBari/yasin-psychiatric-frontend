import React, { useState } from 'react';
import '../styles/CheckPrescription.css';

const CheckPrescription = ({ onPrescriptionFound }) => {
  const [slipNumber, setSlipNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkPrescription = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');

    try {
      const patientResponse = await fetch(`http://72.60.193.192:5000/api/patients/slip/${slipNumber}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const patientData = await patientResponse.json();

      if (!patientResponse.ok) {
        setError(patientData.error);
        setLoading(false);
        return;
      }

      const prescriptionResponse = await fetch(`http://72.60.193.192:5000/api/prescriptions/slip/${slipNumber}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const prescriptionData = await prescriptionResponse.ok ? await prescriptionResponse.json() : null;

      if (prescriptionData) {
        onPrescriptionFound({
          ...patientData,
          prescription: prescriptionData
        });
      } else {
        setError('No prescription found for this slip number. Please ensure the doctor has submitted the prescription.');
      }
    } catch (err) {
      setError('Failed to check prescription');
    }
    setLoading(false);
  };

  return (
    <div className="check-prescription-container">
      <div className="verification-card">
        <div className="card-header">
          <div className="header-accent"></div>
          <div className="title-section">
            <h2 className="card-title">Prescription Verification</h2>
            <p className="card-subtitle">Verify and process patient prescriptions</p>
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
        
        <form onSubmit={checkPrescription} className="verification-form">
          <div className="form-group">
            <label className="form-label">Slip Number</label>
            <div className="input-wrapper">
              <input
                type="text"
                value={slipNumber}
                onChange={(e) => setSlipNumber(e.target.value.toUpperCase())}
                required
                placeholder="Enter patient slip number"
                className="modern-input"
                disabled={loading}
              />
              <div className="input-focus-indicator"></div>
            </div>
            <div className="input-hint">Enter the unique slip identifier provided to the patient</div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            className={`verify-button ${loading ? 'loading-state' : ''}`}
          >
            <span className="button-content">
              <span className="button-text">
                {loading ? 'Verifying Prescription' : 'Verify Prescription'}
              </span>
              {loading && (
                <div className="loading-indicator">
                  <div className="loading-spinner"></div>
                </div>
              )}
            </span>
          </button>
        </form>
        
        <div className="workflow-guide">
          <h4 className="guide-title">Prescription Processing Workflow</h4>
          <div className="workflow-steps">
            <div className="workflow-step">
              <div className="step-indicator">
                <div className="step-number">1</div>
                <div className="step-connector"></div>
              </div>
              <div className="step-content">
                <h5 className="step-title">Slip Number Entry</h5>
                <p className="step-description">Input the patient's unique consultation slip identifier</p>
              </div>
            </div>
            <div className="workflow-step">
              <div className="step-indicator">
                <div className="step-number">2</div>
                <div className="step-connector"></div>
              </div>
              <div className="step-content">
                <h5 className="step-title">Prescription Validation</h5>
                <p className="step-description">System verifies doctor's prescription submission and availability</p>
              </div>
            </div>
            <div className="workflow-step">
              <div className="step-indicator">
                <div className="step-number">3</div>
                <div className="step-connector"></div>
              </div>
              <div className="step-content">
                <h5 className="step-title">Medication Review</h5>
                <p className="step-description">Check medication availability and prepare dispensing</p>
              </div>
            </div>
            <div className="workflow-step">
              <div className="step-indicator">
                <div className="step-number">4</div>
              </div>
              <div className="step-content">
                <h5 className="step-title">Billing & Dispensing</h5>
                <p className="step-description">Generate invoice and complete medication dispensing process</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckPrescription;
