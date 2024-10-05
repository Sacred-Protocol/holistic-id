import {
    createUser,
    fetchUserData,
    fetchUserScore,
    fetchIdentity,
} from '@/app/services/cubid';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from './ui/card';

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
    console.log('email', email);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [userScore, setUserScore] = useState<UserScore | null>(null);
    const [stampDetails, setStampDetails] = useState<StampDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const initializeUser = async () => {
            try {
                const userResponse = await createUser(email);
                console.log(userResponse);
                setUserId(userResponse.user_id);

                const [userData, userScore, identity] = await Promise.all([
                    fetchUserData(userResponse.user_id),
                    fetchUserScore(userResponse.user_id),
                    fetchIdentity(userResponse.user_id),
                ]);
                setUserData(userData);
                setUserScore(userScore);
                setStampDetails(identity.stamp_details);
                console.log({ userData, userScore, identity, userResponse });
            } catch (error) {
                console.error('Error initializing user data:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeUser();
    }, [email]);

    if (loading) {
        return <div>Loading user data...</div>;
    }

    return (
        <Card className="w-[600px]">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">
                    User Dashboard
                </CardTitle>
                <CardDescription>
                    Your Sacred profile and trust score
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold">
                            Personal Information
                        </h3>
                        <p>Name: {userData?.name}</p>
                        <p>Country: {userData?.country}</p>
                        <p>Address: {userData?.address}</p>
                        <p>Is Human: {userData?.is_human}</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Trust Score</h3>
                        <p>Cubid Score: {userScore?.cubid_score}</p>
                        <p>Scoring Schema: {userScore?.scoring_schema}</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">
                            Verified Stamps
                        </h3>
                        <ul className="list-disc pl-5">
                            {stampDetails.map((stamp, index) => (
                                <li key={index}>
                                    {stamp.stamp_type} - {stamp.status}
                                    {stamp.verified_date &&
                                        ` (Verified on: ${stamp.verified_date})`}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button variant="outline" onClick={() => {}}>
                    Update Profile
                </Button>
            </CardFooter>
        </Card>
    );
};
