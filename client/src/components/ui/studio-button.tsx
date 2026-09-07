import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/*
  Buttons are machined, not pillowy: small radius, mono label, and a press that
  actually moves. The default is the flux (action) colour; outline is the quiet
  companion.
*/
const studioButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius)] font-mono text-[11px] uppercase tracking-[0.14em] transition-all duration-150 disabled:pointer-events-none disabled:opacity-40 active:translate-y-px",
  {
    variants: {
      variant: {
        default: "bg-[var(--flux)] text-[var(--primary-foreground)] hover:brightness-110",
        gradient: "bg-[var(--flux)] text-[var(--primary-foreground)] hover:brightness-110",
        mesh: "bg-[var(--mesh)] text-[var(--primary-2-foreground)] hover:brightness-110",
        outline:
          "border border-border bg-transparent text-foreground hover:border-[var(--flux)] hover:text-[var(--flux)]",
        ghost: "text-muted-foreground hover:bg-secondary hover:text-foreground",
        link: "text-[var(--flux)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-8 px-3 text-[10px]",
        lg: "h-12 px-7 text-xs",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface StudioButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof studioButtonVariants> {
  asChild?: boolean
}

const StudioButton = React.forwardRef<HTMLButtonElement, StudioButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(studioButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
StudioButton.displayName = "StudioButton"

export { StudioButton, studioButtonVariants }
