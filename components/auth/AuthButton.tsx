'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { signIn, signOut, useSession } from 'next-auth/react';
import { createUser, fetchIdentity } from '@/app/services/cubid';
import { useRouter } from 'next/navigation';

const AuthButton = () => {
    const { data: session, status, update } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [showBuildReputation, setShowBuildReputation] = useState(false);
    const [reputationUrl, setReputationUrl] = useState('');
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

            // Update the session with the user_id
            await update({
                ...session,
                user: {
                    ...session?.user,
                    id: user.user_id,
                },
            });

            const reputation = `https://allow.cubid.me/pii?uid=${
                user.user_id
            }&redirect_ui=${encodeURIComponent(window.location.origin)}`;

            setShowBuildReputation(true);
            setReputationUrl(reputation);
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

    const handleBuildReputation = () => {
        router.push(reputationUrl);
    };

    if (status === 'loading' || isLoading) {
        return <Button disabled>Loading...</Button>;
    }

    if (session) {
        return (
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => signOut()}>
                    Sign out
                </Button>
                {showBuildReputation && (
                    <Button onClick={handleBuildReputation}>
                        Build Reputation
                    </Button>
                )}
            </div>
        );
    }

    return <Button onClick={handleSignIn}>Authenticate with Google</Button>;
};

export default AuthButton;
