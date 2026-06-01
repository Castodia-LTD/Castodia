type Props = {
  staffName: string;
  serviceUserName: string;
  onRemove: () => void;
};

export default function AccessRowCard({
  staffName,
  serviceUserName,
  onRemove,
}: Props) {
  return (
    <div className="rounded-2xl bg-slate-900 p-5">
      <h2 className="text-lg font-semibold text-white">
        {staffName}
      </h2>

      <p className="mt-1 text-slate-400">
        {serviceUserName}
      </p>

      <button
        onClick={onRemove}
        className="mt-4 rounded-xl bg-red-500/20 px-4 py-2 text-sm text-red-200"
      >
        Remove Access
      </button>
    </div>
  );
}