import { useState } from "react"
import type { HapticStyle } from "@shared/bridge"
import { Loader2Icon, VibrateIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ToolPanel } from "@/components/tool-panel"
import { request } from "@/lib/bridge"

const styles: { value: HapticStyle; label: string }[] = [
  { value: "light", label: "Leve" },
  { value: "medium", label: "Médio" },
  { value: "heavy", label: "Forte" },
]

export function HapticsSection({ className }: { className?: string }) {
  const [last, setLast] = useState<HapticStyle | null>(null)
  const [loading, setLoading] = useState<HapticStyle | null>(null)

  async function impact(style: HapticStyle) {
    setLoading(style)

    try {
      await request("haptics.impact", { style })
      setLast(style)
    } catch (error) {
      toast.error("Falha na vibração", {
        description: error instanceof Error ? error.message : "Erro inesperado",
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <ToolPanel
      id="tool-haptics"
      title="Resposta tátil"
      description="Sinta como o aparelho confirma cada toque."
      icon={VibrateIcon}
      protocol="haptics.impact"
      note={last ? `último impacto: ${last}` : "nenhum impacto ainda"}
      className={className}
    >
      <div className="flex gap-2">
        {styles.map((style) => (
          <Button
            key={style.value}
            variant={last === style.value ? "default" : "outline"}
            size="sm"
            onClick={() => void impact(style.value)}
            disabled={loading !== null}
            className="flex-1"
          >
            {loading === style.value ? (
              <Loader2Icon className="animate-spin" />
            ) : null}
            {style.label}
          </Button>
        ))}
      </div>
      <p className="mt-3 text-[0.7rem] leading-relaxed text-muted-foreground">
        No navegador, a vibração depende do suporte do dispositivo.
      </p>
    </ToolPanel>
  )
}
