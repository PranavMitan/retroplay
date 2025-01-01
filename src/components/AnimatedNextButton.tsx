interface AnimatedNextButtonProps {
  onClick: () => void;
  loading: boolean;
  isFirstClick?: boolean;
}

const buttonTexts = [
  "Hit me again",
  "One more time",
  "Keep it rolling",
  "Next banger",
  "Another one",
  "Surprise me",
  "Roll it",
  "Next vibe",
  "Switch it up",
  "Hit shuffle"
];

export function AnimatedNextButton({ onClick, loading, isFirstClick = true }: AnimatedNextButtonProps) {
  const getRandomText = () => buttonTexts[Math.floor(Math.random() * buttonTexts.length)];
  const [buttonText, setButtonText] = React.useState("Drop the beat");

  const handleClick = () => {
    onClick();
    if (!isFirstClick) {
      setButtonText(getRandomText());
    }
  };

  return (
    <button 
      onClick={handleClick} 
      className="next-button"
      disabled={loading}
    >
      {buttonText}
      <span className="material-icons">
        {loading ? 'sync' : 'auto_awesome'}
      </span>
    </button>
  );
} 