import { useState } from "react"
import type { LocationResult } from "@shared/bridge"
import { ExternalLinkIcon, Loader2Icon, MapPinIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ToolPanel } from "@/components/tool-panel"
import { request } from "@/lib/bridge"

function mapUrl(position: LocationResult) {
  const { latitude, longitude } = position
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`
}

export function LocationSection({ className }: { className?: string }) {
  const [position, setPosition] = useState<LocationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [opening, setOpening] = useState(false)

  async function readLocation() {
    setLoading(true)

    try {
      const result = await request("location.current", undefined)
      setPosition(result)
    } catch (error) {
      toast.error("GPS indisponível", {
        description: error instanceof Error ? error.message : "Erro inesperado",
      })
    } finally {
      setLoading(false)
    }
  }

  async function openMap() {
    if (!position) {
      return
    }

    setOpening(true)

    try {
      const result = await request("link.open", { url: mapUrl(position) })

      if (!result.opened) {
        throw new Error("O navegador bloqueou a abertura do mapa")
      }
    } catch (error) {
      toast.error("Falha ao abrir o mapa", {
        description: error instanceof Error ? error.message : "Erro inesperado",
      })
    } finally {
      setOpening(false)
    }
  }

  return (
    <ToolPanel
      id="tool-location"
      title="Local do gasto"
      description="Use o GPS do aparelho para guardar onde a despesa aconteceu."
      icon={MapPinIcon}
      protocol="location.current"
      note={
        position ? "permissão pedida a cada sessão" : "requer permissão de localização"
      }
      className={className}
      action={
        <Button
          variant="outline"
          size="sm"
          onClick={() => void readLocation()}
          disabled={loading}
        >
          {loading ? (
            <Loader2Icon data-icon="inline-start" className="animate-spin" />
          ) : (
            <MapPinIcon data-icon="inline-start" />
          )}
          {position ? "Atualizar" : "Ler GPS"}
        </Button>
      }
    >
      {position ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 border-b border-ink/8 pb-4">
            <div>
              <p className="font-mono text-[0.7rem] tracking-[0.12em] text-muted-foreground uppercase">
                Latitude
              </p>
              <p className="mt-1 font-mono text-lg font-medium tabular-nums">
                {position.latitude.toFixed(6)}
              </p>
            </div>
            <div>
              <p className="font-mono text-[0.7rem] tracking-[0.12em] text-muted-foreground uppercase">
                Longitude
              </p>
              <p className="mt-1 font-mono text-lg font-medium tabular-nums">
                {position.longitude.toFixed(6)}
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[0.7rem]">
            <dt className="text-muted-foreground">Precisão</dt>
            <dd className="text-right font-mono">
              {position.accuracy !== null
                ? `${Math.round(position.accuracy)} m`
                : "indisponível"}
            </dd>
            <dt className="text-muted-foreground">Altitude</dt>
            <dd className="text-right font-mono">
              {position.altitude !== null
                ? `${Math.round(position.altitude)} m`
                : "indisponível"}
            </dd>
            <dt className="text-muted-foreground">Origem</dt>
            <dd className="text-right font-mono">
              {position.mocked ? "simulada" : "GPS"}
            </dd>
            <dt className="text-muted-foreground">Horário</dt>
            <dd className="text-right font-mono">
              {new Date(position.timestamp).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </dd>
          </dl>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => void openMap()}
            disabled={opening}
            className="self-start"
          >
            {opening ? (
              <Loader2Icon data-icon="inline-start" className="animate-spin" />
            ) : (
              <ExternalLinkIcon data-icon="inline-start" />
            )}
            Ver no mapa
          </Button>
        </div>
      ) : (
        <div className="flex aspect-[16/10] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-ink/15 px-4 text-center">
          <MapPinIcon className="size-6 text-muted-foreground/70" strokeWidth={1.5} />
          <p className="text-sm font-medium">Nenhum local ainda.</p>
          <p className="max-w-[28ch] text-xs text-muted-foreground">
            Toque em ler GPS para guardar as coordenadas desta despesa.
          </p>
        </div>
      )}
    </ToolPanel>
  )
}
