import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import '../styles/GenerateBill.css';

const GenerateBill = ({ prescription, onBillGenerated }) => {
  const [billDetails, setBillDetails] = useState({
    consultationFee: 500,
    medicines: [],
    labTests: [],
    tax: 0,
    discount: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Calculate initial bill
    calculateBill();
  }, [prescription]);

  const calculateBill = () => {
    // Mock medicine costs - in real app, this would come from database
    const medicineCosts = prescription.prescription.medicine_list.map(med => ({
      ...med,
      cost: Math.floor(Math.random() * 200) + 50 // Random cost between 50-250
    }));

    const medicinesTotal = medicineCosts.reduce((sum, med) => sum + med.cost, 0);
    const consultationFee = 500;
    const subtotal = consultationFee + medicinesTotal;
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + tax;

    setBillDetails({
      consultationFee,
      medicines: medicineCosts,
      labTests: [],
      tax,
      discount: 0,
      total
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('http://72.60.193.192:5000/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          slip_id: prescription.slip_id,
          total_amount: billDetails.total
        })
      });

      if (response.ok) {
        generateReceipt();
        onBillGenerated();
      }
    } catch (err) {
      console.error('Payment failed:', err);
    }
    setLoading(false);
  };

  const generateReceipt = () => {
    const pdf = new jsPDF();
    
    // Header
    pdf.setFontSize(20);
    pdf.text('MEDICAL RECEIPT', 105, 20, null, null, 'center');
    
    pdf.setFontSize(10);
    pdf.text('City General Hospital', 105, 30, null, null, 'center');
    pdf.text('123 Healthcare Street, Medical City', 105, 35, null, null, 'center');
    
    // Patient Information
    pdf.setFontSize(12);
    pdf.text(`Receipt No: RCP${Date.now()}`, 20, 50);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 55);
    pdf.text(`Patient: ${prescription.name}`, 20, 60);
    pdf.text(`Slip No: ${prescription.slip_number}`, 20, 65);
    
    // Bill Items
    let yPosition = 80;
    
    pdf.text('Description', 20, yPosition);
    pdf.text('Amount', 180, yPosition, null, null, 'right');
    yPosition += 10;
    
    pdf.text('Consultation Fee', 20, yPosition);
    pdf.text(`₹${billDetails.consultationFee}`, 180, yPosition, null, null, 'right');
    yPosition += 10;
    
    // Medicines
    billDetails.medicines.forEach(med => {
      pdf.text(`${med.name} (${med.dosage})`, 20, yPosition);
      pdf.text(`₹${med.cost}`, 180, yPosition, null, null, 'right');
      yPosition += 7;
    });
    
    yPosition += 5;
    
    // Total
    pdf.setFontSize(12);
    pdf.text('Total Amount:', 20, yPosition);
    pdf.text(`₹${billDetails.total}`, 180, yPosition, null, null, 'right');
    
    pdf.save(`receipt-${prescription.slip_number}.pdf`);
  };

  return (
    <div className="generate-bill-container">
      <div className="form-card">
        <h3>Generate Bill & Receipt</h3>
        
        <div className="patient-info">
          <h4>Patient Details</h4>
          <div className="info-grid">
            <div><strong>Name:</strong> {prescription.name}</div>
            <div><strong>Slip No:</strong> {prescription.slip_number}</div>
            <div><strong>Contact:</strong> {prescription.contact}</div>
            <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div className="bill-details">
          <h4>Bill Breakdown</h4>
          <table className="bill-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Consultation Fee</td>
                <td>{billDetails.consultationFee}</td>
              </tr>
              {billDetails.medicines.map((med, index) => (
                <tr key={index}>
                  <td>{med.name} - {med.dosage} ({med.frequency})</td>
                  <td>{med.cost}</td>
                </tr>
              ))}
              {billDetails.tax > 0 && (
                <tr>
                  <td>Tax (5%)</td>
                  <td>{billDetails.tax.toFixed(2)}</td>
                </tr>
              )}
              {billDetails.discount > 0 && (
                <tr>
                  <td>Discount</td>
                  <td>-{billDetails.discount.toFixed(2)}</td>
                </tr>
              )}
              <tr className="total-row">
                <td><strong>Total Amount</strong></td>
                <td><strong>₹{billDetails.total?.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="prescription-notes">
          <h4>Doctor's Notes</h4>
          <p>{prescription.prescription?.notes || 'No additional notes.'}</p>
        </div>

        <div className="bill-actions">
          <button 
            onClick={handlePayment} 
            disabled={loading}
            className="payment-btn"
          >
            {loading ? 'Processing...' : 'Confirm Payment & Print Receipt'}
          </button>
          <button 
            onClick={() => onBillGenerated()}
            className="secondary-btn"
          >
            Back to Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateBill;
