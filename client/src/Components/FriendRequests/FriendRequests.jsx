import React, { useEffect, useState } from 'react';
import { FaUserCheck, FaUserTimes, FaUserFriends } from 'react-icons/fa';
import { BACKEND_URL } from '../../Pages/Login/constants';
import './FriendRequests.css';
import { getSocket } from '../../socket';

// --- REMOVED onAcceptFriend prop ---
const FriendRequests = () => {
  const [friendRequests, setFriendRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);
  const socket = getSocket();

  const fetchFriendRequests = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/friend-requests`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setFriendRequests(data.data);
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const handleAcceptRequest = async (friendId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/accept-friend-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ friendId }),
      });
      const data = await response.json();
      if (data.success) {
        // Optimistically remove from this list
        setFriendRequests(friendRequests.filter(request => request._id !== friendId));
        // Home.jsx's socket listener will handle adding them to the chat list.
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleRejectRequest = async (friendId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/reject-friend-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ friendId }),
      });
      const data = await response.json();
      if (data.success) {
        // Optimistically remove from this list
        setFriendRequests(friendRequests.filter(request => request._id !== friendId));
      } else {
        console.error('Error rejecting friend request:', data.message);
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  // 1. Fetch initial list on mount
  useEffect(() => {
    fetchFriendRequests();
  }, []);

  // --- !! REAL-TIME FIX !! ---
  // 2. REMOVED the inefficient 'setInterval' polling effect
  // --- END ---

  // 3. Listen for socket events
  useEffect(() => {
    if (socket) {
      // Event: A new request comes in
      const handleNewRequest = (newRequestData) => {
        // Add the new request to the list
        setFriendRequests(prev => [newRequestData, ...prev]);
      };

      // Event: A request is rejected (by you or them)
      const handleRequestRejected = (data) => {
        const idToRemove = data.rejectedById || data.rejectedFriendId;
        setFriendRequests(prev => prev.filter(r => r._id !== idToRemove));
      };
      
      // Event: A request is accepted (by you)
      // We need this in case you accept it on another device/tab
      const handleRequestAccepted = (data) => {
          // 'data' is the new friend. We need to find the request by ID
          // Assuming the data object IS the new friend, who was also the requestor
          setFriendRequests(prev => prev.filter(r => r._id !== data._id));
      }

      socket.on('newFriendRequest', handleNewRequest);
      socket.on('friendRequestRejected', handleRequestRejected);
      socket.on('friendRequestAccepted', handleRequestAccepted);

      return () => {
        socket.off('newFriendRequest', handleNewRequest);
        socket.off('friendRequestRejected', handleRequestRejected);
        socket.off('friendRequestAccepted', handleRequestAccepted);
      };
    }
  }, [socket]);

  const toggleRequests = () => {
    setShowRequests(!showRequests);
  };

  return (
    <div className="friend-requests">
      <button className="friend-requests-toggle" onClick={toggleRequests}>
        <FaUserFriends /> Friend Requests ({friendRequests.length})
      </button>
      {showRequests && (
        <div className="friend-requests-content">
          {friendRequests.length === 0 ? (
            <p className="no-requests">No friend requests</p>
          ) : (
            <div className="requests-list">
              {friendRequests.map(request => (
                <div key={request._id} className="request-item">
                  <img src={request.profilePic || 'https://placehold.co/100x100/E5E7EB/4B5563?text=U'} alt={`${request.name}'s avatar`} className="request-avatar" />
                  <div className="request-details">
                    <p className="request-name">{request.name}</p>
                    <p className="request-username">@{request.userName}</p>
                  </div>
                  <div className="request-actions">
                    <button className="accept-btn" onClick={() => handleAcceptRequest(request._id)}>
                      <FaUserCheck /> Accept
                    </button>
                    <button className="reject-btn" onClick={() => handleRejectRequest(request._id)}>
                      <FaUserTimes /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FriendRequests;