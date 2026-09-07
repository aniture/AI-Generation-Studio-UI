import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PanelCardProps {
  children: ReactNode;
  className?: string;
  /** Marks the primary option — draws the flux edge instead of the neutral one. */
  accent?: boolean;
}

/*
  A flat machined surface. The hover state moves the edge, not a glow: this
  interface is meant to read as an instrument, so light never comes from
  nowhere.
*/
export function PanelCard({ children, className, accent }: PanelCardProps) {
  return (
    <div
      className={cn(
        "rounded-md border bg-card transition-colors duration-200",
        accent
          ? "border-[var(--flux)]/40 hover:border-[var(--flux)]"
          : "border-border hover:border-[var(--mesh)]/50",
        className
      )}
    >
      {children}
    </div>
  );
}
