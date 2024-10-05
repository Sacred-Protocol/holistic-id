'use client';

import { useEffect, useState } from 'react';
import {
    fetchUserData,
    fetchUserScore,
    fetchIdentity,
} from '@/app/services/cubid';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@/components/ui/card';

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

const UserProfile = ({ userId }: { userId: string }) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [userScore, setUserScore] = useState<UserScore | null>(null);
    const [stampDetails, setStampDetails] = useState<StampDetail[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        return <div>Loading user profile...</div>;
    }

    if (!userData || !userScore) {
        return <div>User not found</div>;
    }

    return (
        <Card className="w-[600px] mx-auto mt-8">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">
                    User Profile
                </CardTitle>
                <CardDescription>
                    Sacred profile and trust score for {userData.name}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold">
                            Personal Information
                        </h3>
                        <p>Name: {userData.name}</p>
                        <p>Country: {userData.country}</p>
                        <p>Is Human: {userData.is_human}</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Trust Score</h3>
                        <p>Cubid Score: {userScore.cubid_score}</p>
                        <p>Scoring Schema: {userScore.scoring_schema}</p>
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
        </Card>
    );
};

export default UserProfile;
