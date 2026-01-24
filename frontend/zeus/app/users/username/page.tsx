import { ProfileView } from '@/components/profile/profile-view';

interface UserPageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: UserPageProps) {
  const { username } = await params;
  return {
    title: `${username} | CodeXP`,
    description: `View ${username}'s developer profile, XP, and commit history.`,
  };
}

export default async function UserPage({ params }: UserPageProps) {
  const { username } = await params;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <ProfileView username={username} />
    </div>
  );
}
