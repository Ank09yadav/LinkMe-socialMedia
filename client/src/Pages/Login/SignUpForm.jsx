import React from 'react';
import { passwordFormat } from './constants';

// This component is now wrapped in CSS Grid-ready divs
const SignUpForm = ({
  userName, setUserName,
  name, setName,
  email, setEmail,
  password, handlePasswordChange,
  confirmPassword, handleConfirmPassword,
  passwordError,
  matchError,
  ProfilePic, setProfilePic, handleFileChange,
  error // General error passed from hook
}) => {
  return (
    // This grid-layout class is targeted by our new CSS
    <div className="grid-layout">
      {/* Each item can be styled to span one or more columns */}
      
      <div className="grid-item">
        <label htmlFor="userName">User Name</label>
        <input
          type="text"
          id="userName"
          placeholder="Enter User Name"
          // required
          value={userName}
          onChange={e => setUserName(e.target.value)}
        />
      </div>

      <div className="grid-item">
        <label>Name</label>
        <input
          type="text"
          placeholder="Enter Name"
          // required
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      {/* This item will span the full width */}
      <div className="grid-item-full">
        <label>Email</label>
        <input
          type="text"
          placeholder="Enter Email address"
          // required
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>

      <div className="grid-item">
        <label>Password</label>
        <input
          type="password"
          placeholder="Enter password"
          // required
          value={password}
          onChange={handlePasswordChange}
        />
        {/* Show password format hint or an error if one exists */}
        
      </div>
      
      <div className="grid-item">
        <label>Confirm Password</label>
        <input
          type="password"
          placeholder="Re-enter password"
          // required
          value={confirmPassword}
          onChange={handleConfirmPassword}
        />
        {matchError && <p className="error-hint">{matchError}</p>}
      </div>
      
      <div className="grid-item-full">
        <p className="error-hint">{passwordError || passwordFormat}</p>
        <label>Profile Picture (Optional)</label>
        <div className="file-input-row">
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleFileChange}
            id="profilePicInput"
            className="file-input"
          />
          {ProfilePic && (
            <button
              type="button"
              className="unselect-btn"
              onClick={() => {
                setProfilePic("");
                document.getElementById('profilePicInput').value = "";
              }}
            >
              Unselect
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;

