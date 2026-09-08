import Link from "next/link";

export function BackLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      aria-label="Volver"
      className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-gray-400 transition-colors hover:text-white"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </Link>
  );
}
