import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { GiArtificialHive } from "react-icons/gi";
import {
  FiFileText,
  FiMap,
  FiFilter,
  FiMail,
  FiMenu,
  FiX,
  FiPlus,
  FiClock,
  FiCheckCircle,
  FiPlayCircle,
  FiChevronRight,
  FiLogOut,
  FiList,
  FiCreditCard,
} from "react-icons/fi";
import api from "../../utils/api.js";
import { useDispatch, useSelector } from "react-redux";
import { setAuth, setUser } from "../../redux/authSlice.js";
import { getAllInterviews } from "../../apis/interview.api.js";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [interviews, setInterviews] = useState([]);
  const [interviewsLoading, setInterviewsLoading] = useState(false);

  const agentItems = [
    { icon: FiMap, label: "Roadmap Builder", link: "/roadmap" },
    { icon: FiFileText, label: "Resume Builder", link: "/resume-builder" },
    { icon: FiFilter, label: "Resume Scorer", link: "/scorer" },
    { icon: FiCreditCard, label: "Interview Credits", link: "/billing" },
  ];

  const goTo = (link) => {
    navigate(link);
    if (window.innerWidth < 768) toggleSidebar();
  };

  const isActive = (link) => location.pathname === link;

  const fetchAllInterview = async () => {
    try {
      setInterviewsLoading(true);
      const result = await getAllInterviews();
      setInterviews(result?.interviews || []);
    } catch (error) {
      console.error("Error fetching interviews:", error);
    } finally {
      setInterviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllInterview();
  }, []);

  const openInterview = (interview) => {
    if (interview.status !== "completed" && interview.status !== "in-progress") return;
    goTo(`/interview/${interview._id}`);
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  };

  const handleLogout = async () => {
    try {
      const response = await api("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        dispatch(setAuth(false));
        dispatch(setUser(null));
        navigate("/", { replace: true });
      } else {
        console.error("Logout failed:", response.statusText);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <motion.button
        onClick={toggleSidebar}
        className="fixed top-2 left-4 z-50 bg-white/10 text-white p-2 rounded-lg border border-white/10 hover:bg-white/20 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <FiX size={22} /> : <FiMenu size={22} />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />

            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-screen w-72 bg-[#0E1013] text-white z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/10 cursor-pointer" onClick={() => navigate("/dashboard")}>
                <div className="flex items-center gap-2">
                  <GiArtificialHive size={32} className="text-white" />
                  <span className="font-serif text-xl font-bold tracking-tight">
                    CM<span className="text-white/40">.AI</span>
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <motion.button
                  onClick={() => goTo("/interview")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-white text-black hover:bg-white/90 rounded-xl p-3 flex items-center justify-between transition-colors"
                >
                  <span className="font-medium text-sm">+ Create Interview</span>
                  <FiPlus size={18} className="text-black/60" />
                </motion.button>

                <div>
                  <h3 className="text-xs font-medium tracking-widest uppercase text-white/30 mb-3">Agents</h3>
                  <div className="space-y-1">
                    {agentItems.map((item, idx) => (
                      <motion.button
                        onClick={() => goTo(item.link)}
                        key={idx}
                        whileHover={{ x: 4 }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                          isActive(item.link) ? "bg-white text-black" : "text-white/70 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <item.icon size={18} />
                        <span>{item.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-medium tracking-widest uppercase text-white/30">Interview History</h3>
                    <button
                      onClick={() => goTo("/interview/history")}
                      className="text-white/40 hover:text-white transition"
                      title="View all interviews"
                    >
                      <FiList size={16} />
                    </button>
                  </div>

                  {interviewsLoading && (
                    <div className="flex items-center gap-2 px-3 py-3 text-white/40 text-xs">
                      <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Loading interviews...
                    </div>
                  )}

                  {!interviewsLoading && interviews.length === 0 && (
                    <div className="px-3 py-3 rounded-lg bg-white/[0.03] text-white/30 text-xs">No interviews yet.</div>
                  )}

                  {!interviewsLoading && interviews.length > 0 && (
                    <div className="space-y-1">
                      {interviews.slice(0, 5).map((interview) => {
                        const isCompleted = interview.status === "completed";
                        const isInProgress = interview.status === "in-progress";
                        const isInterviewActive = location.pathname === `/interview/${interview._id}`;

                        return (
                          <motion.button
                            key={interview._id}
                            onClick={() => openInterview(interview)}
                            whileHover={{ x: 3 }}
                            disabled={!isCompleted && !isInProgress}
                            className={`w-full text-left rounded-xl p-3 transition ${
                              isInterviewActive ? "bg-white text-black" : "hover:bg-white/5 text-white/70"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  isInterviewActive ? "bg-black/10" : isCompleted ? "bg-green-500/10" : "bg-yellow-500/10"
                                }`}
                              >
                                {isCompleted ? (
                                  <FiCheckCircle size={15} className={isInterviewActive ? "text-black" : "text-green-400"} />
                                ) : (
                                  <FiPlayCircle size={15} className={isInterviewActive ? "text-black" : "text-yellow-400"} />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${isInterviewActive ? "text-black" : "text-white"}`}>
                                  {interview.role || "Interview"}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span
                                    className={`text-[10px] capitalize ${
                                      isInterviewActive ? "text-black/50" : isCompleted ? "text-green-400/70" : "text-yellow-400/70"
                                    }`}
                                  >
                                    {interview.status}
                                  </span>
                                  <span className={`text-[10px] ${isInterviewActive ? "text-black/40" : "text-white/30"}`}>•</span>
                                  <span className={`text-[10px] ${isInterviewActive ? "text-black/40" : "text-white/30"}`}>
                                    {formatDate(interview.createdAt)}
                                  </span>
                                </div>
                              </div>

                              <FiChevronRight size={15} className={isInterviewActive ? "text-black/40" : "text-white/20"} />
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}

                  {interviews.length > 5 && (
                    <button
                      onClick={() => goTo("/interview/history")}
                      className="w-full mt-2 px-3 py-2 text-xs text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition text-center"
                    >
                      View all {interviews.length} interviews
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-white/10 space-y-4">
                <motion.div
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                  className="rounded-xl p-3 border border-white/10 mt-auto cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user?.username || "User"}</p>
                      <p className="text-xs text-white/40 truncate flex items-center gap-1">
                        <FiMail size={12} />
                        {user?.email || ""}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.button
                  onClick={handleLogout}
                  whileHover={{ x: 4 }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-sm text-white/70 hover:text-white"
                >
                  <FiLogOut size={18} />
                  <span>Log out</span>
                </motion.button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;