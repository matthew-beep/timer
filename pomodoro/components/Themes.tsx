export type Theme = {
  name: string;
  colors: {
    bg: string;
    c0: string;
    c1: string;
    c2: string;
    c3: string;
    c4: string;
    c5: string;
  };
  preview: string[];
};

export const themes: Theme[] = [
  {
    name: 'Default',
    colors: {
      bg: 'hsla(210, 100%, 10%, 1)',
      c0: 'hsla(0, 0%, 100%, 0.7)',
      c1: 'hsla(210, 100%, 5%, 1)',
      c2: 'hsla(210, 100%, 10%, 1)',
      c3: 'hsla(358, 75%, 83%, 0.9)',
      c4: 'hsla(180, 100%, 50%, 0.7)',
      c5: 'hsla(206, 100%, 36%, 1)',
    },
    preview: ['#0a1929', '#22d3ee', '#f472b6', '#ffffff'],
  },
  {
    name: 'Ocean',
    colors: {
      bg: 'hsla(200, 100%, 8%, 1)',
      c0: 'hsla(180, 100%, 90%, 0.6)',
      c1: 'hsla(200, 100%, 12%, 1)',
      c2: 'hsla(195, 100%, 15%, 1)',
      c3: 'hsla(175, 80%, 60%, 0.8)',
      c4: 'hsla(190, 100%, 45%, 0.7)',
      c5: 'hsla(200, 100%, 30%, 1)',
    },
    preview: ['#001a33', '#06b6d4', '#14b8a6', '#67e8f9'],
  },
  {
    name: 'Sunset',
    colors: {
      bg: 'hsla(280, 60%, 8%, 1)',
      c0: 'hsla(30, 100%, 85%, 0.6)',
      c1: 'hsla(280, 60%, 10%, 1)',
      c2: 'hsla(270, 70%, 12%, 1)',
      c3: 'hsla(340, 90%, 70%, 0.9)',
      c4: 'hsla(25, 100%, 60%, 0.7)',
      c5: 'hsla(260, 80%, 45%, 1)',
    },
    preview: ['#1a0a33', '#a855f7', '#fb923c', '#f472b6'],
  },
  {
    name: 'Forest',
    colors: {
      bg: 'hsla(150, 50%, 8%, 1)',
      c0: 'hsla(120, 60%, 90%, 0.5)',
      c1: 'hsla(150, 50%, 10%, 1)',
      c2: 'hsla(145, 60%, 12%, 1)',
      c3: 'hsla(160, 70%, 65%, 0.8)',
      c4: 'hsla(140, 80%, 50%, 0.7)',
      c5: 'hsla(155, 70%, 35%, 1)',
    },
    preview: ['#0a1f14', '#10b981', '#34d399', '#6ee7b7'],
  },
  {
    name: 'Midnight',
    colors: {
      bg: 'hsla(260, 70%, 8%, 1)',
      c0: 'hsla(280, 80%, 90%, 0.6)',
      c1: 'hsla(260, 70%, 10%, 1)',
      c2: 'hsla(255, 75%, 12%, 1)',
      c3: 'hsla(300, 85%, 70%, 0.9)',
      c4: 'hsla(270, 100%, 60%, 0.7)',
      c5: 'hsla(240, 90%, 40%, 1)',
    },
    preview: ['#0f0a1f', '#a855f7', '#c084fc', '#e879f9'],
  },
  {
    name: 'Monochrome',
    colors: {
      bg: 'hsla(0, 0%, 8%, 1)',
      c0: 'hsla(0, 0%, 95%, 0.7)',
      c1: 'hsla(0, 0%, 10%, 1)',
      c2: 'hsla(0, 0%, 15%, 1)',
      c3: 'hsla(0, 0%, 70%, 0.8)',
      c4: 'hsla(0, 0%, 50%, 0.7)',
      c5: 'hsla(0, 0%, 30%, 1)',
    },
    preview: ['#141414', '#6b7280', '#9ca3af', '#d1d5db'],
  },
]