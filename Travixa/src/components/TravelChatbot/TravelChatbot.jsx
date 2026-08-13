import React, { useState, useEffect, useRef } from "react";
import { sendChatMessage } from "../../services/api";
import "./TravelChatbot.css";

const LANGUAGES = [
  { code: "en", name: "English", bcp47: "en-US", flag: "🇬🇧" },
  { code: "hi", name: "हिंदी (Hindi)", bcp47: "hi-IN", flag: "🇮🇳" },
  { code: "mr", name: "मराठी (Marathi)", bcp47: "mr-IN", flag: "🇮🇳" },
];

const QUICK_PROMPTS = {
  en: [
    "📍 Best places to visit",
    "🏨 Budget hotels",
    "🧳 Packing tips",
    "🍽️ Local food",
    "🌤️ Weather",
  ],
  hi: [
    "📍 घूमने की बेहतरीन जगहें",
    "🏨 बजट होटल",
    "🧳 पैकिंग टिप्स",
    "🍽️ स्थानीय भोजन",
    "🌤️ मौसम का हाल",
  ],
  mr: [
    "📍 भेट देण्यासाठी सर्वोत्तम ठिकाणे",
    "🏨 बजेट हॉटेल्स",
    "🧳 पॅकिंग टिप्स",
    "🍽️ स्थानिक खाद्यपदार्थ",
    "🌤️ हवामानाचा अंदाज",
  ],
};

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: "ai",
    text: "Hello! I'm Travexa AI, your multi-language travel assistant ✈️. Where are you planning to go?",
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
  const [selectedLang, setSelectedLang] = useState("en");

  // Conversation Context
  const [context, setContext] = useState(INITIAL_CONTEXT);

  // Voice Assistant States
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(true);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Check Web Speech API support and preload voices
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition || !window.speechSynthesis) {
      setSpeechSupported(false);
    } else {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Auto scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isThinking, isOpen]);

  // Clean text for Text-to-Speech
  const cleanTextForSpeech = (text) => {
    return text
      .replace(/https?:\/\/\S+/g, "")
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
      .replace(/\*/g, "")
      .replace(/#/g, "")
      .trim();
  };

  // Speak text with SpeechSynthesis & graceful Marathi voice fallback
  const speakText = (text, langCode = selectedLang) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const cleaned = cleanTextForSpeech(text);
    if (!cleaned) return;

    const langObj = LANGUAGES.find((l) => l.code === langCode) || LANGUAGES[0];
    const voices = window.speechSynthesis.getVoices();

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    let targetVoice = null;

    if (langObj.code === "mr") {
      // 1. Try finding Marathi voice
      targetVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().includes("mr") ||
          v.lang.toLowerCase().includes("marathi")
      );

      if (targetVoice) {
        utterance.lang = "mr-IN";
        utterance.voice = targetVoice;
      } else {
        // 2. Fallback to Hindi (hi-IN) voice for Devanagari script compatibility
        const hindiVoice = voices.find(
          (v) =>
            v.lang.toLowerCase().includes("hi") ||
            v.lang.toLowerCase().includes("hindi")
        );
        if (hindiVoice) {
          utterance.lang = "hi-IN";
          utterance.voice = hindiVoice;
        } else {
          // 3. Fallback to Indian English or default voice
          const indianEngVoice = voices.find((v) =>
            v.lang.toLowerCase().includes("en-in")
          );
          if (indianEngVoice) {
            utterance.lang = "en-IN";
            utterance.voice = indianEngVoice;
          } else {
            utterance.lang = "hi-IN"; // Request hi-IN Devanagari synthesis
          }
        }
      }
    } else {
      // Standard English & Hindi voice matching
      utterance.lang = langObj.bcp47;
      targetVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith(langObj.code) ||
          v.lang.toLowerCase().startsWith(langObj.bcp47.toLowerCase())
      );
      if (targetVoice) {
        utterance.voice = targetVoice;
      }
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setIsSpeaking(false);
    }
  };

  // Stop Speech Synthesis
  const stopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Toggle Voice Recognition (Speech-to-Text) with dynamic language
  const toggleListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    stopSpeech();

    const langObj = LANGUAGES.find((l) => l.code === selectedLang) || LANGUAGES[0];
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = langObj.bcp47;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");
      setInputText(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  // Context Extraction Helper
  const extractContextFromMessage = (text, prevContext) => {
    const updated = { ...prevContext };
    const lower = text.toLowerCase();

    // Destination Extraction
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

    // Budget Extraction
    const budgetMatch = text.match(/(?:budget\s*(?:is|=|:)?\s*|under\s*|around\s*|₹|\$)\s*(\d+[\d,]*)/i);
    if (budgetMatch && budgetMatch[1]) {
      updated.budget = budgetMatch[1].replace(/,/g, "");
    }

    // Preferences Extraction
    const prefList = [];
    if (lower.includes("adventure")) prefList.push("Adventure");
    if (lower.includes("beach")) prefList.push("Beach");
    if (lower.includes("mountain") || lower.includes("hiking")) prefList.push("Mountain");
    if (lower.includes("luxury")) prefList.push("Luxury");

    if (prefList.length > 0) {
      updated.preferences = prefList.join(", ");
    }

    return updated;
  };

  // Send message handler
  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    stopSpeech();

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
      const payload = {
        message: text,
        language: selectedLang,
        context: { ...updatedContext, language: selectedLang },
      };

      const data = await sendChatMessage(payload);
      const replyText =
        data.reply || data.message || "I'm here to help with your travel questions!";
      const aiMessage = {
        id: Date.now() + 1,
        sender: "ai",
        text: replyText,
        lang: selectedLang,
        destination: updatedContext.destination || "",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (autoSpeak) {
        speakText(replyText, selectedLang);
      }
    } catch (err) {
      console.error("Chatbot API Error:", err);
      const errText =
        err.message || "Travexa AI is temporarily unavailable. Please try again.";
      const aiErrorMessage = {
        id: Date.now() + 1,
        sender: "ai",
        text: errText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiErrorMessage]);
      if (autoSpeak) speakText(errText, selectedLang);
    } finally {
      setIsThinking(false);
    }
  };

  const activeQuickPrompts = QUICK_PROMPTS[selectedLang] || QUICK_PROMPTS.en;

  return (
    <div className="travel-chatbot-wrapper">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          className="chatbot-toggle-btn"
          onClick={() => setIsOpen(true)}
          title="Chat with Travexa AI"
        >
          <span className="chatbot-toggle-icon">🎙️</span>
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
                  <span className="status-dot" /> Online • Multi-lingual
                </span>
              </div>
            </div>

            <div className="chatbot-header-actions">
              {/* Voice Output Auto-Speak Toggle */}
              {window.speechSynthesis && (
                <button
                  type="button"
                  className={`chatbot-tts-btn ${autoSpeak ? "active" : ""}`}
                  onClick={() => {
                    if (isSpeaking) {
                      stopSpeech();
                    }
                    setAutoSpeak(!autoSpeak);
                  }}
                  title={autoSpeak ? "Voice output enabled (click to mute)" : "Voice output muted (click to enable)"}
                >
                  {isSpeaking ? "🔊 Speaking..." : autoSpeak ? "🔊 Voice On" : "🔇 Muted"}
                </button>
              )}

              <button
                className="chatbot-close-btn"
                onClick={() => {
                  stopSpeech();
                  if (isListening && recognitionRef.current) {
                    recognitionRef.current.stop();
                  }
                  setIsOpen(false);
                }}
                title="Close Chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Sub-Header Language Selector */}
          <div className="chatbot-language-bar">
            <span className="lang-label">🌐 Language / भाषा:</span>
            <select
              className="chatbot-lang-select"
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
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
                  <p className="msg-text">
                    {msg.text}
                    {msg.sender === "ai" && window.speechSynthesis && (
                      <button
                        type="button"
                        className="msg-tts-btn"
                        onClick={() => speakText(msg.text, msg.lang || selectedLang)}
                        title="Read message aloud"
                      >
                        🔊
                      </button>
                    )}
                  </p>
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
                  <span className="thinking-text">Travexa AI is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Buttons */}
          <div className="chatbot-quick-prompts">
            {activeQuickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                className="quick-prompt-chip"
                onClick={() => handleSend(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Form with Mic Button */}
          <form
            className="chatbot-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            {/* Microphone Button (Speech-to-Text) */}
            <button
              type="button"
              className={`chatbot-mic-btn ${isListening ? "listening" : ""}`}
              onClick={toggleListening}
              title={
                isListening
                  ? "Listening... Click to stop"
                  : speechSupported
                  ? `Voice Input (${LANGUAGES.find((l) => l.code === selectedLang)?.name})`
                  : "Speech recognition not supported"
              }
            >
              {isListening ? "🎙️" : "🎤"}
            </button>

            <input
              type="text"
              placeholder={
                isListening
                  ? `Listening in ${LANGUAGES.find((l) => l.code === selectedLang)?.name}...`
                  : "Ask Travexa AI about your trip..."
              }
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
