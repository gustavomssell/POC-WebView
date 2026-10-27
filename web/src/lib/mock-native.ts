import type {
  DeviceInfo,
  HapticStyle,
  LocationResult,
  NativeAction,
  PhotoResult,
} from "@shared/bridge"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

let counter = 0
let clipboardFallback = ""

function vibrate(style: HapticStyle) {
  const duration = style === "light" ? 12 : style === "medium" ? 24 : 40
  navigator.vibrate?.(duration)
}

function mockPhoto(): PhotoResult {
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">',
    '<rect width="640" height="480" fill="#18181b"/>',
    '<rect x="180" y="150" width="280" height="190" rx="18" fill="none" stroke="#52525b" stroke-width="3"/>',
    '<circle cx="320" cy="245" r="52" fill="none" stroke="#52525b" stroke-width="3"/>',
    '<text x="320" y="390" fill="#a1a1aa" font-family="monospace" font-size="18" text-anchor="middle">camera simulada no browser</text>',
    "</svg>",
  ].join("")

  return {
    uri: "",
    dataUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    width: 640,
    height: 480,
    fileName: "mock-camera.svg",
    mimeType: "image/svg+xml",
    bytes: svg.length,
  }
}

function mockLocation(): Promise<LocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocalizacao indisponivel neste browser"))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          timestamp: position.timestamp,
          mocked: false,
        }),
      (error) =>
        reject(new Error(error.message || "Permissao de localizacao negada")),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 30000 },
    )
  })
}

function readDeviceInfo(): DeviceInfo {
  return {
    platform: "browser",
    osVersion: navigator.userAgent,
    model: navigator.platform || "unknown",
    appVersion: "mock",
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
  }
}

async function writeClipboard(text: string) {
  clipboardFallback = text

  try {
    await navigator.clipboard.writeText(text)
  } catch {
    clipboardFallback = text
  }

  return { length: text.length }
}

async function readClipboard() {
  try {
    return { text: await navigator.clipboard.readText() }
  } catch {
    return { text: clipboardFallback }
  }
}

export async function mockNativeRequest(
  action: NativeAction,
  payload: unknown,
): Promise<unknown> {
  if (action === "link.open") {
    const { url } = payload as { url: string }
    const popup = url ? window.open(url, "_blank") : null

    if (popup) {
      popup.opener = null
    }

    return { opened: Boolean(popup) }
  }

  await wait(140 + Math.random() * 220)

  switch (action) {
    case "device.info":
      return readDeviceInfo()

    case "camera.takePhoto":
      return mockPhoto()

    case "location.current":
      return mockLocation()

    case "haptics.impact": {
      const { style } = payload as { style: HapticStyle }
      vibrate(style)
      return { style }
    }

    case "clipboard.write": {
      const { text } = payload as { text: string }
      return writeClipboard(text)
    }

    case "clipboard.read":
      return readClipboard()

    case "native.echo": {
      const { message } = payload as { message: string }
      return { message, echoedAt: new Date().toISOString() }
    }

    case "native.counter": {
      const { delta } = payload as { delta: number }
      counter += delta
      return { value: counter }
    }

    case "ui.alert": {
      const { title, message } = payload as { title: string; message: string }
      window.alert(`${title}\n\n${message}`)
      return { shown: true }
    }

    default:
      throw new Error(`Ação desconhecida: ${action satisfies never}`)
  }
}
