import FamilyAppShell from "@/components/family/layout/FamilyAppShell";

export default function FamilyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <FamilyAppShell>
      {children}
    </FamilyAppShell>
  );
}