
import React from 'react';
import Overlay from './Overlay';
import { Button } from './Button';
import { useNotesStore } from '@/store/useNotes';

export default function MergeNotesModal() {
    const mergeState = useNotesStore((s) => s.mergeState);
    const guestNotes = useNotesStore((s) => s.guestNotes);
    const confirmMerge = useNotesStore((s) => s.confirmMerge);
    const discardMerge = useNotesStore((s) => s.discardMerge);

    const isOpen = mergeState === 'prompt';

    return (
        <Overlay isOpen={isOpen} onClose={() => { }} blur="md">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-xl max-w-md w-full border border-zinc-200 dark:border-zinc-800 pointer-events-auto">
                <h2 className="text-xl font-bold mb-2 dark:text-white">Unsaved Notes Found</h2>
                <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                    You have {guestNotes.length} unsaved notes from your guest session.
                    Would you like to merge them into your account?
                </p>

                <div className="flex flex-col gap-3">
                    <Button
                        variant="primary"
                        onClick={() => confirmMerge()}
                        className="w-full justify-center py-3"
                    >
                        Merge Notes
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={() => discardMerge()}
                        className="w-full justify-center py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        Discard Local Notes
                    </Button>
                </div>
            </div>
        </Overlay>
    );
}
