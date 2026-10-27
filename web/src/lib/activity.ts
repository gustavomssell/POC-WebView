import type { NativeAction } from "@shared/bridge"
import type { TrafficEntry } from "@/lib/bridge"

export type ActivityTone = "send" | "receive" | "success" | "error"

export type ActivitySummary = {
  title: string
  detail: string
  code: string
  tone: ActivityTone
}

const actions: Record<
  NativeAction,
  { request: string; response: string; detail: string }
> = {
  "device.info": {
    request: "Lendo o aparelho",
    response: "Aparelho identificado",
    detail: "Modelo, sistema e tela",
  },
  "camera.takePhoto": {
    request: "Abrindo a câmera",
    response: "Foto recebida",
    detail: "Comprovante capturado",
  },
  "location.current": {
    request: "Buscando localização",
    response: "Localização recebida",
    detail: "GPS do aparelho",
  },
  "haptics.impact": {
    request: "Testando vibração",
    response: "Vibração disparada",
    detail: "Resposta tátil",
  },
  "clipboard.write": {
    request: "Copiando para o sistema",
    response: "Texto copiado",
    detail: "Área de transferência",
  },
  "clipboard.read": {
    request: "Lendo a área de transferência",
    response: "Texto lido",
    detail: "Área de transferência",
  },
  "native.echo": {
    request: "Enviando anotação",
    response: "Anotação devolvida",
    detail: "Mensagem de ida e volta",
  },
  "native.counter": {
    request: "Ajustando parcelas",
    response: "Parcelas atualizadas",
    detail: "Contador guardado no app",
  },
  "ui.alert": {
    request: "Abrindo alerta",
    response: "Alerta exibido",
    detail: "Aviso nativo",
  },
  "link.open": {
    request: "Abrindo link",
    response: "Link entregue",
    detail: "Navegador do aparelho",
  },
}

const events: Record<string, { title: string; detail: string }> = {
  "native.ping": {
    title: "Sinal do app",
    detail: "O host nativo enviou um sinal de vida",
  },
  "native.counter.changed": {
    title: "Parcelas mudaram no app",
    detail: "O estado nativo foi atualizado",
  },
  "native.log": {
    title: "Registro do app",
    detail: "Mensagem enviada pelo lado nativo",
  },
  "web.ready": {
    title: "App pronto",
    detail: "O WebView avisou que carregou",
  },
  "web.hello": {
    title: "Sinal enviado",
    detail: "Evento sem resposta enviado ao app",
  },
}

export function summarizeActivity(entry: TrafficEntry): ActivitySummary {
  const message = entry.message

  if (message.kind === "request") {
    const copy = actions[message.action]
    return {
      title: copy?.request ?? message.action,
      detail: copy?.detail ?? "Chamada ao aparelho",
      code: message.action,
      tone: "send",
    }
  }

  if (message.kind === "response") {
    const copy = entry.action ? actions[entry.action] : undefined
    return {
      title: message.ok
        ? (copy?.response ?? "Resposta recebida")
        : "Ação não concluída",
      detail: message.ok
        ? (copy?.detail ?? "Resposta do aparelho")
        : (message.error ?? "O aparelho devolveu um erro"),
      code: entry.action ?? "response",
      tone: message.ok ? "success" : "error",
    }
  }

  const copy = events[message.event]
  return {
    title: copy?.title ?? "Evento",
    detail: copy?.detail ?? message.event,
    code: message.event,
    tone: "receive",
  }
}

export function directionLabel(direction: TrafficEntry["direction"]) {
  return direction === "to-native" ? "Web → app" : "App → web"
}
