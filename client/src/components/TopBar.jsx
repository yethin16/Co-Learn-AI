/* TopBar */ 
import { useState } from "react";
import "./TopBar.css";


function TopBar({ onLogout }) {
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    const ok = window.confirm("Are you sure you want to logout?");
    if (!ok) return;
    onLogout();
  };

  return (
    <div className="topbar">
      <div
        className="topbar-avatar"
        onClick={() => setOpen((prev) => !prev)}
      >
        ☰
      </div>

      {open && (
        <div className="topbar-dropdown">
          <div className="dropdown-item profile">
            Profile (coming soon)
          </div>

          <div
            className="dropdown-item logout"
            onClick={handleLogout}
          >
            Logout
          </div>
        </div>
      )}
    </div>
  );
}

export default TopBar;
