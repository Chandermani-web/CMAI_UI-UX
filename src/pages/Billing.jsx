import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  FiCheck,
  FiArrowUpRight,
  FiCreditCard,
  FiClock,
  FiShield,
  FiZap,
  FiHelpCircle,
  FiChevronDown,
  FiPlus,
  FiTrendingUp,
  FiFileText,
  FiMap,
  FiFilter,
  FiUserCheck,
  FiX,
  FiAlertCircle,
} from "react-icons/fi";

import { FaCoins } from "react-icons/fa";

import Sidebar from "../components/dashboard/Sidebar";
import api from "../utils/api";
import { setUser } from '../redux/authSlice.js';

const plans = [
  {
    id: "free",
    name: "Free",
    price: "Free",
    numericPrice: 0,
    coins: 150,
    description: "Perfect for getting started with FresherAI.",
    button: "Current Plan",
    features: [
      "150 Interview Coins",
      "Resume Builder",
      "Resume Scorer",
      "Roadmap Generator",
      "Basic AI Responses",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: "199",
    numericPrice: 199,
    coins: 300,
    description: "For students actively preparing for interviews.",
    popular: true,
    button: "Buy Starter",
    features: [
      "300 Interview Coins",
      "Unlimited Resume Score",
      "Unlimited Roadmaps",
      "Priority AI Response",
      "Interview Feedback",
    ],
  },
];

const faqs = [
  {
    question: "What are Interview Coins?",
    answer:
      "Interview Coins are used across AI-powered features such as mock interviews and other premium AI experiences. Your available balance is shown at the top of this page.",
  },
  {
    question: "Do my Interview Coins expire?",
    answer:
      "Your coins remain available in your account according to the terms of the plan you purchased. Your current balance is always visible from your dashboard.",
  },
  {
    question: "Can I upgrade my plan later?",
    answer:
      "Yes. You can upgrade whenever you need more Interview Coins or additional premium features.",
  },
  {
    question: "What happens when I run out of coins?",
    answer:
      "You can purchase another plan or available coin package to continue using coin-based AI features.",
  },
];

const Billing = () => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openFaq, setOpenFaq] = useState(0);
  const [toast, setToast] = useState(null); // { type: "success" | "error", message: string }
  const dispatch = useDispatch();

  const toggleSidebar = () => {
    setIsSidebarOpen((open) => !open);
  };

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const currentCoins = user?.interviewCoin ?? 0;

  /*
   * Change this later if you store the user's plan
   * in Redux/backend.
   */
  const currentPlan = user?.plan || "Free";

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBuy = async (plan) => {
    if (plan.id === "free") return;

    try {
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !window.Razorpay) {
        showToast("error", "Failed to load payment gateway. Please check your connection and try again.");
        return;
      }

      const responseCall = await api("/api/billing/create-order", {
        method: "POST",
        body: { planId: plan.id },
      });

      const response = await responseCall.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: response.order.amount,
        currency: response.order.currency,
        name: "CM.AI",
        description: "INTERVIEW COINS",
        order_id: response.order.id,

        handler: async function (paymentResponse) {
          try {
            const verifyResponseCall = await api("/api/billing/verify-payment", {
              method: "POST",
              body: {
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
              },
            });

            const verifyResponse = await verifyResponseCall.json();

            if (!verifyResponse.success) {
              showToast("error", "Payment verification failed. Please contact support if the amount was deducted.");
              return;
            }

            const addCoinResponseCall = await api("/api/auth/add-coins", {
              method: "POST",
              body: { coins: plan.coins },
            });

            const addCoinResponse = await addCoinResponseCall.json();

            if (addCoinResponse.success) {
              dispatch(
                setUser({
                  ...user,
                  interviewCoin: addCoinResponse.interviewCoin,
                })
              );

              showToast("success", `Successfully added ${plan.coins} coins to your account!`);
              navigate("/");
            } else {
              showToast("error", "Something went wrong adding coins to your account. Please contact support.");
            }
          } catch (error) {
            showToast("error", "Something went wrong verifying your payment. Please contact support.");
          }
        },

        modal: {
          ondismiss: function () {},
        },

        theme: {
          color: "#000000",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      showToast("error", "Something went wrong starting the payment. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1013] text-white">
      {/* TOAST */}
      <div className="pointer-events-none fixed inset-x-0 top-5 z-[100] flex justify-center px-4">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-md ${
                toast.type === "success"
                  ? "border-emerald-500/20 bg-emerald-950/80 text-emerald-300"
                  : "border-red-500/20 bg-red-950/80 text-red-300"
              }`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  toast.type === "success" ? "bg-emerald-500/15" : "bg-red-500/15"
                }`}
              >
                {toast.type === "success" ? (
                  <FiCheck size={14} />
                ) : (
                  <FiAlertCircle size={14} />
                )}
              </div>
              <p className="max-w-xs text-sm font-medium sm:max-w-sm">{toast.message}</p>
              <button
                onClick={() => setToast(null)}
                className="ml-1 shrink-0 text-white/40 transition hover:text-white/80"
              >
                <FiX size={15} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SIDEBAR */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* MAIN */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`pt-[88px] px-5 sm:px-6 pb-20 transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-72" : "ml-0"
        }`}
      >
        <div className="mx-auto max-w-7xl">
          {/* HEADER */}
          <div className="mb-10">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/30">
                  Account & Billing
                </span>
                <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-white md:text-4xl">
                  Interview Coins
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
                  Use coins for AI interviews, resume scoring, resume building,
                  roadmap generation, and other AI-powered career tools.
                </p>
              </div>
              <button
                onClick={() => navigate("/dashboard")}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm text-white/60 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
              >
                Back to Dashboard
                <FiArrowUpRight size={15} />
              </button>
            </div>
          </div>

          {/* BALANCE + PLAN + USAGE */}
          <div className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* Balance */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -3 }}
              className="relative overflow-hidden rounded-2xl border border-yellow-500/15 bg-gradient-to-br from-yellow-500/[0.10] via-[#161615] to-[#161615] p-6"
            >
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-yellow-500/10 blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500/10">
                    <FaCoins className="text-yellow-500" size={19} />
                  </div>
                  <span className="rounded-full border border-yellow-500/10 bg-yellow-500/5 px-2.5 py-1 text-[10px] uppercase tracking-wider text-yellow-500/70">
                    Balance
                  </span>
                </div>
                <p className="mt-6 text-xs uppercase tracking-widest text-white/30">
                  Available Coins
                </p>
                <div className="mt-1 flex items-end gap-2">
                  <span className="font-serif text-4xl font-bold text-yellow-500">
                    {currentCoins}
                  </span>
                  <span className="mb-1 text-sm text-white/30">coins</span>
                </div>
                <button
                  onClick={() =>
                    document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="mt-5 flex items-center gap-2 text-sm font-medium text-white/70 transition hover:text-white"
                >
                  Add more coins
                  <FiArrowUpRight size={15} />
                </button>
              </div>
            </motion.div>

            {/* Current Plan */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-white/10 bg-[#161615] p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5">
                  <FiCreditCard size={19} className="text-white/70" />
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-emerald-400">
                  Active
                </span>
              </div>
              <p className="mt-6 text-xs uppercase tracking-widest text-white/30">
                Current Plan
              </p>
              <h3 className="mt-1 font-serif text-3xl font-bold">{currentPlan}</h3>
              <p className="mt-2 text-sm text-white/35">
                Your account is currently using the {currentPlan} plan.
              </p>
            </motion.div>

            {/* Usage */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-white/10 bg-[#161615] p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10">
                  <FiTrendingUp size={19} className="text-indigo-400" />
                </div>
                <span className="text-xs text-white/30">This month</span>
              </div>
              <p className="mt-6 text-xs uppercase tracking-widest text-white/30">
                Coin Usage
              </p>
              <h3 className="mt-1 font-serif text-3xl font-bold">
                {Math.max(0, 150 - currentCoins)}
              </h3>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-indigo-500"
                  style={{
                    width: `${Math.min(100, (Math.max(0, 150 - currentCoins) / 150) * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-white/30">Estimated coins used</p>
            </motion.div>
          </div>

          {/* PLANS HEADER */}
          <div id="plans" className="scroll-mt-20">
            <div className="mb-5">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/30">
                Plans
              </span>
              <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-bold">Choose your plan</h2>
                  <p className="mt-1 text-sm text-white/40">
                    Get more coins and unlock more powerful career tools.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/30">
                  <FiShield size={14} />
                  Secure payments
                </div>
              </div>
            </div>

            {/* PLAN CARDS */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {plans.map((plan, index) => {
                const isCurrent = plan.name.toLowerCase() === currentPlan.toLowerCase();

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    whileHover={{ y: -5 }}
                    className={`relative flex flex-col overflow-hidden rounded-2xl border p-6 transition-all duration-300 ${
                      plan.popular
                        ? "border-purple-500/30 bg-gradient-to-b from-purple-500/[0.07] to-[#161615] shadow-2xl shadow-purple-950/20"
                        : "border-white/10 bg-[#161615]"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute right-5 top-5 rounded-full bg-purple-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                        Popular
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-semibold text-white">{plan.name}</p>
                      <div className="mt-5 flex items-end gap-2">
                        <span className="font-serif text-4xl font-bold">
                          {plan.price === "Free" ? "Free" : `₹${plan.price}`}
                        </span>
                        {plan.price !== "Free" && (
                          <span className="mb-1 text-xs text-white/30">one-time</span>
                        )}
                      </div>
                      <p className="mt-2 min-h-[42px] text-sm leading-5 text-white/35">
                        {plan.description}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-500/10">
                        <FaCoins size={15} className="text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {plan.coins} Interview Coins
                        </p>
                        <p className="text-[11px] text-white/30">AI career credits</p>
                      </div>
                    </div>

                    <div className="mt-6 flex-1">
                      <p className="mb-4 text-[10px] font-medium uppercase tracking-widest text-white/25">
                        What's included
                      </p>
                      <div className="space-y-3">
                        {plan.features.map((feature) => (
                          <div key={feature} className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                              <FiCheck size={10} className="text-emerald-400" />
                            </div>
                            <span className="text-sm text-white/60">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleBuy(plan)}
                      disabled={isCurrent}
                      className={`mt-7 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium transition ${
                        isCurrent
                          ? "cursor-default bg-white/10 text-white/30"
                          : plan.popular
                          ? "bg-purple-600 text-white hover:bg-purple-500"
                          : "bg-white text-black hover:bg-white/90"
                      }`}
                    >
                      {isCurrent ? (
                        <>
                          <FiCheck size={15} />
                          Current Plan
                        </>
                      ) : (
                        <>
                          {plan.button}
                          <FiArrowUpRight size={15} />
                        </>
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* WHAT CAN YOU DO WITH COINS */}
          <section className="mt-12">
            <div className="mb-5">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/30">
                Your AI toolkit
              </span>
              <h2 className="mt-1 font-serif text-2xl font-bold">Spend your coins wisely</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: FiUserCheck,
                  title: "Mock Interviews",
                  text: "Practice with an AI interviewer and get detailed feedback.",
                  link: "/interview",
                },
                {
                  icon: FiFileText,
                  title: "Resume Builder",
                  text: "Create an ATS-friendly resume tailored to your career.",
                  link: "/resume-builder",
                },
                {
                  icon: FiFilter,
                  title: "Resume Scorer",
                  text: "Find missing skills and improve your resume score.",
                  link: "/scorer",
                },
                {
                  icon: FiMap,
                  title: "Roadmap Builder",
                  text: "Generate a structured learning roadmap for your target role.",
                  link: "/roadmap",
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.title}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    whileHover={{ y: -3 }}
                    onClick={() => navigate(item.link)}
                    className="group rounded-2xl border border-white/10 bg-[#161615] p-5 text-left transition hover:border-white/15 hover:bg-[#1b1b19]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                        <Icon size={18} className="text-white/70" />
                      </div>
                      <FiArrowUpRight
                        size={16}
                        className="text-white/20 transition group-hover:text-white/60"
                      />
                    </div>
                    <h3 className="mt-5 font-serif text-base font-bold">{item.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-white/35">{item.text}</p>
                  </motion.button>
                );
              })}
            </div>
          </section>

          {/* PAYMENT / TRUST SECTION */}
          <section className="mt-12">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                  <FiShield size={18} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Secure payments</h3>
                  <p className="mt-1 text-xs text-white/30">
                    Your payment information stays protected.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-500/10">
                  <FiZap size={18} className="text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Instant activation</h3>
                  <p className="mt-1 text-xs text-white/30">
                    Purchased coins are added to your account quickly.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10">
                  <FiHelpCircle size={18} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Need help?</h3>
                  <p className="mt-1 text-xs text-white/30">
                    Contact support if you have questions about billing.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mt-12">
            <div className="mb-5">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/30">
                Support
              </span>
              <h2 className="mt-1 font-serif text-2xl font-bold">
                Frequently asked questions
              </h2>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#161615]">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={faq.question} className="border-b border-white/[0.07] last:border-b-0">
                    <button
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left transition hover:bg-white/[0.025] sm:px-6"
                    >
                      <div className="flex items-center gap-3">
                        <FiHelpCircle size={17} className="shrink-0 text-white/30" />
                        <span className="text-sm font-medium text-white/80">{faq.question}</span>
                      </div>
                      <FiChevronDown
                        size={17}
                        className={`shrink-0 text-white/30 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="px-5 pb-5 pl-[52px] sm:px-6 sm:pl-[58px]"
                      >
                        <p className="max-w-3xl text-sm leading-6 text-white/40">{faq.answer}</p>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* FOOTER */}
          <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/25 sm:flex-row sm:items-center sm:justify-between">
            <p>FresherAI • Interview Coins</p>
            <div className="flex items-center gap-4">
              <button className="transition hover:text-white/60">Terms</button>
              <button className="transition hover:text-white/60">Privacy</button>
              <button className="transition hover:text-white/60">Billing Support</button>
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default Billing;