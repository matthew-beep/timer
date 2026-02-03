import { useState, useEffect, useRef } from 'react';
import { PET_CONFIGS, BehaviorStep, BehaviorSequence } from '@/config/PetConfig';

interface PetState {
    currentAction: string;
    x: number;
    direction: 'left' | 'right';
    isAnimating: boolean;
    duration: number; // Add duration reference for the renderer
}

export const usePetBehavior = (petId: string, mode: 'focus' | 'break', containerWidth: number = 300) => {
    const pet = PET_CONFIGS[petId as keyof typeof PET_CONFIGS];
    const [state, setState] = useState<PetState>({
        currentAction: 'idle',
        x: 0,
        direction: 'right',
        isAnimating: false,
        duration: 0.5,
    });

    const currentSequence = useRef<BehaviorStep[]>([]);
    const currentStepIndex = useRef(0);
    const xRef = useRef(0); // Track X position in ref to avoid stale closures in timeouts

    // Pick random sequence based on weights
    const pickRandomSequence = (sequences: BehaviorSequence[]): BehaviorSequence => {
        const totalWeight = sequences.reduce((sum, seq) => sum + (seq.weight || 1), 0);
        let random = Math.random() * totalWeight;

        for (const sequence of sequences) {
            random -= sequence.weight || 1;
            if (random <= 0) return sequence;
        }

        return sequences[0];
    };

    // Get random value from range
    const randomInRange = (range: { min: number; max: number }) => {
        return Math.random() * (range.max - range.min) + range.min;
    };

    // Execute a single step
    const executeStep = (step: BehaviorStep) => {
        console.log(`[Pet] Executing step: ${step.action} (Duration: ${step.duration ? 'random' : 'N/A'}, Distance: ${step.distance ? 'random' : 'N/A'})`);

        // Default minimal duration update to prevent stale state
        setState(prev => ({ ...prev, isAnimating: true, currentAction: step.action }));

        if (step.distance) {
            // Movement action
            let direction = step.direction === 'random'
                ? Math.random() > 0.5 ? 'right' : 'left'
                : step.direction || 'right';

            let distance = randomInRange(step.distance);

            // BOUNDARY CHECK
            // We assume the pet starts at roughly x = 0 (left-aligned) or center.
            // But 'x' here is the `left` offset in pixels.
            // Let's assume the pet container is `containerWidth` wide.
            // The pet's x position must be between 0 and (containerWidth - pet.size).

            const maxPos = containerWidth - pet.size;
            const currentX = xRef.current; // Use ref for fresh value

            let targetX = direction === 'right' ? currentX + distance : currentX - distance;

            // If target is out of bounds, flip direction and clamp distance
            if (targetX < 0) {
                console.log(`[Pet] Hit left wall! flipping right.`);
                direction = 'right';
                // Calculate distance to wall + some extra inward? 
                // Simplest: just walk TO the wall (0) or walk AWAY from it.
                // Let's walk away from the wall by the intended distance instead.
                targetX = distance;
            } else if (targetX > maxPos) {
                console.log(`[Pet] Hit right wall! flipping left.`);
                direction = 'left';
                targetX = maxPos - distance; // Bounce back? or just clamp?
                // If we bounce back, we might go negative if distance is huge.
                // Safer: just go to the max pos? OR turn around.
                // Let's try: turn around.
                if (targetX < 0) targetX = 0; // standard clamp if bounce is too far
            }

            // Recalculate distance based on clamped target
            // actually, we just needed the direction & targetX. 
            // The animation just needs the final X.

            // Adjust duration to match actual distance traveled if clamped (optional, but good for uniformity)
            const actualDistance = Math.abs(targetX - currentX);
            const duration = actualDistance / 100; // Keep speed constant-ish

            console.log(`[Pet] Moving ${direction} to ${targetX.toFixed(0)} (dist: ${actualDistance.toFixed(0)}) over ${duration.toFixed(2)}s`);

            // Update both state (for render) and ref (for logic)
            xRef.current = targetX;
            setState(prev => ({
                ...prev,
                direction: direction as 'left' | 'right',
                x: targetX,
                duration: duration, // PASS SCALED DURATION
            }));

            setTimeout(() => {
                goToNextStep();
            }, duration * 1000);

        } else if (step.duration) {
            // Stationary action
            const duration = randomInRange(step.duration);

            console.log(`[Pet] Waiting for ${duration.toFixed(2)}s`);

            setState(prev => ({
                ...prev,
                duration: 0, // Instant transition for stationary actions
                isAnimating: true,
                currentAction: step.action
            }));

            setTimeout(() => {
                goToNextStep();
            }, duration * 1000);
        }
    };

    // Move to next step in sequence
    const goToNextStep = () => {
        currentStepIndex.current += 1;

        if (currentStepIndex.current >= currentSequence.current.length) {
            // Sequence complete, pick new one
            startNewSequence();
        } else {
            // Execute next step
            executeStep(currentSequence.current[currentStepIndex.current]);
        }
    };

    // Start a new behavior sequence
    const startNewSequence = () => {
        const sequences = pet.behaviors[mode === 'focus' ? 'focus' : 'break'];
        if (!sequences || sequences.length === 0) return;

        const selectedSequence = pickRandomSequence(sequences);
        console.log(`[Pet] Starting sequence: ${selectedSequence.name}`);

        currentSequence.current = selectedSequence.steps;
        currentStepIndex.current = 0;

        executeStep(selectedSequence.steps[0]);
    };

    // Initialize and restart when mode changes
    useEffect(() => {
        if (pet) {
            console.log(`[Pet] Initialized with ID: ${petId}, Mode: ${mode}`);
            // Reset state and ref
            xRef.current = 0;
            setState(prev => ({ ...prev, x: 0 }));
            startNewSequence();
        }
    }, [mode, petId]);

    return state;
};
