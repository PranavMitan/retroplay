import React from 'react';
import { useLottie } from 'lottie-react';
import refreshAnimation from '../assets/animation.json';

interface AnimatedNextButtonProps {
  onClick: () => void;
  loading: boolean;
  text: string | JSX.Element;
}

export function AnimatedNextButton({ onClick, loading, text }: AnimatedNextButtonProps) {
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