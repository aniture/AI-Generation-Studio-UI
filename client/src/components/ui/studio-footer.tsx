import { Link } from "wouter";

const links = [
  { href: "/", label: "Home" },
  { href: "/generate", label: "Generate" },
  { href: "/assets", label: "Assets" },
  { href: "/playground", label: "API" },
];

export default function StudioFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="container py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-6">
            {links.map((l) => (
              <Link key={l.href} href={l.href}>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground">
                  {l.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Say plainly what this is. A demo that claims uptime is lying. */}
          <div className="flex items-center gap-2">
            <span className="pip h-1.5 w-1.5 rounded-full bg-[var(--mesh)]" />
            <span className="mono-label">
              demo build · generation is simulated
            </span>
          </div>
        </div>

        <p className="mt-8 border-t border-border pt-6 font-mono text-[11px] text-muted-foreground">
          Forge — a portfolio prototype. Jobs, credits, and assets are stored in your browser.
        </p>
      </div>
    </footer>
  );
}
