'use client';
import { Button } from '@/components/ui/button';
import { signIn, signOut, useSession } from 'next-auth/react';

const AuthButton = () => {
    const { data: session } = useSession();

    if (session) {
        return (
            <Button variant="outline" onClick={() => signOut()}>
                Sign out
            </Button>
        );
    }
    return (
        <Button onClick={() => signIn('google')}>
            Authenticate with Google
        </Button>
    );
};

export default AuthButton;
