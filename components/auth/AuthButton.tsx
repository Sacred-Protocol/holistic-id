import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { signIn, signOut, useSession } from 'next-auth/react';
import { createUser, fetchIdentity } from '@/app/services/cubid';
import { useRouter } from 'next/navigation';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Loader2, Twitter, Mail } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const AuthButton: React.FC = () => {
    const [localData, setLocalData] = useState<any>(null);

    const { data: session, status, update } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [authStep, setAuthStep] = useState<
        'initial' | 'twitter' | 'google' | 'complete'
    >('initial');
    const [progress, setProgress] = useState(0);
    const router = useRouter();
    const providerData = session?.providers || localData;

    useEffect(() => {
        if (status === 'authenticated' && session?.providers) {
            // Store provider data in localStorage
            localStorage.setItem(
                'providerData',
                JSON.stringify(session.providers)
            );
        }
    }, [session, status]);

    useEffect(() => {
        // Retrieve data from localStorage if session is not available
        if (status !== 'loading' && !session) {
            const storedData = localStorage.getItem('providerData');
            if (storedData) {
                setLocalData(JSON.parse(storedData));
            }
        }
    }, [session, status]);
    useEffect(() => {
        if (status === 'authenticated') {
            const hasTwitter = session?.providers?.twitter?.name;
            const hasGoogle = session?.providers?.google?.email;
            console.log({ hasTwitter, hasGoogle });
            if (hasTwitter && hasGoogle) {
                handleAuthentication(
                    session?.providers?.google?.email as string
                );
                setAuthStep('complete');
                setProgress(100);
            } else if (
                session?.providers?.twitter?.name &&
                !session?.providers?.google?.email
            ) {
                console.log('step is google');
                setAuthStep('google');
                setProgress(50);
            } else if (
                !session?.providers?.twitter?.name &&
                session?.providers?.google?.email
            ) {
                console.log('step is twitter');
                setAuthStep('twitter');
                setProgress(50);
            }
        } else {
            setAuthStep('initial');
            setProgress(0);
        }
    }, [status, session]);

    const handleAuthentication = async (email: string) => {
        setIsLoading(true);
        try {
            const user = await createUser(email);
            await fetchIdentity(user.user_id);
            await update({
                ...session,
                user: {
                    ...session?.user,
                    id: user.user_id,
                },
            });
        } catch (error) {
            console.error('Error during authentication process:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignIn = async (provider: 'twitter' | 'google') => {
        setIsLoading(true);
        try {
            await signIn(provider, { redirect: false });
        } catch (error) {
            console.error(`Error during ${provider} sign in:`, error);
        } finally {
            setIsLoading(false);
        }
    };

    if (status === 'loading' || isLoading) {
        return (
            <Button disabled className="w-64">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up your identity...
            </Button>
        );
    }

    return (
        <div className="space-y-4 w-64">
            <div className="text-center mb-2">
                <h3 className="text-lg font-semibold">
                    Create Your Holistic ID
                </h3>
                <p className="text-sm text-gray-600">
                    Connect your accounts to get started
                </p>
            </div>
            <Progress value={progress} className="w-full h-2 mb-4" />
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            onClick={() => handleSignIn('twitter')}
                            className="w-full"
                            disabled={session?.providers?.twitter?.name}
                        >
                            <Twitter className="mr-2 h-4 w-4" />
                            {session?.providers?.twitter?.name
                                ? 'Twitter Connected'
                                : 'Connect Twitter'}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>
                            {session?.providers?.twitter?.name
                                ? 'Twitter account connected'
                                : 'Connect your Twitter account'}
                        </p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            onClick={() => handleSignIn('google')}
                            className="w-full"
                            disabled={session?.providers?.google?.email}
                        >
                            <Mail className="mr-2 h-4 w-4" />
                            {session?.providers?.google?.email
                                ? 'Google Connected'
                                : 'Connect Google'}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>
                            {session?.providers?.google?.email
                                ? 'Google account connected'
                                : 'Connect your Google account'}
                        </p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            {(authStep === 'twitter' || authStep === 'google') && (
                <p className="text-sm text-center text-gray-600">
                    Great start! Now connect your{' '}
                    {authStep === 'twitter' ? 'Twitter' : 'Google'} account to
                    complete your Holistic ID.
                </p>
            )}
        </div>
    );
};

export default AuthButton;
