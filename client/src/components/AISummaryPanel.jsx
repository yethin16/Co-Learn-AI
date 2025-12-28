import { useState } from "react";
import api from "../api";
import "./AISummaryPanel.css";

function AISummaryPanel({ activeGroup }) {
  const [chatSummary, setChatSummary] = useState("");
  const [fileSummaries, setFileSummaries] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateSummary = async () => {
    if (!activeGroup) return;

    try {
      setLoading(true);

      const res = await api.post(
        `/messages/summarize/${activeGroup._id}`
      );

      setChatSummary(res.data.chatSummary || "");
      setFileSummaries(res.data.fileSummaries || []);
    } catch (err) {
      console.error(
        "AI summary failed:",
        err.response?.data || err
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-panel">
      <button
        className="ai-summary-button"
        onClick={generateSummary}
        disabled={!activeGroup || loading}
      >
        {loading ? "Summarizing…" : "Summarize Chat"}
      </button>

      {!activeGroup && (
        <p className="ai-muted">
          Select a group to generate summary
        </p>
      )}

      {chatSummary && (
        <div className="ai-section">
          <h3 className="ai-title">Chat Summary</h3>
          <p className="ai-text">{chatSummary}</p>
        </div>
      )}

      {fileSummaries.length > 0 && (
        <div className="ai-section">
          <h3 className="ai-title">File Summaries</h3>

          {fileSummaries.map((file, idx) => (
            <div key={idx} className="file-summary-card">
              <div className="file-name">📄 {file.fileName}</div>
              <p className="file-summary-text">
                {file.summary}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AISummaryPanel;
