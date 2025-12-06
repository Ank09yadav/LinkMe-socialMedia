import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validatePassword } from "./validators";
import { passwordFormat } from "./constants";
import * as authService from "./authService";

export const useAuthForm = (setIsAuthenticated) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ProfilePic, setProfilePic] = useState("");
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [matchError, setMatchError] = useState("");
  const navigate = useNavigate();

  // Resets all form fields and errors
  const resetForm = () => { 
    setUserName("");
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setProfilePic("");
    setError("");
    setPasswordError("");
    setMatchError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!file) {
      setProfilePic("");
      setError("");
      return;
    }
    if (allowedTypes.includes(file.type)) {
      setProfilePic(file);
      setError("");
    } else {
      setProfilePic("");
      setError("Please select a valid image file (png, jpeg, jpg)");
      e.target.value = null;
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (!validatePassword(value)) {
      setPasswordError("Weak password! " + passwordFormat);
    } else {
      setPasswordError("");
    }
    if (confirmPassword && value !== confirmPassword) {
      setMatchError("Passwords do not match.");
    } else {
      setMatchError("");
    }
  };

  const handleConfirmPassword = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (password !== value) {
      setMatchError("Passwords do not match.");
    } else {
      setMatchError("");
    }
  };

  const handleSwitch = () => {
    // We don't need to reset the form here
    // because the fields are now separate components
    // We only reset errors
    setError("");
    setPasswordError("");
    setMatchError("");
    setIsLogin(!isLogin);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); 
    setMatchError("");
    setPasswordError("");

    if (isLogin) {
      // --- LOGIN LOGIC ---
      if (!email || !password) {
        setError("Please fill in all fields");
        return;
      }
      try {
        const emailData = await authService.checkEmail(email);
        if (!emailData.success) {
          setError(emailData.message);
          return;
        }
        const userId = emailData.data._id;
        const passwordData = await authService.loginUser(userId, password);
        if (!passwordData.success) {
          setError(passwordData.message);
          return;
        }
        setIsAuthenticated(true);
        navigate("/home");
      } catch (err) {
        console.error("Login error:", err);
        setError("Login failed. Please try again.");
      }
    } else {
      // --- SIGN UP LOGIC ---
      if (!userName || !name || !email || !password || !confirmPassword) {
        setError("Please fill in all fields");
        return;
      }
      if (password !== confirmPassword) {
        setMatchError("Passwords do not match");
        return;
      }
      if (!validatePassword(password)) {
        setPasswordError("Please fix password errors before submitting.");
        return;
      }
      
      try {
        const signUpData = await authService.registerUser({
          userName,
          name,
          email,
          password,
          ProfilePic, // This is the file object
        });
        
        if (!signUpData.success) {
          // Handle backend errors (e.g., user already exists)
          setError(signUpData.message);
          return;
        }

        // After successful registration, log the user in
        const emailData = await authService.checkEmail(email);
        if (!emailData.success) {
          setError(emailData.message); // Should not happen, but good to check
          return;
        }
        const userId = emailData.data._id;
        const passwordData = await authService.loginUser(userId, password);
        if (!passwordData.success) {
          setError(passwordData.message); // Should not happen
          return;
        }

        // All good, navigate to home
        setIsAuthenticated(true);
        navigate("/home");
      } catch (err) {
        console.error("Sign up error:", err);
        setError(err.message || "Sign up failed. Please try again.");
      }
    }
  };

  // Return all state and handler functions
  return {
    isLogin,
    name,setName,
    email, setEmail,
    password,  setPassword,
    confirmPassword, setConfirmPassword,
    ProfilePic, setProfilePic,
    error,
    passwordError,
    matchError,
    userName, setUserName,
    handleFileChange,
    handlePasswordChange,
    handleConfirmPassword,
    handleSwitch,
    handleSubmit,
  };
};
