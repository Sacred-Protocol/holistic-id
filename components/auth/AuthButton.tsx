'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { signIn, signOut, useSession } from 'next-auth/react';
import { createUser, fetchIdentity } from '@/app/services/cubid';
import { useRouter } from 'next/navigation';

const AuthButton = () => {
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.email) {
            handleAuthentication(session.user.email);
        }
    }, [status, session]);

    const handleAuthentication = async (email: string) => {
        try {
            const user = await createUser(email);
            const identity = await fetchIdentity(user.user_id);

            if (identity?.stamp_details?.length <= 3) {
                const redirectUrl = `https://allow.cubid.me/pii?uid=${
                    user.user_id
                }&redirect_ui=${encodeURIComponent(window.location.origin)}`;
                router.push(redirectUrl);
            }
        } catch (error) {
            console.error('Error during authentication process:', error);
        }
    };

    const handleSignIn = async () => {
        console.log('Signing in with Google...');
        setIsLoading(true);
        try {
            await signIn('google', { redirect: false });
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
