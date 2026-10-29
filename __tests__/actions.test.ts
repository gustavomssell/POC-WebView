import { Alert } from "react-native"
import { createActionRunner } from "../src/bridge/actions"
import { BRIDGE_PROTOCOL_VERSION, type BridgeRequest } from "../shared/bridge"

// O jest-expo entrega stubs reais dos modulos Expo; para espiar as chamadas
// nativas, cada modulo recebe um mock explicito.
jest.mock("expo-clipboard", () => ({
  setStringAsync: jest.fn(),
  getStringAsync: jest.fn(),
}))

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: "ImpactFeedbackStyle.light",
    Medium: "ImpactFeedbackStyle.medium",
    Heavy: "ImpactFeedbackStyle.heavy",
  },
}))

jest.mock("expo-image-picker", () => ({
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
}))

jest.mock("expo-linking", () => ({
  canOpenURL: jest.fn(),
  openURL: jest.fn(),
}))

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  Accuracy: { Balanced: "balanced" },
}))

jest.mock("expo-device", () => ({
  osVersion: "17.2",
  modelName: "iPhone 15 Pro",
  deviceName: "iPhone da Marina",
}))

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: { expoConfig: { version: "1.0.0" } },
}))

const Clipboard = jest.requireMock("expo-clipboard") as {
  setStringAsync: jest.Mock
  getStringAsync: jest.Mock
}
const Haptics = jest.requireMock("expo-haptics") as {
  impactAsync: jest.Mock
  ImpactFeedbackStyle: Record<string, string>
}
const ImagePicker = jest.requireMock("expo-image-picker") as {
  requestCameraPermissionsAsync: jest.Mock
  launchCameraAsync: jest.Mock
}
const Linking = jest.requireMock("expo-linking") as {
  canOpenURL: jest.Mock
  openURL: jest.Mock
}
const Location = jest.requireMock("expo-location") as {
  requestForegroundPermissionsAsync: jest.Mock
  getCurrentPositionAsync: jest.Mock
}

function request<K extends BridgeRequest["action"]>(
  action: K,
  payload?: unknown,
): BridgeRequest {
  return {
    v: BRIDGE_PROTOCOL_VERSION,
    kind: "request",
    id: `req-${action}`,
    action,
    payload,
  } as BridgeRequest
}

function runner() {
  const onCounterChanged = jest.fn()
  return {
    onCounterChanged,
    runAction: createActionRunner({ onCounterChanged }),
  }
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe("acoes puras", () => {
  it("native.echo devolve a mensagem com timestamp", async () => {
    const { runAction } = runner()

    const result = (await runAction(
      request("native.echo", { message: "ola" }),
    )) as { message: string; echoedAt: string }

    expect(result.message).toBe("ola")
    expect(new Date(result.echoedAt).getTime()).not.toBeNaN()
  })

  it("clipboard.write devolve o tamanho do texto copiado", async () => {
    Clipboard.setStringAsync.mockResolvedValue(undefined)
    const { runAction } = runner()

    expect(await runAction(request("clipboard.write", { text: "resumo" }))).toEqual({
      length: 6,
    })
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith("resumo")
  })

  it("clipboard.read devolve o texto atual", async () => {
    Clipboard.getStringAsync.mockResolvedValue("colado")
    const { runAction } = runner()

    expect(await runAction(request("clipboard.read"))).toEqual({ text: "colado" })
  })

  it("haptics.impact mapeia o estilo para o feedback nativo", async () => {
    const { runAction } = runner()

    expect(await runAction(request("haptics.impact", { style: "light" }))).toEqual({
      style: "light",
    })
    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Light,
    )

    expect(await runAction(request("haptics.impact", { style: "medium" }))).toEqual({
      style: "medium",
    })
    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Medium,
    )

    expect(await runAction(request("haptics.impact", { style: "heavy" }))).toEqual({
      style: "heavy",
    })
    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Heavy,
    )
  })

  it("ui.alert mostra o alerta nativo", async () => {
    const spy = jest.spyOn(Alert, "alert")
    const { runAction } = runner()

    expect(
      await runAction(
        request("ui.alert", { title: "Conta", message: "Pagamento feito" }),
      ),
    ).toEqual({ shown: true })
    expect(spy).toHaveBeenCalledWith("Conta", "Pagamento feito")
    spy.mockRestore()
  })

  it("device.info devolve os dados do aparelho", async () => {
    const { runAction } = runner()

    const result = (await runAction(request("device.info"))) as Record<
      string,
      unknown
    >

    expect(result).toMatchObject({
      osVersion: "17.2",
      model: "iPhone 15 Pro",
      appVersion: "1.0.0",
    })
    expect(typeof result.platform).toBe("string")
    expect(result.screenWidth as number).toBeGreaterThan(0)
    expect(result.screenHeight as number).toBeGreaterThan(0)
  })
})

describe("native.counter", () => {
  it("acumula deltas e notifica cada mudanca", async () => {
    const { runAction, onCounterChanged } = runner()

    expect(await runAction(request("native.counter", { delta: 2 }))).toEqual({
      value: 2,
    })
    expect(await runAction(request("native.counter", { delta: 3 }))).toEqual({
      value: 5,
    })

    expect(onCounterChanged).toHaveBeenNthCalledWith(1, 2)
    expect(onCounterChanged).toHaveBeenNthCalledWith(2, 5)
  })

  it("aceita delta negativo", async () => {
    const { runAction, onCounterChanged } = runner()

    await runAction(request("native.counter", { delta: 5 }))
    expect(await runAction(request("native.counter", { delta: -2 }))).toEqual({
      value: 3,
    })
    expect(onCounterChanged).toHaveBeenLastCalledWith(3)
  })

  it("cada runner tem o seu proprio acumulador", async () => {
    const first = runner()
    const second = runner()

    await first.runAction(request("native.counter", { delta: 10 }))

    expect(
      await second.runAction(request("native.counter", { delta: 1 })),
    ).toEqual({ value: 1 })
  })
})

describe("link.open", () => {
  it("abre a URL quando o sistema suporta", async () => {
    Linking.canOpenURL.mockResolvedValue(true)
    const { runAction } = runner()

    expect(
      await runAction(request("link.open", { url: "https://expo.dev" })),
    ).toEqual({ opened: true })
    expect(Linking.canOpenURL).toHaveBeenCalledWith("https://expo.dev")
    expect(Linking.openURL).toHaveBeenCalledWith("https://expo.dev")
  })

  it("falha quando o sistema nao suporta a URL", async () => {
    Linking.canOpenURL.mockResolvedValue(false)
    const { runAction } = runner()

    await expect(
      runAction(request("link.open", { url: "app inexistente://x" })),
    ).rejects.toThrow("URL nao suportada: app inexistente://x")

    expect(Linking.openURL).not.toHaveBeenCalled()
  })
})

describe("permissoes nativas", () => {
  it("camera.takePhoto falha sem permissao", async () => {
    ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
      granted: false,
    })
    const { runAction } = runner()

    await expect(
      runAction(request("camera.takePhoto", { quality: 0.4 })),
    ).rejects.toThrow("Permissao de camera negada")

    expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled()
  })

  it("camera.takePhoto devolve null quando o usuario cancela", async () => {
    ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({ granted: true })
    ImagePicker.launchCameraAsync.mockResolvedValue({
      canceled: true,
      assets: null,
    })
    const { runAction } = runner()

    expect(await runAction(request("camera.takePhoto", {}))).toBeNull()
  })

  it("camera.takePhoto monta o PhotoResult com data URL", async () => {
    ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({ granted: true })
    ImagePicker.launchCameraAsync.mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: "file:///foto.jpg",
          width: 1200,
          height: 800,
          fileName: "foto.jpg",
          mimeType: "image/jpeg",
          fileSize: 4321,
          base64: "QUJD",
        },
      ],
    })
    const { runAction } = runner()

    expect(
      await runAction(request("camera.takePhoto", { quality: 0.7 })),
    ).toEqual({
      uri: "file:///foto.jpg",
      dataUrl: "data:image/jpeg;base64,QUJD",
      width: 1200,
      height: 800,
      fileName: "foto.jpg",
      mimeType: "image/jpeg",
      bytes: 4321,
    })
    expect(ImagePicker.launchCameraAsync).toHaveBeenCalledWith({
      mediaTypes: ["images"],
      quality: 0.7,
      base64: true,
    })
  })

  it("location.current falha sem permissao", async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValue({
      status: "denied",
      granted: false,
    })
    const { runAction } = runner()

    await expect(runAction(request("location.current"))).rejects.toThrow(
      "Permissao de localizacao negada",
    )

    expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled()
  })

  it("location.current devolve a posicao com mocked", async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValue({
      status: "granted",
      granted: true,
    })
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: {
        latitude: -23.5,
        longitude: -46.6,
        accuracy: 12,
        altitude: 760,
      },
      timestamp: 1_700_000_000_000,
      mocked: true,
    })
    const { runAction } = runner()

    expect(await runAction(request("location.current"))).toEqual({
      latitude: -23.5,
      longitude: -46.6,
      accuracy: 12,
      altitude: 760,
      timestamp: 1_700_000_000_000,
      mocked: true,
    })
  })
})
