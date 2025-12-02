import './LoadingSpinner.css';

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

export function LoadingSpinner({ size = 'medium', text }: LoadingSpinnerProps) {
  return (
    <div className="loading-spinner-container" role="status" aria-live="polite">
      <div className={`loading-spinner loading-spinner--${size}`}>
        <div className="loading-spinner__ring"></div>
        <div className="loading-spinner__ring"></div>
        <div className="loading-spinner__ring"></div>
      </div>
      {text && <span className="loading-spinner__text">{text}</span>}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
