'use client';
import React, { useEffect, useState } from 'react';
import {
    fetchUserData,
    fetchUserScore,
    fetchIdentity,
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
    share_type: string;
    value: string;
    status: 'verified' | 'unverified';
    verified_date?: string;
}

const UserProfile: React.FC<{ userId: string }> = ({ userId }) => {
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

    useEffect(() => {
        const twitterData = JSON.parse(
            localStorage.getItem('twitterProviderData') || '{}'
        );

        const googleData = JSON.parse(
            localStorage.getItem('googleProviderData') || '{}'
        );
        setGoogleName(googleData?.name);

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
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Needs Improvement';
    };

    return (
        <Card className="w-full max-w-3xl mx-auto mt-44">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="text-3xl font-bold flex items-center gap-2">
                    <Shield size={32} /> {userData.name || googleName}'s
                    Holistic ID
                </CardTitle>
                <CardDescription className="text-gray-100">
                    Public profile and trust score
                </CardDescription>
                <div className="mt-4">
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
                            {userScore.cubid_score}
                        </div>
                        <div className="flex-grow">
                            <Progress
                                value={userScore.cubid_score}
                                className="h-3"
                            />
                        </div>
                        <div className="text-lg font-medium">
                            {getTrustLevel(userScore.cubid_score)}
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                        This score reflects {userData.name}'s overall digital
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
                        <div className="flex items-center gap-2">
                            <User className="text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-600">Name</p>
                                <p className="font-medium">{userData.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Globe className="text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-600">Country</p>
                                <p className="font-medium">
                                    {userData.country}
                                </p>
                            </div>
                        </div>
                        <div className="col-span-2 flex items-center gap-2">
                            <MapPin className="text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-600">
                                    Location
                                </p>
                                <p className="font-medium">
                                    Lat: {userData.coordinates.lat?.toFixed(2)},
                                    Lon: {userData.coordinates.lng?.toFixed(2)}
                                </p>
                            </div>
                        </div>
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
