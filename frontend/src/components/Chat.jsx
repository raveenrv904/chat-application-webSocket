import { useState, useEffect, useRef } from "react";
import { useSocket } from "../hooks/useSocket";

const Chat = ({ currentUser }) => {
  const { isConnected, emit, on, off } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeUsers, setActiveUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (isConnected && currentUser) {
      // Announce user joined
      emit("user-joined", currentUser);

      // Listen for messages
      on("receive-message", (message) => {
        setMessages((prev) => [...prev, message]);
      });

      // Listen for user events
      on("user-joined", (userData) => {
        setActiveUsers((prev) => {
          // Check if user already exists to prevent duplicates
          const exists = prev.some((user) => user.userId === userData.userId);
          if (!exists) {
            return [...prev, userData];
          }
          return prev;
        });
      });

      on("user-left", (userId) => {
        setActiveUsers((prev) => prev.filter((user) => user.userId !== userId));
        setTypingUsers((prev) => prev.filter((user) => user.userId !== userId));
      });

      on("active-users", (users) => {
        // Add current user to the list if not already present
        setActiveUsers(() => {
          const currentUserExists = users.some(
            (user) => user.userId === currentUser.userId
          );
          if (!currentUserExists && currentUser) {
            return [...users, { userId: currentUser.userId, ...currentUser }];
          }
          return users;
        });
      });

      on("user-typing", (data) => {
        if (data.isTyping) {
          setTypingUsers((prev) => [
            ...prev.filter((u) => u.userId !== data.userId),
            data,
          ]);
        } else {
          setTypingUsers((prev) =>
            prev.filter((u) => u.userId !== data.userId)
          );
        }
      });

      return () => {
        off("receive-message");
        off("user-joined");
        off("user-left");
        off("active-users");
        off("user-typing");
      };
    }
  }, [isConnected, currentUser, emit, on, off]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      emit("send-message", { text: newMessage.trim() });
      setNewMessage("");

      // Clear typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      emit("typing", { isTyping: false });
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    // Send typing indicator
    emit("typing", { isTyping: true });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing indicator after 1 second
    typingTimeoutRef.current = setTimeout(() => {
      emit("typing", { isTyping: false });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar with active users */}
      <div className="w-64 bg-white shadow-lg p-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Active Users ({activeUsers.length})
        </h2>
        <div className="space-y-2">
          {activeUsers.map((user) => (
            <div
              key={user.userId}
              className="flex items-center p-2 bg-gray-50 rounded"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user.username[0].toUpperCase()}
              </div>
              <span className="ml-2 text-gray-700">{user.username}</span>
            </div>
          ))}
        </div>

        {/* Typing indicators */}
        {typingUsers.length > 0 && (
          <div className="mt-4 text-xs text-gray-500">
            {typingUsers.map((user) => user.username).join(", ")}
            {typingUsers.length === 1 ? " is" : " are"} typing...
          </div>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm p-4 border-b">
          <h1 className="text-xl font-semibold text-gray-800">Chat Room</h1>
          <div className="text-sm text-gray-500">
            {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.userId === currentUser?.userId
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.userId === currentUser?.userId
                    ? "bg-blue-500 text-white"
                    : "bg-white shadow"
                }`}
              >
                <div className="text-xs text-gray-400 mb-1">
                  {message.user.username} •{" "}
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
                <div>{message.text}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message input */}
        <div className="bg-white border-t p-4">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type a message..."
              disabled={!isConnected}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || !isConnected}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
