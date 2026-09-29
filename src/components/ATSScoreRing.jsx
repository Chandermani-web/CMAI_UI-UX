// components/ATSScoreRing.jsx
import { motion } from 'framer-motion';

const RING_SIZE = 72;
const STROKE = 6;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * RADIUS;

const gradeColor = (score) =>
  score >= 90 ? '#22C55E' : score >= 75 ? '#F5A524' : score >= 55 ? '#F59E0B' : '#EF4444';

const ATSScoreRing = ({ score, grade, compact = false, showLabel = true }) => {
  const color = gradeColor(score);
  const offset = CIRC - (Math.max(0, Math.min(100, score)) / 100) * CIRC;

  return (
    <div className={`flex items-center ${compact ? 'gap-2.5' : 'gap-3.5'}`}>
      <div className="relative shrink-0" style={{ width: RING_SIZE, height: RING_SIZE }}>
        <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90">
          <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS} stroke="rgba(255,255,255,0.08)" strokeWidth={STROKE} fill="none" />
          <motion.circle
            cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS} stroke={color} strokeWidth={STROKE} fill="none"
            strokeLinecap="round" strokeDasharray={CIRC}
            initial={{ strokeDashoffset: CIRC }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-bold text-white leading-none">{score}</span>
          <span className="text-[8px] text-white/30 mt-0.5">/ 100</span>
        </div>
      </div>
      {showLabel && (
        <div>
          <p className="text-[10px] font-medium tracking-wider uppercase text-white/40">ATS Score</p>
          <p className="text-sm font-semibold mt-0.5" style={{ color }}>{grade}</p>
        </div>
      )}
    </div>
  );
};

export default ATSScoreRing;