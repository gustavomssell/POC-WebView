import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const inputPath = path.join(root, "web", "dist", "index.html")
const outputPath = path.join(root, "src", "webview", "bundledHtml.ts")

const html = await readFile(inputPath, "utf8")

if (!html.includes("<html")) {
  throw new Error(`Build inesperado em ${inputPath}: HTML nao encontrado.`)
}

await mkdir(path.dirname(outputPath), { recursive: true })
await writeFile(
  outputPath,
  [
    "// AUTO-GERADO por scripts/embed-web.mjs. Nao edite manualmente.",
    "// Regenere com: npm run build:web",
    `export const bundledHtml = ${JSON.stringify(html)}`,
    "",
  ].join("\n"),
)

const sizeKb = (html.length / 1024).toFixed(1)
console.log(`HTML embutido (${sizeKb} KB) em src/webview/bundledHtml.ts`)
