import React from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // We are using the updated CSS
import logo from "../../Assets/logo2.png";
import LiquidEther from "../../Utility/animations/LiquidEther";

// Import the custom hook and the form components
import { useAuthForm } from "./useAuthForm";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";

const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  // Your existing hook. All logic is preserved.
  const {
    isLogin,
    name, setName,
    email, setEmail,
    password, setPassword,
    confirmPassword,
    ProfilePic, setProfilePic,
    error, passwordError, matchError,
    userName, setUserName,
    handleFileChange,
    handlePasswordChange,
    handleConfirmPassword,
    handleSwitch,
    handleSubmit,
  } = useAuthForm(setIsAuthenticated);

  return (
    <div className="Login_page">
      <div style={{ width: '100%', height: '90vh', position: 'relative' }}>
  <LiquidEther
    colors={[ '#5227FF', '#FF9FFC', '#B19EEF' ]}
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
        <h1>Welcome to LinkMe!</h1>
        <p>
          {isLogin
            ? "Please log In to continue"
            : "Create an account to get started..."}
        </p>
      </div>

      {/* - The form is the main "card".
        - We add a class based on 'isLogin' to control the height animation.
      */}
      <form 
        className={`auth-card ${isLogin ? 'is-login' : 'is-signup'}`} 
        onSubmit={handleSubmit}
      >
        
        <div className="headding">
          <h1>{isLogin ? "Log In" : "Sign Up"}</h1>
        </div>

        {/* This container holds the 3D flipper */}
        <div className="flipper-container">
          <div className={`flipper ${!isLogin ? "is-flipped" : ""}`}>
            
            {/* Front face (Login) - All props passed */}
            <div className="form-face form-front">
              <LoginForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
              />
              {/* Show login-specific errors here */}
              {isLogin && error && <p className="error-general">{error}</p>}
            </div>

            {/* Back face (Sign Up) - All props passed */}
            <div className="form-face form-back">
              <SignUpForm
                userName={userName}
                setUserName={setUserName}
                name={name}
                setName={setName}
                email={email}
                setEmail={setEmail}
                password={password}
                handlePasswordChange={handlePasswordChange}
                confirmPassword={confirmPassword}
                handleConfirmPassword={handleConfirmPassword}
                passwordError={passwordError}
                matchError={matchError}
                ProfilePic={ProfilePic}
                setProfilePic={setProfilePic}
                handleFileChange={handleFileChange}
              />
              {/* Show signup-specific errors here */}
              {!isLogin && error && <p className="error-general">{error}</p>}
            </div>
          </div>
        </div>

        {/* - This section is OUTSIDE the flipper.
          - This fixes your button overlap bug.
        */}
        <div className="Submit_button">
          <button type="submit" className="auth-button">
            {isLogin ? "Log In" : "Sign Up"}
          </button>

          {isLogin && (
            <p
              role="button"
              className="link-btn"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </p>
          )}

          <p role="button" className="link-btn" onClick={handleSwitch}>
            {isLogin
              ? "Don't have an account? Sign Up"
              : "Already have an account? Log In"}
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;


