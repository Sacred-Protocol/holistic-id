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
    const [email, setEmail] = useState('');
    const [pseudonym, setPseudonym] = useState('');
    const [hasPseudonym, setHasPseudonym] = useState(false);

    useEffect(() => {
        if (status === 'authenticated' && session?.providers) {
            const storedTwitterData = JSON.parse(
                localStorage.getItem('twitterProviderData') || '{}'
            );

            if (
                Object.keys(session.providers.twitter || {}).length &&
                JSON.stringify(session.providers.twitter) !== '{}'
            ) {
                localStorage.setItem(
                    'twitterProviderData',
                    JSON.stringify(session.providers.twitter)
                );
            }

            const updatedTwitterData = JSON.parse(
                localStorage.getItem('twitterProviderData') || '{}'
            );

            const storedPseudonym = localStorage.getItem('userPseudonym');
            if (storedPseudonym) {
                setPseudonym(storedPseudonym);
                setHasPseudonym(true);
            }

            if (!Object.keys(updatedTwitterData).length) {
                setHasTwitter(false);
            } else {
                setEmail(updatedTwitterData.email);
                setHasTwitter(true);
            }
        }
    }, [session]);

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            {status === 'authenticated' && hasTwitter && hasPseudonym ? (
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
