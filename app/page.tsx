'use client';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AuthButton from '@/components/auth/AuthButton';

import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import { UserDashboard } from '@/components/Dashboard';
import { useEffect, useState } from 'react';

export default function Home() {
    const { data: session, status } = useSession() as {
        data: Session | null;
        status: string;
    };

    const [hasTwitter, setHasTwitter] = useState(false);
    const [hasGoogle, setHasGoogle] = useState(false);
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (status === 'authenticated' && session?.providers) {
            const storedGoogleData = JSON.parse(
                localStorage.getItem('googleProviderData') || '{}'
            );
            const storedTwitterData = JSON.parse(
                localStorage.getItem('twitterProviderData') || '{}'
            );

            console.log('before:', { storedGoogleData, storedTwitterData });

            // Update localStorage with current session data
            if (
                Object.keys(session.providers.google || {}).length &&
                JSON.stringify(session.providers.google) !== '{}'
            ) {
                localStorage.setItem(
                    'googleProviderData',
                    JSON.stringify(session.providers.google)
                );
            }

            if (
                Object.keys(session.providers.twitter || {}).length &&
                JSON.stringify(session.providers.twitter) !== '{}'
            ) {
                localStorage.setItem(
                    'twitterProviderData',
                    JSON.stringify(session.providers.twitter)
                );
            }

            const updatedGoogleData = JSON.parse(
                localStorage.getItem('googleProviderData') || '{}'
            );
            const updatedTwitterData = JSON.parse(
                localStorage.getItem('twitterProviderData') || '{}'
            );

            if (!Object.keys(updatedTwitterData).length) {
                setHasTwitter(false);
            } else {
                setHasTwitter(true);
            }

            if (!Object.keys(updatedGoogleData).length) {
                setEmail('');
                setHasGoogle(false);
            } else {
                setEmail(updatedGoogleData.email);
                setHasGoogle(true);
            }
        }
    }, [session]);

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            {status === 'authenticated' && hasTwitter && hasGoogle ? (
                <UserDashboard email={email} />
            ) : (
                <Card className="w-[350px]">
                    <CardHeader>
                        <CardTitle className="text-4xl font-bold text-center">
                            Login to Sacred
                        </CardTitle>
                        <CardDescription className="text-center">
                            Your trusted reputation system
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <AuthButton />
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <p className="text-sm text-muted-foreground">
                            Connect and build your trust score
                        </p>
                    </CardFooter>
                </Card>
            )}
        </main>
    );
}
