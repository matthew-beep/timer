
type AnimationConfig = {
    name: string;
    size: number;
    actions: object;
};

export const PET_CONFIGS = {
  "rottweiler": {
    id: "rottweiler",
    spriteSheet: '/sprites/rottweiler',
    frameSize: 64,
    size: 64,
    animations: {
      idle: { url: '/sprites/rottweiler/idle.png', frames: 6, speed: 0.8 },
      walk: { url: '/sprites/rottweiler/run.png', frames: 5, speed: 0.4 },
      study: { url: '/sprites/rottweiler/study.png', frames: 12, speed: 1.2 }, // Unique to the Rottweiler!
    }
  },
}