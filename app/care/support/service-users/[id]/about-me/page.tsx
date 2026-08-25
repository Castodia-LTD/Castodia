import { ServiceUserAboutMePage } from "@/features/care/shared/service-users/about-me/ServiceUserAboutMePage";

type Props = { params: Promise<{ id: string }> };

export default function Page(props: Props) {
  return <ServiceUserAboutMePage {...props} portal="support" canEdit={false} />;
}
