import {
  BRIDGE_ACTIONS,
  BRIDGE_PROTOCOL_VERSION,
  isNativeAction,
} from "../shared/bridge"

describe("protocolo v1", () => {
  it("expoe a versao 1", () => {
    expect(BRIDGE_PROTOCOL_VERSION).toBe(1)
  })

  it("lista as dez acoes do protocolo, sem duplicatas", () => {
    expect(BRIDGE_ACTIONS).toHaveLength(10)
    expect(new Set(BRIDGE_ACTIONS).size).toBe(10)
    expect(BRIDGE_ACTIONS).toEqual(
      expect.arrayContaining([
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
      ]),
    )
  })
})

describe("isNativeAction", () => {
  it("aceita as acoes conhecidas", () => {
    expect(isNativeAction("device.info")).toBe(true)
    expect(isNativeAction("link.open")).toBe(true)
  })

  it("rejeita acoes desconhecidas", () => {
    expect(isNativeAction("camera.delete")).toBe(false)
    expect(isNativeAction("")).toBe(false)
  })

  it("rejeita tipos que nao sao string", () => {
    expect(isNativeAction(undefined)).toBe(false)
    expect(isNativeAction(null)).toBe(false)
    expect(isNativeAction(42)).toBe(false)
    expect(isNativeAction({ action: "device.info" })).toBe(false)
  })
})
