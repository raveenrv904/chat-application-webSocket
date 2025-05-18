import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const SERVER_URL = "http://localhost:3001";

export const useSocket = () => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Create socket connection
    socketRef.current = io(SERVER_URL);

    // Handle connection events
    socketRef.current.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to server");
    });

    socketRef.current.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from server");
    });

    // Cleanup on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Emit events
  const emit = (event, data) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  };

  // Listen to events
  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  // Remove event listeners
  const off = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    emit,
    on,
    off,
  };
};
