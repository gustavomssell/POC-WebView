import {
  BRIDGE_PROTOCOL_VERSION,
  type ActionPayloadMap,
  type ActionResultMap,
  type BridgeRequest,
  type BridgeResponse,
  type NativeAction,
  type NativeToWeb,
  type WebToNative,
} from "@shared/bridge"
import { mockNativeRequest } from "@/lib/mock-native"

type PendingRequest = {
  resolve: (value: unknown) => void
  reject: (error: Error) => void
  timeout: ReturnType<typeof setTimeout>
}

export type TrafficDirection = "to-native" | "from-native"

export type TrafficEntry = {
  id: number
  direction: TrafficDirection
  message: WebToNative | NativeToWeb
  at: string
  action?: NativeAction
}

declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (data: string) => void }
    __pocBridge?: { dispatch: (input: unknown) => void }
  }
}

const pending = new Map<string, PendingRequest>()
const requestActions = new Map<string, NativeAction>()
const listeners = new Set<(entry: TrafficEntry) => void>()
const MAX_TRAFFIC_STRING = 360
const DEFAULT_TIMEOUT_MS = 10_000
const ACTION_TIMEOUTS: Partial<Record<NativeAction, number>> = {
  "camera.takePhoto": 300_000,
  "location.current": 60_000,
}
let nextTrafficId = 0

export const isNativeWebView =
  typeof window !== "undefined" && Boolean(window.ReactNativeWebView)

function createId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`
}

function sanitizeTrafficValue(
  value: unknown,
  seen = new Set<object>(),
  depth = 0,
): unknown {
  if (typeof value === "string") {
    return value.length > MAX_TRAFFIC_STRING
      ? `${value.slice(0, MAX_TRAFFIC_STRING)}... [${value.length} chars]`
      : value
  }

  if (value === null || typeof value !== "object") {
    return value
  }

  if (depth >= 6) {
    return "[profundidade limitada]"
  }

  if (seen.has(value)) {
    return "[circular]"
  }

  seen.add(value)

  const sanitized = Array.isArray(value)
    ? value.map((item) => sanitizeTrafficValue(item, seen, depth + 1))
    : Object.fromEntries(
        Object.entries(value).map(([key, item]) => [
          key,
          sanitizeTrafficValue(item, seen, depth + 1),
        ]),
      )

  seen.delete(value)
  return sanitized
}

function notify(
  direction: TrafficDirection,
  message: WebToNative | NativeToWeb,
  action?: NativeAction,
) {
  const entry: TrafficEntry = {
    id: ++nextTrafficId,
    direction,
    message: sanitizeTrafficValue(message) as WebToNative | NativeToWeb,
    at: new Date().toISOString(),
    action,
  }

  listeners.forEach((listener) => listener(entry))
}

export function subscribeTraffic(listener: (entry: TrafficEntry) => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function dispatchNativeMessage(input: unknown) {
  let parsed: unknown = input

  if (typeof input === "string") {
    try {
      parsed = JSON.parse(input)
    } catch {
      return
    }
  }

  if (!parsed || typeof parsed !== "object") {
    return
  }

  const message = parsed as NativeToWeb
  const action =
    message.kind === "response" ? requestActions.get(message.id) : undefined

  notify("from-native", message, action)

  if (message.kind !== "response") {
    return
  }

  requestActions.delete(message.id)

  const request = pending.get(message.id)
  if (!request) {
    return
  }

  clearTimeout(request.timeout)
  pending.delete(message.id)

  if (message.ok) {
    request.resolve(message.data)
  } else {
    request.reject(new Error(message.error ?? "Native error"))
  }
}

if (typeof window !== "undefined") {
  window.__pocBridge = { dispatch: dispatchNativeMessage }
}

export function request<K extends NativeAction>(
  action: K,
  payload: ActionPayloadMap[K],
  timeoutMs = ACTION_TIMEOUTS[action] ?? DEFAULT_TIMEOUT_MS,
): Promise<ActionResultMap[K]> {
  const id = createId("req")
  const message = {
    v: BRIDGE_PROTOCOL_VERSION,
    kind: "request",
    id,
    action,
    payload,
  } as BridgeRequest

  requestActions.set(id, action)
  notify("to-native", message, action)

  const host = window.ReactNativeWebView

  if (!host) {
    return mockNativeRequest(action, payload).then(
      (data) => {
        const response: BridgeResponse = {
          v: BRIDGE_PROTOCOL_VERSION,
          kind: "response",
          id,
          ok: true,
          data,
        }

        dispatchNativeMessage(response)
        return data as ActionResultMap[K]
      },
      (error: unknown) => {
        const response: BridgeResponse = {
          v: BRIDGE_PROTOCOL_VERSION,
          kind: "response",
          id,
          ok: false,
          error: error instanceof Error ? error.message : "Erro simulado",
        }

        dispatchNativeMessage(response)
        throw error
      },
    )
  }

  return new Promise<ActionResultMap[K]>((resolve, reject) => {
    const timeout = setTimeout(() => {
      pending.delete(id)
      requestActions.delete(id)
      reject(new Error(`Timeout: "${action}" não respondeu em ${timeoutMs}ms`))
    }, timeoutMs)

    pending.set(id, {
      resolve: resolve as (value: unknown) => void,
      reject,
      timeout,
    })

    try {
      host.postMessage(JSON.stringify(message))
    } catch (error) {
      clearTimeout(timeout)
      pending.delete(id)
      requestActions.delete(id)
      reject(error instanceof Error ? error : new Error("Falha ao enviar mensagem"))
    }
  })
}

export function sendEvent(event: string, payload?: unknown) {
  const message: WebToNative = {
    v: BRIDGE_PROTOCOL_VERSION,
    kind: "event",
    event,
    payload,
  }

  notify("to-native", message)

  window.ReactNativeWebView?.postMessage(JSON.stringify(message))
}
