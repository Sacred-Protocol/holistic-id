import NextAuth from 'next-auth';
import TwitterProvider from 'next-auth/providers/twitter';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
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
                token.accessToken = account.access_token;
                token.provider = account.provider;
                if (account.provider === 'google') {
                    token.googleUser = {
                        email: profile?.email,
                        name: profile?.name,
                        image: profile?.picture,
                    };
                } else if (account.provider === 'twitter') {
                    token.twitterUser = {
                        name: profile?.name,
                        image: profile?.image,
                    };
                }
            }
            return token;
        },
        async session({ session, token }) {
            session.googleUser = token.googleUser as any;
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
