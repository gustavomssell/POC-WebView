import { useState } from "react"
import {
  ClipboardCopyIcon,
  ClipboardPasteIcon,
  Loader2Icon,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ToolPanel } from "@/components/tool-panel"
import { request } from "@/lib/bridge"
import { account, formatCents, monthLabel } from "@/lib/account"

const month = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)
const summary = `Resumo de ${month} · saldo ${formatCents(account.balanceCents)} · entradas ${formatCents(account.incomeCents)} · saídas ${formatCents(account.expenseCents)}`

export function ClipboardSection({ className }: { className?: string }) {
  const [text, setText] = useState(summary)
  const [readValue, setReadValue] = useState<string | null>(null)
  const [loading, setLoading] = useState<"write" | "read" | null>(null)

  async function write() {
    setLoading("write")

    try {
      await request("clipboard.write", { text })
      toast.success("Resumo copiado", {
        description: "Cole em qualquer app do aparelho.",
      })
    } catch (error) {
      toast.error("Não foi possível copiar", {
        description: error instanceof Error ? error.message : "Erro inesperado",
      })
    } finally {
      setLoading(null)
    }
  }

  async function read() {
    setLoading("read")

    try {
      const data = await request("clipboard.read", undefined)
      setReadValue(data.text)
    } catch (error) {
      toast.error("Não foi possível ler a área de transferência", {
        description: error instanceof Error ? error.message : "Erro inesperado",
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <ToolPanel
      id="tool-clipboard"
      title="Resumo para compartilhar"
      description="Leve o mês para fora do app pela área de transferência."
      icon={ClipboardCopyIcon}
      protocol="clipboard.write · read"
      note="Usa a área de transferência do aparelho."
      className={className}
    >
      <div className="flex flex-col gap-3">
        <label htmlFor="clipboard-text" className="sr-only">
          Texto para a área de transferência
        </label>
        <textarea
          id="clipboard-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={3}
          className="min-h-24 w-full resize-none rounded-xl border border-ink/12 bg-canvas/60 px-3 py-2.5 text-sm leading-relaxed outline-none transition-[border-color,box-shadow] focus:border-ring focus:ring-3 focus:ring-ring/20"
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => void write()}
            disabled={loading !== null || !text}
          >
            {loading === "write" ? (
              <Loader2Icon data-icon="inline-start" className="animate-spin" />
            ) : (
              <ClipboardCopyIcon data-icon="inline-start" />
            )}
            Copiar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void read()}
            disabled={loading !== null}
          >
            {loading === "read" ? (
              <Loader2Icon data-icon="inline-start" className="animate-spin" />
            ) : (
              <ClipboardPasteIcon data-icon="inline-start" />
            )}
            Colar do sistema
          </Button>
          <span className="ml-auto font-mono text-[0.7rem] text-muted-foreground">
            {text.length} caracteres
          </span>
        </div>

        {readValue !== null ? (
          <div className="rounded-xl bg-paper-deep/70 p-3">
            <span className="font-mono text-[0.7rem] tracking-[0.1em] text-muted-foreground uppercase">
              Lido do sistema
            </span>
            <p className="mt-1.5 break-words text-xs leading-relaxed">
              {readValue || "(vazio)"}
            </p>
          </div>
        ) : null}
      </div>
    </ToolPanel>
  )
}
