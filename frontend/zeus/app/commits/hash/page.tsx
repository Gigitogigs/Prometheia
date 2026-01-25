import { CommitDetail } from '@/components/commit/commit-detail';

interface CommitPageProps {
  params: { hash: string };
}

export function generateMetadata({ params }: CommitPageProps) {
  const { hash } = params;

  return {
    title: hash ? `Commit ${hash.slice(0, 7)} | CodeXP` : 'Commit | CodeXP',
    description: 'View commit details and AI judge evaluations.',
  };
}

export default function CommitPage({ params }: CommitPageProps) {
  const { hash } = params;

  if (!hash) {
    return <div className="text-center text-red-500">Commit hash is missing</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <CommitDetail hash={hash} />
    </div>
  );
}



// import { CommitDetail } from '@/components/commit/commit-detail';

// interface CommitPageProps {
//   params: Promise<{ hash: string }>;
// }

// export async function generateMetadata({ params }: CommitPageProps) {
//   const { hash } = await params;
//   return {
//     title: `Commit ${hash.slice(0, 7)} | CodeXP`,
//     description: 'View commit details and AI judge evaluations.',
//   };
// }

// export default async function CommitPage({ params }: CommitPageProps) {
//   const { hash } = await params;

//   return (
//     <div className="mx-auto max-w-4xl px-4 py-8">
//       <CommitDetail hash={hash} />
//     </div>
//   );
// }
