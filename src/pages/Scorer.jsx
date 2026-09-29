import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GiArtificialHive } from 'react-icons/gi';
import {
  FiUploadCloud,
  FiFile,
  FiX,
  FiArrowUpRight,
  FiArrowLeft,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertTriangle,
  FiZap,
  FiTrendingUp,
  FiUser,
} from 'react-icons/fi';
import api from '../utils/api.js';
import { useDispatch, useSelector } from 'react-redux';
import { setResume } from '../redux/resumeSlice.js';
import { setUser } from '../redux/authSlice.js';
import { useCoin } from '../apis/user.api.js';

const MAX_SIZE_MB = 20;

const ratingLabel = (score) => {
  if (score >= 85) return 'Strong';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Average';
  return 'Needs Work';
};

/* ============================================================
   FONTS — mono for data, matching the report identity
============================================================ */
const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap');
    .font-mono-r { font-family: 'IBM Plex Mono', 'SF Mono', monospace; }
  `}</style>
);

const ScoreRing = ({ score }) => {
  const r = 50;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score || 0));
  return (
    <div className="relative w-[124px] h-[124px] shrink-0">
      <svg width="124" height="124" viewBox="0 0 124 124" className="-rotate-90">
        <circle cx="62" cy="62" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <motion.circle
          cx="62"
          cy="62"
          r={r}
          fill="none"
          stroke="#F5A524"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (pct / 100) * c }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.15 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono-r text-3xl font-medium text-white tabular-nums">{pct}</span>
        <span className="font-mono-r text-[10px] tracking-[0.2em] text-white/30 uppercase mt-1">
          / 100
        </span>
      </div>
    </div>
  );
};

/* ---- ledger row, used for strengths / weaknesses ---- */
const LedgerRow = ({ icon: Icon, iconClass, children }) => (
  <div className="flex gap-3 py-3 border-b border-white/[0.06] last:border-0">
    <Icon size={15} className={`mt-0.5 shrink-0 ${iconClass}`} />
    <p className="text-[14px] text-white/70 leading-6">{children}</p>
  </div>
);

/* ---- outlined keyword chip, used for missing skills ---- */
const SkillChip = ({ children }) => (
  <span className="text-xs font-medium px-3 py-1.5 rounded-full border border-red-500/25 text-red-400/90">
    {children}
  </span>
);

const SectionCard = ({ icon: Icon, iconClass, iconBg, title, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="bg-[#161615] rounded-2xl p-6 shadow-lg shadow-black/10"
  >
    <div className="flex items-center gap-2.5 mb-4">
      <span className={`w-7 h-7 rounded-full flex items-center justify-center ${iconBg}`}>
        <Icon size={14} className={iconClass} />
      </span>
      <h3 className="font-serif text-base font-bold text-white">{title}</h3>
    </div>
    {children}
  </motion.div>
);

const HowItWorksStep = ({ n, title, description }) => (
  <div className="flex gap-4">
    <span className="font-mono-r text-xs text-white/25 mt-0.5 shrink-0">{n}</span>
    <div>
      <p className="text-sm text-white font-medium">{title}</p>
      <p className="text-xs text-white/35 mt-0.5">{description}</p>
    </div>
  </div>
);

const Scorer = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const resume = useSelector((state) => state.resume.resume);
  const user = useSelector((state) => state.auth.user);

  const validateAndSetFile = (selected) => {
    if (!selected) return;
    if (selected.type !== 'application/pdf') return setError('Only PDF files are supported.');
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) return setError(`File must be under ${MAX_SIZE_MB}MB.`);
    setError('');
    setFile(selected);
  };

  const handleContinue = async () => {
    if (!file) return alert('Please upload a file before continuing.');
    try {
      setLoading(true);
      setError('');

      const formdata = new FormData();
      formdata.append('resume', file);
      const response = await api('/api/resume/upload', { method: 'POST', body: formdata });
      const data = await response.json();
      if (!response.ok || !data?.success) {
        setError(data?.message || 'Something went wrong while analyzing your resume.');
        return;
      }

      const coinResponse = await useCoin({ coins: 5, action: 'resume-scorer' });
      if (!coinResponse?.success) {
        setError(coinResponse?.message || 'Something went wrong while deducting coins.');
        return;
      }

      dispatch(
        setUser({
          ...user,
          interviewCoin: coinResponse.interviewCoin,
        })
      );

      dispatch(setResume(data?.data));
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
    };

  const handleReupload = () => {
    dispatch(setResume(null));
    setFile(null);
    setError('');
  };

  return (
    <div className="bg-[#0E1013] min-h-screen">
      <FontImport />

      <motion.nav
        className="fixed top-0 left-0 right-0 w-full bg-[#0E1013]/90 backdrop-blur-xl border-b border-white/[0.06] h-[64px] z-50 flex items-center px-6"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <GiArtificialHive size={24} className="text-white" />
            <span className="font-serif font-bold text-lg text-white">
              CM<span className="text-white/40">.AI</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            {resume && (
              <button
                onClick={handleReupload}
                className="text-xs font-medium bg-white/5 text-white/60 hover:text-white px-3 py-1.5 rounded-full transition-colors"
              >
                Re-upload
              </button>
            )}
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
            >
              <FiArrowLeft size={14} /> Back
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence mode="wait">
        {!resume ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-[64px] min-h-screen flex items-center justify-center px-6"
          >
            <div className="w-full max-w-md">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#161615] rounded-3xl p-8 shadow-xl"
              >
                <span className="font-mono-r text-[11px] tracking-[0.2em] text-[#F5A524] uppercase">
                  Resume Scorer
                </span>
                <h2 className="font-serif text-3xl font-bold text-white mt-2 mb-2">
                  Upload Your Resume
                </h2>
                <p className="text-white/40 mb-8">We'll score it and give you actionable feedback.</p>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    validateAndSetFile(e.dataTransfer.files?.[0]);
                  }}
                  onClick={() => inputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center text-center cursor-pointer transition-colors ${
                    dragActive ? 'border-[#F5A524]/60 bg-[#F5A524]/5' : 'border-white/15 hover:border-white/30'
                  }`}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => validateAndSetFile(e.target.files?.[0])}
                    className="hidden"
                  />
                  {!file ? (
                    <>
                      <FiUploadCloud className="text-white mb-4" size={26} />
                      <p className="text-white font-medium">
                        Drop your resume, or <span className="underline">browse</span>
                      </p>
                      <p className="font-mono-r text-[11px] text-white/30 mt-2 tracking-wide">
                        PDF ONLY &middot; MAX {MAX_SIZE_MB}MB
                      </p>
                    </>
                  ) : (
                    <>
                      <FiFile className="text-white mb-4" size={22} />
                      <p className="text-white font-semibold break-all">{file.name}</p>
                      <p className="font-mono-r text-[11px] text-white/25 mt-1">
                        {(file.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white"
                      >
                        <FiX size={13} /> Remove
                      </button>
                    </>
                  )}
                </div>

                {error && <p className="text-red-400 text-xs mt-3 text-center">{error}</p>}

                <button
                  onClick={handleContinue}
                  disabled={!file || loading}
                  className={`w-full mt-8 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-medium text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5A524] ${
                    file && !loading
                      ? 'bg-white text-black hover:bg-white/90'
                      : 'bg-white/10 text-white/30 cursor-not-allowed'
                  }`}
                >
                  {loading ? 'Analyzing…' : 'Analyze Resume'}
                  <FiArrowUpRight size={15} />
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-5 bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4"
              >
                <HowItWorksStep
                  n="01"
                  title="Upload your PDF"
                  description="Any resume format — we read it directly."
                />
                <HowItWorksStep
                  n="02"
                  title="AI reads it like a recruiter would"
                  description="Scored on clarity, structure, and impact."
                />
                <HowItWorksStep
                  n="03"
                  title="Get a fix-it list"
                  description="Strengths, gaps, and concrete next steps."
                />
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-[100px] px-6 pb-16 max-w-4xl mx-auto space-y-6"
          >
            {/* ===== HERO ===== */}
            <div>
              <span className="font-mono-r text-[11px] tracking-[0.22em] uppercase text-white/30">
                Resume Analysis
              </span>
              <h1 className="font-serif text-3xl font-bold text-white mt-1">
                {resume.name || 'Your Resume'}
              </h1>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#161615] rounded-2xl p-6 md:p-7 flex flex-col sm:flex-row sm:items-center gap-6 shadow-lg shadow-black/10"
            >
              <ScoreRing score={resume.score} />
              <div className="flex-1">
                <p className="font-mono-r text-[11px] tracking-[0.2em] text-white/30 uppercase mb-1.5">
                  Overall Rating
                </p>
                <p className="font-serif text-2xl font-bold text-white mb-3">
                  {ratingLabel(resume.score)}
                </p>
                {resume.suggestedRole && (
                  <p className="inline-flex items-center gap-1.5 text-sm text-white/50 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                    <FiUser size={13} /> Best fit: {resume.suggestedRole}
                  </p>
                )}
              </div>
            </motion.div>

            {/* ===== STRENGTHS / WEAKNESSES ===== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {resume.strengths?.length > 0 && (
                <SectionCard
                  icon={FiCheckCircle}
                  iconClass="text-green-400"
                  iconBg="bg-green-500/10"
                  title="Strengths"
                >
                  <div>
                    {resume.strengths.map((s, i) => (
                      <LedgerRow key={i} icon={FiCheckCircle} iconClass="text-green-400">
                        {s}
                      </LedgerRow>
                    ))}
                  </div>
                </SectionCard>
              )}
              {resume.weaknesses?.length > 0 && (
                <SectionCard
                  icon={FiAlertTriangle}
                  iconClass="text-amber-400"
                  iconBg="bg-amber-500/10"
                  title="Areas to Improve"
                >
                  <div>
                    {resume.weaknesses.map((w, i) => (
                      <LedgerRow key={i} icon={FiAlertTriangle} iconClass="text-amber-400">
                        {w}
                      </LedgerRow>
                    ))}
                  </div>
                </SectionCard>
              )}
            </div>

            {/* ===== MISSING SKILLS ===== */}
            {resume.missingSkills?.length > 0 && (
              <SectionCard
                icon={FiZap}
                iconClass="text-red-400"
                iconBg="bg-red-500/10"
                title="Missing Skills"
              >
                <div className="flex flex-wrap gap-2">
                  {resume.missingSkills.map((s, i) => (
                    <SkillChip key={i}>{s}</SkillChip>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* ===== RECOMMENDATIONS ===== */}
            {resume.recommendations?.length > 0 && (
              <SectionCard
                icon={FiTrendingUp}
                iconClass="text-[#F5A524]"
                iconBg="bg-[#F5A524]/10"
                title="Recommendations"
              >
                <div className="space-y-1">
                  {resume.recommendations.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 py-3 border-b border-white/[0.06] last:border-0"
                    >
                      <span className="font-mono-r text-[11px] text-[#161615] bg-[#F5A524] w-5 h-5 rounded-full flex items-center justify-center font-semibold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-[14px] text-white/70 leading-6">{r}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            <div className="flex justify-center pt-4">
              <button
                onClick={handleReupload}
                className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-black/85 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5A524]"
              >
                <FiRefreshCw size={14} /> Analyze another resume
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Scorer;