import axios from 'axios';
import OAuth from 'oauth-1.0a';
import { createHmac } from 'crypto';

interface TwitterUserData {
    username: string;
    name: string;
    followers_count: number;
    following_count: number;
    tweet_count: number;
    profile_image_url: string;
    email?: string;
}

export async function fetchTwitterUserData(
    oauthToken: string,
    oauthTokenSecret: string
): Promise<TwitterUserData> {
    const consumerKey = process.env.TWITTER_OLD_ID as string;
    const consumerSecret = process.env.TWITTER_OLD_SECRET as string;

    const oauth = new OAuth({
        consumer: { key: consumerKey, secret: consumerSecret },
        signature_method: 'HMAC-SHA1',
        hash_function(baseString, key) {
            return createHmac('sha1', key).update(baseString).digest('base64');
        },
    });

    const requestData = {
        url: 'https://api.twitter.com/1.1/account/verify_credentials.json',
        method: 'GET',
    };

    const authHeader = oauth.toHeader(
        oauth.authorize(requestData, {
            key: oauthToken,
            secret: oauthTokenSecret,
        })
    );

    try {
        const response = await axios.get(requestData.url, {
            headers: {
                ...authHeader,
                'Content-Type': 'application/json',
            },
        });

        const userData: TwitterUserData = {
            username: response.data.screen_name,
            name: response.data.name,
            followers_count: response.data.followers_count,
            following_count: response.data.friends_count,
            tweet_count: response.data.statuses_count,
            profile_image_url: response.data.profile_image_url_https,
        };

        return userData;
    } catch (error) {
        console.error('Error fetching Twitter user data:', error);
        throw error;
    }
}
