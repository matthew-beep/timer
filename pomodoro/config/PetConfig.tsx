export type PetId = keyof typeof PET_CONFIGS;

export interface PetProps {
  id: PetId;
  scale?: number;
}

export const PET_CONFIGS = {
  "rottweiler": {
    id: "rottweiler",
    spriteSheet: '/sprites/rottweiler',
    frameSize: 64,
    size: 64,
    animations: {
      idle: { url: '/sprites/rottweiler/idle.png', frames: 6, speed: 0.8 },
      walk: { url: '/sprites/rottweiler/run.png', frames: 5, speed: 0.4 },
    }
  },
  "turtle": {
    id: "turtle",
    spriteSheet: '/sprites/turtle',
    frameSize: 64,
    size: 64,
    animations: {
      idle: { url: '/sprites/turtle/idle.png', frames: 8, speed: 0.8 },
      walk: { url: '/sprites/turtle/walk.png', frames: 8, speed: 0.4 },
    }
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