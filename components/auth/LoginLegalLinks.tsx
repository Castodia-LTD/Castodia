type LoginLegalLinksProps = {
  variant?: "light" | "dark" | "family";
};

const links = [
  { label: "Privacy", href: "https://castodia.co.uk/privacy" },
  { label: "Terms", href: "https://castodia.co.uk/terms" },
  { label: "Support", href: "https://castodia.co.uk/support" },
  {
    label: "Data Requests",
    href: "https://castodia.co.uk/privacy/requests",
  },
];

export function LoginLegalLinks({
  variant = "light",
}: LoginLegalLinksProps) {
  const linkClass =
    variant === "dark"
      ? "text-cyan-50/65 hover:text-white"
      : variant === "family"
        ? "text-white/70 hover:text-white"
        : "text-slate-500 hover:text-teal-700";

  return (
    <nav
      aria-label="Legal and support"
      className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs"
    >
      {links.map((link, index) => (
        <span key={link.href} className="inline-flex items-center gap-3">
          {index > 0 && (
            <span aria-hidden="true" className="opacity-40">
              ·
            </span>
          )}
          <a
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className={`font-medium transition ${linkClass}`}
          >
            {link.label}
          </a>
        </span>
      ))}
    </nav>
  );
}

