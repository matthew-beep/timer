// app/auth/confirmed/page.tsx
import { Suspense } from 'react';
import ConfirmedContent from './ConfirmedContent';

export default function ConfirmedPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text">Loading...</p>
          </div>
        </div>
      }
    >
      <ConfirmedContent />
    </Suspense>
  );
}