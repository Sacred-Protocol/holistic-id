import NextAuth, { NextAuthOptions } from 'next-auth';
import TwitterProvider from 'next-auth/providers/twitter';
import GoogleProvider from 'next-auth/providers/google';

const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
        TwitterProvider({
            clientId: process.env.TWITTER_ID as string,
            clientSecret: process.env.TWITTER_SECRET as string,
            version: '2.0',
            authorization: {
                url: 'https://twitter.com/i/oauth2/authorize',
                params: {
                    scope: 'users.read tweet.read offline.access',
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account, profile }) {
            if (account) {
                if (account.provider === 'google') {
                    token.googleProfile = {
                        email: profile?.email,
                        name: profile?.name,
                        image: profile?.picture,
                    };
                } else {
                    token.twitterProfile = {
                        name: profile?.name,
                        image: profile?.image,
                    };
                }
            }
            return token;
        },
        async session({ session, token }) {
            const updatedSession = { ...session };
            if (!updatedSession.providers) {
                updatedSession.providers = {};
            }
            if (!updatedSession.providers.google) {
                updatedSession.providers.google = {};
            }
            if (!updatedSession.providers.twitter) {
                updatedSession.providers.twitter = {};
            }

            if (token.googleProfile) {
                updatedSession.providers.google = token.googleProfile;
            }

            if (
                session?.user?.image &&
                !session?.providers?.twitter &&
                !session?.user?.email
            ) {
                updatedSession.providers.twitter = session.user;
            }

            return updatedSession;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
