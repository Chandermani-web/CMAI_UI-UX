// utils/resumeATS.js
// A lightweight, transparent ATS-readiness scorer. This doesn't talk to any
// real applicant-tracking software — it encodes the well-documented rules
// that software actually checks for (parseable single-column layout,
// complete contact info, quantified bullets, a real skills list) so a
// person can see exactly why their score is what it is and what to fix
// next. Every check is worth a fixed number of points; the total is 100.

const ACTION_VERBS = [
  'led', 'built', 'launched', 'designed', 'managed', 'improved', 'increased', 'reduced',
  'created', 'implemented', 'developed', 'drove', 'delivered', 'optimized', 'automated',
  'scaled', 'shipped', 'architected', 'mentored', 'negotiated', 'streamlined', 'spearheaded',
  'owned', 'coordinated', 'analyzed', 'migrated', 'founded', 'grew', 'cut', 'saved', 'directed',
];

// Layouts a parser will always read top-to-bottom, left-to-right without
// scrambling column order.
const SINGLE_COLUMN_TEMPLATES = ['classic-ats', 'executive-serif', 'minimal-grid', 'timeline', 'two-tone-header'];

const countWords = (text = '') => text.trim().split(/\s+/).filter(Boolean).length;
const hasNumber = (text = '') => /\d/.test(text);

// Maps each check id to the wizard step where it can be fixed, so the UI
// can send someone straight to the right place.
export const STEP_FOR_CHECK = {
  contact: 'personal',
  summary: 'summary',
  experience: 'experience',
  bullets: 'experience',
  metrics: 'experience',
  verbs: 'experience',
  skills: 'skills',
  education: 'education',
  layout: 'preview',
  projects: 'projects',
};

export function computeATSScore(formData = {}, customization = {}) {
  const { personal = {}, summary = '', experience = [], education = [], skills = [], projects = [] } = formData;
  const checks = [];
  let earned = 0;

  const add = (id, label, points, pass, tip) => {
    earned += pass ? points : 0;
    checks.push({ id, label, points, pass, tip });
  };

  const contactCount = [personal.email, personal.phone, personal.location, personal.linkedin].filter(Boolean).length;
  add('contact', 'Complete contact details', 10, contactCount >= 3,
    'Add your email, phone, and location — an ATS that can\'t confirm who you are will flag the resume.');

  const summaryWords = countWords(summary);
  add('summary', 'Professional summary (30–80 words)', 10, summaryWords >= 20 && summaryWords <= 120,
    summaryWords === 0
      ? 'Add a 2–3 sentence summary near the top — it\'s the first thing both a recruiter and a parser read.'
      : 'Aim for roughly 30–80 words. Too short reads as thin; too long gets skimmed past.');

  const realExperience = experience.filter((e) => e.title && e.company);
  add('experience', 'At least one complete role', 15, realExperience.length >= 1,
    'Add at least one role with a job title and company — this is the section an ATS weighs most heavily.');

  const expWithBullets = realExperience.filter((e) => (e.description || '').split('\n').filter(Boolean).length >= 2);
  add('bullets', 'Every role has 2+ bullet points', 10, realExperience.length > 0 && expWithBullets.length === realExperience.length,
    'Give each role at least 2–4 bullet points — one accomplishment per line.');

  const allBulletLines = realExperience.flatMap((e) => (e.description || '').split('\n').map((l) => l.trim()).filter(Boolean));
  const quantified = allBulletLines.filter(hasNumber).length;
  add('metrics', 'Bullets with numbers or metrics', 15, allBulletLines.length > 0 && quantified / allBulletLines.length >= 0.4,
    'Add numbers — %, $, time saved, team size, users served. "Cut deploy time 70%" beats "Improved deploy process".');

  const verbHits = allBulletLines.filter((line) => ACTION_VERBS.some((v) => line.toLowerCase().startsWith(v))).length;
  add('verbs', 'Bullets open with an action verb', 10, allBulletLines.length > 0 && verbHits / allBulletLines.length >= 0.5,
    'Start bullets with a strong verb — "Led", "Built", "Reduced" — instead of "Responsible for" or "Worked on".');

  add('skills', '6+ relevant skills listed', 15, skills.length >= 6,
    skills.length === 0
      ? 'Add a Skills section — an ATS keyword-matches against it directly.'
      : `Add ${Math.max(0, 6 - skills.length)} more skill${6 - skills.length === 1 ? '' : 's'} — aim for 6–12 total.`);

  add('education', 'Education listed', 10, education.some((e) => e.institution),
    'Add your degree and institution — many ATS filters auto-reject resumes with no education section.');

  const singleColumn = SINGLE_COLUMN_TEMPLATES.includes(customization.templateId);
  add('layout', 'Single-column, parser-safe layout', 10, singleColumn,
    'Multi-column layouts can scramble reading order in older ATS parsers. A single-column template is the safest bet.');

  add('projects', 'Supporting projects', 5, projects.some((p) => p.name),
    'Add a project — especially useful if your experience section is still thin.');

  const score = Math.round(Math.min(100, earned));
  const grade = score >= 90 ? 'Excellent' : score >= 75 ? 'Strong' : score >= 55 ? 'Needs work' : 'At risk';
  const failedChecks = checks.filter((c) => !c.pass).sort((a, b) => b.points - a.points);

  return { score, grade, checks, failedChecks };
}