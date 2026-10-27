import { useMemo, useState } from "react"
import {
  AlertCircleIcon,
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  CheckIcon,
  RadioIcon,
  Trash2Icon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { TrafficEntry } from "@/lib/bridge"
import {
  directionLabel,
  summarizeActivity,
  type ActivityTone,
} from "@/lib/activity"

type BridgeLogProps = {
  entries: TrafficEntry[]
  onClear: () => void
}

type Filter = "all" | "sent" | "received"

const toneIcon: Record<ActivityTone, typeof ArrowUpRightIcon> = {
  send: ArrowUpRightIcon,
  receive: ArrowDownLeftIcon,
  success: CheckIcon,
  error: AlertCircleIcon,
}

const toneStyle: Record<ActivityTone, string> = {
  send: "bg-ink text-paper",
  receive: "bg-[oklch(0.55_0.1_245)]/10 text-[oklch(0.48_0.1_245)]",
  success: "bg-ledger/10 text-ledger",
  error: "bg-stamp/10 text-stamp",
}

function timeFor(at: string) {
  return new Date(at).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

function rawJson(entry: TrafficEntry) {
  return JSON.stringify(entry.message, null, 2)
}

export function BridgeLog({ entries, onClear }: BridgeLogProps) {
  const [filter, setFilter] = useState<Filter>("all")
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const filtered = useMemo(() => {
    const list = [...entries].reverse()

    if (filter === "sent") {
      return list.filter((entry) => entry.direction === "to-native")
    }

    if (filter === "received") {
      return list.filter((entry) => entry.direction === "from-native")
    }

    return list
  }, [entries, filter])

  const selected = entries.find((entry) => entry.id === selectedId) ?? null
  const sentCount = entries.filter((entry) => entry.direction === "to-native").length
  const receivedCount = entries.length - sentCount

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            A conversa do app.
          </h1>
          <p className="mt-1 max-w-[52ch] text-sm text-muted-foreground">
            Cada pedido, resposta e evento que passou pelo protocolo v1, com o
            JSON à mão.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-ledger/30 bg-ledger/5 font-mono text-[0.7rem] text-ledger"
          >
            <span className="size-1.5 rounded-full bg-ledger" />
            ao vivo
          </Badge>
          <Badge variant="secondary" className="font-mono text-[0.7rem]">
            {entries.length} registros
          </Badge>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-lg bg-ink/5 p-1">
          {(
            [
              ["all", `Tudo (${entries.length})`],
              ["sent", `Enviados (${sentCount})`],
              ["received", `Recebidos (${receivedCount})`],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => {
                setFilter(value)
                setSelectedId(null)
              }}
              className={cn(
                "rounded-md px-2.5 py-1.5 font-mono text-[0.7rem] tracking-wide uppercase transition-colors",
                filter === value
                  ? "bg-ink text-paper"
                  : "text-muted-foreground hover:text-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={entries.length === 0}
        >
          <Trash2Icon data-icon="inline-start" />
          Limpar
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(19rem,0.85fr)]">
        <section className="surface-paper overflow-hidden rounded-lg lg:self-start">
          {filtered.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex size-11 items-center justify-center rounded-xl bg-ink/5 text-muted-foreground">
                <RadioIcon className="size-5" />
              </div>
              <p className="mt-4 text-sm font-medium">
                {entries.length === 0
                  ? "Nada passou pelo bridge ainda."
                  : "Nenhum registro neste filtro."}
              </p>
              <p className="mt-1 max-w-[34ch] text-xs leading-relaxed text-muted-foreground">
                {entries.length === 0
                  ? "Use um atalho ou uma ferramenta para começar a conversa."
                  : "Troque o filtro para ver os outros registros."}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-ink/8">
              {filtered.map((entry, index) => {
                const summary = summarizeActivity(entry)
                const Icon = toneIcon[summary.tone]
                const isOpen = selectedId === entry.id

                return (
                  <li
                    key={entry.id}
                    className="activity-row"
                    data-new={index === 0}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`activity-detail-${entry.id}`}
                      onClick={() => setSelectedId(isOpen ? null : entry.id)}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-ink/3 sm:px-5",
                        isOpen && "bg-ink/4",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                          toneStyle[summary.tone],
                        )}
                      >
                        <Icon className="size-3.5" strokeWidth={2} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-[0.82rem] font-medium">
                            {summary.title}
                          </span>
                          <span className="shrink-0 rounded-full bg-ink/5 px-1.5 py-0.5 font-mono text-[0.7rem] tracking-wide text-muted-foreground uppercase">
                            {directionLabel(entry.direction)}
                          </span>
                        </span>
                        <span className="mt-0.5 block truncate text-[0.7rem] text-muted-foreground">
                          {summary.detail}
                        </span>
                        <span className="mt-1 block font-mono text-[0.7rem] text-muted-foreground/80">
                          {summary.code}
                        </span>
                      </span>

                      <span className="shrink-0 text-right font-mono text-[0.7rem] text-muted-foreground">
                        {timeFor(entry.at)}
                      </span>
                    </button>

                    {isOpen ? (
                      <div
                        id={`activity-detail-${entry.id}`}
                        className="activity-detail-enter px-4 pb-4 pl-15 sm:px-5 sm:pl-16 lg:hidden"
                      >
                        <ActivityDetail entry={entry} />
                      </div>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <aside className="surface-paper hidden rounded-lg p-5 lg:sticky lg:top-6 lg:block lg:self-start">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-base font-semibold tracking-tight">
              Detalhe
            </h2>
            <span className="font-mono text-[0.7rem] text-muted-foreground">
              protocolo v1
            </span>
          </div>

          {selected ? (
            <div className="mt-4">
              <ActivityDetail entry={selected} />
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center py-10 text-center">
              <div className="flex size-11 items-center justify-center rounded-xl bg-ink/5 text-muted-foreground">
                <ArrowUpRightIcon className="size-5" />
              </div>
              <p className="mt-4 text-sm font-medium">
                Selecione uma mensagem.
              </p>
              <p className="mt-1 max-w-[28ch] text-xs leading-relaxed text-muted-foreground">
                O pedido, a resposta e o JSON bruto aparecem aqui.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

function ActivityDetail({ entry }: { entry: TrafficEntry }) {
  const summary = summarizeActivity(entry)
  const json = rawJson(entry)

  return (
    <div className="space-y-4">
      <div>
        <p className="font-heading text-base font-semibold tracking-tight">
          {summary.title}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {summary.detail}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[0.7rem]">
        <dt className="text-muted-foreground">Direção</dt>
        <dd className="text-right font-mono">
          {directionLabel(entry.direction)}
        </dd>
        <dt className="text-muted-foreground">Horário</dt>
        <dd className="text-right font-mono">{timeFor(entry.at)}</dd>
        <dt className="text-muted-foreground">Ação / evento</dt>
        <dd className="truncate text-right font-mono" title={summary.code}>
          {summary.code}
        </dd>
        <dt className="text-muted-foreground">ID</dt>
        <dd className="truncate text-right font-mono" title={String(entry.id)}>
          #{entry.id}
        </dd>
      </dl>

      <div>
        <p className="mb-2 font-mono text-[0.7rem] tracking-[0.12em] text-muted-foreground uppercase">
          JSON original
        </p>
        <pre className="max-h-[48dvh] overflow-auto rounded-lg bg-ink p-3 font-mono text-[0.72rem] leading-relaxed break-words whitespace-pre-wrap text-paper/80">
          {json}
        </pre>
      </div>
    </div>
  )
}
