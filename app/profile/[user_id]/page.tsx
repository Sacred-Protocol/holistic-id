'use client';
import UserProfile from '@/components/UserProfile';
import { useSearchParams } from 'next/navigation';

export default function ProfilePage({
    params,
}: {
    params: { user_id: string };
}) {
    const searchParams = useSearchParams();
    const view = searchParams.get('view') === 'private' ? 'private' : 'public';

    return <UserProfile userId={params.user_id} view={view} />;
}
