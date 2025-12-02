import { useEffect, useState } from 'react';
import { useLeaderboardStore } from '../services/leaderboardService';
import { useUserStore } from '../services/userService';
import type { LeaderboardSort, LeaderboardFilterRange } from '../services/leaderboardService';
import { useToast } from '../components/ToastContainer';
import { LoadingSpinner } from '../components/LoadingSpinner';
import './Leaderboard.css';

export function Leaderboard() {
  const { currentUser, friends, loadFriends } = useUserStore();
  const { entries, total, page, loading, range, sort, error, fetchLeaderboard, setRange, setSort } = useLeaderboardStore();
  const { showToast } = useToast();
  const [viewMode, setViewMode] = useState<'global' | 'friends'>('global');

  useEffect(() => {
    fetchLeaderboard().catch(() => {
      showToast('Failed to load leaderboard', 'error');
    });
    if (currentUser) {
      loadFriends();
    }
  }, [fetchLeaderboard, currentUser, loadFriends, showToast]);

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error, showToast]);

  const sortLabels: Record<LeaderboardSort, string> = {
    wins: 'wins',
    winRate: 'win rate',
    level: 'level'
  };

  const rangeLabels: Record<LeaderboardFilterRange, string> = {
    'all-time': 'All-Time',
    month: 'This Month',
    week: 'This Week'
  };

  const handleSortChange = (newSort: LeaderboardSort) => {
    if (sort === newSort) return;
    setSort(newSort);
    showToast(`Sorting by ${sortLabels[newSort]}`, 'info');
    fetchLeaderboard({ sort: newSort, page: 1 });
  };

  const handleRangeChange = (newRange: LeaderboardFilterRange) => {
    if (range === newRange) return;
    setRange(newRange);
    showToast(`Showing ${rangeLabels[newRange]} rankings`, 'info');
  };

  const handlePageChange = (newPage: number) => {
    fetchLeaderboard({ page: newPage });
    showToast(`Loading page ${newPage}`, 'info', 1500);
  };

  const handleViewModeChange = (mode: 'global' | 'friends') => {
    setViewMode(mode);
    showToast(mode === 'global' ? 'Displaying global rankings' : 'Displaying friends rankings', 'info');
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
            onClick={() => handleViewModeChange('global')}
            aria-label="Show global leaderboard"
            aria-pressed={viewMode === 'global'}
          >
            Global
          </button>
          <button
            className={viewMode === 'friends' ? 'active' : ''}
            onClick={() => handleViewModeChange('friends')}
            aria-label="Show friends leaderboard"
            aria-pressed={viewMode === 'friends'}
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
        <div className="leaderboard__loading" role="status" aria-live="polite">
          <LoadingSpinner size="large" text="Loading rankings..." />
        </div>
      ) : displayEntries.length === 0 ? (
        <div className="leaderboard__empty">No entries found.</div>
      ) : (
        <div className="leaderboard__table" role="table" aria-label="Leaderboard standings">
          <div className="leaderboard__header-row" role="row">
            <span role="columnheader">Rank</span>
            <span role="columnheader">Player</span>
            <span role="columnheader">Level</span>
            <span role="columnheader">Wins</span>
            <span role="columnheader">Losses</span>
            <span role="columnheader">Win Rate</span>
          </div>
          {displayEntries.map((entry) => (
            <div
              key={entry.id}
              className={`leaderboard__row ${currentUser?.id === entry.id ? 'leaderboard__row--current' : ''}`}
              role="row"
            >
              <div className="leaderboard__rank" role="cell">
                {entry.rank <= 3 ? (
                  <span className={`leaderboard__medal leaderboard__medal--${entry.rank}`}>
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                  </span>
                ) : (
                  <span>{entry.rank}</span>
                )}
              </div>
              <div className="leaderboard__player" role="cell">
                <img src={entry.avatar} alt={entry.username} />
                <span>{entry.username}</span>
              </div>
              <div className="leaderboard__level" role="cell">{entry.level}</div>
              <div className="leaderboard__wins" role="cell">{entry.wins}</div>
              <div className="leaderboard__losses" role="cell">{entry.losses}</div>
              <div className="leaderboard__win-rate" role="cell">{entry.winRate}%</div>
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
