import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setSelectedFriend, setUser } from '../../redux/userSlice';
import './Sidebar.css';
import { FaSearch, FaSignOutAlt, FaUserPlus, FaUserFriends } from 'react-icons/fa';
import logo from '../../Assets/logo2.png';
import { BACKEND_URL } from '../../Pages/Login/constants';
import FriendRequests from '../FriendRequests/FriendRequests';
import EditUserDetails from '../EditUserDetails/EditUserDetails';

// --- HELPER FUNCTION ---
const formatLastSeen = (lastSeen) => {
  if (!lastSeen) return '';

  const date = new Date(lastSeen);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);

  if (diffMins < 1) return 'Last seen just now';
  if (diffMins < 60) return `Last seen ${diffMins}m ago`;
  if (diffHours < 24) return `Last seen ${diffHours}h ago`;
  if (diffDays === 1) return 'Last seen yesterday';
  return `Last seen ${date.toLocaleDateString()}`;
};



const Sidebar = ({ handleLogout, chatUsers }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [userDetails, setUserDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const searchResultsRef = useRef(null);

  // Fetches the current user's details for the profile display
  const getUserDetails = async () => {
    try {
      const userData = await fetch(`${BACKEND_URL}/user-details`, {
        method: 'GET',
        credentials: 'include'
      });
      if (userData.ok) {
        const data = await userData.json();
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  };

  // Handles the user search logic
  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    try {
      const response = await fetch(`${BACKEND_URL}/search-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ search: searchQuery }),
      });
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.data);
      } else {
        setSearchResults([]);
      }
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  // Handles sending a friend request
  const handleAddFriend = async (user) => {
    try {
      const response = await fetch(`${BACKEND_URL}/add-friend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ friendId: user._id }),
      });
      const data = await response.json();
      if (data.success) {
        // Client-side socket.emit removed
        // Backend now handles all real-time events
        setSearchQuery('');
        setSearchResults([]);
        setShowSearchResults(false);
      } else {
        console.error('Error adding friend:', data.message);
      }
    } catch (error) {
      console.error('Error adding friend:', error);
    }
  };

  // Refreshes user details and updates Redux state
  const refreshUserDetails = async () => {
    const details = await getUserDetails();
    setUserDetails(details);
    if (details) {
      dispatch(setUser(details));
    }
  };

  // Initial load of user details
  useEffect(() => {
    refreshUserDetails();
  }, []);

  // Handles clicking outside the search results to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className='sidebar'>
      {/* Header with Logo and User Profile */}
      <div className='sidebar-header'>
        <div
          className='user-profile'
          // This onClick now *toggles* the panel
          onClick={() => setShowEditProfile(prev => !prev)}
        >
          <img
            src={userDetails && userDetails.profilePic ? userDetails.profilePic : '...'}
            alt="profile picture"
            className='user-avatar'
          />
          <span className='user-name'>{userDetails ? userDetails.name : "Guest"}</span>
        </div>
        <img src={logo} alt="LinkMe Logo" className='sidebar-logo' />
      </div>
      {/* {showEditProfile && (
        <EditUserDetails
          onProfileUpdate={refreshUserDetails}
          onClose={() => setShowEditProfile(false)}
        />
      )} */}
      {/* Search Section */}
      <div className='sidebar-search'>
        <div className='search-wrapper'>
          <input
            type="text"
            placeholder='Search New friends..'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
          />
          <button className='search-btn' onClick={handleSearch}>
            <FaSearch />
          </button>
        </div>
        {showSearchResults && (
          <div className='search-results' ref={searchResultsRef}>
            {searchResults.length > 0 ? (
              searchResults.map(user => (
                <div key={user._id} className='search-result-item'>
                  <img src={user.profilePic || 'https://placehold.co/100x100/7e57c2/ffffff?text=U'} alt={`${user.name}'s avatar`} className='search-avatar' />
                  <div className='search-details'>
                    <p className='search-name'>{user.name}</p>
                    <p className='search-username'>@{user.userName}</p>
                  </div>
                  <button className='add-friend-btn' onClick={() => handleAddFriend(user)}>
                    <FaUserPlus /> Add
                  </button>
                </div>
              ))
            ) : (
              <div className='search-result-item no-results'>
                <p>No users found.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Friend Requests Section */}
      <FriendRequests />

      {/* Chats Section */}
      <div className='sidebar-chats'>
        <h2>Chats</h2>
        <ul className='chat-list'>
          {chatUsers.map(user => (
            <Link to={`/home/chat/${user.id}`} key={user.id} className="chat-link" onClick={() => dispatch(setSelectedFriend(user))}>
              <li className={`chat-item ${location.pathname === `/home/chat/${user.id}` ? 'active' : ''}`}>
                <img src={user.avatar} alt={`${user.name}'s avatar`} className='chat-avatar' />
                <div className='chat-details'>
                  <p className='chat-name'>{user.name}</p>
                  <p className='chat-message'>{user.message}</p>
                </div>

                {/* --- !! REPLACEMENT FOR TIME !! --- */}
                <div className='chat-status'>
                  {user.isOnline ? (
                    <span className='online-status'>Online</span>
                  ) : (
                    <span className='last-seen'>{formatLastSeen(user.lastSeen)}</span>
                  )}
                </div>
                {/* --- END REPLACEMENT --- */}

              </li>
            </Link>
          ))}
        </ul>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className='edit-profile-modal' onClick={() => setShowEditProfile(false)}>
          <div className='edit-profile-content' onClick={(e) => e.stopPropagation()}>
            <button className='close-modal' onClick={() => setShowEditProfile(false)}>×</button>
            <EditUserDetails
              onProfileUpdate={refreshUserDetails}
              onClose={() => setShowEditProfile(false)}
            />
          </div>
        </div>
      )}

      {/* Footer Section */}
      <div className='sidebar-footer'>
        <button className='sidebar-action-btn' onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;