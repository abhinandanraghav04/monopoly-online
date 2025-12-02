import { useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { socketService } from './services/socketService';
import { useUserStore } from './services/userService';
import './App.css';

function App() {
  const { currentUser, createProfile } = useUserStore();

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
      <nav className="app-nav">
        <h1>Monopoly</h1>
        <div className="app-nav__links">
          <Link to="/lobby">Lobby</Link>
          {currentUser && <Link to={`/profile/${currentUser.id}`}>Profile</Link>}
          <Link to="/leaderboard">Leaderboard</Link>
        </div>
        {currentUser && (
          <div className="app-nav__user">
            <img src={currentUser.avatar} alt={currentUser.username} />
            <span>{currentUser.username}</span>
            <span className="app-nav__level">Lvl {currentUser.level}</span>
          </div>
        )}
      </nav>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
