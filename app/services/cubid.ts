import axios from 'axios';

const API_BASE_URL = 'https://passport.cubid.me/api';

interface FetchIdentityResponse {
    // Define the response structure here
    // This is a placeholder and should be updated with the actual response structure
    userExists: boolean;
    // Add other fields as necessary
}

export const fetchIdentity = async (
    email: string
): Promise<FetchIdentityResponse> => {
    try {
        const response = await axios.post<FetchIdentityResponse>(
            `${API_BASE_URL}/api/v2/identity/fetch_identity`,
            {
                apikey: process.env.CUBID_API_KEY,
                user_id: email, // Assuming email is used as user_id, adjust if necessary
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching identity:', error);
        throw error;
    }
};

export const userExists = async (email: string): Promise<boolean> => {
    try {
        const identityData = await fetchIdentity(email);
        console.log({ identityData });
        return identityData.userExists;
    } catch (error) {
        console.error('Error checking if user exists:', error);
        return false;
    }
};
