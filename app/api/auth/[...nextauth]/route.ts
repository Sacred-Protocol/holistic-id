import NextAuth, { NextAuthOptions } from 'next-auth';
import TwitterProvider from 'next-auth/providers/twitter';
import GoogleProvider from 'next-auth/providers/google';
import { fetchTwitterUserData } from '@/app/services/twitter';

const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
        TwitterProvider({
            clientId: process.env.TWITTER_OLD_ID as string,
            clientSecret: process.env.TWITTER_OLD_SECRET as string,
            version: '1.0a',
            authorization: {
                url: 'https://api.twitter.com/oauth/authenticate',
                params: {
                    scope: 'email users.read tweet.read offline.access',
                },
            },
            userinfo: {
                url: 'https://api.twitter.com/1.1/account/verify_credentials.json',
                params: {
                    include_email: 'true',
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
                        accessToken: account.oauth_token,
                        accessTokenSecret: account.oauth_token_secret,
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
                //@ts-ignore
                token?.twitterProfile.accessToken
            ) {
                updatedSession.providers.twitter = {
                    ...session.user,
                    email: token.email,
                };

                try {
                    //@ts-ignore
                    const accessToken = token?.twitterProfile.accessToken;

                    const accessTokenSecret =
                        //@ts-ignore
                        token?.twitterProfile.accessTokenSecret;
                    if (accessToken) {
                        const userData = await fetchTwitterUserData(
                            accessToken,
                            accessTokenSecret
                        );
                        updatedSession.providers.twitter = {
                            ...session.user,
                            ...userData,
                        };
                    }
                } catch (e) {
                    console.log(e);
                }
            }

            return updatedSession;
        },
    },
    debug: false,

    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
