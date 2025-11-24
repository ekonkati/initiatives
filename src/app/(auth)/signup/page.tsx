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
import { useAuth, useUser, useFirestore, FirebaseClientProvider, errorEmitter, FirestorePermissionError } from "@/firebase";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from "next/navigation";
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';


function SignupComponent() {
    const auth = useAuth();
    const firestore = useFirestore();
    const router = useRouter();
    const { user: authUser, isUserLoading } = useUser();
    const { toast } = useToast();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Redirect if user is already logged in
        if (!isUserLoading && authUser) {
            router.push('/');
        }
    }, [authUser, isUserLoading, router]);

    const handleSignup = async () => {
        if (!auth || !firestore) return;
        if (!name) {
            toast({
                title: "Signup Failed",
                description: "Please enter your name.",
                variant: "destructive",
            });
            return;
        }
        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Create a user profile in Firestore
            const userRef = doc(firestore, "users", user.uid);
            const userProfileData = {
                id: user.uid,
                name: name,
                email: user.email,
                role: 'Team Member', // Default role
                department: 'Unassigned',
                designation: 'New Member',
                active: true,
                photoUrl: `https://picsum.photos/seed/${user.uid}/40/40`
            };

            // Use non-blocking write with contextual error handling
            setDoc(userRef, userProfileData)
              .then(() => {
                toast({
                    title: "Account Created",
                    description: "You can now log in with your credentials.",
                });
                router.push('/login');
              })
              .catch((serverError) => {
                // This will now catch permission errors and emit them globally
                const permissionError = new FirestorePermissionError({
                  path: userRef.path,
                  operation: 'create',
                  requestResourceData: userProfileData,
                });
                errorEmitter.emit('permission-error', permissionError);

                // We can still show a generic toast to the user
                toast({
                  title: "Signup Failed",
                  description: "Could not create user profile. Permissions denied.",
                  variant: "destructive",
                });
                setIsLoading(false);
              });

        } catch (error: any) {
            // This catches errors from createUserWithEmailAndPassword (e.g., weak password)
            toast({
                title: "Signup Failed",
                description: error.message,
                variant: "destructive",
            });
            setIsLoading(false);
        }
    }

    if (isUserLoading) {
      return <div className="flex h-screen w-full items-center justify-center">
            <div className="rounded-md border bg-card px-6 py-3 text-lg font-semibold shadow-sm">Loading...</div>
        </div>;
    }

    if (authUser) {
        return null;
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

export default function SignupPage() {
    return (
        <FirebaseClientProvider>
            <SignupComponent />
        </FirebaseClientProvider>
    )
}
