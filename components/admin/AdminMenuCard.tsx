import Link from "next/link";

type Props = {
  href: string;
  title: string;
  description: string;
};

export default function AdminMenuCard({ href, title, description }: Props) {
  return (
    <Link
      href={href}
      className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur"
    >
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-slate-400">{description}</p>
    </Link>
  );
}