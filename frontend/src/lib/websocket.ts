import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private url: string;

  constructor() {
    this.url = import.meta.env.VITE_WS_URL || 'http://localhost:3000';
  }

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(this.url, {
        withCredentials: true,
      });

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
      });
    }

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinPoll(pollId: string) {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.emit('joinPoll', { pollId });
  }

  leavePoll(pollId: string) {
    this.socket?.emit('leavePoll', { pollId });
  }

  onPollResults(callback: (data: any) => void) {
    this.socket?.on('pollResults', callback);
  }

  onNewResponse(callback: (data: any) => void) {
    this.socket?.on('newResponse', callback);
  }

  onJoinedPoll(callback: (data: any) => void) {
    this.socket?.on('joinedPoll', callback);
  }

  onLeftPoll(callback: (data: any) => void) {
    this.socket?.on('leftPoll', callback);
  }

  off(event: string, callback?: (data: any) => void) {
    this.socket?.off(event, callback);
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const wsService = new WebSocketService();
