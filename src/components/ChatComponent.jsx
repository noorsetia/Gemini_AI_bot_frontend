import React, { useState } from "react";
import { sendMessage } from "../services/api";

function ChatComponent() {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = { role: "user", content: message };
    setHistory((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);
    setError(null);

    try {
      const response = await sendMessage(message);
      const aiMessage = { role: "assistant", content: response.reply };
      // ✅ FIX: append AI response *after* user message
      setHistory((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Chat Error:", err);
      setError("⚠️ Failed to connect to AI. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-history">
        {history.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !message.trim()}>
          {loading ? "..." : "Send"}
        </button>
      </form>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
    </div>
  );
}

export default ChatComponent;
