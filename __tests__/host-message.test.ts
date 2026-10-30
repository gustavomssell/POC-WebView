import {
  describeInvalid,
  extractOrigin,
  formatDetail,
  parseHostMessage,
} from "../src/bridge/host-message"
import { BRIDGE_PROTOCOL_VERSION } from "../shared/bridge"

const validRequest = {
  v: BRIDGE_PROTOCOL_VERSION,
  kind: "request",
  id: "req-1",
  action: "native.echo",
  payload: { message: "oi" },
}

describe("parseHostMessage", () => {
  it("aceita uma requisicao valida", () => {
    const result = parseHostMessage(JSON.stringify(validRequest))

    expect(result).toEqual({ ok: true, kind: "request", request: validRequest })
  })

  it("aceita um evento valido e preserva o payload", () => {
    const event = {
      v: BRIDGE_PROTOCOL_VERSION,
      kind: "event",
      event: "web.hello",
      payload: { screen: "390x844" },
    }

    const result = parseHostMessage(JSON.stringify(event))

    expect(result).toEqual({
      ok: true,
      kind: "event",
      event: "web.hello",
      payload: { screen: "390x844" },
    })
  })

  it("rejeita JSON invalido", () => {
    expect(parseHostMessage("nao eh json")).toEqual({
      ok: false,
      reason: "invalid-json",
    })
  })

  it("rejeita JSON que nao eh objeto", () => {
    expect(parseHostMessage("[1, 2, 3]")).toEqual({
      ok: false,
      reason: "not-an-object",
    })
    expect(parseHostMessage('"texto"')).toEqual({
      ok: false,
      reason: "not-an-object",
    })
    expect(parseHostMessage("null")).toEqual({
      ok: false,
      reason: "not-an-object",
    })
  })

  it("rejeita versao de protocolo diferente e guarda o valor", () => {
    const result = parseHostMessage(
      JSON.stringify({ ...validRequest, v: 99 }),
    )

    expect(result).toEqual({
      ok: false,
      reason: "protocol-mismatch",
      value: 99,
    })
  })

  it("rejeita versao ausente", () => {
    const { v: _v, ...semVersao } = validRequest

    expect(parseHostMessage(JSON.stringify(semVersao))).toEqual({
      ok: false,
      reason: "protocol-mismatch",
      value: undefined,
    })
  })

  it("rejeita evento sem nome", () => {
    const result = parseHostMessage(
      JSON.stringify({ v: BRIDGE_PROTOCOL_VERSION, kind: "event" }),
    )

    expect(result).toEqual({ ok: false, reason: "invalid-event" })
  })

  it("rejeita kind desconhecido e guarda o valor", () => {
    const result = parseHostMessage(
      JSON.stringify({ ...validRequest, kind: "command" }),
    )

    expect(result).toEqual({
      ok: false,
      reason: "invalid-kind",
      value: "command",
    })
  })

  it("rejeita acao fora da lista do protocolo", () => {
    const result = parseHostMessage(
      JSON.stringify({ ...validRequest, action: "camera.delete" }),
    )

    expect(result).toEqual({ ok: false, reason: "invalid-request" })
  })

  it("rejeita id que nao eh string", () => {
    const result = parseHostMessage(
      JSON.stringify({ ...validRequest, id: 42 }),
    )

    expect(result).toEqual({ ok: false, reason: "invalid-request" })
  })
})

describe("describeInvalid", () => {
  it("usa o raw truncado para falhas sem valor especifico", () => {
    const raw = "x".repeat(500)

    expect(
      describeInvalid({ ok: false, reason: "invalid-json" }, raw),
    ).toEqual({ label: "invalid json", detail: "x".repeat(200) })
  })

  it("usa o valor ofensivo quando existe", () => {
    expect(
      describeInvalid(
        { ok: false, reason: "protocol-mismatch", value: 7 },
        "qualquer",
      ),
    ).toEqual({ label: "protocol mismatch", detail: "7" })
  })

  it("mapeia todos os motivos para os rotulos do log nativo", () => {
    expect(
      describeInvalid({ ok: false, reason: "not-an-object" }, "[]").label,
    ).toBe("invalid message")

    expect(
      describeInvalid({ ok: false, reason: "invalid-event" }, "{}").label,
    ).toBe("invalid event")

    expect(
      describeInvalid({ ok: false, reason: "invalid-kind" }, "{}").label,
    ).toBe("invalid message kind")

    expect(
      describeInvalid({ ok: false, reason: "invalid-request" }, "{}").label,
    ).toBe("invalid request")
  })
})

describe("extractOrigin", () => {
  it("extrai a origem de URLs http e https", () => {
    expect(extractOrigin("http://10.0.2.2:5173/app?x=1")).toBe(
      "http://10.0.2.2:5173",
    )
    expect(extractOrigin("https://poc-webview.local/")).toBe(
      "https://poc-webview.local",
    )
  })

  it("trata esquemas com barras duplas", () => {
    expect(extractOrigin("myapp://algo")).toBe("myapp://algo")
  })

  it("devolve null para lixo", () => {
    expect(extractOrigin("nao eh url")).toBeNull()
  })
})

describe("formatDetail", () => {
  it("serializa objetos", () => {
    expect(formatDetail({ style: "light" })).toBe('{"style":"light"}')
  })

  it("devolve string vazia para undefined", () => {
    expect(formatDetail(undefined)).toBe("")
  })

  it("trunca strings longas (data URL de foto)", () => {
    const detail = formatDetail({ dataUrl: "a".repeat(400) })

    expect(detail).toContain("...")
    expect(detail.length).toBeLessThan(220)
  })

  it("sobrevive a valores circularares", () => {
    const circular: Record<string, unknown> = {}
    circular.self = circular

    expect(formatDetail(circular)).toContain("[object Object]")
  })
})
