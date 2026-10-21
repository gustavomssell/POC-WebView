import {
  ActivityIcon,
  HouseIcon,
  SlidersHorizontalIcon,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type AppTab = "home" | "tools" | "activity"

const items: { id: AppTab; label: string; icon: LucideIcon }[] = [
  { id: "home", label: "Início", icon: HouseIcon },
  { id: "tools", label: "Ferramentas", icon: SlidersHorizontalIcon },
  { id: "activity", label: "Atividade", icon: ActivityIcon },
]

type AppNavProps = {
  active: AppTab
  onChange: (tab: AppTab) => void
  variant: "rail" | "bottom"
}

export function AppNav({ active, onChange, variant }: AppNavProps) {
  const activeIndex = items.findIndex((item) => item.id === active)

  if (variant === "rail") {
    return (
      <nav aria-label="Seções do app" className="relative flex flex-col gap-1">
        <span
          aria-hidden
          className="nav-indicator absolute inset-x-0 top-0 h-11 rounded-xl bg-paper"
          style={{ transform: `translateY(calc(${activeIndex} * 3rem))` }}
        />
        {items.map((item) => {
          const Icon = item.icon
          const selected = active === item.id

          return (
            <button
              key={item.id}
              type="button"
              aria-current={selected ? "page" : undefined}
              onClick={() => onChange(item.id)}
              className={cn(
                "nav-button relative z-10 flex h-11 items-center gap-3 rounded-xl px-3 text-left text-sm font-medium",
                selected
                  ? "text-ink"
                  : "text-paper/65 hover:bg-white/6 hover:text-paper",
              )}
            >
              <Icon className="size-4.5" strokeWidth={1.8} />
              {item.label}
            </button>
          )
        })}
      </nav>
    )
  }

  return (
    <nav
      aria-label="Seções do app"
      className="relative grid grid-cols-3 border-t border-ink/10 bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <span
        aria-hidden
        className="nav-indicator absolute inset-x-0 top-0 h-0.5 w-1/3 bg-stamp"
        style={{ transform: `translateX(calc(${activeIndex} * 100%))` }}
      />
      {items.map((item) => {
        const Icon = item.icon
        const selected = active === item.id

        return (
          <button
            key={item.id}
            type="button"
            aria-current={selected ? "page" : undefined}
            onClick={() => onChange(item.id)}
            className={cn(
              "nav-button flex h-16 flex-col items-center justify-center gap-1 text-[0.7rem] font-medium",
              selected ? "text-ink" : "text-muted-foreground",
            )}
          >
            <Icon
              className={cn("size-5", selected && "text-stamp")}
              strokeWidth={selected ? 2.1 : 1.7}
            />
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div aria-hidden className="brand-mark">
        C
      </div>
      <div className="flex flex-col">
        <span
          className={cn(
            "font-heading font-semibold tracking-tight text-paper",
            compact ? "text-base" : "text-lg",
          )}
        >
          Conta
        </span>
        <span className="font-mono text-[0.7rem] tracking-[0.18em] text-paper/50 uppercase">
          caderneta digital
        </span>
      </div>
    </div>
  )
}
