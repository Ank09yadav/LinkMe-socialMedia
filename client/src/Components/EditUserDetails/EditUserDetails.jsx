import React, { useState, useEffect } from 'react';
import { BACKEND_URL } from '../../Pages/Login/constants';
import { uploadImageToCloudinary } from '../../Utility/LoginUtility/LoginUploadfile';
import './EditUserDetails.css';

const EditUserDetails = ({ onProfileUpdate, onClose }) => {
  const [userDetails, setUserDetails] = useState({
    name: '',
    userName: '',
    profilePic: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  const getUserDetails = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/user-details`, {
        method: 'GET',
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUserDetails({
          name: data.data.name || '',
          userName: data.data.userName || '',
          profilePic: data.data.profilePic || ''
        });
      } else {
        setMessage('Failed to load user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      setMessage('Error loading user details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      
      try {
        const uploadResponse = await uploadImageToCloudinary(file);
        if (uploadResponse.secure_url) {
          setUserDetails(prev => ({
            ...prev,
            profilePic: uploadResponse.secure_url
          }));
          setMessage('Profile picture uploaded successfully!');
        } else {
          setMessage('Failed to upload profile picture');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        setMessage('Error uploading profile picture');
      } finally {
        setUploading(false);
      }
    }
  };

  
  const handleDeletePic = () => {
    setUserDetails(prev => ({
      ...prev,
      profilePic: ''
    }));
   // setMessage('Profile picture will be removed on update.');
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUpdating(true);
    setMessage('');

    try {
      const response = await fetch(`${BACKEND_URL}/update-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: userDetails.name,
          userName: userDetails.userName,
          profilePic: userDetails.profilePic // This will be "" if deleted
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Profile updated successfully!');
        if (onProfileUpdate) {
          await onProfileUpdate();
        }
        if (onClose) {
          onClose();
        }
      } else {
        setMessage(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating user details:', error);
      setMessage('Error updating profile');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    getUserDetails();
  }, []);

  if (loading) {
    return <div className="edit-user-details">Loading...</div>;
  }

  return (
    <div className="edit-user-details">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit} className="edit-form">
        
        {/* --- 1. PROFILE PICTURE --- */}
        <div className="form-group">
          {userDetails.profilePic && (
            <img
              src={userDetails.profilePic}
              alt="Profile Preview"
              className="profile-preview"
            />
          )}
          <label htmlFor="profilePic">Profile Picture:</label>
          <div className="profile-pic-controls">
            <input
              type="file"
              id="profilePic"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
            />
            {/* Only show delete button if a picture exists */}
            {userDetails.profilePic && (
              <button 
                type="button" 
                className="delete-pic-btn" 
                onClick={handleDeletePic}
                disabled={uploading }
              >
                Delete
              </button>
            )}
            
          </div>
          
          
          {/* Profile preview logic is updated to hide when pic is set to "" */}
          
        </div>

        {/* --- 2. USERNAME --- */}
        <div className="form-group">
          <label htmlFor="userName">Username:</label>
          <input
            type="text"
            id="userName"
            name="userName"
            value={userDetails.userName}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* --- 3. NAME --- */}
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={userDetails.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <button type="submit" disabled={updating || uploading} className="update-btn">
          {updating ? 'Updating...' : uploading ? 'Uploading...' : 'Update Profile'}
        </button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default EditUserDetails;