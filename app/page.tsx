import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AuthButton from '@/components/auth/AuthButton';

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle className="text-4xl font-bold text-center">
                        Trust Me Bro
                    </CardTitle>
                    <CardDescription className="text-center">
                        Your trusted reputation system
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <AuthButton />
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        Connect and build your trust score
                    </p>
                </CardFooter>
            </Card>
        </main>
    );
}
