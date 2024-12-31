import React from 'react';
import { useLottie } from 'lottie-react';
import refreshAnimation from '../assets/animation.json';

interface Props {
  onClick: () => void;
  loading: boolean;
  text: string;
}

export function AnimatedNextButton({ onClick, loading, text }: Props) {
  const { View, playSegments, stop } = useLottie({
    animationData: refreshAnimation,
    loop: loading,
    autoplay: false
  });

  const handleClick = () => {
    if (!loading) {
      playSegments([0, 60], true);
      onClick();
    }
  };

  React.useEffect(() => {
    if (!loading) {
      stop();
    }
  }, [loading, stop]);

  return (
    <button 
      onClick={handleClick} 
      className="next-button"
      disabled={loading}
    >
      {text}
      <div className="next-icon">
        {View}
      </div>
    </button>
  );
} 