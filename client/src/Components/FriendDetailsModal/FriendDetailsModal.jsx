import React from 'react';
import './FriendDetailsModal.css';

const FriendDetailsModal = ({ friend, onClose, onRemoveFriend }) => {
  if (!friend) return null;

  const handleRemoveFriend = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/remove-friend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          friendId: friend.id || friend._id,
        }),
      });
      const data = await response.json();
      if (data.success) {
        // Call the prop function, which in MessagePage.jsx
        // will clear the selected friend
        onRemoveFriend(friend.id || friend._id);
        onClose();
        // The socket listener in Home.jsx will update the chat list
      } else {
        console.error(data.message || 'Failed to remove friend');
      }
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <div className="friend-details">
          <img src={friend.avatar || friend.profilePic || '/default-avatar.png'} alt={`${friend.name}'s avatar`} className="friend-avatar" />
          <h2 className="friend-name">{friend.name}</h2>
          <p className="friend-username">@{friend.userName}</p>
          <button className="remove-friend-btn" onClick={handleRemoveFriend}>
            Remove from Friends
          </button>
        </div>
      </div>
    </div>
  );
};

export default FriendDetailsModal;