import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const safeText = (value) => {
  if (value === null || value === undefined) return "";

  return String(value)
    // Replace box-drawing characters that default jsPDF fonts may not support
    .replace(/[┌┐└┘─│├┤┬┴┼]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const getFeedbackAverage = (feedback) => {
  if (!feedback) return 0;

  const fields = [
    "correctness",
    "clarity",
    "relevance",
    "detail",
    "communication",
    "efficiency",
    "creativity",
    "problemSolving",
  ];

  const values = fields
    .map((field) => Number(feedback[field]))
    .filter((value) => !Number.isNaN(value) && value > 0);

  if (!values.length) {
    return Number(feedback.score) || 0;
  }

  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length
  );
};

export const generateInterviewReportPDF = (interview) => {
  if (!interview) {
    console.error("Interview report data is missing.");
    return;
  }

  const doc = new jsPDF("p", "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 15;
  let y = 18;

  const primary = [20, 22, 30];
  const green = [34, 197, 94];
  const red = [239, 68, 68];
  const gray = [100, 100, 100];

  const questions = interview.questions || [];
  const strengths = interview.strengths || [];
  const weaknesses = interview.weaknesses || [];
  const recommendations = interview.recommendations || [];

  const addFooter = () => {
    const currentPage = doc.internal.getNumberOfPages();

    for (let i = 1; i <= currentPage; i++) {
      doc.setPage(i);

      doc.setFontSize(8);
      doc.setTextColor(130, 130, 130);

      doc.text(
        `Interview Report • Page ${i} of ${currentPage}`,
        pageWidth / 2,
        pageHeight - 8,
        {
          align: "center",
        }
      );
    }
  };

  const addSectionTitle = (title) => {
    if (y > pageHeight - 35) {
      doc.addPage();
      y = 18;
    }

    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primary);
    doc.text(title, margin, y);

    y += 8;
  };

  const addText = (text, options = {}) => {
    const {
      fontSize = 10,
      color = [50, 50, 50],
      bold = false,
      lineHeight = 5,
    } = options;

    const content = safeText(text);

    if (!content) return;

    doc.setFontSize(fontSize);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(...color);

    const lines = doc.splitTextToSize(content, pageWidth - margin * 2);

    if (y + lines.length * lineHeight > pageHeight - 20) {
      doc.addPage();
      y = 18;
    }

    doc.text(lines, margin, y);

    y += lines.length * lineHeight + 3;
  };

  // ============================================================
  // HEADER
  // ============================================================

  doc.setFillColor(...primary);
  doc.rect(0, 0, pageWidth, 42, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Interview Report", margin, 17);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${safeText(interview.role || "Technical Interview")} • ${safeText(
      interview.type || "Interview"
    )}`,
    margin,
    25
  );

  doc.setFontSize(9);
  doc.text(
    interview.status
      ? `Status: ${safeText(interview.status).toUpperCase()}`
      : "Interview completed",
    margin,
    32
  );

  y = 53;

  // ============================================================
  // OVERVIEW
  // ============================================================

  addSectionTitle("Performance Overview");

  autoTable(doc, {
    startY: y,
    margin: {
      left: margin,
      right: margin,
    },
    head: [["Overall Score", "Questions", "Status", "Role"]],
    body: [
      [
        `${Number(interview.overallScore) || 0}/100`,
        String(questions.length),
        safeText(interview.status || "Completed"),
        safeText(interview.role || "Technical"),
      ],
    ],
    theme: "grid",
    headStyles: {
      fillColor: primary,
      textColor: 255,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 10,
      cellPadding: 4,
    },
  });

  y = doc.lastAutoTable.finalY + 12;

  // ============================================================
  // SUMMARY
  // ============================================================

  addSectionTitle("Interview Summary");

  addText(interview.summary || "No summary available.", {
    fontSize: 10,
    color: [55, 55, 55],
    lineHeight: 5,
  });

  y += 3;

  // ============================================================
  // STRENGTHS
  // ============================================================

  addSectionTitle("Strengths");

  strengths.forEach((strength) => {
    addText(`• ${strength}`, {
      fontSize: 10,
      color: [30, 100, 55],
    });
  });

  y += 3;

  // ============================================================
  // WEAKNESSES
  // ============================================================

  addSectionTitle("Areas to Improve");

  weaknesses.forEach((weakness) => {
    addText(`• ${weakness}`, {
      fontSize: 10,
      color: [170, 45, 45],
    });
  });

  y += 3;

  // ============================================================
  // RECOMMENDATIONS
  // ============================================================

  addSectionTitle("Recommendations");

  recommendations.forEach((recommendation, index) => {
    addText(`${index + 1}. ${recommendation}`, {
      fontSize: 10,
      color: [55, 55, 55],
    });
  });

  // ============================================================
  // QUESTION ANALYSIS
  // ============================================================

  if (y > pageHeight - 50) {
    doc.addPage();
    y = 18;
  }

  doc.addPage();
  y = 18;

  addSectionTitle("Question Wise Analysis");

  questions.forEach((item, index) => {
    if (y > pageHeight - 65) {
      doc.addPage();
      y = 18;
    }

    const feedback = item.feedback || {};

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primary);

    doc.text(`Question ${index + 1}`, margin, y);
    y += 7;

    addText(item.question || "Question unavailable.", {
      fontSize: 10,
      bold: true,
      color: [35, 35, 35],
      lineHeight: 5,
    });

    addText(`Difficulty: ${safeText(item.difficulty || "N/A")}`, {
      fontSize: 9,
      color: gray,
    });

    addText("Candidate Answer:", {
      fontSize: 9,
      bold: true,
      color: primary,
    });

    addText(item.userAnswer || "No answer provided.", {
      fontSize: 9,
      color: [70, 70, 70],
      lineHeight: 4.5,
    });

    const score = Number(feedback.score) || 0;

    autoTable(doc, {
      startY: y,
      margin: {
        left: margin,
        right: margin,
      },
      head: [
        [
          "Score",
          "Correctness",
          "Clarity",
          "Relevance",
          "Detail",
          "Communication",
        ],
      ],
      body: [
        [
          score,
          feedback.correctness ?? 0,
          feedback.clarity ?? 0,
          feedback.relevance ?? 0,
          feedback.detail ?? 0,
          feedback.communication ?? 0,
        ],
      ],
      theme: "grid",
      headStyles: {
        fillColor: primary,
        textColor: 255,
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 8,
      },
    });

    y = doc.lastAutoTable.finalY + 6;

    const average = getFeedbackAverage(feedback);

    addText(`Performance Average: ${average}/100`, {
      fontSize: 9,
      bold: true,
      color: average >= 70 ? green : red,
    });

    addText(feedback.feedback || "No feedback available.", {
      fontSize: 9,
      color: [65, 65, 65],
      lineHeight: 4.5,
    });

    if (feedback.improvement?.length) {
      addText("Suggested Improvements:", {
        fontSize: 9,
        bold: true,
        color: primary,
      });

      feedback.improvement.forEach((improvement) => {
        addText(`• ${improvement}`, {
          fontSize: 9,
          color: [80, 80, 80],
        });
      });
    }

    y += 5;
  });

  // ============================================================
  // FINAL PAGE
  // ============================================================

  if (y > pageHeight - 45) {
    doc.addPage();
    y = 18;
  }

  addSectionTitle("Final Assessment");

  addText(
    `Overall Score: ${Number(interview.overallScore) || 0}/100`,
    {
      fontSize: 13,
      bold: true,
      color: primary,
    }
  );

  addText(
    `The interview was completed with ${questions.length} questions. The assessment above summarizes the candidate's technical performance, strengths, weaknesses, and recommended areas for improvement.`,
    {
      fontSize: 10,
      color: [65, 65, 65],
    }
  );

  addFooter();

  const fileName = `Interview_Report_${safeText(
    interview.role || "Technical"
  ).replace(/\s+/g, "_")}.pdf`;

  doc.save(fileName);
};