type Props = {
  fullName: string;
  houseName: string | null;
  dob: string | null;
  photoUrl: string | null;
};

export default function ServiceUserHubHeader({
  fullName,
  houseName,
  dob,
  photoUrl,
}: Props) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
      ...
    </div>
  );
}