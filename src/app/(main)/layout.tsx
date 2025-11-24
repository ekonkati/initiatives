import { AppShell } from '@/components/app-shell';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <FirebaseClientProvider>
      <AppShell>{children}</AppShell>
    </FirebaseClientProvider>
  );
}
