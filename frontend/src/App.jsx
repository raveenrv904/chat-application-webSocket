import { useState } from "react";
import UserJoin from "./components/UserJoin";
import Chat from "./components/Chat";

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleUserJoin = (userData) => {
    setCurrentUser({
      ...userData,
      userId: Math.random().toString(36).substring(7), // Temporary ID
    });
  };

  return (
    <div className="App">
      {!currentUser ? (
        <UserJoin onJoin={handleUserJoin} />
      ) : (
        <Chat currentUser={currentUser} />
      )}
    </div>
  );
}

export default App;
