'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { signIn, signOut, useSession } from 'next-auth/react';
import { userExists } from '@/app/services/cubid';

const AuthButton = () => {
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (status === 'authenticated') {
            if (session?.user?.email) {
                userExists(session.user.email).then((exists) => {
                    console.log({ exists });
                });
            }
        }
    }, [status, session]);

    const handleSignIn = async () => {
        console.log('Signing in with Google...');
        setIsLoading(true);
        try {
            const result = await signIn('google', { redirect: false });
            console.log('Result:', { session });
            /*if (result?.error) {
                console.error('Sign in error:', result.error);
                console.log('Error during sign in:', result.error);
            } else if (result?.ok && session?.user?.email) {
                const exists = await userExists(session.user.email);
                if (exists) {
                    console.log('User exists in Cubid');
                    // Handle existing user logic
                } else {
                    console.log('New user, proceed with onboarding');
                    // Handle new user logic
                }
            }*/
        } catch (error) {
            console.error('Error during sign in:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (status === 'loading' || isLoading) {
        return <Button disabled>Loading...</Button>;
    }

    if (session) {
        return (
            <Button variant="outline" onClick={() => signOut()}>
                Sign out
            </Button>
        );
    }

    return <Button onClick={handleSignIn}>Authenticate with Google</Button>;
};

export default AuthButton;
