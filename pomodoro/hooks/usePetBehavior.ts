import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { PET_CONFIGS, BehaviorStep, BehaviorSequence } from '@/config/PetConfig';

interface PetState {
    currentAction: string;
    x: number;
    direction: 'left' | 'right';
    isAnimating: boolean;
    duration: number;
    onAnimationComplete?: () => void;
    isInitialized: boolean;
}

export const usePetBehavior = (petId: string, mode: 'focus' | 'break', containerWidth: number = 300) => {
    const pet = PET_CONFIGS[petId as keyof typeof PET_CONFIGS];
    const effectiveWidth = Math.max(containerWidth, pet.size);

    const [state, setState] = useState<PetState>({
        currentAction: 'idle',
        x: 0,
        direction: 'right',
        isAnimating: false,
        duration: 0.5,
        isInitialized: false,
    });

    const currentSequence = useRef<BehaviorStep[]>([]);
    const currentStepIndex = useRef(0);
    const xRef = useRef(0);
    const animationCompleteRef = useRef<(() => void) | null>(null);
    const goToNextStepRef = useRef<() => void>(() => {});
    const startNewSequenceRef = useRef<() => void>(() => {});

    const pickRandomSequence = (sequences: BehaviorSequence[]): BehaviorSequence => {
        const totalWeight = sequences.reduce((sum, seq) => sum + (seq.weight || 1), 0);
        let random = Math.random() * totalWeight;
        for (const sequence of sequences) {
            random -= sequence.weight || 1;
            if (random <= 0) return sequence;
        }
        return sequences[0];
    };

    const randomInRange = (range: { min: number; max: number }) => {
        return Math.random() * (range.max - range.min) + range.min;
    };

    const goToNextStep = () => {
        currentStepIndex.current += 1;
        if (currentStepIndex.current >= currentSequence.current.length) {
            startNewSequenceRef.current();
        } else {
            executeStep(currentSequence.current[currentStepIndex.current]);
        }
    };

    const executeStep = (step: BehaviorStep) => {
        const maxPos = effectiveWidth - pet.size;

        if (step.distance) {
            if (maxPos <= 0) return;

            let direction: 'left' | 'right' = step.direction === 'random'
                ? Math.random() > 0.5 ? 'right' : 'left'
                : (step.direction as 'left' | 'right') || 'right';

            const currentX = xRef.current;

            const cappedMax = Math.min(step.distance.max, Math.max(0, maxPos * 0.95));
            const cappedMin = Math.min(step.distance.min, cappedMax);
            const distance = randomInRange({ min: cappedMin, max: cappedMax });

            let targetX = direction === 'right' ? currentX + distance : currentX - distance;

            if (targetX < 0) {
                direction = 'right';
                targetX = Math.abs(targetX);
                if (targetX > maxPos) targetX = maxPos;
            } else if (targetX > maxPos) {
                direction = 'left';
                const overflow = targetX - maxPos;
                targetX = maxPos - overflow;
                if (targetX < 0) targetX = 0;
            }

            const actualDistance = Math.abs(targetX - currentX);
            const duration = actualDistance / 180;

            xRef.current = targetX;
            animationCompleteRef.current = () => {
                animationCompleteRef.current = null;
                goToNextStepRef.current();
            };

            setState(prev => ({
                ...prev,
                direction,
                x: targetX,
                duration,
                currentAction: step.action,
                isAnimating: true,
                onAnimationComplete: () => animationCompleteRef.current?.(),
            }));
        } else if (step.duration) {
            const actionDuration = randomInRange(step.duration);

            setState(prev => ({
                ...prev,
                x: xRef.current,
                duration: 0,
                currentAction: step.action,
                isAnimating: true,
                onAnimationComplete: undefined,
            }));

            setTimeout(() => {
                goToNextStepRef.current();
            }, actionDuration * 1000);
        }
    };

    const startNewSequence = () => {
        const sequences = pet.behaviors[mode === 'focus' ? 'focus' : 'break'];
        if (!sequences || sequences.length === 0) return;

        const selectedSequence = pickRandomSequence(sequences);
        currentSequence.current = selectedSequence.steps;
        currentStepIndex.current = 0;
        executeStep(selectedSequence.steps[0]);
    };

    useEffect(() => {
        goToNextStepRef.current = goToNextStep;
        startNewSequenceRef.current = startNewSequence;
    });

    useLayoutEffect(() => {
        if (!pet) return;
        const maxPos = Math.max(0, effectiveWidth - pet.size);
        const spawnX =
            maxPos <= 0
                ? 0
                : (() => {
                      const minSpawn = maxPos * 0.2;
                      const maxSpawn = maxPos * 0.8;
                      return Math.random() * (maxSpawn - minSpawn) + minSpawn;
                  })();
        const direction = Math.random() > 0.5 ? ('right' as const) : ('left' as const);
        xRef.current = spawnX;
        setState(prev => ({ ...prev, x: spawnX, direction, duration: 0, isInitialized: true }));
        if (maxPos > 0) {
            startNewSequenceRef.current();
        }
        return () => {
            animationCompleteRef.current = null;
        };
    }, [mode, petId, effectiveWidth, pet]);

    return state;
};
