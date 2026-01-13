export type Theme = {
  name: string;
  mode: "dark" | "light";
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


// lib/themes.ts
export const themes = {
  light: {
    background: '#ffffff',
    text: '#0a1929', // #04060A
    primary: '#ffffff',
    secondary: '#f6339a',
    cardBg: 'rgba(255, 255, 255, 0.75)',
    border: 'rgba(209, 213, 219, 0.3)',
    inputBg: '#FFFFFF',
    placeholder: '#000000',
    stickyHandle: 'rgba(255, 255, 255, 0.5)'

  },
  dark: {
    background: '#000000',
    text: '#ffffff',
    primary: '#0a1929',
    secondary: '#f6339a',
    cardBg: 'rgba(17, 25, 40, 0.75)',
    border: 'rgba(255, 255, 255, 0.125)',
    inputBg: '#1F2A37',
    placeholder: '#89919E',
    stickyHandle: 'rgba(255, 255, 255, 0.05)'
  },
} as const;

export type ThemeMode = keyof typeof themes;


export const theme1:Theme[] = [
  // Dark Themes
  {
    name: "Midnight Velvet",
    mode: "dark",
    colors: {
      bg: "hsla(230, 35%, 8%, 1)",
      c0: "hsla(250, 100%, 50%, 0.35)",
      c1: "hsla(270, 90%, 45%, 0.3)",
      c2: "hsla(230, 95%, 40%, 0.28)",
      c3: "hsla(290, 85%, 48%, 0.26)",
      c4: "hsla(240, 100%, 50%, 0.32)",
      c5: "hsla(240, 80%, 15%, 0.5)"
    },
    preview: ["#7C3AED", "#6366F1", "#8B5CF6", "#A855F7"]
  },
  {
    name: "Crimson Abyss",
    mode: "dark",
    colors: {
      bg: "hsla(0, 30%, 7%, 1)",
      c0: "hsla(0, 100%, 45%, 0.38)",
      c1: "hsla(15, 95%, 40%, 0.32)",
      c2: "hsla(340, 90%, 35%, 0.35)",
      c3: "hsla(20, 85%, 30%, 0.28)",
      c4: "hsla(355, 100%, 50%, 0.34)",
      c5: "hsla(0, 70%, 12%, 0.5)"
    },
    preview: ["#DC2626", "#EF4444", "#F87171", "#991B1B"]
  },
  {
    name: "Deep Ocean",
    mode: "dark",
    colors: {
      bg: "hsla(200, 40%, 6%, 1)",
      c0: "hsla(195, 95%, 40%, 0.35)",
      c1: "hsla(210, 90%, 35%, 0.32)",
      c2: "hsla(180, 85%, 30%, 0.3)",
      c3: "hsla(220, 80%, 33%, 0.28)",
      c4: "hsla(190, 100%, 45%, 0.34)",
      c5: "hsla(205, 80%, 12%, 0.5)"
    },
    preview: ["#0891B2", "#0EA5E9", "#06B6D4", "#0C4A6E"]
  },
  {
    name: "Emerald Night",
    mode: "dark",
    colors: {
      bg: "hsla(150, 35%, 7%, 1)",
      c0: "hsla(145, 95%, 35%, 0.35)",
      c1: "hsla(160, 90%, 30%, 0.33)",
      c2: "hsla(175, 85%, 33%, 0.32)",
      c3: "hsla(130, 80%, 27%, 0.28)",
      c4: "hsla(155, 100%, 38%, 0.36)",
      c5: "hsla(150, 75%, 11%, 0.5)"
    },
    preview: ["#10B981", "#14B8A6", "#059669", "#064E3B"]
  },
  {
    name: "Violet Dusk",
    mode: "dark",
    colors: {
      bg: "hsla(270, 38%, 8%, 1)",
      c0: "hsla(265, 95%, 48%, 0.36)",
      c1: "hsla(280, 90%, 42%, 0.33)",
      c2: "hsla(255, 93%, 45%, 0.32)",
      c3: "hsla(290, 85%, 38%, 0.3)",
      c4: "hsla(275, 100%, 47%, 0.35)",
      c5: "hsla(270, 80%, 13%, 0.5)"
    },
    preview: ["#A855F7", "#C084FC", "#9333EA", "#581C87"]
  },
  {
    name: "Amber Eclipse",
    mode: "dark",
    colors: {
      bg: "hsla(35, 35%, 7%, 1)",
      c0: "hsla(45, 95%, 40%, 0.35)",
      c1: "hsla(35, 90%, 33%, 0.32)",
      c2: "hsla(25, 85%, 35%, 0.33)",
      c3: "hsla(40, 80%, 30%, 0.28)",
      c4: "hsla(50, 100%, 45%, 0.36)",
      c5: "hsla(35, 75%, 11%, 0.5)"
    },
    preview: ["#F59E0B", "#FBBF24", "#D97706", "#78350F"]
  },
  {
    name: "Rose Shadow",
    mode: "dark",
    colors: {
      bg: "hsla(340, 30%, 8%, 1)",
      c0: "hsla(330, 90%, 43%, 0.35)",
      c1: "hsla(350, 85%, 40%, 0.33)",
      c2: "hsla(310, 80%, 37%, 0.32)",
      c3: "hsla(340, 75%, 33%, 0.3)",
      c4: "hsla(345, 95%, 47%, 0.36)",
      c5: "hsla(340, 70%, 12%, 0.5)"
    },
    preview: ["#F43F5E", "#FB7185", "#E11D48", "#881337"]
  },
  {
    name: "Slate Storm",
    mode: "dark",
    colors: {
      bg: "hsla(210, 20%, 6%, 1)",
      c0: "hsla(210, 50%, 35%, 0.32)",
      c1: "hsla(220, 45%, 30%, 0.28)",
      c2: "hsla(200, 48%, 33%, 0.3)",
      c3: "hsla(215, 42%, 27%, 0.26)",
      c4: "hsla(205, 52%, 37%, 0.33)",
      c5: "hsla(210, 35%, 12%, 0.5)"
    },
    preview: ["#475569", "#64748B", "#334155", "#1E293B"]
  },
  
  // Light Themes - with much higher contrast
  {
    name: "Lavender Sky",
    mode: "light",
    colors: {
      bg: "hsla(240, 60%, 98%, 1)",
      c0: "hsla(250, 85%, 65%, 0.4)",
      c1: "hsla(270, 80%, 70%, 0.38)",
      c2: "hsla(230, 90%, 68%, 0.42)",
      c3: "hsla(260, 75%, 62%, 0.36)",
      c4: "hsla(245, 95%, 66%, 0.44)",
      c5: "hsla(240, 40%, 85%, 0.5)"
    },
    preview: ["#7C3AED", "#A78BFA", "#8B5CF6", "#C4B5FD"]
  },
  {
    name: "Peach Blossom",
    mode: "light",
    colors: {
      bg: "hsla(20, 65%, 98%, 1)",
      c0: "hsla(10, 90%, 70%, 0.45)",
      c1: "hsla(25, 85%, 72%, 0.42)",
      c2: "hsla(0, 80%, 68%, 0.44)",
      c3: "hsla(15, 75%, 65%, 0.38)",
      c4: "hsla(30, 95%, 78%, 0.46)",
      c5: "hsla(20, 45%, 88%, 0.5)"
    },
    preview: ["#FB923C", "#FDBA74", "#F97316", "#FED7AA"]
  },
  {
    name: "Ocean Breeze",
    mode: "light",
    colors: {
      bg: "hsla(195, 60%, 98%, 1)",
      c0: "hsla(190, 85%, 65%, 0.45)",
      c1: "hsla(200, 80%, 68%, 0.42)",
      c2: "hsla(185, 90%, 70%, 0.44)",
      c3: "hsla(210, 75%, 62%, 0.38)",
      c4: "hsla(195, 95%, 72%, 0.46)",
      c5: "hsla(195, 40%, 88%, 0.5)"
    },
    preview: ["#0EA5E9", "#38BDF8", "#0284C7", "#7DD3FC"]
  },
  {
    name: "Mint Garden",
    mode: "light",
    colors: {
      bg: "hsla(150, 58%, 98%, 1)",
      c0: "hsla(145, 80%, 65%, 0.45)",
      c1: "hsla(160, 78%, 68%, 0.42)",
      c2: "hsla(135, 85%, 70%, 0.44)",
      c3: "hsla(155, 75%, 62%, 0.38)",
      c4: "hsla(150, 90%, 72%, 0.46)",
      c5: "hsla(150, 38%, 90%, 0.5)"
    },
    preview: ["#10B981", "#34D399", "#059669", "#6EE7B7"]
  },
  {
    name: "Sunset Coral",
    mode: "light",
    colors: {
      bg: "hsla(345, 63%, 98%, 1)",
      c0: "hsla(340, 85%, 68%, 0.45)",
      c1: "hsla(350, 82%, 70%, 0.42)",
      c2: "hsla(330, 80%, 66%, 0.44)",
      c3: "hsla(355, 78%, 64%, 0.38)",
      c4: "hsla(345, 90%, 72%, 0.46)",
      c5: "hsla(345, 42%, 90%, 0.5)"
    },
    preview: ["#F43F5E", "#FB7185", "#E11D48", "#FDA4AF"]
  },
  {
    name: "Lemon Cream",
    mode: "light",
    colors: {
      bg: "hsla(50, 70%, 98%, 1)",
      c0: "hsla(48, 88%, 70%, 0.48)",
      c1: "hsla(52, 85%, 72%, 0.45)",
      c2: "hsla(45, 90%, 68%, 0.46)",
      c3: "hsla(55, 82%, 66%, 0.42)",
      c4: "hsla(50, 95%, 78%, 0.5)",
      c5: "hsla(50, 45%, 90%, 0.5)"
    },
    preview: ["#EAB308", "#FACC15", "#CA8A04", "#FDE047"]
  },
  {
    name: "Rose Quartz",
    mode: "light",
    colors: {
      bg: "hsla(320, 60%, 98%, 1)",
      c0: "hsla(315, 82%, 68%, 0.45)",
      c1: "hsla(325, 80%, 70%, 0.42)",
      c2: "hsla(310, 85%, 66%, 0.44)",
      c3: "hsla(320, 78%, 64%, 0.38)",
      c4: "hsla(318, 90%, 72%, 0.46)",
      c5: "hsla(320, 40%, 90%, 0.5)"
    },
    preview: ["#EC4899", "#F472B6", "#DB2777", "#F9A8D4"]
  },
  {
    name: "Cloud Pearl",
    mode: "light",
    colors: {
      bg: "hsla(210, 30%, 98%, 1)",
      c0: "hsla(210, 45%, 75%, 0.42)",
      c1: "hsla(220, 42%, 77%, 0.38)",
      c2: "hsla(200, 48%, 73%, 0.4)",
      c3: "hsla(215, 40%, 70%, 0.35)",
      c4: "hsla(205, 50%, 78%, 0.44)",
      c5: "hsla(210, 25%, 88%, 0.5)"
    },
    preview: ["#64748B", "#94A3B8", "#475569", "#CBD5E1"]
  }
];