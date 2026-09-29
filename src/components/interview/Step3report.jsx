import React from "react";
import { useNavigate } from "react-router-dom";
import { generateInterviewReportPDF } from "../../utils/generateInterviewReportPDF";

/* ============================================================
   ICONS — small, single-weight, no emoji
============================================================ */

const CheckIcon = (props) => (
  <svg viewBox="0 0 20 20" fill="none" {...props}>
    <path
      d="M4 10.5L8 14.5L16 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const XIcon = (props) => (
  <svg viewBox="0 0 20 20" fill="none" {...props}>
    <path
      d="M5 5L15 15M15 5L5 15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const AlertIcon = (props) => (
  <svg viewBox="0 0 20 20" fill="none" {...props}>
    <path
      d="M10 3L18 17H2L10 3Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M10 8V11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="10" cy="14" r="0.9" fill="currentColor" />
  </svg>
);

const ArrowLeftIcon = (props) => (
  <svg viewBox="0 0 20 20" fill="none" {...props}>
    <path
      d="M12 4L6 10L12 16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DownloadIcon = (props) => (
  <svg viewBox="0 0 20 20" fill="none" {...props}>
    <path
      d="M10 3V13M10 13L6 9M10 13L14 9"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M4 16.5H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

/* ============================================================
   PRIMITIVES
============================================================ */

const ScoreGauge = ({ score }) => {
  const clamped = Math.min(Math.max(Number(score) || 0, 0), 100);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  const grade =
    clamped >= 90 ? "A" : clamped >= 80 ? "B+" : clamped >= 70 ? "B" : clamped >= 60 ? "C" : "D";

  return (
    <div className="relative w-[136px] h-[136px] shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#262B34" strokeWidth="7" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#C9A15E"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-4xl font-medium text-[#EDEEF0] tabular-nums">
          {Math.round(clamped)}
        </span>
        <span className="font-mono text-[10px] tracking-[0.25em] text-[#8B93A1] uppercase mt-1">
          Grade {grade}
        </span>
      </div>
    </div>
  );
};

const StatChip = ({ label, value }) => (
  <div className="flex flex-col px-6 py-4 first:pl-0 last:pr-0">
    <span className="font-mono text-[10px] tracking-[0.2em] text-[#5B6270] uppercase mb-1.5">
      {label}
    </span>
    <span className="font-serif text-lg text-[#EDEEF0] capitalize leading-none">
      {value}
    </span>
  </div>
);

const MetricBar = ({ label, value }) => {
  const clamped = Math.min(Math.max(Number(value) || 0, 0), 100);
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-[13px] text-[#8B93A1]">{label}</span>
        <span className="font-mono text-[13px] text-[#EDEEF0] tabular-nums">{clamped}</span>
      </div>
      <div className="w-full bg-[#262B34] h-[5px] rounded-full overflow-hidden">
        <div
          className="bg-[#C9A15E] h-full rounded-full"
          style={{ width: `${clamped}%`, transition: "width 700ms ease" }}
        />
      </div>
    </div>
  );
};

const SectionHeading = ({ eyebrow, title }) => (
  <div className="mb-6">
    {eyebrow && (
      <p className="font-mono text-[11px] tracking-[0.22em] text-[#5B6270] uppercase mb-2">
        {eyebrow}
      </p>
    )}
    <h2 className="font-serif text-2xl text-[#EDEEF0]">{title}</h2>
  </div>
);

/* ============================================================
   REPORT
============================================================ */

const Step3report = ({ report, user }) => {
  const navigate = useNavigate();

  if (!report) {
    return (
      <div className="min-h-screen bg-[#0E1013] flex items-center justify-center">
        <div className="text-center">
          <div className="w-9 h-9 border-2 border-[#2A2F38] border-t-[#C9A15E] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#8B93A1] text-sm">Loading interview report…</p>
        </div>
      </div>
    );
  }

  const questions = report.questions || [];
  const strengths = report.strengths || [];
  const weaknesses = report.weaknesses || [];
  const recommendations = report.recommendations || [];
  const overallScore = Number(report.overallScore) || 0;

  return (
    <div className="min-h-screen bg-[#0E1013] text-[#EDEEF0] pb-24">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .font-serif { font-family: 'Source Serif 4', Georgia, serif; }
        body, .font-sans-report { font-family: 'Inter', system-ui, sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', 'SF Mono', monospace; }
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>

      {/* ============================================================
          HEADER / LETTERHEAD
      ============================================================ */}
      <header className="px-5 md:px-10 pt-8 border-b border-[#1F232B]">
        <div className="max-w-[1200px] mx-auto pb-8">
          <div className="flex items-start justify-between gap-6 mb-8 no-print">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-sm text-[#8B93A1] hover:text-[#EDEEF0] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C9A15E] rounded-sm"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to dashboard
            </button>

            <button
              onClick={() => generateInterviewReportPDF(report)}
              className="inline-flex items-center gap-2 border border-[#2A2F38] text-[#EDEEF0] px-4 py-2 rounded-lg text-sm font-medium hover:border-[#C9A15E] hover:text-[#C9A15E] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C9A15E]"
            >
              <DownloadIcon className="w-4 h-4" />
              Download PDF
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12">
            <ScoreGauge score={overallScore} />

            <div className="flex-1">
              <p className="font-mono text-[11px] tracking-[0.22em] text-[#C9A15E] uppercase mb-2">
                AI Evaluation
              </p>
              <h1 className="font-serif text-3xl md:text-4xl text-[#EDEEF0] mb-1">
                Interview Report
              </h1>
              <p className="text-[#8B93A1] text-sm mb-5">
                {report.role || "Technical Interview"} — Performance Analysis
              </p>

              <div className="flex flex-wrap divide-x divide-[#1F232B] -mx-6">
                <StatChip label="Questions" value={questions.length} />
                <StatChip label="Status" value={report.status || "Completed"} />
                <StatChip label="Role" value={report.role || "General"} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-5 md:px-10 mt-10 max-w-[1200px] mx-auto">
        {/* ====================================================
            SUMMARY
        ==================================================== */}
        <section className="mb-10">
          <SectionHeading eyebrow="Abstract" title="Summary" />
          <p className="text-[#B7BCC5] leading-8">
            {report.summary || "No interview summary was generated."}
          </p>
        </section>

        {/* ====================================================
            STRENGTHS / WEAKNESSES
        ==================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-10 mb-10 pt-10 border-t border-[#1F232B]">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <span className="w-7 h-7 rounded-full bg-[#16211B] text-[#6FAE86] flex items-center justify-center">
                <CheckIcon className="w-4 h-4" />
              </span>
              <h2 className="font-serif text-xl text-[#EDEEF0]">Strengths</h2>
            </div>

            <div className="space-y-3">
              {strengths.length ? (
                strengths.map((strength, index) => (
                  <div key={index} className="flex gap-3 py-3 border-b border-[#1A1D24] last:border-0">
                    <CheckIcon className="w-4 h-4 mt-0.5 text-[#6FAE86] shrink-0" />
                    <p className="text-[#B7BCC5] text-[15px] leading-6">{strength}</p>
                  </div>
                ))
              ) : (
                <p className="text-[#5B6270] text-sm">No strengths were identified.</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <span className="w-7 h-7 rounded-full bg-[#241715] text-[#C97B6B] flex items-center justify-center">
                <XIcon className="w-4 h-4" />
              </span>
              <h2 className="font-serif text-xl text-[#EDEEF0]">Areas to Improve</h2>
            </div>

            <div className="space-y-3">
              {weaknesses.length ? (
                weaknesses.map((weakness, index) => (
                  <div key={index} className="flex gap-3 py-3 border-b border-[#1A1D24] last:border-0">
                    <AlertIcon className="w-4 h-4 mt-0.5 text-[#C97B6B] shrink-0" />
                    <p className="text-[#B7BCC5] text-[15px] leading-6">{weakness}</p>
                  </div>
                ))
              ) : (
                <p className="text-[#5B6270] text-sm">No weaknesses were identified.</p>
              )}
            </div>
          </div>
        </section>

        {/* ====================================================
            RECOMMENDATIONS
        ==================================================== */}
        <section className="mb-10 pt-10 border-t border-[#1F232B]">
          <SectionHeading eyebrow="Next steps" title="Recommendations" />

          <div className="space-y-3">
            {recommendations.length ? (
              recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 py-4 border-b border-[#1A1D24] last:border-0"
                >
                  <span className="font-mono text-xs text-[#0E1013] bg-[#C9A15E] w-6 h-6 rounded-full flex items-center justify-center font-semibold shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-[#B7BCC5] text-[15px] leading-6">{recommendation}</p>
                </div>
              ))
            ) : (
              <p className="text-[#5B6270] text-sm">No recommendations available.</p>
            )}
          </div>
        </section>

        {/* ====================================================
            QUESTION WISE ANALYSIS
        ==================================================== */}
        <section className="pt-10 border-t border-[#1F232B]">
          <SectionHeading eyebrow={`${questions.length} entries`} title="Question-by-Question Analysis" />

          <div className="space-y-6">
            {questions.map((item, index) => {
              const feedback = item.feedback || {};
              const score = Number(feedback.score) || 0;
              const qNumber = String(index + 1).padStart(2, "0");

              return (
                <article
                  key={index}
                  className="bg-[#171A20] border border-[#232830] rounded-2xl p-7 md:p-8"
                >
                  <div className="flex items-start justify-between gap-6 mb-6">
                    <div>
                      <p className="font-mono text-[11px] tracking-[0.2em] text-[#C9A15E] uppercase mb-3">
                        Q{qNumber}
                      </p>
                      <h3 className="font-serif text-xl md:text-[22px] leading-8 text-[#EDEEF0]">
                        {item.question}
                      </h3>
                      <span className="inline-flex mt-4 px-3 py-1 rounded-full bg-[#1F232B] text-[#8B93A1] text-xs capitalize border border-[#2A2F38]">
                        {item.difficulty || "N/A"}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-2xl text-[#EDEEF0] tabular-nums">{score}</p>
                      <p className="font-mono text-[10px] tracking-[0.2em] text-[#5B6270] uppercase">
                        Score
                      </p>
                    </div>
                  </div>

                  <div className="mb-7">
                    <p className="font-mono text-[10px] tracking-[0.2em] text-[#5B6270] uppercase mb-2.5">
                      Candidate Answer
                    </p>
                    <div className="bg-[#0E1013] border border-[#1F232B] rounded-xl p-5">
                      <pre className="whitespace-pre-wrap break-words font-sans-report text-[#B7BCC5] text-[15px] leading-7">
                        {item.userAnswer || "No answer provided"}
                      </pre>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5 mb-7">
                    <MetricBar label="Correctness" value={feedback.correctness} />
                    <MetricBar label="Clarity" value={feedback.clarity} />
                    <MetricBar label="Relevance" value={feedback.relevance} />
                    <MetricBar label="Detail" value={feedback.detail} />
                    <MetricBar label="Communication" value={feedback.communication} />
                    <MetricBar label="Efficiency" value={feedback.efficiency} />
                    <MetricBar label="Creativity" value={feedback.creativity} />
                    <MetricBar label="Problem Solving" value={feedback.problemSolving} />
                  </div>

                  <div className="pt-6 border-t border-[#1F232B]">
                    <p className="font-mono text-[10px] tracking-[0.2em] text-[#6FAE86] uppercase mb-3">
                      AI Feedback
                    </p>
                    <p className="text-[#B7BCC5] text-[15px] leading-7">
                      {feedback.feedback || "No feedback available."}
                    </p>
                  </div>

                  {feedback.improvement?.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-[#1F232B]">
                      <p className="font-mono text-[10px] tracking-[0.2em] text-[#C97B6B] uppercase mb-3">
                        Suggested Improvements
                      </p>
                      <div className="space-y-2.5">
                        {feedback.improvement.map((improvement, improvementIndex) => (
                          <div key={improvementIndex} className="flex gap-2.5">
                            <AlertIcon className="w-4 h-4 mt-0.5 text-[#C97B6B] shrink-0" />
                            <p className="text-[#B7BCC5] text-[15px] leading-6">{improvement}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <div className="flex justify-center mt-12 no-print">
          <button
            onClick={() => generateInterviewReportPDF(report)}
            className="inline-flex items-center gap-2 bg-[#C9A15E] text-[#0E1013] px-8 py-4 rounded-xl font-semibold hover:bg-[#D8B074] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A15E]"
          >
            <DownloadIcon className="w-4 h-4" />
            Download Full Report PDF
          </button>
        </div>
      </main>
    </div>
  );
};

export default Step3report;