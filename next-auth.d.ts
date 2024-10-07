import NextAuth, { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth/jwt' {
    interface JWT extends DefaultJWT {
        providers?: {
            google?: {
                email?: string;
                name?: string;
                image?: string;
            };
            twitter?: {
                name?: string;
                image?: string;
            };
        };
    }
}

declare module 'next-auth' {
    interface Session {
        providers: NonNullable<JWT['providers']>;
        expires: string;
    }

    interface Profile {
        email?: string;
        name?: string;
        picture?: string;
        image?: string;
    }
}
