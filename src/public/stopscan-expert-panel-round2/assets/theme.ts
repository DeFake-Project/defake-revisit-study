export const SS = {
  primary: '#004cd7',
  primaryContainer: '#2665fd',
  primaryFixed: '#dce1ff',
  ink: '#1f1635',
  muted: '#434655',
  paper: '#fbf8f2',
  cream: '#f6f0e4',
  white: '#ffffff',
  hairline: 'rgba(31, 22, 53, 0.1)',
  shadow: '0 4px 20px -2px rgba(36, 27, 58, 0.08)',
  stop: '#ef4a6b',
  source: '#22b8cf',
  content: '#37b24d',
  alignment: '#ea80dc',
  reflect: '#ff922b',
  fuel: '#f3a530',
  fuelInk: '#6d4400',
  welcome: '#4dabf7',
  error: '#ba1a1a',
} as const;

export type StepIconName = 'stop' | 'source' | 'content' | 'alignment' | 'reflect';

export type PageTheme = {
  accent: string;
  wash: string;
  mid: string;
  tile: string;
  icon?: StepIconName;
};

export const PAGE_THEMES: Record<string, PageTheme> = {
  intro: {
    accent: SS.primary, wash: SS.primaryFixed, mid: '#b5c4ff', tile: SS.primary,
  },
  stop: {
    accent: SS.stop, wash: '#fde7ec', mid: '#f7b7c4', tile: SS.stop, icon: 'stop',
  },
  source: {
    accent: SS.source, wash: '#e3f7fa', mid: '#a5e4ee', tile: SS.source, icon: 'source',
  },
  content: {
    accent: SS.content, wash: '#e5f6e9', mid: '#a9deb4', tile: SS.content, icon: 'content',
  },
  alignment: {
    accent: SS.alignment, wash: '#fceaf9', mid: '#f4c4ef', tile: SS.alignment, icon: 'alignment',
  },
  reflect: {
    accent: SS.reflect, wash: '#fff1e4', mid: '#ffd0a3', tile: SS.reflect, icon: 'reflect',
  },
  run: {
    accent: SS.primary, wash: SS.primaryFixed, mid: '#b5c4ff', tile: SS.primary,
  },
  kept: {
    accent: SS.primary, wash: SS.primaryFixed, mid: '#b5c4ff', tile: SS.primary,
  },
};

export function pageTheme(pageId: string): PageTheme {
  return PAGE_THEMES[pageId] ?? PAGE_THEMES.intro;
}

export function ratingTone(rating: number | null): { background: string; color: string } {
  if (rating == null) {
    return { background: 'transparent', color: SS.muted };
  }
  if (rating <= 2) {
    return { background: SS.cream, color: SS.ink };
  }
  if (rating === 3) {
    return { background: '#e7f4fe', color: '#1864ab' };
  }
  return { background: SS.primary, color: '#ffffff' };
}
