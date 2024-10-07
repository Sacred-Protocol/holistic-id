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
import { LogIn, LogOut, UserPlus, Loader2, Twitter, Mail } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const AuthButton: React.FC = () => {
    const { data: session, status, update } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [authStep, setAuthStep] = useState<
        'initial' | 'twitter' | 'google' | 'complete'
    >('initial');
    const [progress, setProgress] = useState(0);
    const router = useRouter();
    useEffect(() => {
        console.log({ status, session });
        if (status === 'authenticated') {
            const hasTwitter =
                session?.twitterUser?.name && session?.twitterUser?.image;
            const hasGoogle =
                session?.googleUser?.name && session?.googleUser?.email;

            if (hasTwitter && hasGoogle) {
                handleAuthentication(session.googleUser.email as string);
                setAuthStep('complete');
                setProgress(100);
            } else if (hasTwitter) {
                setAuthStep('google');
                setProgress(50);
            } else if (hasGoogle) {
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

    if (authStep === 'complete') {
        return (
            <Button onClick={() => router.push('/dashboard')} className="w-64">
                <UserPlus className="mr-2 h-4 w-4" />
                View Your Holistic ID
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
                            disabled={authStep === 'twitter'}
                        >
                            <Twitter className="mr-2 h-4 w-4" />
                            {authStep === 'twitter'
                                ? 'Twitter Connected'
                                : 'Connect Twitter'}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>
                            {authStep === 'twitter'
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
                            disabled={authStep === 'google'}
                        >
                            <Mail className="mr-2 h-4 w-4" />
                            {authStep === 'google'
                                ? 'Google Connected'
                                : 'Connect Google'}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>
                            {authStep === 'google'
                                ? 'Google account connected'
                                : 'Connect your Google account'}
                        </p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            {(authStep === 'twitter' || authStep === 'google') && (
                <p className="text-sm text-center text-gray-600">
                    Great start! Now connect your{' '}
                    {authStep === 'twitter' ? 'Google' : 'Twitter'} account to
                    complete your Holistic ID.
                </p>
            )}
        </div>
    );
};

export default AuthButton;
