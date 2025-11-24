'use client';

import { useState, useEffect } from 'react';
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
import { useAuth, useUser } from "@/firebase";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from "next/navigation";
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export default function SignupPage() {
    const auth = useAuth();
    const firestore = useFirestore();
    const router = useRouter();
    const { user: authUser, isUserLoading } = useUser();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Redirect if user is already logged in
        if (!isUserLoading && authUser) {
            router.push('/');
        }
    }, [authUser, isUserLoading, router]);

    const handleSignup = async () => {
        if (!auth || !firestore) return;
        setError(null);
        if (!name) {
            setError("Please enter your name.");
            return;
        }
        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Create a user profile in Firestore
            const userRef = doc(firestore, "users", user.uid);
            await setDoc(userRef, {
                id: user.uid,
                name: name,
                email: user.email,
                role: 'Team Member', // Default role
                department: 'Unassigned',
                designation: 'New Member',
                active: true,
                photoUrl: `https://picsum.photos/seed/${user.uid}/40/40`
            });

            router.push('/'); // Redirect to dashboard after successful signup
        } catch (error: any) {
            setError(error.message);
            setIsLoading(false);
        }
    }

    if (isUserLoading) {
      return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm">
        <CardHeader className="text-center">
          <Logo className="mx-auto h-10 w-10 mb-4 text-primary" />
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
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
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                disabled={isLoading}
              />
            </div>
            <Button onClick={handleSignup} type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
