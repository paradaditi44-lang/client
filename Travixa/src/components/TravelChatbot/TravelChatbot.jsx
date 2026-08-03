import React, { useState, useEffect, useRef } from "react";
import "./TravelChatbot.css";

const QUICK_PROMPTS = [
  "📍 Best places to visit",
  "🏨 Budget hotels",
  "🧳 Packing tips",
  "🍽️ Local food",
  "🌤️ Weather",
];

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: "ai",
    text: "Hello! I'm Travexa AI, your personal travel assistant ✈️. Where are you planning to go, or what travel questions do you have?",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  },
];

const INITIAL_CONTEXT = {
  destination: "",
  travelDates: "",
  budget: "",
  preferences: "",
};

function TravelChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  // 1. React State for Conversation Context
  const [context, setContext] = useState(INITIAL_CONTEXT);

  const messagesEndRef = useRef(null);

  // Auto scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isThinking, isOpen]);

  // 2. Helper to analyze user message and update context state
  const extractContextFromMessage = (text, prevContext) => {
    const updated = { ...prevContext };
    const lower = text.toLowerCase();

    // Destination Extraction (e.g. "I am visiting Goa", "Going to Paris")
    const destMatch = text.match(/(?:visiting|going to|trip to|travel to|in|to)\s+([A-Za-z\s]+)/i);
    if (destMatch && destMatch[1]) {
      const candidate = destMatch[1].trim().split(/\s+/)[0];
      const ignoreWords = ["the", "a", "an", "my", "our", "some", "this", "next", "which", "what", "how", "for", "with"];
      if (candidate.length > 2 && !ignoreWords.includes(candidate.toLowerCase())) {
        updated.destination = candidate.charAt(0).toUpperCase() + candidate.slice(1).toLowerCase();
      }
    } else {
      const knownCities = ["goa", "paris", "tokyo", "london", "dubai", "bali", "thailand", "mumbai", "delhi", "manali", "shimla", "rome", "singapore", "new york"];
      for (const city of knownCities) {
        if (lower.includes(city)) {
          updated.destination = city.charAt(0).toUpperCase() + city.slice(1);
          break;
        }
      }
    }

    // Budget Extraction (e.g. "My budget is 10000", "Under 50000")
    const budgetMatch = text.match(/(?:budget\s*(?:is|=|:)?\s*|under\s*|around\s*|₹|\$)\s*(\d+[\d,]*)/i);
    if (budgetMatch && budgetMatch[1]) {
      updated.budget = budgetMatch[1].replace(/,/g, "");
    }

    // Travel Dates / Month / Duration Extraction (e.g. "Going in December", "Next week")
    const dateMatch = text.match(/(?:in|for|during|around|starting)\s+(january|february|march|april|may|june|july|august|september|october|november|december|summer|winter|spring|autumn|next week|tomorrow|\d+\s*days?)/i);
    if (dateMatch && dateMatch[1]) {
      updated.travelDates = dateMatch[1];
    }

    // Preferences Extraction
    const prefList = [];
    if (lower.includes("adventure")) prefList.push("Adventure");
    if (lower.includes("beach")) prefList.push("Beach");
    if (lower.includes("mountain") || lower.includes("hiking")) prefList.push("Mountain");
    if (lower.includes("luxury")) prefList.push("Luxury");
    if (lower.includes("budget") && !updated.budget) prefList.push("Budget-friendly");
    if (lower.includes("family")) prefList.push("Family");
    if (lower.includes("food") || lower.includes("cuisine")) prefList.push("Food & Dining");

    if (prefList.length > 0) {
      updated.preferences = prefList.join(", ");
    }

    return updated;
  };

  // Handle sending a message to backend Groq AI API (/api/chat)
  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // Analyze message and update context
    const updatedContext = extractContextFromMessage(text, context);
    setContext(updatedContext);

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsThinking(true);

    try {
      // 3. Send message AND context in payload
      const payload = {
        message: text,
        context: updatedContext,
      };

      let response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Direct port fallback if proxy is bypassed
      if (!response.ok && response.status === 404) {
        response = await fetch("http://localhost:5000/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          id: Date.now() + 1,
          sender: "ai",
          text: data.reply || data.message || "I'm here to help with your travel questions!",
          destination: updatedContext.destination || "",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const aiErrorMessage = {
          id: Date.now() + 1,
          sender: "ai",
          text: errorData.reply || "Sorry, I'm having trouble connecting to the AI service right now. Please try again in a moment.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, aiErrorMessage]);
      }
    } catch (err) {
      console.error("Chatbot API Error:", err);
      const networkErrorMessage = {
        id: Date.now() + 1,
        sender: "ai",
        text: "Sorry, I'm having trouble connecting to the travel AI right now. Please make sure the backend server is running.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, networkErrorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="travel-chatbot-wrapper">
      {/* Floating Toggle Trigger Button */}
      {!isOpen && (
        <button
          className="chatbot-toggle-btn"
          onClick={() => setIsOpen(true)}
          title="Chat with Travexa AI"
        >
          <span className="chatbot-toggle-icon">🧳</span>
          <span className="chatbot-toggle-pulse" />
        </button>
      )}

      {/* Main Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">🤖</div>
              <div>
                <h3>🧳 Travexa AI</h3>
                <span className="chatbot-online-status">
                  <span className="status-dot" /> Online • Travel Assistant
                </span>
              </div>
            </div>

            <button
              className="chatbot-close-btn"
              onClick={() => setIsOpen(false)}
              title="Close Chat"
            >
              ✕
            </button>
          </div>

          {/* Messages Container */}
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chatbot-message-row ${
                  msg.sender === "user" ? "user-row" : "ai-row"
                }`}
              >
                {msg.sender === "ai" && <div className="msg-avatar">🤖</div>}

                <div className="msg-bubble">
                  <p className="msg-text">{msg.text}</p>
                  {msg.destination && msg.sender === "ai" && (
                    <div className="msg-video-cta">
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                          msg.destination + " travel guide 2026"
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-chat-videos"
                      >
                        🎥 Watch {msg.destination} Travel Videos →
                      </a>
                    </div>
                  )}
                  <span className="msg-timestamp">{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isThinking && (
              <div className="chatbot-message-row ai-row">
                <div className="msg-avatar">🤖</div>
                <div className="msg-bubble thinking-bubble">
                  <span className="thinking-dots">
                    <span />
                    <span />
                    <span />
                  </span>
                  <span className="thinking-text">Travexa AI is typing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Buttons above Input */}
          <div className="chatbot-quick-prompts">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                className="quick-prompt-chip"
                onClick={() => handleSend(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            className="chatbot-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              type="text"
              placeholder="Ask Travexa AI about your trip..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="chatbot-input"
            />
            <button type="submit" className="chatbot-send-btn" title="Send Message">
              ✈️
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default TravelChatbot;
