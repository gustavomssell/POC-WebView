import {
  BRIDGE_PROTOCOL_VERSION,
  isNativeAction,
  type BridgeRequest,
} from "../../shared/bridge"

/**
 * Resultado do parsing de uma mensagem recebida do WebView.
 *
 * O host so toma decisoes de efeito (log, resposta, execucao de API nativa);
 * esta camada e pura e responde apenas "o que esta mensagem eh".
 */
export type ParsedHostMessage =
  | { ok: true; kind: "event"; event: string; payload: unknown }
  | { ok: true; kind: "request"; request: BridgeRequest }
  | {
      ok: false
      reason: InvalidMessageReason
      /** Valor ofensivo, quando o motivo guarda um campo especifico. */
      value?: unknown
    }

export type InvalidMessageReason =
  | "invalid-json"
  | "not-an-object"
  | "protocol-mismatch"
  | "invalid-event"
  | "invalid-kind"
  | "invalid-request"

/** Rotulo usado no log nativo para cada motivo de rejeicao. */
const INVALID_LABEL: Record<InvalidMessageReason, string> = {
  "invalid-json": "invalid json",
  "not-an-object": "invalid message",
  "protocol-mismatch": "protocol mismatch",
  "invalid-event": "invalid event",
  "invalid-kind": "invalid message kind",
  "invalid-request": "invalid request",
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/** Origina de uma URL, usada no originWhitelist do WebView. */
export function extractOrigin(url: string) {
  return /^[A-Za-z][A-Za-z0-9+.-]*:(\/\/)?[^/]*/.exec(url)?.[0] ?? null
}

/** JSON compacto para o log, truncando strings longas (ex.: data URL de foto). */
export function formatDetail(value: unknown): string {
  if (value === undefined) {
    return ""
  }

  try {
    return JSON.stringify(value, (_key, item) =>
      typeof item === "string" && item.length > 180
        ? `${item.slice(0, 177)}...`
        : item,
    )
  } catch {
    return String(value)
  }
}

export function parseHostMessage(raw: string): ParsedHostMessage {
  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, reason: "invalid-json" }
  }

  if (!isRecord(parsed)) {
    return { ok: false, reason: "not-an-object" }
  }

  if (parsed.v !== BRIDGE_PROTOCOL_VERSION) {
    return { ok: false, reason: "protocol-mismatch", value: parsed.v }
  }

  if (parsed.kind === "event") {
    if (typeof parsed.event !== "string") {
      return { ok: false, reason: "invalid-event" }
    }

    return { ok: true, kind: "event", event: parsed.event, payload: parsed.payload }
  }

  if (parsed.kind !== "request") {
    return { ok: false, reason: "invalid-kind", value: parsed.kind }
  }

  if (typeof parsed.id !== "string" || !isNativeAction(parsed.action)) {
    return { ok: false, reason: "invalid-request" }
  }

  return { ok: true, kind: "request", request: parsed as BridgeRequest }
}

/** Como uma mensagem rejeitada deve aparecer no log nativo. */
export function describeInvalid(
  result: Extract<ParsedHostMessage, { ok: false }>,
  raw: string,
): { label: string; detail: string } {
  const label = INVALID_LABEL[result.reason]

  // Motivos com campo ofensivo (versao, kind) mostram esse valor,
  // mesmo quando ele existe e eh undefined — como o host fazia antes.
  if ("value" in result) {
    return { label, detail: String(result.value) }
  }

  return { label, detail: raw.slice(0, 200) }
}
