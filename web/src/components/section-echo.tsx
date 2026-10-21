import { useState } from "react"
import { Loader2Icon, PenLineIcon, SendIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ToolPanel } from "@/components/tool-panel"
import { request } from "@/lib/bridge"

type EchoResult = { message: string; echoedAt: string; roundTrip: number }

export function EchoSection({ className }: { className?: string }) {
  const [text, setText] = useState("Comprar café para a casa")
  const [result, setResult] = useState<EchoResult | null>(null)
  const [loading, setLoading] = useState(false)

  async function send() {
    const message = text.trim()

    if (!message || loading) {
      return
    }

    setLoading(true)
    const startedAt = performance.now()

    try {
      const data = await request("native.echo", { message })
      setResult({
        ...data,
        roundTrip: Math.round(performance.now() - startedAt),
      })
    } catch (error) {
      toast.error("O app não respondeu", {
        description: error instanceof Error ? error.message : "Erro inesperado",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ToolPanel
      id="tool-notes"
      title="Anotação"
      description="Mande um recado e veja o lado nativo devolver o mesmo texto."
      icon={PenLineIcon}
      protocol="native.echo"
      note="O texto faz ida e volta pelo mesmo canal."
      className={className}
      action={
        <Button
          size="sm"
          onClick={() => void send()}
          disabled={loading || !text.trim()}
        >
          {loading ? (
            <Loader2Icon data-icon="inline-start" className="animate-spin" />
          ) : (
            <SendIcon data-icon="inline-start" />
          )}
          Enviar
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        <label htmlFor="note-input" className="sr-only">
          Mensagem para o lado nativo
        </label>
        <textarea
          id="note-input"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault()
              void send()
            }
          }}
          rows={3}
          placeholder="Ex.: lembrar do aluguel na sexta"
          className="min-h-24 w-full resize-none rounded-xl border border-ink/12 bg-canvas/60 px-3 py-2.5 text-sm leading-relaxed outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/70 focus:border-ring focus:ring-3 focus:ring-ring/20"
        />
        <p className="font-mono text-[0.7rem] text-muted-foreground">
          Enter envia · Shift + Enter quebra linha
        </p>

        {result ? (
          <div className="rounded-xl bg-paper-deep/70 p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[0.7rem] tracking-[0.1em] text-muted-foreground uppercase">
                Devolvido em {result.roundTrip}ms
              </span>
              <span className="font-mono text-[0.7rem] text-ledger">
                {new Date(result.echoedAt).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>
            <p className="mt-2 break-words text-sm">{result.message}</p>
          </div>
        ) : null}
      </div>
    </ToolPanel>
  )
}
