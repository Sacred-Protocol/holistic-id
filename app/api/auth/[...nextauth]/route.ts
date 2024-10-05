import NextAuth from 'next-auth';
import TwitterProvider from 'next-auth/providers/twitter';

export default NextAuth({
    providers: [
        TwitterProvider({
            clientId: process.env.TWITTER_CLIENT_ID as string,
            clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
            version: '2.0',
        }),
    ],
    callbacks: {
        async jwt({ token, account, profile }) {
            if (account) {
                token.accessToken = account.access_token;
                console.log({ profile });
                //token.id = profile?.id;
            }
            return token;
        },
        async session({ session, token, user }) {
            console.log({ token });
            //session.accessToken = token.accessToken;
            //session.user.id = token.id;
            return session;
        },
    },
});
