import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect, useRef } from 'react';
import './MessagePage.css';
import { getSocket } from '../../socket';
import { setSelectedFriend } from '../../redux/userSlice';

import EmojiPicker from 'emoji-picker-react';

// --- Watch Together Imports ---
import WatchTogetherSearch from '../../Utility/MusicFeeds';
import WatchTogetherPlayer from '../MediaPlayer/WatchTogetherPlayer';
// --- React Icons ---
import {
    FaPaperclip,
    FaSmile,
    FaPaperPlane,
    FaTimes, // For cancel button
    FaFileAlt, // For generic file
    FaDownload // For download button
} from "react-icons/fa";
import { GiHamburgerMenu, GiMusicalNotes } from "react-icons/gi";
import { FaFileVideo } from "react-icons/fa";

const MessagePage = () => {
  // --- API URL ---
  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

  // --- Redux State ---
  const selectedFriend = useSelector((state) => state.user.selectedFriend);
  const currentUser = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // --- Component State ---
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showFriendDetails, setShowFriendDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // --- File Handling State (REVISED) ---
  const [selectedFile, setSelectedFile] = useState(null); // Holds file metadata
  const [filePreview, setFilePreview] = useState(null); // Holds Base64 data URL (for UI only)
  const [rawFile, setRawFile] = useState(null); // Holds the actual File object for upload
  const [isUploading, setIsUploading] = useState(false);

  // --- Watch Together State ---
  const [showMusicSearch, setShowMusicSearch] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);

  // --- Refs ---
  const messageAreaRef = useRef(null);
  const socketRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const fileInputRef = useRef(null);
  const friendDetailsRef = useRef(null);

  // --- Effects ---

  // Effect for Socket.io connection and message handling
  useEffect(() => {
    socketRef.current = getSocket();

    const handleReceiveMessage = (newMessage) => {
      if (newMessage.senderId === selectedFriend?.id) {
        setMessages(prevMessages => [...prevMessages, newMessage.message]);
      }
    };

    const handleReceiveFileMessage = (newMessage) => {
      if (newMessage.senderId === selectedFriend?.id) {
        setMessages(prevMessages => [...prevMessages, newMessage.message]);
      }
    };

  
    const handleRemoteVideoSelect = (payload) => {
      // Check if payload is the videoData itself, or if it's nested (e.g., { videoData: {...} })
      const videoData = payload.videoData || payload;
      
      // Ensure videoData is valid before setting
      if (videoData && typeof videoData === 'object' && videoData.id) {
        setActiveVideo(videoData);
        setShowMusicSearch(false);
      } else {
        console.warn("Received invalid video data from socket:", payload);
      }
    };

    const handleRemoteVideoClose = () => {
      setActiveVideo(null);
      setShowMusicSearch(false);
    };

    if (socketRef.current) {
      // Listen for messages
      socketRef.current.on('receiveMessage', handleReceiveMessage);
      socketRef.current.on('receiveFileMessage', handleReceiveFileMessage);
      
      // Listen for video events
      socketRef.current.on('video:select', handleRemoteVideoSelect);
      socketRef.current.on('video:close', handleRemoteVideoClose);
    }

    return () => {
      if (socketRef.current) {
        // Clean up message listeners
        socketRef.current.off('receiveMessage', handleReceiveMessage);
        socketRef.current.off('receiveFileMessage', handleReceiveFileMessage);
        
        // Clean up video listeners
        socketRef.current.off('video:select', handleRemoteVideoSelect);
        socketRef.current.off('video:close', handleRemoteVideoClose);
      }
    };
  }, [selectedFriend]);

  // Effect to fetch conversation history
  useEffect(() => {
    const fetchConversation = async () => {
      if (!selectedFriend?.id) return;

      setLoading(true);
      setError(null);
      setMessages([]); 
      setActiveVideo(null);
      setShowMusicSearch(false);

      try {
        const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
        const response = await fetch(`${API_URL}/api/conversation/${selectedFriend.id}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch conversation.');
        }
        const messageArray = await response.json();
        setMessages(messageArray);

      } catch (err) {
        setError(err.message || 'An error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [selectedFriend]);

  // Effect to scroll to bottom
  useEffect(() => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Effect to handle closing emoji picker and friend details dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiButtonRef.current && emojiButtonRef.current.contains(event.target)) {
        return;
      }
      if (emojiPickerRef.current && emojiPickerRef.current.contains(event.target)) {
        return;
      }
      if (friendDetailsRef.current && friendDetailsRef.current.contains(event.target)) {
        return;
      }
      setShowEmojiPicker(false);
      setShowFriendDetails(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // --- File Handlers (REVISED) ---

  const handleFileIconClick = () => {
    fileInputRef.current.click();
  };

  // Reads the selected file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB
      if (file.size > FILE_SIZE_LIMIT) {
        alert("File is too large. Maximum size is 10MB.");
        e.target.value = null;
        return;
      }

      // Store metadata for UI
      setSelectedFile({
        name: file.name,
        size: file.size,
        type: file.type
      });

      // Store the raw file for FormData upload
      setRawFile(file);

      // Generate Base64 preview for UI only
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      
      e.target.value = null;
    }
  };

  // Clears the file preview and selection
  const cancelFilePreview = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setRawFile(null); // Clear raw file
  };

  // --- Form Submit Handler (REVISED for FormData) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFriend?.id || isUploading) return;

    const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

    // Send a File (Using FormData) ---
    if (selectedFile && rawFile) {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('receiverId', selectedFriend.id);
      formData.append('file', rawFile, selectedFile.name); // 'file' should match backend 

      try {
        const response = await fetch(`${API_URL}/api/conversation/send-file`, { 
          method: 'POST',
          credentials: 'include',
          body: formData, 
        });

        const data = await response.json();
        if (data.success) {
          setMessages(prev => [...prev, data.data]);
          cancelFilePreview(); // Clear file state

          if (socketRef.current) {
            socketRef.current.emit('sendFileMessage', {
              senderId: currentUser._id,
              receiverId: selectedFriend.id,
              message: data.data,
            });
          }
        } else {
          console.error("Failed to send file:", data.message);
          alert("Failed to send file.");
        }
      } catch (err) {
        console.error('Error sending file:', err);
        alert("An error occurred while sending the file.");
      } finally {
        setIsUploading(false);
      }
    } 
    // Send a Text Message 
    else if (message.trim() !== '') {
      try {
        const payload = {
          receiverId: selectedFriend.id,
          text: message,
        };

        //  /api/conversation/send endpoint for text
        const response = await fetch(`${API_URL}/api/conversation/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (data.success) {
          setMessages(prev => [...prev, data.data]);
          setMessage('');
          setShowEmojiPicker(false);

          if (socketRef.current) {
            socketRef.current.emit('sendMessage', {
              senderId: currentUser._id,
              receiverId: selectedFriend.id,
              message: data.data,
            });
          }
        } else {
          console.error("Failed to send message:", data.message);
        }
      } catch (err) {
        console.error('Error sending message:', err);
      }
    }
  };

  // --- Watch Together Handlers ---

  const toggleWatchTogether = () => {
    const nextState = !showMusicSearch;
    setShowMusicSearch(nextState);

    // If closing, also close any active video
    if (!nextState || activeVideo) {
      setActiveVideo(null);
      if (socketRef.current) {
        socketRef.current.emit('video:close', { receiverId: selectedFriend.id });
      }
    }
  };

  // Renamed to be clear this is for LOCAL selection
  const handleLocalVideoSelect = (videoData) => {
    setActiveVideo(videoData);
    setShowMusicSearch(false);
    if (socketRef.current) {
      socketRef.current.emit('video:select', {
        receiverId: selectedFriend.id,
        videoData: videoData,
      });
    }
  };

  const handleClosePlayer = () => {
    setActiveVideo(null);
    setShowMusicSearch(false);
    if (socketRef.current) {
      socketRef.current.emit('video:close', { receiverId: selectedFriend.id });
    }
  };

  // --- Helper Functions ---

  const formatTimestamp = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleTimeString([], { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
    } catch (error) {
      return '';
    }
  };
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // --- RENDER: Message Content (Text, Image, Video, or Download Link) ---
  const renderMessageContent = (msg) => {
    // 1. Render file if fileUrl exists
    if (msg.fileUrl) {
      const fullUrl = `${API_URL}${msg.fileUrl}`;
      if (msg.fileType.startsWith('image/')) {
        return (
          <div className="message-media-container">
            <img src={fullUrl} alt={msg.fileName} className="message-image" />
            <a href={fullUrl} download={msg.fileName} className="download-btn" title="Download">
              <FaDownload />
            </a>
          </div>
        );
      }
      if (msg.fileType.startsWith('video/')) {
        return (
          <div className="message-media-container">
            <video src={fullUrl} controls className="message-video" />
            <a href={fullUrl} download={msg.fileName} className="download-btn" title="Download">
              <FaDownload />
            </a>
          </div>
        );
      }
      return (
        <a href={fullUrl} download={msg.fileName} className="message-file-link">
          <FaDownload className="file-link-icon" />
          <div className="message-file-info">
            <span className="file-link-name">{msg.fileName}</span>
            <span className="file-link-size">{formatFileSize(msg.fileSize)}</span>
          </div>
        </a>
      );
    }
    // 2. Render text if it exists
    if (msg.text) {
      return <p>{msg.text}</p>;
    }
    return null;
  };

  // --- Conditional Rendering: No Chat Selected ---
  if (!selectedFriend) {
    return (
      <div className='message-page-container'>
        <div className="no-chat-selected">          
          <h2>Welcome, {currentUser.name}!</h2>
          <p>Select a friend from your list to start chatting.</p>
        </div>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className='message-page-container'>
      {/* Chat Header */}
      <header className="chat-header">
        <div className="profile-info" >
          <img
            src={selectedFriend.avatar }
            alt={`${selectedFriend.name}'s avatar`}
            className="profile-picture"
          />
          <h2 className="profile-name">{selectedFriend.name}</h2>
        </div>
        <div className="header-right">
          <div className="header-options">
            <button 
              className={`icon-btn ${showMusicSearch || activeVideo ? 'active' : ''}`} 
              title="Watch Together"
              onClick={toggleWatchTogether}
            >
              <GiMusicalNotes />
            </button>
            {/* <button className="icon-btn" title="Video Call"><FaFileVideo /></button> */}
            <button className="icon-btn" title="More Info" onClick={() => setShowFriendDetails(true)}><GiHamburgerMenu /></button>
          </div>
          {/* Friend Details Dropdown */}
          {showFriendDetails && (
            <div className="friend-details-dropdown" ref={friendDetailsRef}>
              <div className="friend-details-content">
                <img src={selectedFriend.avatar || selectedFriend.profilePic || '/default-avatar.png'} alt={`${selectedFriend.name}'s avatar`} className="friend-avatar" />
                <h3 className="friend-name">{selectedFriend.name}</h3>
                <p className="friend-username">@{selectedFriend.userName}</p>
                <div className="dropdown-buttons">
                  <button className="clear-chat-btn" onClick={async () => {
                    try {
                      const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
                      const response = await fetch(`${API_URL}/api/conversation/${selectedFriend.id}`, {
                        method: 'DELETE',
                        credentials: 'include',
                      });
                      const data = await response.json();
                      if (data.success) {
                        setMessages([]);
                        setShowFriendDetails(false);
                      } else {
                        console.error(data.message || 'Failed to clear chat');
                      }
                    } catch (error) {
                      console.error('Error clearing chat:', error);
                    }
                  }}>
                    Clear Chat
                  </button>
                  <button className="remove-friend-btn" onClick={async () => {
                    try {
                      const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
                      const response = await fetch(`${API_URL}/api/remove-friend`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                          friendId: selectedFriend.id || selectedFriend._id,
                        }),
                      });
                      const data = await response.json();
                      if (data.success) {
                        dispatch(setSelectedFriend(null));
                        setShowFriendDetails(false);
                      } else {
                        console.error(data.message || 'Failed to remove friend');
                      }
                    } catch (error) {
                      console.error('Error removing friend:', error);
                    }
                  }}>
                    Remove from Friends
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Watch Together Container */}
      <div className="watch-together-container">
        {activeVideo && (
            <WatchTogetherPlayer
                video={activeVideo}
                socket={socketRef.current}
                receiverId={selectedFriend.id}
                onClose={handleClosePlayer}
            />
        )}
        {showMusicSearch && !activeVideo && (
            <WatchTogetherSearch
                onVideoSelect={handleLocalVideoSelect} // Use local handler
                onClose={() => setShowMusicSearch(false)}
            />
        )}
      </div>

      {/* Message Display Area */}
      <main className="message-area" ref={messageAreaRef}>
        {loading && <div className="centered-feedback">Loading messages...</div>}
        {error && <div className="centered-feedback error">{error}</div>}
        
        {!loading && !error && messages.map((msg) => (
          <div key={msg._id} className={`message-bubble-wrapper ${msg.sender === currentUser._id ? 'sent' : 'received'}`}>
            <div className="message-bubble">
              {renderMessageContent(msg)}
              <span className="message-timestamp">{formatTimestamp(msg.createdAt)}</span>
            </div>
          </div>
        ))}
      </main>

      {/* Chat Footer */}
      <footer className="chat-footer">
        {showEmojiPicker && (
          <div className="emoji-picker-container" ref={emojiPickerRef}>
            <EmojiPicker
              onEmojiClick={(emojiObject) => {
                setMessage(prevMessage => prevMessage + emojiObject.emoji);
              }}
              height={350}
              width="100%"
              searchDisabled
              previewConfig={{ showPreview: false }}
              lazyLoadEmojis={true}
            />
          </div>
        )}

        {/* File Preview Bar (uses filePreview for UI) */}
        {filePreview && (
          <div className="file-preview-container">
            {selectedFile?.type.startsWith('image/') ? (
              <img src={filePreview} alt="Preview" className="file-preview-thumbnail" />
            ) : (
              <FaFileAlt className="file-preview-icon" />
            )}
            <span className="file-preview-name" title={selectedFile?.name}>
              {selectedFile?.name} ({formatFileSize(selectedFile?.size)})
            </span>
            <button type="button" onClick={cancelFilePreview} className="cancel-preview-btn" title="Cancel">
              <FaTimes />
            </button>
          </div>
        )}

        {/* Message Input Form */}
        <form className="message-input-form" onSubmit={handleSubmit}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
          />

          <button 
            type="button" 
            className="icon-btn" 
            title="Attach File"
            onClick={handleFileIconClick}
            disabled={isUploading}
          >
            <FaPaperclip />
          </button>
          
          <button
            type="button"
            className="icon-btn"
            title="Open Emojis"
            ref={emojiButtonRef}
            onClick={() => setShowEmojiPicker(prev => !prev)}
            disabled={isUploading}
          >
            <FaSmile />
          </button>

          <input
            type="text"
            placeholder={selectedFile ? 'File selected. Press send.' : 'Type a message...'}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={() => setShowEmojiPicker(false)}
            disabled={!!selectedFile || isUploading}
          />
          
          <button 
            type="submit" 
            className="send-btn" 
            title="Send Message" 
            disabled={!message.trim() && !selectedFile || isUploading}
          >
            {isUploading ? <div className="spinner"></div> : <FaPaperPlane />}
          </button>
        </form>
      </footer>
    </div>
  );
};

export default MessagePage;

