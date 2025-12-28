import { useEffect, useState } from "react";
import io from "socket.io-client";
import api from "../api";
import "./ChatPage.css";

const socket = io("http://localhost:5000", {
  auth: {
    token: localStorage.getItem("token")
  }
});

function ChatPage({ activeGroup }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!activeGroup) return;

    const handleReceiveMessage = (msg) => {
      if (msg.group !== activeGroup._id) return;
      setMessages(prev => [...prev, msg]);
    };

    const handleGroupDeleted = ({ groupId }) => {
      if (groupId === activeGroup._id) {
        alert("This group was deleted");
        window.location.reload();
      }
    };

    socket.emit("joinGroup", activeGroup._id);

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("groupDeleted", handleGroupDeleted);

    api.get(`/messages/${activeGroup._id}`)
      .then(res => setMessages(res.data))
      .catch(console.error);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("groupDeleted", handleGroupDeleted);
    };
  }, [activeGroup]);

  const sendMessage = () => {
    if (!text.trim()) return;

    socket.emit("sendMessage", {
      groupId: activeGroup._id,
      text
    });

    setText("");
  };

  const sendFile = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post(
      `/messages/file/${activeGroup._id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    setMessages(prev => [...prev, res.data]);
    setFile(null);
  };

  if (!activeGroup) {
    return (
      <div className="chat-container empty">
        Select a group to start chatting
      </div>
    );
  }

  const adminName =
    activeGroup.admin?.name ||
    activeGroup.adminName ||
    "Unknown";

  const memberCount =
    activeGroup.members?.length ||
    activeGroup.memberCount ||
    0;

  return (
    <div className="chat-container">
      {/* HEADER */}
      <div className="chat-header">
        <div className="chat-title">{activeGroup.name}</div>

        <div className="chat-meta">
          <div className="chat-admin">
            Admin: <span>{adminName}</span>
          </div>
          <div className="chat-members">
            {memberCount} members
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="chat-messages">
        {messages.map(m => (
          <div
            key={m._id}
            className={`message ${
              m.sender?._id === userId ? "me" : "other"
            }`}
          >
            {m.type === "file" ? (
              <a
                href={`http://localhost:5000${m.fileUrl}`}
                target="_blank"
                rel="noreferrer"
              >
                📎 {m.fileName}
              </a>
            ) : (
              m.text
            )}
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="chat-input">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type message"
        />
        <input
          type="file"
          onChange={e => setFile(e.target.files[0])}
        />
        <button onClick={sendMessage}>Send</button>
        <button onClick={sendFile}>Upload</button>
      </div>
    </div>
  );
}

export default ChatPage;
