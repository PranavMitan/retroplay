import React from 'react';
import ReactPlayer from 'react-player';
import './App.css';
import { AnimatedNextButton } from './components/AnimatedNextButton';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = React.useState(false);

  const fetchRandomShort = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/videos/random`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch video');
      }

      const video = await response.json();
      setVideoUrl(`https://www.youtube.com/watch?v=${video.videoId}`);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Error fetching educational short');
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = window.location.href;
  
  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=Check out this awesome YouTube Shorts player!`,
    instagram: `https://www.instagram.com/?url=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this awesome YouTube Shorts player! ${shareUrl}`)}`
  };

  return (
    <div className="App">
      <div className="film-background"></div>
      <div className="logo">WatchSomething Wonderful</div>
      <div className="share-container">
        <button 
          className={`share-button ${showShareMenu ? 'active' : ''}`}
          onClick={() => setShowShareMenu(!showShareMenu)}
        >
          Share
        </button>
        {showShareMenu && (
          <div className="share-menu">
            <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="share-option">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Twitter
            </a>
            <a href={shareLinks.instagram} target="_blank" rel="noopener noreferrer" className="share-option">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Instagram
            </a>
            <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="share-option">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
          </div>
        )}
      </div>
      <div className="content">
        {!videoUrl ? (
          <div className="landing-page">
            <h1>Skip the Scroll,</h1>
            <h1>Wonderful <span className="highlight">Shorts</span> on a Tap.</h1>
            <AnimatedNextButton 
              onClick={fetchRandomShort}
              loading={loading}
              text="Start Playing ▶"
            />
          </div>
        ) : (
          <>
            <div className="video-wrapper">
              <div className="video-container">
                <ReactPlayer
                  url={videoUrl}
                  width="100%"
                  height="100%"
                  playing={true}
                  controls={true}
                  style={{ display: 'block', margin: '0 auto' }}
                />
              </div>
            </div>
            <AnimatedNextButton 
              onClick={fetchRandomShort}
              loading={loading}
              text="Hit me with Another!"
            />
          </>
        )}
        {error && <div className="error">{error}</div>}
      </div>
      <div className="footer">A Team 7 Product</div>
    </div>
  );
}

export default App;
