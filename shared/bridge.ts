export const BRIDGE_PROTOCOL_VERSION = 1

export type HapticStyle = "light" | "medium" | "heavy"

export type DeviceInfo = {
  platform: string
  osVersion: string
  model: string
  appVersion: string
  screenWidth: number
  screenHeight: number
}

export type PhotoResult = {
  uri: string
  dataUrl: string | null
  width: number
  height: number
  fileName: string | null
  mimeType: string | null
  bytes: number | null
}

export type LocationResult = {
  latitude: number
  longitude: number
  accuracy: number | null
  altitude: number | null
  timestamp: number
  mocked: boolean
}

export type NativeAction =
  | "device.info"
  | "camera.takePhoto"
  | "location.current"
  | "haptics.impact"
  | "clipboard.write"
  | "clipboard.read"
  | "native.echo"
  | "native.counter"
  | "ui.alert"
  | "link.open"

export type ActionPayloadMap = {
  "device.info": undefined
  "camera.takePhoto": { quality?: number }
  "location.current": undefined
  "haptics.impact": { style: HapticStyle }
  "clipboard.write": { text: string }
  "clipboard.read": undefined
  "native.echo": { message: string }
  "native.counter": { delta: number }
  "ui.alert": { title: string; message: string }
  "link.open": { url: string }
}

export type ActionResultMap = {
  "device.info": DeviceInfo
  "camera.takePhoto": PhotoResult | null
  "location.current": LocationResult
  "haptics.impact": { style: HapticStyle }
  "clipboard.write": { length: number }
  "clipboard.read": { text: string }
  "native.echo": { message: string; echoedAt: string }
  "native.counter": { value: number }
  "ui.alert": { shown: true }
  "link.open": { opened: boolean }
}

export type BridgeRequest = {
  [K in NativeAction]: {
    v: typeof BRIDGE_PROTOCOL_VERSION
    kind: "request"
    id: string
    action: K
    payload: ActionPayloadMap[K]
  }
}[NativeAction]

export type BridgeResponse = {
  v: typeof BRIDGE_PROTOCOL_VERSION
  kind: "response"
  id: string
  ok: boolean
  data?: unknown
  error?: string
}

export type NativeEventName =
  | "native.ping"
  | "native.counter.changed"
  | "native.log"

export type NativeEventPayloadMap = {
  "native.ping": { message: string; sentAt: string }
  "native.counter.changed": { value: number }
  "native.log": { level: "info" | "warn"; message: string }
}

export type NativeEvent = {
  [K in NativeEventName]: {
    v: typeof BRIDGE_PROTOCOL_VERSION
    kind: "event"
    event: K
    payload: NativeEventPayloadMap[K]
  }
}[NativeEventName]

export type WebToNative =
  | BridgeRequest
  | {
      v: typeof BRIDGE_PROTOCOL_VERSION
      kind: "event"
      event: string
      payload?: unknown
    }

export type NativeToWeb = BridgeResponse | NativeEvent

export const BRIDGE_ACTIONS: NativeAction[] = [
  "device.info",
  "camera.takePhoto",
  "location.current",
  "haptics.impact",
  "clipboard.write",
  "clipboard.read",
  "native.echo",
  "native.counter",
  "ui.alert",
  "link.open",
]

export function isNativeAction(value: unknown): value is NativeAction {
  return (
    typeof value === "string" &&
    (BRIDGE_ACTIONS as string[]).includes(value)
  )
}
