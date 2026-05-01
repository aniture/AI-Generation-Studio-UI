import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuroraBackgroundProps {
  children?: ReactNode;
  className?: string;
}

// Layered animated radial gradients evoking aurora light. CSS-only — no JS
// motion needed beyond the CSS keyframes defined alongside this component.
export function AuroraBackground({ children, className }: AuroraBackgroundProps) {
  return (
    <div className={cn("relative isolate overflow-hidden", className)}>
      <div className="aurora-grid pointer-events-none absolute inset-0 opacity-[0.18]" />
      <div className="pointer-events-none absolute inset-0">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_hsl(var(--bg))_75%)]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
