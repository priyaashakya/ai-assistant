import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { userDataContext } from "../context/UserContext";
import { RxCross1 } from "react-icons/rx";

const Home = () => {
  const { userData, serverUrl, setUserData } = useContext(userDataContext);
  const navigate = useNavigate();

  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [micError, setMicError] = useState("");
  const [started, setStarted] = useState(false); // becomes true after user gesture

  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const isRecognizingRef = useRef(false);
  const shouldListenRef = useRef(true); // master switch: keep the loop alive
  const restartTimeoutRef = useRef(null);
  const voicesReadyRef = useRef(false);
  const utteranceRef = useRef(null); // prevents Chrome from GC'ing mid-speech
  const synth = window.speechSynthesis;

  useEffect(() => {
    if (!userData) {
      navigate("/signin");
      return;
    }
    if (!userData.assistantName || !userData.assistantImage) {
      navigate("/customize");
    }
  }, [userData]);

  // Chrome loads voices asynchronously — speak() can fail silently if called
  // before the voice list is populated.
  useEffect(() => {
    const loadVoices = () => {
      if (synth.getVoices().length > 0) voicesReadyRef.current = true;
    };
    loadVoices();
    synth.addEventListener("voiceschanged", loadVoices);
    return () => synth.removeEventListener("voiceschanged", loadVoices);
  }, []);

  const speak = (text) => {
    return new Promise((resolve) => {
      if (!text) return resolve();
      isSpeakingRef.current = true;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-IN";
      utterance.rate = 1;
      utterance.volume = 1;
      utteranceRef.current = utterance; // keep a strong reference — Chrome can
      // silently drop speech mid-utterance if this object gets garbage collected
      const finish = () => {
        isSpeakingRef.current = false;
        utteranceRef.current = null;
        resolve();
      };
      utterance.onend = finish;
      utterance.onerror = (e) => {
        console.warn("Speech synthesis error:", e.error);
        finish();
      };
      // small delay avoids Chrome's "cancel right after speak" glitch
      setTimeout(() => {
        if (synth.paused) synth.resume();
        synth.speak(utterance);
      }, 100);
    });
  };

  const [pendingLink, setPendingLink] = useState(null); // fallback if popup blocked

  const handleCommandAction = (data) => {
    const { type, userInput, response } = data;
    let url = null;

    switch (type) {
      case "google_search":
        url = `https://www.google.com/search?q=${encodeURIComponent(userInput)}`;
        break;
      case "youtube_open":
        url = "https://www.youtube.com";
        break;
      case "youtube_search":
        url = `https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}`;
        break;
      case "youtube_play":
        url = `https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}`;
        break;
      case "calculator_open":
        url = "https://www.google.com/search?q=calculator";
        break;
      case "instagram_open":
        url = "https://www.instagram.com";
        break;
      case "facebook_open":
        url = "https://www.facebook.com";
        break;
      case "whatsapp_open":
        url = "https://web.whatsapp.com";
        break;
      default:
        break;
      case "open_github":
        window.open("https://github.com", "_blank");
        break;

      case "open_chatgpt":
        window.open("https://chat.openai.com", "_blank");
        break;

      case "open_gmail":
        window.open("https://mail.google.com", "_blank");
        break;
        switch (type) {
          case "google_open":
            window.open("https://www.google.com", "_blank");
            break;

          case "gmail_open":
            window.open("https://mail.google.com", "_blank");
            break;

          case "github_open":
            window.open("https://github.com", "_blank");
            break;

          case "linkedin_open":
            window.open("https://www.linkedin.com", "_blank");
            break;

          case "chatgpt_open":
            window.open("https://chat.openai.com", "_blank");
            break;

          case "netflix_open":
            window.open("https://www.netflix.com", "_blank");
            break;

          case "amazon_open":
            window.open("https://www.amazon.com", "_blank");
            break;

          case "flipkart_open":
            window.open("https://www.flipkart.com", "_blank");
            break;

          case "spotify_open":
            window.open("https://open.spotify.com", "_blank");
            break;

          case "discord_open":
            window.open("https://discord.com/app", "_blank");
            break;

          case "telegram_open":
            window.open("https://web.telegram.org", "_blank");
            break;

          case "reddit_open":
            window.open("https://www.reddit.com", "_blank");
            break;

          case "twitter_open":
          case "x_open":
            window.open("https://x.com", "_blank");
            break;

          case "pinterest_open":
            window.open("https://www.pinterest.com", "_blank");
            break;

          case "canva_open":
            window.open("https://www.canva.com", "_blank");
            break;

          case "drive_open":
            window.open("https://drive.google.com", "_blank");
            break;

          case "docs_open":
            window.open("https://docs.google.com", "_blank");
            break;

          case "maps_open":
            window.open("https://maps.google.com", "_blank");
            break;

          case "calendar_open":
            window.open("https://calendar.google.com", "_blank");
            break;

          case "news_open":
            window.open("https://news.google.com", "_blank");
            break;

          case "wikipedia_open":
            window.open("https://www.wikipedia.org", "_blank");
            break;

          case "stackoverflow_open":
            window.open("https://stackoverflow.com", "_blank");
            break;

          case "github_search":
            window.open(
              `https://github.com/search?q=${encodeURIComponent(userInput)}`,
              "_blank",
            );
            break;

          case "maps_search":
            window.open(
              `https://www.google.com/maps/search/${encodeURIComponent(userInput)}`,
              "_blank",
            );
            break;

          default:
            break;
        }
    }

    if (!url) return;

    const win = window.open(url, "_blank");
    // If the browser silently blocked the popup, win is null/undefined,
    // or some browsers return a closed window object.
    if (!win || win.closed || typeof win.closed === "undefined") {
      console.warn("[assistant] popup blocked, showing fallback link:", url);
      setPendingLink({ url, label: new URL(url).hostname });
    } else {
      setPendingLink(null);
    }
  };

  // Safely (re)start recognition, guarding against overlapping start() calls
  // which throw "InvalidStateError" in Chrome and silently kill the loop.
  const startRecognition = () => {
    if (!shouldListenRef.current) return;
    if (isSpeakingRef.current) return;
    if (isRecognizingRef.current) return;
    if (document.hidden) return; // don't fight the mic when tab isn't active

    clearTimeout(restartTimeoutRef.current);
    try {
      recognitionRef.current?.start();
    } catch (e) {
      // Already running or transiently unavailable — retry shortly.
      restartTimeoutRef.current = setTimeout(startRecognition, 600);
    }
  };

  const scheduleRestart = (delay = 700) => {
    clearTimeout(restartTimeoutRef.current);
    restartTimeoutRef.current = setTimeout(startRecognition, delay);
  };

  const handleAskAssistant = async (command) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/user/asktoassistant`,
        { command },
        { withCredentials: true, timeout: 20000 },
      );
      setAiText(result.data.response);
      handleCommandAction(result.data);
      setUserData((prev) =>
        prev
          ? {
              ...prev,
              history: [
                ...(prev.history || []),
                {
                  input: command,
                  response: result.data.response,
                  type: result.data.type,
                },
              ],
            }
          : prev,
      );
      await speak(result.data.response);
    } catch (error) {
      const fallback =
        error?.response?.data?.response ||
        (error.code === "ECONNABORTED"
          ? "That took too long to respond, so I gave up. Please try again."
          : "Sorry, I ran into an error understanding that. Please try again.");
      setAiText(fallback);
      await speak(fallback);
    } finally {
      // Whatever happened, resume listening so the assistant keeps responding.
      scheduleRestart(400);
    }
  };

  useEffect(() => {
    if (!started || !userData?.assistantName) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicError(
        "Voice recognition isn't supported in this browser. Try Chrome or Edge (desktop).",
      );
      return;
    }

    shouldListenRef.current = true;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("[assistant] recognition started, listening...");
      isRecognizingRef.current = true;
      setListening(true);
      setMicError("");
    };

    recognition.onend = () => {
      console.log("[assistant] recognition ended");
      isRecognizingRef.current = false;
      setListening(false);
      if (shouldListenRef.current && !isSpeakingRef.current) {
        scheduleRestart(500);
      }
    };

    recognition.onerror = (e) => {
      console.warn("[assistant] recognition error:", e.error);
      isRecognizingRef.current = false;
      setListening(false);
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setMicError(
          "Microphone access was blocked. Click the mic/lock icon in the address bar, allow microphone, then reload.",
        );
        shouldListenRef.current = false;
        return;
      }
      if (shouldListenRef.current && !isSpeakingRef.current) {
        scheduleRestart(800);
      }
    };

    recognition.onresult = (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript?.trim();
      console.log("[assistant] heard:", transcript);

      if (transcript) {
        setUserText(transcript);
        setAiText("");
        handleAskAssistant(transcript);
      }
    };

    recognitionRef.current = recognition;

    (async () => {
      const fallbackGreeting = `Hello ${userData?.name || ""}, I am ${
        userData?.assistantName || "your assistant"
      }. How can I help you today?`;
      console.log("[assistant] speaking greeting...");
      await speak(fallbackGreeting);
      console.log("[assistant] greeting done, starting mic");
      startRecognition();
    })();

    return () => {
      shouldListenRef.current = false;
      clearTimeout(restartTimeoutRef.current);
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
      try {
        recognition.stop();
      } catch (e) {
        /* ignore */
      }
    };
  }, [started, userData?.assistantName]);

  // Explicit user gesture — required by browsers before audio playback and
  // (in practice) before the mic permission prompt reliably appears.
  const handleActivate = async () => {
    setMicError("");
    try {
      // Force the permission prompt / confirm access up front so errors
      // surface immediately instead of inside SpeechRecognition's opaque flow.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
    } catch (err) {
      console.warn("[assistant] mic permission denied:", err);
      setMicError(
        "Microphone permission was denied. Allow mic access in your browser settings and try again.",
      );
      return;
    }
    // Unlock speechSynthesis with a silent utterance triggered by this click.
    synth.cancel();
    setStarted(true);
  };

  // Resume listening automatically if the tab regains focus.
  useEffect(() => {
    const onVisible = () => {
      if (!document.hidden) startRecognition();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });
      setUserData(null);
      navigate("/signin");
    } catch (error) {
      console.log(error);
    }
  };

  if (!userData) return null;

  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-black to-[#02023d] flex flex-col justify-center items-center gap-5 relative overflow-hidden">
      <button
        onClick={handleLogout}
        className="absolute top-5 right-5 min-w-[100px] h-[45px] bg-white rounded-full text-black font-semibold"
      >
        Logout
      </button>
      <button
        onClick={() => navigate("/customize")}
        className="absolute top-5 left-5 min-w-[100px] h-[45px] bg-white rounded-full text-black font-semibold"
      >
        Edit
      </button>

      <div
        className={`w-[200px] h-[350px] rounded-2xl overflow-hidden shadow-lg shadow-blue-950 transition-all ${
          listening
            ? "border-4 border-blue-400 animate-pulse"
            : "border-2 border-[#0000ff66]"
        }`}
      >
        <img
          src={userData.assistantImage}
          alt="assistant"
          className="h-full w-full object-cover"
        />
      </div>

      <h1 className="text-white text-xl font-semibold">
        I&apos;m {userData.assistantName}
      </h1>

      <p className="text-blue-300 text-sm">
        {!started
          ? "Click the button below to activate voice mode"
          : listening
            ? "Listening... just speak, no need to say my name"
            : "Getting ready..."}
      </p>
      {micError && (
        <p className="text-red-400 text-sm text-center px-6 max-w-[500px]">
          {micError}
        </p>
      )}

      {!started && (
        <button
          onClick={handleActivate}
          className="min-w-[220px] h-[55px] bg-blue-500 hover:bg-blue-600 rounded-full text-white font-semibold text-lg mt-2"
        >
          Activate Assistant
        </button>
      )}

      {userText && (
        <p className="text-white text-center px-6 max-w-[600px]">{userText}</p>
      )}
      {aiText && (
        <p className="text-blue-200 text-center px-6 max-w-[600px]">{aiText}</p>
      )}
      {pendingLink && (
        <a
          href={pendingLink.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setPendingLink(null)}
          className="text-sm text-yellow-300 underline"
        >
          Your browser blocked the popup — tap here to open {pendingLink.label}
        </a>
      )}

      <button
        onClick={() => setShowHistory(true)}
        className="min-w-[150px] h-[50px] bg-white/10 border border-white rounded-full text-white font-semibold mt-4"
      >
        History
      </button>

      {showHistory && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center pt-16 z-50">
          <RxCross1
            className="absolute top-5 right-5 text-white cursor-pointer"
            size={30}
            onClick={() => setShowHistory(false)}
          />
          <h2 className="text-white text-2xl mb-4">History</h2>
          <div className="w-[90%] max-w-[600px] max-h-[70vh] overflow-y-auto flex flex-col gap-3">
            {userData.history?.length ? (
              userData.history
                .slice()
                .reverse()
                .map((item, idx) => (
                  <div
                    key={item._id || idx}
                    className="bg-white/10 rounded-lg px-4 py-3 flex flex-col gap-1"
                  >
                    <p className="text-blue-300 text-xs uppercase tracking-wide">
                      You said
                    </p>
                    <p className="text-white">
                      {typeof item === "string" ? item : item.input}
                    </p>
                    {typeof item !== "string" && item.response && (
                      <>
                        <p className="text-blue-300 text-xs uppercase tracking-wide mt-2">
                          {userData.assistantName} replied
                        </p>
                        <p className="text-blue-100">{item.response}</p>
                      </>
                    )}
                  </div>
                ))
            ) : (
              <p className="text-gray-400">No history yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
