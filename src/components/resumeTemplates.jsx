// components/resumeTemplates.jsx
// Ten resume layouts. Every template receives the same three props:
//   formData     - the wizard's form state (personal/summary/experience/...)
//   sectionOrder - array like ['summary','skills','experience',...] set by
//                  the drag-to-reorder panel
//   theme        - resolved font/size/density/accent from buildTheme()
//
// Templates read theme.accent through a CSS variable (--accent) set once on
// the outer wrapper, so `text-[var(--accent)]` / `bg-[var(--accent)]` /
// `border-[var(--accent)]` stay in sync with the color picker without any
// per-template color logic.

import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiLinkedin,
  FiGlobe,
} from 'react-icons/fi';
import {
  getExperienceItems,
  getProjectItems,
  getEducationItems,
  sectionHasContent,
  dateRange,
  descriptionLines,
} from '../utils/resumeSections';

/* ---------------------------------------------------------------- */
/* Shared bits                                                      */
/* ---------------------------------------------------------------- */

const getContactItems = (p = {}) =>
  [
    p.email && { Icon: FiMail, value: p.email },
    p.phone && { Icon: FiPhone, value: p.phone },
    p.location && { Icon: FiMapPin, value: p.location },
    p.linkedin && { Icon: FiLinkedin, value: p.linkedin },
    p.portfolio && { Icon: FiGlobe, value: p.portfolio },
  ].filter(Boolean);

const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || '\u2013';

/* ---------------------------------------------------------------- */
/* 1. Classic ATS — single column, quiet, safest for parsers        */
/* ---------------------------------------------------------------- */

const ClassicATS = ({ formData, sectionOrder, theme }) => {
  const { personal } = formData;
  const contacts = getContactItems(personal);

  const renderSection = (key) => {
    if (!sectionHasContent(key, formData)) return null;
    if (key === 'summary')
      return (
        <Section theme={theme} title="Summary">
          <p className={`${theme.bodyText} ${theme.lineHeight} text-black/80`}>{formData.summary}</p>
        </Section>
      );
    if (key === 'skills')
      return (
        <Section theme={theme} title="Skills">
          <p className={`${theme.bodyText} text-black/80`}>{formData.skills.join('  \u00b7  ')}</p>
        </Section>
      );
    if (key === 'experience')
      return (
        <Section theme={theme} title="Experience">
          <div className={theme.itemGap}>
            {getExperienceItems(formData).map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline flex-wrap gap-x-2">
                  <p className={`${theme.bodyText} font-semibold`}>
                    {exp.title}
                    {exp.company ? ` \u2014 ${exp.company}` : ''}
                  </p>
                  <span className={`${theme.metaText} text-black/40`}>{dateRange(exp)}</span>
                </div>
                {exp.location && <p className={`${theme.metaText} text-black/40`}>{exp.location}</p>}
                {exp.description && (
                  <ul className="mt-1.5 space-y-1 list-disc list-inside">
                    {descriptionLines(exp.description).map((line, idx) => (
                      <li key={idx} className={`${theme.bodyText} ${theme.lineHeight} text-black/70`}>
                        {line}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Section>
      );
    if (key === 'projects')
      return (
        <Section theme={theme} title="Projects">
          <div className={theme.itemGap}>
            {getProjectItems(formData).map((proj) => (
              <div key={proj.id}>
                <p className={`${theme.bodyText} font-semibold`}>
                  {proj.name}
                  {proj.techStack && <span className="font-normal text-black/50"> \u2014 {proj.techStack}</span>}
                </p>
                {proj.description && (
                  <p className={`${theme.bodyText} ${theme.lineHeight} text-black/70 mt-0.5`}>{proj.description}</p>
                )}
                {proj.link && <p className={`${theme.metaText} text-black/40 mt-0.5`}>{proj.link}</p>}
              </div>
            ))}
          </div>
        </Section>
      );
    if (key === 'education')
      return (
        <Section theme={theme} title="Education">
          <div className="space-y-2">
            {getEducationItems(formData).map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline flex-wrap gap-x-2">
                <p className={theme.bodyText}>
                  <span className="font-semibold">{edu.institution}</span>
                  {edu.degree ? ` \u2014 ${edu.degree}` : ''}
                  {edu.field ? `, ${edu.field}` : ''}
                  {edu.gpa ? ` (${edu.gpa})` : ''}
                </p>
                <span className={`${theme.metaText} text-black/40`}>{dateRange(edu)}</span>
              </div>
            ))}
          </div>
        </Section>
      );
    return null;
  };

  return (
    <div style={{ '--accent': theme.accent }} className={theme.fontClass}>
      <h1 className={`${theme.nameText} font-bold tracking-tight text-black`}>{personal.fullName || 'Your Name'}</h1>
      <div className={`flex flex-wrap gap-x-4 gap-y-1 mt-2.5 ${theme.metaText} text-black/60`}>
        {contacts.map(({ Icon, value }, i) => (
          <span key={i} className="inline-flex items-center gap-1">
            <Icon size={11} /> {value}
          </span>
        ))}
      </div>
      <div className="h-px bg-black/10 mt-4" />
      {sectionOrder.map((key) => (
        <div key={key}>{renderSection(key)}</div>
      ))}
    </div>
  );
};

const Section = ({ theme, title, children }) => (
  <section className={theme.sectionGap}>
    <h2 className={`${theme.headingText} font-bold uppercase tracking-widest text-black`}>{title}</h2>
    <div className="h-[3px] w-6 bg-[var(--accent)] rounded-full mt-1.5 mb-2.5" />
    {children}
  </section>
);

/* ---------------------------------------------------------------- */
/* 2. Modern Two-Column — sidebar (contact/skills/education) + main */
/* ---------------------------------------------------------------- */

const ModernTwoColumn = ({ formData, sectionOrder, theme }) => {
  const { personal } = formData;
  const contacts = getContactItems(personal);
  const mainOrder = sectionOrder.filter((k) => k === 'summary' || k === 'experience' || k === 'projects');

  return (
    <div style={{ '--accent': theme.accent }} className={`${theme.fontClass} grid grid-cols-[1fr_1.6fr] gap-8`}>
      <aside className="border-r border-black/10 pr-6">
        <div className="w-11 h-11 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-semibold text-sm">
          {initials(personal.fullName)}
        </div>
        <h1 className={`${theme.nameText} font-bold tracking-tight text-black mt-3 leading-tight`}>
          {personal.fullName || 'Your Name'}
        </h1>
        <div className={`flex flex-col gap-1.5 mt-3 ${theme.metaText} text-black/60`}>
          {contacts.map(({ Icon, value }, i) => (
            <span key={i} className="inline-flex items-center gap-1.5">
              <Icon size={11} className="shrink-0" /> <span className="break-all">{value}</span>
            </span>
          ))}
        </div>

        {sectionHasContent('skills', formData) && (
          <div className={theme.sectionGap}>
            <h2 className={`${theme.headingText} font-bold uppercase tracking-widest text-[var(--accent)]`}>Skills</h2>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {formData.skills.map((s) => (
                <span key={s} className={`${theme.metaText} bg-black/5 text-black/70 rounded px-2 py-1`}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {sectionHasContent('education', formData) && (
          <div className={theme.sectionGap}>
            <h2 className={`${theme.headingText} font-bold uppercase tracking-widest text-[var(--accent)]`}>Education</h2>
            <div className="mt-2 space-y-3">
              {getEducationItems(formData).map((edu) => (
                <div key={edu.id}>
                  <p className={`${theme.bodyText} font-semibold text-black`}>{edu.institution}</p>
                  <p className={`${theme.metaText} text-black/60`}>
                    {edu.degree}
                    {edu.field ? `, ${edu.field}` : ''}
                  </p>
                  <p className={`${theme.metaText} text-black/40`}>{dateRange(edu)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      <main>
        {mainOrder.map((key) => {
          if (!sectionHasContent(key, formData)) return null;
          if (key === 'summary')
            return (
              <div key={key} className={theme.sectionGap + ' first:mt-0'}>
                <h2 className={`${theme.headingText} font-bold uppercase tracking-widest text-black`}>Summary</h2>
                <p className={`${theme.bodyText} ${theme.lineHeight} text-black/80 mt-2`}>{formData.summary}</p>
              </div>
            );
          if (key === 'experience')
            return (
              <div key={key} className={theme.sectionGap + ' first:mt-0'}>
                <h2 className={`${theme.headingText} font-bold uppercase tracking-widest text-black`}>Experience</h2>
                <div className={`${theme.itemGap} mt-2`}>
                  {getExperienceItems(formData).map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-baseline flex-wrap gap-x-2">
                        <p className={`${theme.bodyText} font-semibold text-black`}>{exp.title}</p>
                        <span className={`${theme.metaText} text-black/40`}>{dateRange(exp)}</span>
                      </div>
                      <p className={`${theme.metaText} text-[var(--accent)]`}>
                        {exp.company}
                        {exp.location ? ` \u00b7 ${exp.location}` : ''}
                      </p>
                      {exp.description && (
                        <ul className="mt-1.5 space-y-1 list-disc list-inside">
                          {descriptionLines(exp.description).map((line, idx) => (
                            <li key={idx} className={`${theme.bodyText} ${theme.lineHeight} text-black/70`}>
                              {line}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          if (key === 'projects')
            return (
              <div key={key} className={theme.sectionGap + ' first:mt-0'}>
                <h2 className={`${theme.headingText} font-bold uppercase tracking-widest text-black`}>Projects</h2>
                <div className={`${theme.itemGap} mt-2`}>
                  {getProjectItems(formData).map((proj) => (
                    <div key={proj.id}>
                      <p className={`${theme.bodyText} font-semibold text-black`}>
                        {proj.name}
                        {proj.techStack && <span className="font-normal text-black/50"> \u2014 {proj.techStack}</span>}
                      </p>
                      {proj.description && (
                        <p className={`${theme.bodyText} ${theme.lineHeight} text-black/70 mt-0.5`}>{proj.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          return null;
        })}
      </main>
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* 3. Compact Technical — dense, mono accents, tech-first            */
/* ---------------------------------------------------------------- */

const CompactTechnical = ({ formData, sectionOrder, theme }) => {
  const { personal } = formData;
  const contacts = getContactItems(personal);

  const renderSection = (key) => {
    if (!sectionHasContent(key, formData)) return null;
    if (key === 'summary')
      return (
        <TightSection theme={theme} title="summary">
          <p className={`${theme.bodyText} ${theme.lineHeight} text-black/80`}>{formData.summary}</p>
        </TightSection>
      );
    if (key === 'skills')
      return (
        <TightSection theme={theme} title="stack">
          <p className={`${theme.bodyText} font-resume-mono text-black/80`}>{formData.skills.join(', ')}</p>
        </TightSection>
      );
    if (key === 'experience')
      return (
        <TightSection theme={theme} title="experience">
          <div className="space-y-2.5">
            {getExperienceItems(formData).map((exp) => (
              <div key={exp.id} className="flex gap-3">
                <span className={`${theme.metaText} font-resume-mono text-black/40 w-28 shrink-0 pt-0.5`}>
                  {dateRange(exp)}
                </span>
                <div>
                  <p className={`${theme.bodyText} font-semibold text-black`}>
                    {exp.title} <span className="font-normal text-black/50">/ {exp.company}</span>
                  </p>
                  {exp.description && (
                    <ul className="mt-1 space-y-0.5">
                      {descriptionLines(exp.description).map((line, idx) => (
                        <li key={idx} className={`${theme.bodyText} ${theme.lineHeight} text-black/70`}>
                          \u2013 {line}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TightSection>
      );
    if (key === 'projects')
      return (
        <TightSection theme={theme} title="projects">
          <div className="space-y-2">
            {getProjectItems(formData).map((proj) => (
              <p key={proj.id} className={`${theme.bodyText} text-black/80`}>
                <span className="font-semibold text-black">{proj.name}</span>
                {proj.techStack && <span className="font-resume-mono text-black/40"> [{proj.techStack}]</span>}
                {proj.description ? ` \u2014 ${proj.description}` : ''}
              </p>
            ))}
          </div>
        </TightSection>
      );
    if (key === 'education')
      return (
        <TightSection theme={theme} title="education">
          <div className="space-y-1">
            {getEducationItems(formData).map((edu) => (
              <p key={edu.id} className={`${theme.bodyText} text-black/80`}>
                <span className="font-semibold text-black">{edu.institution}</span> \u2014 {edu.degree}
                <span className={`${theme.metaText} font-resume-mono text-black/40`}> ({dateRange(edu)})</span>
              </p>
            ))}
          </div>
        </TightSection>
      );
    return null;
  };

  return (
    <div style={{ '--accent': theme.accent }} className={theme.fontClass}>
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h1 className={`${theme.nameText} font-bold text-black`}>{personal.fullName || 'Your Name'}</h1>
        <span className="text-[var(--accent)] font-resume-mono text-xs">/{initials(personal.fullName).toLowerCase()}</span>
      </div>
      <p className={`${theme.metaText} font-resume-mono text-black/50 mt-1`}>
        {contacts.map((c) => c.value).join('  |  ')}
      </p>
      {sectionOrder.map((key) => (
        <div key={key}>{renderSection(key)}</div>
      ))}
    </div>
  );
};

const TightSection = ({ theme, title, children }) => (
  <section className={theme.sectionGap}>
    <h2 className="font-resume-mono text-[10px] tracking-wide text-[var(--accent)] mb-1.5">$ {title}</h2>
    {children}
  </section>
);

/* ---------------------------------------------------------------- */
/* 4. Creative Sidebar — colored left rail, bold header              */
/* ---------------------------------------------------------------- */

const CreativeSidebar = ({ formData, sectionOrder, theme }) => {
  const { personal } = formData;
  const contacts = getContactItems(personal);
  const mainOrder = sectionOrder.filter((k) => k === 'summary' || k === 'experience' || k === 'projects');

  return (
    <div style={{ '--accent': theme.accent }} className={`${theme.fontClass} grid grid-cols-[0.9fr_1.7fr]`}>
      <aside className="bg-[var(--accent)]/10 rounded-2xl p-5 -m-1">
        <div className="w-12 h-12 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center font-bold">
          {initials(personal.fullName)}
        </div>
        <h1 className={`${theme.nameText} font-bold text-black mt-4 leading-tight`}>{personal.fullName || 'Your Name'}</h1>
        <div className={`flex flex-col gap-2 mt-4 ${theme.metaText} text-black/70`}>
          {contacts.map(({ Icon, value }, i) => (
            <span key={i} className="inline-flex items-center gap-2">
              <Icon size={12} className="text-[var(--accent)] shrink-0" /> <span className="break-all">{value}</span>
            </span>
          ))}
        </div>
        {sectionHasContent('skills', formData) && (
          <div className="mt-6">
            <h2 className={`${theme.headingText} font-bold text-black`}>Skills</h2>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {formData.skills.map((s) => (
                <span key={s} className={`${theme.metaText} bg-white text-black/70 rounded-full px-2.5 py-1`}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
        {sectionHasContent('education', formData) && (
          <div className="mt-6">
            <h2 className={`${theme.headingText} font-bold text-black`}>Education</h2>
            <div className="mt-2 space-y-3">
              {getEducationItems(formData).map((edu) => (
                <div key={edu.id}>
                  <p className={`${theme.bodyText} font-semibold text-black`}>{edu.institution}</p>
                  <p className={`${theme.metaText} text-black/60`}>{edu.degree}</p>
                  <p className={`${theme.metaText} text-black/40`}>{dateRange(edu)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      <main className="pl-7">
        {mainOrder.map((key) => {
          if (!sectionHasContent(key, formData)) return null;
          if (key === 'summary')
            return (
              <div key={key} className="mb-6">
                <h2 className={`${theme.headingText} font-bold text-[var(--accent)]`}>About</h2>
                <p className={`${theme.bodyText} ${theme.lineHeight} text-black/80 mt-1.5`}>{formData.summary}</p>
              </div>
            );
          if (key === 'experience')
            return (
              <div key={key} className={theme.sectionGap}>
                <h2 className={`${theme.headingText} font-bold text-[var(--accent)]`}>Experience</h2>
                <div className={`${theme.itemGap} mt-2`}>
                  {getExperienceItems(formData).map((exp) => (
                    <div key={exp.id} className="border-l-2 border-[var(--accent)]/30 pl-4">
                      <p className={`${theme.bodyText} font-bold text-black`}>{exp.title}</p>
                      <div className="flex justify-between flex-wrap gap-x-2">
                        <p className={`${theme.metaText} text-black/60`}>{exp.company}</p>
                        <p className={`${theme.metaText} text-black/40`}>{dateRange(exp)}</p>
                      </div>
                      {exp.description && (
                        <ul className="mt-1.5 space-y-1 list-disc list-inside">
                          {descriptionLines(exp.description).map((line, idx) => (
                            <li key={idx} className={`${theme.bodyText} ${theme.lineHeight} text-black/70`}>
                              {line}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          if (key === 'projects')
            return (
              <div key={key} className={theme.sectionGap}>
                <h2 className={`${theme.headingText} font-bold text-[var(--accent)]`}>Projects</h2>
                <div className={`${theme.itemGap} mt-2`}>
                  {getProjectItems(formData).map((proj) => (
                    <div key={proj.id} className="border-l-2 border-[var(--accent)]/30 pl-4">
                      <p className={`${theme.bodyText} font-bold text-black`}>{proj.name}</p>
                      {proj.techStack && <p className={`${theme.metaText} text-black/50`}>{proj.techStack}</p>}
                      {proj.description && (
                        <p className={`${theme.bodyText} ${theme.lineHeight} text-black/70 mt-0.5`}>{proj.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          return null;
        })}
      </main>
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* 5. Minimal Grid — header band, rule-divided sections, airy        */
/* ---------------------------------------------------------------- */

const MinimalGrid = ({ formData, sectionOrder, theme }) => {
  const { personal } = formData;
  const contacts = getContactItems(personal);

  const renderSection = (key) => {
    if (!sectionHasContent(key, formData)) return null;
    const title = { summary: 'Summary', skills: 'Skills', experience: 'Experience', projects: 'Projects', education: 'Education' }[key];
    let body = null;
    if (key === 'summary') body = <p className={`${theme.bodyText} ${theme.lineHeight} text-black/80`}>{formData.summary}</p>;
    if (key === 'skills')
      body = (
        <div className="flex flex-wrap gap-x-6 gap-y-1.5">
          {formData.skills.map((s) => (
            <span key={s} className={`${theme.bodyText} text-black/80`}>{s}</span>
          ))}
        </div>
      );
    if (key === 'experience')
      body = (
        <div className={theme.itemGap}>
          {getExperienceItems(formData).map((exp) => (
            <div key={exp.id} className="grid grid-cols-[1fr_auto] gap-x-3">
              <div>
                <p className={`${theme.bodyText} font-semibold text-black`}>
                  {exp.title}{exp.company ? `, ${exp.company}` : ''}
                </p>
                {exp.description && (
                  <ul className="mt-1 space-y-1 list-disc list-inside">
                    {descriptionLines(exp.description).map((line, idx) => (
                      <li key={idx} className={`${theme.bodyText} ${theme.lineHeight} text-black/70`}>{line}</li>
                    ))}
                  </ul>
                )}
              </div>
              <span className={`${theme.metaText} text-black/40 whitespace-nowrap`}>{dateRange(exp)}</span>
            </div>
          ))}
        </div>
      );
    if (key === 'projects')
      body = (
        <div className={theme.itemGap}>
          {getProjectItems(formData).map((proj) => (
            <div key={proj.id}>
              <p className={`${theme.bodyText} font-semibold text-black`}>{proj.name}</p>
              {proj.description && <p className={`${theme.bodyText} ${theme.lineHeight} text-black/70`}>{proj.description}</p>}
            </div>
          ))}
        </div>
      );
    if (key === 'education')
      body = (
        <div className="space-y-2">
          {getEducationItems(formData).map((edu) => (
            <div key={edu.id} className="grid grid-cols-[1fr_auto] gap-x-3">
              <p className={`${theme.bodyText} text-black/80`}>{edu.institution}, {edu.degree}</p>
              <span className={`${theme.metaText} text-black/40`}>{dateRange(edu)}</span>
            </div>
          ))}
        </div>
      );
    return (
      <section className={theme.sectionGap + ' pt-5 border-t border-black/10'}>
        <h2 className={`${theme.headingText} font-semibold text-[var(--accent)] mb-2.5`}>{title}</h2>
        {body}
      </section>
    );
  };

  return (
    <div style={{ '--accent': theme.accent }} className={theme.fontClass}>
      <div className="text-center">
        <h1 className={`${theme.nameText} font-bold text-black`}>{personal.fullName || 'Your Name'}</h1>
        <div className={`flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 ${theme.metaText} text-black/50`}>
          {contacts.map(({ value }, i) => (
            <span key={i}>{value}</span>
          ))}
        </div>
      </div>
      {sectionOrder.map((key) => (
        <div key={key}>{renderSection(key)}</div>
      ))}
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* 6. Executive Serif — centered display name, senior/leadership     */
/* ---------------------------------------------------------------- */

const ExecutiveSerif = ({ formData, sectionOrder, theme }) => {
  const { personal } = formData;
  const contacts = getContactItems(personal);

  const renderSection = (key) => {
    if (!sectionHasContent(key, formData)) return null;
    const title = { summary: 'Profile', skills: 'Core Competencies', experience: 'Professional Experience', projects: 'Selected Work', education: 'Education' }[key];
    let body = null;
    if (key === 'summary') body = <p className={`${theme.bodyText} ${theme.lineHeight} text-black/80 text-center max-w-xl mx-auto`}>{formData.summary}</p>;
    if (key === 'skills')
      body = (
        <p className={`${theme.bodyText} text-black/80 text-center`}>{formData.skills.join('   \u2022   ')}</p>
      );
    if (key === 'experience')
      body = (
        <div className={theme.itemGap}>
          {getExperienceItems(formData).map((exp) => (
            <div key={exp.id}>
              <div className="flex justify-between items-baseline">
                <p className={`${theme.bodyText} font-bold text-black tracking-wide`}>{exp.title}</p>
                <span className={`${theme.metaText} text-black/40`}>{dateRange(exp)}</span>
              </div>
              <p className={`${theme.metaText} text-black/50 italic`}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
              {exp.description && (
                <ul className="mt-1.5 space-y-1 list-disc list-inside">
                  {descriptionLines(exp.description).map((line, idx) => (
                    <li key={idx} className={`${theme.bodyText} ${theme.lineHeight} text-black/70`}>{line}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      );
    if (key === 'projects')
      body = (
        <div className={theme.itemGap}>
          {getProjectItems(formData).map((proj) => (
            <p key={proj.id} className={`${theme.bodyText} text-black/80`}>
              <span className="font-bold text-black">{proj.name}.</span> {proj.description}
            </p>
          ))}
        </div>
      );
    if (key === 'education')
      body = (
        <div className="space-y-1.5 text-center">
          {getEducationItems(formData).map((edu) => (
            <p key={edu.id} className={`${theme.bodyText} text-black/80`}>
              {edu.degree}{edu.field ? `, ${edu.field}` : ''} \u2014 {edu.institution} ({dateRange(edu)})
            </p>
          ))}
        </div>
      );
    return (
      <section className={theme.sectionGap}>
        <h2 className={`${theme.headingText} font-semibold tracking-[0.15em] text-black text-center`}>{title}</h2>
        <div className="h-px w-10 bg-[var(--accent)] mx-auto mt-2 mb-3" />
        {body}
      </section>
    );
  };

  return (
    <div style={{ '--accent': theme.accent }} className={`${theme.fontClass} font-resume-serif`}>
      <div className="text-center">
        <h1 className={`${theme.nameText} font-bold text-black tracking-wide`}>{personal.fullName || 'Your Name'}</h1>
        <div className={`flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2 ${theme.metaText} text-black/50`}>
          {contacts.map(({ value }, i) => (
            <span key={i}>{i > 0 && '\u00b7 '}{value}</span>
          ))}
        </div>
      </div>
      {sectionOrder.map((key) => (
        <div key={key}>{renderSection(key)}</div>
      ))}
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* 7. Timeline — vertical line + dot markers for dated sections      */
/* ---------------------------------------------------------------- */

const TimelineLayout = ({ formData, sectionOrder, theme }) => {
  const { personal } = formData;
  const contacts = getContactItems(personal);

  const TimelineList = ({ items, renderItem }) => (
    <div className="relative pl-5">
      <div className="absolute left-[3px] top-1.5 bottom-1.5 w-px bg-black/10" />
      <div className={theme.itemGap}>
        {items.map((item) => (
          <div key={item.id} className="relative">
            <span className="absolute -left-5 top-1.5 w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );

  const renderSection = (key) => {
    if (!sectionHasContent(key, formData)) return null;
    if (key === 'summary')
      return (
        <Sec theme={theme} title="Summary">
          <p className={`${theme.bodyText} ${theme.lineHeight} text-black/80`}>{formData.summary}</p>
        </Sec>
      );
    if (key === 'skills')
      return (
        <Sec theme={theme} title="Skills">
          <div className="flex flex-wrap gap-1.5">
            {formData.skills.map((s) => (
              <span key={s} className={`${theme.metaText} border border-black/15 text-black/70 rounded-full px-2.5 py-1`}>{s}</span>
            ))}
          </div>
        </Sec>
      );
    if (key === 'experience')
      return (
        <Sec theme={theme} title="Experience">
          <TimelineList
            items={getExperienceItems(formData)}
            renderItem={(exp) => (
              <>
                <div className="flex justify-between items-baseline flex-wrap gap-x-2">
                  <p className={`${theme.bodyText} font-semibold text-black`}>{exp.title} \u2014 {exp.company}</p>
                  <span className={`${theme.metaText} text-black/40`}>{dateRange(exp)}</span>
                </div>
                {exp.description && (
                  <ul className="mt-1 space-y-1 list-disc list-inside">
                    {descriptionLines(exp.description).map((line, idx) => (
                      <li key={idx} className={`${theme.bodyText} ${theme.lineHeight} text-black/70`}>{line}</li>
                    ))}
                  </ul>
                )}
              </>
            )}
          />
        </Sec>
      );
    if (key === 'projects')
      return (
        <Sec theme={theme} title="Projects">
          <TimelineList
            items={getProjectItems(formData)}
            renderItem={(proj) => (
              <>
                <p className={`${theme.bodyText} font-semibold text-black`}>{proj.name}</p>
                {proj.description && <p className={`${theme.bodyText} ${theme.lineHeight} text-black/70`}>{proj.description}</p>}
              </>
            )}
          />
        </Sec>
      );
    if (key === 'education')
      return (
        <Sec theme={theme} title="Education">
          <TimelineList
            items={getEducationItems(formData)}
            renderItem={(edu) => (
              <div className="flex justify-between items-baseline flex-wrap gap-x-2">
                <p className={`${theme.bodyText} text-black/80`}>{edu.institution} \u2014 {edu.degree}</p>
                <span className={`${theme.metaText} text-black/40`}>{dateRange(edu)}</span>
              </div>
            )}
          />
        </Sec>
      );
    return null;
  };

  return (
    <div style={{ '--accent': theme.accent }} className={theme.fontClass}>
      <h1 className={`${theme.nameText} font-bold text-black`}>{personal.fullName || 'Your Name'}</h1>
      <div className={`flex flex-wrap gap-x-4 gap-y-1 mt-2 ${theme.metaText} text-black/50`}>
        {contacts.map(({ value }, i) => (
          <span key={i}>{value}</span>
        ))}
      </div>
      {sectionOrder.map((key) => (
        <div key={key}>{renderSection(key)}</div>
      ))}
    </div>
  );
};

const Sec = ({ theme, title, children }) => (
  <section className={theme.sectionGap}>
    <h2 className={`${theme.headingText} font-bold uppercase tracking-widest text-black/70 mb-2`}>{title}</h2>
    {children}
  </section>
);

/* ---------------------------------------------------------------- */
/* 8. Two-Tone Header — full-width colored header block              */
/* ---------------------------------------------------------------- */

const TwoToneHeader = ({ formData, sectionOrder, theme }) => {
  const { personal } = formData;
  const contacts = getContactItems(personal);

  const renderSection = (key) => {
    if (!sectionHasContent(key, formData)) return null;
    const title = { summary: 'Summary', skills: 'Skills', experience: 'Experience', projects: 'Projects', education: 'Education' }[key];
    let body = null;
    if (key === 'summary') body = <p className={`${theme.bodyText} ${theme.lineHeight} text-black/80`}>{formData.summary}</p>;
    if (key === 'skills')
      body = <p className={`${theme.bodyText} text-black/80`}>{formData.skills.join('  \u00b7  ')}</p>;
    if (key === 'experience')
      body = (
        <div className={theme.itemGap}>
          {getExperienceItems(formData).map((exp) => (
            <div key={exp.id}>
              <div className="flex justify-between items-baseline flex-wrap gap-x-2">
                <p className={`${theme.bodyText} font-semibold text-black`}>{exp.title} \u2014 {exp.company}</p>
                <span className={`${theme.metaText} text-black/40`}>{dateRange(exp)}</span>
              </div>
              {exp.description && (
                <ul className="mt-1.5 space-y-1 list-disc list-inside">
                  {descriptionLines(exp.description).map((line, idx) => (
                    <li key={idx} className={`${theme.bodyText} ${theme.lineHeight} text-black/70`}>{line}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      );
    if (key === 'projects')
      body = (
        <div className={theme.itemGap}>
          {getProjectItems(formData).map((proj) => (
            <div key={proj.id}>
              <p className={`${theme.bodyText} font-semibold text-black`}>{proj.name}</p>
              {proj.description && <p className={`${theme.bodyText} ${theme.lineHeight} text-black/70`}>{proj.description}</p>}
            </div>
          ))}
        </div>
      );
    if (key === 'education')
      body = (
        <div className="space-y-1.5">
          {getEducationItems(formData).map((edu) => (
            <p key={edu.id} className={`${theme.bodyText} text-black/80`}>
              {edu.institution} \u2014 {edu.degree} <span className={`${theme.metaText} text-black/40`}>({dateRange(edu)})</span>
            </p>
          ))}
        </div>
      );
    return (
      <section className={theme.sectionGap + ' px-8'}>
        <h2 className={`${theme.headingText} font-bold uppercase tracking-widest text-[var(--accent)] mb-2`}>{title}</h2>
        {body}
      </section>
    );
  };

  return (
    <div style={{ '--accent': theme.accent }} className={`${theme.fontClass} -m-10 mb-0`}>
      <div className="bg-[var(--accent)] text-white px-8 py-8 rounded-t-2xl">
        <h1 className={`${theme.nameText} font-bold`}>{personal.fullName || 'Your Name'}</h1>
        <div className={`flex flex-wrap gap-x-4 gap-y-1 mt-2 ${theme.metaText} text-white/85`}>
          {contacts.map(({ value }, i) => (
            <span key={i}>{value}</span>
          ))}
        </div>
      </div>
      <div className="pb-8">{sectionOrder.map((key) => <div key={key}>{renderSection(key)}</div>)}</div>
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* 9. Skills-First Technical — stack right under header              */
/* ---------------------------------------------------------------- */

const SkillsFirstTechnical = ({ formData, sectionOrder, theme }) => {
  const { personal } = formData;
  const contacts = getContactItems(personal);
  const restOrder = sectionOrder.filter((k) => k !== 'skills');

  const renderSection = (key) => {
    if (!sectionHasContent(key, formData)) return null;
    if (key === 'summary')
      return (
        <Sec theme={theme} title="Summary">
          <p className={`${theme.bodyText} ${theme.lineHeight} text-black/80`}>{formData.summary}</p>
        </Sec>
      );
    if (key === 'experience')
      return (
        <Sec theme={theme} title="Experience">
          <div className={theme.itemGap}>
            {getExperienceItems(formData).map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline flex-wrap gap-x-2">
                  <p className={`${theme.bodyText} font-semibold text-black`}>{exp.title}</p>
                  <span className={`${theme.metaText} font-resume-mono text-black/40`}>{dateRange(exp)}</span>
                </div>
                <p className={`${theme.metaText} text-[var(--accent)]`}>{exp.company}</p>
                {exp.description && (
                  <ul className="mt-1.5 space-y-1 list-disc list-inside">
                    {descriptionLines(exp.description).map((line, idx) => (
                      <li key={idx} className={`${theme.bodyText} ${theme.lineHeight} text-black/70`}>{line}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Sec>
      );
    if (key === 'projects')
      return (
        <Sec theme={theme} title="Projects">
          <div className={theme.itemGap}>
            {getProjectItems(formData).map((proj) => (
              <div key={proj.id}>
                <p className={`${theme.bodyText} font-semibold text-black`}>
                  {proj.name}
                  {proj.techStack && <span className="font-resume-mono font-normal text-black/40 text-xs"> {proj.techStack}</span>}
                </p>
                {proj.description && <p className={`${theme.bodyText} ${theme.lineHeight} text-black/70`}>{proj.description}</p>}
              </div>
            ))}
          </div>
        </Sec>
      );
    if (key === 'education')
      return (
        <Sec theme={theme} title="Education">
          <div className="space-y-1">
            {getEducationItems(formData).map((edu) => (
              <p key={edu.id} className={`${theme.bodyText} text-black/80`}>{edu.institution} \u2014 {edu.degree}</p>
            ))}
          </div>
        </Sec>
      );
    return null;
  };

  return (
    <div style={{ '--accent': theme.accent }} className={theme.fontClass}>
      <h1 className={`${theme.nameText} font-bold text-black`}>{personal.fullName || 'Your Name'}</h1>
      <div className={`flex flex-wrap gap-x-4 gap-y-1 mt-2 ${theme.metaText} text-black/50`}>
        {contacts.map(({ value }, i) => (
          <span key={i}>{value}</span>
        ))}
      </div>
      {sectionHasContent('skills', formData) && (
        <div className="flex flex-wrap gap-1.5 mt-4 p-3 bg-black/[0.03] rounded-xl">
          {formData.skills.map((s) => (
            <span key={s} className={`${theme.metaText} font-resume-mono bg-white border border-black/10 text-black/70 rounded px-2 py-1`}>
              {s}
            </span>
          ))}
        </div>
      )}
      {restOrder.map((key) => (
        <div key={key}>{renderSection(key)}</div>
      ))}
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* 10. Photo/Contact Card — rounded contact card, EU-CV style        */
/* ---------------------------------------------------------------- */

const PhotoContactCard = ({ formData, sectionOrder, theme }) => {
  const { personal } = formData;
  const contacts = getContactItems(personal);

  const renderSection = (key) => {
    if (!sectionHasContent(key, formData)) return null;
    const title = { summary: 'Summary', skills: 'Skills', experience: 'Experience', projects: 'Projects', education: 'Education' }[key];
    let body = null;
    if (key === 'summary') body = <p className={`${theme.bodyText} ${theme.lineHeight} text-black/80`}>{formData.summary}</p>;
    if (key === 'skills')
      body = (
        <div className="flex flex-wrap gap-1.5">
          {formData.skills.map((s) => (
            <span key={s} className={`${theme.metaText} bg-[var(--accent)]/10 text-[var(--accent)] rounded-full px-2.5 py-1`}>{s}</span>
          ))}
        </div>
      );
    if (key === 'experience')
      body = (
        <div className={theme.itemGap}>
          {getExperienceItems(formData).map((exp) => (
            <div key={exp.id}>
              <div className="flex justify-between items-baseline flex-wrap gap-x-2">
                <p className={`${theme.bodyText} font-semibold text-black`}>{exp.title}, {exp.company}</p>
                <span className={`${theme.metaText} text-black/40`}>{dateRange(exp)}</span>
              </div>
              {exp.description && (
                <ul className="mt-1.5 space-y-1 list-disc list-inside">
                  {descriptionLines(exp.description).map((line, idx) => (
                    <li key={idx} className={`${theme.bodyText} ${theme.lineHeight} text-black/70`}>{line}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      );
    if (key === 'projects')
      body = (
        <div className={theme.itemGap}>
          {getProjectItems(formData).map((proj) => (
            <div key={proj.id}>
              <p className={`${theme.bodyText} font-semibold text-black`}>{proj.name}</p>
              {proj.description && <p className={`${theme.bodyText} ${theme.lineHeight} text-black/70`}>{proj.description}</p>}
            </div>
          ))}
        </div>
      );
    if (key === 'education')
      body = (
        <div className="space-y-1.5">
          {getEducationItems(formData).map((edu) => (
            <p key={edu.id} className={`${theme.bodyText} text-black/80`}>{edu.institution} \u2014 {edu.degree} ({dateRange(edu)})</p>
          ))}
        </div>
      );
    return (
      <section className={theme.sectionGap}>
        <h2 className={`${theme.headingText} font-bold text-black mb-2`}>{title}</h2>
        {body}
      </section>
    );
  };

  return (
    <div style={{ '--accent': theme.accent }} className={theme.fontClass}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <h1 className={`${theme.nameText} font-bold text-black leading-tight`}>{personal.fullName || 'Your Name'}</h1>
        <div className="bg-black/[0.03] border border-black/10 rounded-2xl p-4 min-w-[220px]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-xs font-semibold shrink-0">
              {initials(personal.fullName)}
            </div>
            <p className={`${theme.metaText} font-semibold text-black`}>Contact</p>
          </div>
          <div className={`flex flex-col gap-1 ${theme.metaText} text-black/60`}>
            {contacts.map(({ value }, i) => (
              <span key={i} className="break-all">{value}</span>
            ))}
          </div>
        </div>
      </div>
      {sectionOrder.map((key) => (
        <div key={key}>{renderSection(key)}</div>
      ))}
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* Registry                                                          */
/* ---------------------------------------------------------------- */

export const TEMPLATES = [
  { id: 'classic-ats', name: 'Classic ATS', description: 'Single column, safest for parsers.', Component: ClassicATS },
  { id: 'modern-two-column', name: 'Modern Two-Column', description: 'Sidebar + main content.', Component: ModernTwoColumn },
  { id: 'compact-technical', name: 'Compact Technical', description: 'Dense, mono accents.', Component: CompactTechnical },
  { id: 'creative-sidebar', name: 'Creative Sidebar', description: 'Colored rail, bold header.', Component: CreativeSidebar },
  { id: 'minimal-grid', name: 'Minimal Grid', description: 'Centered header, airy rules.', Component: MinimalGrid },
  { id: 'executive-serif', name: 'Executive Serif', description: 'Centered display serif.', Component: ExecutiveSerif },
  { id: 'timeline', name: 'Timeline', description: 'Vertical timeline markers.', Component: TimelineLayout },
  { id: 'two-tone-header', name: 'Two-Tone Header', description: 'Full-width color header band.', Component: TwoToneHeader },
  { id: 'skills-first-technical', name: 'Skills-First Technical', description: 'Stack pinned under header.', Component: SkillsFirstTechnical },
  { id: 'photo-contact-card', name: 'Photo/Contact Card', description: 'EU-style contact card.', Component: PhotoContactCard },
];

export const getTemplateById = (id) => TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];