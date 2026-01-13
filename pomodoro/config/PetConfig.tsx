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

