import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";

import Step3report from "../components/interview/Step3report";
import { getInterview } from "../apis/interview.api";

const InterviewReport = () => {
  const user = useSelector((state) => state.auth.user);

  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState(null);

  const navigate = useNavigate();
  const { id } = useParams();

  const fetchInterview = useCallback(
    async (silent = false) => {
      if (!id) {
        setLoading(false);
        return;
      }

      if (!silent) {
        setLoading(true);
      }

      try {
        const response = await getInterview(id);
        const data = response?.interview;

        if (!data) {
          setInterview(null);
          return;
        }

        setInterview(data);
      } catch (error) {
        console.error("Error fetching interview:", error);

        if (!silent) {
          setInterview(null);
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [id]
  );

  useEffect(() => {
    fetchInterview();
  }, [fetchInterview]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E1013] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#2A2F38] border-t-[#C9A15E] rounded-full animate-spin mx-auto mb-5" />
          <p className="text-[#8B93A1] text-sm font-mono tracking-wide">
            Generating interview report…
          </p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-[#0E1013] flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <h2 className="font-serif text-2xl text-[#EDEEF0] mb-3">
            Report not found
          </h2>
          <p className="text-[#8B93A1] text-sm mb-7 leading-6">
            We couldn't find that interview. It may have been removed, or the link may be incorrect.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-[#C9A15E] text-[#0E1013] px-6 py-3 rounded-xl font-semibold hover:bg-[#D8B074] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A15E]"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return <Step3report report={interview} user={user} />;
};

export default InterviewReport;