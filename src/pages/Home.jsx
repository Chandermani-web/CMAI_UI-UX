import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GiArtificialHive } from 'react-icons/gi';
import {
  FiFileText,
  FiMap,
  FiFilter,
  FiCheckCircle,
  FiUser,
  FiUserCheck,
  FiCpu,
  FiArrowUpRight,
  FiArrowRight,
  FiCreditCard,
  FiStar,
  FiPlay,
} from 'react-icons/fi';
import { FaCoins } from 'react-icons/fa';
import LoginModal from '../components/LoginModal.jsx';

// --- Animation presets for reuse ---
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const Home = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  // The six services the platform provides
  const services = [
    {
      icon: FiFileText,
      title: 'Resume builder',
      desc: 'Turn raw experience into a resume written to clear ATS filters and catch a recruiter\u2019s eye.',
      tint: 'bg-sky-500/10 text-sky-400',
      span: true,
    },
    {
      icon: FiUserCheck,
      title: 'Mock interviews',
      desc: 'Sit through live HR, technical, and coding rounds with an AI interviewer that reacts to your answers.',
      tint: 'bg-purple-500/10 text-purple-400',
    },
    {
      icon: FiCheckCircle,
      title: 'Interview feedback',
      desc: 'Every answer scored and broken down, with specific lines to fix before your next round.',
      tint: 'bg-emerald-500/10 text-emerald-400',
    },
    {
      icon: FiMap,
      title: 'Roadmap generator',
      desc: 'A study plan sequenced from where you stand today to the role you\u2019re aiming for.',
      tint: 'bg-amber-500/10 text-amber-400',
    },
    {
      icon: FiFilter,
      title: 'Resume scorer',
      desc: 'Point it at a job description and see exactly which skills and keywords your resume is missing.',
      tint: 'bg-pink-500/10 text-pink-400',
    },
    {
      icon: FaCoins,
      title: 'Pay as you go',
      desc: 'One coin balance covers every tool above \u2014 start free, top up only when you need more.',
      tint: 'bg-yellow-500/10 text-yellow-500',
    },
  ];

  const steps = [
    {
      no: '01',
      title: 'Build your resume',
      desc: 'Answer a few prompts and get a resume formatted for both humans and applicant tracking systems.',
    },
    {
      no: '02',
      title: 'Practice the interview',
      desc: 'Run a mock interview matched to the role and difficulty you choose.',
    },
    {
      no: '03',
      title: 'Read your feedback',
      desc: 'Get a scored breakdown of what landed and what to change.',
    },
    {
      no: '04',
      title: 'Follow your roadmap',
      desc: 'Close the gaps with a plan built from your actual results.',
    },
  ];

  const proof = [
    { value: '6', label: 'AI agents working for you' },
    { value: '12,400+', label: 'Mock interviews run' },
    { value: '4.8/5', label: 'Average feedback rating' },
    { value: '85%', label: 'Report feeling more prepared' },
  ];

  return (
    <div className="bg-[#0E1013] min-h-screen overflow-x-hidden">
      {/* ===== NAVBAR ===== */}
      <motion.nav
        className="fixed top-0 left-0 right-0 w-full bg-[#0E1013]/90 backdrop-blur-xl border-b border-white/[0.06] h-[64px] z-50 flex items-center px-6"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              <GiArtificialHive size={26} className="text-white" />
            </motion.div>
            <span className="font-serif font-bold text-xl text-white tracking-tight">
              CM<span className="text-white/40">.AI</span>
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <motion.button
              onClick={openLoginModal}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="bg-white text-black px-6 py-2.5 rounded-full font-medium hover:bg-transparent hover:text-white border border-white transition-all duration-300 text-sm shadow-sm hover:shadow-lg"
            >
              Log in
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* ===== HERO ===== */}
      <div className="pt-[64px]">
        <div className="bg-[#0E1013] border-b border-white/[0.06] min-h-[560px] flex items-center relative overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1600&auto=format&fit=crop"
              alt=""
              className="w-full h-full object-cover opacity-[0.14]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0E1013] via-[#0E1013]/95 to-[#0E1013]/70" />
          </div>
          <div className="hidden md:block absolute top-12 right-12 w-12 h-12 border-t-2 border-r-2 border-white/10" />
          <div className="hidden md:block absolute bottom-12 right-12 w-12 h-12 border-b-2 border-r-2 border-white/10" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#F5A524]/5 rounded-full blur-3xl" />
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

          <div className="max-w-7xl mx-auto px-6 py-20 w-full relative z-10 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 border border-white/15 px-4 py-1.5 rounded-full mb-6 bg-white/[0.03] backdrop-blur-sm"
              >
                <span className="relative flex w-2 h-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/40" />
                  <span className="relative inline-flex rounded-full w-2 h-2 bg-white" />
                </span>
                <span className="text-xs font-medium tracking-[0.15em] uppercase text-white/60">
                  AI-powered interview prep
                </span>
              </motion.div>

              <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6 leading-[1.05] tracking-tight">
                Job interviews don't
                <br />
                <span className="relative">
                  have to suck anymore.
                  <motion.span
                    className="absolute -bottom-2 left-0 w-full h-1 bg-white/10 rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                  />
                </span>
              </h1>
              <p className="text-lg text-white/50 max-w-xl mb-8 leading-relaxed">
                CM.AI is an innovative AI-powered interview preparation platform
                designed to help job seekers excel in their interviews.
              </p>
              <motion.button
                className="group inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-medium shadow-lg shadow-black/40 hover:shadow-black/60 transition-shadow duration-300 mb-9"
                onClick={openLoginModal}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              >
                Get started for free
                <FiArrowUpRight className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </motion.button>

              {/* Social proof avatar stack */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="flex items-center gap-4"
              >
                <div className="flex -space-x-3">
                  {[23, 47, 12, 65, 8].map((n) => (
                    <img
                      key={n}
                      src={`https://i.pravatar.cc/64?img=${n}`}
                      alt=""
                      className="w-9 h-9 rounded-full border-2 border-[#0E1013] object-cover"
                    />
                  ))}
                </div>
                <div className="text-xs text-white/40 leading-tight">
                  <span className="text-white/70 font-medium">12,400+</span> job seekers
                  <br />practicing this week
                </div>
              </motion.div>
            </motion.div>

            {/* Hero visual: mock live-interview card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-3xl border border-white/10 bg-[#161615] p-6 shadow-2xl shadow-black/40">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400/70" />
                    <span className="w-2 h-2 rounded-full bg-yellow-400/70" />
                    <span className="w-2 h-2 rounded-full bg-emerald-400/70" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-white/30">
                    Live mock interview
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-5">
                  <img
                    src="https://i.pravatar.cc/80?img=33"
                    alt=""
                    className="w-11 h-11 rounded-full object-cover border border-white/10"
                  />
                  <div>
                    <p className="text-sm font-medium text-white">Interview Agent</p>
                    <p className="text-xs text-white/35">Asking: "Walk me through a project you led."</p>
                  </div>
                </div>
                <div className="flex items-end gap-1 h-14 mb-6">
                  {[40, 65, 30, 80, 55, 90, 45, 70, 35, 60, 50, 25].map((h, i) => (
                    <motion.span
                      key={i}
                      className="w-full rounded-full bg-white/15"
                      style={{ height: `${h}%` }}
                      animate={{ height: [`${h}%`, `${Math.max(15, h - 20)}%`, `${h}%`] }}
                      transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.06, ease: 'easeInOut' }}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-white/30">
                  <span>04:12 elapsed</span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Recording feedback
                  </span>
                </div>
              </div>

              {/* Floating feedback badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="absolute -left-8 -bottom-6 bg-[#161615] border border-white/10 rounded-2xl p-4 shadow-xl shadow-black/40 w-44"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <FiCheckCircle size={13} className="text-emerald-400" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-white/30">
                    Feedback Agent
                  </span>
                </div>
                <p className="font-serif text-2xl font-bold text-white">92<span className="text-sm text-white/30">/100</span></p>
                <p className="text-[11px] text-white/35">Strong structure, add metrics</p>
              </motion.div>

              {/* Floating coins badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.05, duration: 0.6 }}
                className="absolute -right-6 -top-6 bg-[#161615] border border-yellow-500/20 rounded-2xl px-4 py-3 shadow-xl shadow-black/40 flex items-center gap-2.5"
              >
                <FaCoins size={15} className="text-yellow-500" />
                <div>
                  <p className="text-sm font-semibold text-white leading-none">+150 coins</p>
                  <p className="text-[10px] text-white/30 mt-0.5">on sign up</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ===== SERVICES ===== */}
      <div className="max-w-7xl mx-auto px-6 pt-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeUp}
          className="max-w-2xl mb-10"
        >
          <span className="text-xs font-medium tracking-[0.15em] uppercase text-white/30">
            Everything in one place
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mt-2">
            Six tools, one prep pipeline
          </h2>
          <p className="text-white/45 mt-3 leading-relaxed">
            Every service below runs on the same account and the same coin balance —
            use as much or as little as your search needs.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <motion.button
                key={service.title}
                onClick={openLoginModal}
                variants={fadeUp}
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.35)' }}
                whileTap={{ scale: 0.97 }}
                className={`group text-left bg-[#161615] border border-white/[0.06] rounded-2xl p-6 hover:border-white/20 transition-all duration-300 shadow-sm hover:shadow-xl ${
                  service.span ? 'sm:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-6">
                  <motion.div
                    whileHover={{ rotate: -8, scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${service.tint}`}
                  >
                    <Icon size={19} />
                  </motion.div>
                  <FiArrowRight
                    className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all duration-300"
                    size={16}
                  />
                </div>
                <h3 className="font-semibold text-white mb-1.5 text-lg">{service.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{service.desc}</p>
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* ===== IMAGE BANNER ===== */}
      <div className="max-w-7xl mx-auto px-6 pt-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="relative overflow-hidden rounded-3xl border border-white/10 min-h-[380px] flex items-end"
        >
          <img
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1600&auto=format&fit=crop"
            alt="Two colleagues celebrating good news at a laptop"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
          <div className="relative z-10 p-8 md:p-10 max-w-lg">
            <span className="text-xs font-medium tracking-[0.15em] uppercase text-white/60">
              What practice does
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mt-2 mb-3 leading-snug">
              The nerves fade a little more with every round you run.
            </h2>
            <p className="text-white/70 text-sm leading-relaxed">
              Job seekers who complete three or more mock interviews on CM.AI report
              walking into the real thing noticeably calmer — and it shows in the offers.
            </p>
          </div>
        </motion.div>
      </div>

      {/* ===== HOW IT WORKS ===== */}
      <div className="max-w-6xl mx-auto px-6 py-28">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center max-w-xl mx-auto mb-16"
        >
          <span className="text-xs font-medium tracking-[0.15em] uppercase text-white/30">
            The flow
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mt-2">
            From blank resume to offer, in four steps
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-5"
        >
          <div className="hidden lg:block absolute top-6 left-0 right-0 h-px bg-white/10" />
          {steps.map((step) => (
            <motion.div key={step.no} variants={fadeUp} className="relative">
              <div className="relative z-10 w-12 h-12 rounded-full bg-[#0E1013] border border-white/15 flex items-center justify-center text-white/70 font-serif font-semibold mb-5">
                {step.no}
              </div>
              <h3 className="text-white font-semibold text-base mb-2">{step.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ===== AI AGENTS ===== */}
      <div className="max-w-6xl mx-auto px-6 py-28 border-t border-white/[0.06]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 border border-white/10 rounded-full px-5 py-1.5 mb-6 bg-white/[0.03] backdrop-blur-sm shadow-sm"
          >
            <FiCpu size={14} className="text-white/60" />
            <span className="text-xs font-medium tracking-[0.1em] uppercase text-white/60">
              Behind the scenes
            </span>
          </motion.div>

          <h2 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-4">
            <span className="text-white">Specialized agents for</span>
            <br />
            <span className="text-white/30">every interview stage</span>
          </h2>

          <p className="text-white/50 max-w-xl mx-auto leading-relaxed">
            Four agents work together behind the six tools above — building your
            resume, running practice interviews, scoring your answers, and planning what's next.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6 items-stretch">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="relative rounded-3xl overflow-hidden min-h-[280px] lg:min-h-0"
          >
            <img
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop"
              alt="Team reviewing feedback together around a table"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="relative z-10 h-full flex items-end p-6">
              <p className="text-white/90 text-sm font-medium">
                Every session feeds the next agent — nothing you practice goes to waste.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
          >
            {[
              { icon: FiFileText, title: 'Resume Agent', desc: 'Builds ATS-friendly resumes and widens the funnel of interviews you land.' },
              { icon: FiUser, title: 'Interview Agent', desc: 'Runs realistic HR, technical, and coding interviews through live simulations.' },
              { icon: FiCheckCircle, title: 'Feedback Agent', desc: 'Breaks down every answer with scoring reports and actionable improvements.' },
              { icon: FiMap, title: 'Roadmap Agent', desc: 'Maps a personalized study plan from your goals and past performance.' },
            ].map((agent) => {
              const Icon = agent.icon;
              return (
                <motion.div
                  key={agent.title}
                  variants={fadeUp}
                  whileHover={{ y: -10, backgroundColor: '#1e1e1c', boxShadow: '0 30px 60px rgba(0,0,0,0.35)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="bg-[#161615] rounded-3xl p-6 transition-all duration-300 cursor-default"
                >
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 8 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center mb-6"
                  >
                    <Icon className="text-white" size={18} />
                  </motion.div>
                  <h3 className="text-white font-semibold text-base mb-2">{agent.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{agent.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* ===== PRICING TEASER ===== */}
      <div className="max-w-7xl mx-auto px-6 pb-28">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#161615] p-8 md:p-12"
        >
          <div className="absolute -right-24 -top-24 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl" />
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-xs font-medium tracking-[0.15em] uppercase text-white/30">
                Pricing
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mt-2 mb-4">
                Start free. Add coins when you need them.
              </h2>
              <p className="text-white/45 leading-relaxed mb-6">
                The Free plan comes with 150 Interview Coins to try every tool.
                Starter adds 300 more coins plus unlimited scoring and roadmaps.
              </p>
              <motion.button
                onClick={openLoginModal}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-white/90 transition-all duration-300"
              >
                See plans and coins
                <FiArrowUpRight size={15} />
              </motion.button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center mb-4">
                  <FiCreditCard size={16} className="text-white/60" />
                </div>
                <p className="font-serif text-2xl font-bold text-white">Free</p>
                <p className="text-xs text-white/35 mt-1">150 coins to start</p>
              </div>
              <div className="rounded-2xl border border-purple-500/30 bg-purple-500/[0.07] p-5">
                <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-4">
                  <FaCoins size={15} className="text-yellow-500" />
                </div>
                <p className="font-serif text-2xl font-bold text-white">₹199</p>
                <p className="text-xs text-white/35 mt-1">300 coins, one-time</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ===== TESTIMONIALS ===== */}
      <div className="max-w-7xl mx-auto px-6 pb-28">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="max-w-xl mb-10"
        >
          <span className="text-xs font-medium tracking-[0.15em] uppercase text-white/30">
            Reviews
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mt-2">
            Job seekers are getting offers faster
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {[
            {
              avatar: 60,
              name: 'Ananya R.',
              role: 'Frontend Engineer, hired at a Series B startup',
              quote:
                'The mock interviews felt closer to the real thing than any friend or mentor session I\u2019d done. The feedback caught habits I didn\u2019t know I had.',
            },
            {
              avatar: 14,
              name: 'Rahul M.',
              role: 'Data Analyst, career switcher',
              quote:
                'I used the roadmap agent to figure out what to learn first, then the resume scorer to close the gaps. Got three callbacks in the same week.',
            },
            {
              avatar: 45,
              name: 'Priya S.',
              role: 'Product Manager, campus placement',
              quote:
                'Coming from a non-tech background, the scored feedback after every round is what actually built my confidence before the real interview.',
            },
          ].map((t) => (
            <motion.div
              key={t.name}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              className="bg-[#161615] border border-white/[0.06] rounded-2xl p-6 flex flex-col"
            >
              <FiStar className="text-yellow-500 mb-4" size={16} />
              <p className="text-sm text-white/60 leading-relaxed flex-1 mb-6">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                <img
                  src={`https://i.pravatar.cc/72?img=${t.avatar}`}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  <p className="text-[11px] text-white/35">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ===== PROOF ===== */}
      <div className="max-w-7xl mx-auto px-6 pb-28">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="bg-[#161615] rounded-3xl grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/10 overflow-hidden shadow-xl shadow-black/20"
        >
          {proof.map((p) => (
            <motion.div
              key={p.label}
              variants={fadeUp}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
              className="p-6 md:p-8 transition-colors duration-300"
            >
              <p className="font-serif text-3xl md:text-4xl font-bold text-white">{p.value}</p>
              <p className="text-xs text-white/40 mt-1.5">{p.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ===== FINAL CTA ===== */}
      <div className="max-w-5xl mx-auto px-6 pb-28 text-center relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="relative rounded-3xl overflow-hidden border border-white/10 px-6 py-16 md:py-20"
        >
          <img
            src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1600&auto=format&fit=crop"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0E1013]/60 via-[#0E1013]/85 to-[#0E1013]" />
          <div className="relative z-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
              Your next interview doesn't have to be a guess.
            </h2>
            <p className="text-white/45 max-w-md mx-auto mb-8">
              Build your resume, practice out loud, and walk in with a plan.
            </p>
            <motion.button
              onClick={openLoginModal}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-medium shadow-lg shadow-black/40 hover:shadow-black/60 transition-shadow duration-300"
            >
              <FiPlay size={16} />
              Start free with 150 coins
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* ===== LOGIN MODAL ===== */}
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </div>
  );
};

export default Home;