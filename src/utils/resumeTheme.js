// utils/resumeTheme.js
// Font / size / density / color options for the resume customizer, plus a
// single buildTheme() call that resolves the chosen ids into concrete
// class names + values every template component consumes.

export const FONT_OPTIONS = [
  { id: 'sans', label: 'Sans', sample: 'Aa', className: 'font-resume-sans' },
  { id: 'serif', label: 'Serif', sample: 'Aa', className: 'font-resume-serif' },
  { id: 'mono', label: 'Mono', sample: 'Aa', className: 'font-resume-mono' },
];

export const SIZE_OPTIONS = [
  { id: 'compact', label: 'Compact', body: 'text-[12.5px]', name: 'text-[22px]', heading: 'text-[10.5px]', meta: 'text-[10px]' },
  { id: 'normal', label: 'Normal', body: 'text-[13.5px]', name: 'text-[26px]', heading: 'text-[11.5px]', meta: 'text-[11px]' },
  { id: 'large', label: 'Large', body: 'text-[15px]', name: 'text-[30px]', heading: 'text-[13px]', meta: 'text-[12px]' },
];

export const DENSITY_OPTIONS = [
  { id: 'compact', label: 'Compact', sectionGap: 'mt-4', itemGap: 'space-y-2', lineHeight: 'leading-snug', pad: 'p-7' },
  { id: 'comfortable', label: 'Comfortable', sectionGap: 'mt-6', itemGap: 'space-y-3.5', lineHeight: 'leading-relaxed', pad: 'p-10' },
  { id: 'spacious', label: 'Spacious', sectionGap: 'mt-9', itemGap: 'space-y-5', lineHeight: 'leading-loose', pad: 'p-12' },
];

export const COLOR_OPTIONS = [
  { id: 'amber', hex: '#F5A524' },
  { id: 'blue', hex: '#2563EB' },
  { id: 'emerald', hex: '#059669' },
  { id: 'rose', hex: '#DC2626' },
  { id: 'violet', hex: '#7C3AED' },
  { id: 'slate', hex: '#334155' },
];

// The glyph that leads each bullet point. '∅' renders as a plain,
// glyph-free list — the safest choice for strict ATS parsers that choke on
// non-standard bullet characters.
export const BULLET_OPTIONS = [
  { id: '•', label: 'Dot' },
  { id: '▸', label: 'Arrow' },
  { id: '–', label: 'Dash' },
  { id: '✓', label: 'Check' },
  { id: '∅', label: 'Plain' },
];

export const DEFAULT_CUSTOMIZATION = {
  templateId: 'classic-ats',
  fontFamily: 'sans',
  fontSize: 'normal',
  density: 'comfortable',
  accentColor: COLOR_OPTIONS[0].hex,
  textColor: '#111111',
  colorTheme: 'light',
  nameWeight: 'bold',
  headingCase: 'uppercase',
  headingStyle: 'underline',
  headingAlign: 'left',
  bulletGlyph: '•',
  lineHeight: 'normal',
  pageSize: 'a4',
  pageMargin: 'normal',
};

export const buildTheme = (customization = {}) => {
  const merged = { ...DEFAULT_CUSTOMIZATION, ...customization };
  const {
    fontFamily, fontSize, density, accentColor, textColor, colorTheme,
    headingStyle, headingAlign, headingCase, bulletGlyph, nameWeight,
  } = merged;

  const font = FONT_OPTIONS.find((f) => f.id === fontFamily) || FONT_OPTIONS[0];
  const size = SIZE_OPTIONS.find((s) => s.id === fontSize) || SIZE_OPTIONS[1];
  const dens = DENSITY_OPTIONS.find((d) => d.id === density) || DENSITY_OPTIONS[1];

  return {
    // Class-token shape — consumed by components/resumeTemplates.jsx
    fontClass: font.className,
    bodyText: size.body,
    nameText: size.name,
    headingText: size.heading,
    metaText: size.meta,
    sectionGap: dens.sectionGap,
    itemGap: dens.itemGap,
    lineHeight: dens.lineHeight,
    pad: dens.pad,
    accent: accentColor,

    // Raw-value shape — consumed by the inline templates in pages/ResumeBuilder.jsx
    accentColor,
    textColor,
    colorTheme,
    headingStyle,
    headingAlign,
    headingCase,
    bulletGlyph,
    nameWeight,
  };
};