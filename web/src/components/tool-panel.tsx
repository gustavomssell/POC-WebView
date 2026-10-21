import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type ToolPanelProps = {
  id: string
  title: string
  description: string
  icon: LucideIcon
  protocol: string
  note: string
  tone?: "paper" | "ink"
  flush?: boolean
  action?: ReactNode
  footer?: ReactNode
  className?: string
  children: ReactNode
}

export function ToolPanel({
  id,
  title,
  description,
  icon: Icon,
  protocol,
  note,
  tone = "paper",
  flush = false,
  action,
  footer,
  className,
  children,
}: ToolPanelProps) {
  const ink = tone === "ink"

  return (
    <section
      id={id}
      className={cn(
        "relative flex scroll-mt-6 flex-col gap-5 p-5 sm:p-6",
        flush
          ? "rounded-none"
          : cn("rounded-lg", ink ? "surface-ink" : "surface-paper"),
        className,
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg",
              ink ? "bg-white/10 text-paper" : "bg-ink/5 text-ink",
            )}
          >
            <Icon className="size-4.5" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h2
              className={cn(
                "font-heading text-base font-semibold tracking-tight",
                ink ? "text-paper" : "text-ink",
              )}
            >
              {title}
            </h2>
            <p
              className={cn(
                "mt-0.5 max-w-[42ch] text-xs leading-relaxed",
                ink ? "text-paper/60" : "text-muted-foreground",
              )}
            >
              {description}
            </p>
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>

      <div className="min-w-0">{children}</div>

      <footer
        className={cn(
          "mt-auto flex flex-wrap items-center justify-between gap-2 border-t pt-3",
          ink ? "border-white/12" : "border-ink/8",
        )}
      >
        <span
          className={cn(
            "text-[0.7rem]",
            ink ? "text-paper/50" : "text-muted-foreground",
          )}
        >
          {note}
        </span>
        <code
          className={cn(
            "font-mono text-[0.7rem]",
            ink ? "text-paper/50" : "text-muted-foreground/75",
          )}
        >
          {protocol}
        </code>
      </footer>

      {footer}
    </section>
  )
}
