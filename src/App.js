import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Reception from './pages/Reception';
import Doctor from './pages/Doctor';
import Billing from './pages/Billing';
import Pharmacy from './pages/Pharmacy'; // Add this import
import './styles/App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/reception" element={<ProtectedRoute><Reception /></ProtectedRoute>} />
            <Route path="/doctor" element={<ProtectedRoute><Doctor /></ProtectedRoute>} />
            <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
            <Route path="/pharmacy" element={<ProtectedRoute><Pharmacy /></ProtectedRoute>} /> {/* Add this route */}
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

export default App;