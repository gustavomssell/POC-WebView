import { useState } from "react"
import type { DeviceInfo } from "@shared/bridge"
import { Loader2Icon, RefreshCwIcon, SmartphoneIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ToolPanel } from "@/components/tool-panel"
import { request } from "@/lib/bridge"
import { cn } from "@/lib/utils"

export function DeviceSection({ className }: { className?: string }) {
  const [info, setInfo] = useState<DeviceInfo | null>(null)
  const [roundTrip, setRoundTrip] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  async function readDevice() {
    setLoading(true)
    const startedAt = performance.now()

    try {
      const data = await request("device.info", undefined)
      setInfo(data)
      setRoundTrip(Math.round(performance.now() - startedAt))
    } catch (error) {
      toast.error("Não foi possível ler o aparelho", {
        description: error instanceof Error ? error.message : "Erro inesperado",
      })
    } finally {
      setLoading(false)
    }
  }

  const rows = info
    ? [
        ["Plataforma", info.platform],
        ["Modelo", info.model],
        ["Sistema", info.osVersion],
        ["Versão do app", info.appVersion],
        ["Tela", `${info.screenWidth} × ${info.screenHeight}`],
      ]
    : []

  return (
    <ToolPanel
      id="tool-device"
      title="Aparelho"
      description="O que o app sabe sobre o dispositivo que está na sua mão."
      icon={SmartphoneIcon}
      protocol="device.info"
      note={roundTrip !== null ? `resposta em ${roundTrip}ms` : "leitura sob demanda"}
      className={className}
      action={
        <Button
          variant="outline"
          size="sm"
          onClick={() => void readDevice()}
          disabled={loading}
        >
          {loading ? (
            <Loader2Icon data-icon="inline-start" className="animate-spin" />
          ) : (
            <RefreshCwIcon data-icon="inline-start" />
          )}
          {info ? "Atualizar" : "Ler aparelho"}
        </Button>
      }
    >
      {info ? (
        <dl className="divide-y divide-ink/8">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="grid grid-cols-[7rem_minmax(0,1fr)] items-baseline gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <dt className="text-[0.7rem] text-muted-foreground">{label}</dt>
              <dd
                className={cn(
                  "truncate text-right font-mono text-[0.72rem] text-ink",
                )}
                title={value}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-ink/15 px-4 py-6">
          <SmartphoneIcon className="size-5 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Aparelho ainda não lido.</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Toque em ler para buscar modelo, sistema e tela.
            </p>
          </div>
        </div>
      )}
    </ToolPanel>
  )
}
