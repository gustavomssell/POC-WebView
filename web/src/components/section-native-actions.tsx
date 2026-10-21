import { useState } from "react"
import {
  BellRingIcon,
  ExternalLinkIcon,
  Loader2Icon,
  RadioIcon,
  WrenchIcon,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ToolPanel } from "@/components/tool-panel"
import { request, sendEvent } from "@/lib/bridge"

export function NativeActionsSection({ className }: { className?: string }) {
  const [status, setStatus] = useState("nenhuma ação ainda")
  const [loading, setLoading] = useState<string | null>(null)
  const [eventsSent, setEventsSent] = useState(0)

  async function showAlert() {
    setLoading("alert")

    try {
      await request("ui.alert", {
        title: "Conta",
        message: "Este alerta foi aberto pelo app nativo.",
      })
      setStatus("alerta nativo exibido")
    } catch (error) {
      toast.error("Falha ao abrir o alerta", {
        description: error instanceof Error ? error.message : "Erro inesperado",
      })
    } finally {
      setLoading(null)
    }
  }

  async function openLink() {
    setLoading("link")

    try {
      const result = await request("link.open", { url: "https://expo.dev" })

      if (!result.opened) {
        throw new Error("O navegador bloqueou a abertura do link")
      }

      setStatus("link entregue ao sistema")
    } catch (error) {
      toast.error("Falha ao abrir o link", {
        description: error instanceof Error ? error.message : "Erro inesperado",
      })
    } finally {
      setLoading(null)
    }
  }

  function fireEvent() {
    sendEvent("web.hello", {
      message: "Evento sem resposta, só ida do web para o nativo.",
      sentAt: new Date().toISOString(),
    })
    setEventsSent((count) => count + 1)
    setStatus("evento web.hello enviado")
    toast.info("Sinal enviado", {
      description: "Abra o painel nativo para ver o log.",
    })
  }

  return (
    <ToolPanel
      id="tool-system"
      title="Sistema"
      description="Ações que saem do app e vão para o sistema do aparelho."
      icon={WrenchIcon}
      protocol="ui.alert · link.open · web.hello"
      note={`${eventsSent} evento(s) enviado(s)`}
      className={className}
    >
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => void showAlert()}
          disabled={loading !== null}
        >
          {loading === "alert" ? (
            <Loader2Icon data-icon="inline-start" className="animate-spin" />
          ) : (
            <BellRingIcon data-icon="inline-start" />
          )}
          Alerta nativo
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => void openLink()}
          disabled={loading !== null}
        >
          {loading === "link" ? (
            <Loader2Icon data-icon="inline-start" className="animate-spin" />
          ) : (
            <ExternalLinkIcon data-icon="inline-start" />
          )}
          Abrir expo.dev
        </Button>
        <Button size="sm" variant="secondary" onClick={fireEvent}>
          <RadioIcon data-icon="inline-start" />
          Enviar sinal
        </Button>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-lg bg-paper-deep/70 px-3 py-2">
        <span className="size-1.5 shrink-0 rounded-full bg-ledger" />
        <p className="truncate font-mono text-[0.7rem] text-muted-foreground">
          {status}
        </p>
      </div>
    </ToolPanel>
  )
}
