import NextAuth from 'next-auth';

declare module 'next-auth' {
    interface Session {
        twitterUser: {
            name?: string;
            image?: string;
        };
        googleUser: {
            name?: string;
            email?: string;
        };
        expires: string;
    }

    interface Profile {
        email?: string;
        name?: string;
        picture?: string;
        image?: string;
    }
}
