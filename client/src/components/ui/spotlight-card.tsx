import { useRef, ReactNode, MouseEvent } from "react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}

// Card whose border glows toward the cursor. Pure CSS variables driven by
// pointer move — no React state, no re-renders.
export function SpotlightCard({ children, className, innerClassName }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  function onMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      className={cn(
        "spotlight-card group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-px transition-colors duration-300 hover:border-white/20",
        className
      )}
    >
      <div className="spotlight-card__glow pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div
        className={cn(
          "relative h-full rounded-[calc(1rem-1px)] bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-sm",
          innerClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
