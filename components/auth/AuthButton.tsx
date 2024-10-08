import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { signIn, signOut, useSession } from 'next-auth/react';
import { createUser, fetchIdentity } from '@/app/services/cubid';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Loader2, Twitter, Mail, User } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';

const AuthButton: React.FC = () => {
    const { data: session, status, update } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [authStep, setAuthStep] = useState<
        'initial' | 'twitter' | 'google' | 'pseudonym' | 'complete'
    >('initial');
    const [progress, setProgress] = useState(0);
    const [hasTwitter, setHasTwitter] = useState(false);
    const [hasGoogle, setHasGoogle] = useState(false);
    const [hasPseudonym, setHasPseudonym] = useState(false);
    const [email, setEmail] = useState('');
    const [pseudonym, setPseudonym] = useState('');

    useEffect(() => {
        if (status === 'authenticated' && session?.providers) {
            localStorage.setItem(
                'providerData',
                JSON.stringify(session.providers)
            );
        }

        const storedPseudonym = localStorage.getItem('userPseudonym');
        if (storedPseudonym) {
            setPseudonym(storedPseudonym);
            setHasPseudonym(true);
        }
    }, [session, status]);

    useEffect(() => {
        if (status === 'authenticated' && session?.providers) {
            const storedGoogleData = JSON.parse(
                localStorage.getItem('googleProviderData') || '{}'
            );
            const storedTwitterData = JSON.parse(
                localStorage.getItem('twitterProviderData') || '{}'
            );

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

            setHasTwitter(Object.keys(updatedTwitterData).length > 0);
            setHasGoogle(Object.keys(updatedGoogleData).length > 0);
            setEmail(updatedGoogleData.email || '');
        }
    }, [session]);

    useEffect(() => {
        if (status === 'authenticated') {
            if (hasTwitter && hasGoogle && hasPseudonym) {
                handleAuthentication(email);
                setAuthStep('complete');
                setProgress(100);
            } else if (hasTwitter && hasGoogle && !hasPseudonym) {
                setAuthStep('pseudonym');
                setProgress(66);
            } else if (
                (hasTwitter && !hasGoogle) ||
                (!hasTwitter && hasGoogle)
            ) {
                setAuthStep(hasTwitter ? 'google' : 'twitter');
                setProgress(33);
            }
        } else {
            setAuthStep('initial');
            setProgress(0);
        }
    }, [status, session, hasTwitter, hasGoogle, hasPseudonym]);

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

    const handlePseudonymSubmit = () => {
        if (pseudonym.trim()) {
            localStorage.setItem('userPseudonym', pseudonym.trim());
            setHasPseudonym(true);
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
                            disabled={hasTwitter}
                        >
                            <Twitter className="mr-2 h-4 w-4" />
                            {hasTwitter
                                ? 'Twitter Connected'
                                : 'Connect Twitter'}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>
                            {hasTwitter
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
                            disabled={hasGoogle}
                        >
                            <Mail className="mr-2 h-4 w-4" />
                            {hasGoogle ? 'Google Connected' : 'Connect Google'}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>
                            {hasGoogle
                                ? 'Google account connected'
                                : 'Connect your Google account'}
                        </p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            {authStep === 'pseudonym' && (
                <div className="space-y-2">
                    <Input
                        type="text"
                        placeholder="Enter your pseudonym"
                        value={pseudonym}
                        onChange={(e) => setPseudonym(e.target.value)}
                    />
                    <Button
                        onClick={handlePseudonymSubmit}
                        className="w-full"
                        disabled={!pseudonym.trim()}
                    >
                        <User className="mr-2 h-4 w-4" />
                        Set Pseudonym
                    </Button>
                </div>
            )}
            {(authStep === 'twitter' ||
                authStep === 'google' ||
                authStep === 'pseudonym') && (
                <p className="text-sm text-center text-gray-600">
                    {authStep === 'pseudonym'
                        ? 'Great! Now enter your pseudonym to complete your Holistic ID.'
                        : `Great start! Now connect your ${
                              authStep === 'twitter' ? 'Twitter' : 'Google'
                          } account to continue.`}
                </p>
            )}
        </div>
    );
};

export default AuthButton;
