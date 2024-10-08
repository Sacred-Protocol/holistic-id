import axios from 'axios';

const API_BASE_URL = 'https://passport.cubid.me/api';

export const getStampIcon = (stampType: string) => {
    switch (stampType.toLowerCase()) {
        case 'gitcoin':
            return '🦄';
        case 'evm':
            return '🔗';
        case 'github':
            return '🐙';
        case 'twitter':
            return '🐦';
        case 'telegram':
            return '✈️';
        case 'google':
            return '🔍';
        default:
            return '🔐';
    }
};

export const truncateValue = (value: string) => {
    if (value.startsWith('0x')) {
        return `${value.slice(0, 6)}...${value.slice(-4)}`;
    }
    if (value.includes('@')) {
        const [username, domain] = value.split('@');
        return `${username.slice(0, 3)}...@${domain}`;
    }
    return value.length > 10 ? `${value.slice(0, 7)}...` : value;
};

interface StampDetail {
    stamp_type: string;
    value: string;
    status: 'Verified' | 'Unverified';
}

interface FetchIdentityResponse {
    stamp_details: StampDetail[];
    error: string | null;
}

interface CreateUserResponse {
    user_id: string;
    is_new_app_user: boolean;
    is_sybil_attack: boolean;
    is_blacklisted: boolean;
    error: string | null;
}

interface UserData {
    name: string;
    placename: string;
    country: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    is_human: string;
    error: string | null;
}

interface UserScore {
    cubid_score: number;
    scoring_schema: number;
    error: string | null;
}

export const fetchIdentity = async (
    uuid: string
): Promise<FetchIdentityResponse> => {
    try {
        const response = await axios.post<FetchIdentityResponse>(
            `${API_BASE_URL}/v2/identity/fetch_identity`,
            {
                apikey: process.env.NEXT_PUBLIC_CUBID_API_KEY,
                user_id: uuid,
            }
        );
        console.log('identity', { response });
        return response.data;
    } catch (error) {
        console.error('Error fetching identity:', error);
        throw error;
    }
};

export const createUser = async (
    email: string
): Promise<CreateUserResponse> => {
    try {
        const response = await axios.post<CreateUserResponse>(
            `${API_BASE_URL}/v2/create_user`,
            {
                apikey: process.env.NEXT_PUBLIC_CUBID_API_KEY,
                dapp_id: process.env.NEXT_PUBLIC_CUBID_APP_ID,
                email: email,
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

export const fetchUserData = async (userId: string): Promise<UserData> => {
    try {
        const response = await axios.post<UserData>(
            `${API_BASE_URL}/v2/identity/fetch_user_data`,
            {
                apikey: process.env.NEXT_PUBLIC_CUBID_API_KEY,
                user_id: userId,
            }
        );
        console.log('user data', { response });
        return response.data;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
};

export const fetchUserScore = async (userId: string): Promise<UserScore> => {
    try {
        const response = await axios.post<UserScore>(
            `${API_BASE_URL}/v2/score/fetch_score`,
            {
                apikey: process.env.NEXT_PUBLIC_CUBID_API_KEY,
                user_id: userId,
            }
        );
        console.log('score', { response });
        return response.data;
    } catch (error) {
        console.error('Error fetching user score:', error);
        throw error;
    }
};
