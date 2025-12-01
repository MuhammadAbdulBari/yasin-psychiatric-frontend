import React from 'react';
import jsPDF from 'jspdf';
import '../styles/ViewPrescription.css';

const ViewPrescription = ({ prescription, patient, onPrint, onClose }) => {
  
  const handlePrintPrescription = () => {
    const pdf = new jsPDF();
    
    // Header
    pdf.setFontSize(20);
    pdf.setTextColor(0, 0, 128);
    pdf.text('MEDICAL PRESCRIPTION', 105, 20, null, null, 'center');
    
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text('City General Hospital', 105, 30, null, null, 'center');
    pdf.text('123 Healthcare Street, Medical City | Phone: (555) 123-4567', 105, 35, null, null, 'center');
    pdf.text('Emergency: (555) 123-4568 | www.citygeneralhospital.com', 105, 40, null, null, 'center');
    
    // Patient Information Box
    pdf.setFillColor(240, 240, 240);
    pdf.rect(15, 50, 180, 30, 'F');
    
    pdf.setFontSize(11);
    pdf.text(`Patient Name: ${patient.name}`, 20, 58);
    pdf.text(`Contact: ${patient.contact}`, 20, 65);
    pdf.text(`Gender: ${patient.gender} | DOB: ${new Date(patient.dob).toLocaleDateString()}`, 20, 72);
    
    pdf.text(`Slip Number: ${prescription.slip_number}`, 120, 58);
    pdf.text(`Patient ID: ${patient.id}`, 120, 65);
    pdf.text(`Visit Date: ${new Date(prescription.created_at).toLocaleDateString()}`, 120, 72);
    
    // Doctor Information
    pdf.setFontSize(11);
    pdf.text(`Prescribing Doctor: Dr. ${prescription.doctor_name}`, 20, 85);
    pdf.text(`License: MCI-${Math.random().toString(36).substr(2, 8).toUpperCase()}`, 20, 92);
    
    // Medicines Section
    pdf.setFontSize(14);
    pdf.setTextColor(0, 100, 0);
    pdf.text('PRESCRIBED MEDICINES:', 20, 110);
    
    // Medicine Table Header
    pdf.setFillColor(0, 100, 0);
    pdf.rect(20, 115, 170, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.text('No.', 22, 120);
    pdf.text('Medicine Name', 35, 120);
    pdf.text('Dosage', 100, 120);
    pdf.text('Frequency', 130, 120);
    pdf.text('Duration', 160, 120);
    
    let yPosition = 128;
    pdf.setTextColor(0, 0, 0);
    
    prescription.medicine_list.forEach((med, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
        // Redraw header on new page
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text('City General Hospital - Medical Prescription (Continued)', 105, 30, null, null, 'center');
      }
      
      // Alternate row colors
      if (index % 2 === 0) {
        pdf.setFillColor(245, 245, 245);
        pdf.rect(20, yPosition - 4, 170, 8, 'F');
      }
      
      pdf.text(`${index + 1}.`, 22, yPosition);
      
      // Medicine name (with word wrap)
      const medicineName = pdf.splitTextToSize(med.name, 50);
      pdf.text(medicineName, 35, yPosition);
      
      pdf.text(med.dosage || '-', 100, yPosition);
      pdf.text(med.frequency || '-', 130, yPosition);
      pdf.text(med.duration || '-', 160, yPosition);
      
      yPosition += 8;
      
      // If medicine name wrapped to multiple lines, adjust position
      if (medicineName.length > 1) {
        yPosition += (medicineName.length - 1) * 5;
      }
    });
    
    // Doctor's Notes
    if (prescription.notes) {
      yPosition += 10;
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 128);
      pdf.text('DOCTOR\'S NOTES & INSTRUCTIONS:', 20, yPosition);
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      yPosition += 8;
      
      const splitNotes = pdf.splitTextToSize(prescription.notes, 160);
      pdf.text(splitNotes, 20, yPosition);
      
      yPosition += (splitNotes.length * 5) + 10;
    }
    
    // Additional Instructions
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }
    
    pdf.setFontSize(10);
    pdf.setTextColor(128, 0, 0);
    pdf.text('Important Instructions:', 20, yPosition);
    yPosition += 6;
    
    pdf.setFontSize(8);
    const instructions = [
      '• Take medicines as prescribed. Do not skip doses.',
      '• Complete the full course of medication.',
      '• Follow up if symptoms persist or worsen.',
      '• Maintain proper diet and hydration.',
      '• Contact hospital in case of emergency.',
      '• Keep this prescription for future reference.'
    ];
    
    instructions.forEach(instruction => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(instruction, 22, yPosition);
      yPosition += 5;
    });
    
    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('This is a computer-generated prescription. Valid for 30 days.', 105, 280, null, null, 'center');
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 105, 285, null, null, 'center');
    
    pdf.save(`prescription-${prescription.slip_number}.pdf`);
    
    if (onPrint) {
      onPrint();
    }
  };

  return (
    <div className="view-prescription-container">
      <div className="prescription-card">
        <div className="card-header">
          <div className="header-accent"></div>
          <div className="title-section">
            <h2 className="card-title">Medical Prescription</h2>
            <p className="card-subtitle">Complete prescription details and instructions</p>
          </div>
          <button onClick={onClose} className="close-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        
        <div className="prescription-content">
          <div className="information-grid">
            <div className="patient-section">
              <div className="section-header">
                <h3 className="section-title">Patient Information</h3>
              </div>
              <div className="details-grid">
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
                <div className="detail-item">
                  <span className="detail-label">Patient ID</span>
                  <span className="detail-value">#{patient.id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Slip Number</span>
                  <span className="detail-value slip-number">{prescription.slip_number}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Visit Date</span>
                  <span className="detail-value">{new Date(prescription.created_at).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Visit Time</span>
                  <span className="detail-value">{new Date(prescription.created_at).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
            
            <div className="doctor-section">
              <div className="section-header">
                <h3 className="section-title">Medical Officer</h3>
              </div>
              <div className="doctor-card">
                <div className="doctor-info">
                  <h4 className="doctor-name">Dr. {prescription.doctor_name}</h4>
                  <p className="doctor-qualification">MBBS, MD - General Medicine</p>
                  <p className="doctor-license">
                    License: MCI-{Math.random().toString(36).substr(2, 8).toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="medicines-section">
            <div className="section-header">
              <h3 className="section-title">Prescribed Medications</h3>
            </div>
            <div className="table-container">
              <table className="medicines-table">
                <thead>
                  <tr>
                    <th className="column-number">No.</th>
                    <th className="column-name">Medicine Name</th>
                    <th className="column-dosage">Dosage</th>
                    <th className="column-frequency">Frequency</th>
                    <th className="column-duration">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {prescription.medicine_list && prescription.medicine_list.length > 0 ? (
                    prescription.medicine_list.map((medicine, index) => (
                      <tr key={index} className="medicine-row">
                        <td className="row-number">
                          <span className="number-badge">{index + 1}</span>
                        </td>
                        <td className="medicine-name">{medicine.name}</td>
                        <td className="medicine-dosage">{medicine.dosage || '-'}</td>
                        <td className="medicine-frequency">{medicine.frequency || '-'}</td>
                        <td className="medicine-duration">{medicine.duration || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-medicines">
                        <div className="empty-state">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                          </svg>
                          <span>No medications prescribed</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {prescription.notes && (
            <div className="notes-section">
              <div className="section-header">
                <h3 className="section-title">Clinical Notes</h3>
              </div>
              <div className="notes-card">
                <div className="notes-content">
                  {prescription.notes}
                </div>
              </div>
            </div>
          )}

          <div className="instructions-section">
            <div className="section-header">
              <h3 className="section-title">Important Instructions</h3>
            </div>
            <div className="instructions-card">
              <ul className="instructions-list">
                <li className="instruction-item">
                  <span className="instruction-text">Take medicines as prescribed. Do not skip doses</span>
                </li>
                <li className="instruction-item">
                  <span className="instruction-text">Complete the full course of medication</span>
                </li>
                <li className="instruction-item">
                  <span className="instruction-text">Follow up if symptoms persist or worsen</span>
                </li>
                <li className="instruction-item">
                  <span className="instruction-text">Maintain proper diet and hydration</span>
                </li>
                <li className="instruction-item">
                  <span className="instruction-text">Contact hospital in case of emergency</span>
                </li>
                <li className="instruction-item">
                  <span className="instruction-text">Keep this prescription for future reference</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="prescription-actions">
          <button onClick={handlePrintPrescription} className="print-button">
            <svg className="print-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
            </svg>
            Generate PDF
          </button>
          <button onClick={onClose} className="close-action-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
            Close Document
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewPrescription;