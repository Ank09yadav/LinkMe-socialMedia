import { BACKEND_URL } from './constants';
import { uploadImageToCloudinary } from '../../Utility/LoginUtility/LoginUploadfile';

export const checkEmail = async (email) => {
  const response = await fetch(`${BACKEND_URL}/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return response.json();
};

export const loginUser = async (userId, password) => {
  const response = await fetch(`${BACKEND_URL}/password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, password }),
    credentials: 'include'
  });
  return response.json();
};

export const registerUser = async (formData) => {
  let profilePicUrl = "";
  if (formData.ProfilePic) {
    try {
      profilePicUrl = await uploadImageToCloudinary(formData.ProfilePic);
    } catch (err) {
      throw new Error('Failed to upload image');
    }
  }
  const payload = {
    userName: formData.userName,
    name: formData.name,
    email: formData.email,
    password: formData.password,
    profilePic: profilePicUrl?.url 
  };

 
  const response = await fetch(`${BACKEND_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.json();
};

