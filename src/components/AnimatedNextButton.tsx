interface AnimatedNextButtonProps {
  onClick: () => void;
  loading: boolean;
}

export function AnimatedNextButton({ onClick, loading }: AnimatedNextButtonProps) {
  return (
    <button 
      onClick={onClick} 
      className="next-button"
      disabled={loading}
    >
      Drop the beat
      <span className="material-icons">
        {loading ? 'sync' : 'auto_awesome'}
      </span>
    </button>
  );
} 