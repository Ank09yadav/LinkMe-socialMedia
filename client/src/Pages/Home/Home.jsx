import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import Sidebar from '../../Components/Sidebar/Sidebar';
import './Home.css';
import { BACKEND_URL } from '../Login/constants';
import { getSocket, disconnectSocket } from '../../socket';

const Home = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [chatUsers, setChatUsers] = useState([]);
  const socket = getSocket(); // Get the single, initialized socket instance

  // Fetches the complete friends list
  const fetchFriends = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/friends`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        // Map the raw friend data to the structure needed by the Sidebar
        const friends = data.data.map(friend => ({
          id: friend._id,
          name: friend.name,
          userName: friend.userName,
          avatar: friend.profilePic || 'https://placehold.co/100x100/E5E7EB/4B5563?text=A',
          isOnline: friend.isOnline,
          lastSeen: friend.lastSeen,
          message: 'Start a conversation!' // Placeholder message
        }));
        setChatUsers(friends);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  // 1. Fetch the initial list of friends when the component mounts
  useEffect(() => {
    fetchFriends();
  }, []); // Empty dependency array ensures this runs only once on mount

  // 2. Set up all real-time socket listeners
  useEffect(() => {
    if (socket) {
      // Event: A friend connects
      const handleUserOnline = ({ userId }) => {
        setChatUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, isOnline: true } : user
        ));
      };

      // Event: A friend disconnects
      const handleUserOffline = ({ userId, lastSeen }) => {
        setChatUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, isOnline: false, lastSeen } : user
        ));
      };

      // Event: A friend is added or removed
      const handleFriendListUpdate = () => {
        // The simplest and most reliable way to handle adds/removes
        // is to re-fetch the entire list from the server.
        fetchFriends();
      };
      
      // Bind all listeners
      socket.on('userOnline', handleUserOnline);
      socket.on('userOffline', handleUserOffline);
      socket.on('friendRequestAccepted', handleFriendListUpdate);
      socket.on('friendRemoved', handleFriendListUpdate);

      // Cleanup: Remove listeners when the component unmounts
      return () => {
        socket.off('userOnline', handleUserOnline);
        socket.off('userOffline', handleUserOffline);
        socket.off('friendRequestAccepted', handleFriendListUpdate);
        socket.off('friendRemoved', handleFriendListUpdate);
      };
    }
  }, [socket]); // Re-run this effect if the socket instance changes

  // Handles the user logout process
  const handleLogout = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/logout', {
        method: 'GET',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        // Disconnect socket immediately on logout
        disconnectSocket();
        setIsAuthenticated(false); // Update App-level state
        navigate('/login'); // Redirect to login page
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Render the two-column layout
  return (
    <div className="Home">
      <div className="sidebar-container">
        {/* Pass the logout function and the dynamic list of friends */}
        <Sidebar 
          handleLogout={handleLogout} 
          chatUsers={chatUsers} 
        />
      </div>

      <div className="content-container">
        {/* This Outlet renders the nested routes (e.g., MessagePage or EditUserDetails) */}
        <Outlet />
      </div>
    </div>
  );
};

export default Home;