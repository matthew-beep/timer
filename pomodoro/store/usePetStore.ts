import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PetId } from '@/config/PetConfig';

interface PetStore {
    activePets: PetId[];
    togglePet: (id: PetId) => void;
}

export const usePetStore = create<PetStore>()(
    persist(
        (set) => ({
            activePets: ['rottweiler'],
            togglePet: (id) => set((state) => {
                const isActive = state.activePets.includes(id);
                if (isActive) {
                    return { activePets: state.activePets.filter(p => p !== id) };
                } else {
                    return { activePets: [...state.activePets, id] };
                }
            }),
        }),
        {
            name: 'pet-storage',
        }
    )
);
