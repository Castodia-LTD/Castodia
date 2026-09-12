import { redirect } from "next/navigation";

export default async function Page({ params }: PageProps<"/care/manager/service-users/[id]">) {
  const { id } = await params;
  redirect(`/care/manager/service-users/${id}/growth`);
}
