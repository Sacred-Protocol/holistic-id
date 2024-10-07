import React, { useState, useEffect } from 'react';
import {
    createUser,
    fetchUserData,
    fetchUserScore,
    fetchIdentity,
} from '@/app/services/cubid';
import { Button } from './ui/button';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from './ui/card';
import { Progress } from './ui/progress';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from './ui/tooltip';
import { Badge } from './ui/badge';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, ChevronRight, AlertCircle, Check, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface UserData {
    name: string;
    address: string;
    country: string;
    coordinates: {
        lat: number;
        lon: number;
    };
    is_human: string;
}

interface UserScore {
    cubid_score: number;
    scoring_schema: number;
}

interface StampDetail {
    stamp_type: string;
    share_type: string;
    value: string;
    status: 'verified' | 'unverified';
    verified_date?: string;
}

export const UserDashboard = ({ email }: { email: string }) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [userScore, setUserScore] = useState<UserScore | null>(null);
    const [stampDetails, setStampDetails] = useState<StampDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const initializeUser = async () => {
            try {
                const userResponse = await createUser(email);
                setUserId(userResponse.user_id);

                const [userData, userScore, identity] = await Promise.all([
                    fetchUserData(userResponse.user_id),
                    fetchUserScore(userResponse.user_id),
                    fetchIdentity(userResponse.user_id),
                ]);
                setUserData(userData);
                setUserScore(userScore);
                setStampDetails(identity.stamp_details);
            } catch (error) {
                console.error('Error initializing user data:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeUser();
    }, [email]);

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push('/'); // Redirect to home page after logout
    };

    const handleUpdateProfile = () => {
        if (userId) {
            const reputationUrl = `https://allow.cubid.me/pii?uid=${userId}&redirect_ui=${encodeURIComponent(
                window.location.origin
            )}`;
            router.push(reputationUrl);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                Loading your Holistic ID...
            </div>
        );
    }

    const getTrustLevel = (score: number) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Needs Improvement';
    };

    return (
        <Card className="w-full max-w-3xl mx-auto">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-3xl font-bold flex items-center gap-2">
                            <Shield size={32} /> Your Holistic ID
                        </CardTitle>
                        <CardDescription className="text-gray-100">
                            Your unified digital identity and trust score
                        </CardDescription>
                    </div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleLogout}
                                    className="text-white hover:bg-white/20"
                                >
                                    <LogOut size={24} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Log out</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
                    <h3 className="text-xl font-semibold mb-2">Trust Score</h3>
                    <div className="flex items-center gap-4">
                        <div className="text-4xl font-bold text-blue-600">
                            {userScore?.cubid_score || 0}
                        </div>
                        <div className="flex-grow">
                            <Progress
                                value={userScore?.cubid_score || 0}
                                className="h-3"
                            />
                        </div>
                        <div className="text-lg font-medium">
                            {getTrustLevel(userScore?.cubid_score || 0)}
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                        Your trust score reflects your overall digital
                        reputation.
                    </p>
                </div>

                <div>
                    <h3 className="text-xl font-semibold mb-3">
                        Verified Credentials
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        {stampDetails.map((stamp, index) => (
                            <TooltipProvider key={index}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div
                                            className={`p-3 rounded-lg flex items-center gap-2 ${
                                                stamp.status === 'verified'
                                                    ? 'bg-green-100'
                                                    : 'bg-gray-100'
                                            }`}
                                        >
                                            {stamp.status === 'verified' ? (
                                                <Check className="text-green-600" />
                                            ) : (
                                                <AlertCircle className="text-yellow-600" />
                                            )}
                                            <span className="font-medium">
                                                {stamp.stamp_type}
                                            </span>
                                            <Badge
                                                variant={
                                                    stamp.status === 'verified'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {stamp.status}
                                            </Badge>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>
                                            {stamp.status === 'verified'
                                                ? `Verified on: ${stamp.verified_date}`
                                                : 'Not yet verified'}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-semibold mb-3">
                        Personal Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Name</p>
                            <p className="font-medium">{userData?.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Country</p>
                            <p className="font-medium">{userData?.country}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-sm text-gray-600">Address</p>
                            <p className="font-medium">{userData?.address}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between bg-gray-50 rounded-b-lg p-4">
                <Button variant="outline" onClick={handleUpdateProfile}>
                    Enhance Your Profile
                </Button>
                <Link href={`/profile/${userId}`}>
                    <Button
                        variant="secondary"
                        className="flex items-center gap-2"
                    >
                        View Public Profile <ChevronRight size={16} />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
};
