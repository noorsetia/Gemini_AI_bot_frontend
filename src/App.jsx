import React, { useEffect, useState } from "react";
import ChatComponent from "./components/ChatComponent";
import "./App.css";

function App() {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [model, setModel] = useState("Gemini-1");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("conversations") || "null");
    if (saved && Array.isArray(saved) && saved.length) {
      setConversations(saved);
      setSelectedId(saved[0].id);
    } else {
      const id = Date.now();
      const welcome = { id, title: "Welcome chat" };
      setConversations([welcome]);
      setSelectedId(id);
      localStorage.setItem("conversations", JSON.stringify([welcome]));
    }
    const savedModel = localStorage.getItem("selectedModel");
    if (savedModel) setModel(savedModel);
  }, []);

  useEffect(() => {
    localStorage.setItem("conversations", JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme === "light" ? "light" : "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const newChat = (title = "New chat") => {
    const id = Date.now();
    const entry = { id, title };
    setConversations((c) => [entry, ...c]);
    setSelectedId(id);
    localStorage.setItem(`conversation:${id}`, JSON.stringify([]));
  };

  const selectConversation = (id) => {
    setSelectedId(id);
  };

  const updateConversationTitle = (id, title) => {
    setConversations((c) => c.map((x) => (x.id === id ? { ...x, title } : x)));
  };

  const removeConversation = (id) => {
    setConversations((c) => c.filter((x) => x.id !== id));
    localStorage.removeItem(`conversation:${id}`);
    if (selectedId === id) setSelectedId(conversations[0]?.id || null);
  };

  const changeModel = (m) => {
    setModel(m);
    localStorage.setItem("selectedModel", m);
  };

  return (
    <div className="app-root">
      <div className="main-area" style={{ maxWidth: "900px", width: "100%" }}>
        <main className="content-area">
          <ChatComponent
            conversationId={selectedId}
            model={model}
            setModel={changeModel}
            theme={theme}
            setTheme={setTheme}
            onRename={updateConversationTitle}
            onNew={() => newChat()}
          />
        </main>
      </div>
    </div>
  );
}
export default App;
