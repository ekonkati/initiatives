'use client';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/icons"
import Link from "next/link"
import { useAuth, useUser, FirebaseClientProvider } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";


function LoginComponent() {
    const auth = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const { user: authUser, isUserLoading } = useUser();

    const [email, setEmail] = useState('alia.hassan@example.com');
    const [password, setPassword] = useState('password123');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Redirect if user is already logged in and not loading
        if (!isUserLoading && authUser) {
            router.push('/');
        }
    }, [authUser, isUserLoading, router]);
    
    // While checking auth state, don't render the form
    if (isUserLoading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    const handleLogin = async () => {
        if (!auth) return;
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/');
        } catch (error: any) {
            toast({
                title: "Login Failed",
                description: error.message,
                variant: "destructive",
            });
            setIsLoading(false);
        }
    }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm">
        <CardHeader className="text-center">
          <Logo className="mx-auto h-10 w-10 mb-4 text-primary" />
          <CardTitle className="text-2xl">Login to InitiativeFlow</CardTitle>
          <CardDescription>
            Enter your credentials to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                disabled={isLoading}
              />
            </div>
            <Button onClick={handleLogin} type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
            </Button>
            <Button variant="outline" className="w-full" disabled={isLoading}>
              Login with Google
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
    return (
        <FirebaseClientProvider>
            <LoginComponent />
        </FirebaseClientProvider>
    )
}
