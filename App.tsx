import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ComponentRef,
  type ComponentType,
  type Ref,
} from "react"
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { StatusBar } from "expo-status-bar"
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context"
import { WebView, type WebViewMessageEvent, type WebViewProps } from "react-native-webview"
import * as Clipboard from "expo-clipboard"
import Constants from "expo-constants"
import * as Device from "expo-device"
import * as Haptics from "expo-haptics"
import * as ImagePicker from "expo-image-picker"
import * as Linking from "expo-linking"
import * as Location from "expo-location"
import {
  BRIDGE_PROTOCOL_VERSION,
  isNativeAction,
  type BridgeRequest,
  type BridgeResponse,
  type DeviceInfo,
  type HapticStyle,
  type LocationResult,
  type NativeEvent,
  type NativeToWeb,
  type PhotoResult,
} from "./shared/bridge"
import { bundledHtml } from "./src/webview/bundledHtml"

type LogEntry = {
  id: string
  at: string
  direction: "in" | "out"
  label: string
  detail: string
}

type WebViewHandle = {
  injectJavaScript: (script: string) => void
  reload: () => void
}

const TypedWebView = WebView as unknown as ComponentType<
  WebViewProps & { ref?: Ref<WebViewHandle> }
>


const mono = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
})

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function extractOrigin(url: string) {
  return /^[A-Za-z][A-Za-z0-9+.-]*:(\/\/)?[^/]*/.exec(url)?.[0] ?? null
}

function formatDetail(value: unknown) {
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

function BridgeScreen() {
  const webViewRef = useRef<WebViewHandle>(null)
  const logScrollRef = useRef<ComponentRef<typeof ScrollView>>(null)
  const counterRef = useRef(0)

  const [logs, setLogs] = useState<LogEntry[]>([])
  const [counter, setCounter] = useState(0)
  const [webReady, setWebReady] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)

  const devUrl = process.env.EXPO_PUBLIC_WEBVIEW_URL?.trim() ?? ""
  const usingDevUrl = devUrl.length > 0
  const allowedOrigin = useMemo(() => {
    if (!usingDevUrl) {
      return "https://poc-webview.local"
    }

    return extractOrigin(devUrl)
  }, [devUrl, usingDevUrl])

  const source = useMemo(
    () =>
      usingDevUrl
        ? { uri: devUrl }
        : { html: bundledHtml, baseUrl: "https://poc-webview.local/" },
    [devUrl, usingDevUrl],
  )

  const addLog = useCallback(
    (direction: LogEntry["direction"], label: string, detail = "") => {
      const entry: LogEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        at: new Date().toISOString().slice(11, 23),
        direction,
        label,
        detail,
      }

      setLogs((current) => [...current, entry].slice(-120))
    },
    [],
  )

  const sendToWeb = useCallback(
    (message: NativeToWeb) => {
      const script = `window.__pocBridge && window.__pocBridge.dispatch(${JSON.stringify(
        message,
      )}); true;`

      webViewRef.current?.injectJavaScript(script)

      if (message.kind === "response") {
        addLog(
          "out",
          `response · ${message.ok ? "ok" : "erro"}`,
          formatDetail(message.ok ? message.data : message.error),
        )
        return
      }

      addLog("out", `event · ${message.event}`, formatDetail(message.payload))
    },
    [addLog],
  )

  const respond = useCallback(
    (id: string, ok: boolean, data?: unknown, error?: string) => {
      const message: BridgeResponse = {
        v: BRIDGE_PROTOCOL_VERSION,
        kind: "response",
        id,
        ok,
        data,
        error,
      }

      sendToWeb(message)
    },
    [sendToWeb],
  )

  const runAction = useCallback(
    async (request: BridgeRequest): Promise<unknown> => {
      switch (request.action) {
        case "device.info": {
          const { width, height } = Dimensions.get("window")
          const info: DeviceInfo = {
            platform: Platform.OS,
            osVersion: Device.osVersion ?? String(Platform.Version),
            model: Device.modelName ?? Device.deviceName ?? "desconhecido",
            appVersion: Constants.expoConfig?.version ?? "1.0.0",
            screenWidth: Math.round(width),
            screenHeight: Math.round(height),
          }

          return info
        }

        case "camera.takePhoto": {
          const permission = await ImagePicker.requestCameraPermissionsAsync()

          if (!permission.granted) {
            throw new Error("Permissao de camera negada")
          }

          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            quality: request.payload.quality ?? 0.4,
            base64: true,
          })

          if (result.canceled) {
            return null
          }

          const asset = result.assets[0]

          if (!asset) {
            throw new Error("Camera nao retornou uma imagem")
          }

          const photo: PhotoResult = {
            uri: asset.uri,
            dataUrl: asset.base64
              ? `data:${asset.mimeType ?? "image/jpeg"};base64,${asset.base64}`
              : null,
            width: asset.width,
            height: asset.height,
            fileName: asset.fileName ?? null,
            mimeType: asset.mimeType ?? null,
            bytes: asset.fileSize ?? null,
          }

          return photo
        }

        case "location.current": {
          const permission = await Location.requestForegroundPermissionsAsync()

          if (permission.status !== "granted") {
            throw new Error("Permissao de localizacao negada")
          }

          const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          })

          const location: LocationResult = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            timestamp: position.timestamp,
            mocked: position.mocked ?? false,
          }

          return location
        }

        case "haptics.impact": {
          const style: HapticStyle = request.payload.style
          const feedback: Record<HapticStyle, Haptics.ImpactFeedbackStyle> = {
            light: Haptics.ImpactFeedbackStyle.Light,
            medium: Haptics.ImpactFeedbackStyle.Medium,
            heavy: Haptics.ImpactFeedbackStyle.Heavy,
          }

          await Haptics.impactAsync(feedback[style])
          return { style }
        }

        case "clipboard.write": {
          await Clipboard.setStringAsync(request.payload.text)
          return { length: request.payload.text.length }
        }

        case "clipboard.read":
          return { text: await Clipboard.getStringAsync() }

        case "native.echo":
          return {
            message: request.payload.message,
            echoedAt: new Date().toISOString(),
          }

        case "native.counter": {
          counterRef.current += request.payload.delta
          const value = counterRef.current
          setCounter(value)

          const event: NativeEvent = {
            v: BRIDGE_PROTOCOL_VERSION,
            kind: "event",
            event: "native.counter.changed",
            payload: { value },
          }

          sendToWeb(event)
          return { value }
        }

        case "ui.alert": {
          Alert.alert(request.payload.title, request.payload.message)
          return { shown: true }
        }

        case "link.open": {
          const canOpen = await Linking.canOpenURL(request.payload.url)

          if (!canOpen) {
            throw new Error(`URL nao suportada: ${request.payload.url}`)
          }

          await Linking.openURL(request.payload.url)
          return { opened: true }
        }

        default: {
          const exhaustive: never = request
          throw new Error(`Acao desconhecida: ${String(exhaustive)}`)
        }
      }
    },
    [sendToWeb],
  )

  const handleMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      const raw = event.nativeEvent.data
      let parsed: unknown

      try {
        parsed = JSON.parse(raw)
      } catch {
        addLog("in", "invalid json", raw.slice(0, 200))
        return
      }

      if (!isRecord(parsed)) {
        addLog("in", "invalid message", raw.slice(0, 200))
        return
      }

      if (parsed.v !== BRIDGE_PROTOCOL_VERSION) {
        addLog("in", "protocol mismatch", String(parsed.v))
        return
      }

      if (parsed.kind === "event") {
        if (typeof parsed.event !== "string") {
          addLog("in", "invalid event", raw.slice(0, 200))
          return
        }

        addLog("in", `event · ${parsed.event}`, formatDetail(parsed.payload))

        if (parsed.event === "web.ready") {
          setWebReady(true)
        }

        return
      }

      if (parsed.kind !== "request") {
        addLog("in", "invalid message kind", String(parsed.kind))
        return
      }

      if (typeof parsed.id !== "string" || !isNativeAction(parsed.action)) {
        addLog("in", "invalid request", raw.slice(0, 200))
        return
      }

      const message = parsed as BridgeRequest

      setWebReady(true)
      addLog("in", `request · ${message.action}`, formatDetail(message.payload))

      try {
        const data = await runAction(message)
        respond(message.id, true, data)
      } catch (error) {
        respond(
          message.id,
          false,
          undefined,
          error instanceof Error ? error.message : "Erro nativo",
        )
      }
    },
    [addLog, respond, runAction],
  )

  const pingWeb = useCallback(() => {
    const event: NativeEvent = {
      v: BRIDGE_PROTOCOL_VERSION,
      kind: "event",
      event: "native.ping",
      payload: {
        message: "Ping disparado pelo React Native",
        sentAt: new Date().toISOString(),
      },
    }

    sendToWeb(event)
  }, [sendToWeb])

  const reloadWeb = useCallback(() => {
    setWebReady(false)
    addLog("out", "webview · reload", usingDevUrl ? devUrl : "bundle local")
    webViewRef.current?.reload()
  }, [addLog, devUrl, usingDevUrl])

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <TypedWebView
        ref={webViewRef}
        source={source}
        style={styles.webview}
        containerStyle={styles.webviewContainer}
        originWhitelist={allowedOrigin ? [allowedOrigin] : ["*"]}
        onShouldStartLoadWithRequest={({ url }) =>
          !allowedOrigin ||
          url === "about:blank" ||
          extractOrigin(url) === allowedOrigin
        }
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        allowsBackForwardNavigationGestures
        applicationNameForUserAgent="POCWebView/1.0"
        startInLoadingState
        onMessage={handleMessage}
        onLoadStart={() => addLog("out", "webview · loading")}
        onLoadEnd={() => addLog("out", "webview · loaded")}
        onError={({ nativeEvent }) =>
          addLog("out", "webview · error", nativeEvent.description)
        }
        onHttpError={({ nativeEvent }) =>
          addLog("out", "webview · http error", String(nativeEvent.statusCode))
        }
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator color="#fafafa" />
          </View>
        )}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Abrir log nativo"
        onPress={() => setPanelOpen(true)}
        style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
      >
        <View style={[styles.dot, webReady ? styles.dotOnline : styles.dotOffline]} />
        <Text style={styles.fabText}>native log</Text>
        <View style={styles.fabCount}>
          <Text style={styles.fabCountText}>{logs.length}</Text>
        </View>
      </Pressable>

      <Modal
        visible={panelOpen}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setPanelOpen(false)}
      >
        <View style={styles.backdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            accessibilityRole="button"
            accessibilityLabel="Fechar painel"
            onPress={() => setPanelOpen(false)}
          />
          <SafeAreaView edges={["bottom"]} style={styles.sheet}>
            <View style={styles.grabber} />

            <View style={styles.sheetHeader}>
              <View style={styles.sheetHeading}>
                <Text style={styles.sheetTitle}>Native bridge</Text>
                <Text style={styles.sheetSubtitle} numberOfLines={1}>
                  {usingDevUrl ? devUrl : "bundle local · offline"}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => setPanelOpen(false)}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
              >
                <Text style={styles.closeText}>Fechar</Text>
              </Pressable>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.chip}>
                <Text style={styles.chipText}>{Platform.OS}</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>
                  {webReady ? "web ready" : "aguardando web"}
                </Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>counter {counter}</Text>
              </View>
            </View>

            <View style={styles.actionsRow}>
              <Pressable
                accessibilityRole="button"
                disabled={!webReady}
                onPress={pingWeb}
                style={({ pressed }) => [
                  styles.actionButton,
                  !webReady && styles.disabled,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.actionText}>Ping web</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={reloadWeb}
                style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
              >
                <Text style={styles.actionText}>Reload</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => setLogs([])}
                style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
              >
                <Text style={styles.actionText}>Limpar</Text>
              </Pressable>
            </View>

            <ScrollView
              ref={logScrollRef}
              style={styles.logScroll}
              contentContainerStyle={styles.logContent}
              onContentSizeChange={() =>
                logScrollRef.current?.scrollToEnd({ animated: true })
              }
            >
              {logs.length === 0 ? (
                <Text style={styles.emptyLog}>Nenhuma mensagem ainda.</Text>
              ) : (
                logs.map((entry) => (
                  <View key={entry.id} style={styles.logRow}>
                    <Text style={styles.logTime}>{entry.at}</Text>
                    <Text
                      style={[
                        styles.logDirection,
                        entry.direction === "in" ? styles.dirIn : styles.dirOut,
                      ]}
                    >
                      {entry.direction === "in" ? "IN" : "OUT"}
                    </Text>
                    <View style={styles.logBody}>
                      <Text style={styles.logLabel}>{entry.label}</Text>
                      {entry.detail ? (
                        <Text style={styles.logDetail} numberOfLines={2}>
                          {entry.detail}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            <Text style={styles.hint}>
              Este log inclui eventos fire-and-forget que o web nao ve.
            </Text>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <BridgeScreen />
      <StatusBar style="light" />
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  webview: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  loading: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0a0a0a",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 12,
    paddingRight: 8,
    height: 40,
    borderRadius: 999,
    backgroundColor: "#fafafa",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  pressed: {
    opacity: 0.72,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
  },
  dotOnline: {
    backgroundColor: "#22c55e",
  },
  dotOffline: {
    backgroundColor: "#f59e0b",
  },
  fabText: {
    color: "#111111",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  fabCount: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111111",
  },
  fabCountText: {
    color: "#fafafa",
    fontSize: 11,
    fontFamily: mono,
  },
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  sheet: {
    maxHeight: "78%",
    backgroundColor: "#111113",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "#27272a",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  grabber: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#3f3f46",
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sheetHeading: {
    flex: 1,
  },
  sheetTitle: {
    color: "#fafafa",
    fontSize: 16,
    fontWeight: "600",
  },
  sheetSubtitle: {
    color: "#a1a1aa",
    fontSize: 12,
    fontFamily: mono,
    marginTop: 2,
  },
  closeButton: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 999,
    justifyContent: "center",
    backgroundColor: "#27272a",
  },
  closeText: {
    color: "#fafafa",
    fontSize: 12,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 12,
  },
  chip: {
    height: 24,
    paddingHorizontal: 10,
    borderRadius: 999,
    justifyContent: "center",
    backgroundColor: "#1c1c1f",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#3f3f46",
  },
  chipText: {
    color: "#d4d4d8",
    fontSize: 11,
    fontFamily: mono,
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: "center",
    backgroundColor: "#1c1c1f",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#3f3f46",
  },
  actionText: {
    color: "#fafafa",
    fontSize: 12,
    fontWeight: "500",
  },
  disabled: {
    opacity: 0.4,
  },
  logScroll: {
    flexShrink: 1,
    marginTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "#27272a",
  },
  logContent: {
    paddingVertical: 8,
    gap: 2,
  },
  emptyLog: {
    color: "#71717a",
    fontSize: 12,
    paddingVertical: 24,
    textAlign: "center",
  },
  logRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingVertical: 4,
  },
  logTime: {
    color: "#71717a",
    fontSize: 10,
    fontFamily: mono,
    lineHeight: 16,
  },
  logDirection: {
    fontSize: 9,
    fontFamily: mono,
    lineHeight: 16,
    width: 26,
  },
  dirIn: {
    color: "#4ade80",
  },
  dirOut: {
    color: "#60a5fa",
  },
  logBody: {
    flex: 1,
    minWidth: 0,
  },
  logLabel: {
    color: "#e4e4e7",
    fontSize: 12,
    fontFamily: mono,
    lineHeight: 16,
  },
  logDetail: {
    color: "#71717a",
    fontSize: 10,
    fontFamily: mono,
    lineHeight: 14,
  },
  hint: {
    color: "#71717a",
    fontSize: 11,
    paddingVertical: 12,
    textAlign: "center",
  },
})
