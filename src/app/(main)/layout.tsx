'use client';

import { AppShell } from '@/components/app-shell';
import { FirebaseClientProvider, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function MainApp({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If auth is done loading and there's still no user, redirect to login.
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  // While checking for the user, show a loading state.
  // This prevents any of the children from rendering and trying to fetch data.
  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-lg font-semibold">Loading...</div>
      </div>
    );
  }

  // Only render the main app shell if there is a logged-in user.
  return <AppShell>{children}</AppShell>;
}

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <FirebaseClientProvider>
      <MainApp>{children}</MainApp>
    </FirebaseClientProvider>
  );
}
