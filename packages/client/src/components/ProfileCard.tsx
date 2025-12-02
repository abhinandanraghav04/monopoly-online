import { formatDistanceToNow } from '../utils/date';

export interface ProfileCardProps {
  avatar: string;
  name: string;
  level: number;
  wins: number;
  losses: number;
  lastActive: Date | string;
  onAddFriend?: () => void;
  onMessage?: () => void;
}

export function ProfileCard({
  avatar,
  name,
  level,
  wins,
  losses,
  lastActive,
  onAddFriend,
  onMessage
}: ProfileCardProps) {
  const totalGames = wins + losses;
  const winRate = totalGames === 0 ? 0 : Math.round((wins / totalGames) * 100);

  return (
    <div className="profile-card">
      <div className="profile-card__header">
        <img src={avatar} alt={`${name} avatar`} className="profile-card__avatar" />
        <div>
          <h3>{name}</h3>
          <p className="profile-card__level">Level {level}</p>
        </div>
      </div>

      <div className="profile-card__stats">
        <div>
          <span className="profile-card__label">W/L</span>
          <span>{wins} / {losses}</span>
        </div>
        <div>
          <span className="profile-card__label">Win Rate</span>
          <span>{winRate}%</span>
        </div>
        <div>
          <span className="profile-card__label">Last Active</span>
          <span>{formatDistanceToNow(lastActive)}</span>
        </div>
      </div>

      <div className="profile-card__actions">
        <button type="button" onClick={onAddFriend} className="profile-card__button">
          Add Friend
        </button>
        <button type="button" onClick={onMessage} className="profile-card__button profile-card__button--secondary">
          Message
        </button>
      </div>
    </div>
  );
}
