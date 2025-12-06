// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './redux/store';
// --- MODIFIED IMPORTS ---
import { initializeSocket, disconnectSocket, getSocket } from './socket';
import { setUser } from './redux/userSlice';
// --- END ---
import { BACKEND_URL } from './Pages/Login/constants';

// Import Pages and Components
import Home from './Pages/Home/Home';
import Login from './Pages/Login/Login';
import ForgotPassword from './Pages/Login/ForgotPassword';
import MessagePage from './Components/MessagePage/MessagePage';
import EditUserDetails from './Components/EditUserDetails/EditUserDetails';

// This is a simple component to protect routes
const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/user-details`, {
          method: 'GET',
          credentials: 'include'
        });
        const data = await response.json();

        if (data.success) {
          setIsAuthenticated(true);
          dispatch(setUser(data.data));

          // --- !! REAL-TIME LOGIC !! ---
          // Now that we are authenticated and have the user ID,
          // initialize the socket connection.
          initializeSocket(data.data._id);

          // Listen for self online status update
          const socket = getSocket();
          if (socket) {
            const handleSelfOnline = ({ userId }) => {
              if (userId === data.data._id) {
                dispatch(setUser({ ...data.data, isOnline: true }));
              }
            };
            socket.on('userOnline', handleSelfOnline);

            // Cleanup listener on unmount
            return () => {
              socket.off('userOnline', handleSelfOnline);
            };
          }
          // --- END ---

        } else {
          setIsAuthenticated(false);
          disconnectSocket(); // Disconnect if token is invalid
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        setIsAuthenticated(false);
        disconnectSocket(); // Disconnect on error
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [dispatch]);

  // --- SECOND useEffect (which handled socket) HAS BEEN REMOVED ---

  if (isLoading) {
    return <div>Loading...</div>; // You can replace this with a proper loading component
  }

  return (
    <Router>
      <Routes>
        {/* Redirect root path based on authentication status */}
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/login" />}
        />

        {/* Authentication Routes */}
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* --- CORRECTED NESTED ROUTE FOR HOME --- */}
        <Route
          path="/home"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Home setIsAuthenticated={setIsAuthenticated} />
            </ProtectedRoute>
          }
        >
          {/* Default view shown inside Home's Outlet when at /home */}
          <Route
            index
            element={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#888', fontSize: '1.2rem' }}>
                <h2>Select a chat to begin messaging</h2>
              </div>
            }
          />
          {/* This will be rendered inside Home's Outlet when at /home/chat/:chatId */}
          <Route path="chat/:chatId" element={<MessagePage />} />
          {/* This will be rendered inside Home's Outlet when at /home/profile */}
          <Route path="profile" element={<EditUserDetails />} />
        </Route>

        {/* Fallback for any other route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;