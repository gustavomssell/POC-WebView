import { useCallback, useEffect, useRef, useState } from "react"
import {
  BRIDGE_PROTOCOL_VERSION,
  type NativeEvent,
} from "@shared/bridge"
import { AccountOverview } from "@/components/account-overview"
import { AppNav, Brand, type AppTab } from "@/components/app-nav"
import { BridgeLog } from "@/components/bridge-log"
import { ToolsPage } from "@/components/tools-page"
import { Toaster } from "@/components/ui/sonner"
import {
  dispatchNativeMessage,
  isNativeWebView,
  sendEvent,
  subscribeTraffic,
  type TrafficEntry,
} from "@/lib/bridge"
import { cn } from "@/lib/utils"

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

export default function App() {
  const [entries, setEntries] = useState<TrafficEntry[]>([])
  const [tab, setTab] = useState<AppTab>("home")
  const sentReady = useRef(false)

  useEffect(() => {
    return subscribeTraffic((entry) => {
      setEntries((current) => [...current, entry].slice(-200))
    })
  }, [])

  useEffect(() => {
    if (!sentReady.current) {
      sentReady.current = true
      sendEvent("web.ready", {
        screen: `${window.innerWidth}x${window.innerHeight}`,
        userAgent: navigator.userAgent,
      })
    }

    if (isNativeWebView) {
      return
    }

    const timer = setTimeout(() => {
      const event: NativeEvent = {
        v: BRIDGE_PROTOCOL_VERSION,
        kind: "event",
        event: "native.ping",
        payload: {
          message: "Evento simulado porque não há WebView nativo.",
          sentAt: new Date().toISOString(),
        },
      }

      dispatchNativeMessage(event)
    }, 2200)

    return () => clearTimeout(timer)
  }, [])

  const switchTab = useCallback((next: AppTab) => {
    setTab(next)
    window.scrollTo({
      top: 0,
      behavior: reducedMotion() ? "auto" : "smooth",
    })
  }, [])

  const goToTool = useCallback((id: string) => {
    if (id === "tools") {
      switchTab("tools")
      return
    }

    setTab("tools")
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({
          behavior: reducedMotion() ? "auto" : "smooth",
          block: "start",
        })
      })
    })
  }, [switchTab])

  return (
    <div className="min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full max-w-[96rem]">
        <aside className="hidden w-[16.5rem] shrink-0 flex-col bg-ink px-5 py-7 lg:sticky lg:top-0 lg:flex lg:h-dvh">
          <Brand />
          <div className="mt-10">
            <AppNav active={tab} onChange={switchTab} variant="rail" />
          </div>

          <div className="mt-auto space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/4 p-3.5">
              <p className="font-mono text-[0.7rem] tracking-[0.14em] text-paper/45 uppercase">
                Estado
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs text-paper/75">
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    isNativeWebView ? "bg-ledger" : "bg-stamp",
                  )}
                />
                {isNativeWebView ? "Conectado ao aparelho" : "Prévia no navegador"}
              </div>
              <p className="mt-1.5 font-mono text-[0.7rem] text-paper/40">
                protocolo v{BRIDGE_PROTOCOL_VERSION}
              </p>
            </div>
            <p className="px-1 text-[0.7rem] leading-relaxed text-paper/35">
              Dados fictícios para demonstração do bridge nativo.
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 bg-ink px-4 sm:px-6 lg:hidden">
            <Brand compact />
            <StatusPill />
          </header>

          <main
            key={tab}
            className="page-enter mx-auto w-full max-w-[80rem] flex-1 px-4 pt-5 pb-8 sm:px-6 lg:px-10 lg:pt-9 lg:pb-12"
          >
            {tab === "home" ? (
              <AccountOverview
                entries={entries}
                onGoToTool={goToTool}
                onOpenActivity={() => switchTab("activity")}
              />
            ) : null}
            {tab === "tools" ? (
              <ToolsPage onOpenActivity={() => switchTab("activity")} />
            ) : null}
            {tab === "activity" ? (
              <BridgeLog entries={entries} onClear={() => setEntries([])} />
            ) : null}
          </main>

          <footer className="mx-auto flex w-full max-w-[80rem] flex-wrap items-center justify-between gap-2 border-t border-ink/8 px-4 py-5 pb-24 text-[0.7rem] text-muted-foreground sm:px-6 lg:px-10 lg:pb-6">
            <p>Dados fictícios para demonstração.</p>
            <p className="font-mono">
              postMessage + injectJavaScript · protocolo v
              {BRIDGE_PROTOCOL_VERSION}
            </p>
          </footer>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
        <AppNav active={tab} onChange={switchTab} variant="bottom" />
      </div>

      <Toaster
        theme="light"
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast: "font-sans",
            title: "font-heading font-semibold",
          },
        }}
      />
    </div>
  )
}

function StatusPill() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/6 px-2.5 py-1 font-mono text-[0.7rem] tracking-wide text-paper/70 uppercase">
      <span
        className={cn(
          "size-1.5 rounded-full",
          isNativeWebView ? "bg-ledger" : "bg-stamp",
        )}
      />
      {isNativeWebView ? "No app" : "Prévia web"}
    </span>
  )
}
