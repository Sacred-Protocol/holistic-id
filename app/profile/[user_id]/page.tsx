import UserProfile from '@/components/UserProfile';

export default function ProfilePage({
    params,
}: {
    params: { user_id: string };
}) {
    return <UserProfile userId={params.user_id} />;
}
