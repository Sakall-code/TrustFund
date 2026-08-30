// OWNER: M4 - do not edit if you are not M4

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-4xl font-bold">📋 Campaign Detail – #{id}</h1>
    </main>
  );
}
