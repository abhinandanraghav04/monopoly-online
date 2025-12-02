import { useEffect, useState } from 'react';
import { getRooms, type Room } from '../services/api';
import { socketService } from '../services/socketService';
import { useUserStore } from '../services/userService';
import { useToast } from '../components/ToastContainer';
import { LoadingSpinner } from '../components/LoadingSpinner';
import './Lobby.css';

export function Lobby() {
  const { currentUser } = useUserStore();
  const { showToast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: '',
    boardSize: 8,
    startingMoney: 1500,
    maxPlayers: 4
  });

  const loadRooms = async () => {
    setLoading(true);
    try {
      const data = await getRooms();
      setRooms(data);
    } catch (error) {
      console.error(error);
      showToast('Unable to load rooms. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();

    const handlePlayerJoined = () => {
      loadRooms();
    };

    const handlePlayerLeft = () => {
      loadRooms();
    };

    socketService.onPlayerJoined(handlePlayerJoined);
    socketService.onPlayerLeft(handlePlayerLeft);

    return () => {
      socketService.off('PLAYER_JOINED', handlePlayerJoined);
      socketService.off('PLAYER_LEFT', handlePlayerLeft);
    };
  }, []);

  const handleCreateRoom = () => {
    if (!currentUser) return;
    if (!createForm.name) {
      showToast('Please enter a room name', 'warning');
      return;
    }

    socketService.createRoom({
      name: createForm.name,
      boardSize: createForm.boardSize,
      startingMoney: createForm.startingMoney,
      maxPlayers: createForm.maxPlayers,
      hostId: currentUser.id,
      hostUsername: currentUser.username,
      hostAvatar: currentUser.avatar,
      hostLevel: currentUser.level
    });

    setShowCreateModal(false);
    setCreateForm({ name: '', boardSize: 8, startingMoney: 1500, maxPlayers: 4 });
    showToast(`Room "${createForm.name}" created successfully!`, 'success');
    setTimeout(loadRooms, 500);
  };

  const handleJoinRoom = (room: Room) => {
    if (!currentUser) {
      showToast('You need to sign in to join rooms.', 'warning');
      return;
    }

    socketService.joinRoom(room.id, {
      id: currentUser.id,
      username: currentUser.username,
      avatar: currentUser.avatar,
      level: currentUser.level,
      isReady: false,
      isHost: false
    });

    setSelectedRoom(room);
    showToast(`Joined ${room.name}`, 'success');
    setTimeout(loadRooms, 500);
  };

  const handleLeaveRoom = () => {
    if (!currentUser || !selectedRoom) return;

    socketService.leaveRoom(selectedRoom.id, currentUser.id);
    showToast(`Left ${selectedRoom.name}`, 'info');
    setSelectedRoom(null);
    setTimeout(loadRooms, 500);
  };

  const handleToggleReady = () => {
    if (!currentUser || !selectedRoom) return;

    const player = selectedRoom.players.find((p) => p.id === currentUser.id);
    const isReady = player?.isReady ?? false;

    socketService.toggleReady(selectedRoom.id, currentUser.id, !isReady);

    showToast(isReady ? 'You are no longer ready' : 'You are ready!', isReady ? 'warning' : 'success');

    setSelectedRoom({
      ...selectedRoom,
      players: selectedRoom.players.map((p) =>
        p.id === currentUser.id ? { ...p, isReady: !isReady } : p
      )
    });
  };

  return (
    <div className="lobby">
      <div className="lobby__header">
        <h1>Game Lobby</h1>
        <button className="lobby__create-btn" onClick={() => setShowCreateModal(true)}>
          Create Room
        </button>
      </div>

      {currentUser && (
        <div className="lobby__player-info">
          <img src={currentUser.avatar} alt={currentUser.username} />
          <div>
            <strong>{currentUser.username}</strong>
            <span>Level {currentUser.level}</span>
          </div>
          <div className="lobby__player-stats">
            <span>{currentUser.wins}W</span>
            <span>{currentUser.losses}L</span>
            <span>{currentUser.totalGames} Games</span>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <LoadingSpinner size="large" text="Loading rooms..." />
        </div>
      ) : rooms.length === 0 ? (
        <p className="lobby__empty">No rooms available. Create one to get started!</p>
      ) : (
        <div className="lobby__rooms">
          {rooms.map((room) => (
            <div key={room.id} className="lobby__room-card">
              <h3>{room.name}</h3>
              <div className="lobby__room-details">
                <span>Players: {room.players.length}/{room.maxPlayers}</span>
                <span>Board: {room.boardSize}x{room.boardSize}</span>
                <span>Money: ${room.startingMoney}</span>
                <span className={`lobby__status lobby__status--${room.status.toLowerCase()}`}>
                  {room.status}
                </span>
              </div>
              <div className="lobby__room-players">
                {room.players.map((player) => (
                  <div key={player.id} className="lobby__player-chip">
                    <img src={player.avatar} alt={player.username} />
                    <span>{player.username} {player.isHost && '👑'}</span>
                    {player.isReady && <span className="lobby__ready-badge">✓</span>}
                  </div>
                ))}
              </div>
              <button className="lobby__join-btn" onClick={() => handleJoinRoom(room)}>
                Join Room
              </button>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Room</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateRoom(); }}>
              <div className="modal__field">
                <label>Room Name</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Enter room name"
                />
              </div>

              <div className="modal__field">
                <label>Board Size</label>
                <select
                  value={createForm.boardSize}
                  onChange={(e) => setCreateForm({ ...createForm, boardSize: Number(e.target.value) })}
                >
                  <option value={6}>6x6 (Quick)</option>
                  <option value={8}>8x8 (Classic)</option>
                  <option value={12}>12x12 (Extended)</option>
                  <option value={16}>16x16 (Mega)</option>
                </select>
              </div>

              <div className="modal__field">
                <label>Starting Money</label>
                <select
                  value={createForm.startingMoney}
                  onChange={(e) => setCreateForm({ ...createForm, startingMoney: Number(e.target.value) })}
                >
                  <option value={1500}>$1500</option>
                  <option value={2000}>$2000</option>
                  <option value={2500}>$2500</option>
                </select>
              </div>

              <div className="modal__field">
                <label>Max Players (2-8)</label>
                <input
                  type="number"
                  min={2}
                  max={8}
                  value={createForm.maxPlayers}
                  onChange={(e) => setCreateForm({ ...createForm, maxPlayers: Number(e.target.value) })}
                />
              </div>

              <div className="modal__actions">
                <button type="submit" className="modal__submit">Create</button>
                <button type="button" onClick={() => setShowCreateModal(false)} className="modal__cancel">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedRoom && (
        <div className="modal-overlay" onClick={handleLeaveRoom}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedRoom.name}</h2>
            <div className="lobby__room-view">
              <div className="lobby__room-players-list">
                {selectedRoom.players.map((player) => (
                  <div key={player.id} className="lobby__player-entry">
                    <img src={player.avatar} alt={player.username} />
                    <div>
                      <strong>{player.username}</strong>
                      <span>Level {player.level}</span>
                    </div>
                    {player.isHost && <span className="lobby__host-badge">Host</span>}
                    {player.isReady ? (
                      <span className="lobby__ready-status lobby__ready-status--ready">Ready</span>
                    ) : (
                      <span className="lobby__ready-status">Not Ready</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="modal__actions">
                <button onClick={handleToggleReady} className="modal__submit">
                  {selectedRoom.players.find((p) => p.id === currentUser?.id)?.isReady
                    ? 'Not Ready'
                    : 'Ready'}
                </button>
                <button onClick={handleLeaveRoom} className="modal__cancel">Leave</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
