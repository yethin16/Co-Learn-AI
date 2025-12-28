import { useEffect, useState } from "react";
import api from "../api";

function ProfileModal({ onClose }){
  const [data,setData] = useState(null);

  useEffect(()=>{
    api.get("/auth/profile")
      .then(res => setData(res.data))
      .catch(console.error);
  },[]);

  if(!data) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Profile</h2>
        <p><b>Name:</b> {data.name}</p>
        <p><b>Email:</b> {data.email}</p>

        <h4>Created Groups</h4>
        {data.createdGroups.map(g=>(
          <div key={g._id}>{g.name}</div>
        ))}

        <h4>Member Of</h4>
        {data.memberGroups.map(g=>(
          <div key={g._id}>{g.name}</div>
        ))}

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default ProfileModal;
