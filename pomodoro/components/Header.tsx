import { useNotesStore } from '@/store/useNotes';
import { Button } from './Button';
import { IoSettingsOutline } from 'react-icons/io5';
import { useThemeStore } from '@/store/useTheme';
import { useTimer } from '@/store/useTimer';
import AuthButton from './AuthButton';
import RoomStatusButton from './RoomStatusButton';

export default function Header({ showSettings, setShowSettings, setShowAuthModal, showAuthModal, setRoomModalOpen, roomModalOpen }: { showSettings: boolean, setShowSettings: (show: boolean) => void, setShowAuthModal: (show: boolean) => void, showAuthModal: boolean, setRoomModalOpen: (show: boolean) => void, roomModalOpen: boolean }) {

    const addNewNote = useNotesStore((s) => s.addNewNote);
    const theme = useThemeStore((s) => s.theme);
    const pomodoroCount = useTimer((s) => s.pomodoroCount);

    // probably want to debounce the sync menu
    return (
        <div className="rounded-md flex justify-between py-10 px-5 relative z-10">
            <div className='flex gap-2 items-center'>
                <h1 className="text-3xl font-bold text-text ">Study Space</h1>

                {false && <Button
                    variant='glassPlain'
                    className='p-1 rounded-full flex items-center gap-2 pointer-events-none text-md'
                >
                    <span className='text-active'>{pomodoroCount}</span>

                    <span>Sessions</span>
                </Button>}
            </div>

            <div className='flex relative gap-2 items-center'>

                {/* Room Status Button - shows for hosts and joined users */}
                <RoomStatusButton onRoomModalOpen={() => setRoomModalOpen(true)} />

                <Button
                    className="flex items-center justify-center p-2 rounded-full"
                    onClick={() => setShowSettings(!showSettings)}
                    variant='glassPlain'
                >
                    <IoSettingsOutline size={18} strokeWidth={0.5} />
                </Button>
                <AuthButton
                    onSignInClick={() => setShowAuthModal(!showAuthModal)}
                    onJoinRoomClick={() => setRoomModalOpen(true)}
                />
            </div>
        </div>
    );
}