import { useState } from "react"
import type { PhotoResult } from "@shared/bridge"
import { CameraIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ToolPanel } from "@/components/tool-panel"
import { request } from "@/lib/bridge"

export function CameraSection({ className }: { className?: string }) {
  const [photo, setPhoto] = useState<PhotoResult | null>(null)
  const [loading, setLoading] = useState(false)

  async function takePhoto() {
    setLoading(true)

    try {
      const result = await request("camera.takePhoto", { quality: 0.4 })

      if (result) {
        setPhoto(result)
      } else {
        toast.info("Captura cancelada")
      }
    } catch (error) {
      toast.error("Câmera indisponível", {
        description: error instanceof Error ? error.message : "Erro inesperado",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ToolPanel
      id="tool-camera"
      title="Comprovante"
      description="Fotografe o recibo e anexe a imagem à despesa do dia."
      icon={CameraIcon}
      protocol="camera.takePhoto"
      note="No navegador, uma foto de exemplo substitui a câmera."
      tone="ink"
      className={className}
      action={
        <Button
          size="sm"
          onClick={() => void takePhoto()}
          disabled={loading}
          className="bg-paper text-ink hover:bg-paper-deep"
        >
          {loading ? (
            <Loader2Icon data-icon="inline-start" className="animate-spin" />
          ) : (
            <CameraIcon data-icon="inline-start" />
          )}
          {photo ? "Nova foto" : "Abrir câmera"}
        </Button>
      }
    >
      {photo?.dataUrl ? (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border border-white/15 bg-black/10 p-1.5">
            <img
              src={photo.dataUrl}
              alt="Comprovante capturado pela câmera"
              className="receipt-photo aspect-[16/10] w-full rounded-lg object-cover"
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.7rem] text-paper/50">
            <span>
              {photo.width} × {photo.height}
            </span>
            <span aria-hidden>·</span>
            <span>{photo.mimeType ?? "formato desconhecido"}</span>
            <span aria-hidden>·</span>
            <span>
              {photo.bytes !== null
                ? `${Math.round(photo.bytes / 1024)} KB`
                : "tamanho indisponível"}
            </span>
            <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-paper/65">
              anexo pronto
            </span>
          </div>
        </div>
      ) : (
        <div className="flex aspect-[16/9] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/18 bg-white/3 px-4 text-center">
          <CameraIcon className="size-6 text-paper/35" strokeWidth={1.5} />
          <p className="text-sm font-medium text-paper/75">
            Nenhum comprovante ainda.
          </p>
          <p className="max-w-[30ch] text-xs text-paper/45">
            A foto aparece aqui e fica pronta para a despesa.
          </p>
        </div>
      )}
    </ToolPanel>
  )
}
