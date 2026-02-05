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
    const isMountedRef = useRef(true);

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
    const precomputedFirstStepRef = useRef<{ targetX: number; direction: 'left' | 'right' } | null>(null);
    const pendingSequenceRef = useRef<BehaviorSequence | null>(null);
    const hasPlayedSpawnRef = useRef(false);

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

    /** Compute target position and direction for a walk step (used for init and executeStep). */
    const computeWalkTarget = (
        currentX: number,
        step: BehaviorStep,
        maxPos: number
    ): { targetX: number; direction: 'left' | 'right' } => {
        let direction: 'left' | 'right' =
            step.direction === 'random'
                ? Math.random() > 0.5 ? 'right' : 'left'
                : (step.direction as 'left' | 'right') || 'right';
    
        const cappedMax = Math.min(step.distance!.max, Math.max(0, maxPos * 0.95));
        const cappedMin = Math.min(step.distance!.min, cappedMax);
        const distance = randomInRange({ min: cappedMin, max: cappedMax });
    
        // Calculate initial target based on chosen direction
        let targetX = direction === 'right' ? currentX + distance : currentX - distance;
    
        // Handle boundary collisions
        if (targetX < 0) {
            // Hit left wall - bounce right
            direction = 'right';
            targetX = Math.abs(targetX);  // Bounce distance from wall
            if (targetX > maxPos) targetX = maxPos;  // Cap at right edge
        } else if (targetX > maxPos) {
            // Hit right wall - bounce left
            direction = 'left';
            const overflow = targetX - maxPos;
            targetX = maxPos - overflow;  // Bounce distance from wall 
            if (targetX < 0) targetX = 0;  // Cap at left edge
        }
    
        const actualDirection = targetX > currentX ? 'right' : 'left';
        console.log('🧮 computeWalkTarget:', {
            currentX: currentX.toFixed(1),
            targetX: targetX.toFixed(1),
            computedDirection: direction,
            actualDirection,
            needsCorrection: direction !== actualDirection,
        });
        if (direction !== actualDirection) {
            console.log('⚠️ Direction mismatch detected, correcting!');
            direction = actualDirection;
        }
        return { targetX, direction };
    };

    const goToNextStep = () => {

        if (!isMountedRef.current) {
            console.log('🚫 goToNextStep called but component unmounted, aborting');
            return;
        }

        currentStepIndex.current += 1;
        if (currentStepIndex.current >= currentSequence.current.length) {
            startNewSequenceRef.current();
        } else {
            executeStep(currentSequence.current[currentStepIndex.current]);
        }
    };

    const executeStep = (step: BehaviorStep) => {
        if (!isMountedRef.current) {
            console.log('🚫 executeStep called but component unmounted, aborting');
            return;
        }
        if (!pet) return;
        const maxPos = effectiveWidth - pet.size;

        console.log('🎬 Executing step:', {
            pet: petId,
            action: step.action,
            currentX: xRef.current,
            direction: state.direction,
            container: effectiveWidth,
            petExists: !!pet,
            petSize: pet?.size,
            effectiveWidth,
        });

        if (step.distance) {
            if (maxPos <= 0) return;

            const currentX = xRef.current;
            const precomputed = precomputedFirstStepRef.current;
            if (precomputed) precomputedFirstStepRef.current = null;
            const { targetX, direction } = precomputed ?? computeWalkTarget(currentX, step, maxPos);

            const actualDistance = Math.abs(targetX - currentX);
            const duration = actualDistance / 320;

            console.log('🚶 Movement:', {
                pet: petId,
                from: currentX,
                to: targetX,
                computedDirection: direction,
                expectedDirection: targetX > currentX ? 'right' : 'left',
                match: direction === (targetX > currentX ? 'right' : 'left') ? '✅' : '❌',
            });

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
            const lockedX = xRef.current;

            console.log('🛑 STATIONARY:', {
                pet: petId,
                action: step.action,
                currentX: lockedX,
                settingX: lockedX,
                settingDuration: 0,
                settingAnimating: false,
                waitingFor: `${actionDuration.toFixed(1)}s`,
            });

            setState(prev => ({
                ...prev,
                x: lockedX,
                duration: 0,
                currentAction: step.action,
                isAnimating: false,
                onAnimationComplete: undefined,
            }));
            xRef.current = lockedX;

            setTimeout(() => {
                if (!isMountedRef.current) return;
                console.log('⏰ STATIONARY complete, moving to next step');
                goToNextStepRef.current();
            }, actionDuration * 1000);
        }
    };

    const startNewSequence = () => {
        if (!isMountedRef.current) {
            console.log('🚫 startNewSequence called but component unmounted, aborting');
            return;
        }

        if (!hasPlayedSpawnRef.current && pet.behaviors.spawn) {
            console.log('🎬 Playing spawn animation:', pet.behaviors.spawn.name);
            hasPlayedSpawnRef.current = true;
            currentSequence.current = pet.behaviors.spawn.steps;
            currentStepIndex.current = 0;
            executeStep(pet.behaviors.spawn.steps[0]);
            return;
        }

        const sequences = pet.behaviors[mode === 'focus' ? 'focus' : 'break'];
        if (!sequences || sequences.length === 0) return;

        const pending = pendingSequenceRef.current;
        const selectedSequence = pending ?? pickRandomSequence(sequences);
        if (pending) pendingSequenceRef.current = null;

        currentSequence.current = selectedSequence.steps;
        currentStepIndex.current = 0;
        executeStep(selectedSequence.steps[0]);
    };

    useEffect(() => {
        goToNextStepRef.current = goToNextStep;
        startNewSequenceRef.current = startNewSequence;
    });

    useLayoutEffect(() => {
        isMountedRef.current = true;
        hasPlayedSpawnRef.current = false;
    
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
        xRef.current = spawnX;
    
        let initialDirection: 'left' | 'right' = 'right';
        
        // ✅ NEW: Only precompute if there's NO spawn animation
        if (maxPos > 0 && !pet.behaviors.spawn) {
            const sequences = pet.behaviors[mode === 'focus' ? 'focus' : 'break'];
            if (sequences?.length > 0) {
                const selected = pickRandomSequence(sequences);
                const firstStep = selected.steps[0];
                if (firstStep?.distance) {
                    const computed = computeWalkTarget(spawnX, firstStep, maxPos);
                    initialDirection = computed.direction;
                    precomputedFirstStepRef.current = {
                        targetX: computed.targetX,
                        direction: computed.direction,
                    };
                    pendingSequenceRef.current = selected;
                }
            }
        }
        // ✅ If spawn exists, check if SPAWN's first step is movement
        else if (maxPos > 0 && pet.behaviors.spawn) {
            const firstSpawnStep = pet.behaviors.spawn.steps[0];
            if (firstSpawnStep?.distance) {
                const computed = computeWalkTarget(spawnX, firstSpawnStep, maxPos);
                initialDirection = computed.direction;
                precomputedFirstStepRef.current = {
                    targetX: computed.targetX,
                    direction: computed.direction,
                };
                // Don't set pendingSequenceRef - spawn will execute directly
            }
        }
    
        const payload = {
            x: spawnX,
            direction: initialDirection,
            duration: 0,
            isInitialized: true as const,
        };
        queueMicrotask(() => {
            setState(prev => ({ ...prev, ...payload }));
        });
        
        // Start animation sequence
        let t: NodeJS.Timeout | null = null;
        if (maxPos > 0) {
            t = setTimeout(() => startNewSequenceRef.current(), 0);
        }
        
        // ✅ Cleanup
        return () => {
            console.log(`🧹 Cleaning up pet: ${petId}`);
            isMountedRef.current = false;
            hasPlayedSpawnRef.current = false;
            if (t) clearTimeout(t);
            animationCompleteRef.current = null;
            currentSequence.current = [];
        };
    }, [mode, petId, effectiveWidth, pet]);

    return state;
};
