import { useEffect, useState } from "react";
import api from "../api";
import "./GroupPage.css";

function GroupPage({ setActiveGroup, activeGroup }) {
  const [groups, setGroups] = useState([]);
  const [newGroup, setNewGroup] = useState("");

  const userId = localStorage.getItem("userId");

  const fetchGroups = async () => {
    try {
      const res = await api.get("/groups");
      setGroups(res.data);
    } catch (err) {
      console.error("Group fetch failed:", err.response?.data || err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const createGroup = async () => {
    if (!newGroup.trim()) return;

    await api.post("/groups", { name: newGroup });
    setNewGroup("");
    fetchGroups();
  };

  const joinGroup = async (groupId) => {
    await api.post(`/groups/${groupId}/join`);
    fetchGroups();
  };

  const deleteGroup = async (group) => {
    const ok = window.confirm(`Delete group "${group.name}"?`);
    if (!ok) return;

    await api.delete(`/groups/${group._id}`);

    if (activeGroup?._id === group._id) {
      setActiveGroup(null);
    }

    fetchGroups();
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">Study Groups</div>

      <div className="group-list">
        {groups.map((g) => {
          const isAdmin = g.admin?._id === userId;
          const isMember = g.members.includes(userId);

          return (
            <div
              key={g._id}
              className={`group-item ${
                activeGroup?._id === g._id ? "group-active" : ""
              }`}
              onClick={() => {
                if (isMember) setActiveGroup(g);
              }}
            >
              <div className="group-info">
                <span className="group-name">{g.name}</span>
                <span className="group-count">
                  👥 {g.members.length}
                </span>
              </div>

              <div className="group-actions">
                {!isMember && (
                  <button
                    className="join-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      joinGroup(g._id);
                    }}
                  >
                    Join
                  </button>
                )}

                {isAdmin && (
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteGroup(g);
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="create-group">
        <input
          placeholder="New group"
          value={newGroup}
          onChange={(e) => setNewGroup(e.target.value)}
        />
        <button onClick={createGroup}>Create</button>
      </div>
    </div>
  );
}

export default GroupPage;
