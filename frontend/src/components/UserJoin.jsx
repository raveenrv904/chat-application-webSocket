import { useState } from "react";

const UserJoin = ({ onJoin }) => {
  const [username, setUsername] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onJoin({ username: username.trim() });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Join Chat Room
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Your Name
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name..."
              maxLength={50}
            />
          </div>
          <button
            type="submit"
            disabled={!username.trim()}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Join Chat
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserJoin;
