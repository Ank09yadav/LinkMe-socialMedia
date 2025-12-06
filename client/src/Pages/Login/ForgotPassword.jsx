import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // <-- Reusing your login styles
import { BACKEND_URL } from './constants'; // Assuming this is set up
import logo from '../../Assets/logo2.png';
import LiquidEther from '../../Utility/animations/LiquidEther';

const ForgotPassword = () => {
  const navigate = useNavigate();

  // State to manage the UI step: 'email', 'otp', or 'password'
  const [step, setStep] = useState('email');
  
  // State for form inputs
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // State for feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // --- Step 1: Send the OTP ---
  const handleSendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${BACKEND_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to send OTP.');
      }

      setMessage('A 4-digit OTP has been sent to your email.');
      setStep('otp'); // Move to the next step

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Step 2: Verify the OTP ---
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${BACKEND_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Invalid or expired OTP.');
      }
      
      setMessage('OTP verified successfully. Please set a new password.');
      setStep('password'); // Move to the final step

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Step 3: Reset the Password ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${BACKEND_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to reset password.');
      }
      
      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000); // Redirect after 2s

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER FUNCTIONS FOR EACH STEP ---

  const renderEmailStep = () => (
    <form onSubmit={handleSendEmail} className="form-face form-front">
      <div className="grid-item-full">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="Submit_button">
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Sending...' : 'Send OTP'}
        </button>
      </div>
    </form>
  );

  const renderOtpStep = () => (
    <form onSubmit={handleVerifyOtp} className="form-face form-front">
      <div className="grid-item-full">
        <label htmlFor="otp">4-Digit OTP</label>
        <input
          type="text"
          id="otp"
          placeholder="Check your email for the OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={4}
          required
        />
      </div>
      <div className="Submit_button">
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </div>
    </form>
  );

  const renderPasswordStep = () => (
    <form onSubmit={handleResetPassword} className="form-face form-front">
      <div className="grid-item-full">
        <label htmlFor="newPassword">New Password</label>
        <input
          type="password"
          id="newPassword"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </div>
      <div className="grid-item-full">
        <label htmlFor="confirmPassword">Confirm New Password</label>
        <input
          type="password"
          id="confirmPassword"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <div className="Submit_button">
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Saving...' : 'Reset Password'}
        </button>
      </div>
    </form>
  );

  const renderStep = () => {
    switch (step) {
      case 'otp':
        return renderOtpStep();
      case 'password':
        return renderPasswordStep();
      case 'email':
      default:
        return renderEmailStep();
    }
  };

  return (
    <div className="Login_page">
      {/* Background Animation */}
      <div style={{ width: '100%', height: '90vh', position: 'relative' }}>
        <LiquidEther
          colors={['#5227FF', '#FF9FFC', '#B19EEF']}
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>
      
      <div className="logo">
        <img src={logo} alt="logo" />
      </div>

      <div className="welcomeLine">
        <h1>Forgot Your Password?</h1>
        <p>No problem. We'll get you a new one.</p>
      </div>

      {/* Auth Card Wrapper */}
      <div className="auth-card is-login">
        <div className="headding">
          <h1>{
            step === 'email' ? 'Reset Password' :
            step === 'otp' ? 'Verify Your Email' :
            'Set New Password'
          }</h1>
        </div>

        {/* Flipper container is used just for consistent height */}
        <div className="flipper-container">
          {/* We don't use the flipper, just the form-face for styling */}
          {renderStep()}
        </div>

        {/* Show Error or Success Message */}
        {error && <p className="error-general">{error}</p>}
        {message && <p className="message-general">{message}</p>} 
        {/* You'll need to add a `.message-general` class to Login.css */}

        <div className="Submit_button">
          <p
            role="button"
            className="link-btn"
            onClick={() => navigate("/login")}
          >
            Back to Login
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;