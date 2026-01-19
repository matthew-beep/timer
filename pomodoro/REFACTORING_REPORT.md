# Refactoring Report: Pomodoro Timer App

## Executive Summary

This report identifies key refactoring opportunities across your codebase, organized by priority and aligned with your Phase 1-5 plan. The analysis focuses on code quality, architecture improvements, and missing features from your requirements.

---

## 🔴 CRITICAL ISSUES (Phase 1 - Do First)

### 1. **Missing Supabase Integration & Auth System**

**Current State:**
- No `useAuth` store exists
- No `AuthProvider` component
- Notes store doesn't sync with Supabase
- No guest user fallback logic

**Required Refactoring:**

**Create `store/useAuth.tsx`:**
```typescript
// Should include:
- user: User | null
- session: Session | null
- signIn: (email: string, password: string) => Promise<void>
- signUp: (email: string, password: string) => Promise<void>
- signOut: () => Promise<void>
- isAuthenticated: boolean
```

**Create `components/AuthProvider.tsx`:**
```typescript
// Should listen to supabase.auth.onAuthStateChange
// Update useAuthStore on changes
// Wrap app in layout.tsx
```

**Update `store/useNotes.tsx`:**
- Add `syncWithSupabase()` function
- Add optimistic updates with Supabase persistence
- Add guest fallback (localStorage only when not authenticated)
- Add `loadNotesFromSupabase()` on mount if authenticated

**Files to Create:**
- `store/useAuth.tsx`
- `components/AuthProvider.tsx`
- `lib/supabase.ts` (client initialization)

---

### 2. **Timer Logic Incomplete - Missing Auto-Skip & Cambridge Method**

**Current State (`components/Timer.tsx`):**
- Timer completion only switches `focus` → `short`
- No logic for `short` → `focus` or `focus` → `long` (after 4 pomodoros)
- No Cambridge Method implementation
- No auto-skip functionality

**Issues Found:**
```typescript
// Line 113 in Timer.tsx - incomplete logic
setMode(mode === "focus" ? "short" : "focus");
```

**Required Refactoring:**

**Update `store/useTimer.tsx`:**
```typescript
// Add:
- autoSkip: boolean (configurable)
- getNextMode: () => TimerMode // Returns next mode based on pomodoroCount
- completeSession: () => void // Handles completion + auto-skip
- implementCambridgeMethod: () => void // Cambridge Method logic
```

**Update `components/Timer.tsx`:**
- Move completion logic to store action
- Add auto-skip toggle in settings
- Implement proper mode progression:
  - focus → short (if pomodoroCount < 4)
  - focus → long (if pomodoroCount === 4)
  - short → focus
  - long → focus (reset pomodoroCount)

**Cambridge Method Requirements:**
- After 4 pomodoros → long break
- Reset pomodoroCount after long break
- Track session completion

---

### 3. **Theme Application Logic Scattered**

**Current State (`app/page.tsx`):**
- Direct DOM manipulation (lines 31-42, 69-83)
- Theme application logic mixed with component logic
- CSS variables set via `document.documentElement.style.setProperty`
- No centralized theme utility

**Issues:**
```typescript
// Lines 31-42: applyTheme function does DOM manipulation
const applyTheme = (themeIndex: number) => {
  const gradientElement = document.querySelector('.gradient-2') as HTMLElement;
  gradientElement.style.setProperty('--bg', theme.colors.bg)
  // ... more DOM manipulation
}
```

**Required Refactoring:**

**Create `lib/themeUtils.ts`:**
```typescript
export const applyThemeVariables = (theme: Theme) => {
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
};

export const applyColorTheme = (themeMode: 'light' | 'dark') => {
  const currentTheme = themes[themeMode];
  const root = document.documentElement;
  Object.entries(currentTheme).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
};
```

**Create `hooks/useThemeSync.ts`:**
```typescript
// Custom hook that syncs theme store changes to DOM
// Replaces useEffect logic in page.tsx
```

**Refactor `app/page.tsx`:**
- Remove direct DOM manipulation
- Use `useThemeSync` hook
- Cleaner separation of concerns

---

## 🟡 HIGH PRIORITY (Phase 2 - Core Features)

### 4. **Pet Animation System Missing Requirements**

**Current State (`components/Pet.tsx`):**
- No `usePetBehavior` hook (required)
- Not mode-aware (doesn't change based on timer mode)
- No interruptible logic with `useRef` for setTimeout IDs
- Basic animation only (walk/idle)
- No weighted behavior sequences

**Missing Requirements:**
- ✅ Requirement 2: `usePetBehavior` hook
- ✅ Mode-aware behaviors (focus vs break)
- ✅ Interruptible timers with `useRef`
- ✅ Weighted behavior sequences from `PET_CONFIG`

**Required Refactoring:**

**Create `hooks/usePetBehavior.ts`:**
```typescript
export const usePetBehavior = (petId: PetId) => {
  const timerMode = useTimer(s => s.mode);
  const isRunning = useTimer(s => s.isRunning);
  
  const [currentAction, setCurrentAction] = useState<PetAction>('idle');
  const [petX, setPetX] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [isAnimating, setIsAnimating] = useState(false);
  
  // CRITICAL: useRef for setTimeout IDs
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const behaviorSequenceRef = useRef<BehaviorSequence | null>(null);
  
  // Mode-aware behavior selection
  const getBehaviorSequence = (mode: TimerMode) => {
    if (mode === 'focus') return PET_CONFIG.behaviors.work;
    if (mode === 'short' || mode === 'long') return PET_CONFIG.behaviors.break;
    return PET_CONFIG.behaviors.idle;
  };
  
  // Interruptible timer logic
  const startBehavior = () => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    const sequence = getBehaviorSequence(timerMode);
    // ... weighted selection logic
    // Set timer with ref tracking
    timerRef.current = setTimeout(() => {
      // Next behavior
    }, duration);
  };
  
  // Cleanup on unmount or mode change
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timerMode]);
  
  return { currentAction, petX, direction, isAnimating };
};
```

**Update `config/PetConfig.tsx`:**
```typescript
export const PET_CONFIGS = {
  rottweiler: {
    // ... existing
    behaviors: {
      work: [
        { action: 'patrol', weight: 0.4, duration: 5000 },
        { action: 'idle', weight: 0.3, duration: 3000 },
        { action: 'sit', weight: 0.3, duration: 4000 },
      ],
      break: [
        { action: 'sleep', weight: 0.5, duration: 8000 },
        { action: 'play', weight: 0.3, duration: 4000 },
        { action: 'idle', weight: 0.2, duration: 3000 },
      ],
      idle: [
        { action: 'idle', weight: 0.6, duration: 3000 },
        { action: 'patrol', weight: 0.4, duration: 5000 },
      ],
    },
  },
};
```

**Update `components/Pet.tsx`:**
- Use `usePetBehavior` hook
- Remove local state management
- Add hover/click interrupt handlers

---

### 5. **Notes Store Issues**

**Current State (`store/useNotes.tsx`):**

**Issues:**
1. **Line 46-54:** `addNote` doesn't set `dateCreated` or `lastEdited`
2. **Line 75-105:** `bringNoteToFront` has complex, buggy logic
3. **No Supabase sync** (covered in #1)
4. **Missing validation** for note data

**Required Refactoring:**

**Fix `addNote`:**
```typescript
addNote: (note) => {
  const now = new Date().toISOString();
  set((state) => ({
    notes: [
      ...state.notes,
      {
        ...note,
        dateCreated: note.dateCreated || now,
        lastEdited: note.lastEdited || now,
        zIndex: note.zIndex || Math.max(...state.notes.map(n => n.zIndex), 0) + 1,
      },
    ],
  }));
},
```

**Simplify `bringNoteToFront`:**
```typescript
bringNoteToFront: (id: string) => {
  set((state) => {
    const maxZ = Math.max(...state.notes.map(n => n.zIndex), 0);
    return {
      notes: state.notes.map(note =>
        note.id === id
          ? { ...note, zIndex: maxZ + 1 }
          : note
      ),
    };
  });
},
```

**Remove z parameter** from function signature (calculate internally)

---

### 6. **Missing "card-blur" Utility**

**Current State:**
- Glassmorphism styles scattered (`backdrop-blur-xs`, `backdrop-blur-xl`)
- No consistent utility class
- Inconsistent saturation values

**Required Refactoring:**

**Update `app/globals.css`:**
```css
.card-blur {
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
}

/* Variants */
.card-blur-sm {
  backdrop-filter: blur(5px) saturate(150%);
}

.card-blur-lg {
  backdrop-filter: blur(15px) saturate(200%);
}
```

**Update components:**
- Replace `backdrop-blur-xs` with `card-blur-sm`
- Replace `backdrop-blur-xl` with `card-blur-lg`
- Use `card-blur` as default

---

## 🟢 MEDIUM PRIORITY (Phase 3 - Polish)

### 7. **Component Organization Issues**

**Current State:**
- `app/page.tsx` is doing too much (170 lines)
- Theme logic mixed with layout logic
- No clear separation of concerns

**Required Refactoring:**

**Extract Theme Logic:**
- Create `components/ThemeProvider.tsx` (wraps theme sync logic)
- Move `applyTheme` and `applyColorTheme` to `lib/themeUtils.ts`
- Use `useThemeSync` hook in ThemeProvider

**Extract Background Logic:**
- Create `components/Background.tsx` (handles video/mesh rendering)
- Move background rendering logic from `page.tsx`

**Result:** `page.tsx` should be ~50-60 lines, focused on layout only

---

### 8. **Timer Display Title Update Logic**

**Current State (`components/Timer.tsx` lines 26-38):**
- Title update logic is correct but could be extracted

**Minor Refactoring:**

**Create `hooks/useDocumentTitle.ts`:**
```typescript
export const useDocumentTitle = (title: string) => {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = title;
    return () => {
      document.title = originalTitle;
    };
  }, [title]);
};
```

**Use in Timer.tsx:**
```typescript
const formattedTime = `${minutes}:${seconds}`;
useDocumentTitle(`${formattedTime} | Study Space`);
```

---

### 9. **Settings Component Organization**

**Current State (`components/Settings.tsx`):**
- All settings in one component (223 lines)
- No categorization mentioned in Phase 5 plan

**Future Refactoring (Phase 5):**
- Split into `Settings/TimerSettings.tsx`
- Split into `Settings/ThemeSettings.tsx`
- Split into `Settings/PetSettings.tsx`
- Split into `Settings/SoundSettings.tsx`
- Use tabs or sections in main Settings component

---

## 🔵 LOW PRIORITY (Code Quality)

### 10. **Type Safety Improvements**

**Issues:**
- `StickyNote.mode` is optional but used without checks
- Some `any` types in canvas components
- Missing return types on some functions

**Recommendations:**
- Add strict null checks
- Add return type annotations
- Use `satisfies` for config objects

---

### 11. **Console.log Cleanup**

**Found in:**
- `store/useNotes.tsx` (lines 81, 84, 89)
- `components/Sticky.tsx` (line 45)
- `app/page.tsx` (lines 33, 47, 53, 57, 74, 81)
- `components/StickyCanvas.tsx` (multiple)

**Action:** Remove or replace with proper logging utility

---

### 12. **Magic Numbers**

**Found:**
- `MAX_Z = 1000` in `useNotes.tsx` (should be constant)
- Hardcoded durations (25, 5, 15 minutes)
- Hardcoded z-index values

**Recommendations:**
- Extract to `constants.ts`
- Use named constants

---

## 📋 REFACTORING CHECKLIST

### Phase 1 (Critical - Do First)
- [ ] Create `store/useAuth.tsx` with Supabase auth
- [ ] Create `components/AuthProvider.tsx`
- [ ] Create `lib/supabase.ts` client
- [ ] Update `store/useNotes.tsx` with Supabase sync
- [ ] Fix timer auto-skip logic
- [ ] Implement Cambridge Method
- [ ] Create `lib/themeUtils.ts`
- [ ] Create `hooks/useThemeSync.ts`
- [ ] Refactor theme application in `page.tsx`

### Phase 2 (High Priority)
- [ ] Create `hooks/usePetBehavior.ts`
- [ ] Update `config/PetConfig.tsx` with behaviors
- [ ] Refactor `components/Pet.tsx` to use hook
- [ ] Fix `addNote` to set dates
- [ ] Simplify `bringNoteToFront`
- [ ] Add `card-blur` utility class

### Phase 3 (Medium Priority)
- [ ] Extract `components/ThemeProvider.tsx`
- [ ] Extract `components/Background.tsx`
- [ ] Create `hooks/useDocumentTitle.ts`
- [ ] Clean up `app/page.tsx`

### Phase 4-5 (Future)
- [ ] Expand pet configs
- [ ] Split Settings component
- [ ] Add sound integration
- [ ] Final UX polish

---

## 🎯 QUICK WINS (Can Do Now)

1. **Fix `addNote` dates** (5 min)
2. **Simplify `bringNoteToFront`** (10 min)
3. **Add `card-blur` utility** (5 min)
4. **Remove console.logs** (15 min)
5. **Extract constants** (10 min)

**Total: ~45 minutes for immediate improvements**

---

## 📝 NOTES

- Your codebase is well-structured overall
- Zustand stores are clean and follow best practices
- Component organization is good, but `page.tsx` needs splitting
- Missing Supabase integration is the biggest blocker for Phase 1
- Pet animation system needs the most architectural work

---

**Generated:** $(date)
**Codebase Version:** Current state as of review
