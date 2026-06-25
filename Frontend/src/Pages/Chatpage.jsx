import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import API from "../services/api.js";

const TypingDots = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    {[0, 1, 2].map(i => (
      <span key={i} className="w-2 h-2 rounded-full bg-blue/40 animate-bounce"
        style={{ animationDelay: `${i * 0.15}s` }} />
    ))}
  </div>
);

export default function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // doc passed via navigate state: { _id, fileName }
  const doc = location.state?.doc || null;

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: doc
        ? `Hi! I've read **${doc.fileName}**. Ask me anything about it — concepts, summaries, page-specific questions, anything.`
        : "No document selected. Go back to your dashboard and open a document first.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!doc) return;
    inputRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading || !doc) return;

    const userMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const history = newMessages
        .slice(1) // skip the greeting
        .slice(-10) // keep last 10 turns for context window
        .map(m => ({ role: m.role, content: m.content }));

      const { data } = await API.post("/chat", {
        docId: doc._id,
        message: text,
        history: history.slice(0, -1), // exclude the message we just added
      });

      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Something went wrong. Please try again.",
        error: true,
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderContent = (text) => {
    // Bold markdown **text**
    return text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
      part.startsWith("**") && part.endsWith("**")
        ? <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
        : part
    );
  };

  return (
    <div className="min-h-screen bg-offwhite dot-bg flex flex-col">

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 h-[66px] flex items-center justify-between px-[5%] bg-white/95 backdrop-blur-xl shadow-[0_1px_20px_rgba(10,22,40,0.07)] border-b border-slate-100 shrink-0">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-blue to-blue-dark flex items-center justify-center text-lg leading-none">📚</div>
          <span className="font-syne font-extrabold text-[22px] text-navy">Saarthi</span>
        </Link>

        {doc && (
          <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 max-w-[340px]">
            <span className="text-sm shrink-0">📄</span>
            <span className="font-inter text-[12.5px] text-blue-700 font-medium truncate">{doc.fileName}</span>
          </div>
        )}

        <button onClick={() => navigate("/dashboard")}
          className="px-5 py-2 rounded-[10px] border border-slate-200 font-syne font-semibold text-[14px] text-navy bg-white hover:border-blue-300 hover:text-blue transition-all duration-200">
          ← Dashboard
        </button>
      </nav>

      {/* ── CHAT AREA ── */}
      <div className="flex-1 overflow-y-auto px-[5%] py-8">
        <div className="max-w-[760px] mx-auto flex flex-col gap-5">

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-blue to-blue-dark flex items-center justify-center text-sm shrink-0 mr-3 mt-0.5">📚</div>
              )}

              <div className={`max-w-[82%] px-5 py-3.5 rounded-2xl font-inter text-[14.5px] leading-relaxed
                ${msg.role === "user"
                  ? "bg-gradient-to-br from-blue to-blue-dark text-white rounded-br-sm shadow-[0_4px_14px_rgba(37,99,235,0.22)]"
                  : msg.error
                    ? "bg-red-50 border border-red-100 text-red-700 rounded-bl-sm"
                    : "bg-white border border-slate-100 text-navy rounded-bl-sm shadow-[0_4px_14px_rgba(10,22,40,0.06)]"
                }`}>
                {renderContent(msg.content)}
              </div>

              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-yellow to-yellow-dark flex items-center justify-center text-sm shrink-0 ml-3 mt-0.5 font-syne font-bold text-navy text-[11px]">
                  YOU
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-blue to-blue-dark flex items-center justify-center text-sm shrink-0 mr-3 mt-0.5">📚</div>
              <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm shadow-[0_4px_14px_rgba(10,22,40,0.06)]">
                <TypingDots />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── INPUT BAR ── */}
      <div className="shrink-0 px-[5%] py-5 bg-white/90 backdrop-blur-xl border-t border-slate-100 shadow-[0_-1px_20px_rgba(10,22,40,0.05)]">
        <div className="max-w-[760px] mx-auto flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={doc ? "Ask anything about this document…" : "No document selected"}
              disabled={!doc || loading}
              rows={1}
              className="w-full resize-none px-5 py-3.5 pr-4 rounded-[14px] border-[1.5px] border-slate-200 bg-white font-inter text-[14.5px] text-navy placeholder:text-slate-400 focus:outline-none focus:border-blue transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minHeight: "52px", maxHeight: "140px" }}
              onInput={e => {
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
              }}
            />
          </div>

          <button onClick={sendMessage} disabled={!input.trim() || loading || !doc}
            className="shrink-0 w-[52px] h-[52px] rounded-[14px] bg-gradient-to-br from-blue to-blue-dark flex items-center justify-center border-none cursor-pointer shadow-[0_4px_14px_rgba(37,99,235,0.28)] hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(37,99,235,0.38)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
            {loading
              ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              : <span className="text-white text-lg">↑</span>
            }
          </button>
        </div>

        <p className="text-center font-inter text-[11px] text-slate-400 mt-2.5">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}