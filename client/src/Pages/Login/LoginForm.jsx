import React from 'react';

const LoginForm = ({ email, setEmail, password, setPassword }) => {
  return (
    <>
      <div>
        <label htmlFor="login-email">Email</label>
        <input
          type="email"
          id="login-email"
          placeholder="Enter Email address"
          
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="login-password">Password</label>
        <input
          type="password"
          id="login-password"
          placeholder="Enter password"
          // required
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>
    </>
  );
};

export default LoginForm;
