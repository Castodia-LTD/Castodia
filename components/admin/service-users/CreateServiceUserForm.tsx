type Props = {
  firstName: string;
  setFirstName: (value: string) => void;
  surname: string;
  setSurname: (value: string) => void;
  houseName: string;
  setHouseName: (value: string) => void;
  onCreate: () => void;
};

export default function CreateServiceUserForm({
  firstName,
  setFirstName,
  surname,
  setSurname,
  houseName,
  setHouseName,
  onCreate,
}: Props) {
  return (
    <div className="mt-8 space-y-4 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
      <h2 className="text-xl font-bold">Create Service User</h2>

      <input
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="First name"
        className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
      />

      <input
        value={surname}
        onChange={(e) => setSurname(e.target.value)}
        placeholder="Surname"
        className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
      />

      <input
        value={houseName}
        onChange={(e) => setHouseName(e.target.value)}
        placeholder="House / location"
        className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
      />

      <button
        onClick={onCreate}
        className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-teal-400 p-4 font-semibold"
      >
        Create Service User
      </button>
    </div>
  );
}