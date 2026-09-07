import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Menu, X, Moon, Sun, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { StudioButton } from "@/components/ui/studio-button";

interface CreditsResponse {
  credits: number;
}

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "dark";
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    if (saved) return saved;
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return { theme, toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")) };
}

function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installApp = async () => {
    if (!installPrompt) return;
    const result = await installPrompt.prompt();
    if (result.outcome === "accepted") {
      setInstallPrompt(null);
      setIsInstallable(false);
    }
  };

  return { isInstallable, installApp };
}

/* The wordmark carries the identity: a mesh glyph plus a wide, tight logotype. */
function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
        <path
          d="M10 1.5 18 6v8l-8 4.5L2 14V6z"
          fill="none"
          stroke="var(--flux)"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
        <path d="M2 6l8 4.5L18 6M10 10.5v8" fill="none" stroke="var(--mesh)" strokeWidth="1" />
      </svg>
      <span className="font-heading text-lg font-extrabold tracking-tight">Forge</span>
    </div>
  );
}

export default function StudioNavbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { isInstallable, installApp } = usePWAInstall();

  const { data: creditsData, isLoading } = useQuery<CreditsResponse>({
    queryKey: ["/api/credits"],
    refetchInterval: 30000,
  });

  const navItems = [
    { href: "/", label: "Home", testId: "nav-home" },
    { href: "/generate", label: "Generate", testId: "nav-generate" },
    { href: "/assets", label: "Assets", testId: "nav-assets" },
    { href: "/playground", label: "API", testId: "nav-playground" },
  ];

  const credits = isLoading ? "—" : String(creditsData?.credits ?? 0);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="container">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" data-testid="logo">
            <Wordmark />
          </Link>

          {/* Nav items read as tabs on an instrument, not pills */}
          <div className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => {
              const active = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <span
                    className={`relative font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                      active
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    data-testid={item.testId}
                  >
                    {item.label}
                    {active && (
                      <span className="absolute -bottom-[18px] left-0 h-px w-full bg-[var(--flux)]" />
                    )}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {/* Credits as a instrument readout */}
            <div
              className="hidden items-center gap-2 border border-border px-2.5 py-1 sm:flex"
              data-testid="credits-display"
            >
              <span className="mono-label">cr</span>
              <span className="font-mono text-[13px] tabular-nums text-[var(--mesh)]">
                {credits}
              </span>
            </div>

            {isInstallable && (
              <StudioButton
                variant="outline"
                size="sm"
                onClick={installApp}
                className="hidden md:inline-flex"
                data-testid="button-install-app"
              >
                <Download className="h-3.5 w-3.5" />
                Install
              </StudioButton>
            )}

            <button
              onClick={toggleTheme}
              className="hidden h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <Link href="/generate">
              <StudioButton size="sm" className="hidden md:inline-flex" data-testid="button-launch-studio">
                Open studio
              </StudioButton>
            </Link>

            <button
              className="inline-flex h-8 w-8 items-center justify-center text-foreground md:hidden"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="space-y-1 border-t border-border py-4 md:hidden">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div
                  className={`px-1 py-2.5 font-mono text-xs uppercase tracking-[0.14em] ${
                    location === item.href ? "text-[var(--flux)]" : "text-muted-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`${item.testId}-mobile`}
                >
                  {item.label}
                </div>
              </Link>
            ))}

            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="mono-label">credits</span>
              <span className="font-mono text-sm text-[var(--mesh)]" data-testid="credits-mobile">
                {credits}
              </span>
            </div>

            <button
              onClick={toggleTheme}
              className="flex w-full items-center gap-2 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground"
              data-testid="button-theme-toggle-mobile"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === "dark" ? "Light" : "Dark"}
            </button>

            {isInstallable && (
              <StudioButton
                variant="outline"
                onClick={installApp}
                className="w-full"
                data-testid="button-install-app-mobile"
              >
                Install app
              </StudioButton>
            )}

            <Link href="/generate">
              <StudioButton
                className="w-full"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="button-launch-studio-mobile"
              >
                Open studio
              </StudioButton>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
