import React, { useEffect, useState } from 'react';
import './MusicFeeds.css'
import { FaTimes } from 'react-icons/fa';
import moment from 'moment';

// Make sure to put your YouTube API Key in your .env file
const API_KEY = import.meta.env.VITE_YOUTUBE_API;

// Value converter (you can move this to a helpers file)
const value_converter = (value) => {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + "M";
    if (value >= 1000) return (value / 1000).toFixed(1) + "K";
    return value.toString();
};

const MusicFeeds = ({ onVideoSelect, onClose }) => {
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const fetchPopularMusic = async () => {
        setIsLoading(true);
        const url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&chart=mostPopular&maxResults=20&regionCode=US&videoCategoryId=10&key=${API_KEY}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            setData(data.items || []);
        } catch (err) { console.log(err); }
        setIsLoading(false);
    };

    const fetchSearchedMusic = async () => {
        if (searchTerm.trim() === "") return;
        setIsLoading(true);
        try {
            const search_url = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${searchTerm}&maxResults=20&videoCategoryId=10&type=video&key=${API_KEY}`;
            const searchResponse = await fetch(search_url);
            const searchData = await searchResponse.json();

            if (!searchData.items || searchData.items.length === 0) {
                setData([]);
                setIsLoading(false);
                return;
            }

            const videoIds = searchData.items.map(item => item.id.videoId).join(',');
            const stats_url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${videoIds}&key=${API_KEY}`;
            
            const statsResponse = await fetch(stats_url);
            const statsData = await statsResponse.json();
            setData(statsData.items || []);

        } catch (err) { console.log(err); }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchPopularMusic();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchSearchedMusic();
    };

    return (
        <div className="watch-together-search">
            <div className="search-header">
                <h3>Watch Together</h3>
                <button className="close-btn" onClick={onClose}>
                    <FaTimes />
                </button>
            </div>
            
            <form className="search-bar" onSubmit={handleSearch}>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for music..."
                />
                <button type="submit">Search</button>
            </form>

            <div className='search-feed'>
                {isLoading ? (
                    <p>Loading...</p>
                ) : data.length > 0 ? (
                    data.map((item) => (
                        <div
                            className="search-card"
                            key={item.id}
                            onClick={() => onVideoSelect(item)} // Pass the full item
                        >
                            <img src={item.snippet.thumbnails.medium.url} alt="thumbnail" />
                            <div className="card-info">
                                <h2>{item.snippet.title}</h2>
                                <h3>{item.snippet.channelTitle}</h3>
                                <p>
                                    {value_converter(item.statistics.viewCount)} views • {moment(item.snippet.publishedAt).fromNow()}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No videos found.</p>
                )}
            </div>
        </div>
    );
};

export default MusicFeeds;

