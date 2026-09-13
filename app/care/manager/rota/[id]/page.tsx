import PersonRotaPage from "@/features/care/manager/rota/PersonRotaPage";

export default async function Page({ params }: PageProps<"/care/manager/rota/[id]">) {
  const { id } = await params;
  return <PersonRotaPage serviceUserId={id} />;
}
