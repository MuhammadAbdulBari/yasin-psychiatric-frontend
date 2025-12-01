import React, { useState } from 'react';
import '../styles/PatientForm.css';

const PatientForm = ({ onPatientRegistered }) => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    gender: '',
    dob: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:5000/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        onPatientRegistered(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to register patient');
    }
    setLoading(false);
  };

  return (
    <div className="patient-form-container">
      <div className="registration-card">
        <div className="card-header">
          <div className="header-accent"></div>
          <div className="title-section">
            <h2 className="card-title">Patient Registration</h2>
            <p className="card-subtitle">Register new patients for medical consultation</p>
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
        
        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                <span className="label-text">Full Name</span>
                <span className="required-indicator">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter patient's full name"
                  className="modern-input"
                  disabled={loading}
                />
                <div className="input-focus-indicator"></div>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <span className="label-text">Contact Number</span>
                <span className="required-indicator">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  required
                  placeholder="Enter contact number"
                  className="modern-input"
                  disabled={loading}
                />
                <div className="input-focus-indicator"></div>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <span className="label-text">Gender</span>
                <span className="required-indicator">*</span>
              </label>
              <div className="select-wrapper">
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="modern-select"
                  disabled={loading}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <div className="select-arrow">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="input-focus-indicator"></div>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <span className="label-text">Date of Birth</span>
                <span className="required-indicator">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                  className="modern-input"
                  disabled={loading}
                />
                <div className="input-focus-indicator"></div>
              </div>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            className={`submit-button ${loading ? 'loading-state' : ''}`}
          >
            <span className="button-content">
              <span className="button-text">
                {loading ? 'Registering Patient' : 'Register Patient'}
              </span>
              {loading && (
                <div className="loading-indicator">
                  <div className="loading-spinner"></div>
                </div>
              )}
            </span>
          </button>
        </form>

        <div className="form-footer">
          <div className="privacy-notice">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M8 1a7 7 0 00-7 7v3l-1 1 1 1h12l1-1-1-1V8a7 7 0 00-7-7zM6 11a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd" />
            </svg>
            <span>Patient information is secured and confidential</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientForm;