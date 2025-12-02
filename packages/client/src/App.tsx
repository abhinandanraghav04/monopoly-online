import { useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { socketService } from './services/socketService';
import { useUserStore } from './services/userService';
import './App.css';

function App() {
  const { currentUser, createProfile } = useUserStore();
  const location = useLocation();

  useEffect(() => {
    socketService.connect();

    if (!currentUser) {
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        useUserStore.getState().fetchUser(storedUserId);
      } else {
        createProfile(`Player${Math.floor(Math.random() * 10000)}`).then(() => {
          const user = useUserStore.getState().currentUser;
          if (user) {
            localStorage.setItem('userId', user.id);
          }
        });
      }
    }

    return () => {
      socketService.disconnect();
    };
  }, [createProfile, currentUser]);

  return (
    <div className="app">
      <nav className="app-nav" aria-label="Main navigation">
        <div className="app-nav__branding">
          <span className="app-nav__badge" aria-hidden="true">R</span>
          <h1>Monopoly Nexus</h1>
        </div>
        <div className="app-nav__links" role="list">
          <NavLink to="/lobby" className={({ isActive }) => isActive ? 'active' : ''}>Lobby</NavLink>
          {currentUser && (
            <NavLink to={`/profile/${currentUser.id}`} className={({ isActive }) => isActive ? 'active' : ''}>
              Profile
            </NavLink>
          )}
          <NavLink to="/leaderboard" className={({ isActive }) => isActive ? 'active' : ''}>
            Leaderboard
          </NavLink>
        </div>
        {currentUser && (
          <div className="app-nav__user" aria-live="polite">
            <img src={currentUser.avatar} alt={`${currentUser.username}'s avatar`} />
            <div>
              <span className="app-nav__username">{currentUser.username}</span>
              <span className="app-nav__level">Lvl {currentUser.level}</span>
            </div>
          </div>
        )}
      </nav>
      <main className="app-main" role="main">
        <div key={location.pathname} className="app-main__transition">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default App;
