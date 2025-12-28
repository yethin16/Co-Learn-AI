import { useEffect, useState } from "react";
import GroupPage from "./Pages/GroupPage";
import ChatPage from "./Pages/ChatPage";
import AuthPage from "./Pages/AuthPage";
import TopBar from "./components/TopBar";
import AISummaryPanel from "./components/AISummaryPanel";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setActiveGroup(null);
    setIsAuthenticated(false);
  };

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <>
      {/* TOP HEADER */}
      <header className="app-header">
        <h1>Co-Learn AI</h1>
        <TopBar onLogout={handleLogout} />
      </header>

      {/* MAIN CONTENT */}
      <div className="app-main">
        {/* LEFT — GROUPS */}
        <div className="app-panel group-panel">
          <GroupPage activeGroup={activeGroup} setActiveGroup={setActiveGroup} />
        </div>

        {/* CENTER — CHAT */}
        <div className="app-panel chat-panel">
          <ChatPage activeGroup={activeGroup} />
        </div>

        {/* RIGHT — AI SUMMARY */}
        <div className="app-panel ai-panel">
          <AISummaryPanel activeGroup={activeGroup} />
        </div>
      </div>
    </>
  );
}

export default App;
