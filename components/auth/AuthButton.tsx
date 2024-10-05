'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { signIn, signOut, useSession } from 'next-auth/react';
import { createUser, fetchIdentity } from '@/app/services/cubid';

const AuthButton = () => {
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (status === 'authenticated') {
            if (session?.user?.email) {
                createUser(session.user.email).then((user) => {
                    const uuId = user.user_id;
                    fetchIdentity(uuId).then((identity) => {
                        if (identity?.stamp_details?.length <= 3) {
                            //redirect to: https://allow.cubid.me/pii?uid=<cubid_uuid>&redirect_ui=http://localhost:3000
                        }
                    });
                });
            }
        }
    }, [status, session]);

    const handleSignIn = async () => {
        console.log('Signing in with Google...');
        setIsLoading(true);
        try {
            const result = await signIn('google', { redirect: false });
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
