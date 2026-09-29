import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { submitAnswer } from "../../apis/interview.api";
import "./Step2interview.css";

/* ---------------- Icons ---------------- */
const ip = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };

const MicIcon = (p) => (
  <svg viewBox="0 0 24 24" width={18} height={18} {...ip} {...p}>
    <rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0" /><path d="M12 19v3" /><path d="M8 22h8" />
  </svg>
);
const CameraIcon = (p) => (
  <svg viewBox="0 0 24 24" width={18} height={18} {...ip} {...p}>
    <rect x="3" y="7" width="13" height="10" rx="2" /><path d="m16 10 5-3v10l-5-3z" />
  </svg>
);
const CameraOffIcon = (p) => (
  <svg viewBox="0 0 24 24" width={22} height={22} {...ip} {...p}>
    <path d="M3 3l18 18" /><path d="M10.5 7H16a1 1 0 0 1 1 1v2.5" /><path d="M3 7.5V16a1 1 0 0 0 1 1h9.5" /><path d="m17 10 4-2.5v9L17 14" />
  </svg>
);
const CodeIcon = (p) => (
  <svg viewBox="0 0 24 24" width={18} height={18} {...ip} {...p}>
    <path d="m8 9-4 3 4 3" /><path d="m16 9 4 3-4 3" /><path d="m14 5-4 14" />
  </svg>
);
const ArrowRightIcon = (p) => (
  <svg viewBox="0 0 24 24" width={18} height={18} {...ip} {...p}><path d="M5 12h13m-6-6 6 6-6 6" /></svg>
);
const RefreshIcon = (p) => (
  <svg viewBox="0 0 24 24" width={14} height={14} {...ip} {...p}>
    <path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 4v6h-6" />
  </svg>
);
const SpeakerIcon = (p) => (
  <svg viewBox="0 0 24 24" width={16} height={16} {...ip} {...p}>
    <path d="M11 5 6 9H3v6h3l5 4z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" />
  </svg>
);
const SpeakerOffIcon = (p) => (
  <svg viewBox="0 0 24 24" width={16} height={16} {...ip} {...p}>
    <path d="M11 5 6 9H3v6h3l5 4z" /><path d="m23 9-6 6" /><path d="m17 9 6 6" />
  </svg>
);
const CheckIcon = (p) => (
  <svg viewBox="0 0 24 24" width={18} height={18} {...ip} {...p}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

/* ---------------- Camera + mic hook ---------------- */
function useLiveMedia() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const rafRef = useRef(null);
  const [status, setStatus] = useState("loading"); // loading | ready | denied
  const [micLevel, setMicLevel] = useState(0);

  const start = async () => {
    setStatus("loading");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      audioCtx.createMediaStreamSource(stream).connect(analyser);
      audioCtxRef.current = audioCtx;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const measureLevel = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((s, v) => s + v, 0) / data.length;
        setMicLevel(Math.min(1, avg / 90));
        rafRef.current = requestAnimationFrame(measureLevel);
      };
      measureLevel();
      setStatus("ready");
    } catch {
      setStatus("denied");
    }
  };

  useEffect(() => {
    start();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Attach stream once the <video> element mounts (status === "ready")
  useEffect(() => {
    if (status === "ready" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [status]);

  return { videoRef, status, micLevel, retry: start };
}

/* ---------------- Speak the question out loud (TTS) ---------------- */
function useSpeechSynthesis() {
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  const speak = useCallback((text) => {
    if (!supported || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  useEffect(() => () => stop(), [stop]);

  return { speak, stop, speaking, supported };
}

/* ---------------- Speak your answer out loud (STT) ---------------- */
function useSpeechRecognition(onFinalResult) {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const SpeechRecognitionClass =
    typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const supported = Boolean(SpeechRecognitionClass);

  useEffect(() => {
    if (!supported) return;

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (transcript.trim()) onFinalResult(transcript.trim());
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    return () => recognition.stop();
  }, [supported, SpeechRecognitionClass, onFinalResult]);

  const toggle = useCallback(() => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  }, [listening]);

  return { listening, toggle, supported };
}

/* ---------------- Small pieces ---------------- */
function MicLevelBars({ level }) {
  const heights = [40, 70, 100, 70, 40];
  return (
    <div className="s2i-bars">
      {heights.map((h, i) => (
        <span key={i} className="s2i-bar" style={{ height: `${Math.max(20, level * h)}%` }} />
      ))}
    </div>
  );
}

function ControlButton({ active, onClick, title, icon: Icon }) {
  return (
    <button onClick={onClick} title={title} className={`s2i-ctrl-btn ${active ? "s2i-ctrl-btn--active" : ""}`}>
      <Icon />
    </button>
  );
}

function CircularTimer({ timeLeft, maxTime, label }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, timeLeft / maxTime));
  const isLow = timeLeft <= 10;

  return (
    <div className="s2i-timer">
      <svg className="s2i-timer-svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <circle
          cx="50" cy="50" r={radius} fill="none" stroke={isLow ? "#f87171" : "#34d399"}
          strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)} className="s2i-timer-progress"
        />
      </svg>
      <div className="s2i-timer-label-wrap">
        <div className={`s2i-timer-label ${isLow ? "s2i-timer-label--low" : ""}`}>{label}</div>
        <div className="s2i-timer-sub">left</div>
      </div>
    </div>
  );
}

const DIFFICULTY_CLASS = { hard: "s2i-diff--hard", medium: "s2i-diff--medium", easy: "s2i-diff--easy" };

/* ---------------- Main component ---------------- */
export default function Step2interview({ user, interviewData, onAnswerSubmitted }) {
  const { interviewId, currentQuestion, totalQuestions, question } = interviewData;
  const { videoRef, status: cameraStatus, micLevel, retry } = useLiveMedia();
  const aiVideoRef = useRef(null);

  const [answer, setAnswer] = useState("");
  const [code, setCode] = useState("");
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("idle"); // idle | success
  const autoSubmittedRef = useRef(false);

  const maxTime = question?.timer || 60;
  const difficulty = question?.difficulty || "easy";
  const [timeLeft, setTimeLeft] = useState(maxTime);

  // Append recognized speech onto whatever is already typed, so voice
  // and keyboard input both feed the same answer box.
  const handleSpeechResult = useCallback((words) => {
    setAnswer((prev) => (prev ? `${prev} ${words}` : words));
  }, []);

  const { speak, stop: stopSpeaking, speaking, supported: ttsSupported } = useSpeechSynthesis();
  const { listening, toggle: toggleListening, supported: sttSupported } = useSpeechRecognition(handleSpeechResult);

  const currentResponse = showCodeEditor ? code : answer;

  // Reset when the question changes, and read the new question out loud by default
  useEffect(() => {
    setTimeLeft(maxTime);
    setAnswer("");
    setCode("");
    setIsSubmitting(false);
    setSubmitStatus("idle");
    autoSubmittedRef.current = false;
    speak(question?.question);
    return () => stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, maxTime]);

  // Countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  // Play the AI-interviewer video only while she's actually talking;
  // pause (and rewind) it the moment speech stops.
  useEffect(() => {
    const vid = aiVideoRef.current;
    if (!vid) return;

    if (speaking) {
      vid.currentTime = 0;
      const playPromise = vid.play();
      if (playPromise?.catch) playPromise.catch(() => {}); // ignore AbortError from rapid toggles
    } else {
      vid.pause();
      vid.currentTime = 0;
    }
  }, [speaking]);

  const formattedTime = useMemo(() => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return m > 0 ? `${m}:${s.toString().padStart(2, "0")}` : `${s}s`;
  }, [timeLeft]);

  const progressPercent = ((currentQuestion + 1) / totalQuestions) * 100;

  // isAuto=true (timer ran out) bypasses the "must have typed something" guard,
  // since the answer has to go in whether or not the box is empty.
  const handleSubmit = useCallback(async (isAuto = false) => {
    if (isSubmitting || submitStatus === "success") return;
    if (!isAuto && !currentResponse.trim()) return;

    if (listening) toggleListening();
    stopSpeaking();
    setIsSubmitting(true);
    try {
      const response = await submitAnswer({ interviewId, answer: currentResponse });
      if (response?.success === true) {
        // Show the green "Submitted" state for a beat before moving on.
        setSubmitStatus("success");
        setTimeout(() => {
          setSubmitStatus("idle");
          if (typeof onAnswerSubmitted === "function") {
            onAnswerSubmitted();
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setIsSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitting, submitStatus, currentResponse, listening, interviewId, onAnswerSubmitted]);

  // Auto-submit once the clock hits zero, exactly once per question.
  useEffect(() => {
    if (timeLeft <= 0 && !autoSubmittedRef.current && !isSubmitting && submitStatus === "idle") {
      autoSubmittedRef.current = true;
      handleSubmit(true);
    }
  }, [timeLeft, isSubmitting, submitStatus, handleSubmit]);

  return (
    <div className="s2i-page">
      <div className="s2i-shell">

        {/* LEFT: video + controls */}
        <aside className="s2i-aside">
          <div className="s2i-ai-video">
            <video ref={aiVideoRef} src="/female-ai.mp4" loop muted playsInline />
            <div className="s2i-ai-badge"><span className="s2i-live-dot" />AI Interviewer</div>
          </div>

          <div className="s2i-cam">
            {cameraStatus === "ready" && (
              <video ref={videoRef} autoPlay muted playsInline className="s2i-cam-video" />
            )}
            {cameraStatus === "loading" && (
              <div className="s2i-cam-state">
                <div className="s2i-cam-spinner" />
                <p className="s2i-cam-state-text">Starting camera…</p>
              </div>
            )}
            {cameraStatus === "denied" && (
              <div className="s2i-cam-denied">
                <div className="s2i-cam-denied-icon"><CameraOffIcon /></div>
                <p className="s2i-cam-denied-title">Camera access is blocked</p>
                <p className="s2i-cam-denied-sub">Allow camera & mic permissions to continue</p>
                <button onClick={retry} className="s2i-retry-btn"><RefreshIcon />Try again</button>
              </div>
            )}
            {cameraStatus === "ready" && <div className="s2i-live-badge"><span className="s2i-live-red" />LIVE</div>}
            <div className="s2i-cam-footer">
              <span className="s2i-cam-name">{user?.username || "Candidate"}</span>
              <MicLevelBars level={micLevel} />
            </div>
          </div>

          <div className="s2i-controls">
            <ControlButton active title="Microphone — always on" icon={MicIcon} />
            <ControlButton active={cameraStatus === "ready"} title="Camera — always on" icon={CameraIcon} />
            <ControlButton active={showCodeEditor} onClick={() => setShowCodeEditor((v) => !v)} title="Toggle coding editor" icon={CodeIcon} />
          </div>
          <p className="s2i-controls-hint">Coding question? Use {"</>"} to open the coding editor</p>
        </aside>

        {/* RIGHT: question + answer */}
        <main className="s2i-main">
          <div className="s2i-header">
            <div>
              <h1 className="s2i-title">AI Interview</h1>
              <div className="s2i-subrow">
                <span>{difficulty}</span><span className="s2i-dot">•</span><span>{interviewData?.role || "Technical Interview"}</span>
              </div>
            </div>
            <CircularTimer timeLeft={timeLeft} maxTime={maxTime} label={formattedTime} />
          </div>

          <section className="s2i-question">
            <div className="s2i-question-top">
              <p className="s2i-question-label">Question {currentQuestion + 1}</p>
              {ttsSupported && (
                <button
                  onClick={() => (speaking ? stopSpeaking() : speak(question?.question))}
                  title={speaking ? "Stop reading" : "Read question aloud"}
                  className={`s2i-speak-btn ${speaking ? "s2i-speak-btn--active" : ""}`}
                >
                  {speaking ? <SpeakerOffIcon /> : <SpeakerIcon />}
                  {speaking ? "Stop" : "Speak"}
                </button>
              )}
            </div>
            <h2 className="s2i-question-text">{question?.question}</h2>
            <span className={`s2i-diff ${DIFFICULTY_CLASS[difficulty] || DIFFICULTY_CLASS.easy}`}>{difficulty}</span>
          </section>

          <div className="s2i-progress">
            <div className="s2i-progress-row"><span>Progress</span><span>{currentQuestion + 1}/{totalQuestions}</span></div>
            <div className="s2i-progress-track"><div className="s2i-progress-fill" style={{ width: `${progressPercent}%` }} /></div>
          </div>

          <div className="s2i-answer">
            <div className="s2i-answer-header">
              <label className="s2i-answer-label">{showCodeEditor ? "Code Editor" : "Your Answer"}</label>
              <div className="s2i-answer-tools">
                {!showCodeEditor && sttSupported && (
                  <button
                    onClick={toggleListening}
                    title={listening ? "Stop dictating" : "Speak your answer"}
                    className={`s2i-dictate-btn ${listening ? "s2i-dictate-btn--active" : ""}`}
                  >
                    <MicIcon />
                    {listening ? "Listening…" : "Speak answer"}
                  </button>
                )}
                <span className="s2i-answer-count">{currentResponse.length} characters</span>
              </div>
            </div>
            <textarea
              value={showCodeEditor ? code : answer}
              onChange={(e) => (showCodeEditor ? setCode(e.target.value) : setAnswer(e.target.value))}
              placeholder={showCodeEditor ? "// Write your code here" : "Type your answer, or tap \"Speak answer\" to dictate it"}
              spellCheck={!showCodeEditor}
              disabled={submitStatus === "success" || (isSubmitting && timeLeft <= 0)}
              className={`s2i-textarea ${showCodeEditor ? "s2i-textarea--code" : ""}`}
            />
          </div>

          <div className="s2i-footer">
            <div className="s2i-footer-hint">
              {timeLeft <= 0
                ? "Time's up — submitting your answer…"
                : (
                  <>Press <kbd className="s2i-kbd">Ctrl</kbd> + <kbd className="s2i-kbd">Enter</kbd> to submit</>
                )}
            </div>
            <button
              onClick={() => handleSubmit(false)}
              disabled={!currentResponse.trim() || isSubmitting || submitStatus === "success"}
              className={`s2i-submit-btn ${submitStatus === "success" ? "s2i-submit-btn--success" : ""}`}
              style={submitStatus === "success" ? { backgroundColor: "#22c55e", borderColor: "#22c55e", color: "#fff" } : undefined}
            >
              {submitStatus === "success" ? (
                <>
                  <CheckIcon /> Submitted!
                </>
              ) : isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  Submit Answer <ArrowRightIcon />
                </>
              )}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}