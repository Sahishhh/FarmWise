import io from 'socket.io-client';

const BACKEND_URL = 'http://localhost:9000';

class SocketService {
  socket = null;

  connect(userId) {
    if (this.socket) {
      this.disconnect();
    }

    // Get the stored auth state
    const authState = JSON.parse(localStorage.getItem('authState'));
    if (!authState || !authState.accessToken) {
      console.error('No access token found in localStorage');
      return null;
    }

    this.socket = io(BACKEND_URL, {
      auth: {
        userId,
        token: authState.accessToken
      },
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      if (error.message === 'Authentication error') {
        console.error('Authentication failed, please login again');
        // Clear auth state and redirect to login
        localStorage.removeItem('authState');
        window.location.href = '/login';
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        this.socket.connect();
      }
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export default new SocketService(); 