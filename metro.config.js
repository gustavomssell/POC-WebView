const { getDefaultConfig } = require("expo/metro-config")
const path = require("path")

const projectRoot = __dirname
const config = getDefaultConfig(projectRoot)

const toPosix = (value) => value.replace(/\\/g, "/")
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const nestedWebFolders = ["node_modules", "dist", ".vite"].map((folder) => {
  const target = escape(toPosix(path.join(projectRoot, "web", folder))).replace(
    /\//g,
    "[\\\\/]",
  )
  return new RegExp(`${target}[\\\\/].*`)
})

config.resolver.blockList = nestedWebFolders

module.exports = config
