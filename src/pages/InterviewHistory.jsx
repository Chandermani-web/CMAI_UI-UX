import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiClock,
  FiCheckCircle,
  FiPlayCircle,
  FiChevronRight,
  FiRefreshCw,
  FiFileText,
  FiSearch,
  FiFilter,
  FiX,
} from "react-icons/fi";
import { getAllInterviews } from "../apis/interview.api.js";

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "completed", label: "Completed" },
  { value: "in-progress", label: "In Progress" },
];

const InterviewHistory = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchInterviews = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const result = await getAllInterviews();
      const list =
        result?.interviews || result?.data || (Array.isArray(result) ? result : []);
      setInterviews(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Error fetching interview history:", err);
      setError("Unable to load interview history.");
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const openInterview = (interview) => {
    if (interview.status === "completed" || interview.status === "in-progress") {
      navigate(`/interview/${interview._id}`);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Unknown date";
    try {
      return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Unknown date";
    }
  };

  const getStatusStyle = (status) => {
    if (status === "completed") return "bg-green-500/10 text-green-400 border-green-500/20";
    if (status === "in-progress") return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    return "bg-white/5 text-white/50 border-white/10";
  };

  const getStatusIcon = (status) => {
    if (status === "completed") return <FiCheckCircle size={14} />;
    if (status === "in-progress") return <FiPlayCircle size={14} />;
    return <FiClock size={14} />;
  };

  const typeOptions = useMemo(() => {
    const types = new Set(interviews.map((item) => (item.type || "Technical").trim()));
    return ["all", ...Array.from(types)];
  }, [interviews]);

  const filteredInterviews = useMemo(() => {
    return interviews.filter((item) => {
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesType = typeFilter === "all" || (item.type || "Technical").trim() === typeFilter;
      const matchesSearch =
        !search.trim() ||
        (item.role || "Technical Interview").toLowerCase().includes(search.trim().toLowerCase());
      return matchesStatus && matchesType && matchesSearch;
    });
  }, [interviews, statusFilter, typeFilter, search]);

  const hasActiveFilters = statusFilter !== "all" || typeFilter !== "all" || Boolean(search.trim());

  const resetFilters = () => {
    setStatusFilter("all");
    setTypeFilter("all");
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-[#0E1013]">
      <header className="bg-[#0E1013] border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-6">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-white/50 hover:text-white transition mb-6"
          >
            <FiArrowLeft size={18} />
            Back to Dashboard
          </button>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white text-black flex items-center justify-center">
                  <FiFileText size={22} />
                </div>
                <div>
                  <h1 className="font-serif text-3xl md:text-4xl font-bold text-white">Interview History</h1>
                  <p className="text-white/50 mt-1">View all your completed and in-progress interviews</p>
                </div>
              </div>
            </div>
            <button
              onClick={fetchInterviews}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-black hover:bg-white/90 transition disabled:opacity-50"
            >
              <FiRefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 md:px-8 py-8">
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#161615] rounded-2xl p-5 border border-white/[0.06]">
              <p className="text-sm text-white/50">Total Interviews</p>
              <p className="font-serif text-3xl font-bold text-white mt-2">{interviews.length}</p>
            </div>
            <div className="bg-[#161615] rounded-2xl p-5 border border-white/[0.06]">
              <p className="text-sm text-white/50">Completed</p>
              <p className="font-serif text-3xl font-bold text-white mt-2">
                {interviews.filter((item) => item.status === "completed").length}
              </p>
            </div>
            <div className="bg-[#161615] rounded-2xl p-5 border border-white/[0.06]">
              <p className="text-sm text-white/50">In Progress</p>
              <p className="font-serif text-3xl font-bold text-white mt-2">
                {interviews.filter((item) => item.status === "in-progress").length}
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-white/10 border-t-white rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/50">Loading interview history...</p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="bg-[#161615] rounded-2xl border border-red-500/20 p-8 text-center">
            <p className="text-red-400 mb-5">{error}</p>
            <button onClick={fetchInterviews} className="bg-white text-black px-5 py-3 rounded-xl hover:bg-white/90 transition">
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && interviews.length === 0 && (
          <div className="bg-[#161615] rounded-2xl border border-white/[0.06] p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-5">
              <FiFileText size={26} className="text-white/50" />
            </div>
            <h2 className="font-serif text-xl font-semibold text-white">No interviews yet</h2>
            <p className="text-white/50 mt-2 mb-6">Create your first interview to see it here.</p>
            <button onClick={() => navigate("/interview")} className="bg-white text-black px-6 py-3 rounded-xl hover:bg-white/90 transition">
              Create Interview
            </button>
          </div>
        )}

        {!loading && !error && interviews.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 items-start">
            <aside className="lg:sticky lg:top-6 bg-[#161615] rounded-2xl border border-white/[0.06] p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <FiFilter size={15} className="text-white/40" />
                  <h3 className="text-sm font-semibold text-white">Filters</h3>
                </div>
                {hasActiveFilters && (
                  <button onClick={resetFilters} className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-white transition">
                    <FiX size={12} /> Clear
                  </button>
                )}
              </div>
              <div className="mb-6">
                <label className="block text-xs font-medium text-white/40 uppercase tracking-wide mb-2">Search role</label>
                <div className="relative">
                  <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="e.g. Backend"
                    className="w-full h-10 rounded-lg bg-white/5 border border-white/10 pl-9 pr-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30 transition"
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-xs font-medium text-white/40 uppercase tracking-wide mb-2">Status</label>
                <div className="space-y-1">
                  {STATUS_FILTERS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setStatusFilter(opt.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                        statusFilter === opt.value ? "bg-white text-black font-medium" : "text-white/60 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/40 uppercase tracking-wide mb-2">Type</label>
                <div className="space-y-1">
                  {typeOptions.map((type) => (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize transition ${
                        typeFilter === type ? "bg-white text-black font-medium" : "text-white/60 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {type === "all" ? "All types" : type}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            <div>
              {filteredInterviews.length === 0 ? (
                <div className="bg-[#161615] rounded-2xl border border-white/[0.06] p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-5">
                    <FiFilter size={26} className="text-white/50" />
                  </div>
                  <h2 className="font-serif text-xl font-semibold text-white">No matching interviews</h2>
                  <p className="text-white/50 mt-2 mb-6">Try adjusting or clearing your filters.</p>
                  <button onClick={resetFilters} className="bg-white text-black px-6 py-3 rounded-xl hover:bg-white/90 transition">
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredInterviews.map((interview) => (
                    <button
                      key={interview._id}
                      onClick={() => openInterview(interview)}
                      className="w-full bg-[#161615] rounded-2xl border border-white/[0.06] p-5 md:p-6 text-left hover:border-white/20 hover:shadow-lg hover:shadow-black/30 transition group"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center flex-shrink-0">
                          {interview.status === "completed" ? <FiCheckCircle size={21} /> : <FiPlayCircle size={21} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="font-serif text-lg font-semibold text-white">{interview.role || "Technical Interview"}</h2>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium capitalize ${getStatusStyle(interview.status)}`}>
                              {getStatusIcon(interview.status)}
                              {interview.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-2 text-sm text-white/50">
                            <span className="capitalize">{interview.type || "Technical"}</span>
                            <span>{interview.questions?.length || 0} Questions</span>
                            <span>{formatDate(interview.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end gap-6">
                          <div className="text-right">
                            <p className="text-xs text-white/40 uppercase tracking-wide">Score</p>
                            <p className="font-serif text-2xl font-bold text-white">
                              {interview.overallScore ?? 0}
                              <span className="text-sm text-white/40 font-sans">/100</span>
                            </p>
                          </div>
                          <FiChevronRight size={22} className="text-white/30 group-hover:text-white group-hover:translate-x-1 transition" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InterviewHistory;