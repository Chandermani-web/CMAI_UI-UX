// pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiFileText,
  FiMap,
  FiFilter,
  FiUserCheck,
  FiArrowUpRight,
} from 'react-icons/fi';
import { FaCoins } from 'react-icons/fa';
import Sidebar from '../components/dashboard/Sidebar';
import { getAllInterviews } from '../apis/interview.api.js';
import InterviewStats from '../components/dashboard/InterviewStats.jsx';
import { PlusIcon } from 'lucide-react';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const agents = [
  {
    icon: FiUserCheck,
    label: 'Mock Interview',
    description: 'Practice with an AI interviewer and get scored, question-by-question feedback.',
    link: '/interview',
    featured: true,
  },
  {
    icon: FiFileText,
    label: 'Resume Builder',
    description: 'Build an ATS-friendly resume, section by section, with a live preview.',
    link: '/resume-builder',
  },
  {
    icon: FiFilter,
    label: 'Resume Scorer',
    description: 'Upload your resume for a score, missing skills, and targeted fixes.',
    link: '/scorer',
  },
  {
    icon: FiMap,
    label: 'Roadmap Builder',
    description: 'Get a structured learning path toward the role you want next.',
    link: '/roadmap',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.06 },
  }),
};

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [interviewsLoading, setInterviewsLoading] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen((open) => !open);

  useEffect(() => {
  const fetchInterviews = async () => {
    try {
      setInterviewsLoading(true);

      const response = await getAllInterviews();

      console.log("All interviews:", response);


      const interviewList =
        response?.interviews ||
        response?.data ||
        (Array.isArray(response) ? response : []);

      setInterviews(
        Array.isArray(interviewList)
          ? interviewList
          : []
      );
    } catch (error) {
      console.error(
        "Error fetching interview history:",
        error
      );

      setInterviews([]);
    } finally {
      setInterviewsLoading(false);
    }
  };

  fetchInterviews();
}, []);

  return (
    <div className="min-h-screen bg-[#0E1013]">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`pt-[88px] px-6 pb-16 transition-all duration-300 ${
          isSidebarOpen ? 'lg:ml-72' : 'ml-0'
        }`}
      >
        <div className="max-w-6xl mx-auto">
          {/* ===== HEADER ===== */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
            <div>
              <span className="text-xs font-medium tracking-widest uppercase text-white/30">
                Dashboard
              </span>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mt-1">
                {getGreeting()}{user?.username ? `, ${user.username}` : ''}
              </h1>
              <p className="text-white/50 mt-2">
                Manage your interviews, resumes, and roadmap in one place.
              </p>
            </div>

            <motion.div
              onClick={() => navigate("/billing")}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-yellow-500/15 to-yellow-600/5 border border-yellow-500/20 rounded-2xl px-5 py-4 flex items-center gap-4 shrink-0"
            >
              <div className="w-11 h-11 rounded-full bg-yellow-500/15 flex items-center justify-center shrink-0">
                <FaCoins className="text-yellow-600" size={20} />
              </div>
              <div>
                <p className="text-[11px] tracking-widest uppercase text-white/40">
                  Interview Coins
                </p>
                <p className="font-serif text-2xl font-bold text-yellow-500 leading-tight">
                  {user?.interviewCoin ?? 0}
                </p>
              </div>
             <div className="w-11 h-11 rounded-full bg-black-500 flex items-center justify-center shrink-0">
                <PlusIcon className="text-gray-100" size={20} />
              </div> 
            </motion.div>
          </div>

          {/* ===== AGENTS ===== */}
          <div className="mb-3">
            <h2 className="text-xs font-medium tracking-widest uppercase text-white/30">
              Agents
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {agents.map((agent, i) => {
              const Icon = agent.icon;
              return (
                <motion.button
                  key={agent.link}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  whileHover={{ y: -2 }}
                  onClick={() => navigate(agent.link)}
                  className={`text-left rounded-2xl p-6 shadow-lg shadow-black/30 transition-colors bg-[#161615] text-white hover:bg-[#1c1c1a] ${
                    agent.featured
                      ? 'sm:col-span-2 border border-[#F5A524]/30'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                        <Icon size={18} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-serif text-lg font-bold text-white">
                          {agent.label}
                        </h3>
                        <p className="text-sm text-white/50 mt-1 max-w-md">
                          {agent.description}
                        </p>
                      </div>
                    </div>
                    <FiArrowUpRight size={18} className="text-white/40 shrink-0 mt-1" />
                  </div>
                </motion.button>
              );
            })}
          </div>


          {/* ===== INTERVIEW STATS ===== */}

          <InterviewStats interviews={interviews} />


          {/* ===== GETTING STARTED ===== */}
          <div className="mt-10 border border-white/10 rounded-2xl p-6 bg-white/[0.03]">
            <h2 className="font-serif text-lg font-bold text-white mb-1">
              New here?
            </h2>
            <p className="text-white/50 text-sm mb-4">
              Start with a resume score, then move into a mock interview once your resume is in shape.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/scorer')}
                className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
              >
                Score my resume <FiArrowUpRight size={14} />
              </button>
              <button
                onClick={() => navigate('/interview')}
                className="inline-flex items-center gap-2 border border-white/15 text-white/70 px-5 py-2.5 rounded-full text-sm font-medium hover:border-white/30 hover:text-white transition-colors"
              >
                Start a mock interview <FiArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default Dashboard;