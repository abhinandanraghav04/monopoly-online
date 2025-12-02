import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useUserStore } from '../services/userService';
import { useGameHistoryStore } from '../services/gameHistoryService';
import { formatDistanceToNow, formatDuration } from '../utils/date';
import { useToast } from '../components/ToastContainer';
import { LoadingSpinner } from '../components/LoadingSpinner';
import './Profile.css';

export function Profile() {
  const { id } = useParams<{ id: string }>();
  const { currentUser, friends, loadFriends, addFriend: addFriendAction, loading: userLoading, error: userError } = useUserStore();
  const { games, fetchHistory, loading: historyLoading, error: historyError } = useGameHistoryStore();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', avatar: '' });
  const [friendUsername, setFriendUsername] = useState('');

  const isOwnProfile = currentUser?.id === id;

  useEffect(() => {
    if (id) {
      fetchHistory(id);
      if (isOwnProfile) {
        loadFriends();
      }
    }
  }, [id, fetchHistory, isOwnProfile, loadFriends]);

  const handleEditProfile = () => {
    if (!currentUser) return;
    setEditForm({ username: currentUser.username, avatar: currentUser.avatar });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      await useUserStore.getState().updateProfile(editForm);
      setIsEditing(false);
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      showToast('Failed to update profile', 'error');
    }
  };

  const handleAddFriend = async () => {
    if (friendUsername.trim()) {
      try {
        await addFriendAction(friendUsername);
        setFriendUsername('');
        showToast(`${friendUsername} added to friends!`, 'success');
      } catch (error) {
        showToast(`Failed to add ${friendUsername}`, 'error');
      }
    } else {
      showToast('Please enter a username', 'warning');
    }
  };

  useEffect(() => {
    if (userError) {
      showToast(userError, 'error');
    }
    if (historyError) {
      showToast(historyError, 'error');
    }
  }, [userError, historyError, showToast]);

  const stats = useMemo(() => {
    if (!currentUser) return null;
    
    const winRate = currentUser.totalGames === 0 ? 0 : Math.round((currentUser.wins / currentUser.totalGames) * 100);
    const avgGameLength = games.length === 0 ? 0 : Math.round(games.reduce((sum, game) => sum + game.durationMinutes, 0) / games.length);
    
    const boardSizeCounts: Record<number, number> = {};
    games.forEach((game) => {
      boardSizeCounts[game.boardSize] = (boardSizeCounts[game.boardSize] ?? 0) + 1;
    });
    const favoriteBoardSize = Object.entries(boardSizeCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'N/A';

    return { winRate, avgGameLength, favoriteBoardSize };
  }, [currentUser, games]);

  if (userLoading || !currentUser) {
    return (
      <div className="profile__loading">
        <LoadingSpinner size="large" text="Loading profile..." />
      </div>
    );
  }

  if (!stats) {
    return <div className="profile__loading">Loading profile data...</div>;
  }

  const favoriteBoardDisplay = stats.favoriteBoardSize === 'N/A'
    ? 'N/A'
    : `${stats.favoriteBoardSize}x${stats.favoriteBoardSize}`;

  return (
    <div className="profile">
      <div className="profile__header">
        <img src={currentUser.avatar} alt={currentUser.username} className="profile__avatar" />
        <div className="profile__info">
          <h1>{currentUser.username}</h1>
          <p className="profile__level">Level {currentUser.level}</p>
          <p className="profile__last-active">Last active: {formatDistanceToNow(currentUser.lastActive)}</p>
        </div>
        {isOwnProfile && (
          <button className="profile__edit-btn" onClick={handleEditProfile}>
            Edit Profile
          </button>
        )}
      </div>

      <div className="profile__stats-grid">
        <div className="profile__stat-card">
          <h3>Total Games</h3>
          <p className="profile__stat-value">{currentUser.totalGames}</p>
        </div>
        <div className="profile__stat-card">
          <h3>Wins / Losses</h3>
          <p className="profile__stat-value">{currentUser.wins} / {currentUser.losses}</p>
        </div>
        <div className="profile__stat-card">
          <h3>Win Rate</h3>
          <p className="profile__stat-value">{stats.winRate}%</p>
        </div>
        <div className="profile__stat-card">
          <h3>Total Earnings</h3>
          <p className="profile__stat-value">${currentUser.totalEarnings.toLocaleString()}</p>
        </div>
      </div>

      <div className="profile__dashboard">
        <div className="profile__section">
          <h2>Statistics</h2>
          <div className="profile__stats-details">
            <div className="profile__detail">
              <span className="profile__detail-label">Average Game Length</span>
              <span className="profile__detail-value">{formatDuration(stats.avgGameLength)}</span>
            </div>
            <div className="profile__detail">
              <span className="profile__detail-label">Favorite Board Size</span>
              <span className="profile__detail-value">{favoriteBoardDisplay}</span>
            </div>
          </div>
        </div>

        {isOwnProfile && (
          <div className="profile__section">
            <h2>Achievements</h2>
            <div className="profile__achievements">
              {currentUser.achievements.length === 0 ? (
                <p className="profile__empty">No achievements yet. Play more games to unlock them!</p>
              ) : (
                currentUser.achievements.map((achievement) => (
                  <div key={achievement} className="profile__achievement">
                    {achievement === 'first_win' && '🏆 First Victory'}
                    {achievement === 'high_roller' && '🎲 High Roller'}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="profile__section">
          <h2>Game History</h2>
          <div className="profile__game-history">
            {historyLoading ? (
              <LoadingSpinner text="Loading game history..." />
            ) : games.length === 0 ? (
              <p className="profile__empty">No games played yet.</p>
            ) : (
              games.slice(0, 10).map((game) => (
                <div key={game.id} className="profile__game-entry">
                  <div className={`profile__game-result ${game.isWinner ? 'profile__game-result--win' : 'profile__game-result--loss'}`}>
                    {game.isWinner ? 'W' : 'L'}
                  </div>
                  <div>
                    <strong>{game.boardSize}x{game.boardSize} Board</strong>
                    <p className="profile__game-meta">
                      {game.players.length} players • {formatDuration(game.durationMinutes)} • {formatDistanceToNow(game.finishedAt)}
                    </p>
                  </div>
                  <div className="profile__game-earnings">
                    ${game.earnings[currentUser.id]?.toLocaleString() ?? 0}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {isOwnProfile && (
          <div className="profile__section">
            <h2>Friends</h2>
            <div className="profile__friends-add">
              <input
                type="text"
                placeholder="Add friend by username"
                value={friendUsername}
                onChange={(e) => setFriendUsername(e.target.value)}
              />
              <button onClick={handleAddFriend}>Add Friend</button>
            </div>
            <div className="profile__friends-list">
              {friends.length === 0 ? (
                <p className="profile__empty">No friends yet. Add some to see them here!</p>
              ) : (
                friends.map((friend) => (
                  <div key={friend.id} className="profile__friend-card">
                    <img src={friend.avatar} alt={friend.username} />
                    <div>
                      <strong>{friend.username}</strong>
                      <span>Level {friend.level}</span>
                    </div>
                    <div className="profile__friend-stats">
                      <span>{friend.wins}W</span>
                      <span>{friend.losses}L</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {isEditing && (
        <div className="modal-overlay" onClick={() => setIsEditing(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Profile</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
              <div className="modal__field">
                <label>Username</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                />
              </div>
              <div className="modal__field">
                <label>Avatar URL</label>
                <input
                  type="text"
                  value={editForm.avatar}
                  onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                />
              </div>
              <div className="modal__actions">
                <button type="submit" className="modal__submit">Save</button>
                <button type="button" className="modal__cancel" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
