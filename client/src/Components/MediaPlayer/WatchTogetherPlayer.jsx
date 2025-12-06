import React, { useRef, useEffect, useState } from 'react';
import YouTube from 'react-youtube';
import './WatchTogetherPlayer.css'
import { FaTimes } from 'react-icons/fa';

const WatchTogetherPlayer = ({ video, socket, receiverId, onClose }) => {
    const playerRef = useRef(null);
    const lastSeekTime = useRef(0);
    const [maximize , isMaximize]=useState(false);
    
    //resize player
    const handlePlayerSize=()=>{
        if(!maximize){
            isMaximize(true);

        }else{
            isMaximize(false);
        }
    }


    // --- Event Handlers for Local Player ---

    // When the user *local* clicks play
    const handlePlay = () => {
        console.log("Local Play");
        socket.emit('video:play', { receiverId });
    };

    // When the user *local* clicks pause
    const handlePause = () => {
        console.log("Local Pause");
        socket.emit('video:pause', { receiverId });
    };

    
    // When the player state changes (used to detect seek)
    const handleStateChange = (event) => {
        // event.data === 3 means buffering
        // This often happens during a seek.
        if (event.data === 3) {
            const currentTime = playerRef.current?.getCurrentTime();
            if (currentTime) {
                // To avoid spamming sync events, only send if time changed significantly
                if (Math.abs(currentTime - lastSeekTime.current) > 1.5) {
                    console.log("Local Seek (Buffering):", currentTime);
                    lastSeekTime.current = currentTime;
                    socket.emit('video:sync', { receiverId, time: currentTime });
                }
            }
        }
    };
    
    // When the user *local* closes the player
    const handleClose = () => {
        onClose(); // This will set activeVideo(null) in MessagePage
        socket.emit('video:close', { receiverId });
    };

    // --- Socket Listeners for Remote Events ---
    useEffect(() => {
        if (!socket) return;

        const onRemotePlay = () => {
            console.log('Remote play');
            playerRef.current?.playVideo();
        };

        const onRemotePause = () => {
             console.log('Remote pause');
            playerRef.current?.pauseVideo();
        };

        const onRemoteSync = ({ time }) => {
            console.log('Remote sync', time);
            const localTime = playerRef.current?.getCurrentTime();
            // Only seek if the time difference is significant (e.g., > 1.5 seconds)
            // to avoid jitter from minor latency.
            if (Math.abs(localTime - time) > 1.5) {
                 playerRef.current?.seekTo(time, true); // true = allow seek ahead
            }
        };

        socket.on('video:play', onRemotePlay);
        socket.on('video:pause', onRemotePause);
        socket.on('video:sync', onRemoteSync);

        return () => {
            socket.off('video:play', onRemotePlay);
            socket.off('video:pause', onRemotePause);
            socket.off('video:sync', onRemoteSync);
        };
    }, [socket, playerRef]);

    const playerOptions = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 1, // Auto-play when it loads
            controls: 1, // Show native controls
        },
    };

    // This function runs when the player is ready
    const onReady = (event) => {
        playerRef.current = event.target; // Save the player reference
    };

    return (
        <div className={maximize ? "watch-together-player maximized" : "watch-together-player"}>
            <div className={maximize ? 'player-container maximize' : 'player-container'} >
                <YouTube
                    videoId={video.id}
                    opts={playerOptions}
                    onReady={onReady}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onStateChange={handleStateChange}
                    className="youtube-component-wrapper" 
                />
            </div>
            <div className="player-info">
                <h4>{video.snippet.title}</h4>
                <p>{video.snippet.channelTitle}</p>
            </div>
            <button className='close-btn'onClick={handlePlayerSize} >
                {maximize?'minimize':'maximize'}
            </button>
            <button className="close-btn" onClick={handleClose}>
                <FaTimes />
            </button>
        </div>
    );
};

export default WatchTogetherPlayer;

