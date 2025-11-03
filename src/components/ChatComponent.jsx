import React, { useState, useEffect, useRef } from "react";
import { sendMessage } from "../services/api";
import "./ChatComponent.css";

function ChatComponent({ conversationId, model, setModel, theme, setTheme, onRename, onNew }) {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const listRef = useRef(null);
  const textareaRef = useRef(null);

  // derived title for current conversation
  const [title, setTitle] = useState("New chat");

  useEffect(() => {
    if (!conversationId) return;
    const savedConvos = JSON.parse(localStorage.getItem("conversations") || "[]");
    const found = savedConvos.find((c) => c.id === conversationId);
    setTitle(found?.title || `Conversation ${conversationId}`);
  }, [conversationId]);

  // Load conversation from localStorage when conversationId changes
  useEffect(() => {
    if (!conversationId) return;
    const saved = localStorage.getItem(`conversation:${conversationId}`);
    if (saved) setHistory(JSON.parse(saved));
    else setHistory([]);
    setError(null);
  }, [conversationId]);

  // Inject a friendly assistant welcome message when a fresh conversation is opened
  useEffect(() => {
    if (!conversationId) return;
    const saved = localStorage.getItem(`conversation:${conversationId}`);
    if (!saved) {
      const welcome = {
        role: "assistant",
        content: "Hi — I'm Gemini. Ask me anything or try: \"Explain recursion with an example\"",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setHistory([welcome]);
      localStorage.setItem(`conversation:${conversationId}`, JSON.stringify([welcome]));
    }
  }, [conversationId]);

  // Save history to localStorage per conversation
  useEffect(() => {
    if (!conversationId) return;
    localStorage.setItem(`conversation:${conversationId}`, JSON.stringify(history));
  }, [history, conversationId]);

  useEffect(() => {
    // auto-scroll to bottom when history or loading changes
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [history, loading]);

  // Autosize textarea
  const resizeTextarea = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(160, ta.scrollHeight) + "px";
  };

  useEffect(() => {
    resizeTextarea();
  }, [message]);

  const formatTime = (date = new Date()) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!message.trim() || !conversationId) return;
    const userMessage = { role: "user", content: message.trim(), time: formatTime() };
    setHistory((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);
    setError(null);
    try {
      const response = await sendMessage(message, model);
      const aiMessage = { role: "assistant", content: response.reply || "(no response)", time: formatTime() };
      setHistory((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Chat Error:", err);
      setError("⚠️ Failed to connect to AI. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    // Send on Enter, allow Shift+Enter for new lines
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const clearConversation = () => {
    if (!conversationId) return;
    const ok = window.confirm("Clear this conversation? This cannot be undone.");
    if (!ok) return;
    setHistory([]);
    setError(null);
    localStorage.setItem(`conversation:${conversationId}`, JSON.stringify([]));
  };

  const rename = async () => {
    if (!conversationId) return;
    const titleInput = window.prompt("Rename conversation:", title || "");
    if (!titleInput) return;
    const savedConvos = JSON.parse(localStorage.getItem("conversations") || "[]");
    const updated = savedConvos.map((c) => (c.id === conversationId ? { ...c, title: titleInput } : c));
    localStorage.setItem("conversations", JSON.stringify(updated));
    setTitle(titleInput);
    if (onRename) onRename(conversationId, titleInput);
  };

  return (
    <div className="chat-page">
      <div className="chat-card" role="region" aria-label="AI Chat">
        <header className="chat-header">
          <div className="header-left">
            <div className="brand">
              <div className="logo">G</div>
              <div className="titles">
                <div className="title">{title}</div>
                <div className="subtitle">Model: {model}</div>
              </div>
            </div>
          </div>

          <div className="header-actions">
            <button className="btn btn-ghost" onClick={onNew} title="New conversation" aria-label="New conversation">
              + New
            </button>

            <select
              className="model-dropdown"
              value={model}
              onChange={(e) => setModel && setModel(e.target.value)}
              aria-label="Select model"
            >
              <option>Gemini-1</option>
              <option>Gemini-2</option>
              <option>Fast-Response</option>
            </select>

            <button
              className="btn btn-ghost"
              onClick={() => setTheme && setTheme((t) => (t === "light" ? "dark" : "light"))}
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {theme === "light" ? "🌙 Dark" : "☀️ Light"}
            </button>

            <button className="btn btn-ghost" onClick={rename} title="Rename conversation" aria-label="Rename conversation">
              Rename
            </button>
            <button className="btn btn-danger" onClick={clearConversation} title="Clear conversation" aria-label="Clear conversation">
              Clear
            </button>
          </div>
        </header>

        <div ref={listRef} className="chat-history" aria-live="polite">
          {history.map((msg, idx) => (
            <div key={idx} className={`message-row ${msg.role}`}>
              <div className="avatar" aria-hidden>
                {msg.role === "user" ? "U" : "AI"}
              </div>
              <div className="message-bubble">
                <div className="message-content" style={{ whiteSpace: "pre-wrap" }}>
                  {msg.content}
                </div>
                <div className="message-meta">{msg.time}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="message-row assistant typing-row">
              <div className="avatar">AI</div>
              <div className="message-bubble typing">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>
          )}
        </div>

        <form className="chat-input" onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={resizeTextarea}
            placeholder="Ask me anything..."
            disabled={loading}
            rows={1}
            aria-label="Message input"
            autoFocus
          />
          <button type="submit" disabled={loading || !message.trim()} className="send-btn" aria-label="Send message">
            ✈️ {loading ? "Sending..." : "Send"}
          </button>
        </form>

        {error && <div className="error-banner">{error}</div>}
      </div>
    </div>
  );
}

export default ChatComponent;

