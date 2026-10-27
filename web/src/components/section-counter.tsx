import { useState } from "react"
import { Loader2Icon, MinusIcon, PlusIcon, ReceiptTextIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ToolPanel } from "@/components/tool-panel"
import { request } from "@/lib/bridge"

export function CounterSection({ className }: { className?: string }) {
  const [value, setValue] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const canDecrement = value !== null && value > 0

  async function change(delta: number) {
    setLoading(true)

    try {
      const data = await request("native.counter", { delta })
      setValue(data.value)
    } catch (error) {
      toast.error("Não foi possível alterar as parcelas", {
        description: error instanceof Error ? error.message : "Erro inesperado",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ToolPanel
      id="tool-payments"
      title="Parcelas"
      description="Escolha em quantas vezes a despesa entra na caderneta."
      icon={ReceiptTextIcon}
      protocol="native.counter"
      note="O valor continua guardado no host nativo."
      className={className}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-end gap-2">
            <span
              key={value ?? "empty"}
              className="count-pop font-mono text-5xl font-medium tabular-nums"
            >
              {value ?? 0}
            </span>
            <span className="mb-1.5 font-mono text-xs text-muted-foreground">
              {value === 1 ? "parcela" : "parcelas"}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {value === null
              ? "Ajuste para começar."
              : value === 0
                ? "Sem parcelamento."
                : `Despesa dividida em ${value}×.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-lg"
            aria-label="Diminuir parcelas"
            onClick={() => void change(-1)}
            disabled={loading || !canDecrement}
          >
            {loading ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <MinusIcon />
            )}
          </Button>
          <Button
            variant="default"
            size="icon-lg"
            aria-label="Aumentar parcelas"
            onClick={() => void change(1)}
            disabled={loading}
          >
            {loading ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <PlusIcon />
            )}
          </Button>
        </div>
      </div>
    </ToolPanel>
  )
}
