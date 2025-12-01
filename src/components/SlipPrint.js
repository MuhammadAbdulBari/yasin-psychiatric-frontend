import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import '../styles/SlipPrint.css';

const SlipPrint = ({ slipData, onNewRegistration, onViewPrescription }) => {
  const [patientDetails, setPatientDetails] = useState(null);

  useEffect(() => {
    // Fetch patient details using patientId from slipData
    const fetchPatientDetails = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://72.60.193.192:5000/api/patients/${slipData.patientId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const patient = await response.json();
          setPatientDetails(patient);
        }
      } catch (err) {
        console.error('Error fetching patient details:', err);
      }
    };

    if (slipData && slipData.patientId) {
      fetchPatientDetails();
    }
  }, [slipData]);

  const handlePrint = () => {
    const pdf = new jsPDF();
    
    // Header
    pdf.setFontSize(20);
    pdf.setTextColor(0, 0, 128);
    pdf.text('HOSPITAL SLIP', 105, 20, null, null, 'center');
    
    // Hospital Information
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text('City General Hospital', 105, 30, null, null, 'center');
    pdf.text('123 Healthcare Street, Medical City | Phone: (555) 123-4567', 105, 35, null, null, 'center');
    
    // Slip Information
    pdf.setFontSize(12);
    pdf.text(`Slip Number: ${slipData.slipNumber}`, 20, 50);
    pdf.text(`Patient ID: ${slipData.patientId}`, 20, 57);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 64);
    pdf.text(`Time: ${new Date().toLocaleTimeString()}`, 20, 71);
    
    // Patient Details
    if (patientDetails) {
      pdf.text(`Patient Name: ${patientDetails.name}`, 20, 85);
      pdf.text(`Contact: ${patientDetails.contact}`, 20, 92);
      pdf.text(`Gender: ${patientDetails.gender}`, 20, 99);
      pdf.text(`Date of Birth: ${new Date(patientDetails.dob).toLocaleDateString()}`, 20, 106);
      pdf.text(`Age: ${calculateAge(patientDetails.dob)} years`, 20, 113);
    }
    
    // Instructions
    pdf.setFontSize(11);
    pdf.setTextColor(128, 0, 0);
    pdf.text('➤ Please present this slip to the doctor', 20, 130);
    pdf.text('➤ Doctor will examine and write prescription', 20, 140);
    pdf.text('➤ Return to reception for billing after consultation', 20, 150);
    pdf.text('➤ Keep this slip safe until discharge', 20, 160);
    
    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('This slip is generated electronically. Valid for one visit only.', 105, 280, null, null, 'center');
    
    pdf.save(`hospital-slip-${slipData.slipNumber}.pdf`);
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className="slip-print-container">
      <div className="slip-card">
        <div className="card-header">
          <div className="header-accent"></div>
          <div className="title-section">
            <h2 className="card-title">Hospital Visit Slip</h2>
            <p className="card-subtitle">Patient consultation and registration document</p>
          </div>
        </div>
        
        <div className="hospital-info-section">
          <div className="hospital-details">
            <h3 className="hospital-name">City General Hospital</h3>
            <p className="hospital-address">123 Healthcare Street, Medical City</p>
            <p className="hospital-contact">Phone: (555) 123-4567 | Emergency: (555) 123-4568</p>
          </div>
        </div>

        <div className="slip-content">
          <div className="slip-details-grid">
            <div className="slip-field">
              <span className="field-label">Slip Number</span>
              <span className="field-value slip-number">{slipData.slipNumber}</span>
            </div>
            
            <div className="slip-field">
              <span className="field-label">Patient ID</span>
              <span className="field-value">{slipData.patientId}</span>
            </div>
            
            <div className="slip-field">
              <span className="field-label">Date Issued</span>
              <span className="field-value">{new Date().toLocaleDateString()}</span>
            </div>
            
            <div className="slip-field">
              <span className="field-label">Time</span>
              <span className="field-value">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>

          {patientDetails && (
            <div className="patient-section">
              <div className="section-header">
                <h3 className="section-title">Patient Information</h3>
              </div>
              <div className="patient-details-grid">
                <div className="detail-item">
                  <span className="detail-label">Full Name</span>
                  <span className="detail-value patient-name">{patientDetails.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Contact Number</span>
                  <span className="detail-value">{patientDetails.contact}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Gender</span>
                  <span className="detail-value">{patientDetails.gender}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date of Birth</span>
                  <span className="detail-value">{new Date(patientDetails.dob).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Age</span>
                  <span className="detail-value age-value">{calculateAge(patientDetails.dob)} years</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="instructions-section">
          <div className="section-header">
            <h3 className="section-title">Visit Instructions</h3>
          </div>
          <div className="instructions-card">
            <ol className="instructions-list">
              <li className="instruction-item">
                <span className="instruction-text">Proceed to the doctor's chamber with this slip</span>
              </li>
              <li className="instruction-item">
                <span className="instruction-text">Show this slip to the doctor for consultation</span>
              </li>
              <li className="instruction-item">
                <span className="instruction-text">Doctor will write prescription based on examination</span>
              </li>
              <li className="instruction-item">
                <span className="instruction-text">Return to reception for billing after consultation</span>
              </li>
              <li className="instruction-item">
                <span className="instruction-text">Collect your medicines and prescription from reception</span>
              </li>
              <li className="instruction-item">
                <span className="instruction-text">Keep this slip safe until you leave the hospital</span>
              </li>
            </ol>
          </div>
        </div>

        <div className="security-features">
          <div className="security-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
            <span>Secure Digital Document</span>
          </div>
          <div className="security-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span>Verified Registration</span>
          </div>
        </div>
        
        <div className="slip-actions">
          <button onClick={handlePrint} className="print-button">
            <svg className="print-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
            </svg>
            Generate PDF
          </button>
          {onViewPrescription && (
            <button onClick={onViewPrescription} className="view-prescription-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
              View Prescription
            </button>
          )}
          <button onClick={onNewRegistration} className="new-registration-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            New Registration
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlipPrint;
