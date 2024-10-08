import axios from 'axios';

interface TwitterUserData {
    username: string;
    name: string;
    followers_count: number;
    following_count: number;
    tweet_count: number;
    profile_image_url: string;
}

export async function fetchTwitterUserData(
    accessToken: string
): Promise<TwitterUserData> {
    try {
        const response = await axios.get('https://api.twitter.com/2/users/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            params: {
                'user.fields': 'public_metrics,profile_image_url',
            },
        });

        const userData = response.data.data;
        return {
            username: userData.username,
            name: userData.name,
            followers_count: userData.public_metrics.followers_count,
            following_count: userData.public_metrics.following_count,
            tweet_count: userData.public_metrics.tweet_count,
            profile_image_url: userData.profile_image_url,
        };
    } catch (error) {
        console.error('Error fetching Twitter user data:', error);
        throw error;
    }
}
