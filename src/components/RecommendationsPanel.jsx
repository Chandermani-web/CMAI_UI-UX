// components/RecommendationsPanel.jsx
import { motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiArrowRight, FiPlusCircle } from 'react-icons/fi';
import ATSScoreRing from './ATSScoreRing';
import { STEP_FOR_CHECK } from '../utils/resumeATS';

// "Nice to have" gaps that aren't part of the ATS score itself but make a
// real difference to a human reader — surfaced separately so the two kinds
// of feedback (parser-readiness vs. polish) don't get muddled together.
const emptyFieldHints = (formData) => {
  const { personal, projects, skills, experience } = formData;
  const hints = [];
  if (!personal.linkedin) hints.push({ id: 'linkedin', step: 'personal', label: 'No LinkedIn added', tip: 'A LinkedIn link gives a recruiter a second, richer view of your background.' });
  if (!personal.portfolio) hints.push({ id: 'portfolio', step: 'personal', label: 'No portfolio or GitHub added', tip: 'Especially valuable for technical or creative roles — link your best work.' });
  if (!projects.some((p) => p.name)) hints.push({ id: 'projects-empty', step: 'projects', label: 'Projects section is empty', tip: 'Even one side project shows initiative beyond the day job.' });
  if (skills.length > 0 && skills.length < 6) hints.push({ id: 'more-skills', step: 'skills', label: 'Skills list is thin', tip: `You have ${skills.length} — aim for 6–12 so you match more keyword searches.` });
  if (experience.some((e) => (e.title || e.company) && !e.location)) hints.push({ id: 'exp-location', step: 'experience', label: 'A role is missing a location', tip: 'Add "City, State" or "Remote" to each role for a complete, professional look.' });
  return hints;
};

const RecommendationsPanel = ({ formData, atsResult, onNavigate }) => {
  const { score, grade, failedChecks } = atsResult;
  const hints = emptyFieldHints(formData);
  const allGood = failedChecks.length === 0 && hints.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="bg-[#161615] rounded-3xl p-6 shadow-xl shadow-black/10 no-print mt-6"
    >
      <div className="flex items-center justify-between flex-wrap gap-4 pb-5 border-b border-white/[0.06]">
        <div>
          <span className="font-mono-r text-[11px] tracking-[0.2em] text-[#F5A524] uppercase">Resume Health</span>
          <h2 className="font-serif text-xl font-bold text-white mt-1">How this reads to an ATS</h2>
          <p className="text-white/40 text-sm mt-1 max-w-md">
            {allGood
              ? 'Every check passes — this resume is ready to submit.'
              : 'A few quick fixes would push this higher. Tap any card to jump there.'}
          </p>
        </div>
        <ATSScoreRing score={score} grade={grade} />
      </div>

      {allGood ? (
        <div className="flex items-center gap-3 py-6">
          <FiCheckCircle size={22} className="text-emerald-400 shrink-0" />
          <p className="text-sm text-white/60">Contact details, experience, skills, and layout all check out. Nice work.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
          {failedChecks.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onNavigate?.(STEP_FOR_CHECK[c.id])}
              className="text-left bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 rounded-2xl p-4 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2">
                <FiAlertCircle size={15} className="text-[#F5A524] mt-0.5 shrink-0" />
                <span className="text-[10px] text-white/25 font-mono-r shrink-0">+{c.points} pts</span>
              </div>
              <p className="text-sm font-medium text-white mt-2">{c.label}</p>
              <p className="text-xs text-white/40 mt-1 leading-relaxed">{c.tip}</p>
              <span className="inline-flex items-center gap-1 text-[11px] text-[#F5A524] mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                Fix it <FiArrowRight size={11} />
              </span>
            </button>
          ))}
          {hints.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => onNavigate?.(h.step)}
              className="text-left bg-white/[0.03] hover:bg-white/[0.06] border border-dashed border-white/10 hover:border-white/25 rounded-2xl p-4 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2">
                <FiPlusCircle size={15} className="text-white/30 mt-0.5 shrink-0" />
              </div>
              <p className="text-sm font-medium text-white/80 mt-2">{h.label}</p>
              <p className="text-xs text-white/40 mt-1 leading-relaxed">{h.tip}</p>
              <span className="inline-flex items-center gap-1 text-[11px] text-[#F5A524] mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                Add it <FiArrowRight size={11} />
              </span>
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default RecommendationsPanel;