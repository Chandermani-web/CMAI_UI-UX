// utils/resumeSections.js
// Shared helpers so every template reads formData the same way.

export const DEFAULT_SECTION_ORDER = ['summary', 'skills', 'experience', 'projects', 'education'];

export const SECTION_LABELS = {
  summary: 'Summary',
  skills: 'Skills',
  experience: 'Experience',
  projects: 'Projects',
  education: 'Education',
};

export const sectionHasContent = (key, formData) => {
  switch (key) {
    case 'summary':
      return !!formData.summary?.trim();
    case 'skills':
      return (formData.skills || []).length > 0;
    case 'experience':
      return (formData.experience || []).some((e) => e.title || e.company);
    case 'projects':
      return (formData.projects || []).some((p) => p.name);
    case 'education':
      return (formData.education || []).some((e) => e.institution);
    default:
      return false;
  }
};

export const getExperienceItems = (formData) =>
  (formData.experience || []).filter((e) => e.title || e.company);

export const getProjectItems = (formData) =>
  (formData.projects || []).filter((p) => p.name);

export const getEducationItems = (formData) =>
  (formData.education || []).filter((e) => e.institution);

export const dateRange = (item) => {
  const end = item.current ? 'Present' : item.endDate || '';
  const dash = item.startDate || end ? ' \u2013 ' : '';
  return `${item.startDate || ''}${item.startDate && end ? dash : ''}${end}`.trim();
};

export const descriptionLines = (text) =>
  (text || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

// Ensures a persisted/older sectionOrder array still contains every known
// section exactly once, even if new sections were added since it was saved.
export const normalizeSectionOrder = (order) => {
  const safe = Array.isArray(order) ? order.filter((k) => DEFAULT_SECTION_ORDER.includes(k)) : [];
  const missing = DEFAULT_SECTION_ORDER.filter((k) => !safe.includes(k));
  return [...safe, ...missing];
};