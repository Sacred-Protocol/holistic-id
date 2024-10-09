'use client';
import React, { useEffect, useState } from 'react';
import {
    fetchUserData,
    fetchUserScore,
    fetchIdentity,
    getStampIcon,
    truncateValue,
} from '@/app/services/cubid';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
    Shield,
    ChevronLeft,
    AlertCircle,
    Check,
    MapPin,
    Globe,
    User,
    Eye,
    EyeOff,
    Lock,
} from 'lucide-react';
import TwitterProfile from './TwitterProfile';

interface UserData {
    name: string;
    placename: string;
    country: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    is_human: string;
}

interface UserScore {
    cubid_score: number;
    scoring_schema: number;
}

interface StampDetail {
    stamp_type: string;
    value: string;
    status: 'Verified' | 'Unverified';
}

const UserProfile: React.FC<{ userId: string; view: 'public' | 'private' }> = ({
    userId,
    view,
}) => {
    const [userData, setUserData] = React.useState<UserData | null>(null);
    const [userScore, setUserScore] = React.useState<UserScore | null>(null);
    const [stampDetails, setStampDetails] = React.useState<StampDetail[]>([]);
    const [loading, setLoading] = React.useState(true);

    const [followers_count, setFollowersCount] = useState(0);
    const [following_count, setFollowingCount] = useState(0);
    const [image, setImage] = useState('');
    const [name, setName] = useState('');
    const [googleName, setGoogleName] = useState('');
    const [profile_image_url, setProfileImage] = useState('');
    const [tweet_count, setTweetCount] = useState(0);
    const [username, setUserName] = useState('');
    const [pseudonym, setPseudonym] = useState('');
    const [hasPseudonym, setHasPseudonym] = useState(false);

    const isPublicView = view === 'public';

    useEffect(() => {
        const twitterData = JSON.parse(
            localStorage.getItem('twitterProviderData') || '{}'
        );

        const googleData = JSON.parse(
            localStorage.getItem('googleProviderData') || '{}'
        );
        setGoogleName(googleData?.name);

        const storedPseudonym = localStorage.getItem('userPseudonym');
        if (storedPseudonym) {
            setPseudonym(storedPseudonym);
            setHasPseudonym(true);
        }

        if (twitterData) {
            const {
                followers_count,
                following_count,
                image,
                name,
                profile_image_url,
                tweet_count,
                username,
            } = twitterData;

            setFollowersCount(followers_count);
            setFollowingCount(following_count);
            setImage(image);
            setName(name);
            setProfileImage(profile_image_url);
            setTweetCount(tweet_count);
            setUserName(username);
        }
    }, []);

    React.useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const [userData, userScore, identity] = await Promise.all([
                    fetchUserData(userId),
                    fetchUserScore(userId),
                    fetchIdentity(userId),
                ]);
                setUserData(userData);
                setUserScore(userScore);
                setStampDetails(identity.stamp_details);
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [userId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                Loading user profile...
            </div>
        );
    }

    if (!userData || !userScore) {
        return (
            <div className="flex justify-center items-center h-screen">
                User not found
            </div>
        );
    }

    const getTrustLevel = (score: number) => {
        if (score >= 40) return 'Excellent';
        if (score >= 20) return 'Good';
        if (score >= 5) return 'Fair';
        return 'Needs Improvement';
    };

    return (
        <Card className="w-full max-w-3xl mx-auto mt-44">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
                <div className="mb-4">
                    <CardTitle className="text-3xl font-bold flex items-center gap-2 mb-2">
                        <Shield size={32} />
                        {isPublicView
                            ? `${userData.name || googleName}'s Holistic ID`
                            : 'Your Private Holistic ID'}
                    </CardTitle>
                    <CardDescription className="text-gray-100">
                        {isPublicView
                            ? 'Public profile and trust score'
                            : 'Private view of your Holistic ID'}
                    </CardDescription>
                </div>
                {hasPseudonym && (
                    <Badge
                        variant="secondary"
                        className="text-sm py-1 px-3 bg-white/20 text-white mb-4"
                    >
                        <User size={14} className="mr-1" />
                        {pseudonym}
                    </Badge>
                )}
                <div className="mt-6">
                    <TwitterProfile
                        followers_count={followers_count}
                        following_count={following_count}
                        image={image}
                        name={name}
                        profile_image_url={profile_image_url}
                        tweet_count={tweet_count}
                        username={username}
                    />
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
                    <h3 className="text-xl font-semibold mb-2">Trust Score</h3>
                    <div className="flex items-center gap-4">
                        <div className="text-4xl font-bold text-blue-600">
                            {userScore.cubid_score?.toLocaleString('en-US')}
                        </div>
                        <div className="flex-grow">
                            <Progress
                                value={(userScore?.cubid_score || 0) * 15}
                                className="h-3"
                                max={50}
                            />
                        </div>
                        <div className="text-lg font-medium">
                            {getTrustLevel((userScore.cubid_score || 0) * 10)}
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                        This score reflects{' '}
                        {isPublicView
                            ? `${userData?.name || googleName}'s`
                            : 'your'}{' '}
                        overall digital reputation.
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
                                            className={`p-4 rounded-lg flex flex-col ${
                                                stamp.status === 'Verified'
                                                    ? 'bg-green-50 border border-green-200'
                                                    : 'bg-gray-50 border border-gray-200'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="text-2xl"
                                                        role="img"
                                                        aria-label={
                                                            stamp.stamp_type
                                                        }
                                                    >
                                                        {getStampIcon(
                                                            stamp.stamp_type
                                                        )}
                                                    </span>
                                                    <span className="font-medium capitalize">
                                                        {stamp.stamp_type}
                                                    </span>
                                                </div>
                                                <Badge
                                                    variant={
                                                        stamp.status ===
                                                        'Verified'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                    className={
                                                        stamp.status ===
                                                        'Verified'
                                                            ? 'bg-green-500'
                                                            : ''
                                                    }
                                                >
                                                    {stamp.status ===
                                                    'Verified' ? (
                                                        <Check className="w-3 h-3 mr-1" />
                                                    ) : (
                                                        <AlertCircle className="w-3 h-3 mr-1" />
                                                    )}
                                                    {stamp.status}
                                                </Badge>
                                            </div>
                                            {isPublicView ? (
                                                <p
                                                    className="text-sm text-gray-600 truncate"
                                                    title={stamp.value}
                                                >
                                                    {truncateValue(stamp.value)}
                                                </p>
                                            ) : (
                                                <p className="text-sm text-gray-600 italic">
                                                    <Lock
                                                        size={12}
                                                        className="inline mr-1"
                                                    />
                                                    Value hidden in private view
                                                </p>
                                            )}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side="bottom"
                                        className="max-w-xs"
                                    >
                                        <p className="font-medium">
                                            {stamp.stamp_type} Verification
                                        </p>
                                        {isPublicView ? (
                                            <p className="text-sm">
                                                {stamp.value}
                                            </p>
                                        ) : (
                                            <p className="text-sm italic">
                                                Value hidden in private view
                                            </p>
                                        )}
                                        {stamp.status === 'Verified' && (
                                            <p className="text-xs text-green-600 mt-1">
                                                ✓ Verified on{' '}
                                                {new Date().toLocaleDateString()}
                                            </p>
                                        )}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ))}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between bg-gray-50 rounded-b-lg p-4">
                <Link href="/">
                    <Button
                        variant="secondary"
                        className="flex items-center gap-2"
                    >
                        <ChevronLeft size={16} /> Back to Dashboard
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
};

export default UserProfile;
