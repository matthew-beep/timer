export type PetId = keyof typeof PET_CONFIGS;

export interface PetProps {
  id: PetId;
  scale?: number;
  containerWidth?: number;
}

export interface BehaviorStep {
  action: string; // 'idle', 'walk', 'sit', etc.
  duration?: { min: number; max: number }; // seconds for stationary
  distance?: { min: number; max: number }; // pixels for movement
  direction?: 'left' | 'right' | 'random';
}

export interface BehaviorSequence {
  name: string;
  steps: BehaviorStep[];
  weight?: number; // probability weight
}

export interface AnimationConfig {
  url: string;
  frames: number;
  speed: number;
}

export interface PetDialogue {
  onSpawn?: string[];
  onClick?: string[];
  onTimer?: string[];
  idle?: string[];
}

export interface PetConfig {
  id: string;
  size: number; // pixel size of the sprite (assuming square)
  defaultScale?: number;
  animations: {
    [key: string]: AnimationConfig;
  };
  behaviors: {
    focus: BehaviorSequence[];
    break: BehaviorSequence[];
    spawn?: BehaviorSequence; // optional one-time spawn sequence
  };
  dialogue?: PetDialogue;
}

export const PET_CONFIGS: Record<string, PetConfig> = {
  rottweiler: {
    id: 'rottweiler',
    size: 64,
    defaultScale: 2,
    animations: {
      idle: { url: '/sprites/rottweiler/idle.png', frames: 6, speed: 1 },
      walk: { url: '/sprites/rottweiler/run.png', frames: 5, speed: 1 },
      sit: { url: '/sprites/rottweiler/sit.png', frames: 8, speed: 1 },
      sleep: { url: '/sprites/rottweiler/sleep.png', frames: 8, speed: 1.0 },
      bark: { url: '/sprites/rottweiler/bark.png', frames: 12, speed: 1 },
      talk: { url: '/sprites/rottweiler/bark.png', frames: 12, speed: 1 },
    },
    behaviors: {
      spawn: {
        name: 'excited-arrival',
        weight: 1,
        steps: [
          { action: 'bark', duration: { min: 1, max: 1.5 } },
          { action: 'sit', duration: { min: 1, max: 2 } },
        ],
      },
      focus: [
        {
          name: 'patrol',
          weight: 3,
          steps: [
            { action: 'walk', distance: { min: 300, max: 900 }, direction: 'random' },
            { action: 'idle', duration: { min: 4, max: 10 } }
          ]
        },
        {
          name: 'inspect',
          weight: 2,
          steps: [
            { action: 'walk', distance: { min: 200, max: 500 } },
            { action: 'sit', duration: { min: 5, max: 12 } },
            { action: 'idle', duration: { min: 2, max: 5 } }
          ]
        },
        {
          name: 'short_nap',
          weight: 1,
          steps: [
            { action: 'sit', duration: { min: 2, max: 4 } },
            { action: 'sleep', duration: { min: 10, max: 30 } },
            { action: 'sit', duration: { min: 2, max: 4 } }
          ]
        }
      ],
      break: [
        {
          name: 'playful',
          weight: 1,
          steps: [
            { action: 'walk', distance: { min: 500, max: 1200 }, direction: 'random' },
            { action: 'walk', distance: { min: 400, max: 800 }, direction: 'random' },
            { action: 'idle', duration: { min: 1, max: 3 } }
          ]
        },
        {
          name: 'long_nap',
          weight: 2,
          steps: [
            { action: 'sleep', duration: { min: 60, max: 120 } }
          ]
        }
      ]
    },
    dialogue: {
      onSpawn: ["Ready to study! 🐕", "Let's get to work!", "Woof! Time to focus!"],
      onClick: ["Good human! Keep going!", "Woof woof! 🐕", "Pet me later, focus now!", "You're doing great!"],
      onTimer: ["Time's up! Take a break!", "Great work session! 🎉", "Rest time, you earned it!", "Woof! Break time!"],
      idle: ["*yawns*", "...", "💤", "*stretches*"],
    },
  },
  turtle: {
    id: 'turtle',
    size: 64,
    defaultScale: 1,
    animations: {
      idle: { url: '/sprites/turtle/idle.png', frames: 8, speed: 1 },
      walk: { url: '/sprites/turtle/walk.png', frames: 8, speed: 1.2 },
      sit: { url: '/sprites/turtle/idle.png', frames: 8, speed: 1 },
      sleep: { url: '/sprites/turtle/idle.png', frames: 8, speed: 1 },
      talk: { url: '/sprites/turtle/idle.png', frames: 8, speed: 0.5 },
    },
    behaviors: {
      spawn: {
        name: 'peek-out',
        weight: 1,
        steps: [
          { action: 'idle', duration: { min: 1, max: 2 } },
          { action: 'walk', distance: { min: 50, max: 100 }, direction: 'right' },
          { action: 'idle', duration: { min: 1, max: 2 } },
        ],
      },
      focus: [
        {
          name: 'slow_patrol',
          weight: 1,
          steps: [
            { action: 'walk', distance: { min: 100, max: 300 }, direction: 'random' },
            { action: 'idle', duration: { min: 10, max: 20 } }
          ]
        },
        {
          name: 'hiding',
          weight: 1,
          steps: [
            { action: 'idle', duration: { min: 20, max: 60 } }
          ]
        }
      ],
      break: [
        {
          name: 'wander',
          weight: 1,
          steps: [
            { action: 'walk', distance: { min: 300, max: 1000 }, direction: 'random' },
            { action: 'idle', duration: { min: 5, max: 10 } }
          ]
        }
      ]
    },
    dialogue: {
      onSpawn: ["...is it safe? 🐢", "Oh, hello there...", "Slowly but surely!"],
      onClick: ["Hello there...", "*nods slowly*", "Take your time."],
      onTimer: ["Time to stretch those legs!", "Enjoy your break… slowly!", "Snack break? Yes, please!"],
      idle: ["...", "*peeks*", "Just chilling."],
    },
  },
  cat: {
    id: 'cat',
    size: 64,
    defaultScale: 1,
    animations: {
      idle: { url: '/sprites/cat/idle.png', frames: 6, speed: 1 },
      walk: { url: '/sprites/cat/run.png', frames: 6, speed: 1 },
      sit: { url: '/sprites/cat/idle.png', frames: 6, speed: 1 },
      sleep: { url: '/sprites/cat/sleep.png', frames: 4, speed: 1 },
      excited: { url: '/sprites/cat/excited.png', frames: 3, speed: 1 },
      talk: { url: '/sprites/cat/excited.png', frames: 3, speed: 1 },
    },
    behaviors: {
      spawn: {
        name: 'morning-stretch',
        weight: 1,
        steps: [
          { action: 'idle', duration: { min: 1.5, max: 2 } },
          { action: 'excited', duration: { min: 1, max: 1.5 } },
          { action: 'idle', duration: { min: 1, max: 1.5 } },
        ],
      },
      focus: [
        {
          name: 'slow_patrol',
          weight: 1,
          steps: [
            { action: 'walk', distance: { min: 250, max: 600 }, direction: 'random' },
            { action: 'idle', duration: { min: 10, max: 20 } }
          ]
        },
        {
          name: 'hiding',
          weight: 1,
          steps: [
            { action: 'idle', duration: { min: 20, max: 60 } }
          ]
        }
      ],
      break: [
        {
          name: 'wander',
          weight: 1,
          steps: [
            { action: 'walk', distance: { min: 400, max: 1200 }, direction: 'random' },
            { action: 'idle', duration: { min: 5, max: 10 } }
          ]
        }
      ]
    },
    dialogue: {
      onSpawn: ["Meow... 😴", "*yawns* Time to study?", "I suppose we could work..."],
      onClick: ["Purr...", "Good. Keep going.", "*stares*", "You may continue."],
      onTimer: ["Purr… enjoy your break!", "Nap time? Don't mind if I do.", "Relax, I'll keep things cozy."],
      idle: ["*yawns*", "...", "💤", "*stretches*"],
    },
  },
  panda: {
    id: 'panda',
    size: 64,
    defaultScale: 1,
    animations: {
      idle: {
        url: '/sprites/panda/PandaIdle.png',
        frames: 4,
        speed: 0.8,
      },
      idle_blink: {
        url: '/sprites/panda/PandaIdleBlinking.png',
        frames: 12,
        speed: 0.9,
      },
      sit: {
        url: '/sprites/panda/PandaSitting.png',
        frames: 4,
        speed: 0.8,
      },
      sleep: {
        url: '/sprites/panda/PandaSleep.png',
        frames: 4,
        speed: 1.5,
      },
      eat: {
        url: '/sprites/panda/PandaEating.png',
        frames: 12,
        speed: 0.9,
      },
      think: {
        url: '/sprites/panda/PandaThinking.png',
        frames: 12,
        speed: 0.8,
      },
      happy: {
        url: '/sprites/panda/Happy.png',
        frames: 4,
        speed: 0.7,
      },
      wave: {
        url: '/sprites/panda/PandaWave.png',
        frames: 12,
        speed: 0.8,
      },
      talk: {
        url: '/sprites/panda/Happy.png',
        frames: 4,
        speed: 0.35,
      },
      yoga1: {
        url: '/sprites/panda/PandaYoga1.png',
        frames: 3,
        speed: 0.9,
      },
      yoga2: {
        url: '/sprites/panda/PandaYoga2.png',
        frames: 3,
        speed: 0.9,
      },
      yoga3: {
        url: '/sprites/panda/PandaYoga3.png',
        frames: 3,
        speed: 0.9,
      },
    },
    behaviors: {
      focus: [
        {
          name: 'relaxing',
          weight: 2,
          steps: [
            { action: 'idle_blink', duration: { min: 5, max: 12 } },
            { action: 'sit', duration: { min: 3, max: 8 } },
          ],
        },
        {
          name: 'deep_thoughts',
          weight: 1,
          steps: [
            { action: 'sit', duration: { min: 5, max: 10 } },
            { action: 'think', duration: { min: 6, max: 12 } },
            { action: 'idle', duration: { min: 3, max: 6 } },
          ],
        },
        {
          name: 'snack_time',
          weight: 1,
          steps: [
            { action: 'eat', duration: { min: 6, max: 14 } },
            { action: 'happy', duration: { min: 3, max: 6 } },
          ],
        },
      ],
      break: [
        {
          name: 'long_nap',
          weight: 2,
          steps: [
            { action: 'sleep', duration: { min: 60, max: 140 } },
          ],
        },
        {
          name: 'yoga_session',
          weight: 2,
          steps: [
            { action: 'yoga1', duration: { min: 5, max: 10 } },
            { action: 'yoga2', duration: { min: 5, max: 10 } },
            { action: 'yoga3', duration: { min: 5, max: 10 } },
            { action: 'idle', duration: { min: 3, max: 6 } },
          ],
        },
        {
          name: 'social',
          weight: 1,
          steps: [
            { action: 'wave', duration: { min: 3, max: 6 } },
            { action: 'happy', duration: { min: 3, max: 6 } },
          ],
        },
      ],
    },
    dialogue: {
      onSpawn: ["Bamboo can wait, focus first!", "Ready when you are! 🐼", "Let's do this!"],
      onClick: ["You're doing great!", "*waves*", "Keep it up!"],
      onTimer: ["Yay! Break time!", "Time to relax!", "Playtime is here!"],
      idle: ["*nibbles*", "...", "💤"],
    },
  },
} as const;



/*
export const PET_DIALOGUES_BY_TIMER = {
  rottweiler: {
    focus: [
      "Let's get to work, human!",
      "Stay on task, I’m watching!",
      "No distractions! Woof!",
      "Focus mode activated!",
      "We can do this together!"
    ],
    idle: [
      "Taking a break, are we?",
      "I’m just watching… nothing suspicious here!",
      "Nap time? I could join you!",
      "Stretch those legs… or mine!",
      "Snack time sounds good!"
    ],
    break: [
      "Woohoo! Break time!",
      "Let's play fetch for a bit!",
      "Relax, you've earned it!",
      "Time to wag the tail!",
      "A short run sounds fun!"
    ]
  },
  turtle: {
    focus: [
      "Slow and steady, focus is key!",
      "Keep at it… every step counts!",
      "I’ll pace with you… slowly but surely.",
      "Concentrate… shell mode on!",
      "Almost there… just a few more minutes."
    ],
    idle: [
      "Relaxing… the world can wait.",
      "I might be slow, but I’m observant.",
      "Nibble on a snack while you think!",
      "Hello there, human!",
      "Just chilling on my shell."
    ],
    break: [
      "Time to stretch those legs!",
      "Walk around, enjoy the view!",
      "A slow stroll sounds nice.",
      "Snack break? Yes, please!",
      "Enjoy your break… slowly!"
    ]
  },
  cat: {
    focus: [
      "Focus… I shall silently approve.",
      "Keep working, human… I’m judging.",
      "No distractions, unless it’s me.",
      "Concentrate, or I’ll knock things off your desk!",
      "Your focus amuses me."
    ],
    idle: [
      "Nap time? Don’t mind if I do!",
      "I’m watching… silently.",
      "A little scratch here, a little stretch there.",
      "Play with me if you dare!",
      "Is it time for a snack yet?"
    ],
    break: [
      "Purr… enjoy your break!",
      "I claim this lap for napping.",
      "Chase that laser dot!",
      "Time to groom myself… and you can watch!",
      "Relax, I’ll keep things cozy."
    ]
  },
  panda: {
    focus: [
      "Bamboo can wait, focus first!",
      "Work hard, snack harder later!",
      "Concentrate… the forest is quiet.",
      "Focus mode: activated!",
      "Keep those paws busy… on work!"
    ],
    idle: [
      "Time for a nap… or two.",
      "Snack time seems appropriate.",
      "I’m just rolling around here.",
      "Life is slow… just like me.",
      "Observe the world quietly."
    ],
    break: [
      "Yay! Break time!",
      "Bamboo snack incoming!",
      "Roll over and relax!",
      "Stretch those paws, enjoy your break!",
      "Playtime is here!"
    ]
  },
};

*/