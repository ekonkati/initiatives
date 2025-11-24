
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FirebaseClientProvider, useUser } from '@/firebase';

function RootRedirect() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isUserLoading) {
      // Wait until the authentication state is resolved.
      return;
    }

    if (user) {
      // If user is logged in, redirect to the main dashboard.
      router.replace('/dashboard');
    } else {
      // If user is not logged in, redirect to the login page.
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  // Render a loading state while the redirect is happening.
  return (
    <div className="flex h-screen w-full items-center justify-center">
        <div className="rounded-md border bg-card px-6 py-3 text-lg font-semibold shadow-sm">Loading...</div>
    </div>
  );
}


export default function RootPage() {
    return (
        <FirebaseClientProvider>
            <RootRedirect />
        </FirebaseClientProvider>
    )
}
