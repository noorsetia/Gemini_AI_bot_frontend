// filepath: /home/navgurukul/backend_learnathon/frontend/src/components/Sidebar.jsx
import React from "react";
import "./Sidebar.css";

export default function Sidebar({ conversations = [], selected, onNew, onSelect, onDelete, model, setModel }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <button className="new-chat" onClick={onNew} aria-label="New chat">
          + New chat
        </button>
        <div className="model-select">
          <label htmlFor="model">Model</label>
          <select id="model" value={model} onChange={(e) => setModel(e.target.value)}>
            <option>Gemini-1</option>
            <option>Gemini-2</option>
            <option>Fast-Response</option>
          </select>
        </div>
      </div>

      <nav className="conversations" aria-label="Conversations">
        {conversations.map((c) => (
          <div key={c.id} className={`conv-item ${selected === c.id ? "active" : ""}`}>
            <button className="conv-btn" onClick={() => onSelect(c.id)}>
              {c.title}
            </button>
            <button className="conv-del" title="Delete" onClick={() => onDelete(c.id)}>
              ×
            </button>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <small>Gemini AI • Local demo</small>
      </div>
    </aside>
  );
}
