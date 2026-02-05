import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PetId } from '@/config/PetConfig';

export interface PetDialogueState {
    petId: string;
    text: string;
    timestamp: number;
}

interface PetStore {
    activePets: PetId[];
    currentDialogue: PetDialogueState | null;
    togglePet: (id: PetId) => void;
    showDialogue: (petId: string, text: string, duration?: number) => void;
    clearDialogue: () => void;
}

export const usePetStore = create<PetStore>()(
    persist(
        (set, get) => ({
            activePets: ['rottweiler'],
            currentDialogue: null,

            togglePet: (id) => set((state) => {
                const isActive = state.activePets.includes(id);
                if (isActive) {
                    return { activePets: state.activePets.filter(p => p !== id) };
                } else {
                    return { activePets: [...state.activePets, id] };
                }
            }),

            showDialogue: (petId, text, duration = 3000) => {
                const timestamp = Date.now();
                set({
                    currentDialogue: { petId, text, timestamp },
                });
                setTimeout(() => {
                    const current = get().currentDialogue;
                    if (current && current.petId === petId && current.timestamp === timestamp) {
                        get().clearDialogue();
                    }
                }, duration);
            },

            clearDialogue: () => set({ currentDialogue: null }),
        }),
        {
            name: 'pet-storage',
            partialize: (state) => ({ activePets: state.activePets }),
        }
    )
);
