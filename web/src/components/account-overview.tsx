import { useState, type CSSProperties } from "react"
import type { LucideIcon } from "lucide-react"
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  BanknoteIcon,
  CameraIcon,
  CheckIcon,
  ClapperboardIcon,
  ClipboardCopyIcon,
  CreditCardIcon,
  FuelIcon,
  HouseIcon,
  Loader2Icon,
  MapPinIcon,
  PenLineIcon,
  PiggyBankIcon,
  PillIcon,
  ShoppingBasketIcon,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { request, type TrafficEntry } from "@/lib/bridge"
import {
  account,
  categoryBreakdown,
  formatCents,
  formatPercent,
  formatSignedCents,
  monthLabel,
  nextBill,
  splitCurrency,
  transactions,
  type CategoryKey,
  type Transaction,
} from "@/lib/account"
import { directionLabel, summarizeActivity, type ActivityTone } from "@/lib/activity"
import { cn } from "@/lib/utils"

type AccountOverviewProps = {
  entries: TrafficEntry[]
  onGoToTool: (id: string) => void
  onOpenActivity: () => void
}

type Filter = "all" | "in" | "out"

const categoryColor: Record<CategoryKey, string> = {
  casa: "bg-ink",
  mercado: "bg-ledger",
  transporte: "bg-[oklch(0.66_0.11_70)]",
  lazer: "bg-stamp",
  saude: "bg-[oklch(0.55_0.1_245)]",
}

const categoryIcon: Record<Transaction["category"], LucideIcon> = {
  casa: HouseIcon,
  mercado: ShoppingBasketIcon,
  transporte: FuelIcon,
  lazer: ClapperboardIcon,
  saude: PillIcon,
  entrada: BanknoteIcon,
}

const toneIcon: Record<ActivityTone, LucideIcon> = {
  send: ArrowUpRightIcon,
  receive: ArrowDownLeftIcon,
  success: CheckIcon,
  error: ArrowUpRightIcon,
}

const toneColor: Record<ActivityTone, string> = {
  send: "text-ink-soft",
  receive: "text-[oklch(0.55_0.1_245)]",
  success: "text-ledger",
  error: "text-stamp",
}

export function AccountOverview({
  entries,
  onGoToTool,
  onOpenActivity,
}: AccountOverviewProps) {
  const [filter, setFilter] = useState<Filter>("all")
  const [showAll, setShowAll] = useState(false)
  const [copying, setCopying] = useState(false)
  const balance = splitCurrency(account.balanceCents)
  const goalPercent = Math.round(
    (account.goalSavedCents / account.goalCents) * 100,
  )
  const month = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)
  const recent = entries.slice(-3).reverse()

  const filtered = transactions.filter((transaction) => {
    if (filter === "in") {
      return transaction.amountCents > 0
    }

    if (filter === "out") {
      return transaction.amountCents < 0
    }

    return true
  })
  const visible = showAll ? filtered : filtered.slice(0, 6)

  async function copySummary() {
    const summary = [
      `Resumo de ${month}`,
      `Saldo: ${formatCents(account.balanceCents)}`,
      `Entradas: ${formatCents(account.incomeCents)}`,
      `Saídas: ${formatCents(account.expenseCents)}`,
      `Meta: ${formatCents(account.goalSavedCents)} de ${formatCents(account.goalCents)}`,
    ].join(" · ")

    setCopying(true)

    try {
      await request("clipboard.write", { text: summary })
      toast.success("Resumo copiado", {
        description: "O texto está na área de transferência.",
      })
    } catch (error) {
      toast.error("Não foi possível copiar", {
        description: error instanceof Error ? error.message : "Erro inesperado",
      })
    } finally {
      setCopying(false)
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Olá, Marina.
          </h1>
          <p className="mt-1 max-w-[48ch] text-sm text-muted-foreground">
            Seu mês em uma olhada, com dados de demonstração.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenActivity}
          className="hidden sm:inline-flex"
        >
          <ArrowUpRightIcon data-icon="inline-start" />
          Ver atividade
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <section className="surface-ink rounded-lg px-6 py-6 sm:px-7 sm:py-8 lg:col-span-12">
          <span className="stamp stamp-motion absolute top-5 right-5 z-10 sm:top-6 sm:right-6">
            Modo demo
          </span>
          <div className="pl-1">
            <p className="font-mono text-[0.72rem] tracking-[0.14em] text-paper/60 uppercase">
              Saldo disponível
            </p>
            <div className="mt-4 flex items-end gap-2">
              <span className="mb-2 font-mono text-sm text-paper/55">
                {balance.currency}
              </span>
              <span className="balance-figure text-[clamp(3rem,9vw,5.25rem)] font-medium text-paper">
                {balance.value}
              </span>
            </div>
            <p className="mt-3 flex items-center gap-2 text-xs text-paper/60">
              <span className="size-1.5 rounded-full bg-ledger" />
              {month} · atualizado agora · conta de demonstração
            </p>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-4 border-t border-white/12 pt-5 sm:grid-cols-3">
            <div>
              <p className="font-mono text-[0.7rem] tracking-[0.12em] text-paper/50 uppercase">
                Entradas
              </p>
              <p className="mt-1 font-mono text-sm font-medium text-[oklch(0.81_0.11_158)] sm:text-base">
                {formatCents(account.incomeCents)}
              </p>
            </div>
            <div>
              <p className="font-mono text-[0.7rem] tracking-[0.12em] text-paper/50 uppercase">
                Saídas
              </p>
              <p className="mt-1 font-mono text-sm font-medium text-[oklch(0.8_0.12_27)] sm:text-base">
                {formatCents(account.expenseCents)}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="font-mono text-[0.7rem] tracking-[0.12em] text-paper/50 uppercase">
                Resultado
              </p>
              <p className="mt-1 font-mono text-sm font-medium text-paper sm:text-base">
                {formatCents(account.incomeCents - account.expenseCents)}
              </p>
            </div>
          </div>
        </section>

        <div className="surface-paper order-3 overflow-hidden rounded-lg lg:order-2 lg:col-span-12">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="order-2 border-t border-ink/8 p-5 lg:order-1 lg:col-span-4 lg:border-t-0 lg:border-r">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-heading text-lg font-semibold tracking-tight">
                  Reserva de emergência
                </h2>
                <div className="flex size-9 items-center justify-center rounded-lg bg-ledger/10 text-ledger">
                  <PiggyBankIcon className="size-4.5" strokeWidth={1.8} />
                </div>
              </div>

              <div className="mt-6 flex items-end justify-between gap-3">
                <div>
                  <span className="font-mono text-2xl font-medium tabular-nums">
                    {goalPercent}%
                  </span>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatCents(account.goalSavedCents)} de{" "}
                    {formatCents(account.goalCents)}
                  </p>
                </div>
                <span className="font-mono text-[0.7rem] text-ledger">
                  no ritmo
                </span>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/8">
                <div
                  className="category-fill bg-ledger"
                  style={{ width: `${goalPercent}%` }}
                />
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Faltam {formatCents(account.goalCents - account.goalSavedCents)}{" "}
                para fechar a reserva deste mês.
              </p>
            </div>

            <div className="order-1 flex flex-col p-5 lg:order-2 lg:col-span-8">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-heading text-lg font-semibold tracking-tight">
                  Resolva em um toque
                </h2>
                <Button variant="ghost" size="sm" onClick={() => onGoToTool("tools")}>
                  Ver tudo
                </Button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <QuickAction
                  icon={CameraIcon}
                  label="Nova despesa"
                  detail="foto do recibo"
                  primary
                  onClick={() => onGoToTool("tool-camera")}
                />
                <QuickAction
                  icon={MapPinIcon}
                  label="Local do gasto"
                  detail="GPS do aparelho"
                  onClick={() => onGoToTool("tool-location")}
                />
                <QuickAction
                  icon={copying ? Loader2Icon : ClipboardCopyIcon}
                  label={copying ? "Copiando..." : "Copiar resumo"}
                  detail="para o sistema"
                  spinning={copying}
                  onClick={() => void copySummary()}
                />
                <QuickAction
                  icon={PenLineIcon}
                  label="Anotar"
                  detail="ida e volta"
                  onClick={() => onGoToTool("tool-notes")}
                />
              </div>

              <div className="mt-auto pt-5">
                <div className="flex items-center justify-between gap-4 border-t border-ink/8 pt-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-stamp/8 text-stamp">
                      <CreditCardIcon className="size-4" strokeWidth={1.8} />
                    </span>
                    <div className="min-w-0">
                      <p className="font-mono text-[0.7rem] tracking-[0.12em] text-muted-foreground uppercase">
                        Próximo vencimento
                      </p>
                      <p className="mt-1 truncate text-xs font-semibold">
                        {nextBill.label}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-sm font-medium tabular-nums">
                      {formatCents(nextBill.amountCents)}
                    </p>
                    <p className="mt-0.5 font-mono text-[0.7rem] text-muted-foreground">
                      {nextBill.dueLabel} · em {nextBill.daysLeft} dias
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-3 border-t border-ink/8 p-5 lg:col-span-12">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-heading text-lg font-semibold tracking-tight">
                  Categorias
                </h2>
                <span className="font-mono text-xs text-muted-foreground">
                  {formatCents(account.expenseCents)}
                </span>
              </div>

              <ul className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {categoryBreakdown.map((category) => {
                  const percent = Math.round(
                    (category.cents / account.expenseCents) * 100,
                  )

                  return (
                    <li key={category.key}>
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="font-medium">{category.label}</span>
                        <span className="font-mono text-[0.7rem] text-muted-foreground">
                          {formatCents(category.cents)}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="category-track flex-1">
                          <div
                            className={cn(
                              "category-fill",
                              categoryColor[category.key],
                            )}
                            style={{ width: `${Math.max(percent, 3)}%` }}
                          />
                        </div>
                        <span className="w-8 text-right font-mono text-[0.7rem] text-muted-foreground">
                          {formatPercent(category.cents, account.expenseCents)}
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>

        <div className="surface-paper order-4 overflow-hidden rounded-lg lg:order-3 lg:col-span-12">
        <section className="overflow-hidden">
          <div className="flex flex-wrap items-end justify-between gap-3 p-5 pb-0">
            <h2 className="font-heading text-lg font-semibold tracking-tight">
              Últimos lançamentos
            </h2>
            <div className="flex items-center gap-1 rounded-lg bg-ink/5 p-1">
              {(
                [
                  ["all", "Tudo"],
                  ["in", "Entradas"],
                  ["out", "Saídas"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={filter === value}
                  onClick={() => {
                    setFilter(value)
                    setShowAll(false)
                  }}
                  className={cn(
                    "rounded-md px-2.5 py-1 font-mono text-[0.7rem] tracking-wide uppercase transition-colors",
                    filter === value
                      ? "bg-ink text-paper"
                      : "text-muted-foreground hover:text-ink",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-ink/15 px-4 py-8 text-center">
              <p className="text-sm font-medium">Nenhum lançamento aqui.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Troque o filtro para ver o mês inteiro.
              </p>
            </div>
          ) : (
            <div key={`${filter}-${showAll}`} className="mt-3">
              {visible.map((transaction, index) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  index={index}
                />
              ))}
            </div>
          )}

          {filtered.length > 6 ? (
            <div className="mt-2 flex justify-center border-t border-ink/8 pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll((current) => !current)}
              >
                {showAll
                  ? "Mostrar menos"
                  : `Ver os ${filtered.length} lançamentos`}
              </Button>
            </div>
          ) : null}
        </section>

        <section className="flex flex-col border-t border-ink/8 p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-heading text-lg font-semibold tracking-tight">
              Atividade
            </h2>
            <span className="flex items-center gap-1.5 rounded-full bg-ink/5 px-2 py-1 font-mono text-[0.7rem] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-ledger" />
              ao vivo
            </span>
          </div>

          {recent.length === 0 ? (
            <div className="mt-5 flex flex-1 flex-col items-start justify-center rounded-xl border border-dashed border-ink/15 px-4 py-7">
              <p className="text-sm font-medium">Nada por aqui ainda.</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Use um atalho para ver o app conversando com o aparelho.
              </p>
            </div>
          ) : (
            <ul className="mt-4 space-y-1 sm:grid sm:grid-cols-2 sm:gap-2 sm:space-y-0">
              {recent.map((entry) => {
                const summary = summarizeActivity(entry)
                const Icon = toneIcon[summary.tone]

                return (
                  <li
                    key={entry.id}
                    className="flex items-start gap-2.5 rounded-lg px-1 py-2"
                  >
                    <Icon
                      className={cn("mt-0.5 size-3.5 shrink-0", toneColor[summary.tone])}
                      strokeWidth={2}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">
                        {summary.title}
                      </p>
                      <p className="mt-0.5 truncate font-mono text-[0.7rem] text-muted-foreground">
                        {directionLabel(entry.direction)} ·{" "}
                        {new Date(entry.at).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-ink/8 pt-4">
            <span className="font-mono text-[0.7rem] text-muted-foreground">
              {entries.length} eventos
            </span>
            <Button variant="ghost" size="sm" onClick={onOpenActivity}>
              Abrir
              <ArrowUpRightIcon data-icon="inline-end" />
            </Button>
          </div>
        </section>
        </div>
      </div>
    </div>
  )
}

function QuickAction({
  icon: Icon,
  label,
  detail,
  onClick,
  primary = false,
  spinning = false,
}: {
  icon: LucideIcon
  label: string
  detail: string
  onClick: () => void
  primary?: boolean
  spinning?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex min-h-[5.25rem] flex-col items-start justify-between rounded-lg p-3 text-left transition-all duration-200 active:scale-[0.985]",
        primary
          ? "bg-ink text-paper hover:bg-ink-soft"
          : "bg-ink/5 text-ink hover:bg-ink/8",
      )}
    >
      <Icon
        className={cn(
          "size-4.5",
          spinning && "animate-spin",
          primary ? "text-paper/75" : "text-muted-foreground",
        )}
        strokeWidth={1.8}
      />
      <span>
        <span className="block text-xs font-semibold">{label}</span>
        <span
          className={cn(
            "mt-0.5 block font-mono text-[0.7rem]",
            primary ? "text-paper/55" : "text-muted-foreground/80",
          )}
        >
          {detail}
        </span>
      </span>
    </button>
  )
}

function TransactionRow({
  transaction,
  index,
}: {
  transaction: Transaction
  index: number
}) {
  const Icon = categoryIcon[transaction.category]
  const income = transaction.amountCents > 0

  return (
    <div
      className="ledger-row ledger-enter"
      style={{ "--row-index": index } as CSSProperties}
    >
      <span aria-hidden className="ledger-rail" />
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            income ? "bg-ledger/10 text-ledger" : "bg-ink/5 text-ink-soft",
          )}
        >
          <Icon className="size-4" strokeWidth={1.8} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[0.82rem] font-medium">
            {transaction.merchant}
          </p>
          <p className="mt-0.5 truncate font-mono text-[0.7rem] text-muted-foreground">
            {transaction.detail} · {transaction.time}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p
          className={cn(
            "font-mono text-[0.72rem] font-medium tabular-nums",
            income ? "text-ledger" : "text-ink",
          )}
        >
          {formatSignedCents(transaction.amountCents)}
        </p>
        <p className="mt-0.5 font-mono text-[0.7rem] text-muted-foreground">
          saldo {formatCents(transaction.runningBalanceCents)}
        </p>
      </div>
    </div>
  )
}
