import React, { useMemo } from "react";

const PERFORMANCE_KEYS = [
  "correctness",
  "clarity",
  "relevance",
  "detail",
  "efficiency",
  "communication",
  "problemSolving",
  "creativity",
];

const PERFORMANCE_LABELS = {
  correctness: "Correctness",
  clarity: "Clarity",
  relevance: "Relevance",
  detail: "Detail",
  efficiency: "Efficiency",
  communication: "Communication",
  problemSolving: "Problem Solving",
  creativity: "Creativity",
};

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const getScore = (interview) => {
  const score = Number(interview?.overallScore);

  return Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : 0;
};

const isCompleted = (interview) => {
  return String(interview?.status || "").toLowerCase() === "completed";
};

const isAnswered = (question) => {
  const answer = question?.userAnswer;

  if (typeof answer !== "string") return Boolean(answer);

  return answer.trim().length > 0;
};

const getInterviewType = (interview) => {
  return String(
    interview?.type ||
      interview?.interviewType ||
      "technical"
  ).toLowerCase();
};

// --------------------------------------------------
// Calculate performance from completed interviews
// --------------------------------------------------

const calculatePerformance = (completedInterviews) => {
  const totals = {
    correctness: 0,
    clarity: 0,
    relevance: 0,
    detail: 0,
    efficiency: 0,
    communication: 0,
    problemSolving: 0,
    creativity: 0,
  };

  const counts = {
    correctness: 0,
    clarity: 0,
    relevance: 0,
    detail: 0,
    efficiency: 0,
    communication: 0,
    problemSolving: 0,
    creativity: 0,
  };

  completedInterviews.forEach((interview) => {
    const questions = Array.isArray(interview?.questions)
      ? interview.questions
      : [];

    questions.forEach((question) => {
      const feedback = question?.feedback;

      if (!feedback) return;

      PERFORMANCE_KEYS.forEach((key) => {
        const value = Number(feedback[key]);

        if (Number.isFinite(value)) {
          totals[key] += value;
          counts[key] += 1;
        }
      });
    });
  });

  return PERFORMANCE_KEYS.reduce((result, key) => {
    result[key] =
      counts[key] > 0
        ? Math.round(totals[key] / counts[key])
        : 0;

    return result;
  }, {});
};

// --------------------------------------------------
// Stat Card
// --------------------------------------------------

const StatCard = ({ label, value, description }) => {
  return (
    <div className="rounded-2xl bg-[#161615] border border-white/10 p-6 shadow-lg shadow-black/20">
      <p className="text-xs tracking-widest uppercase text-white/40">
        {label}
      </p>

      <p className="mt-3 font-serif text-3xl md:text-4xl font-bold text-white">
        {value}
      </p>

      <p className="mt-2 text-xs text-white/40">
        {description}
      </p>
    </div>
  );
};

// --------------------------------------------------
// Radar Chart
// --------------------------------------------------

const RadarChart = ({ values }) => {
  const size = 420;
  const center = size / 2;
  const radius = 135;

  const labels = PERFORMANCE_KEYS.map(
    (key) => PERFORMANCE_LABELS[key]
  );

  const angleStep = (Math.PI * 2) / labels.length;

  const getPoint = (index, value) => {
    const angle = angleStep * index - Math.PI / 2;

    const r = (radius * value) / 100;

    return {
      x: center + Math.cos(angle) * r,
      y: center + Math.sin(angle) * r,
    };
  };

  const getOuterPoint = (index) => {
    const angle = angleStep * index - Math.PI / 2;

    return {
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
    };
  };

  const getPolygon = (percentage) => {
    return PERFORMANCE_KEYS.map((key, index) => {
      const point = getPoint(index, percentage);

      return `${point.x},${point.y}`;
    }).join(" ");
  };

  const performancePolygon = PERFORMANCE_KEYS.map((key, index) => {
    const point = getPoint(index, values[key] || 0);

    return `${point.x},${point.y}`;
  }).join(" ");

  return (
    <div className="w-full flex justify-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[430px] h-auto"
      >
        {/* Grid */}
        {[20, 40, 60, 80, 100].map((level) => (
          <polygon
            key={level}
            points={getPolygon(level)}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {PERFORMANCE_KEYS.map((key, index) => {
          const point = getOuterPoint(index);

          return (
            <line
              key={key}
              x1={center}
              y1={center}
              x2={point.x}
              y2={point.y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
          );
        })}

        {/* Performance area */}
        <polygon
          points={performancePolygon}
          fill="rgba(255,255,255,0.12)"
          stroke="rgba(255,255,255,0.95)"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Points */}
        {PERFORMANCE_KEYS.map((key, index) => {
          const point = getPoint(index, values[key] || 0);

          return (
            <circle
              key={key}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="white"
            />
          );
        })}

        {/* Labels */}
        {PERFORMANCE_KEYS.map((key, index) => {
          const point = getOuterPoint(index);

          const angle = angleStep * index - Math.PI / 2;

          const labelDistance = 30;

          const x =
            point.x +
            Math.cos(angle) * labelDistance;

          const y =
            point.y +
            Math.sin(angle) * labelDistance;

          let textAnchor = "middle";

          if (x < center - 20) {
            textAnchor = "end";
          }

          if (x > center + 20) {
            textAnchor = "start";
          }

          return (
            <text
              key={key}
              x={x}
              y={y}
              fill="rgba(255,255,255,0.55)"
              fontSize="11"
              textAnchor={textAnchor}
              dominantBaseline="middle"
            >
              {labels[index]}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

// --------------------------------------------------
// Interview Stats
// --------------------------------------------------

const InterviewStats = ({ interviews = [] }) => {
  const stats = useMemo(() => {
    const safeInterviews = Array.isArray(interviews)
      ? interviews
      : [];

    const completedInterviews = safeInterviews.filter(
      isCompleted
    );

    const totalInterviews = safeInterviews.length;

    const questionsSolved = safeInterviews.reduce(
      (total, interview) => {
        const questions = Array.isArray(interview?.questions)
          ? interview.questions
          : [];

        return (
          total +
          questions.filter(isAnswered).length
        );
      },
      0
    );

    const averageScore =
      completedInterviews.length > 0
        ? Math.round(
            completedInterviews.reduce(
              (total, interview) =>
                total + getScore(interview),
              0
            ) / completedInterviews.length
          )
        : 0;

    const performance =
      calculatePerformance(completedInterviews);

    const technicalInterviews =
      completedInterviews.filter(
        (interview) =>
          getInterviewType(interview) === "technical"
      );

    const hrInterviews =
      completedInterviews.filter(
        (interview) =>
          getInterviewType(interview) === "hr"
      );

    const technicalPerformance =
      calculatePerformance(technicalInterviews);

    const hrPerformance =
      calculatePerformance(hrInterviews);

    return {
      totalInterviews,
      questionsSolved,
      completedInterviews,
      completedCount: completedInterviews.length,
      averageScore,
      performance,
      technicalInterviews,
      hrInterviews,
      technicalPerformance,
      hrPerformance,
    };
  }, [interviews]);

  return (
    <section className="mt-12">
      {/* ----------------------------------------- */}
      {/* Stats */}
      {/* ----------------------------------------- */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          label="Total Interviews"
          value={stats.totalInterviews}
          description="All interviews created"
        />

        <StatCard
          label="Questions Solved"
          value={stats.questionsSolved}
          description="Answered across all interviews"
        />

        <StatCard
          label="Completed"
          value={stats.completedCount}
          description={`${stats.totalInterviews} total interviews`}
        />

        <StatCard
          label="Average Score"
          value={`${stats.averageScore}/100`}
          description="Completed interviews only"
        />
      </div>

      {/* ----------------------------------------- */}
      {/* Performance */}
      {/* ----------------------------------------- */}

      <div className="mt-10">
        <div className="mb-4">
          <p className="text-xs font-medium tracking-widest uppercase text-white/30">
            Performance
          </p>

          <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mt-1">
            Interview History
          </h2>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* Technical */}
          <div className="rounded-2xl bg-[#161615] border border-white/10 p-6 min-h-[520px] flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">
                  Technical Interviews
                </h3>

                <p className="text-xs text-white/40 mt-1">
                  {stats.technicalInterviews.length} completed
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-white/40">
                  Average
                </p>

                <p className="text-xl font-bold text-white">
                  {stats.technicalInterviews.length
                    ? Math.round(
                        stats.technicalInterviews.reduce(
                          (sum, interview) =>
                            sum + getScore(interview),
                          0
                        ) /
                          stats.technicalInterviews.length
                      )
                    : 0}
                  /100
                </p>
              </div>
            </div>

            {stats.technicalInterviews.length > 0 ? (
              <RadarChart
                values={stats.technicalPerformance}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-white/30">
                No completed technical interviews yet.
              </div>
            )}
          </div>

          {/* HR */}
          <div className="rounded-2xl bg-[#161615] border border-white/10 p-6 min-h-[520px] flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">
                  HR Interviews
                </h3>

                <p className="text-xs text-white/40 mt-1">
                  {stats.hrInterviews.length} completed
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-white/40">
                  Average
                </p>

                <p className="text-xl font-bold text-white">
                  {stats.hrInterviews.length
                    ? Math.round(
                        stats.hrInterviews.reduce(
                          (sum, interview) =>
                            sum + getScore(interview),
                          0
                        ) /
                          stats.hrInterviews.length
                      )
                    : 0}
                  /100
                </p>
              </div>
            </div>

            {stats.hrInterviews.length > 0 ? (
              <RadarChart
                values={stats.hrPerformance}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-white/30">
                No completed HR interviews yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InterviewStats;