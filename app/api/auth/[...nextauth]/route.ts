import NextAuth from 'next-auth';
import TwitterProvider from 'next-auth/providers/twitter';
const handler = NextAuth({
    providers: [
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
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
