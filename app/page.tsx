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

interface CustomSession extends Session {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

export default function Home() {
    const { data: session, status } = useSession() as {
        data: CustomSession | null;
        status: string;
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            {status === 'authenticated' && session?.user?.email ? (
                <UserDashboard email={session.user.email} />
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
