import type { ITheme } from 'survey-core'

// SurveyJS design tokens. Page-level colours live in index.css; keep the brand colour in sync with --berry there.
export const theme: ITheme = {
  themeName: 'default',
  colorPalette: 'light',
  isPanelless: false,
  cssVariables: {
    '--sjs2-color-project-brand-600': '#8a2e5c',
    '--sjs2-color-utility-surface-survey': 'transparent',
    '--sjs2-typography-font-family-text': "'DM Sans Variable', system-ui, sans-serif",
    '--sjs2-typography-font-family-component-page-title': "'Fraunces Variable', Georgia, serif",
    '--sjs2-base-unit-radius': '10px',
  },
}
