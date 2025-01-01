import React from 'react';
import ReactPlayer from 'react-player';
import './App.css';
import { AnimatedNextButton } from './components/AnimatedNextButton';
import { getErrorMessage } from './utils/errorMessages';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [showShareMenu, setShowShareMenu] = React.useState(false);
  const [showToast, setShowToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');

  const showErrorToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const fetchRandomShort = async () => {
    setLoading(true);

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
      showErrorToast(getErrorMessage());
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = window.location.href;
  
  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=Check out this awesome retro music player!`,
    whatsapp: `whatsapp://send?text=${encodeURIComponent(`Check out these amazing retro music videos! ${shareUrl}`)}`
  };

  const handleShare = (platform: string) => {
    try {
      const url = shareLinks[platform as keyof typeof shareLinks];
      window.location.href = url;
      
      setTimeout(() => {
        if (platform === 'whatsapp') {
          window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(`Check out these amazing retro music videos! ${shareUrl}`)}`, '_blank');
        }
      }, 500);
    } catch (err) {
      showErrorToast(getErrorMessage());
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setToastMessage('Link copied to clipboard! 📋');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      showErrorToast(getErrorMessage());
    }
  };

  return (
    <div className="App">
      <video 
        className="background-video"
        autoPlay 
        muted 
        loop 
        playsInline
      >
        <source 
          src="https://res.cloudinary.com/dldcpwyax/video/upload/v1735715983/new_vintage_jkoo6a.mp4"
          type="video/mp4"
        />
      </video>
      <div className="logo">
        <span>Retro Play 🎵</span>
      </div>
      <div className="share-container">
        <button 
          className={`share-button ${showShareMenu ? 'active' : ''}`}
          onClick={() => setShowShareMenu(!showShareMenu)}
        >
          Share
        </button>
        {showShareMenu && (
          <div className="share-menu">
            <a className="share-option" onClick={handleCopyLink}>
              <span className="material-icons">link</span>
              Copy Link
            </a>
            <div className="share-divider"></div>
            <a className="share-option" onClick={() => handleShare('twitter')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Twitter
            </a>
            <a className="share-option" onClick={() => handleShare('whatsapp')}>
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
            <h1>Your Grandpa's</h1>
            <h1>Playlist Could <span className="highlight">Never</span>.</h1>
            <AnimatedNextButton 
              onClick={fetchRandomShort}
              loading={loading}
              isFirstClick={!videoUrl}
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
              isFirstClick={!videoUrl}
            />
          </>
        )}
      </div>
      <div className="footer">
        Built by <a href="https://x.com/prnvtweets" target="_blank" rel="noopener noreferrer">Pranav Mitan</a>
      </div>
      {showToast && (
        <div className="toast">
          <span className="material-icons">
            {toastMessage.includes('copied') ? 'check_circle' : 'error'}
          </span>
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default App;
