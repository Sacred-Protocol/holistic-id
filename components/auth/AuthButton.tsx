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
import { LogIn, LogOut, UserPlus, Loader2 } from 'lucide-react';

const AuthButton: React.FC = () => {
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

            const reputation = `https://allow.cubid.me/pii?uid=${
                user.user_id
            }&redirect_ui=${encodeURIComponent(window.location.origin)}`;

            setShowBuildReputation(true);
            setReputationUrl(reputation);
        } catch (error) {
            console.error('Error during authentication process:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignIn = async () => {
        setIsLoading(true);
        try {
            await signIn('twitter', { redirect: false });
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
        return (
            <Button disabled className="w-40">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
            </Button>
        );
    }

    if (session) {
        return (
            <div className="flex gap-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                onClick={() => signOut()}
                                className="w-40"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign out
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Sign out of your account</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                {showBuildReputation && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={handleBuildReputation}
                                    className="w-40"
                                >
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Build Profile
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Enhance your Holistic ID</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
        );
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button onClick={handleSignIn} className="w-48">
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign in with Twitter
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Authenticate and create your Holistic ID</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default AuthButton;
