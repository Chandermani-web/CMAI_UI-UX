// pages/ResumeBuilder.jsx
import { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GiArtificialHive } from 'react-icons/gi';
import {
  FiUser, FiFileText, FiBriefcase, FiBookOpen, FiCode, FiFolder,
  FiEye, FiArrowLeft, FiArrowRight, FiPlus, FiTrash2, FiDownload,
  FiCheck, FiMove, FiType, FiLayout, FiSliders, FiDroplet,
  FiAlignLeft, FiAlignCenter, FiAlignRight, FiMinimize,
  FiColumns, FiSquare, FiCircle, FiList, FiChevronDown, FiChevronUp,
  FiRefreshCw, FiZap, FiAward, FiStar, FiTrendingUp, FiSun, FiMoon,
  FiEdit3, FiZoomIn, FiZoomOut, FiTarget, FiArrowRightCircle,
} from 'react-icons/fi';

import { TEMPLATES, getTemplateById } from '../components/resumeTemplates';
import {
  FONT_OPTIONS, SIZE_OPTIONS, DENSITY_OPTIONS, COLOR_OPTIONS, BULLET_OPTIONS,
  DEFAULT_CUSTOMIZATION, buildTheme,
} from '../utils/resumeTheme';
import { DEFAULT_SECTION_ORDER, SECTION_LABELS, normalizeSectionOrder } from '../utils/resumeSections';
import { computeATSScore, STEP_FOR_CHECK } from '../utils/resumeATS';
import ATSScoreRing from '../components/ATSScoreRing';
import RecommendationsPanel from '../components/RecommendationsPanel';

const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const emptyExperience = () => ({ id: genId(), title: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '' });
const emptyEducation = () => ({ id: genId(), institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' });
const emptyProject = () => ({ id: genId(), name: '', techStack: '', description: '', link: '' });

const STEPS = [
  { id: 'personal', label: 'Personal Info', icon: FiUser },
  { id: 'summary', label: 'Summary', icon: FiFileText },
  { id: 'experience', label: 'Experience', icon: FiBriefcase },
  { id: 'education', label: 'Education', icon: FiBookOpen },
  { id: 'skills', label: 'Skills', icon: FiCode },
  { id: 'projects', label: 'Projects', icon: FiFolder },
  { id: 'preview', label: 'Design & Preview', icon: FiEye },
];

const inputClass = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#F5A524]/50 focus:ring-1 focus:ring-[#F5A524]/20 transition-colors';
const labelClass = 'text-xs font-medium tracking-wider uppercase text-white/40 mb-2 block';

const Field = ({ label, children }) => (
  <div>
    <label className={labelClass}>{label}</label>
    {children}
  </div>
);

/* ------------------------------------------------------------------ */
/* Fonts + print CSS                                                   */
/* ------------------------------------------------------------------ */
const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Playfair+Display:wght@400;600;700&family=Source+Sans+3:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    .font-mono-r { font-family: 'IBM Plex Mono', 'SF Mono', monospace; }
    .resume-page {
      background: #fff;
      color: #1a1a1a;
      box-sizing: border-box;
    }
    .resume-page * { box-sizing: border-box; }
    .resume-page h1, .resume-page h2, .resume-page h3, .resume-page h4, .resume-page p, .resume-page ul {
      margin: 0;
    }
    .resume-page ul { padding-left: 1.05em; }
    @media print {
      @page { margin: 0; }
      body * { visibility: hidden; }
      #resume-preview, #resume-preview * { visibility: visible; }
      #resume-preview {
        position: absolute; left: 0; top: 0;
        margin: 0 !important;
        box-shadow: none !important;
        transform: none !important;
        border-radius: 0 !important;
      }
      .no-print { display: none !important; }
    }
  `}</style>
);

/* ------------------------------------------------------------------ */
/* Drag reorder                                                        */
/* ------------------------------------------------------------------ */
const SectionOrderList = ({ order, onChange }) => {
  const dragIndex = useRef(null);
  const [overIndex, setOverIndex] = useState(null);

  const handleDrop = () => {
    if (dragIndex.current === null || overIndex === null || dragIndex.current === overIndex) {
      dragIndex.current = null; setOverIndex(null); return;
    }
    const next = [...order];
    const [moved] = next.splice(dragIndex.current, 1);
    next.splice(overIndex, 0, moved);
    onChange(next);
    dragIndex.current = null; setOverIndex(null);
  };

  const move = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-1.5">
      {order.map((key, i) => (
        <div key={key} draggable
          onDragStart={() => (dragIndex.current = i)}
          onDragEnter={() => setOverIndex(i)}
          onDragEnd={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={`flex items-center justify-between gap-2 bg-white/[0.03] border rounded-lg px-3 py-2 cursor-grab active:cursor-grabbing transition-colors ${overIndex === i ? 'border-[#F5A524]/50 bg-[#F5A524]/5' : 'border-white/10'}`}
        >
          <span className="inline-flex items-center gap-2 text-sm text-white/70">
            <FiMove size={13} className="text-white/25" /> {SECTION_LABELS[key]}
          </span>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-white/25 hover:text-white disabled:opacity-20 text-xs px-1.5">&uarr;</button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === order.length - 1} className="text-white/25 hover:text-white disabled:opacity-20 text-xs px-1.5">&darr;</button>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Collapsible                                                         */
/* ------------------------------------------------------------------ */
const CollapsibleSection = ({ title, icon: Icon, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/[0.06] pb-4 last:border-0 last:pb-0">
      <button type="button" onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between py-2 group">
        <span className="inline-flex items-center gap-2 text-xs font-medium tracking-wider uppercase text-white/50 group-hover:text-white/80 transition-colors">
          {Icon && <Icon size={12} />} {title}
        </span>
        {open ? <FiChevronUp size={14} className="text-white/30" /> : <FiChevronDown size={14} className="text-white/30" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PillGroup = ({ options, value, onChange, getLabel = (o) => o.label, getId = (o) => o.id }) => (
  <div className="flex flex-wrap gap-1.5">
    {options.map((opt) => {
      const id = getId(opt);
      const active = id === value;
      return (
        <button key={id} type="button" onClick={() => onChange(id)}
          className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${active ? 'bg-white text-black border-white' : 'text-white/50 border-white/10 hover:text-white hover:border-white/20'}`}>
          {getLabel(opt)}
        </button>
      );
    })}
  </div>
);

const IconPillGroup = ({ options, value, onChange }) => (
  <div className="flex flex-wrap gap-1.5">
    {options.map((opt) => {
      const Icon = opt.icon;
      const active = opt.id === value;
      return (
        <button key={opt.id} type="button" title={opt.label} onClick={() => onChange(opt.id)}
          className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors ${active ? 'bg-white text-black border-white' : 'text-white/40 border-white/10 hover:text-white hover:border-white/25'}`}>
          <Icon size={14} />
        </button>
      );
    })}
  </div>
);

/* ------------------------------------------------------------------ */
/* Template swatch                                                     */
/* ------------------------------------------------------------------ */
const TemplateSwatch = ({ templateId, active }) => {
  const barColor = active ? 'bg-[#F5A524]' : 'bg-white/20';
  const lineColor = 'bg-white/10';
  const common = 'w-full h-14 rounded-lg bg-white/[0.04] p-1.5 flex gap-1';
  const layouts = {
    'classic-ats': (<div className={common + ' flex-col'}><div className={`h-1.5 w-1/2 rounded-sm ${barColor}`} /><div className={`h-1 w-full rounded-sm ${lineColor} mt-1`} /><div className={`h-1 w-full rounded-sm ${lineColor}`} /><div className={`h-1 w-2/3 rounded-sm ${lineColor}`} /></div>),
    'modern-two-column': (<div className={common}><div className={`h-full w-1/3 rounded-sm ${lineColor}`} /><div className="flex-1 flex flex-col gap-1"><div className={`h-1.5 w-2/3 rounded-sm ${barColor}`} /><div className={`h-1 w-full rounded-sm ${lineColor}`} /><div className={`h-1 w-full rounded-sm ${lineColor}`} /></div></div>),
    'executive-serif': (<div className={common + ' flex-col items-center justify-center'}><div className={`h-1.5 w-1/2 rounded-sm ${barColor}`} /><div className={`h-0.5 w-4 rounded-sm ${barColor} mt-1 opacity-60`} /><div className={`h-1 w-2/3 rounded-sm ${lineColor} mt-1`} /></div>),
    timeline: (<div className={common + ' flex-col gap-1 relative'}><div className="absolute left-2 top-1 bottom-1 w-px bg-white/10" />{[0, 1, 2].map((i) => <div key={i} className={`h-1 w-2/3 rounded-sm ${lineColor} ml-3`} />)}</div>),
    'two-tone-header': (<div className={common + ' flex-col p-0 overflow-hidden'}><div className={`h-4 w-full ${barColor}`} /><div className="p-1.5 flex flex-col gap-1"><div className={`h-1 w-full rounded-sm ${lineColor}`} /><div className={`h-1 w-2/3 rounded-sm ${lineColor}`} /></div></div>),
  };
  return layouts[templateId] || <div className={common} />;
};

/* ------------------------------------------------------------------ */
/* ATS-friendliness badge on each template swatch                      */
/* ------------------------------------------------------------------ */
const ATS_FRIENDLY_TEMPLATES = ['classic-ats', 'executive-serif', 'minimal-grid', 'timeline', 'two-tone-header'];

/* ------------------------------------------------------------------ */
/* InlineEditable — click any resume field to edit it in place         */
/* ------------------------------------------------------------------ */
const InlineEditable = ({ value, onChange, placeholder, className = '', multiline = false, rows = 2, style }) => {
  const [editing, setEditing] = useState(false);
  const empty = !value || String(value).trim() === '';

  if (editing) {
    const shared = {
      font: 'inherit',
      color: 'inherit',
      lineHeight: 'inherit',
      background: 'rgba(245,165,36,0.08)',
      border: '1px dashed #F5A524',
      borderRadius: '3px',
      padding: '0 2px',
      outline: 'none',
      width: '100%',
      ...style,
    };
    return multiline ? (
      <textarea autoFocus rows={rows} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        style={{ ...shared, resize: 'vertical' }} className={className} />
    ) : (
      <input autoFocus value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        style={shared} className={className} />
    );
  }

  return (
    <span onClick={() => setEditing(true)} title="Click to edit"
      style={style}
      className={`group/inline relative inline cursor-text rounded-sm -mx-0.5 px-0.5 transition-colors hover:bg-[#F5A524]/12 hover:ring-1 hover:ring-dashed hover:ring-[#F5A524]/50 ${empty ? 'opacity-40 italic' : ''} ${className}`}>
      {empty ? placeholder : value}
      <FiEdit3 size={8} className="absolute -top-1.5 -right-1.5 opacity-0 group-hover/inline:opacity-100 text-[#F5A524] transition-opacity pointer-events-none" />
    </span>
  );
};

/* ------------------------------------------------------------------ */
/* Shared resume helpers                                               */
/* ------------------------------------------------------------------ */
const toBullets = (text) =>
  (text || '').split('\n').map((l) => l.trim()).filter(Boolean);

const SectionHeading = ({ children, theme }) => {
  const style = theme.headingStyle || 'underline';
  const align = theme.headingAlign || 'left';
  const common = {
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: theme.headingCase || 'uppercase',
    color: theme.accentColor,
    textAlign: align,
    marginBottom: '6px',
    marginTop: '14px',
  };

  if (style === 'flat') return <h3 style={common}>{children}</h3>;
  if (style === 'boxed') {
    return (
      <div style={{ textAlign: align, marginTop: common.marginTop, marginBottom: common.marginBottom }}>
        <h3 style={{ ...common, marginTop: 0, marginBottom: 0, display: 'inline-block', backgroundColor: theme.accentColor, color: '#fff', padding: '1px 8px', borderRadius: '3px' }}>
          {children}
        </h3>
      </div>
    );
  }
  if (style === 'accent-bar') {
    return (
      <h3 style={{ ...common, display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ display: 'inline-block', width: '3px', height: '13px', borderRadius: '2px', backgroundColor: theme.accentColor }} />
        {children}
      </h3>
    );
  }
  if (style === 'dotted') {
    return <h3 style={{ ...common, borderBottom: `1px dotted ${theme.accentColor}`, paddingBottom: '2px' }}>{children}</h3>;
  }
  return <h3 style={{ ...common, borderBottom: `1px solid ${theme.accentColor}`, paddingBottom: '2px' }}>{children}</h3>;
};

const BulletList = ({ items, theme }) => {
  const glyph = theme.bulletGlyph || '•';
  if (!items.length) return null;
  return (
    <ul style={{ listStyle: glyph === '∅' ? 'none' : 'disc', marginTop: '4px', fontSize: 'inherit', lineHeight: 'inherit' }} className="text-black/85">
      {items.map((b, i) => (
        <li key={i} className="pl-0.5">
          {glyph !== '•' && glyph !== '∅' && <span className="mr-1.5" style={{ color: theme.accentColor }}>{glyph}</span>}
          {b}
        </li>
      ))}
    </ul>
  );
};

/* A thin, reusable contact line */
const ContactLine = ({ personal, theme, align = 'center' }) => {
  const items = [personal.email, personal.phone, personal.location, personal.linkedin, personal.portfolio].filter(Boolean);
  if (!items.length) return null;
  return (
    <p style={{ textAlign: align, fontSize: '10.5px', marginTop: '4px', color: '#333' }}>
      {items.map((it, i) => (
        <span key={i}>
          {i > 0 && <span style={{ margin: '0 6px', opacity: 0.4 }}>•</span>}
          {it}
        </span>
      ))}
    </p>
  );
};

/* ------------------------------------------------------------------ */
/* REAL templates                                                      */
/* ------------------------------------------------------------------ */

/* --- Classic ATS --- */
const ClassicATSTemplate = ({ formData, sectionOrder, theme, update }) => {
  const { personal, summary, experience, education, skills, projects } = formData;

  const blocks = {
    summary: summary ? (
      <section key="summary">
        <SectionHeading theme={theme}>Professional Summary</SectionHeading>
        <p style={{ fontSize: '11px', lineHeight: '1.5', color: '#222' }}>
          <InlineEditable multiline rows={3} value={summary} onChange={update.summary} placeholder="Write your professional summary…" />
        </p>
      </section>
    ) : null,

    experience: experience.some((e) => e.title || e.company) ? (
      <section key="experience">
        <SectionHeading theme={theme}>Experience</SectionHeading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {experience.map((exp) => (
            <div key={exp.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                <h4 style={{ fontSize: '11.5px', fontWeight: 700, color: '#111' }}>
                  <InlineEditable value={exp.title} onChange={(v) => update.experience(exp.id, 'title', v)} placeholder="Job Title" />
                </h4>
                <span style={{ fontSize: '10px', color: '#555', whiteSpace: 'nowrap' }}>
                  <InlineEditable value={exp.startDate} onChange={(v) => update.experience(exp.id, 'startDate', v)} placeholder="Start" />
                  {' – '}
                  <InlineEditable value={exp.current ? 'Present' : exp.endDate} onChange={(v) => update.experience(exp.id, 'endDate', v)} placeholder="End" />
                </span>
              </div>
              <p style={{ fontSize: '10.5px', color: '#444', fontStyle: 'italic' }}>
                <InlineEditable value={exp.company} onChange={(v) => update.experience(exp.id, 'company', v)} placeholder="Company" />
                {exp.location && <> · <InlineEditable value={exp.location} onChange={(v) => update.experience(exp.id, 'location', v)} placeholder="Location" /></>}
              </p>
              <BulletList items={toBullets(exp.description)} theme={theme} />
            </div>
          ))}
        </div>
      </section>
    ) : null,

    education: education.some((e) => e.institution) ? (
      <section key="education">
        <SectionHeading theme={theme}>Education</SectionHeading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {education.map((edu) => (
            <div key={edu.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
              <div>
                <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#111' }}>
                  <InlineEditable value={edu.institution} onChange={(v) => update.education(edu.id, 'institution', v)} placeholder="Institution" />
                </h4>
                <p style={{ fontSize: '10.5px', color: '#444' }}>
                  <InlineEditable value={edu.degree} onChange={(v) => update.education(edu.id, 'degree', v)} placeholder="Degree" />
                  {edu.field && <> in <InlineEditable value={edu.field} onChange={(v) => update.education(edu.id, 'field', v)} placeholder="Field" /></>}
                  {edu.gpa && <> · GPA <InlineEditable value={edu.gpa} onChange={(v) => update.education(edu.id, 'gpa', v)} placeholder="GPA" /></>}
                </p>
              </div>
              <span style={{ fontSize: '10px', color: '#555', whiteSpace: 'nowrap' }}>
                <InlineEditable value={edu.startDate} onChange={(v) => update.education(edu.id, 'startDate', v)} placeholder="Start" />
                {' – '}
                <InlineEditable value={edu.endDate} onChange={(v) => update.education(edu.id, 'endDate', v)} placeholder="End" />
              </span>
            </div>
          ))}
        </div>
      </section>
    ) : null,

    skills: skills.length ? (
      <section key="skills">
        <SectionHeading theme={theme}>Skills</SectionHeading>
        <p style={{ fontSize: '10.5px', color: '#222', lineHeight: 1.5 }}>{skills.join('  •  ')}</p>
      </section>
    ) : null,

    projects: projects.some((p) => p.name) ? (
      <section key="projects">
        <SectionHeading theme={theme}>Projects</SectionHeading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {projects.map((proj) => (
            <div key={proj.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#111' }}>
                  <InlineEditable value={proj.name} onChange={(v) => update.projects(proj.id, 'name', v)} placeholder="Project Name" />
                </h4>
                {proj.link && <span style={{ fontSize: '9.5px', color: '#666', fontStyle: 'italic' }}>{proj.link}</span>}
              </div>
              {proj.techStack && (
                <p style={{ fontSize: '10px', color: '#555', fontStyle: 'italic' }}>
                  <InlineEditable value={proj.techStack} onChange={(v) => update.projects(proj.id, 'techStack', v)} placeholder="Tech Stack" />
                </p>
              )}
              {proj.description && <p style={{ fontSize: '10.5px', color: '#222', marginTop: '2px' }}>{proj.description}</p>}
            </div>
          ))}
        </div>
      </section>
    ) : null,
  };

  return (
    <div>
      <header style={{ textAlign: 'center', marginBottom: '6px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.01em', color: '#111' }}>
          <InlineEditable value={personal.fullName} onChange={(v) => update.personal('fullName', v)} placeholder="Your Full Name" />
        </h1>
        <ContactLine personal={personal} theme={theme} />
      </header>
      {sectionOrder.map((key) => blocks[key]).filter(Boolean)}
    </div>
  );
};

/* --- Modern Two Column --- */
const ModernTwoColumnTemplate = ({ formData, sectionOrder, theme, update }) => {
  const { personal, summary, experience, education, skills, projects } = formData;

  const renderBlock = (key) => {
    if (key === 'summary' && summary) {
      return (
        <section key="summary" style={{ marginBottom: '14px' }}>
          <SectionHeading theme={theme}>Profile</SectionHeading>
          <p style={{ fontSize: '10.5px', lineHeight: 1.55, color: '#222' }}>
            <InlineEditable multiline rows={3} value={summary} onChange={update.summary} placeholder="Write your profile…" />
          </p>
        </section>
      );
    }
    if (key === 'experience' && experience.some((e) => e.title || e.company)) {
      return (
        <section key="experience" style={{ marginBottom: '14px' }}>
          <SectionHeading theme={theme}>Experience</SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {experience.map((exp) => (
              <div key={exp.id}>
                <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#111' }}>
                  <InlineEditable value={exp.title} onChange={(v) => update.experience(exp.id, 'title', v)} placeholder="Job Title" />
                </h4>
                <p style={{ fontSize: '10px', fontStyle: 'italic', color: '#555' }}>
                  <InlineEditable value={exp.company} onChange={(v) => update.experience(exp.id, 'company', v)} placeholder="Company" />
                  {' · '}
                  <InlineEditable value={exp.startDate} onChange={(v) => update.experience(exp.id, 'startDate', v)} placeholder="Start" />
                  {' – '}
                  <InlineEditable value={exp.current ? 'Present' : exp.endDate} onChange={(v) => update.experience(exp.id, 'endDate', v)} placeholder="End" />
                </p>
                <BulletList items={toBullets(exp.description)} theme={theme} />
              </div>
            ))}
          </div>
        </section>
      );
    }
    if (key === 'education' && education.some((e) => e.institution)) {
      return (
        <section key="education" style={{ marginBottom: '14px' }}>
          <SectionHeading theme={theme}>Education</SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {education.map((edu) => (
              <div key={edu.id}>
                <h4 style={{ fontSize: '10.5px', fontWeight: 700, color: '#111' }}>
                  <InlineEditable value={edu.institution} onChange={(v) => update.education(edu.id, 'institution', v)} placeholder="Institution" />
                </h4>
                <p style={{ fontSize: '10px', color: '#444' }}>
                  <InlineEditable value={edu.degree} onChange={(v) => update.education(edu.id, 'degree', v)} placeholder="Degree" />
                  {edu.field && <> · <InlineEditable value={edu.field} onChange={(v) => update.education(edu.id, 'field', v)} placeholder="Field" /></>}
                </p>
                <p style={{ fontSize: '9.5px', color: '#666' }}>
                  <InlineEditable value={edu.startDate} onChange={(v) => update.education(edu.id, 'startDate', v)} placeholder="Start" />
                  {' – '}
                  <InlineEditable value={edu.endDate} onChange={(v) => update.education(edu.id, 'endDate', v)} placeholder="End" />
                </p>
              </div>
            ))}
          </div>
        </section>
      );
    }
    if (key === 'skills' && skills.length) {
      return (
        <section key="skills" style={{ marginBottom: '14px' }}>
          <SectionHeading theme={theme}>Skills</SectionHeading>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {skills.map((s) => (
              <span key={s} style={{ fontSize: '9.5px', padding: '2px 7px', borderRadius: '999px', backgroundColor: 'rgba(0,0,0,0.06)', color: '#222' }}>{s}</span>
            ))}
          </div>
        </section>
      );
    }
    if (key === 'projects' && projects.some((p) => p.name)) {
      return (
        <section key="projects" style={{ marginBottom: '14px' }}>
          <SectionHeading theme={theme}>Projects</SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {projects.map((proj) => (
              <div key={proj.id}>
                <h4 style={{ fontSize: '10.5px', fontWeight: 700, color: '#111' }}>
                  <InlineEditable value={proj.name} onChange={(v) => update.projects(proj.id, 'name', v)} placeholder="Project Name" />
                </h4>
                {proj.techStack && <p style={{ fontSize: '9.5px', fontStyle: 'italic', color: '#555' }}>{proj.techStack}</p>}
                {proj.description && <p style={{ fontSize: '10px', color: '#222' }}>{proj.description}</p>}
              </div>
            ))}
          </div>
        </section>
      );
    }
    return null;
  };

  const leftKeys = sectionOrder.filter((k) => ['skills', 'education', 'projects'].includes(k));
  const rightKeys = sectionOrder.filter((k) => ['summary', 'experience'].includes(k));

  return (
    <div>
      <header style={{ marginBottom: '14px', paddingBottom: '10px', borderBottom: `2px solid ${theme.accentColor}` }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: theme.accentColor, letterSpacing: '-0.01em' }}>
          <InlineEditable value={personal.fullName} onChange={(v) => update.personal('fullName', v)} placeholder="Your Full Name" />
        </h1>
        <ContactLine personal={personal} theme={theme} align="left" />
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '22px' }}>
        <aside>{leftKeys.map(renderBlock)}</aside>
        <main>{rightKeys.map(renderBlock)}</main>
      </div>
    </div>
  );
};

/* --- Executive Serif --- */
const ExecutiveSerifTemplate = ({ formData, sectionOrder, theme, update }) => {
  const { personal, summary, experience, education, skills, projects } = formData;

  const blocks = {
    summary: summary ? (
      <section key="summary">
        <SectionHeading theme={theme}>Executive Summary</SectionHeading>
        <p style={{ fontSize: '11px', lineHeight: 1.6, color: '#222', fontStyle: 'italic' }}>
          <InlineEditable multiline rows={3} value={summary} onChange={update.summary} placeholder="Write your executive summary…" />
        </p>
      </section>
    ) : null,
    experience: experience.some((e) => e.title) ? (
      <section key="experience">
        <SectionHeading theme={theme}>Professional Experience</SectionHeading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {experience.map((exp) => (
            <div key={exp.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#111' }}>
                  <InlineEditable value={exp.title} onChange={(v) => update.experience(exp.id, 'title', v)} placeholder="Job Title" />
                </h4>
                <span style={{ fontSize: '10px', color: '#555' }}>
                  <InlineEditable value={exp.startDate} onChange={(v) => update.experience(exp.id, 'startDate', v)} placeholder="Start" />
                  {' – '}
                  <InlineEditable value={exp.current ? 'Present' : exp.endDate} onChange={(v) => update.experience(exp.id, 'endDate', v)} placeholder="End" />
                </span>
              </div>
              <p style={{ fontSize: '10.5px', fontStyle: 'italic', color: '#555' }}>
                <InlineEditable value={exp.company} onChange={(v) => update.experience(exp.id, 'company', v)} placeholder="Company" />
                {exp.location && <> · {exp.location}</>}
              </p>
              <BulletList items={toBullets(exp.description)} theme={theme} />
            </div>
          ))}
        </div>
      </section>
    ) : null,
    education: education.some((e) => e.institution) ? (
      <section key="education">
        <SectionHeading theme={theme}>Education</SectionHeading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {education.map((edu) => (
            <div key={edu.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#111' }}>
                  <InlineEditable value={edu.institution} onChange={(v) => update.education(edu.id, 'institution', v)} placeholder="Institution" />
                </h4>
                <p style={{ fontSize: '10.5px', color: '#444' }}>
                  <InlineEditable value={edu.degree} onChange={(v) => update.education(edu.id, 'degree', v)} placeholder="Degree" />
                  {edu.field && <> · {edu.field}</>}
                </p>
              </div>
              <span style={{ fontSize: '10px', color: '#555', whiteSpace: 'nowrap' }}>
                <InlineEditable value={edu.startDate} onChange={(v) => update.education(edu.id, 'startDate', v)} placeholder="Start" />
                {' – '}
                <InlineEditable value={edu.endDate} onChange={(v) => update.education(edu.id, 'endDate', v)} placeholder="End" />
              </span>
            </div>
          ))}
        </div>
      </section>
    ) : null,
    skills: skills.length ? (
      <section key="skills">
        <SectionHeading theme={theme}>Core Competencies</SectionHeading>
        <p style={{ fontSize: '10.5px', color: '#222', lineHeight: 1.55 }}>{skills.join('  •  ')}</p>
      </section>
    ) : null,
    projects: projects.some((p) => p.name) ? (
      <section key="projects">
        <SectionHeading theme={theme}>Selected Projects</SectionHeading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {projects.map((proj) => (
            <div key={proj.id}>
              <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#111' }}>
                <InlineEditable value={proj.name} onChange={(v) => update.projects(proj.id, 'name', v)} placeholder="Project Name" />
              </h4>
              {proj.description && <p style={{ fontSize: '10.5px', color: '#222' }}>{proj.description}</p>}
            </div>
          ))}
        </div>
      </section>
    ) : null,
  };

  return (
    <div style={{ fontFamily: "'Lora', Georgia, serif" }}>
      <header style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '0.01em', color: '#111' }}>
          <InlineEditable value={personal.fullName} onChange={(v) => update.personal('fullName', v)} placeholder="Your Full Name" />
        </h1>
        <div style={{ width: '40px', height: '1px', backgroundColor: '#999', margin: '8px auto' }} />
        <ContactLine personal={personal} theme={theme} />
      </header>
      {sectionOrder.map((key) => blocks[key]).filter(Boolean)}
    </div>
  );
};

/* --- Timeline --- */
const TimelineTemplate = ({ formData, sectionOrder, theme, update }) => {
  const { personal, summary, experience, education, skills, projects } = formData;

  return (
    <div>
      <header style={{ marginBottom: '12px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: theme.accentColor }}>
          <InlineEditable value={personal.fullName} onChange={(v) => update.personal('fullName', v)} placeholder="Your Full Name" />
        </h1>
        <ContactLine personal={personal} theme={theme} align="left" />
      </header>

      {summary && (
        <section>
          <SectionHeading theme={theme}>Summary</SectionHeading>
          <p style={{ fontSize: '10.5px', color: '#222', lineHeight: 1.55 }}>
            <InlineEditable multiline rows={2} value={summary} onChange={update.summary} placeholder="Write your summary…" />
          </p>
        </section>
      )}

      {experience.some((e) => e.title) && (
        <section>
          <SectionHeading theme={theme}>Experience</SectionHeading>
          <div style={{ paddingLeft: '14px', borderLeft: `2px solid ${theme.accentColor}55`, marginTop: '4px' }}>
            {experience.map((exp) => (
              <div key={exp.id} style={{ position: 'relative', marginBottom: '10px' }}>
                <span style={{ position: 'absolute', left: '-21px', top: '5px', width: '9px', height: '9px', borderRadius: '50%', backgroundColor: theme.accentColor }} />
                <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#111' }}>
                  <InlineEditable value={exp.title} onChange={(v) => update.experience(exp.id, 'title', v)} placeholder="Job Title" />
                </h4>
                <p style={{ fontSize: '10px', fontStyle: 'italic', color: '#555' }}>
                  <InlineEditable value={exp.company} onChange={(v) => update.experience(exp.id, 'company', v)} placeholder="Company" />
                  {' · '}
                  <InlineEditable value={exp.startDate} onChange={(v) => update.experience(exp.id, 'startDate', v)} placeholder="Start" />
                  {' – '}
                  <InlineEditable value={exp.current ? 'Present' : exp.endDate} onChange={(v) => update.experience(exp.id, 'endDate', v)} placeholder="End" />
                </p>
                <BulletList items={toBullets(exp.description)} theme={theme} />
              </div>
            ))}
          </div>
        </section>
      )}

      {education.some((e) => e.institution) && (
        <section>
          <SectionHeading theme={theme}>Education</SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {education.map((edu) => (
              <div key={edu.id}>
                <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#111' }}>
                  <InlineEditable value={edu.institution} onChange={(v) => update.education(edu.id, 'institution', v)} placeholder="Institution" />
                </h4>
                <p style={{ fontSize: '10px', color: '#444' }}>
                  <InlineEditable value={edu.degree} onChange={(v) => update.education(edu.id, 'degree', v)} placeholder="Degree" />
                  {' · '}
                  <InlineEditable value={edu.startDate} onChange={(v) => update.education(edu.id, 'startDate', v)} placeholder="Start" />
                  {' – '}
                  <InlineEditable value={edu.endDate} onChange={(v) => update.education(edu.id, 'endDate', v)} placeholder="End" />
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {skills.length > 0 && (
        <section>
          <SectionHeading theme={theme}>Skills</SectionHeading>
          <p style={{ fontSize: '10.5px', color: '#222' }}>{skills.join('  •  ')}</p>
        </section>
      )}

      {projects.some((p) => p.name) && (
        <section>
          <SectionHeading theme={theme}>Projects</SectionHeading>
          {projects.map((proj) => (
            <div key={proj.id} style={{ marginBottom: '6px' }}>
              <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#111' }}>
                <InlineEditable value={proj.name} onChange={(v) => update.projects(proj.id, 'name', v)} placeholder="Project Name" />
              </h4>
              {proj.description && <p style={{ fontSize: '10.5px', color: '#222' }}>{proj.description}</p>}
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

/* --- Two-Tone Header --- */
const TwoToneHeaderTemplate = ({ formData, sectionOrder, theme, update }) => {
  const { personal, summary, experience, education, skills, projects } = formData;

  return (
    <div>
      <div style={{ margin: '-48px -48px 16px', padding: '22px 48px 18px', backgroundColor: theme.accentColor }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.01em', color: '#fff' }}>
          <InlineEditable value={personal.fullName} onChange={(v) => update.personal('fullName', v)} placeholder="Your Full Name" style={{ color: '#fff' }} />
        </h1>
        <div style={{ fontSize: '10.5px', marginTop: '5px', color: '#fff', opacity: 0.95 }}>
          {[personal.email, personal.phone, personal.location, personal.linkedin, personal.portfolio].filter(Boolean).map((it, i) => (
            <span key={i}>
              {i > 0 && <span style={{ margin: '0 6px', opacity: 0.55 }}>|</span>}
              {it}
            </span>
          ))}
        </div>
      </div>

      {summary && (
        <section>
          <SectionHeading theme={theme}>Summary</SectionHeading>
          <p style={{ fontSize: '10.5px', color: '#222', lineHeight: 1.55 }}>
            <InlineEditable multiline rows={2} value={summary} onChange={update.summary} placeholder="Write your summary…" />
          </p>
        </section>
      )}

      {experience.some((e) => e.title) && (
        <section>
          <SectionHeading theme={theme}>Experience</SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {experience.map((exp) => (
              <div key={exp.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                  <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#111' }}>
                    <InlineEditable value={exp.title} onChange={(v) => update.experience(exp.id, 'title', v)} placeholder="Job Title" />
                  </h4>
                  <span style={{ fontSize: '10px', color: '#555' }}>
                    <InlineEditable value={exp.startDate} onChange={(v) => update.experience(exp.id, 'startDate', v)} placeholder="Start" />
                    {' – '}
                    <InlineEditable value={exp.current ? 'Present' : exp.endDate} onChange={(v) => update.experience(exp.id, 'endDate', v)} placeholder="End" />
                  </span>
                </div>
                <p style={{ fontSize: '10px', fontStyle: 'italic', color: '#555' }}>
                  <InlineEditable value={exp.company} onChange={(v) => update.experience(exp.id, 'company', v)} placeholder="Company" />
                  {exp.location && <> · {exp.location}</>}
                </p>
                <BulletList items={toBullets(exp.description)} theme={theme} />
              </div>
            ))}
          </div>
        </section>
      )}

      {education.some((e) => e.institution) && (
        <section>
          <SectionHeading theme={theme}>Education</SectionHeading>
          {education.map((edu) => (
            <div key={edu.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '6px' }}>
              <div>
                <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#111' }}>
                  <InlineEditable value={edu.institution} onChange={(v) => update.education(edu.id, 'institution', v)} placeholder="Institution" />
                </h4>
                <p style={{ fontSize: '10px', color: '#444' }}>
                  <InlineEditable value={edu.degree} onChange={(v) => update.education(edu.id, 'degree', v)} placeholder="Degree" />
                  {edu.field && <> · {edu.field}</>}
                </p>
              </div>
              <span style={{ fontSize: '10px', color: '#555', whiteSpace: 'nowrap' }}>
                <InlineEditable value={edu.startDate} onChange={(v) => update.education(edu.id, 'startDate', v)} placeholder="Start" />
                {' – '}
                <InlineEditable value={edu.endDate} onChange={(v) => update.education(edu.id, 'endDate', v)} placeholder="End" />
              </span>
            </div>
          ))}
        </section>
      )}

      {skills.length > 0 && (
        <section>
          <SectionHeading theme={theme}>Skills</SectionHeading>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {skills.map((s) => (
              <span key={s} style={{ fontSize: '9.5px', padding: '2px 8px', borderRadius: '999px', backgroundColor: `${theme.accentColor}1A`, color: theme.accentColor, fontWeight: 500 }}>{s}</span>
            ))}
          </div>
        </section>
      )}

      {projects.some((p) => p.name) && (
        <section>
          <SectionHeading theme={theme}>Projects</SectionHeading>
          {projects.map((proj) => (
            <div key={proj.id} style={{ marginBottom: '6px' }}>
              <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#111' }}>
                <InlineEditable value={proj.name} onChange={(v) => update.projects(proj.id, 'name', v)} placeholder="Project Name" />
              </h4>
              {proj.description && <p style={{ fontSize: '10.5px', color: '#222' }}>{proj.description}</p>}
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

/* --- Minimal Grid (new) --- */
const MinimalGridTemplate = ({ formData, sectionOrder, theme, update }) => {
  const { personal, summary, experience, education, skills, projects } = formData;
  return (
    <div>
      <header style={{ textAlign: 'center', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#111' }}>
          <InlineEditable value={personal.fullName} onChange={(v) => update.personal('fullName', v)} placeholder="Your Full Name" />
        </h1>
        <div style={{ width: '40px', height: '1px', backgroundColor: '#111', margin: '8px auto' }} />
        <ContactLine personal={personal} theme={theme} />
      </header>
      {summary && (
        <section>
          <SectionHeading theme={theme}>About</SectionHeading>
          <p style={{ fontSize: '10.5px', color: '#222', lineHeight: 1.6 }}>
            <InlineEditable multiline rows={2} value={summary} onChange={update.summary} placeholder="A short summary…" />
          </p>
        </section>
      )}
      {experience.some((e) => e.title) && (
        <section>
          <SectionHeading theme={theme}>Experience</SectionHeading>
          {experience.map((exp) => (
            <div key={exp.id} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#111' }}>{exp.title}</h4>
                <span style={{ fontSize: '10px', color: '#555' }}>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
              </div>
              <p style={{ fontSize: '10px', color: '#555', fontStyle: 'italic' }}>{exp.company}</p>
              <BulletList items={toBullets(exp.description)} theme={theme} />
            </div>
          ))}
        </section>
      )}
      {education.some((e) => e.institution) && (
        <section>
          <SectionHeading theme={theme}>Education</SectionHeading>
          {education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '6px' }}>
              <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#111' }}>{edu.institution}</h4>
              <p style={{ fontSize: '10.5px', color: '#444' }}>{edu.degree}</p>
            </div>
          ))}
        </section>
      )}
      {skills.length > 0 && (
        <section>
          <SectionHeading theme={theme}>Skills</SectionHeading>
          <p style={{ fontSize: '10.5px', color: '#222' }}>{skills.join('  •  ')}</p>
        </section>
      )}
    </div>
  );
};

const TEMPLATE_COMPONENTS = {
  'classic-ats': ClassicATSTemplate,
  'modern-two-column': ModernTwoColumnTemplate,
  'executive-serif': ExecutiveSerifTemplate,
  'timeline': TimelineTemplate,
  'two-tone-header': TwoToneHeaderTemplate,
  'minimal-grid': MinimalGridTemplate,
  'compact-technical': ClassicATSTemplate,
  'creative-sidebar': ModernTwoColumnTemplate,
  'skills-first-technical': ModernTwoColumnTemplate,
  'photo-contact-card': ModernTwoColumnTemplate,
};

/* ------------------------------------------------------------------ */
/* StylePanel                                                          */
/* ------------------------------------------------------------------ */
const StylePanel = ({ customization, setCustomization, sectionOrder, setSectionOrder, onReset, atsResult, onNavigate }) => {
  const set = (key) => (value) => setCustomization((prev) => ({ ...prev, [key]: value }));
  const WEIGHT_OPTIONS = [{ id: 'normal', label: 'Normal' }, { id: 'medium', label: 'Medium' }, { id: 'semibold', label: 'Semi' }, { id: 'bold', label: 'Bold' }];
  const HEADING_STYLE_OPTIONS = [{ id: 'uppercase', label: 'UPPER' }, { id: 'capitalize', label: 'Title' }, { id: 'normal', label: 'Normal' }];
  const ALIGN_OPTIONS = [{ id: 'left', icon: FiAlignLeft, label: 'Left' }, { id: 'center', icon: FiAlignCenter, label: 'Center' }, { id: 'right', icon: FiAlignRight, label: 'Right' }];
  const PAGE_SIZE_OPTIONS = [{ id: 'letter', label: 'Letter' }, { id: 'a4', label: 'A4' }, { id: 'legal', label: 'Legal' }];
  const MARGIN_OPTIONS = [{ id: 'compact', label: 'Compact' }, { id: 'normal', label: 'Normal' }, { id: 'relaxed', label: 'Relaxed' }, { id: 'wide', label: 'Wide' }];
  const LINE_HEIGHT_OPTIONS = [{ id: 'tight', label: 'Tight' }, { id: 'normal', label: 'Normal' }, { id: 'loose', label: 'Loose' }];
  const HEADER_STYLE_OPTIONS = [{ id: 'flat', label: 'Flat', icon: FiSquare }, { id: 'underline', label: 'Underline', icon: FiMinimize }, { id: 'boxed', label: 'Boxed', icon: FiSquare }, { id: 'accent-bar', label: 'Bar', icon: FiColumns }, { id: 'dotted', label: 'Dotted', icon: FiList }];
  const COLOR_THEME_OPTIONS = [{ id: 'light', label: 'Light', icon: FiSun }, { id: 'dark', label: 'Dark', icon: FiMoon }, { id: 'accent', label: 'Accent', icon: FiDroplet }];

  const topIssue = atsResult?.failedChecks?.[0];

  return (
    <div className="bg-[#161615] rounded-3xl p-5 shadow-xl shadow-black/10 no-print space-y-1 max-h-[calc(100vh-100px)] overflow-y-auto sticky top-[76px] custom-scroll">
      {/* Resume health — the score is the first thing you see, not buried in a tab */}
      {atsResult && (
        <div
          className="relative overflow-hidden rounded-2xl p-4 mb-3"
          style={{ background: `radial-gradient(135% 135% at 0% 0%, ${customization.accentColor}26, transparent 65%)` }}
        >
          <div className="flex items-center justify-between gap-3">
            <ATSScoreRing score={atsResult.score} grade={atsResult.grade} compact />
          </div>
          {topIssue ? (
            <button
              type="button"
              onClick={() => onNavigate?.(STEP_FOR_CHECK[topIssue.id])}
              className="w-full text-left mt-3 pt-3 border-t border-white/[0.08] group"
            >
              <span className="text-[10px] font-medium tracking-wider uppercase text-white/35">Top fix</span>
              <p className="text-xs text-white/70 mt-0.5 flex items-center justify-between gap-2">
                <span className="truncate">{topIssue.label}</span>
                <FiArrowRightCircle size={14} className="text-[#F5A524] shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </p>
            </button>
          ) : (
            <p className="text-xs text-emerald-400/90 mt-3 pt-3 border-t border-white/[0.08]">All ATS checks pass.</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div>
          <span className="font-mono-r text-[11px] tracking-[0.2em] text-[#F5A524] uppercase">Design Studio</span>
          <h2 className="font-serif text-lg font-bold text-white mt-1">Style & Format</h2>
        </div>
        <button type="button" onClick={onReset} title="Reset all customizations" className="text-white/30 hover:text-[#F5A524] transition-colors"><FiRefreshCw size={15} /></button>
      </div>

      <CollapsibleSection title="Template" icon={FiLayout} defaultOpen={true}>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATES.map((tpl) => {
            const active = customization.templateId === tpl.id;
            const atsFriendly = ATS_FRIENDLY_TEMPLATES.includes(tpl.id);
            return (
              <button key={tpl.id} type="button" onClick={() => setCustomization((prev) => ({ ...prev, templateId: tpl.id }))} title={tpl.description}
                className={`relative text-left rounded-xl border p-2 transition-colors ${active ? 'border-[#F5A524]/50 bg-[#F5A524]/5' : 'border-white/10 hover:border-white/25'}`}>
                {atsFriendly && (
                  <span className="absolute top-1.5 right-1.5 text-[8px] font-semibold tracking-wide uppercase bg-emerald-500/15 text-emerald-400 rounded-full px-1.5 py-0.5">ATS</span>
                )}
                <TemplateSwatch templateId={tpl.id} active={active} />
                <p className="text-[10px] font-medium text-white mt-1.5 truncate">{tpl.name}</p>
              </button>
            );
          })}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Typography" icon={FiType} defaultOpen={true}>
        <div className="space-y-3">
          <div><label className={labelClass}>Font Family</label><PillGroup options={FONT_OPTIONS} value={customization.fontFamily} onChange={set('fontFamily')} /></div>
          <div><label className={labelClass}>Font Size</label><PillGroup options={SIZE_OPTIONS} value={customization.fontSize} onChange={set('fontSize')} /></div>
          <div><label className={labelClass}>Name Weight</label><PillGroup options={WEIGHT_OPTIONS} value={customization.nameWeight || 'bold'} onChange={set('nameWeight')} /></div>
          <div><label className={labelClass}>Heading Case</label><PillGroup options={HEADING_STYLE_OPTIONS} value={customization.headingCase || 'uppercase'} onChange={set('headingCase')} /></div>
          <div><label className={labelClass}>Line Height</label><PillGroup options={LINE_HEIGHT_OPTIONS} value={customization.lineHeight || 'normal'} onChange={set('lineHeight')} /></div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Layout" icon={FiSliders} defaultOpen={true}>
        <div className="space-y-3">
          <div><label className={labelClass}>Page Size</label><PillGroup options={PAGE_SIZE_OPTIONS} value={customization.pageSize || 'a4'} onChange={set('pageSize')} /></div>
          <div><label className={labelClass}>Page Margins</label><PillGroup options={MARGIN_OPTIONS} value={customization.pageMargin || 'normal'} onChange={set('pageMargin')} /></div>
          <div><label className={labelClass}>Content Density</label><PillGroup options={DENSITY_OPTIONS} value={customization.density} onChange={set('density')} /></div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Colors" icon={FiDroplet} defaultOpen={true}>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Accent</label>
            <div className="flex flex-wrap items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button key={c.id} type="button" onClick={() => setCustomization((prev) => ({ ...prev, accentColor: c.hex }))}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${customization.accentColor === c.hex ? 'border-white scale-110' : 'border-white/10'}`}
                  style={{ backgroundColor: c.hex }} title={c.id} />
              ))}
              <label className="w-7 h-7 rounded-full border-2 border-white/10 overflow-hidden cursor-pointer relative">
                <input type="color" value={customization.accentColor} onChange={(e) => setCustomization((prev) => ({ ...prev, accentColor: e.target.value }))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <span className="absolute inset-0" style={{ background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)' }} />
              </label>
            </div>
          </div>
          <div>
            <label className={labelClass}>Text Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={customization.textColor || '#111111'} onChange={(e) => setCustomization((prev) => ({ ...prev, textColor: e.target.value }))} className="w-9 h-9 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
              <span className="text-xs text-white/40 font-mono-r">{customization.textColor || '#111111'}</span>
            </div>
          </div>
          <div><label className={labelClass}>Page Background</label><PillGroup options={COLOR_THEME_OPTIONS} value={customization.colorTheme || 'light'} onChange={set('colorTheme')} /></div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Section Headings" icon={FiAward} defaultOpen={false}>
        <div className="space-y-3">
          <div><label className={labelClass}>Heading Style</label><IconPillGroup options={HEADER_STYLE_OPTIONS} value={customization.headingStyle || 'underline'} onChange={set('headingStyle')} /></div>
          <div><label className={labelClass}>Heading Alignment</label><IconPillGroup options={ALIGN_OPTIONS} value={customization.headingAlign || 'left'} onChange={set('headingAlign')} /></div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Bullets" icon={FiList} defaultOpen={false}>
        <label className={labelClass}>Bullet Glyph</label>
        <PillGroup options={BULLET_OPTIONS} value={customization.bulletGlyph || '•'} onChange={set('bulletGlyph')} getId={(o) => o.id} getLabel={(o) => `${o.id === '∅' ? '' : o.id + ' '}${o.label}`} />
        <p className="text-[11px] text-white/30 mt-2 leading-relaxed">"Plain" drops the glyph entirely — the safest choice if you're optimizing purely for ATS parsing.</p>
      </CollapsibleSection>

      <CollapsibleSection title="Section Order" icon={FiMove} defaultOpen={false}>
        <SectionOrderList order={sectionOrder} onChange={setSectionOrder} />
      </CollapsibleSection>

      <CollapsibleSection title="Quick Presets" icon={FiZap} defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setCustomization((prev) => ({ ...prev, pageMargin: 'compact', lineHeight: 'tight' }))} className="text-xs text-white/60 hover:text-white border border-white/10 hover:border-white/25 rounded-lg px-3 py-2 transition-colors">Compact</button>
          <button type="button" onClick={() => setCustomization((prev) => ({ ...prev, pageMargin: 'relaxed', lineHeight: 'loose' }))} className="text-xs text-white/60 hover:text-white border border-white/10 hover:border-white/25 rounded-lg px-3 py-2 transition-colors">Spacious</button>
          <button type="button" onClick={() => setCustomization((prev) => ({ ...prev, fontFamily: 'sans', headingCase: 'uppercase', headingStyle: 'accent-bar', accentColor: '#F5A524' }))} className="text-xs text-white/60 hover:text-white border border-white/10 hover:border-white/25 rounded-lg px-3 py-2 transition-colors">Modern</button>
          <button type="button" onClick={() => setCustomization((prev) => ({ ...prev, fontFamily: 'serif', headingCase: 'normal', headingStyle: 'underline', accentColor: '#1a1a1a' }))} className="text-xs text-white/60 hover:text-white border border-white/10 hover:border-white/25 rounded-lg px-3 py-2 transition-colors">Classic</button>
          <button type="button" onClick={() => setCustomization((prev) => ({ ...prev, templateId: 'classic-ats', bulletGlyph: '∅', headingStyle: 'flat', fontFamily: 'sans' }))} className="col-span-2 text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-500/5 rounded-lg px-3 py-2 transition-colors">Maximum ATS Safety</button>
        </div>
      </CollapsibleSection>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */
const ResumeBuilder = () => {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [skillInput, setSkillInput] = useState('');
  const [zoom, setZoom] = useState(1);

  const [formData, setFormData] = useState({
    personal: { fullName: 'Jane Doe', email: 'jane.doe@example.com', phone: '+1 (555) 123-4567', location: 'San Francisco, CA', linkedin: 'linkedin.com/in/janedoe', portfolio: 'github.com/janedoe' },
    summary: 'Full-stack developer with 4+ years of experience building scalable web applications. Specialised in React, Node.js, and cloud-native architectures. Passionate about clean code and measurable impact.',
    experience: [
      { id: genId(), title: 'Senior Software Engineer', company: 'Acme Corp', location: 'San Francisco, CA', startDate: 'Jan 2022', endDate: '', current: true, description: 'Led migration of legacy monolith to microservices, cutting deploy time by 70%\nDesigned and shipped a real-time analytics dashboard used by 50k+ daily users\nMentored 3 junior engineers and drove adoption of TypeScript across the org' },
      { id: genId(), title: 'Software Engineer', company: 'StartupXYZ', location: 'Remote', startDate: 'Jun 2020', endDate: 'Dec 2021', current: false, description: 'Built the core payments flow processing $2M+ in monthly transactions\nReduced page load time by 40% through code splitting and lazy loading' },
    ],
    education: [
      { id: genId(), institution: 'University of California, Berkeley', degree: 'B.S.', field: 'Computer Science', startDate: '2016', endDate: '2020', gpa: '3.8' },
    ],
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'GraphQL', 'System Design'],
    projects: [
      { id: genId(), name: 'OpenBoard', techStack: 'React · WebSockets · Redis', description: 'A real-time collaborative whiteboard used by 10k+ students.', link: 'github.com/janedoe/openboard' },
    ],
  });

  const [customization, setCustomization] = useState(DEFAULT_CUSTOMIZATION);
  const [sectionOrder, setSectionOrder] = useState(DEFAULT_SECTION_ORDER);

  const step = STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;

  const goNext = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));
  const goToStep = (id) => {
    const idx = STEPS.findIndex((s) => s.id === id);
    if (idx >= 0) setStepIndex(idx);
  };

  const update = {
    personal: (field, value) => setFormData((prev) => ({ ...prev, personal: { ...prev.personal, [field]: value } })),
    summary: (value) => setFormData((prev) => ({ ...prev, summary: value })),
    experience: (id, field, value) => setFormData((prev) => ({ ...prev, experience: prev.experience.map((it) => it.id === id ? { ...it, [field]: value } : it) })),
    education: (id, field, value) => setFormData((prev) => ({ ...prev, education: prev.education.map((it) => it.id === id ? { ...it, [field]: value } : it) })),
    projects: (id, field, value) => setFormData((prev) => ({ ...prev, projects: prev.projects.map((it) => it.id === id ? { ...it, [field]: value } : it) })),
  };

  const updatePersonal = (field, value) => setFormData((prev) => ({ ...prev, personal: { ...prev.personal, [field]: value } }));
  const updateListItem = (listKey, id, field, value) => setFormData((prev) => ({ ...prev, [listKey]: prev[listKey].map((item) => (item.id === id ? { ...item, [field]: value } : item)) }));
  const addListItem = (listKey, factory) => setFormData((prev) => ({ ...prev, [listKey]: [...prev[listKey], factory()] }));
  const removeListItem = (listKey, id) => setFormData((prev) => ({ ...prev, [listKey]: prev[listKey].filter((item) => item.id !== id) }));
  const toggleCurrentRole = (id, checked) => setFormData((prev) => ({ ...prev, experience: prev.experience.map((item) => item.id === id ? { ...item, current: checked, endDate: checked ? '' : item.endDate } : item) }));

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (formData.skills.includes(trimmed)) { setSkillInput(''); return; }
    setFormData((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
    setSkillInput('');
  };
  const removeSkill = (skill) => setFormData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));

  const handleDownload = () => window.print();
  const handleResetCustomization = () => { setCustomization(DEFAULT_CUSTOMIZATION); setSectionOrder(DEFAULT_SECTION_ORDER); };

  const theme = useMemo(() => buildTheme(customization), [customization]);
  const safeSectionOrder = useMemo(() => normalizeSectionOrder(sectionOrder), [sectionOrder]);
  const atsResult = useMemo(() => computeATSScore(formData, customization), [formData, customization]);
  const TemplateComponent = TEMPLATE_COMPONENTS[customization.templateId] || ClassicATSTemplate;

  /* Page geometry — exact pixel sizes at 96 DPI */
  const PAGE_SIZES = {
    a4:     { w: 794,  h: 1123, pad: 56 },
    letter: { w: 816,  h: 1056, pad: 56 },
    legal:  { w: 816,  h: 1344, pad: 56 },
  };
  const page = PAGE_SIZES[customization.pageSize || 'a4'];
  const padMap = { compact: 32, normal: 56, relaxed: 72, wide: 88 };
  const pad = padMap[customization.pageMargin || 'normal'] ?? page.pad;

  /* Scale factor for fitting into a scroll column */
  const baseWidth = 620; // px width of the right column we want the page to render into
  const fitScale = Math.min(1, baseWidth / page.w);
  const effectiveScale = zoom * fitScale;

  const lineHeight = customization.lineHeight === 'tight' ? 1.3 : customization.lineHeight === 'loose' ? 1.7 : 1.5;
  const fontSize =
    customization.fontSize === 'sm' ? '12.5px' :
    customization.fontSize === 'lg' ? '15.5px' :
    customization.fontSize === 'xs' ? '11.5px' :
    '14px';

  const fontFamily =
    customization.fontFamily === 'serif' ? "'Lora', Georgia, serif" :
    customization.fontFamily === 'mono' ? "'IBM Plex Mono', monospace" :
    customization.fontFamily === 'playfair' ? "'Playfair Display', Georgia, serif" :
    customization.fontFamily === 'source' ? "'Source Sans 3', sans-serif" :
    customization.fontFamily === 'jetbrains' ? "'JetBrains Mono', monospace" :
    "'Inter', sans-serif";

  const pageBackground =
    customization.colorTheme === 'dark' ? '#0f0f0f' :
    customization.colorTheme === 'accent' ? `${customization.accentColor}08` :
    '#ffffff';

  const scoreColor = atsResult.score >= 90 ? '#22C55E' : atsResult.score >= 75 ? '#F5A524' : atsResult.score >= 55 ? '#F59E0B' : '#EF4444';

  return (
    <div className="bg-[#0E1013] min-h-screen">
      <FontImport />
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
        .page-frame { box-shadow: 0 24px 48px -16px rgba(0,0,0,0.7), 0 8px 20px -8px rgba(0,0,0,0.5); }
      `}</style>

      {/* NAVBAR */}
      <motion.nav
        className="fixed top-0 left-0 right-0 w-full bg-[#0E1013]/90 backdrop-blur-xl border-b border-white/[0.06] h-[64px] z-50 flex items-center px-6 no-print"
        initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
        <div className="flex items-center justify-between w-full max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <GiArtificialHive size={26} className="text-white" />
              <span className="font-serif font-bold text-xl text-white tracking-tight">CM<span className="text-white/40">.AI</span></span>
            </div>
            <span className="text-xs font-medium tracking-wider uppercase bg-white/5 text-white/50 px-3 py-1 rounded-full border border-white/10">Resume Builder</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => goToStep('preview')}
              title="Jump to your ATS score breakdown"
              className="hidden sm:inline-flex items-center gap-2 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1.5 transition-colors"
            >
              <FiTarget size={12} style={{ color: scoreColor }} />
              <span className="text-white/50">ATS</span>
              <span style={{ color: scoreColor }}>{atsResult.score}</span>
            </button>
            <motion.button onClick={() => navigate(-1)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
              <FiArrowLeft size={15} /> Back
            </motion.button>
          </div>
        </div>
      </motion.nav>

      <div className="pt-[64px] px-6 py-8">
        <div className="max-w-[1600px] mx-auto">
          {/* Step progress */}
          <div className="no-print mb-6">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const active = i === stepIndex;
                const done = i < stepIndex;
                return (
                  <div key={s.id} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1.5">
                      <motion.button onClick={() => setStepIndex(i)} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${active ? 'bg-white text-[#0E1013]' : done ? 'bg-[#F5A524] text-[#161615]' : 'bg-white/5 text-white/30 border border-white/10'}`}>
                        {done ? <FiCheck size={15} /> : <Icon size={14} />}
                      </motion.button>
                      <span className={`text-[10px] tracking-wide uppercase hidden sm:block ${active ? 'text-white font-medium' : 'text-white/30'}`}>{s.label}</span>
                    </div>
                    {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-2 transition-colors ${i < stepIndex ? 'bg-[#F5A524]/60' : 'bg-white/10'}`} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3-col layout: Style (left) · Form (middle, hidden on last) · Preview (right) */}
          <div className={`grid grid-cols-1 gap-6 items-start ${isLast ? 'lg:grid-cols-[320px_1fr] xl:grid-cols-[320px_1fr]' : 'lg:grid-cols-[320px_1fr] xl:grid-cols-[320px_420px_1fr]'}`}>
            {/* LEFT — permanent style panel */}
            <div className={`${isLast ? 'lg:col-span-1 xl:col-span-1' : 'lg:col-span-2 xl:col-span-1'}`}>
              <StylePanel
                customization={customization}
                setCustomization={setCustomization}
                sectionOrder={safeSectionOrder}
                setSectionOrder={setSectionOrder}
                onReset={handleResetCustomization}
                atsResult={atsResult}
                onNavigate={goToStep}
              />
            </div>

            {/* MIDDLE — form (hidden on last step) */}
            {!isLast && (
              <div className="lg:col-span-2 xl:col-span-1">
                <AnimatePresence mode="wait">
                  <motion.div key={step.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}
                    className="bg-[#161615] rounded-3xl p-6 shadow-xl shadow-black/10 no-print">
                    <span className="font-mono-r text-[11px] tracking-[0.2em] text-[#F5A524] uppercase">Step {String(stepIndex + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}</span>
                    <h2 className="font-serif text-2xl font-bold text-white mt-1 mb-1">{step.label}</h2>
                    <p className="text-white/40 text-sm mb-5">
                      {step.id === 'personal' && 'How recruiters will reach you.'}
                      {step.id === 'summary' && 'A punchy 2-3 sentence pitch.'}
                      {step.id === 'experience' && 'Your work history, most recent first.'}
                      {step.id === 'education' && 'Degrees, diplomas, and certifications.'}
                      {step.id === 'skills' && 'Keywords ATS systems scan for.'}
                      {step.id === 'projects' && 'Things you built worth showing off.'}
                    </p>

                    {step.id === 'personal' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Full Name"><input className={inputClass} value={formData.personal.fullName} onChange={(e) => updatePersonal('fullName', e.target.value)} placeholder="Jane Doe" /></Field>
                        <Field label="Email"><input className={inputClass} value={formData.personal.email} onChange={(e) => updatePersonal('email', e.target.value)} placeholder="jane@example.com" /></Field>
                        <Field label="Phone"><input className={inputClass} value={formData.personal.phone} onChange={(e) => updatePersonal('phone', e.target.value)} placeholder="+1 555 000 0000" /></Field>
                        <Field label="Location"><input className={inputClass} value={formData.personal.location} onChange={(e) => updatePersonal('location', e.target.value)} placeholder="City, Country" /></Field>
                        <Field label="LinkedIn"><input className={inputClass} value={formData.personal.linkedin} onChange={(e) => updatePersonal('linkedin', e.target.value)} placeholder="linkedin.com/in/janedoe" /></Field>
                        <Field label="Portfolio / GitHub"><input className={inputClass} value={formData.personal.portfolio} onChange={(e) => updatePersonal('portfolio', e.target.value)} placeholder="github.com/janedoe" /></Field>
                      </div>
                    )}

                    {step.id === 'summary' && (
                      <Field label="Professional Summary">
                        <textarea rows={8} className={inputClass} value={formData.summary} onChange={(e) => setFormData((p) => ({ ...p, summary: e.target.value }))} placeholder="Full-stack developer with..." />
                      </Field>
                    )}

                    {step.id === 'experience' && (
                      <div className="space-y-5">
                        {formData.experience.map((exp, i) => (
                          <div key={exp.id} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium tracking-wider uppercase text-white/30">Role {i + 1}</span>
                              {formData.experience.length > 1 && <button onClick={() => removeListItem('experience', exp.id)} className="text-white/30 hover:text-red-400"><FiTrash2 size={15} /></button>}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <input className={inputClass} placeholder="Job Title" value={exp.title} onChange={(e) => updateListItem('experience', exp.id, 'title', e.target.value)} />
                              <input className={inputClass} placeholder="Company" value={exp.company} onChange={(e) => updateListItem('experience', exp.id, 'company', e.target.value)} />
                              <input className={inputClass} placeholder="Location" value={exp.location} onChange={(e) => updateListItem('experience', exp.id, 'location', e.target.value)} />
                              <div className="flex gap-2">
                                <input className={inputClass} placeholder="Start" value={exp.startDate} onChange={(e) => updateListItem('experience', exp.id, 'startDate', e.target.value)} />
                                <input className={inputClass} placeholder="End" value={exp.current ? 'Present' : exp.endDate} disabled={exp.current} onChange={(e) => updateListItem('experience', exp.id, 'endDate', e.target.value)} />
                              </div>
                            </div>
                            <label className="flex items-center gap-2 text-xs text-white/40 cursor-pointer"><input type="checkbox" checked={exp.current} onChange={(e) => toggleCurrentRole(exp.id, e.target.checked)} className="accent-[#F5A524] w-3.5 h-3.5" />Currently work here</label>
                            <textarea rows={4} className={inputClass} placeholder="One bullet per line..." value={exp.description} onChange={(e) => updateListItem('experience', exp.id, 'description', e.target.value)} />
                          </div>
                        ))}
                        <button onClick={() => addListItem('experience', emptyExperience)} className="w-full inline-flex items-center justify-center gap-2 border border-dashed border-white/15 hover:border-white/30 text-white/50 hover:text-white text-sm py-3 rounded-xl transition-colors"><FiPlus size={15} /> Add another role</button>
                      </div>
                    )}

                    {step.id === 'education' && (
                      <div className="space-y-5">
                        {formData.education.map((edu, i) => (
                          <div key={edu.id} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium tracking-wider uppercase text-white/30">Education {i + 1}</span>
                              {formData.education.length > 1 && <button onClick={() => removeListItem('education', edu.id)} className="text-white/30 hover:text-red-400"><FiTrash2 size={15} /></button>}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <input className={inputClass} placeholder="Institution" value={edu.institution} onChange={(e) => updateListItem('education', edu.id, 'institution', e.target.value)} />
                              <input className={inputClass} placeholder="Degree" value={edu.degree} onChange={(e) => updateListItem('education', edu.id, 'degree', e.target.value)} />
                              <input className={inputClass} placeholder="Field" value={edu.field} onChange={(e) => updateListItem('education', edu.id, 'field', e.target.value)} />
                              <input className={inputClass} placeholder="GPA" value={edu.gpa} onChange={(e) => updateListItem('education', edu.id, 'gpa', e.target.value)} />
                              <input className={inputClass} placeholder="Start Year" value={edu.startDate} onChange={(e) => updateListItem('education', edu.id, 'startDate', e.target.value)} />
                              <input className={inputClass} placeholder="End Year" value={edu.endDate} onChange={(e) => updateListItem('education', edu.id, 'endDate', e.target.value)} />
                            </div>
                          </div>
                        ))}
                        <button onClick={() => addListItem('education', emptyEducation)} className="w-full inline-flex items-center justify-center gap-2 border border-dashed border-white/15 hover:border-white/30 text-white/50 hover:text-white text-sm py-3 rounded-xl transition-colors"><FiPlus size={15} /> Add another degree</button>
                      </div>
                    )}

                    {step.id === 'skills' && (
                      <div>
                        <Field label="Add a skill">
                          <div className="flex gap-2">
                            <input className={inputClass} placeholder="e.g. React.js" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} />
                            <button onClick={addSkill} className="shrink-0 bg-white text-black px-4 rounded-xl text-sm font-medium hover:bg-white/90">Add</button>
                          </div>
                        </Field>
                        <div className="flex flex-wrap gap-2 mt-4">
                          {formData.skills.length === 0 && <p className="text-white/25 text-sm">No skills added yet.</p>}
                          {formData.skills.map((skill) => (
                            <motion.span key={skill} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                              {skill}<button onClick={() => removeSkill(skill)} className="text-white/40 hover:text-white">&times;</button>
                            </motion.span>
                          ))}
                        </div>
                        {formData.skills.length > 0 && formData.skills.length < 6 && (
                          <p className="text-[11px] text-[#F5A524]/80 mt-3">Add {6 - formData.skills.length} more to hit the 6-skill ATS minimum.</p>
                        )}
                      </div>
                    )}

                    {step.id === 'projects' && (
                      <div className="space-y-5">
                        {formData.projects.map((proj, i) => (
                          <div key={proj.id} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium tracking-wider uppercase text-white/30">Project {i + 1}</span>
                              {formData.projects.length > 1 && <button onClick={() => removeListItem('projects', proj.id)} className="text-white/30 hover:text-red-400"><FiTrash2 size={15} /></button>}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <input className={inputClass} placeholder="Project Name" value={proj.name} onChange={(e) => updateListItem('projects', proj.id, 'name', e.target.value)} />
                              <input className={inputClass} placeholder="Tech Stack" value={proj.techStack} onChange={(e) => updateListItem('projects', proj.id, 'techStack', e.target.value)} />
                            </div>
                            <input className={inputClass} placeholder="Live link (optional)" value={proj.link} onChange={(e) => updateListItem('projects', proj.id, 'link', e.target.value)} />
                            <textarea rows={3} className={inputClass} placeholder="Description" value={proj.description} onChange={(e) => updateListItem('projects', proj.id, 'description', e.target.value)} />
                          </div>
                        ))}
                        <button onClick={() => addListItem('projects', emptyProject)} className="w-full inline-flex items-center justify-center gap-2 border border-dashed border-white/15 hover:border-white/30 text-white/50 hover:text-white text-sm py-3 rounded-xl transition-colors"><FiPlus size={15} /> Add another project</button>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-6 pt-5 border-t border-white/10">
                      <button onClick={goBack} disabled={isFirst} className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${isFirst ? 'text-white/15 cursor-not-allowed' : 'text-white/50 hover:text-white'}`}><FiArrowLeft size={15} /> Previous</button>
                      <button onClick={goNext} className="inline-flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full text-sm font-medium hover:bg-white/90">
                        {stepIndex === STEPS.length - 2 ? 'Design & Preview' : 'Next'}<FiArrowRight size={15} />
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            {/* RIGHT — perfect A4 preview */}
            <div className={`${isLast ? 'lg:col-span-1 xl:col-span-1' : 'lg:col-span-2 xl:col-span-1'}`}>
              {isLast && (
                <div className="flex items-center justify-between mb-4 no-print">
                  <div>
                    <span className="font-mono-r text-[11px] tracking-widest uppercase text-white/30">Step {STEPS.length} of {STEPS.length}</span>
                    <h2 className="font-serif text-2xl font-bold text-white mt-1">Your resume is ready</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={goBack} className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white"><FiArrowLeft size={14} /> Edit</button>
                    <motion.button onClick={handleDownload} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-2 bg-white text-[#0E1013] px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/90 shadow-lg shadow-black/40"><FiDownload size={14} /> Download PDF</motion.button>
                  </div>
                </div>
              )}

              {/* Preview toolbar */}
              <div className="flex items-center justify-between mb-3 no-print">
                <div>
                  <span className="font-mono-r text-[11px] tracking-widest uppercase text-white/30">
                    {isLast ? 'Final Preview' : 'Live Preview'}
                  </span>
                  <p className="text-[11px] text-white/25 mt-0.5">Click any field on the page to edit it inline.</p>
                </div>
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-1">
                  <button onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.05).toFixed(2)))} className="text-white/40 hover:text-white p-1"><FiZoomOut size={13} /></button>
                  <span className="text-[11px] text-white/60 font-mono-r w-10 text-center">{Math.round(effectiveScale * 100)}%</span>
                  <button onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.05).toFixed(2)))} className="text-white/40 hover:text-white p-1"><FiZoomIn size={13} /></button>
                </div>
              </div>

              {/* Centered scroll area holding the perfect page */}
              <div className="w-full flex justify-center overflow-auto custom-scroll pb-8" style={{ maxHeight: isLast ? 'calc(100vh - 200px)' : 'calc(100vh - 240px)' }}>
                <div style={{ width: page.w * effectiveScale, height: page.h * effectiveScale, flexShrink: 0 }}>
                  <div
                    id="resume-preview"
                    className="resume-page page-frame origin-top-left"
                    style={{
                      width: page.w,
                      minHeight: page.h,
                      padding: `${pad}px`,
                      transform: `scale(${effectiveScale})`,
                      fontFamily,
                      fontSize,
                      lineHeight,
                      color: customization.textColor || '#1a1a1a',
                      background: pageBackground,
                      transition: 'background 0.2s ease',
                    }}
                  >
                    <TemplateComponent formData={formData} sectionOrder={safeSectionOrder} theme={theme} update={update} />
                  </div>
                </div>
              </div>

              {/* Recommendations — surfaced once the resume is essentially done */}
              {isLast && (
                <RecommendationsPanel formData={formData} atsResult={atsResult} onNavigate={goToStep} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;