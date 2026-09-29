import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import Step2interview from "../components/interview/Step2interview";
import { getInterview } from "../apis/interview.api";
import "./InterviewPage.css";

const InterviewPage = () => {
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  // `silent` is used for refetches after an answer is submitted, so the
  // question changes in place without flashing the full-page loader.
  const fetchInterview = useCallback(async (silent = false) => {
    if (!id) return;
    if (!silent) setLoading(true);
    try {
      const data = (await getInterview(id))?.interview;
      if (!data) return setInterview(null);
      if (data.status === "completed") {
        return navigate(`/interview/${id}/report`, { replace: true });
      }
      setInterview(data);
    } catch (error) {
      console.error("Error fetching interview:", error);
      if (!silent) setInterview(null);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchInterview(); }, [fetchInterview]);

  if (loading) {
    return (
      <div className="ip-screen">
        <div className="ip-loading">
          <div className="ip-spinner">
            <div className="ip-spinner-track" />
            <div className="ip-spinner-arc" />
            <div className="ip-spinner-dot-wrap"><div className="ip-spinner-dot" /></div>
          </div>
          <p className="ip-loading-title">Preparing your interview</p>
          <p className="ip-loading-sub">Please wait a moment...</p>
          <div className="ip-bounce-row">
            <span className="ip-bounce" style={{ animationDelay: "0ms" }} />
            <span className="ip-bounce" style={{ animationDelay: "150ms" }} />
            <span className="ip-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="ip-screen">
        <div className="ip-error">
          <div className="ip-error-icon">!</div>
          <h2 className="ip-error-title">Interview not found</h2>
          <p className="ip-error-sub">We couldn't load this interview.</p>
          <button onClick={() => navigate("/dashboard")} className="ip-btn">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const currentQuestion = interview.questions?.[interview.currentQuestion];
  if (!currentQuestion) {
    return <div className="ip-screen ip-white">No question available.</div>;
  }

  return (
    <Step2interview
      user={user}
      interviewData={{
        interviewId: interview._id,
        currentQuestion: interview.currentQuestion,
        totalQuestions: interview.questions.length,
        question: currentQuestion,
        role: interview.role,
        type: interview.type,
      }}
      onAnswerSubmitted={() => fetchInterview(true)}
    />
  );
};

export default InterviewPage;