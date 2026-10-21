import { ArrowUpRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CameraSection } from "@/components/section-camera"
import { ClipboardSection } from "@/components/section-clipboard"
import { CounterSection } from "@/components/section-counter"
import { DeviceSection } from "@/components/section-device"
import { EchoSection } from "@/components/section-echo"
import { HapticsSection } from "@/components/section-haptics"
import { LocationSection } from "@/components/section-location"
import { NativeActionsSection } from "@/components/section-native-actions"

export function ToolsPage({ onOpenActivity }: { onOpenActivity: () => void }) {
  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            O aparelho trabalhando.
          </h1>
          <p className="mt-1 max-w-[52ch] text-sm text-muted-foreground">
            Câmera, GPS, arquivos e sistema, cada um com uma função real na
            rotina.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onOpenActivity}>
          <ArrowUpRightIcon data-icon="inline-start" />
          Ver atividade
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <CameraSection className="lg:col-span-8" />
        <LocationSection className="lg:col-span-4 lg:self-start" />
      </div>

      <div className="surface-paper overflow-hidden rounded-lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 [&>section]:rounded-none [&>section]:border-t [&>section]:border-ink/8 [&>section]:bg-transparent [&>section]:shadow-none [&>section:first-child]:border-t-0 lg:[&>section:nth-child(2)]:border-t-0 lg:[&>section:nth-child(even)]:border-l">
          <EchoSection />
          <CounterSection />
          <ClipboardSection />
          <HapticsSection />
          <DeviceSection />
          <NativeActionsSection />
        </div>
      </div>

      <p className="px-1 font-mono text-[0.72rem] leading-relaxed text-muted-foreground">
        Toda chamada passa pelo protocolo v1. Abra Atividade para ver o pedido,
        a resposta e o JSON original.
      </p>
    </div>
  )
}
