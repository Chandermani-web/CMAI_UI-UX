import { useState } from "react";
import { useSelector } from "react-redux";
import { startInterview } from "../../apis/interview.api.js";
import { useCoin } from "../../apis/user.api.js";
import { useDispatch } from 'react-redux';
import { useNavigate } from "react-router-dom";

const ROLES = [
  "Backend Developer",
  "Frontend Developer",
  "Full Stack Developer",
  "AI Engineer",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Data Engineer",
];

const FEATURES = [
  "Personalized AI questions",
  "Resume-based interview",
  "Detailed performance report",
  "Real interview experience",
];

const Icon = ({ path, className = "h-5 w-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
  </svg>
);

const ICONS = {
  back: "M15 19l-7-7 7-7",
  check: "M5 13l4 4L19 7",
  user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  chevron: "M19 9l-7 7-7-7",
  arrow: "M5 12h14M13 6l6 6-6 6",
  upload: "M12 16V4m0 0l-4 4m4-4l4 4M5 14v5a1 1 0 001 1h12a1 1 0 001-1v-5",
  file: "M7 3h8l4 4v14H7V3zM15 3v5h5M10 13h6M10 17h6",
};

export default function Step1Setup({ user, setUser }) {
  const navigate = useNavigate();

  const reduxResume = useSelector(
    (state) => state.resume.resume
  );

  const [targetRole, setTargetRole] = useState("Backend Developer");
  const [customRole, setCustomRole] = useState("");
  const [interviewType, setInterviewType] = useState("Technical");
  const [useResume, setUseResume] = useState(true);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);

  const hasSavedResume = Boolean(reduxResume);
  const hasUploadedFile = Boolean(resume);
  const showResumeCard = hasUploadedFile || hasSavedResume;

  const handleStart = async () => {
    // Prevent double clicks
    if (loading) return;

    const role =
      targetRole === "Other"
        ? customRole.trim()
        : targetRole;

    if (!role) {
      alert("Please enter your target role.");
      return;
    }

    try {
      setLoading(true);

      const interviewData = {
        role,
        type: interviewType,
        useResume,
        resume: resume || reduxResume || null,
      };

      console.log("Starting interview:", interviewData);

      // 1. Create interview
      const res = await startInterview(interviewData);

      const response = await res.json();

      console.log("Start interview response:", response);

      if (!response?.success || !response?.interviewId) {
        console.error("Failed to start interview:", response);
        alert(
          response?.message || "Failed to start interview. Please try again."
        );
        return;
      }

      // 2. Deduct 50 coins
      const coinResponse = await useCoin({
        coins: 50,
        action: "start_interview",
      });

      console.log("Coin response:", coinResponse);

      // If your API returns { success: true, interviewCoin: ... }
      if (!coinResponse?.success) {
        console.error("Failed to deduct coins:", coinResponse);

        alert(
          coinResponse?.message ||
            "Unable to deduct interview coins. Please try again."
        );

        return;
      }

      // 3. Update local user state
      if (setUser) {
        setUser((prevUser) => ({
          ...prevUser,
          interviewCoin:
            coinResponse?.interviewCoin ??
            coinResponse?.user?.interviewCoin ??
            prevUser?.interviewCoin,
        }));
      }

      // 4. Redirect to interview page
      navigate(`/interview/${response.interviewId}`, {
        replace: true,
      });
    } catch (error) {
      console.error("Start interview error:", error);

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while starting the interview."
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#0b0c11] text-white">
      <div className="grid min-h-screen lg:grid-cols-[42%_58%]">
        {/* ───────── Left: brand panel ───────── */}
        <aside className="border-b border-[#1e2028] px-8 py-10 lg:border-b-0 lg:border-r lg:px-12">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-full border border-[#2a2c36] bg-[#14151c] px-4 py-2 text-sm text-gray-300 transition hover:border-[#3a3c48] hover:text-white"
          >
            <Icon path={ICONS.back} className="h-4 w-4" />
            Back
          </button>

          <div className="mt-10 max-w-md">
            <h1 className="text-[34px] font-bold leading-tight tracking-tight">
              Welcome back,
              <br />
              {user?.username || "there"}
            </h1>
            <p className="mt-4 text-[15px] leading-7 text-gray-400">
              Practice realistic AI interviews, get instant feedback, and walk
              into the real thing prepared.
            </p>
          </div>

          <ul className="mt-9 space-y-3">
            {FEATURES.map((f) => (
              <li
                key={f}
                className="flex items-center gap-4 rounded-xl border border-[#20222c] bg-[#111218] px-4 py-3.5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-black">
                  <Icon path={ICONS.check} className="h-4 w-4" />
                </span>
                <span className="text-[15px] text-gray-200">{f}</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* ───────── Right: setup form ───────── */}
        <main className="px-6 py-10 sm:px-10 lg:px-14">
          <div className="mx-auto max-w-xl">
            <h2 className="text-3xl font-bold tracking-tight">Start interview</h2>
            <p className="mt-1.5 text-sm text-gray-500">
              Configure your interview preferences.
            </p>

            {/* Target role */}
            <div className="mt-8">
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Target role
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-gray-500">
                  <Icon path={ICONS.user} className="h-5 w-5" />
                </span>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="h-[52px] w-full appearance-none rounded-xl border border-[#2a2c36] bg-[#111218] pl-12 pr-10 text-[15px] text-gray-200 outline-none transition focus:border-white"
                >
                  {ROLES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                  <option value="Other">Other / write your own</option>
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-500">
                  <Icon path={ICONS.chevron} className="h-4 w-4" />
                </span>
              </div>

              {targetRole === "Other" && (
                <input
                  type="text"
                  autoFocus
                  placeholder="Enter your target role…"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  className="mt-3 h-[52px] w-full rounded-xl border border-[#2a2c36] bg-[#111218] px-4 text-[15px] text-white outline-none transition placeholder:text-gray-500 focus:border-white"
                />
              )}
            </div>

            {/* Interview type */}
            <div className="mt-6">
              <label className="mb-2.5 block text-sm font-medium text-gray-300">
                Interview type
              </label>
              <div className="grid grid-cols-2 gap-1 rounded-xl border border-[#2a2c36] bg-[#111218] p-1">
                {["Technical", "HR"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setInterviewType(type)}
                    className={`h-10 rounded-lg text-sm font-semibold transition ${
                      interviewType === type
                        ? "bg-white text-black"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Resume toggle */}
            <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-[#2a2c36] bg-[#111218] px-5 py-4">
              <div>
                <h3 className="font-semibold text-white">Use resume</h3>
                <p className="mt-0.5 text-sm text-gray-500">
                  Personalize questions using your resume.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={useResume}
                onClick={() => setUseResume(!useResume)}
                className={`relative h-8 w-13 shrink-0 rounded-full transition ${
                  useResume ? "bg-white" : "bg-[#2a2c36]"
                }`}
                style={{ width: "3.25rem" }}
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-black transition-all ${
                    useResume ? "left-[calc(100%-1.75rem)]" : "left-1"
                  }`}
                />
              </button>
            </div>

            {useResume && (
              <>
                {/* Resume status: shows the freshly uploaded file if there is
                    one this session, otherwise falls back to the resume
                    already on file in Redux. Hidden entirely if neither
                    exists, so the upload prompt below carries the weight. */}
                {showResumeCard && (
                  <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-800/60 bg-emerald-950/30 px-5 py-4">
                    <div className="flex items-center gap-3.5">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-white">
                        <Icon path={ICONS.file} className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="font-semibold text-white">
                          {hasUploadedFile ? resume.name : "Resume ready"}
                        </h3>
                        <p className="mt-0.5 text-sm text-gray-400">
                          {hasUploadedFile
                            ? "New resume selected."
                            : `Resume detected successfully · score ${reduxResume.score}/100`}
                        </p>
                      </div>
                    </div>
                    <Icon path={ICONS.check} className="h-5 w-5 text-emerald-400" />
                  </div>
                )}

                <label
                  htmlFor="resume-upload"
                  className="mt-4 flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#2e303c] bg-[#111218] px-6 py-8 text-center transition hover:border-white/60 hover:bg-[#14151c]"
                >
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => e.target.files?.[0] && setResume(e.target.files[0])}
                    className="hidden"
                  />
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-black">
                    <Icon path={ICONS.upload} className="h-6 w-6" />
                  </span>
                  <h3 className="mt-3.5 font-semibold text-white">
                    {showResumeCard ? "Upload a different resume" : "Upload resume"}
                  </h3>
                  <p className="mt-1.5 max-w-sm text-sm text-gray-500">
                    {hasUploadedFile
                      ? `Selected: ${resume.name}`
                      : hasSavedResume
                      ? "Upload a new file to replace the one on record."
                      : "PDF or Word, up to 10MB."}
                  </p>
                </label>
              </>
            )}

            <button
              type="button"
              onClick={handleStart}
              disabled={loading}
              className={`mt-7 flex h-[56px] w-full items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[0.99] ${
                loading
                  ? "bg-white/60 text-black/50 cursor-not-allowed"
                  : "bg-white text-black hover:bg-gray-200"
              }`}
            >
              {loading ? (
                <>
                  <span className="h-5 w-5 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                  Starting interview…
                </>
              ) : (
                <>
                  Start interview
                  <Icon path={ICONS.arrow} className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}