import { cn } from "@/lib/utils";

interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}

/*
  Section headings are left-aligned and ruled, the way a spec sheet is: the
  eyebrow is a monospace tag, and a hairline carries the eye across the page.
*/
export function SectionTitle({ eyebrow, title, description, className }: SectionTitleProps) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow && (
        <div className="flex items-center gap-3">
          <span className="h-px w-6 bg-[var(--flux)]" />
          <span className="mono-label">{eyebrow}</span>
        </div>
      )}
      <h2 className="mt-4 text-3xl md:text-[2.5rem]">{title}</h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
