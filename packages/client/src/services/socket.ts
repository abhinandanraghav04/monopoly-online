import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export const initSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling']
    });
  }
  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const connectSocket = (): void => {
  if (socket && !socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = (): void => {
  if (socket?.connected) {
    socket.disconnect();
  }
};
