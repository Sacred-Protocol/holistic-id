import React, { useState, useEffect } from 'react';
import {
    createUser,
    fetchUserData,
    fetchUserScore,
    fetchIdentity,
    getStampIcon,
    truncateValue,
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
import {
    Shield,
    ChevronRight,
    AlertCircle,
    Check,
    LogOut,
    User,
    Eye,
    EyeOff,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
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

export const UserDashboard = ({ email }: { email: string }) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [userScore, setUserScore] = useState<UserScore | null>(null);
    const [stampDetails, setStampDetails] = useState<StampDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const router = useRouter();
    const { data: session, status, update } = useSession();
    const [pseudonym, setPseudonym] = useState('');
    const [hasPseudonym, setHasPseudonym] = useState(false);

    const [followers_count, setFollowersCount] = useState(0);
    const [following_count, setFollowingCount] = useState(0);
    const [image, setImage] = useState('');
    const [name, setName] = useState('');
    const [googleName, setGoogleName] = useState('');
    const [profile_image_url, setProfileImage] = useState('');
    const [tweet_count, setTweetCount] = useState(0);
    const [username, setUserName] = useState('');

    const handleViewProfile = (type: 'public' | 'private') => {
        if (userId) {
            router.push(`/profile/${userId}?view=${type}`);
        }
    };

    useEffect(() => {
        const twitterData = JSON.parse(
            localStorage.getItem('twitterProviderData') || '{}'
        );

        const googleData = JSON.parse(
            localStorage.getItem('googleProviderData') || '{}'
        );

        const storedPseudonym = localStorage.getItem('userPseudonym');
        if (storedPseudonym) {
            setPseudonym(storedPseudonym);
            setHasPseudonym(true);
        }

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

    useEffect(() => {
        const initializeUser = async () => {
            try {
                const userResponse = await createUser(email);
                console.log('user response', email, userResponse);
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
        localStorage.removeItem('twitterProviderData');
        localStorage.removeItem('googleProviderData');
        localStorage.removeItem('userPseudonym');
        router.push('/'); // Redirect to home page after logout
    };

    const handleUpdateProfile = () => {
        if (userId) {
            const reputationUrl = `https://allow.cubid.me/allow?page_id=31&uid=${userId}&redirect_ui=${encodeURIComponent(
                window.location.origin
            )}`;

            console.dir({ reputationUrl, userId });
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
        if (score >= 40) return 'Excellent';
        if (score >= 20) return 'Good';
        if (score >= 5) return 'Fair';
        return 'Needs Improvement';
    };

    return (
        <Card className="w-full max-w-3xl mx-auto">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-3xl font-bold flex items-center gap-2 mb-2">
                            <Shield size={32} /> Your Holistic ID
                        </CardTitle>
                        <CardDescription className="text-gray-100 mb-4">
                            Your unified digital identity and trust score
                        </CardDescription>
                        {hasPseudonym && (
                            <Badge
                                variant="secondary"
                                className="text-sm py-1 px-3 bg-white/20 text-white"
                            >
                                <User size={14} className="mr-1" />
                                {pseudonym}
                            </Badge>
                        )}
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
                            {userScore?.cubid_score?.toLocaleString('en-US') ||
                                0}
                        </div>
                        <div className="flex-grow">
                            <Progress
                                value={(userScore?.cubid_score || 0) * 2}
                                className="h-3"
                                max={50}
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
                                            <p
                                                className="text-sm text-gray-600 truncate"
                                                title={stamp.value}
                                            >
                                                {truncateValue(stamp.value)}
                                            </p>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side="bottom"
                                        className="max-w-xs"
                                    >
                                        <p className="font-medium">
                                            {stamp.stamp_type} Verification
                                        </p>
                                        <p className="text-sm">{stamp.value}</p>
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
                <Button variant="outline" onClick={handleUpdateProfile}>
                    Enhance Your Profile
                </Button>
                <div className="space-x-2">
                    <Button
                        variant="secondary"
                        className="flex items-center gap-2"
                        onClick={() => handleViewProfile('public')}
                    >
                        <Eye size={16} /> View Public Profile
                    </Button>
                </div>
                <div className="space-x-2">
                    <Button
                        variant="secondary"
                        className="flex items-center gap-2 mt-2"
                        onClick={() => handleViewProfile('private')}
                    >
                        <EyeOff size={16} /> View Private Profile
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};
