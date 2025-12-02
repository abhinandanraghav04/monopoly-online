import { useEffect, useState } from 'react';
import { useLeaderboardStore } from '../services/leaderboardService';
import { useUserStore } from '../services/userService';
import type { LeaderboardSort, LeaderboardFilterRange } from '../services/leaderboardService';
import './Leaderboard.css';

export function Leaderboard() {
  const { currentUser, friends, loadFriends } = useUserStore();
  const { entries, total, page, loading, range, sort, fetchLeaderboard, setRange, setSort } = useLeaderboardStore();
  const [viewMode, setViewMode] = useState<'global' | 'friends'>('global');

  useEffect(() => {
    fetchLeaderboard();
    if (currentUser) {
      loadFriends();
    }
  }, [fetchLeaderboard, currentUser, loadFriends]);

  const handleSortChange = (newSort: LeaderboardSort) => {
    setSort(newSort);
    fetchLeaderboard({ sort: newSort, page: 1 });
  };

  const handleRangeChange = (newRange: LeaderboardFilterRange) => {
    setRange(newRange);
  };

  const handlePageChange = (newPage: number) => {
    fetchLeaderboard({ page: newPage });
  };

  const displayEntries = viewMode === 'friends'
    ? entries.filter((entry) => friends.some((friend) => friend.id === entry.id))
    : entries;

  const totalPages = Math.ceil(total / 25);

  return (
    <div className="leaderboard">
      <div className="leaderboard__header">
        <h1>Leaderboard</h1>
        <div className="leaderboard__view-toggle">
          <button
            className={viewMode === 'global' ? 'active' : ''}
            onClick={() => setViewMode('global')}
          >
            Global
          </button>
          <button
            className={viewMode === 'friends' ? 'active' : ''}
            onClick={() => setViewMode('friends')}
          >
            Friends
          </button>
        </div>
      </div>

      <div className="leaderboard__filters">
        <div className="leaderboard__filter-group">
          <span className="leaderboard__filter-label">Range:</span>
          <button
            className={range === 'all-time' ? 'active' : ''}
            onClick={() => handleRangeChange('all-time')}
          >
            All-Time
          </button>
          <button
            className={range === 'month' ? 'active' : ''}
            onClick={() => handleRangeChange('month')}
          >
            This Month
          </button>
          <button
            className={range === 'week' ? 'active' : ''}
            onClick={() => handleRangeChange('week')}
          >
            This Week
          </button>
        </div>

        <div className="leaderboard__filter-group">
          <span className="leaderboard__filter-label">Sort by:</span>
          <button
            className={sort === 'wins' ? 'active' : ''}
            onClick={() => handleSortChange('wins')}
          >
            Wins
          </button>
          <button
            className={sort === 'winRate' ? 'active' : ''}
            onClick={() => handleSortChange('winRate')}
          >
            Win Rate
          </button>
          <button
            className={sort === 'level' ? 'active' : ''}
            onClick={() => handleSortChange('level')}
          >
            Level
          </button>
        </div>
      </div>

      {loading ? (
        <div className="leaderboard__loading">Loading rankings...</div>
      ) : displayEntries.length === 0 ? (
        <div className="leaderboard__empty">No entries found.</div>
      ) : (
        <div className="leaderboard__table">
          <div className="leaderboard__header-row">
            <span>Rank</span>
            <span>Player</span>
            <span>Level</span>
            <span>Wins</span>
            <span>Losses</span>
            <span>Win Rate</span>
          </div>
          {displayEntries.map((entry) => (
            <div
              key={entry.id}
              className={`leaderboard__row ${currentUser?.id === entry.id ? 'leaderboard__row--current' : ''}`}
            >
              <div className="leaderboard__rank">
                {entry.rank <= 3 ? (
                  <span className={`leaderboard__medal leaderboard__medal--${entry.rank}`}>
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                  </span>
                ) : (
                  <span>{entry.rank}</span>
                )}
              </div>
              <div className="leaderboard__player">
                <img src={entry.avatar} alt={entry.username} />
                <span>{entry.username}</span>
              </div>
              <div className="leaderboard__level">{entry.level}</div>
              <div className="leaderboard__wins">{entry.wins}</div>
              <div className="leaderboard__losses">{entry.losses}</div>
              <div className="leaderboard__win-rate">{entry.winRate}%</div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="leaderboard__pagination">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="leaderboard__page-btn"
          >
            Previous
          </button>
          <span className="leaderboard__page-info">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="leaderboard__page-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
