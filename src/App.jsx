import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { getCurrentUser } from './apis/user.api.js';
import Scorer from './pages/Scorer.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, setAuth } from './redux/authSlice.js';
import { setResume } from './redux/resumeSlice.js';
import { getResume } from './apis/resume.api.js';
import ResumeBuilder from './pages/ResumeBuilder.jsx';
import InterviewStart from './pages/InterviewStart.jsx';
import InterviewPage from './pages/InterviewPage.jsx';
import InterviewReport from './pages/InterviewReport.jsx';
import InterviewHistory from './pages/InterviewHistory.jsx';
import Billing from './pages/Billing.jsx';
import Roadmap from './pages/Roadmap.jsx';

const App = () => {
  const dispatch = useDispatch();
  const { auth } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const getUser = async () => {
      const data = await getCurrentUser();
      dispatch(setUser(data));
      dispatch(setAuth(!!data));
      setLoading(false);
    };

    getUser();
  }, []);

  useEffect(() => {

    const getResumeData = async () => {
      const data = await getResume();
      dispatch(setResume(data));
      setLoading(false);
    };

    getResumeData();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0E1013] overflow-hidden">
        {/* ambient glow */}
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-500/20 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-yellow-500/10 blur-[100px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0E1013_75%)]" />

        <div className="relative flex flex-col items-center gap-5">
          {/* logo / mark */}
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-2xl bg-purple-500/20" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur">
              <span className="font-serif text-2xl font-bold text-white">C</span>
            </div>
          </div>

          {/* spinner */}
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-purple-500"
            role="status"
          />

          <p className="text-xs uppercase tracking-[0.3em] text-white/30">
            Loading CM.AI
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={auth ? <Navigate to="/dashboard" replace/> : <Home />} />
        <Route path="/interview" element={auth ? <InterviewStart /> : <Navigate to="/" replace />} />
        <Route path="/interview/:id" element={auth ? <InterviewPage /> : <Navigate to="/" replace />} />
        <Route path="/interview/:id/report" element={auth ? <InterviewReport /> : <Navigate to="/" replace />} />
        <Route path="/interview/history" element={auth ? <InterviewHistory /> : <Navigate to="/" replace />} />
        <Route path="/dashboard" element={auth ? <Dashboard /> : <Navigate to="/" replace />} />
        <Route path="/roadmap" element={auth ? <Roadmap /> : <Navigate to="/" replace />} />
        <Route path="/resume-builder" element={auth ? <ResumeBuilder /> : <Navigate to="/" replace />} />
        <Route path="/scorer" element={auth ? <Scorer /> : <Navigate to="/" replace />} />
        <Route path="/billing" element={auth ? <Billing /> : <Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App