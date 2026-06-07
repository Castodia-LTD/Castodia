import SupportShell from "@/components/layouts/SupportShell";

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SupportShell>{children}</SupportShell>;
}