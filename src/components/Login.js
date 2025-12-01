import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user, data.token);

        // Redirect based on role dynamically
        switch (data.user.role) {
          case 'reception':
            navigate('/reception');
            break;
          case 'doctor':
            navigate('/doctor');
            break;
          case 'pharmacy':
            navigate('/pharmacy');
            break;
          default:
            navigate('/'); // fallback
        }
      } else {
        setError(data.error || 'Login failed. Check your credentials.');
      }
    } catch (err) {
      setError('Failed to connect to server. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="login-header">
          <h2>Hospital POS System</h2>
          <p>Please sign in to continue</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="demo-accounts">
          <h4>Demo Accounts:</h4>
          <p>Reception: reception@hospital.com / password</p>
          <p>Doctor: doctor@hospital.com / password</p>
          <p>Pharmacy: pharmacy@hospital.com / password</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
