import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { GiArtificialHive } from 'react-icons/gi';
import {
  FiArrowLeft,
  FiArrowUpRight,
  FiMap,
  FiPlus,
  FiClock,
  FiFileText,
  FiTrendingUp,
  FiTarget,
  FiLayers,
  FiRefreshCw,
  FiX,
  FiCheckSquare,
  FiSquare,
  FiSearch,
  FiCheck,
  FiCircle,
  FiList,
  FiAlertTriangle,
} from 'react-icons/fi';
import { FaYoutube } from 'react-icons/fa';
import { generateRoadmap, getAllRoadmaps, getRoadmapById } from '../apis/roadmap.api.js';

/* ============================================================
   FONTS — same identity as the Scorer page
============================================================ */
const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap');
    .font-mono-r { font-family: 'IBM Plex Mono', 'SF Mono', monospace; }
  `}</style>
);

const LEVEL_FILTERS = ['all', 'Beginner', 'Intermediate', 'Advanced'];

const difficultyStyles = {
  Easy: 'border-green-500/25 text-green-400/90 bg-green-500/5',
  Medium: 'border-amber-500/25 text-amber-400/90 bg-amber-500/5',
  Hard: 'border-red-500/25 text-red-400/90 bg-red-500/5',
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.05 },
  }),
};

const formatDate = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
};

const progressKey = (id) => `roadmap-progress:${id}`;

const loadProgress = (id) => {
  if (!id) return new Set();
  try {
    const raw = localStorage.getItem(progressKey(id));
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
};

const saveProgress = (id, set) => {
  if (!id) return;
  try {
    localStorage.setItem(progressKey(id), JSON.stringify(Array.from(set)));
  } catch {
    // storage unavailable — fail silently, progress just won't persist
  }
};

/* ============================================================
   Normalize a roadmap item coming from getAllRoadmaps.
   The API returns: { _id, targetPackage, roadmap: { title, level,
   duration, modules }, createdAt, ... }
   We flatten the `roadmap` object onto the top level so the rest
   of the component can read roadmap.title / roadmap.level directly.
============================================================ */
const normalizeRoadmap = (item) => {
  const nested = item?.roadmap || {};
  return {
    ...item,
    title: item.title || nested.title || 'Untitled roadmap',
    level: item.level || nested.level || '—',
    duration: item.duration || nested.duration || '',
    targetPackage: item.targetPackage || nested.targetPackage || '',
    modules: item.modules || nested.modules || [],
    // keep the original nested roadmap in case anything needs it
    roadmap: item.roadmap,
  };
};

const HowItWorksStep = ({ n, title, description }) => (
  <div className="flex gap-4">
    <span className="font-mono-r text-xs text-white/25 mt-0.5 shrink-0">{n}</span>
    <div>
      <p className="text-sm text-white font-medium">{title}</p>
      <p className="text-xs text-white/35 mt-0.5">{description}</p>
    </div>
  </div>
);

/* ---- one entry in the history sidebar ---- */
const HistoryItem = ({ roadmap, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left rounded-xl px-4 py-3 mb-2 transition-colors border ${
      active
        ? 'bg-[#F5A524]/10 border-[#F5A524]/30'
        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/10'
    }`}
  >
    <p className="text-sm font-medium text-white truncate">{roadmap.title || 'Untitled roadmap'}</p>
    <div className="flex items-center gap-2 mt-1.5">
      <span className="font-mono-r text-[10px] tracking-wide text-white/35 uppercase">
        {roadmap.level || '—'}
      </span>
      <span className="text-white/15">&middot;</span>
      <span className="text-[11px] text-white/35 truncate">{roadmap.targetPackage}</span>
    </div>
    {roadmap.createdAt && (
      <p className="font-mono-r text-[10px] text-white/20 mt-1.5">{formatDate(roadmap.createdAt)}</p>
    )}
  </button>
);

/* ---- one learning module in the generated roadmap ---- */
const ModuleCard = ({ module, index, done, onToggle }) => {
  const isPlaylist = module.youtube?.includes('/playlist');

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className={`bg-[#161615] rounded-2xl p-5 md:p-6 shadow-lg shadow-black/10 border transition-colors ${
        done ? 'border-green-500/20' : 'border-transparent'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <button
            onClick={onToggle}
            className="mt-0.5 shrink-0 text-white/25 hover:text-[#F5A524] transition-colors"
            title={done ? 'Mark as not done' : 'Mark as done'}
          >
            {done ? <FiCheck size={18} className="text-green-400" /> : <FiCircle size={18} />}
          </button>
          <div className="min-w-0">
            <h3 className={`font-serif text-base md:text-lg font-bold ${done ? 'text-white/50 line-through' : 'text-white'}`}>
              {module.title}
            </h3>
            <p className="text-sm text-white/50 mt-1.5 leading-6 max-w-2xl">{module.description}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {module.difficulty && (
            <span
              className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${
                difficultyStyles[module.difficulty] || 'border-white/15 text-white/50'
              }`}
            >
              {module.difficulty}
            </span>
          )}
          {module.duration && (
            <span className="font-mono-r text-[10px] text-white/30">{module.duration}</span>
          )}
        </div>
      </div>

      {(module.article || module.youtube) && (
        <div className="flex flex-wrap gap-2 mt-4 pl-10">
          {module.article && (
            <a
              href={module.article}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1.5 transition-colors"
            >
              <FiFileText size={12} /> Docs
            </a>
          )}
          {module.youtube && (
            <a
              href={module.youtube}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1.5 transition-colors"
            >
              {isPlaylist ? (
                <>
                  <FiList size={12} className="text-red-500" /> Playlist
                </>
              ) : (
                <>
                  <FaYoutube size={12} className="text-red-500" /> Watch
                </>
              )}
            </a>
          )}
        </div>
      )}
    </motion.div>
  );
};

const Roadmap = () => {
  const navigate = useNavigate();
  const resume = useSelector((state) => state.resume.resume);

  const [roadmaps, setRoadmaps] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

  const [view, setView] = useState('form'); // 'form' | 'detail'
  const [selected, setSelected] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [completed, setCompleted] = useState(new Set());

  const [role, setRole] = useState('');
  const [targetPackage, setTargetPackage] = useState('');
  const [useResume, setUseResume] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [formError, setFormError] = useState('');
  const [needsResume, setNeedsResume] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    setCompleted(loadProgress(selected?._id));
  }, [selected?._id]);

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      setHistoryError('');
      const response = await getAllRoadmaps();
      if (!response?.success) {
        setHistoryError(response?.error || 'Could not load your roadmaps.');
        setRoadmaps([]);
        return;
      }

      const list = response?.data || (Array.isArray(response) ? response : []);

      // Flatten the nested `roadmap` object onto each item, and drop
      // entries that have no roadmap content at all (incomplete generations).
      const normalized = (Array.isArray(list) ? list : [])
        .filter((item) => item && (item.roadmap || item.title || item.modules))
        .map(normalizeRoadmap);

      setRoadmaps(normalized);
    } catch (err) {
      console.error('Error fetching roadmap history:', err);
      setHistoryError('Could not load your roadmaps. Check your connection and try again.');
      setRoadmaps([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSelectRoadmap = async (id) => {
    setHistoryOpen(false);
    if (id === selectedId && view === 'detail') return;
    try {
      setDetailError('');
      setSelectedId(id);
      setView('detail');
      setDetailLoading(true);
      const response = await getRoadmapById(id);
      if (!response?.success) {
        setDetailError(response?.error || response?.message || 'Could not load that roadmap.');
        setSelected(null);
        return;
      }

      // getRoadmapById may return the roadmap directly OR nested under `roadmap`.
      // Normalize so `selected` always has title/level/modules at the top level.
      const raw = response.data;
      const flat = raw?.roadmap
        ? normalizeRoadmap({ ...raw, ...raw.roadmap })
        : raw;

      setSelected(flat);
    } catch (err) {
      console.error('Error fetching roadmap:', err);
      setDetailError('Could not load that roadmap. Please try again.');
      setSelected(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleNewRoadmap = () => {
    setHistoryOpen(false);
    setSelected(null);
    setSelectedId(null);
    setDetailError('');
    setFormError('');
    setNeedsResume(false);
    setView('form');
  };

  const toggleModuleComplete = (index) => {
    if (!selected?._id) return;
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      saveProgress(selected._id, next);
      return next;
    });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!role.trim() || !targetPackage.trim()) {
      setFormError('Please enter both a target role and target package.');
      return;
    }

    if (useResume && !resume) {
      setNeedsResume(true);
      return;
    }

    try {
      setGenerating(true);
      setFormError('');
      setNeedsResume(false);

      const payload = {
        role: role.trim(),
        targetPackage: targetPackage.trim(),
        useResume,
        ...(useResume && { resume }), // only attach resume when the tick is on
      };

      const response = await generateRoadmap(payload);
      if (!response?.success) {
        const message = response?.message || response?.error || 'Something went wrong while generating your roadmap.';
        if (/no scored resume/i.test(message)) {
          setNeedsResume(true);
        } else {
          setFormError(message);
        }
        return;
      }

      // Response shape may be { data: { roadmap: {...}, _id, ... } } or flat.
      // Normalize so the sidebar + detail view both work.
      const raw = response.data;
      const newRoadmap = raw?.roadmap ? normalizeRoadmap(raw) : raw;

      setRoadmaps((prev) => [newRoadmap, ...prev]);
      setSelected(newRoadmap);
      setSelectedId(newRoadmap._id);
      setView('detail');
      setRole('');
      setTargetPackage('');
    } catch (err) {
      console.error('Error generating roadmap:', err);
      setFormError('Something went wrong. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const filteredRoadmaps = useMemo(() => {
    return roadmaps.filter((r) => {
      const matchesLevel = levelFilter === 'all' || r.level === levelFilter;
      const matchesSearch =
        !search.trim() ||
        (r.title || '').toLowerCase().includes(search.trim().toLowerCase()) ||
        (r.targetPackage || '').toLowerCase().includes(search.trim().toLowerCase());
      return matchesLevel && matchesSearch;
    });
  }, [roadmaps, search, levelFilter]);

  const progressPct = selected?.modules?.length
    ? Math.round((completed.size / selected.modules.length) * 100)
    : 0;

  const SidebarContent = (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-mono-r text-[11px] tracking-[0.2em] uppercase text-white/30">
          Your Roadmaps
        </h2>
        <button
          onClick={fetchHistory}
          className="text-white/30 hover:text-white transition-colors"
          title="Refresh"
        >
          <FiRefreshCw size={13} className={historyLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      <button
        onClick={handleNewRoadmap}
        className="w-full inline-flex items-center justify-center gap-2 bg-white text-black px-4 py-2.5 rounded-full text-sm font-medium hover:bg-white/90 transition-colors mb-4"
      >
        <FiPlus size={14} /> New Roadmap
      </button>

      {roadmaps.length > 0 && (
        <>
          <div className="relative mb-3">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" size={13} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roadmaps"
              className="w-full bg-white/[0.04] border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder:text-white/25 outline-none focus:border-white/25 transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {LEVEL_FILTERS.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={`text-[10px] font-medium px-2.5 py-1 rounded-full border transition-colors ${
                  levelFilter === lvl
                    ? 'bg-white text-black border-white'
                    : 'text-white/40 border-white/10 hover:text-white hover:border-white/20'
                }`}
              >
                {lvl === 'all' ? 'All' : lvl}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="overflow-y-auto flex-1 pr-1 -mr-1">
        {historyLoading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[70px] rounded-xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : historyError ? (
          <div className="text-center py-8 px-2">
            <FiAlertTriangle className="mx-auto text-red-400/60 mb-3" size={20} />
            <p className="text-xs text-red-400/80 mb-3">{historyError}</p>
            <button
              onClick={fetchHistory}
              className="text-xs font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors"
            >
              Try again
            </button>
          </div>
        ) : roadmaps.length === 0 ? (
          <div className="text-center py-10 px-2">
            <FiMap className="mx-auto text-white/15 mb-3" size={22} />
            <p className="text-sm text-white/40">No roadmaps yet</p>
            <p className="text-xs text-white/25 mt-1">Generate one to see it here.</p>
          </div>
        ) : filteredRoadmaps.length === 0 ? (
          <div className="text-center py-10 px-2">
            <p className="text-sm text-white/40">No matches</p>
            <p className="text-xs text-white/25 mt-1">Try a different search or filter.</p>
          </div>
        ) : (
          filteredRoadmaps.map((r) => (
            <HistoryItem
              key={r._id}
              roadmap={r}
              active={r._id === selectedId}
              onClick={() => handleSelectRoadmap(r._id)}
            />
          ))
        )}
      </div>

      {roadmaps.length > 0 && (
        <p className="font-mono-r text-[10px] text-white/20 pt-3 border-t border-white/[0.06] mt-3">
          {roadmaps.length} roadmap{roadmaps.length === 1 ? '' : 's'} total
        </p>
      )}
    </>
  );

  return (
    <div className="bg-[#0E1013] min-h-screen">
      <FontImport />

      {/* ===== NAVBAR ===== */}
      <motion.nav
        className="fixed top-0 left-0 right-0 w-full bg-[#0E1013]/90 backdrop-blur-xl border-b border-white/[0.06] h-[64px] z-50 flex items-center px-6"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <GiArtificialHive size={24} className="text-white" />
            <span className="font-serif font-bold text-lg text-white">
              CM<span className="text-white/40">.AI</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setHistoryOpen(true)}
              className="lg:hidden inline-flex items-center gap-1.5 text-xs font-medium bg-white/5 text-white/60 hover:text-white px-3 py-1.5 rounded-full transition-colors"
            >
              <FiClock size={13} /> History
            </button>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
            >
              <FiArrowLeft size={14} /> Back
            </button>
          </div>
        </div>
      </motion.nav>

      <div className="pt-[64px] flex max-w-6xl mx-auto">
        {/* ===== DESKTOP HISTORY SIDEBAR ===== */}
        <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r border-white/[0.06] h-[calc(100vh-64px)] sticky top-[64px] px-5 py-6">
          {SidebarContent}
        </aside>

        {/* ===== MOBILE HISTORY DRAWER ===== */}
        <AnimatePresence>
          {historyOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setHistoryOpen(false)}
                className="fixed inset-0 bg-black/60 z-[60] lg:hidden"
              />
              <motion.aside
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="fixed top-0 left-0 bottom-0 w-72 bg-[#0E1013] border-r border-white/[0.06] z-[70] px-5 py-6 flex flex-col lg:hidden"
              >
                <div className="flex justify-end mb-2">
                  <button onClick={() => setHistoryOpen(false)} className="text-white/40 hover:text-white">
                    <FiX size={18} />
                  </button>
                </div>
                {SidebarContent}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ===== MAIN CONTENT ===== */}
        <main className="flex-1 px-6 lg:px-10 pt-8 pb-16 min-w-0">
          <AnimatePresence mode="wait">
            {view === 'form' ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-lg mx-auto lg:mx-0"
              >
                <span className="font-mono-r text-[11px] tracking-[0.2em] text-[#F5A524] uppercase">
                  Roadmap Builder
                </span>
                <h1 className="font-serif text-3xl font-bold text-white mt-2 mb-2">
                  Plan Your Path
                </h1>
                <p className="text-white/40 mb-8">
                  Tell us the role and package you're aiming for — we'll build a step-by-step learning path.
                </p>

                <form
                  onSubmit={handleGenerate}
                  className="bg-[#161615] rounded-3xl p-8 shadow-xl space-y-5"
                >
                  <div>
                    <label className="text-xs font-medium text-white/40 mb-2 block">
                      Target Role
                    </label>
                    <div className="relative">
                      <FiTarget className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" size={15} />
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="e.g. Backend Engineer"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#F5A524]/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-white/40 mb-2 block">
                      Target Package
                    </label>
                    <div className="relative">
                      <FiTrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" size={15} />
                      <input
                        type="text"
                        value={targetPackage}
                        onChange={(e) => setTargetPackage(e.target.value)}
                        placeholder="e.g. 25 LPA"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#F5A524]/50 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setUseResume((v) => !v)}
                    className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                      useResume ? 'border-[#F5A524]/40 bg-[#F5A524]/5' : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    {useResume ? (
                      <FiCheckSquare className="text-[#F5A524] shrink-0" size={16} />
                    ) : (
                      <FiSquare className="text-white/30 shrink-0" size={16} />
                    )}
                    <div>
                      <p className="text-sm text-white font-medium">Use my resume insights</p>
                      <p className="text-xs text-white/35 mt-0.5">
                        {resume
                          ? 'Skip what you already know, focus on your gaps.'
                          : "We'll use your latest scored resume — score one first if you haven't."}
                      </p>
                    </div>
                  </button>

                  {needsResume && (
                    <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3">
                      <p className="text-sm text-amber-400/90">No scored resume found yet.</p>
                      <button
                        type="button"
                        onClick={() => navigate('/scorer')}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-white mt-2 hover:underline"
                      >
                        Score a resume first <FiArrowUpRight size={12} />
                      </button>
                    </div>
                  )}

                  {formError && <p className="text-red-400 text-xs">{formError}</p>}

                  <button
                    type="submit"
                    disabled={generating}
                    className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-medium text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5A524] ${
                      !generating
                        ? 'bg-white text-black hover:bg-white/90'
                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    {generating ? 'Building your roadmap…' : 'Generate Roadmap'}
                    <FiArrowUpRight size={15} />
                  </button>
                </form>

                <div className="mt-5 bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                  <HowItWorksStep
                    n="01"
                    title="Tell us your goal"
                    description="Target role, target package, and your resume if you have one."
                  />
                  <HowItWorksStep
                    n="02"
                    title="AI builds your path"
                    description="Ordered modules scoped to what you're missing, not what you know."
                  />
                  <HowItWorksStep
                    n="03"
                    title="Learn with curated resources"
                    description="Each module ships with official docs and a matching video or playlist."
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="detail"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-3xl"
              >
                {detailLoading ? (
                  <div className="space-y-4">
                    <div className="h-8 w-2/3 rounded-lg bg-white/[0.04] animate-pulse" />
                    <div className="h-24 rounded-2xl bg-white/[0.04] animate-pulse" />
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-28 rounded-2xl bg-white/[0.04] animate-pulse" />
                    ))}
                  </div>
                ) : detailError ? (
                  <div className="bg-[#161615] rounded-2xl p-8 text-center">
                    <FiAlertTriangle className="mx-auto text-red-400/70 mb-3" size={22} />
                    <p className="text-red-400 text-sm mb-4">{detailError}</p>
                    <button
                      onClick={() => handleSelectRoadmap(selectedId)}
                      className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
                    >
                      <FiRefreshCw size={13} /> Try again
                    </button>
                  </div>
                ) : selected ? (
                  <>
                    <span className="font-mono-r text-[11px] tracking-[0.22em] uppercase text-white/30">
                      Roadmap
                    </span>
                    <h1 className="font-serif text-3xl font-bold text-white mt-1 mb-4">
                      {selected.title}
                    </h1>

                    <div className="flex flex-wrap gap-2 mb-5">
                      <span className="inline-flex items-center gap-1.5 text-sm text-white/60 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                        <FiLayers size={13} /> {selected.level}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm text-white/60 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                        <FiClock size={13} /> {selected.duration}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm text-white/60 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                        <FiTrendingUp size={13} /> {selected.targetPackage}
                      </span>
                    </div>

                    {selected.modules?.length > 0 && (
                      <div className="bg-[#161615] rounded-2xl p-5 mb-6 flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-white/40">Your progress</p>
                            <p className="font-mono-r text-xs text-white/40">
                              {completed.size}/{selected.modules.length}
                            </p>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                            <motion.div
                              className="h-full bg-[#F5A524] rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPct}%` }}
                              transition={{ duration: 0.4 }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {selected.modules?.map((module, i) => (
                        <ModuleCard
                          key={i}
                          module={module}
                          index={i}
                          done={completed.has(i)}
                          onToggle={() => toggleModuleComplete(i)}
                        />
                      ))}
                    </div>
                  </>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Roadmap;