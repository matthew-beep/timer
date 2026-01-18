"use client";

import Timer from "@/components/Timer";
import Header from "@/components/Header";
import { useNotesStore } from "@/store/useNotes";
import StickyNote from "@/components/Sticky";
import { PetRenderer } from "@/components/Pet";
import ProgressBar from "@/components/Progress";
import Settings from "@/components/Settings";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTimer } from "@/store/useTimer";
import { useThemeStore } from "@/store/useTheme";
import { Theme, theme1, themes } from "@/components/Themes";

import { useAuthStore } from "@/store/useAuth";
import BackgroundRenderer from "@/components/BackgroundRenderer";
import NotesContainer from "@/components/NotesContainer";
import AuthModal from "@/components/AuthModal";
import Overlay from "@/components/Overlay";
import MergeNotesModal from "@/components/MergeNotesModal";

export default function Home() {
  const [showSettings, setShowSettings] = useState(false);
  const mode = useTimer((s) => s.mode);
  const colors = useThemeStore((s) => s.colors);
  const selectedGradient = useThemeStore((s) => s.selectedGradient);
  const viewMode = useNotesStore((s) => s.viewMode);
  const colorTheme = useThemeStore((s) => s.theme);
  const { user, session, isLoading, signIn, signOut, signInWithGoogle, signUp } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);

  const selectedBackground = useThemeStore((s) => s.selectedBackground);
  const backgroundMode = useThemeStore((s) => s.backgroundMode);
  const mergeState = useNotesStore((s) => s.mergeState);

  // Test Supabase connection on mount
  // useEffect(() => {
  //   const testConnection = async () => {
  //     console.log('🔍 Testing Supabase connection...');

  //     // Test 1: Check if client is initialized
  //     console.log('✅ Supabase client initialized:', !!supabase);
  //     console.log('📍 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set ✓' : 'Missing ✗');
  //     console.log('🔑 Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set ✓' : 'Missing ✗');

  //     // Test 2: Check auth state
  //     try {
  //       const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  //       if (sessionError) {
  //         console.error('❌ Auth session error:', sessionError);
  //       } else {
  //         console.log('✅ Auth session check:', session ? `Signed in as ${session.user.email}` : 'Not signed in');
  //       }
  //     } catch (error) {
  //       console.error('❌ Auth check failed:', error);
  //     }

  //     // Test 3: Try to query profiles table
  //     try {
  //       const { data, error } = await supabase
  //         .from('profiles')
  //         .select('*')
  //         .limit(1);

  //       if (error) {
  //         console.error('❌ Profiles query error:', error);
  //         console.error('   Error code:', error.code);
  //         console.error('   Error message:', error.message);
  //         console.error('   Error details:', error.details);
  //       } else {
  //         console.log('✅ Profiles table query successful!');
  //         console.log('   Rows returned:', data?.length || 0);
  //         if (data && data.length > 0) {
  //           console.log('   Sample row:', data[0]);
  //         }
  //       }
  //     } catch (error) {
  //       console.error('❌ Profiles query failed:', error);
  //     }

  //     // Test 4: Check RLS policies (will fail if not authenticated, which is expected)
  //     try {
  //       const { data, error } = await supabase
  //         .from('profiles')
  //         .select('count')
  //         .limit(1);

  //       if (error) {
  //         if (error.code === 'PGRST301' || error.message.includes('permission denied')) {
  //           console.log('ℹ️  RLS policies are active (expected if not authenticated)');
  //         } else {
  //           console.error('❌ RLS check error:', error);
  //         }
  //       } else {
  //         console.log('✅ RLS check passed');
  //       }
  //     } catch (error) {
  //       console.error('❌ RLS check failed:', error);
  //     }

  //     console.log('🏁 Connection test complete!');
  //     console.log('📊 Auth Store State:', {
  //       user: user?.email || 'null',
  //       session: session ? 'active' : 'null',
  //       isLoading,
  //     });
  //   };

  //   testConnection();
  // }, []); // Run once on mount

  useEffect(() => {
    console.log("user changed: ", user);
    console.log("session changed: ", session);
    console.log("isLoading changed: ", isLoading);
  }, [user, isLoading, session]);

  /*
  const applyTheme = (themeIndex: number) => {
    const theme = theme1[themeIndex];
    console.log("gradient object: ", theme);
    const gradientElement = document.querySelector('.gradient-2') as HTMLElement;
    gradientElement.style.setProperty('--bg', theme.colors.bg)
    gradientElement.style.setProperty('--c-0', theme.colors.c0)
    gradientElement.style.setProperty('--c-1', theme.colors.c1)
    gradientElement.style.setProperty('--c-2', theme.colors.c2)
    gradientElement.style.setProperty('--c-3', theme.colors.c3)
    gradientElement.style.setProperty('--c-4', theme.colors.c4)
    gradientElement.style.setProperty('--c-5', theme.colors.c5)
  }

  useEffect(() => {
    const activeColor = mode === "focus" ? colors.work : colors.break;
    console.log("current color: ", document.documentElement.style.getPropertyValue("--primaryMode"));
    document.documentElement.style.setProperty("--primaryMode", activeColor);
  }, [mode, colors.work, colors.break]);

  useEffect(() => {
    // Small delay ensures localStorage has been read

    console.log("selectedGradient changed: ", selectedGradient);


    if (backgroundMode == "mesh") {
      console.log("switch to gradient: ");

      if (typeof selectedGradient === "string") {
        applyTheme(0);
      } else {
        applyTheme(selectedGradient);
      }
    }


  }, [selectedGradient, backgroundMode]);

  /*

  const applyColorTheme = (themeMode: 'light' | 'dark') => {
    const currentTheme = themes[themeMode];
    const root = document.documentElement;

    Object.entries(currentTheme).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  };

  useEffect(() => {
    applyColorTheme(colorTheme);
    console.log("switching mode: ", colorTheme);

  }, [colorTheme]);*/






  return (
    <>
      <Header showSettings={showSettings} setShowSettings={setShowSettings} setShowAuthModal={setShowAuthModal} showAuthModal={showAuthModal} />
      <div className="relative h-full">
        <NotesContainer />

        <div
          className="w-fit mx-auto flex flex-col items-center justify-center h-full z-0 relative p-10"
        >
          <div className="w-full h-full relative">
            <PetRenderer id="turtle" scale={1} />
            <PetRenderer id="rottweiler" scale={2} />
          </div>
          <Timer />
          <div className="w-full h-full"></div>

        </div>

        <Overlay isOpen={showSettings} onClose={() => setShowSettings(false)} slide="right">
          <Settings showSettings={showSettings} setShowSettings={setShowSettings} />
        </Overlay>

        <Overlay isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} blur="xl" slide="top">
          <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </Overlay>


        <MergeNotesModal />


        <ProgressBar />
      </div>
    </>
  );
}
